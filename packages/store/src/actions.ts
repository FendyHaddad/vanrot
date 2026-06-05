import { storeActionTypeSeparator } from "./constants.js";
import type {
  StoreAction,
  StoreActionCreator,
  StoreActionMetadata,
  StoreActionSet,
} from "./types.js";

const actionSetDefinitionBrand = Symbol("vanrot.actionSetDefinition");

export type ActionSetDefinition<
  Start extends object | void = void,
  Success extends object | void = void,
  ErrorPayload extends object | void = void,
> = {
  readonly [actionSetDefinitionBrand]: true;
  start<NextStart extends object | void = void>(): ActionSetDefinition<
    NextStart,
    Success,
    ErrorPayload
  >;
  success<NextSuccess extends object | void = void>(): ActionSetDefinition<
    Start,
    NextSuccess,
    ErrorPayload
  >;
  error<NextError extends object | void = void>(): ActionSetDefinition<
    Start,
    Success,
    NextError
  >;
};

export type DefinedActionSet<TDefinition> =
  TDefinition extends ActionSetDefinition<infer Start, infer Success, infer ErrorPayload>
    ? StoreActionSet<Start, Success, ErrorPayload>
    : never;

export type DefinedActions<
  TDefinitions extends Record<
    string,
    ActionSetDefinition<object | void, object | void, object | void>
  >,
> = {
  readonly [ActionName in keyof TDefinitions]: DefinedActionSet<
    TDefinitions[ActionName]
  >;
};

export function actionSet(): ActionSetDefinition<void, void, void> {
  return createActionSetDefinition();
}

export function defineActions<
  TDefinitions extends Record<
    string,
    ActionSetDefinition<object | void, object | void, object | void>
  >,
>(storeName: string, definitions: TDefinitions): DefinedActions<TDefinitions> {
  return Object.fromEntries(
    Object.keys(definitions).map((actionName) => [
      actionName,
      {
        start: createActionCreator(storeName, actionName, "start"),
        success: createActionCreator(storeName, actionName, "success"),
        error: createActionCreator(storeName, actionName, "error"),
      },
    ]),
  ) as DefinedActions<TDefinitions>;
}

function createActionSetDefinition<
  Start extends object | void,
  Success extends object | void,
  ErrorPayload extends object | void,
>(): ActionSetDefinition<Start, Success, ErrorPayload> {
  return {
    [actionSetDefinitionBrand]: true,
    start<NextStart extends object | void = void>() {
      return createActionSetDefinition<NextStart, Success, ErrorPayload>();
    },
    success<NextSuccess extends object | void = void>() {
      return createActionSetDefinition<Start, NextSuccess, ErrorPayload>();
    },
    error<NextError extends object | void = void>() {
      return createActionSetDefinition<Start, Success, NextError>();
    },
  };
}

function createActionCreator<Payload extends object | void>(
  storeName: string,
  actionName: string,
  phase: string,
): StoreActionCreator<Payload> {
  const metadata: StoreActionMetadata = {
    type: [storeName, actionName, phase].join(storeActionTypeSeparator),
    storeName,
    actionName,
    phase,
  };

  const creator = ((payload?: Payload) => {
    if (payload === undefined) {
      return { type: metadata.type } as StoreAction<Payload>;
    }

    return {
      type: metadata.type,
      ...(payload as object),
    } as StoreAction<Payload>;
  }) as StoreActionCreator<Payload>;

  return Object.assign(creator, metadata);
}
