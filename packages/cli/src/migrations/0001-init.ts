import type { TransactionSql } from '@monosaga/pg';
import type { Migration } from '../utils';

export default {
  name: '0001-init',
  up: async (sql: TransactionSql) => {
    await sql`
      CREATE TYPE _monosaga_task_status AS ENUM (
        'pending',
        'processing',
        'succeeded',
        'failed',
        'permanently_failed'
      );
    `;
    await sql`
      CREATE TABLE _monosaga_tasks (
        id uuid 
      );
    `;
  },
} satisfies Migration;
