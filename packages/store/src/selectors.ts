import type { AnyStoreSelector, StoreSelector, StoreState } from "./types.js";

export type SelectorRegistry<TState extends object> = Record<
  string,
  AnyStoreSelector<TState>
>;

export type SelectorBuilder<
  TState extends object,
  TSelectors extends SelectorRegistry<TState> = Record<never, never>,
> = TSelectors & {
  [SelectorName in string]: any & (<
    TResult,
    TInput = undefined,
  >(
    read: TInput extends undefined
      ? (state: TState) => TResult
      : (state: TState, input: TInput) => TResult,
  ) => SelectorBuilder<
    TState,
    TSelectors &
      Record<SelectorName, StoreSelector<TState, TResult, TInput>>
  >);
};

export function defineSelectors<TState extends object>(
  state: StoreState<TState>,
): SelectorBuilder<TState> {
  const selectors: SelectorRegistry<TState> = {};

  const proxy = new Proxy(selectors, {
    get(target, property) {
      if (typeof property !== "string") {
        return Reflect.get(target, property);
      }

      if (property in target) {
        return target[property];
      }

      return (read: (state: TState, input?: unknown) => unknown) => {
        target[property] = {
          name: property,
          read,
        };

        return proxy;
      };
    },
  });

  void state;

  return proxy as unknown as SelectorBuilder<TState>;
}
