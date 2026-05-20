import { describe, expect, it, vi } from 'vitest';
import {
  createCleanupScope,
  disposeCleanupScope,
  flushMountCallbacks,
  registerCleanup,
  registerMountCallback,
  runWithCleanupScope,
} from '../../src/lifecycle/cleanup-scope.js';

describe('cleanup scope', () => {
  it('runs registered cleanups on dispose', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();

    runWithCleanupScope(scope, () => registerCleanup(spy));
    disposeCleanupScope(scope);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('runs cleanups in reverse registration order', () => {
    const scope = createCleanupScope();
    const log: number[] = [];

    runWithCleanupScope(scope, () => {
      registerCleanup(() => log.push(1));
      registerCleanup(() => log.push(2));
      registerCleanup(() => log.push(3));
    });
    disposeCleanupScope(scope);

    expect(log).toEqual([3, 2, 1]);
  });

  it('ignores cleanup registration without an active scope', () => {
    expect(() => registerCleanup(() => {})).not.toThrow();
  });

  it('restores the previous scope after nested runs', () => {
    const outer = createCleanupScope();
    const inner = createCleanupScope();
    const outerSpy = vi.fn();
    const innerSpy = vi.fn();

    runWithCleanupScope(outer, () => {
      runWithCleanupScope(inner, () => registerCleanup(innerSpy));
      registerCleanup(outerSpy);
    });

    disposeCleanupScope(outer);
    expect(outerSpy).toHaveBeenCalledOnce();
    expect(innerSpy).not.toHaveBeenCalled();

    disposeCleanupScope(inner);
    expect(innerSpy).toHaveBeenCalledOnce();
  });

  it('is safe to dispose twice', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();

    runWithCleanupScope(scope, () => registerCleanup(spy));
    disposeCleanupScope(scope);

    expect(() => disposeCleanupScope(scope)).not.toThrow();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('flushes queued mount callbacks', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();

    runWithCleanupScope(scope, () => registerMountCallback(spy));
    expect(spy).not.toHaveBeenCalled();

    flushMountCallbacks(scope);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('registers returned mount cleanup on dispose', () => {
    const scope = createCleanupScope();
    const cleanup = vi.fn();

    runWithCleanupScope(scope, () => registerMountCallback(() => cleanup));
    flushMountCallbacks(scope);
    disposeCleanupScope(scope);

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('runs mount callbacks inside their cleanup scope', () => {
    const scope = createCleanupScope();
    const cleanup = vi.fn();

    runWithCleanupScope(scope, () => {
      registerMountCallback(() => registerCleanup(cleanup));
    });
    flushMountCallbacks(scope);
    disposeCleanupScope(scope);

    expect(cleanup).toHaveBeenCalledOnce();
  });
});
