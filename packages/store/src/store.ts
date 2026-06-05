import { computed } from "@vanrot/runtime";

import type {
  AnyStoreSelector,
  StoreAction,
  StoreActionSet,
  StoreEffect,
  StoreReducer,
  StoreState,
} from "./types.js";

export type StoreDefinition<
  TState extends object,
  TActions extends Record<string, StoreActionSet<any, any, any>>,
  TSelectors extends Record<string, AnyStoreSelector<TState>>,
  TEffects extends Record<string, StoreEffect<any>>,
> = {
  readonly name: string;
  readonly state: StoreState<TState>;
  readonly actions: TActions;
  readonly selectors: TSelectors;
  readonly reducer: StoreReducer<TState>;
  readonly effects: TEffects;
};

export type StoreActionFacade<
  TActions extends Record<string, StoreActionSet<any, any, any>>,
> = {
  readonly [ActionName in keyof TActions]: {
    readonly start: Parameters<TActions[ActionName]["start"]> extends []
      ? () => void
      : (payload: Parameters<TActions[ActionName]["start"]>[0]) => void;
    readonly success: Parameters<TActions[ActionName]["success"]> extends []
      ? () => void
      : (payload: Parameters<TActions[ActionName]["success"]>[0]) => void;
    readonly error: Parameters<TActions[ActionName]["error"]> extends []
      ? () => void
      : (payload: Parameters<TActions[ActionName]["error"]>[0]) => void;
  };
};

export type StoreSelectFacade<
  TState extends object,
  TSelectors extends Record<string, AnyStoreSelector<TState>>,
> = {
  readonly [SelectorName in keyof TSelectors]: TSelectors[SelectorName]["read"] extends (
    state: TState,
  ) => infer TResult
    ? () => () => TResult
    : TSelectors[SelectorName]["read"] extends (
          state: TState,
          input: infer TInput,
        ) => infer TResult
      ? (input: TInput) => () => TResult
      : never;
};

export type StoreInstance<
  TState extends object,
  TActions extends Record<string, StoreActionSet<any, any, any>>,
  TSelectors extends Record<string, AnyStoreSelector<TState>>,
  TEffects extends Record<string, StoreEffect<any>>,
> = {
  readonly name: string;
  readonly state: StoreState<TState>;
  readonly action: StoreActionFacade<TActions>;
  readonly select: StoreSelectFacade<TState, TSelectors>;
  readonly dispatch: (action: StoreAction<any>) => void;
  readonly effects: TEffects;
};

const defaultEffectRunKey = Symbol();
const storeEffectAbortedMessage = "Store effect aborted";

type StoreEffectContext = {
  readonly action: StoreAction<any>;
  readonly dispatch: (action: StoreAction<any>) => void;
  readonly signal: AbortSignal;
  readonly state: Record<string, unknown>;
};

type EffectRunKey = string | typeof defaultEffectRunKey;
type ActiveEffectControllers = Map<
  StoreEffect<any>,
  Map<EffectRunKey, Set<AbortController>>
>;

export function defineStore<
  TState extends object,
  TActions extends Record<string, StoreActionSet<any, any, any>>,
  TSelectors extends Record<string, AnyStoreSelector<TState>>,
  TEffects extends Record<string, StoreEffect<any>>,
>(
  definition: StoreDefinition<TState, TActions, TSelectors, TEffects>,
): StoreDefinition<TState, TActions, TSelectors, TEffects> {
  return definition;
}

export function useStore<
  TState extends object,
  TActions extends Record<string, StoreActionSet<any, any, any>>,
  TSelectors extends Record<string, AnyStoreSelector<TState>>,
  TEffects extends Record<string, StoreEffect<any>>,
>(
  definition: StoreDefinition<TState, TActions, TSelectors, TEffects>,
): StoreInstance<TState, TActions, TSelectors, TEffects> {
  const activeEffects: ActiveEffectControllers = new Map();

  const dispatch = (action: StoreAction<any>) => {
    const previousState = definition.state.current();

    definition.state.set(
      definition.reducer.reduce(previousState, action),
    );

    cancelMatchingEffects(definition.effects, activeEffects, action);

    void runEffects(
      definition,
      dispatch,
      action,
      previousState,
      activeEffects,
    );
  };

  return {
    name: definition.name,
    state: definition.state,
    action: bindActions(definition.actions, dispatch),
    select: bindSelectors(definition.state, definition.selectors),
    dispatch,
    effects: definition.effects,
  };
}

function bindActions<
  TActions extends Record<string, StoreActionSet<any, any, any>>,
>(
  actions: TActions,
  dispatch: (action: StoreAction<any>) => void,
): StoreActionFacade<TActions> {
  return Object.fromEntries(
    Object.entries(actions).map(([actionName, actionGroup]) => [
      actionName,
      {
        start(payload?: object) {
          dispatch(actionGroup.start(payload as never));
        },
        success(payload?: object) {
          dispatch(actionGroup.success(payload as never));
        },
        error(payload?: object) {
          dispatch(actionGroup.error(payload as never));
        },
      },
    ]),
  ) as StoreActionFacade<TActions>;
}

function bindSelectors<
  TState extends object,
  TSelectors extends Record<string, AnyStoreSelector<TState>>,
