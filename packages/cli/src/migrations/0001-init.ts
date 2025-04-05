import type { PoolClient } from 'pg';
import type { Migration } from '../utils';

export default {
  name: '0001-init',
  up: async (tx: PoolClient) => {
    tx.query(/* sql */`
      
    `);
  },
} satisfies Migration;
