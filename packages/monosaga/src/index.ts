// import { throws, type JsonValue } from "@monosaga/utils";

import type { JsonValue, Last } from "@monosaga/utils";

// type SagaRegistry = Record<string, Saga>;

// type MonoOptions = { registry?: SagaRegistry };

// function mono<RegistryT extends SagaRegistry = {}>(options?: MonoOptions) {
//   return {
//     saga: <NameT extends string, SagaT extends Saga>(
//       name: NameT,
//       saga: SagaT
//     ): ReturnType<
//       typeof mono<{
//         [P in keyof RegistryT | NameT]: P extends keyof RegistryT
//           ? RegistryT[P]
//           : SagaT;
//       }>
//     > => {
//       return;
//     },
//   };
// }

// const sagaMap = {
//   createUser: saga(),
// };

// type SagaOptions = {
//   registry?: SagaRegistry;
// };

// type SagaConfig = {
//   name: string;
//   options: SagaOptions;
//   steps: SagaStep[];
// };

// type ExStep = { kind: "ex-step"; name: string } & ExStepConfig;

// type SagaStep = TxStepSequence | ExStep;

// type Saga = { kind: "saga" };

// function defineSaga(
//   name: string,
//   options: SagaOptions,
//   ...steps: SagaStep[]
// ): Saga;
// function defineSaga(name: string, ...steps: SagaStep[]): Saga;
// function defineSaga(config: SagaConfig): Saga;
// function defineSaga(...args: unknown[]): Saga {
//   const nameOrConfig = args[0] ?? throws(new Error());
//   const isConfig = !!nameOrConfig && typeof nameOrConfig === "object";
//   if (isConfig) {
//     return defineSagaWithConfig(nameOrConfig as SagaConfig);
//   }

//   const name = nameOrConfig as string;
//   const optionsOrStep = args[1];
//   if (optionsOrStep) {
//     const isOptions =
//       typeof optionsOrStep === "object" && !("kind" in optionsOrStep);
//     if (isOptions) {
//       return defineSagaWithConfig({
//         name,
//         options: optionsOrStep as SagaOptions,
//         steps: args.slice(2) as SagaStep[],
//       });
//     } else {
//       return defineSagaWithConfig({
//         name,
//         options: { timeoutMs: 0 },
//         steps: args.slice(1) as SagaStep[],
//       });
//     }
//   }

//   throw new Error("Unexpected saga arguments.");
// }

// function defineSagaWithConfig(config: SagaConfig): Saga {
//   if (config.steps.length === 0) {
//     throw new Error("There must be at least one Saga step.");
//   }
//   return {
//     kind: "saga",
//     ...config,
//   };
// }

// type TxStep = {
//   kind: "tx-step";
//   name: string;
// } & TxStepConfig;

// function tx(...steps: TxStep[]): TxStepSequence {
//   return {
//     kind: "tx-step-sequence",
//     steps,
//   };
// }

// type TxStepSequence = {
//   kind: "tx-step-sequence";
//   steps: TxStep[];
// };

// type TxStepRunContext = { input: JsonValue };
// type TxStepCompensateContext = { output: JsonValue };

// type TxStepConfig = {
//   run: (c: TxStepRunContext) => JsonValue;
//   compensate?: (c: TxStepCompensateContext) => JsonValue;
// };

// function defineTxStep(name: string, config: TxStepConfig): TxStep {
//   return {
//     kind: "tx-step",
//     name,
//     ...config,
//   };
// }

// type ExStepRunContext = { input: JsonValue };
// type ExStepCompensateContext = { output: JsonValue };

// type ExStepConfig = {
//   run: (c: ExStepRunContext) => JsonValue;
//   compensate?: (c: ExStepContext) => JsonValue;
// };

// function defineExStep(name: string, config: ExStepConfig): ExStep {
//   return {
//     kind: "ex-step",
//     name,
//     ...config,
//   };
// }

// const createPaddleCustomer = defineExStep("createPaddleCustomer", {
//   run: () => console.log("Create a Paddle Customer."),
//   compensate: () => console.log("Delete the Paddle Customer."),
// });

// const createUser = defineTxStep("createUser", {
//   run: () => console.log("Create a user."),
//   compensate: () => console.log("Delete the user."),
// });

// const saga = defineSaga(
//   "createUser",
//   tx(validateEmail),
//   createPaddleCustomer,
//   tx(createUser)
// );
// console.log(saga);

// for (const step of saga.steps) {
//   if (step.kind === "tx-step-sequence") {
//     console.log("Begin db transaction.");
//     for (const txStep of step.steps) {
//       console.log(`TxStep ${txStep.name} started.`);
//       try {
//         txStep.run({ dummy: 0 });
//         console.log(`TxStep ${txStep.name} succeeded.`);
//       } catch (e) {
//         console.log(`TxStep ${txStep} failed.`, e);
//       }
//     }
//     console.log("Commit db transaction.");
//   } else {
//     console.log(`ExStep ${step.name} started.`);
//     try {
//       step.run({ dummy: 0 });
//       console.log(`ExStep ${step.name} succeeded.`);
//     } catch (e) {
//       console.log(`ExStep ${step.name} failed.`, e);
//     }
//   }
// }

