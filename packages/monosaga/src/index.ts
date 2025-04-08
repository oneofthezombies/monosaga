import { pg, sql, transaction } from "@monosaga/pg-ex";
import type { MaybePromise } from "@monosaga/utils";
import "dotenv/config";
import { randomUUID } from "node:crypto";

export class SagaService {
  #db: pg.Pool;

  constructor(args: { db: pg.Pool }) {
    this.#db = args.db;
  }

  async createSaga(args: {
    idempotencyKey: string;
    input: unknown;
  }): Promise<{ id: string }> {
    const { idempotencyKey, input } = args;
    await transaction(this.#db, async (tx) => {
      // {
      //   const result = await tx.query<{ id: string }>(sql`
      //     SELECT id FROM _monosaga_sagas WHERE idempotency_key = ${idempotencyKey}::uuid;
      //   `);
      //   if (result.rows.length > 0) {
      //     throw new Error(
      //       `Saga already exists. idempotencyKey: ${idempotencyKey}`
      //     );
      //   }
      // }
      const sagaId: string = randomUUID();
      {
        const result = await tx.query<{
          id: string;
          idempotency_key: string;
          input: unknown;
          output: unknown;
          created_at: Date;
          updated_at: Date;
        }>(sql`
          INSERT INTO _monosaga_sagas
            (id, idempotency_key, input)
          VALUES
            (${sagaId}::uuid, ${idempotencyKey}::uuid, ${input}::jsonb)
          RETURNING *;
        `);
        console.log(result);
      }
      const result = await tx.query<{
        id: string;
        idempotency_key: string;
        input: unknown;
        output: unknown;
        created_at: Date;
        updated_at: Date;
      }>(sql`
        SELECT * FROM _monosaga_sagas WHERE idempotency_key = ${"a1acc725-46c8-411e-ab28-9b8781899331"}::uuid;
      `);
      console.log(result);
    });
    return { id: "" };
  }
}

// async function getSaga(args: { sagaId: string }): Promise<
//   | { status: "pending" }
//   | { status: "processing" }
//   | {
//       status: "succeeded";
//       output: Record<string, unknown>;
//     }
//   | { status: "failed"; error: Record<string, unknown> }
// > {
//   throw new Error();
// }

// type SagaDefinition = {
//   name: string;
// };

// class SagaDefinitionRegistry {
//   #data = new Map<string, SagaDefinition>();

//   add(definition: SagaDefinition) {
//     if (this.#data.has(definition.name)) {
//       throw new Error(
//         `Saga definition already exists. name: ${definition.name}`
//       );
//     }
//     this.#data.set(definition.name, definition);
//   }

//   get(name: string): SagaDefinition {
//     const definition = this.#data.get(name);
//     if (!definition) {
//       throw new Error(`Saga definition does not exist. name: ${name}`);
//     }
//     return definition;
//   }
// }

type SagaOptions = {
  a: number;
};

type SagaConfig = {
  name: string;
  options: SagaOptions;
  steps: SagaStep[];
};

type Activity = { kind: "activity" };

type SagaStep = TxActivities | Activity;

type Saga = { kind: "saga" } & SagaConfig;

function defineSaga(
  name: string,
  options: SagaOptions,
  ...steps: SagaStep[]
): Saga;
function defineSaga(name: string, ...steps: SagaStep[]): Saga;
function defineSaga(config: SagaConfig): Saga;
function defineSaga(...args: unknown[]): Saga {
  const nameOrConfig = args[0];
  if (nameOrConfig) {
    if (typeof nameOrConfig === "object") {
      const config = nameOrConfig as SagaConfig;
      return {
        ...config,
        kind: "saga",
      };
    } else if (typeof nameOrConfig === "string") {
      const name = nameOrConfig as string;
      const optionsOrSteps = args[1];
      if (optionsOrSteps) {
        if (typeof optionsOrSteps === "object") {
          const steps = args[2];
          if (Array.isArray(steps)) {
            return {
              kind: "saga",
              name,
              options: optionsOrSteps as SagaOptions,
              steps: steps as SagaStep[],
            };
          } else {
            throw new Error();
          }
        } else if (Array.isArray(optionsOrSteps)) {
          return {
            kind: "saga",
            name,
            options: { a: 1 },
            steps: optionsOrSteps as SagaStep[],
          };
        } else {
          throw new Error();
        }
      } else {
        throw new Error();
      }
    } else {
      throw new Error();
    }
  } else {
    throw new Error();
  }
}

type TxActivity = {
  kind: "tx-activity";
};

function tx(...steps: TxActivity[]): TxActivities {
  throw new Error(`${steps}`);
}

type TxActivities = { kind: "tx-activities" };

function defineTxActivity(
  name: string,
  config: { run: () => void; compensate: () => void }
): TxActivity {
  throw new Error(`${name}${config}`);
}

function defineActivity(
  name: string,
  config: { run: () => void; compensate: () => void }
): Activity {
  throw new Error(`${name}${config}`);
}

const validateEmail = defineTxActivity("validateEmail", {
  run: () => {},
  compensate: () => {},
});

const createPaddleCustomer = defineActivity("createPaddleCustomer", {
  run: () => {},
  compensate: () => {},
});

const createUser = defineTxActivity("createUser", {
  run: () => {},
  compensate: () => {},
});

const a = defineSaga(
  "createUser",
  tx(validateEmail),
  createPaddleCustomer,
  tx(createUser)
);
console.log(a);
