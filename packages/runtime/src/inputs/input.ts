import { signal } from '../reactive/signal.js';
import type { WritableSignal } from '../reactive/types.js';

const REQUIRED_INPUT_MISSING = Symbol('required input missing');
const REQUIRED_INPUT_MISSING_MESSAGE = 'Required input was read before a value was provided.';

export type InputSignal<T> = WritableSignal<T>;

function required<T>(): InputSignal<T> {
  const value = signal<T | typeof REQUIRED_INPUT_MISSING>(REQUIRED_INPUT_MISSING);

  const read = ((): T => {
    const currentValue = value();

    if (currentValue === REQUIRED_INPUT_MISSING) {
      throw new Error(REQUIRED_INPUT_MISSING_MESSAGE);
    }

    return currentValue;
  }) as InputSignal<T>;

  read.set = (nextValue: T): void => {
    value.set(nextValue);
  };

  read.update = (updater: (current: T) => T): void => {
    read.set(updater(read()));
  };

  return read;
}

function defaultValue<T>(initialValue: T): InputSignal<T> {
  return signal(initialValue);
}

export const input = {
  required,
  default: defaultValue,
};
