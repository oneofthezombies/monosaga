import type { MaybePromise } from '@monosaga/utils';
import pg from 'pg';

export { pg };

export type Sql = <R extends pg.QueryResultRow = pg.QueryResultRow, I = unknown[]>(texts: TemplateStringsArray, ...values: pg.QueryConfigValues<I>) => Promise<pg.QueryResult<R>>;

function sqlQuery<I = unknown[]>(texts: TemplateStringsArray, ...values: pg.QueryConfigValues<I>): pg.QueryConfig<I> {
  return {
    text: texts.reduce((result, part, index) => `${result}$${index}${part}`),
    values,
  };
}

export class Pool extends pg.Pool {
  constructor(config?: pg.PoolConfig) {
    super(config);
  }

  async transaction<T>(fn: (sql: Sql) => MaybePromise<T>): Promise<T> {
    const tx = await this.connect();

    const sqlTx: Sql = async <R extends pg.QueryResultRow, I>(texts: TemplateStringsArray, ...values: pg.QueryConfigValues<I>): Promise<pg.QueryResult<R>> => {
      const config: pg.QueryConfig<I> = sqlQuery(texts, ...values);
      return await tx.query<R, I>(config);
    };

    try {
      await sqlTx`BEGIN`;
      const result = await fn(sqlTx);
      await sqlTx`COMMIT`;
      return result;
    } catch (e) {
      await sqlTx`ROLLBACK`;
      throw e;
    } finally {
      tx.release();
    }
  }
}
