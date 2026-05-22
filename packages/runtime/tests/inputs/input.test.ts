import { describe, expect, it } from 'vitest';
import { input } from '../../src/index.js';

describe('input', () => {
  it('creates a default input signal', () => {
    const compact = input.default(false);

    expect(compact()).toBe(false);

    compact.set(true);

    expect(compact()).toBe(true);
  });

  it('creates a required input signal that reports missing reads', () => {
    const user = input.required<{ name: string }>();

    expect(() => user()).toThrow('Required input was read before a value was provided.');

    user.set({ name: 'Ali' });

    expect(user()).toEqual({ name: 'Ali' });
  });
});
