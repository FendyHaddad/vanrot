import { describe, expect, it } from 'vitest';
import {
  beginBatch,
  clearEffectDeps,
  endBatch,
  getActiveEffect,
  setActiveEffect,
  trackEffect,
  triggerEffects,
  type ReactiveEffect,
} from '../../src/reactive/graph.js';

describe('reactive graph', () => {
  it('has no active effect by default', () => {
    expect(getActiveEffect()).toBeNull();
  });

  it('sets the active effect and returns the previous one', () => {
    const effect: ReactiveEffect = { deps: new Set(), run: () => {} };

    const previous = setActiveEffect(effect);

    expect(previous).toBeNull();
    expect(getActiveEffect()).toBe(effect);

    setActiveEffect(null);
  });

  it('tracks the active effect in both directions', () => {
    const effect: ReactiveEffect = { deps: new Set(), run: () => {} };
    const subscribers = new Set<ReactiveEffect>();

    setActiveEffect(effect);
    trackEffect(subscribers);
    setActiveEffect(null);

    expect(subscribers.has(effect)).toBe(true);
    expect(effect.deps.has(subscribers)).toBe(true);
  });

  it('does nothing when tracking without an active effect', () => {
    const subscribers = new Set<ReactiveEffect>();

    trackEffect(subscribers);

    expect(subscribers.size).toBe(0);
  });

  it('removes an effect from every dependency set', () => {
    const effect: ReactiveEffect = { deps: new Set(), run: () => {} };
    const a = new Set<ReactiveEffect>([effect]);
    const b = new Set<ReactiveEffect>([effect]);
    effect.deps.add(a);
    effect.deps.add(b);

    clearEffectDeps(effect);

    expect(a.has(effect)).toBe(false);
    expect(b.has(effect)).toBe(false);
    expect(effect.deps.size).toBe(0);
  });

  it('triggers each subscriber', () => {
    const runs: number[] = [];
    const first: ReactiveEffect = { deps: new Set(), run: () => runs.push(1) };
    const second: ReactiveEffect = { deps: new Set(), run: () => runs.push(2) };

    triggerEffects(new Set([first, second]));

    expect(runs).toEqual([1, 2]);
  });

  it('defers triggers until the outer batch ends', () => {
    const runs: number[] = [];
    const effect: ReactiveEffect = { deps: new Set(), run: () => runs.push(1) };
    const subscribers = new Set<ReactiveEffect>([effect]);

    beginBatch();
    beginBatch();
    triggerEffects(subscribers);
    triggerEffects(subscribers);
    expect(runs).toEqual([]);

    endBatch();
    expect(runs).toEqual([]);

    endBatch();
    expect(runs).toEqual([1]);
  });
});
