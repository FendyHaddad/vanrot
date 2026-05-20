export type Signal<T> = () => T;

export type WritableSignal<T> = Signal<T> & {
  set(value: T): void;
  update(updater: (current: T) => T): void;
};

export type Dispose = () => void;
