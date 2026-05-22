import { describe, expect, it, vi } from 'vitest';
import { computed } from '../../src/reactive/computed.js';
import { effect } from '../../src/reactive/effect.js';
import { signal } from '../../src/reactive/signal.js';
import { untrack } from '../../src/reactive/untrack.js';

describe('computed', () => {
  it('returns the computed value', () => {
    const a = signal(2);
    const b = signal(3);
    const sum = computed(() => a() + b());

    expect(sum()).toBe(5);
  });

  it('updates when a source signal changes', () => {
    const count = signal(1);
    const double = computed(() => count() * 2);

    count.set(5);

    expect(double()).toBe(10);
  });

  it('does not recompute until read', () => {
    const count = signal(0);
    const double = vi.fn(() => count() * 2);
    const doubled = computed(double);
    doubled();
    double.mockClear();

    count.set(1);

    expect(double).not.toHaveBeenCalled();
    expect(doubled()).toBe(2);
    expect(double).toHaveBeenCalledOnce();
  });

  it('uses the cached value while dependencies are unchanged', () => {
    const count = signal(0);
    const double = vi.fn(() => count() * 2);
    const doubled = computed(double);
    doubled();
    double.mockClear();

    doubled();

    expect(double).not.toHaveBeenCalled();
  });

  it('notifies dependent effects when a source changes', () => {
    const count = signal(0);
    const doubled = computed(() => count() * 2);
    const values: number[] = [];
    const dispose = effect(() => values.push(doubled()));

    count.set(3);

    expect(values).toEqual([0, 6]);
    dispose();
  });

  it('supports computed values depending on computed values', () => {
    const base = signal(1);
    const doubled = computed(() => base() * 2);
    const quadrupled = computed(() => doubled() * 2);

    base.set(3);

    expect(quadrupled()).toBe(12);
  });

  it('does not compute until read', () => {
    const compute = vi.fn(() => 10);
    const value = computed(compute);

    expect(compute).not.toHaveBeenCalled();
    expect(value()).toBe(10);
    expect(compute).toHaveBeenCalledOnce();
  });

  it('retries after a thrown computation', () => {
    const count = signal(0);
    const value = computed(() => {
      if (count() === 0) {
        throw new Error('not ready');
      }

      return count();
    });

    expect(() => value()).toThrow('not ready');

    count.set(2);

    expect(value()).toBe(2);
  });

  it('does not track values read through untrack inside a computed', () => {
    const tracked = signal(1);
    const untracked = signal(10);
    const value = computed(() => tracked() + untrack(() => untracked()));

    expect(value()).toBe(11);
    untracked.set(20);

    expect(value()).toBe(11);

    tracked.set(2);
    expect(value()).toBe(22);
  });
});
