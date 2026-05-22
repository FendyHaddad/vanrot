import { describe, expect, it, vi } from 'vitest';
import { effect } from '../../src/reactive/effect.js';
import { signal } from '../../src/reactive/signal.js';

describe('signal', () => {
  it('reads the initial value', () => {
    const count = signal(0);

    expect(count()).toBe(0);
  });

  it('updates with set', () => {
    const count = signal(0);

    count.set(5);

    expect(count()).toBe(5);
  });

  it('updates with update', () => {
    const count = signal(3);

    count.update((value) => value + 1);

    expect(count()).toBe(4);
  });

  it('does not notify when the value is identical', () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      count();
      spy();
    });
    spy.mockClear();

    count.set(0);

    expect(spy).not.toHaveBeenCalled();
    dispose();
  });

  it('notifies effects when the value changes', () => {
    const count = signal(0);
    const values: number[] = [];
    const dispose = effect(() => values.push(count()));

    count.set(1);
    count.set(2);

    expect(values).toEqual([0, 1, 2]);
    dispose();
  });

  it('does not notify effects when set receives the same value', () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      count();
      spy();
    });
    spy.mockClear();

    count.set(0);

    expect(spy).not.toHaveBeenCalled();
    dispose();
  });

  it('updates from the current value', () => {
    const count = signal(1);

    count.update((current) => current + 4);

    expect(count()).toBe(5);
  });
});
