import { describe, expect, it, vi } from 'vitest';
import {
  createCleanupScope,
  disposeCleanupScope,
  runWithCleanupScope,
} from '../../src/lifecycle/cleanup-scope.js';
import { effect } from '../../src/reactive/effect.js';
import { signal } from '../../src/reactive/signal.js';

describe('effect', () => {
  it('runs immediately on creation', () => {
    const spy = vi.fn();

    const dispose = effect(spy);

    expect(spy).toHaveBeenCalledOnce();
    dispose();
  });

  it('reruns when a tracked signal changes', () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      count();
      spy();
    });
    spy.mockClear();

    count.set(1);

    expect(spy).toHaveBeenCalledOnce();
    dispose();
  });

  it('does not rerun after disposal', () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      count();
      spy();
    });
    spy.mockClear();

    dispose();
    count.set(1);

    expect(spy).not.toHaveBeenCalled();
  });

  it('runs cleanup before rerun', () => {
    const count = signal(0);
    const log: string[] = [];
    const dispose = effect(() => {
      count();
      log.push('run');
      return () => log.push('cleanup');
    });

    count.set(1);

    expect(log).toEqual(['run', 'cleanup', 'run']);
    dispose();
  });

  it('runs cleanup on disposal', () => {
    const cleanup = vi.fn();

    const dispose = effect(() => cleanup);
    dispose();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('uses the newest dependency set after each run', () => {
    const enabled = signal(true);
    const first = signal(0);
    const second = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      if (enabled()) {
        first();
        spy('first');
        return;
      }

      second();
      spy('second');
    });
    spy.mockClear();

    enabled.set(false);
    spy.mockClear();
    first.set(1);
    second.set(1);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('second');
    dispose();
  });

  it('registers disposal with the active cleanup scope', () => {
    const scope = createCleanupScope();
    const count = signal(0);
    const spy = vi.fn();

    runWithCleanupScope(scope, () => {
      effect(() => {
        count();
        spy();
      });
    });
    spy.mockClear();

    disposeCleanupScope(scope);
    count.set(1);

    expect(spy).not.toHaveBeenCalled();
  });

  it('propagates errors from the initial run synchronously', () => {
    expect(() => {
      effect(() => {
        throw new Error('boom');
      });
    }).toThrow('boom');
  });

  it('propagates errors from reruns synchronously', () => {
    const count = signal(0);
    const dispose = effect(() => {
      if (count() > 0) {
        throw new Error('boom');
      }
    });

    expect(() => count.set(1)).toThrow('boom');
    dispose();
  });
});
