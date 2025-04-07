import type { MaybePromise } from "@monosaga/utils";
import { sql } from "@ts-safeql/sql-tag";
import camelcaseKeys, {
  type Options as CamelcaseKeysOptions,
} from "camelcase-keys";
import pg from "pg";

export { camelcaseKeys, pg, sql, type CamelcaseKeysOptions };

export function camel<
  T extends Record<string, unknown> | ReadonlyArray<Record<string, unknown>>
>(
  input: Parameters<typeof camelcaseKeys<T>>[0]
): ReturnType<typeof camelcaseKeys<T>> {
  return camelcaseKeys<T>(input, { deep: true });
}

export async function transaction<T>(
  pool: pg.Pool,
  fn: (tx: pg.PoolClient) => MaybePromise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(sql`BEGIN`);
    const result = await fn(client);
    await client.query(sql`COMMIT`);
    return result;
  } catch (e) {
    await client.query(sql`ROLLBACK`);
    throw e;
  } finally {
    client.release();
  }
}
