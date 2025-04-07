import type { pg } from "@monosaga/pg-ex";
import type { MaybePromise } from "@monosaga/utils";

export type Migration = {
  name: string;
  up: (tx: pg.PoolClient) => MaybePromise<void>;
};
