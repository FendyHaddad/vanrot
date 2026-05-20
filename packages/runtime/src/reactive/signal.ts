import { trackEffect, triggerEffects, type ReactiveEffect } from './graph.js';
import type { Signal, WritableSignal } from './types.js';

export type { Signal, WritableSignal } from './types.js';

export function signal<T>(initialValue: T): WritableSignal<T> {
  let value = initialValue;
  const subscribers = new Set<ReactiveEffect>();

  const read = ((): T => {
    trackEffect(subscribers);
    return value;
  }) as WritableSignal<T>;

  read.set = (nextValue: T): void => {
    if (Object.is(value, nextValue)) {
      return;
    }

    value = nextValue;
    triggerEffects(new Set(subscribers));
  };

  read.update = (updater: (current: T) => T): void => {
    read.set(updater(value));
  };

  return read as Signal<T> & WritableSignal<T>;
}
