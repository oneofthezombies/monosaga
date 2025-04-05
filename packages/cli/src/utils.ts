import type { Sql } from '@monosaga/pg';
import type { MaybePromise } from '@monosaga/utils';

export type Migration = {
  name: string;
  up: (sql: Sql) => MaybePromise<void>;
};
