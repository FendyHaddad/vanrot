import { describe, expect, it, vi } from 'vitest';
import {
  createCleanupScope,
  disposeCleanupScope,
  flushMountCallbacks,
  runWithCleanupScope,
} from '../../src/lifecycle/cleanup-scope.js';
import { onDestroy } from '../../src/lifecycle/on-destroy.js';
import { onMount } from '../../src/lifecycle/on-mount.js';

describe('onMount', () => {
  it('defers callback execution until mount callbacks flush', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();

    runWithCleanupScope(scope, () => onMount(spy));
    expect(spy).not.toHaveBeenCalled();

    flushMountCallbacks(scope);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('registers returned cleanup on dispose', () => {
    const scope = createCleanupScope();
    const cleanup = vi.fn();

    runWithCleanupScope(scope, () => onMount(() => cleanup));
    flushMountCallbacks(scope);
    disposeCleanupScope(scope);

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('does not register cleanup when callback returns void', () => {
    const scope = createCleanupScope();
    const cleanup = vi.fn();

    runWithCleanupScope(scope, () => onMount(() => {}));
    flushMountCallbacks(scope);
    disposeCleanupScope(scope);

    expect(cleanup).not.toHaveBeenCalled();
  });

  it('runs callback inside the active cleanup scope', () => {
    const scope = createCleanupScope();
    const cleanup = vi.fn();

    runWithCleanupScope(scope, () => onMount(() => onDestroy(cleanup)));
    flushMountCallbacks(scope);
    disposeCleanupScope(scope);

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('does nothing without an active scope', () => {
    expect(() => onMount(() => {})).not.toThrow();
  });

  it('does not run the same mount callback twice when flushed twice', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();

    runWithCleanupScope(scope, () => onMount(spy));

    flushMountCallbacks(scope);
    flushMountCallbacks(scope);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('runs mount cleanup before normal scope cleanup when registered later', () => {
    const scope = createCleanupScope();
    const log: string[] = [];

    runWithCleanupScope(scope, () => {
      onMount(() => () => log.push('mount cleanup'));
      onDestroy(() => log.push('destroy cleanup'));
    });

    flushMountCallbacks(scope);
    disposeCleanupScope(scope);

    expect(log).toEqual(['mount cleanup', 'destroy cleanup']);
  });
});
