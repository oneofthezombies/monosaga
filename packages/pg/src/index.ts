import type { MaybePromise } from '@monosaga/utils';
import { Pool, type PoolClient } from 'pg';

export { Pool, type PoolClient };

export async function transaction<T>(pool: Pool, fn: (tx: PoolClient) => MaybePromise<T>): Promise<T> {
  const tx = await pool.connect();
  try {
    await tx.query(/* sql */'BEGIN');
    const result = await fn(tx);
    await tx.query(/* sql */'COMMIT');
    return result;
  } catch (e) {
    await tx.query(/* sql */'ROLLBACK');
    throw e;
  } finally {
    tx.release();
  }
}
