import type { MaybePromise } from '@monosaga/utils';
import pg from 'pg';

export { pg };

function sqlQuery<I = unknown[]>(texts: TemplateStringsArray, ...values: pg.QueryConfigValues<I>): pg.QueryConfig<I> {
  return {
    text: texts.reduce((result, part, index) => `${result}$${index}${part}`),
    values,
  };
}

export type TransactionSql = <R extends pg.QueryResultRow = pg.QueryResultRow, I = unknown[]>(texts: TemplateStringsArray, ...values: pg.QueryConfigValues<I>) => Promise<pg.QueryResult<R>>;

export class Pool extends pg.Pool {
  constructor(config?: pg.PoolConfig) {
    super(config);
  }

  async transaction<T>(fn: (sql: TransactionSql) => MaybePromise<T>): Promise<T> {
    const tx = await this.connect();

    const sql: TransactionSql = async <R extends pg.QueryResultRow, I>(texts: TemplateStringsArray, ...values: pg.QueryConfigValues<I>): Promise<pg.QueryResult<R>> => {
      const config: pg.QueryConfig<I> = sqlQuery(texts, ...values);
      return await tx.query<R, I>(config);
    };

    try {
      await sql`BEGIN`;
      const result = await fn(sql);
      await sql`COMMIT`;
      return result;
    } catch (e) {
      await sql`ROLLBACK`;
      throw e;
    } finally {
      tx.release();
    }
  }
}
