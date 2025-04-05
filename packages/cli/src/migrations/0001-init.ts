import type { TransactionSql } from '@monosaga/pg';
import type { Migration } from '../utils';

export default {
  name: '0001-init',
  up: async (sql: TransactionSql) => {
    await sql`
      CREATE TYPE _monosaga_saga_status AS ENUM (
        'pending',
        'processing',
        'succeeded',
        'failed',
        'permanently_failed'
      );
    `;
    await sql`
      CREATE TABLE _monosaga_sagas (
        id uuid PRIMARY KEY,
        idempotency_key uuid NOT NULL UNIQUE,
        input jsonb NOT NULL DEFAULT '{}'::jsonb,
        output jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `;
  },
} satisfies Migration;
