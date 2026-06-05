import { signal } from "@vanrot/runtime";

import type { StoreState } from "./types.js";

export function defineState<TState extends object>(initial: TState): StoreState<TState> {
  const current = signal(initial);

  return {
    initial,
    current,
    set(next) {
      current.set(next);
    },
    patch(partial) {
      current.set({
        ...current(),
        ...partial,
      });
    },
    reset() {
      current.set(initial);
    },
  };
}
