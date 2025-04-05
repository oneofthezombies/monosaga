import type { TransactionSql } from '@monosaga/pg';
import type { Migration } from '../utils';

export default {
  name: '0001-init',
  up: async (sql: TransactionSql) => {

  },
} satisfies Migration;
