export interface FlushTestingTasksOptions {
  turns?: number;
}

export interface WaitForDomUpdateOptions {
  timeoutMs?: number;
  intervalMs?: number;
  message?: string;
}

export interface VitestTimerLike {
  advanceTimersByTimeAsync?: (ms: number) => Promise<unknown>;
  advanceTimersByTime?: (ms: number) => unknown;
  runOnlyPendingTimersAsync?: () => Promise<unknown>;
  runOnlyPendingTimers?: () => unknown;
}

export interface FakeTimerBridge {
  advanceBy(ms: number): Promise<void>;
  runPending(): Promise<void>;
  flush(): Promise<void>;
}

export interface AsyncTestScope {
  addAbortController(controller: AbortController): void;
  addCleanup(cleanup: () => void | Promise<void>): void;
  track<T>(promise: Promise<T>): Promise<T>;
  pendingCount(): number;
  cleanup(): Promise<void>;
}

export async function flushTestingTasks(options: FlushTestingTasksOptions = {}): Promise<void> {
  const turns = options.turns ?? 1;

  for (let turn = 0; turn < turns; turn += 1) {
    await Promise.resolve();
  }
}

export async function waitForDomUpdate(
  assertion: () => void | Promise<void>,
  options: WaitForDomUpdateOptions = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 1000;
  const intervalMs = options.intervalMs ?? 5;
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt <= timeoutMs) {
    try {
      await assertion();
      return;
    } catch (error) {
      lastError = error;
      await sleep(intervalMs);
      await flushTestingTasks();
    }
  }

  const detail = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(options.message ?? `Timed out waiting for DOM update. Last error: ${detail}`);
}

export function createFakeTimerBridge(timers: VitestTimerLike): FakeTimerBridge {
  return {
    async advanceBy(ms: number): Promise<void> {
      if (timers.advanceTimersByTimeAsync !== undefined) {
        await timers.advanceTimersByTimeAsync(ms);
      } else {
        timers.advanceTimersByTime?.(ms);
      }

      await flushTestingTasks();
    },
    async runPending(): Promise<void> {
      if (timers.runOnlyPendingTimersAsync !== undefined) {
        await timers.runOnlyPendingTimersAsync();
      } else {
        timers.runOnlyPendingTimers?.();
      }

      await flushTestingTasks();
    },
    async flush(): Promise<void> {
      await this.runPending();
    },
  };
}

export function createAsyncTestScope(): AsyncTestScope {
  const pending = new Set<Promise<unknown>>();
  const cleanups: Array<() => void | Promise<void>> = [];
  const abortControllers: AbortController[] = [];
  let cleaned = false;

  return {
    addAbortController(controller: AbortController): void {
      abortControllers.push(controller);
    },
    addCleanup(cleanup: () => void | Promise<void>): void {
      cleanups.push(cleanup);
    },
    track<T>(promise: Promise<T>): Promise<T> {
      let tracked: Promise<T>;
      tracked = promise.finally(() => {
        pending.delete(tracked);
      });
      pending.add(tracked);
      return tracked;
    },
    pendingCount(): number {
      return pending.size;
    },
    async cleanup(): Promise<void> {
      if (cleaned) {
        return;
      }

      cleaned = true;

      for (const controller of abortControllers) {
        controller.abort();
      }

      await Promise.allSettled([...pending]);

      for (const cleanup of cleanups.reverse()) {
        await cleanup();
      }

      await flushTestingTasks();
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
