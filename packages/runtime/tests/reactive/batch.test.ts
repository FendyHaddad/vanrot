import { describe, expect, it, vi } from 'vitest';
import { batch } from '../../src/reactive/batch.js';
import { computed } from '../../src/reactive/computed.js';
import { effect } from '../../src/reactive/effect.js';
import { signal } from '../../src/reactive/signal.js';

describe('batch', () => {
  it('groups multiple writes into one effect execution', () => {
    const a = signal(0);
    const b = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      a();
      b();
      spy();
    });
    spy.mockClear();

    batch(() => {
      a.set(1);
      b.set(2);
    });

    expect(spy).toHaveBeenCalledOnce();
    dispose();
  });

  it('returns the callback value', () => {
    expect(batch(() => 42)).toBe(42);
  });

  it('flushes pending effects even when the callback throws', () => {
    const count = signal(0);
    const values: number[] = [];
    const dispose = effect(() => values.push(count()));
    values.length = 0;

    expect(() => {
      batch(() => {
        count.set(1);
        throw new Error('mid-batch error');
      });
    }).toThrow('mid-batch error');

    expect(values).toEqual([1]);
    dispose();
  });

  it('deduplicates computed invalidations during a batch', () => {
    const a = signal(0);
    const b = signal(0);
    const sum = computed(() => a() + b());
    const values: number[] = [];
    const dispose = effect(() => values.push(sum()));
    values.length = 0;

    batch(() => {
      a.set(1);
      b.set(2);
    });

    expect(values).toEqual([3]);
    dispose();
  });
});
