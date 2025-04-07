import { sql } from "@monosaga/pg-ex";
import type { Migration } from "../utils";

export default {
  name: "0001-init",
  up: async (tx) => {
    await tx.query(sql`
      CREATE TYPE _monosaga_saga_status AS ENUM (
        'pending',
        'processing',
        'waiting_event',
        'succeeded',
        'failed',
        'permanently_failed'
      );
    `);
    await tx.query(sql`
      CREATE TABLE _monosaga_sagas (
        id uuid PRIMARY KEY,
        idempotency_key uuid NOT NULL UNIQUE,
        input jsonb NOT NULL DEFAULT 'null'::jsonb,
        output jsonb NOT NULL DEFAULT 'null'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    await tx.query(sql`
      CREATE TYPE _monosaga_step_status AS ENUM (
        'pending',
        'processing',
        'waiting_event',
        'succeeded',
        'failed',
        'permanently_failed'
      );
    `);
    await tx.query(sql`
      CREATE TABLE _monosaga_steps (
        id serial PRIMARY KEY,
        saga_id uuid NOT NULL,
        step_index integer NOT NULL,
        input jsonb NOT NULL DEFAULT '{}'::jsonb,
        output jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        
        FOREIGN KEY (saga_id) REFERENCES _monosaga_sagas(id)
      );
    `);
  },
} satisfies Migration;
