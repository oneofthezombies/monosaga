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
  timeoutMs: number;
};

type SagaConfig = {
  name: string;
  options: SagaOptions;
  steps: SagaStep[];
};

type ExStep = { kind: "ex-step"; name: string } & ExStepConfig;

type SagaStep = TxStepSequence | ExStep;

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
  const isConfig = !!nameOrConfig && typeof nameOrConfig === "object";
  if (isConfig) {
    return defineSagaWithConfig(nameOrConfig as SagaConfig);
  }

  const name = nameOrConfig as string;
  const optionsOrStep = args[1];
  if (optionsOrStep) {
    const isOptions =
      typeof optionsOrStep === "object" && !("kind" in optionsOrStep);
    if (isOptions) {
      return defineSagaWithConfig({
        name,
        options: optionsOrStep as SagaOptions,
        steps: args.slice(2) as SagaStep[],
      });
    } else {
      return defineSagaWithConfig({
        name,
        options: { timeoutMs: 0 },
        steps: args.slice(1) as SagaStep[],
      });
    }
  }

  throw new Error("Unexpected saga arguments.");
}

function defineSagaWithConfig(config: SagaConfig): Saga {
  if (config.steps.length === 0) {
    throw new Error("There must be at least one Saga step.");
  }
  return {
    kind: "saga",
    ...config,
  };
}

type TxStep = {
  kind: "tx-step";
  name: string;
} & TxStepConfig;

function tx(...steps: TxStep[]): TxStepSequence {
  return {
    kind: "tx-step-sequence",
    steps,
  };
}

type TxStepSequence = {
  kind: "tx-step-sequence";
  steps: TxStep[];
};

type TxStepContext = { dummy: number };

type TxStepConfig = {
  run: (c: TxStepContext) => void;
  compensate?: (c: TxStepContext) => void;
};

function defineTxStep(name: string, config: TxStepConfig): TxStep {
  return {
    kind: "tx-step",
    name,
    ...config,
  };
}

type ExStepContext = { dummy: number };

type ExStepConfig = {
  run: (c: ExStepContext) => void;
  compensate?: (c: ExStepContext) => void;
};

function defineExStep(name: string, config: ExStepConfig): ExStep {
  return {
    kind: "ex-step",
    name,
    ...config,
  };
}

const validateEmail = defineTxStep("validateEmail", {
  run: () => console.log("Validate the email."),
});

const createPaddleCustomer = defineExStep("createPaddleCustomer", {
  run: () => console.log("Create a Paddle Customer."),
  compensate: () => console.log("Delete the Paddle Customer."),
});

const createUser = defineTxStep("createUser", {
  run: () => console.log("Create a user."),
  compensate: () => console.log("Delete the user."),
});

const saga = defineSaga(
  "createUser",
  tx(validateEmail),
  createPaddleCustomer,
  tx(createUser)
);
console.log(saga);

for (const step of saga.steps) {
  if (step.kind === "tx-step-sequence") {
    console.log("Begin db transaction.");
    for (const txStep of step.steps) {
      console.log(`TxStep ${txStep.name} started.`);
      try {
        txStep.run({ dummy: 0 });
        console.log(`TxStep ${txStep.name} succeeded.`);
      } catch (e) {
        console.log(`TxStep ${txStep} failed.`, e);
      }
    }
    console.log("Commit db transaction.");
  } else {
    console.log(`ExStep ${step.name} started.`);
    try {
      step.run({ dummy: 0 });
      console.log(`ExStep ${step.name} succeeded.`);
    } catch (e) {
      console.log(`ExStep ${step.name} failed.`, e);
    }
  }
}
