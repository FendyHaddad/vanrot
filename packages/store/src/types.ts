import type { Signal } from "@vanrot/runtime";

export type StoreError = {
  message: string;
  code: string | undefined;
  cause: unknown;
};

export type StoreAction<Payload extends object | void = void> =
  Payload extends void
    ? { readonly type: string }
    : { readonly type: string } & Readonly<Payload>;

export type StoreActionMetadata = {
  readonly type: string;
  readonly storeName: string;
  readonly actionName: string;
  readonly phase: string;
};

export type StoreActionCreator<Payload extends object | void = void> =
  Payload extends void
    ? (() => StoreAction<void>) & StoreActionMetadata
    : ((payload: Payload) => StoreAction<Payload>) & StoreActionMetadata;

export type AnyStoreActionCreator = StoreActionCreator<any>;

export type StoreActionSet<
  Start extends object | void = void,
  Success extends object | void = void,
  ErrorPayload extends object | void = void,
> = {
  readonly start: StoreActionCreator<Start>;
  readonly success: StoreActionCreator<Success>;
  readonly error: StoreActionCreator<ErrorPayload>;
};

export type StoreState<TState extends object> = {
  readonly initial: TState;
  readonly current: Signal<TState>;
  readonly set: (next: TState) => void;
  readonly patch: (partial: Partial<TState>) => void;
  readonly reset: () => void;
};

export type StoreSelector<TState extends object, TResult, TInput = undefined> = {
  readonly name: string;
  readonly read: TInput extends undefined
    ? (state: TState) => TResult
    : (state: TState, input: TInput) => TResult;
};

export type AnyStoreSelector<TState extends object = any> = {
  readonly name: string;
  readonly read:
    | ((state: TState) => unknown)
    | ((state: TState, input: any) => unknown);
};

export type StoreReducer<TState extends object> = {
  readonly reduce: (state: TState, action: StoreAction<object | void>) => TState;
};

export type StoreRetryPolicy = {
  readonly attempts: number;
  readonly delay: number;
  readonly when?: (error: unknown) => boolean;
};

export type StoreEffectPolicies = {
  readonly latestBy?: (context: StoreEffectRunContext<any>) => string;
  readonly skipWhen?: (context: StoreEffectRunContext<any>) => boolean;
  readonly cancelWhen?: AnyStoreActionCreator;
  readonly timeoutMs?: number;
  readonly retry?: StoreRetryPolicy;
  readonly trace?: string;
};

export type StoreEffectRunContext<TAction extends StoreAction<any> = StoreAction<any>> = {
  readonly action: TAction;
  readonly signal: AbortSignal;
  readonly state: Record<string, unknown>;
  readonly dispatch: (action: StoreAction<any>) => void;
};

export type StoreEffectMapContext<TAction extends StoreAction<any> = StoreAction<any>> =
  StoreEffectRunContext<TAction>;

export type StoreEffect<TAction extends StoreAction<any> = StoreAction<any>> = {
  readonly trigger: AnyStoreActionCreator;
  readonly run: (context: StoreEffectRunContext<TAction>) => Promise<unknown> | unknown;
  readonly success?: (
    result: unknown,
    context: StoreEffectMapContext<TAction>,
  ) => StoreAction<any>;
  readonly error?: (
    error: unknown,
    context: StoreEffectMapContext<TAction>,
  ) => StoreAction<any>;
  readonly policies: StoreEffectPolicies;
};