>(
  state: StoreState<TState>,
  selectors: TSelectors,
): StoreSelectFacade<TState, TSelectors> {
  return Object.fromEntries(
    Object.entries(selectors).map(([selectorName, selector]) => {
      const readSelector = selector.read as (
        state: TState,
        input?: unknown,
      ) => unknown;

      return [
        selectorName,
        (input?: unknown) =>
          computed(() =>
            readSelector(state.current(), resolveSelectorInput(input)),
          ),
      ];
    }),
  ) as StoreSelectFacade<TState, TSelectors>;
}

function resolveSelectorInput(input: unknown): unknown {
  if (typeof input === "function") {
    return (input as () => unknown)();
  }

  return input;
}

async function runEffects<TState extends object>(
  definition: StoreDefinition<
    TState,
    Record<string, StoreActionSet<any, any, any>>,
    Record<string, AnyStoreSelector<TState>>,
    Record<string, StoreEffect<any>>
  >,
  dispatch: (action: StoreAction<any>) => void,
  action: StoreAction<any>,
  previousState: TState,
  activeEffects: ActiveEffectControllers,
): Promise<void> {
  const matchingEffects = Object.values(definition.effects).filter(
    (effectDefinition) => effectDefinition.trigger.type === action.type,
  );

  for (const effectDefinition of matchingEffects) {
    const controller = new AbortController();
    const context: StoreEffectContext = {
      action,
      dispatch,
      signal: controller.signal,
      state: previousState as Record<string, unknown>,
    };

    if (effectDefinition.policies.skipWhen?.(context)) {
      continue;
    }

    const runKey = effectDefinition.policies.latestBy?.(context) ??
      defaultEffectRunKey;

    if (runKey !== defaultEffectRunKey) {
      abortEffectRun(effectDefinition, activeEffects, runKey);
    }

    const releaseEffectRun = registerEffectRun(
      effectDefinition,
      activeEffects,
      runKey,
      controller,
    );

    try {
      const result = await runWithRetry(effectDefinition, context);

      if (context.signal.aborted) {
        continue;
      }

      const successAction = effectDefinition.success?.(result, context);

      if (successAction) {
        dispatch(successAction);
      }
    } catch (error) {
      if (context.signal.aborted) {
        continue;
      }

      const errorAction = effectDefinition.error?.(error, context);

      if (errorAction) {
        dispatch(errorAction);
      }
    } finally {
      releaseEffectRun();
    }
  }
}

function cancelMatchingEffects(
  effects: Record<string, StoreEffect<any>>,
  activeEffects: ActiveEffectControllers,
  action: StoreAction<any>,
): void {
  for (const effectDefinition of Object.values(effects)) {
    if (effectDefinition.policies.cancelWhen?.type !== action.type) {
      continue;
    }

    abortEffect(effectDefinition, activeEffects);
  }
}

function registerEffectRun(
  effectDefinition: StoreEffect<any>,
  activeEffects: ActiveEffectControllers,
  runKey: EffectRunKey,
  controller: AbortController,
): () => void {
  let keyedControllers = activeEffects.get(effectDefinition);

  if (!keyedControllers) {
    keyedControllers = new Map();
    activeEffects.set(effectDefinition, keyedControllers);
  }

  let controllers = keyedControllers.get(runKey);

  if (!controllers) {
    controllers = new Set();
    keyedControllers.set(runKey, controllers);
  }

  controllers.add(controller);

  return () => {
    controllers.delete(controller);

    if (controllers.size > 0) {
      return;
    }

    keyedControllers.delete(runKey);

    if (keyedControllers.size === 0) {
      activeEffects.delete(effectDefinition);
    }
  };
}

function abortEffect(
  effectDefinition: StoreEffect<any>,
  activeEffects: ActiveEffectControllers,
): void {
  const keyedControllers = activeEffects.get(effectDefinition);

  if (!keyedControllers) {
    return;
  }

  for (const controllers of keyedControllers.values()) {
    for (const controller of controllers) {
      controller.abort();
    }
  }

  activeEffects.delete(effectDefinition);
}

function abortEffectRun(
  effectDefinition: StoreEffect<any>,
  activeEffects: ActiveEffectControllers,
  runKey: EffectRunKey,
): void {
  const keyedControllers = activeEffects.get(effectDefinition);
  const controllers = keyedControllers?.get(runKey);

  if (!keyedControllers || !controllers) {
    return;
  }

  for (const controller of controllers) {
    controller.abort();
  }

  keyedControllers.delete(runKey);

  if (keyedControllers.size === 0) {
    activeEffects.delete(effectDefinition);
  }
}

async function runWithRetry(
  effectDefinition: StoreEffect<any>,
  context: StoreEffectContext,
): Promise<unknown> {
  const retry = effectDefinition.policies.retry;
  const attempts = retry?.attempts ?? 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (context.signal.aborted) {
      throw lastError ?? new Error(storeEffectAbortedMessage);
    }

    try {
      return await runWithTimeout(effectDefinition, context);
    } catch (error) {
      lastError = error;

      if (
        context.signal.aborted ||
        !retry ||
        attempt >= attempts ||
        retry.when?.(error) === false
      ) {
        break;
      }

      await wait(retry.delay, context.signal);
    }
  }

  throw lastError;
}

function runWithTimeout(
  effectDefinition: StoreEffect<any>,
  context: StoreEffectContext,
): Promise<unknown> {
  const timeoutMs = effectDefinition.policies.timeoutMs;

  if (!timeoutMs) {
    return Promise.resolve(effectDefinition.run(context));
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Store effect timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    Promise.resolve(effectDefinition.run(context))
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timer = setTimeout(resolve, milliseconds);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}