// type Mono = {};

// function createMono(): Mono {}

// const mono = createMono()
//   .saga("createUser", tx(validateUser), createPaddleCustomer, tx(createUser))
//   .saga(/* ... */);

type Kind = string;
type Name = string;
type Input = JsonValue;
type Output = JsonValue;
type InError = JsonValue;
type OutError = JsonValue;

type StepRunContext<InputT extends Input = Input> = { input: InputT };

type StepRunFn<
  InputT extends Input = Input,
  OutputT extends Output = Output
> = (c: StepRunContext<InputT>) => OutputT;

type StepCompensateContext<
  OutputT extends Output = Output,
  InErrorT extends InError = InError
> = { output: OutputT; error: InErrorT };

type StepCompensateFn<
  OutputT extends Output = Output,
  InErrorT extends InError = InError,
  OutErrorT extends OutError = OutError
> = (c: StepCompensateContext<OutputT, InErrorT>) => OutErrorT;

type Step<
  KindT extends Kind,
  InputT extends Input,
  OutputT extends Output,
  InErrorT extends InError,
  OutErrorT extends OutError
> = {
  kind: KindT;
  name: string;
  run: StepRunFn<InputT, OutputT>;
  compensate?: StepCompensateFn<OutputT, InErrorT, OutErrorT>;
};

type StepConfig<
  InputT extends Input,
  OutputT extends Output,
  InErrorT extends InError,
  OutErrorT extends OutError
> = {
  run: StepRunFn<InputT, OutputT>;
  compensate?: StepCompensateFn<OutputT, InErrorT, OutErrorT>;
};

type TxStep<
  InputT extends Input = Input,
  OutputT extends Output = Output,
  InErrorT extends InError = InError,
  OutErrorT extends OutError = OutError
> = Step<"tx-step", InputT, OutputT, InErrorT, OutErrorT>;

type TxStepChain<
  TxStepsT extends readonly TxStep[],
  InputT extends Input,
  InErrorT extends InError
> = TxStepsT extends [infer HeadT, ...infer TailsT extends readonly TxStep[]]
  ? HeadT extends TxStep<
      infer HeadInputT,
      infer HeadOutputT,
      infer HeadInErrorT,
      infer HeadOutErrorT
    >
    ? HeadInputT extends InputT
      ? HeadInErrorT extends InErrorT
        ? [HeadT, ...TxStepChain<TailsT, HeadOutputT, HeadOutErrorT>]
        : never
      : never
    : never
  : [];

type TxStepsLastOutput<TxStepsT extends readonly TxStep[]> =
  Last<TxStepsT> extends TxStep<infer _, infer _, infer LastOutputT>
    ? LastOutputT
    : never;

type TxStepsLastOutError<TxStepsT extends readonly TxStep[]> =
  Last<TxStepsT> extends TxStep<infer _, infer _, infer _, infer LastOutErrorT>
    ? LastOutErrorT
    : never;

type TxStepSequence<
  TxStepsT extends readonly TxStep[],
  InputT extends Input,
  InErrorT extends InError
> = {
  kind: "tx-step-sequence";
  steps: TxStepChain<TxStepsT, InputT, InErrorT>;
};

type ExStep<
  InputT extends Input = Input,
  OutputT extends Output = Output,
  InErrorT extends InError = InError,
  OutErrorT extends OutError = OutError
> = Step<"ex-step", InputT, OutputT, InErrorT, OutErrorT>;

type SagaStep<
  InputT extends Input = Input,
  OutputT extends Output = Output,
  InErrorT extends InError = InError,
  OutErrorT extends OutError = OutError
> =
  | TxStepSequence<[], InputT, InErrorT>
  | ExStep<InputT, OutputT, InErrorT, OutErrorT>;

type SagaStepChain<
  SagaStepsT extends readonly SagaStep[],
  InputT extends Input,
  InErrorT extends InError
> = SagaStepsT extends [
  infer HeadT,
  ...infer TailsT extends readonly SagaStep[]
]
  ?
      | SagaStepChain_HeadExStep<HeadT, TailsT, InputT, InErrorT>
      | SagaStepChain_HeadTxStepSequence<HeadT, TailsT, InputT, InErrorT>
  : [];

type SagaStepChain_HeadTxStepSequence<
  HeadT,
  TailsT extends readonly SagaStep[],
  InputT extends Input,
  InErrorT extends InError
> = HeadT extends TxStepSequence<infer HeadTxStepsT, infer _, infer _>
  ? HeadTxStepsT extends TxStepChain<HeadTxStepsT, InputT, InErrorT>
    ? Last<HeadTxStepsT> extends TxStep<
        infer _,
        infer HeadLastOutputT,
        infer _,
        infer HeadLastOutErrorT
      >
      ? [HeadT, ...SagaStepChain<TailsT, HeadLastOutputT, HeadLastOutErrorT>]
      : never
    : never
  : never;

type SagaStepChain_HeadExStep<
  HeadT,
  TailsT extends readonly SagaStep[],
  InputT extends Input,
  InErrorT extends InError
