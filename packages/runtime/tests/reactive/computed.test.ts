import { describe, expect, it, vi } from 'vitest';
import { computed } from '../../src/reactive/computed.js';
import { effect } from '../../src/reactive/effect.js';
import { signal } from '../../src/reactive/signal.js';

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
});
