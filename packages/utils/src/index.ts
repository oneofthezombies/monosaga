export type MaybePromise<T> = Promise<T> | T;

export function throws(error: unknown): never {
  throw error;
}
