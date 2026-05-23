import { describe, expect, it, vi } from 'vitest';
import {
  createCleanupScope,
  disposeCleanupScope,
  flushMountCallbacks,
  registerCleanup,
  registerMountCallback,
  runWithCleanupScope,
  runWithoutCleanupScope,
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

  it('restores the previous scope while parent scopes own nested child scopes', () => {
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
    expect(innerSpy).toHaveBeenCalledOnce();

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

  it('disposes child scopes before parent cleanups', () => {
    const parentScope = createCleanupScope();
    const childScope = createCleanupScope();
    const log: string[] = [];

    runWithCleanupScope(parentScope, () => {
      registerCleanup(() => log.push('parent cleanup'));

      runWithCleanupScope(childScope, () => {
        registerCleanup(() => log.push('child cleanup'));
      });
    });

    disposeCleanupScope(parentScope);

    expect(log).toEqual(['child cleanup', 'parent cleanup']);
  });

  it('does not run child cleanups again when a disposed child is disposed directly', () => {
    const parentScope = createCleanupScope();
    const childScope = createCleanupScope();
    const childCleanup = vi.fn();

    runWithCleanupScope(parentScope, () => {
      runWithCleanupScope(childScope, () => registerCleanup(childCleanup));
    });

    disposeCleanupScope(parentScope);
    disposeCleanupScope(childScope);

    expect(childCleanup).toHaveBeenCalledOnce();
  });

  it('does not run cleanups registered while the same scope is disposing', () => {
    const scope = createCleanupScope();
    const lateCleanup = vi.fn();

    runWithCleanupScope(scope, () => {
      registerCleanup(() => {
        registerCleanup(lateCleanup);
      });
    });

    disposeCleanupScope(scope);

    expect(lateCleanup).not.toHaveBeenCalled();
  });

  it('keeps a child scope owned by its first active parent', () => {
    const firstParent = createCleanupScope();
    const secondParent = createCleanupScope();
    const childScope = createCleanupScope();
    const childCleanup = vi.fn();

    runWithCleanupScope(firstParent, () => {
      runWithCleanupScope(childScope, () => registerCleanup(childCleanup));
    });

    runWithCleanupScope(secondParent, () => {
      runWithCleanupScope(childScope, () => {});
    });

    disposeCleanupScope(secondParent);
    expect(childCleanup).not.toHaveBeenCalled();

    disposeCleanupScope(firstParent);
    expect(childCleanup).toHaveBeenCalledOnce();
  });

  it('runs work without linking new child scopes to the active parent scope', () => {
    const parentScope = createCleanupScope();
    const childScope = createCleanupScope();
    const parentCleanup = vi.fn();
    const childCleanup = vi.fn();

    runWithCleanupScope(parentScope, () => {
      runWithoutCleanupScope(() => {
        runWithCleanupScope(childScope, () => registerCleanup(childCleanup));
      });
      registerCleanup(parentCleanup);
    });

    disposeCleanupScope(parentScope);

    expect(parentCleanup).toHaveBeenCalledOnce();
    expect(childCleanup).not.toHaveBeenCalled();

    disposeCleanupScope(childScope);
    expect(childCleanup).toHaveBeenCalledOnce();
  });
});
