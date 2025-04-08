export type MaybePromise<T> = Promise<T> | T;

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonArray
  | JsonObject;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export type Last<T extends readonly unknown[]> = T extends [
  ...unknown[],
  infer L
]
  ? L
  : never;

export function throws(error: unknown): never {
  throw error;
}
