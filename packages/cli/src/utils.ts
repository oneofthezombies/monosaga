import type { MaybePromise } from '@monosaga/core';
import type { Pool, PoolClient } from 'pg';

export type Migration = {
  name: string;
  up: (c: PoolClient) => MaybePromise<void>;
};

export async function transaction<T>(pool: Pool, fn: (tx: PoolClient) => MaybePromise<T>): Promise<T> {
  const tx = await pool.connect();
  try {
    await tx.query('BEGIN');
    const result = await fn(tx);
    await tx.query('COMMIT');
    return result;
  } catch (e) {
    await tx.query('ROLLBACK');
    throw e;
  } finally {
    tx.release();
  }
}
