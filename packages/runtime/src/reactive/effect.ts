import { registerCleanup } from '../lifecycle/cleanup-scope.js';
import { clearEffectDeps, setActiveEffect, type ReactiveEffect } from './graph.js';
import type { Dispose } from './types.js';

export type { Dispose } from './types.js';

export function effect(run: () => void | Dispose): Dispose {
  let cleanup: Dispose | undefined;
  let disposed = false;
  let initialized = false;

  const self: ReactiveEffect = {
    deps: new Set(),
    run(): void {
      if (disposed) {
        return;
      }

      clearEffectDeps(self);
      runPreviousCleanup();

      const previousEffect = setActiveEffect(self);

      try {
        const nextCleanup = run();
        cleanup = typeof nextCleanup === 'function' ? nextCleanup : undefined;
      } catch (error) {
        if (!initialized) {
          disposed = true;
          clearEffectDeps(self);
        }

        throw error;
      } finally {
        setActiveEffect(previousEffect);
      }
    },
  };

  const dispose = (): void => {
    if (disposed) {
      return;
    }

    disposed = true;
    clearEffectDeps(self);
    runPreviousCleanup();
  };

  self.run();
  initialized = true;
  registerCleanup(dispose);

  return dispose;

  function runPreviousCleanup(): void {
    if (cleanup === undefined) {
      return;
    }

    const previousCleanup = cleanup;
    cleanup = undefined;
    previousCleanup();
  }
}
