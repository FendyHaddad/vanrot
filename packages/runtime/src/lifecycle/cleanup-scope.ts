import type { Dispose } from '../reactive/types.js';

declare const cleanupScopeBrand: unique symbol;

export interface CleanupScope {
  readonly [cleanupScopeBrand]: true;
}

interface ScopeInternal {
  cleanups: Dispose[];
  mountCallbacks: Array<() => void | Dispose>;
}

const scopes = new WeakMap<CleanupScope, ScopeInternal>();

let activeScope: CleanupScope | null = null;

export function createCleanupScope(): CleanupScope {
  const scope = Object.create(null) as CleanupScope;
  scopes.set(scope, { cleanups: [], mountCallbacks: [] });
  return scope;
}

export function runWithCleanupScope<T>(scope: CleanupScope, fn: () => T): T {
  if (!scopes.has(scope)) {
    return fn();
  }

  const previousScope = activeScope;
  activeScope = scope;

  try {
    return fn();
  } finally {
    activeScope = previousScope;
  }
}

export function disposeCleanupScope(scope: CleanupScope): void {
  const internal = scopes.get(scope);

  if (internal === undefined) {
    return;
  }

  scopes.delete(scope);

  const cleanups = [...internal.cleanups].reverse();
  internal.cleanups.length = 0;
  internal.mountCallbacks.length = 0;

  for (const cleanup of cleanups) {
    cleanup();
  }
}

export function registerCleanup(fn: Dispose): void {
  const scope = activeScope;

  if (scope === null) {
    return;
  }

  scopes.get(scope)?.cleanups.push(fn);
}

export function registerMountCallback(fn: () => void | Dispose): void {
  const scope = activeScope;

  if (scope === null) {
    return;
  }

  scopes.get(scope)?.mountCallbacks.push(fn);
}

export function flushMountCallbacks(scope: CleanupScope): void {
  const internal = scopes.get(scope);

  if (internal === undefined) {
    return;
  }

  const callbacks = [...internal.mountCallbacks];
  internal.mountCallbacks.length = 0;

  runWithCleanupScope(scope, () => {
    for (const callback of callbacks) {
      const cleanup = callback();

      if (typeof cleanup !== 'function') {
        continue;
      }

      registerCleanup(cleanup);
    }
  });
}
