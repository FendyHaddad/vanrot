// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import {
  createCleanupScope,
  disposeCleanupScope,
  runWithCleanupScope,
} from '../../src/lifecycle/cleanup-scope.js';
import { listen } from '../../src/events/listen.js';

describe('listen', () => {
  it('calls the handler when the event fires', () => {
    const scope = createCleanupScope();
    const button = document.createElement('button');
    const spy = vi.fn();

    runWithCleanupScope(scope, () => listen(button, 'click', spy));
    button.click();

    expect(spy).toHaveBeenCalledOnce();
    disposeCleanupScope(scope);
  });

  it('removes the listener when the scope is disposed', () => {
    const scope = createCleanupScope();
    const button = document.createElement('button');
    const spy = vi.fn();

    runWithCleanupScope(scope, () => listen(button, 'click', spy));
    disposeCleanupScope(scope);
    button.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('returns an idempotent manual dispose function', () => {
    const scope = createCleanupScope();
    const button = document.createElement('button');
    const spy = vi.fn();
    let dispose = (): void => {};

    runWithCleanupScope(scope, () => {
      dispose = listen(button, 'click', spy);
    });
    dispose();
    dispose();
    button.click();
    disposeCleanupScope(scope);

    expect(spy).not.toHaveBeenCalled();
  });
});
