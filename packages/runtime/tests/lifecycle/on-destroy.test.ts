import { describe, expect, it, vi } from 'vitest';
import {
  createCleanupScope,
  disposeCleanupScope,
  runWithCleanupScope,
} from '../../src/lifecycle/cleanup-scope.js';
import { onDestroy } from '../../src/lifecycle/on-destroy.js';

describe('onDestroy', () => {
  it('registers cleanup with the active scope', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();

    runWithCleanupScope(scope, () => onDestroy(spy));
    disposeCleanupScope(scope);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('does nothing without an active scope', () => {
    expect(() => onDestroy(() => {})).not.toThrow();
  });
});
