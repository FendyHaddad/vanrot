import type {
  AnyStoreActionCreator,
  StoreAction,
  StoreActionCreator,
  StoreEffect,
  StoreEffectMapContext,
  StoreEffectPolicies,
  StoreEffectRunContext,
  StoreRetryPolicy,
} from "./types.js";

export type EffectBuilder<TAction extends StoreAction<any> = StoreAction<any>> = {
  latestBy(read: (context: StoreEffectRunContext<TAction>) => string): EffectBuilder<TAction>;
  skipWhen(read: (context: StoreEffectRunContext<TAction>) => boolean): EffectBuilder<TAction>;
  cancelWhen(actionCreator: AnyStoreActionCreator): EffectBuilder<TAction>;
  timeout(milliseconds: number): EffectBuilder<TAction>;
  retry(policy: StoreRetryPolicy): EffectBuilder<TAction>;
  run(handler: (context: StoreEffectRunContext<TAction>) => Promise<unknown> | unknown): EffectBuilder<TAction>;
  success(
    map: (
      result: unknown,
      context: StoreEffectMapContext<TAction>,
    ) => StoreAction<any>,
  ): EffectBuilder<TAction>;
  error(
    map: (
      error: unknown,
      context: StoreEffectMapContext<TAction>,
    ) => StoreAction<any>,
  ): EffectBuilder<TAction>;
  trace(name: string): StoreEffect<TAction>;
};

type MutableEffectPolicies = {
  -readonly [Key in keyof StoreEffectPolicies]?: StoreEffectPolicies[Key];
};

export function effect<TPayload extends object | void>(
  trigger: StoreActionCreator<TPayload>,
): EffectBuilder<StoreAction<TPayload>> {
  const policies: MutableEffectPolicies = {};
  let runHandler: StoreEffect<StoreAction<TPayload>>["run"] = () => undefined;
  let successMapper: StoreEffect<StoreAction<TPayload>>["success"];
  let errorMapper: StoreEffect<StoreAction<TPayload>>["error"];

  const builder: EffectBuilder<StoreAction<TPayload>> = {
    latestBy(read) {
      policies.latestBy = read;
      return builder;
    },
    skipWhen(read) {
      policies.skipWhen = read;
      return builder;
    },
    cancelWhen(actionCreator) {
      policies.cancelWhen = actionCreator;
      return builder;
    },
    timeout(milliseconds) {
      policies.timeoutMs = milliseconds;
      return builder;
    },
    retry(policy) {
      policies.retry = policy;
      return builder;
    },
    run(handler) {
      runHandler = handler;
      return builder;
    },
    success(map) {
      successMapper = map;
      return builder;
    },
    error(map) {
      errorMapper = map;
      return builder;
    },
    trace(name) {
      return {
        trigger,
        run: runHandler,
        ...(successMapper ? { success: successMapper } : {}),
        ...(errorMapper ? { error: errorMapper } : {}),
        policies: {
          ...policies,
          trace: name,
        },
      };
    },
  };

  return builder;
}

export function defineEffects<TEffects extends Record<string, StoreEffect<any>>>(
  effects: TEffects,
): TEffects {
  return effects;
}

export function retryPolicy(policy: StoreRetryPolicy): StoreRetryPolicy {
  return policy;
}

export function traceName(name: string): string {
  return name;
}
