import type { TransactionSql } from '@monosaga/pg';
import type { MaybePromise } from '@monosaga/utils';

export type Migration = {
  name: string;
  up: (sql: TransactionSql) => MaybePromise<void>;
};
