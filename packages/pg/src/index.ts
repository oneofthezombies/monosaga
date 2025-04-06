import type { MaybePromise } from '@monosaga/utils';
import { sql } from '@ts-safeql/sql-tag';
import pg from 'pg';

export { pg };

export class Pool extends pg.Pool {
  constructor(config?: pg.PoolConfig) {
    super(config);
  }

  async transaction<T>(fn: (tx: pg.PoolClient) => MaybePromise<T>): Promise<T> {
    const tx = await this.connect();
    try {
      await tx.query(sql`BEGIN`);
      const result = await fn(tx);
      await tx.query(sql`COMMIT`);
      return result;
    } catch (e) {
      await tx.query(sql`ROLLBACK`);
      throw e;
    } finally {
      tx.release();
    }
  }
}