> = HeadT extends ExStep<
  infer HeadInputT,
  infer HeadOutputT,
  infer HeadInErrorT,
  infer HeadOutErrorT
>
  ? HeadInputT extends InputT
    ? HeadInErrorT extends InErrorT
      ? [HeadT, ...SagaStepChain<TailsT, HeadOutputT, HeadOutErrorT>]
      : never
    : never
  : never;

type Saga<
  NameT extends Name,
  InputT extends Input,
  OutputT extends Output,
  InErrorT extends InError,
  SagaStepsT extends readonly SagaStep[]
> = {
  name: NameT;
  input: InputT;
  output: OutputT;
  error: InErrorT;
  steps: SagaStepChain<SagaStepsT, InputT, InErrorT>;
};

type SagaBuilder<
  NameT extends Name,
  InputT extends Input,
  OutputT extends Output,
  InErrorT extends InError,
  OutErrorT extends OutError,
  SagaStepsT extends readonly SagaStep[]
> = {
  tx: SagaBuilder_TxFn<NameT, InputT, OutputT, InErrorT, SagaStepsT>;
  step: SagaBuilder_StepFn<
    NameT,
    InputT,
    OutputT,
    InErrorT,
    OutErrorT,
    SagaStepsT
  >;
  build: () => Saga<NameT, InputT, OutputT, InErrorT, SagaStepsT>;
};

type SagaBuilder_TxFn<
  NameT extends Name,
  InputT extends Input,
  OutputT extends Output,
  InErrorT extends InError,
  SagaStepsT extends readonly SagaStep[]
> = <NewTxStepsT extends readonly TxStep[]>(
  build: SagaBuilder_TxFn_BuildFn<NewTxStepsT>
) => SagaBuilder<
  NameT,
  InputT,
  OutputT,
  TxStepsLastOutput<NewTxStepsT>,
  TxStepsLastOutError<NewTxStepsT>,
  [...SagaStepsT, TxStepSequence<NewTxStepsT, InputT, InErrorT>]
>;

type SagaBuilder_TxFn_BuildFn<NewTxStepsT extends readonly TxStep[]> = (
  step: SagaBuilder_TxFn_BuildFn_StepFn
) => NewTxStepsT;

type SagaBuilder_TxFn_BuildFn_StepFn = <
  InputT extends Input,
  OutputT extends Output,
  InErrorT extends InError,
  OutErrorT extends OutError
>(
  name: Name,
  config: StepConfig<InputT, OutputT, InErrorT, OutErrorT>
) => TxStep<InputT, OutputT, InErrorT, OutErrorT>;

type SagaBuilder_StepFn<
  NameT extends Name,
  InputT extends Input,
  OutputT extends Output,
  InErrorT extends InError,
  OutErrorT extends OutError,
  SagaStepsT extends readonly SagaStep[]
> = (
  name: Name,
  config: StepConfig<OutputT, Output, InErrorT, OutError>
) => SagaBuilder<
  NameT,
  InputT,
  Output,
  InErrorT,
  OutError,
  [...SagaStepsT, ExStep<OutputT, Output, InErrorT, OutError>]
>;

// === MonoBuilder ===
type MonoSagaMap = Record<Name, Saga<Name, Input, Output, InError, SagaStep[]>>;

type MonoBuilderSagaFn<SagaMap extends MonoSagaMap> = <
  NameT extends string,
  InputT extends JsonValue,
  NewSaga extends Saga<
    NameT,
    InputT,
    JsonValue,
    JsonValue,
    SagaStep<JsonValue, JsonValue, JsonValue, JsonValue>[]
  >
>(
  name: NameT extends keyof SagaMap ? never : NameT,
  build: SagaBuilderFn<NameT, InputT, NewSaga>
) => MonoBuilder<SagaMap & { [K in NameT]: NewSaga }>;

type MonoBuilder<SagaMap extends MonoSagaMap> = {
  saga: MonoBuilderSagaFn<SagaMap>;
  build: () => MonoBuildResult<SagaMap>;
};

type SagaBuilderFn<
  NameT extends string,
  InputT extends JsonValue,
  NewSaga extends Saga<NameT, InputT, JsonValue, JsonValue, SagaStep[]>
> = (
  s: SagaBuilder<NameT, InputT, InputT, JsonValue, JsonValue, []>
) => NewSaga;

type MonoBuildResult<SagaMap extends MonoSagaMap> = {
  sagaMap: SagaMap;
  get: <NameT extends keyof SagaMap>(name: NameT) => SagaMap[NameT];
};

type DefineMono = () => MonoBuilder<{}>;

const defineMono: DefineMono = () => {
  throw new Error();
};

const a = defineMono().saga("createUser", (s) =>
  s
    .tx((step) => [
      step("a", {
        run: (c) => {
          return {
            a: 1,
          };
        },
      }),
    ])
    .step("b", {
      run: (c) => {
        const input = c.input;
        return {
          b: 1,
        };
      },
      compensate: (c) => {
        const output = c.output;
        const error = c.error;
        return {
          c: 1,
        };
      },
    })
    .build()
);
