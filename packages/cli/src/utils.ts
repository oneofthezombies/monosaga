import type { PoolClient } from '@monosaga/pg';
import type { MaybePromise } from '@monosaga/utils';

export type Migration = {
  name: string;
  up: (c: PoolClient) => MaybePromise<void>;
};
