// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import {
  createAsyncTestScope,
  createFakeTimerBridge,
  flushTestingTasks,
  waitForDomUpdate,
} from '../src/async.js';

describe('async testing helpers', () => {
  it('flushes promise work before DOM assertions run', async () => {
    const target = document.createElement('p');
    target.textContent = 'Loading';

    Promise.resolve().then(() => {
      target.textContent = 'Done';
    });

    await flushTestingTasks();

    expect(target.textContent).toBe('Done');
  });

  it('waits for signal-driven DOM updates with deterministic timeout messages', async () => {
    const target = document.createElement('p');
    target.textContent = 'Loading';

    Promise.resolve().then(() => {
      target.textContent = 'Done';
    });

    await waitForDomUpdate(() => {
      expect(target.textContent).toBe('Done');
    });
  });

  it('bridges fake timers without hiding the Vitest timer API', async () => {
    vi.useFakeTimers();
    const run = vi.fn();

    try {
      setTimeout(run, 25);
      const timers = createFakeTimerBridge(vi);

      await timers.advanceBy(25);

      expect(run).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('tracks async cleanup and cancels abortable work', async () => {
    const scope = createAsyncTestScope();
    const controller = new AbortController();
    const cleanup = vi.fn();

    scope.addAbortController(controller);
    scope.addCleanup(cleanup);
    scope.track(Promise.resolve('ready'));

    await scope.cleanup();

    expect(controller.signal.aborted).toBe(true);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(scope.pendingCount()).toBe(0);
  });
});
