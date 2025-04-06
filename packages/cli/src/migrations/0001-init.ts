import { sql } from '@ts-safeql/sql-tag';
import type { Migration } from '../utils';

export default {
  name: '0001-init',
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
        input jsonb NOT NULL DEFAULT '{}'::jsonb,
        output jsonb NOT NULL DEFAULT '{}'::jsonb,
        step_index integer NOT NULL DEFAULT 0,
        step_name text NOT NULL,
        timeout_ms integer NOT NULL DEFAULT 5000,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  },
} satisfies Migration;
