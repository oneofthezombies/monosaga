import { pg, sql, transaction } from "@monosaga/pg-ex";
import type { MaybePromise } from "@monosaga/utils";
import "dotenv/config";
import { randomUUID } from "node:crypto";

export type SagaConfig = {
  name: string;
  steps: StepConfig[];
};

export type StepConfig =
  | {
      kind: "in-tx";
      onExecute: (c: OnExecuteInTxContext) => MaybePromise<StepOutput>;
      onCompensate: (c: OnCompensateInTxContext) => MaybePromise<StepOutput>;
    }
  | {
      kind: "out-of-tx";
      onExecute: (c: OnExecuteOutOfTxContext) => MaybePromise<StepOutput>;
      onCompensate: (c: OnCompensateOutOfTxContext) => MaybePromise<StepOutput>;
    };

export type OnExecuteInTxContext = {
  tx: pg.PoolClient;
  data: Record<string, unknown>;
  input: Record<string, unknown>;
};

export type OnCompensateInTxContext = {
  tx: pg.PoolClient;
  data: Record<string, unknown>;
  output: Record<string, unknown>;
};

export type OnExecuteOutOfTxContext = {
  data: Record<string, unknown>;
  input: Record<string, unknown>;
};

export type OnCompensateOutOfTxContext = {
  data: Record<string, unknown>;
  output: Record<string, unknown>;
};

export type StepOutput = Record<string, unknown>;

// test();

// export async function test() {
//   const saga: SagaConfig = {
//     name: "create-user",
//     steps: [
//       {
//         kind: "out-of-tx",
//         async onExecute(c) {
//           const emailEncrypted = Reflect.get(c.input, "emailEncrypted") as
//             | string
//             | undefined;
//           if (!emailEncrypted) throw new Error();
//           const passwordHash = Reflect.get(c.input, "passwordHash") as
//             | string
//             | undefined;
//           if (!passwordHash) throw new Error();
//           const idempotencyKey = Reflect.get(c.input, "idempotencyKey") as
//             | string
//             | undefined;
//           if (!idempotencyKey) throw new Error();
//           console.log(
//             "call paddle customers create api",
//             emailEncrypted,
//             idempotencyKey
//           );
//           const customer = { id: "<paddle-customer-id>" };
//           return {
//             emailEncrypted,
//             passwordHash,
//             paddleCustomerId: customer.id,
//           };
//         },
//         async onCompensate(c) {
//           const paddleCustomerId = Reflect.get(c.output, "paddleCustomerId") as
//             | string
//             | undefined;
//           if (!paddleCustomerId) throw new Error();
//           console.log("call paddle customers update api", paddleCustomerId);
//           return {};
//         },
//       },
//       {
//         kind: "in-tx",
//         async onExecute(c) {
//           const emailEncrypted = Reflect.get(c.input, "emailEncrypted") as
//             | string
//             | undefined;
//           if (!emailEncrypted) throw new Error();
//           const passwordHash = Reflect.get(c.input, "passwordHash") as
//             | string
//             | undefined;
//           if (!passwordHash) throw new Error();
//           const paddleCustomerId = Reflect.get(c.input, "paddleCustomerId") as
//             | string
//             | undefined;
//           if (!paddleCustomerId) throw new Error();
//           const emailHash = "";
//           const result = await c.tx.query<{ id: number }>(sql`
//             INSERT INTO users
//               (email_encrypted, email_hash, password_hash)
//             VALUES
//               (${emailEncrypted}, ${emailHash}, ${passwordHash});
//           `);
//           return { userId: result.rows[0]?.id };
//         },
//         async onCompensate(c) {
//           const userId = Reflect.get(c.output, "userId") as number | undefined;
//           if (!userId) throw Error();
//           await c.tx.query(sql`
//             DELETE FROM users WHERE id = ${userId};
//           `);
//           return {};
//         },
//       },
//     ],
//   };

//   const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"]! });
//   await transaction(pool, async (tx) => {
//     const uuid: string = randomUUID();
//     const idempotencyKey: string = randomUUID();
//     const result = await tx.query<{
//       id: string;
//       idempotency_key: string;
//       input: unknown;
//       output: unknown;
//       created_at: number;
//       updated_at: string;
//     }>(sql`
//       SELECT * FROM _monosaga_sagas WHERE idempotency_key = ${"a1acc725-46c8-411e-ab28-9b8781899331"}::uuid;
//     `);
//     const saga = result.rows.map(toCamel)[0];
//     console.log(saga);
//     await tx.query(sql`
//       INSERT INTO _monosaga_sagas
//         (id, idempotency_key, step_name)
//       VALUES
//         (${uuid}::uuid, ${idempotencyKey}::uuid, ${"test"});
//     `);
//   });
// }

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
      // const result = await tx.query<{
      //   id: string;
      //   idempotency_key: string;
      //   input: unknown;
      //   output: unknown;
      //   created_at: Date;
      //   updated_at: Date;
      // }>(sql`
      //   SELECT * FROM _monosaga_sagas WHERE idempotency_key = ${"a1acc725-46c8-411e-ab28-9b8781899331"}::uuid;
      // `);
      // console.log(result);
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
