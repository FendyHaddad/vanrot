import { describe, expect, it, vi } from 'vitest';
import { effect } from '../../src/reactive/effect.js';
import { signal } from '../../src/reactive/signal.js';
import { untrack } from '../../src/reactive/untrack.js';

describe('untrack', () => {
  it('reads a signal without subscribing', () => {
    const tracked = signal(0);
    const untracked = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      tracked();
      untrack(() => untracked());
      spy();
    });
    spy.mockClear();

    untracked.set(1);
    tracked.set(1);

    expect(spy).toHaveBeenCalledOnce();
    dispose();
  });

  it('returns the read value', () => {
    const count = signal(42);

    expect(untrack(() => count())).toBe(42);
  });

  it('works outside an effect', () => {
    const count = signal(7);

    expect(() => untrack(() => count())).not.toThrow();
  });

  it('restores the previous tracking context after reading', () => {
    const tracked = signal(0);
    const ignored = signal(0);
    const values: number[] = [];
    const dispose = effect(() => {
      values.push(tracked());
      untrack(() => ignored());
      tracked();
    });
    values.length = 0;

    ignored.set(1);
    expect(values).toEqual([]);

    tracked.set(1);
    expect(values).toEqual([1]);

    dispose();
  });
});
