import {
  clearEffectDeps,
  setActiveEffect,
  trackEffect,
  triggerEffects,
  type ReactiveEffect,
} from './graph.js';
import type { Signal } from './types.js';

export type { Signal } from './types.js';

export function computed<T>(compute: () => T): Signal<T> {
  let value: T | undefined;
  let dirty = true;
  const subscribers = new Set<ReactiveEffect>();

  const self: ReactiveEffect = {
    deps: new Set(),
    run(): void {
      if (dirty) {
        return;
      }

      dirty = true;
      clearEffectDeps(self);
      triggerEffects(new Set(subscribers));
    },
  };

  return (): T => {
    trackEffect(subscribers);

    if (!dirty) {
      return value as T;
    }

    clearEffectDeps(self);

    const previousEffect = setActiveEffect(self);

    try {
      const nextValue = compute();
      value = nextValue;
      dirty = false;
      return nextValue;
    } catch (error) {
      clearEffectDeps(self);
      throw error;
    } finally {
      setActiveEffect(previousEffect);
    }
  };
}
