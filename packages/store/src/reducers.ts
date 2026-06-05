import type {
  StoreAction,
  StoreActionCreator,
  StoreReducer,
  StoreState,
} from "./types.js";

type ReducerContext<
  TState extends object,
  TAction extends StoreAction<object | void>,
> = {
  readonly state: TState;
  readonly action: TAction;
};

type ReducerHandler<TState extends object> = {
  readonly actionType: string;
  readonly reduce: (
    state: TState,
    action: StoreAction<object | void>,
  ) => TState;
};

export type ReducerBuilder<TState extends object> = StoreReducer<TState> & {
  on<TPayload extends object | void>(
    actionCreator: StoreActionCreator<TPayload>,
  ): ReducerActionBuilder<TState, StoreAction<TPayload>>;
};

export type ReducerActionBuilder<
  TState extends object,
  TAction extends StoreAction<object | void>,
> = {
  patch(
    update: (context: ReducerContext<TState, TAction>) => Partial<TState>,
  ): ReducerBuilder<TState>;
  set(
    update: (context: ReducerContext<TState, TAction>) => TState,
  ): ReducerBuilder<TState>;
};

export function defineReducer<TState extends object>(
  state: StoreState<TState>,
): ReducerBuilder<TState> {
  const handlers: ReducerHandler<TState>[] = [];

  const builder: ReducerBuilder<TState> = {
    reduce(currentState, action) {
      const handler = handlers.find(
        (candidate) => candidate.actionType === action.type,
      );

      if (!handler) {
        return currentState;
      }

      return handler.reduce(currentState, action);
    },
    on<TPayload extends object | void>(
      actionCreator: StoreActionCreator<TPayload>,
    ): ReducerActionBuilder<TState, StoreAction<TPayload>> {
      return {
        patch(update) {
          handlers.push({
            actionType: actionCreator.type,
            reduce(currentState, action) {
              return mergeState(
                currentState,
                update({
                  state: currentState,
                  action: action as StoreAction<TPayload>,
                }),
              );
            },
          });

          return builder;
        },
        set(update) {
          handlers.push({
            actionType: actionCreator.type,
            reduce(currentState, action) {
              return update({
                state: currentState,
                action: action as StoreAction<TPayload>,
              });
            },
          });

          return builder;
        },
      };
    },
  };

  void state;

  return builder;
}

function mergeState<TState extends object>(
  state: TState,
  partial: Partial<TState>,
): TState {
  const next = {
    ...state,
  } as Record<string, unknown>;

  for (const [key, value] of Object.entries(partial)) {
    const currentValue = (state as Record<string, unknown>)[key];

    if (isPlainObject(currentValue) && isPlainObject(value)) {
      next[key] = {
        ...currentValue,
        ...value,
      };
      continue;
    }

    next[key] = value;
  }

  return next as TState;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
