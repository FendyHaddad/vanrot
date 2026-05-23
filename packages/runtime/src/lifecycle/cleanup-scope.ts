import type { Dispose } from '../reactive/types.js';

declare const cleanupScopeBrand: unique symbol;

export interface CleanupScope {
  readonly [cleanupScopeBrand]: true;
}

interface ScopeInternal {
  cleanups: Dispose[];
  mountCallbacks: Array<() => void | Dispose>;
  childScopes: Set<CleanupScope>;
  parentScope: CleanupScope | null;
}

const scopes = new WeakMap<CleanupScope, ScopeInternal>();

let activeScope: CleanupScope | null = null;

export function createCleanupScope(): CleanupScope {
  const scope = Object.create(null) as CleanupScope;
  scopes.set(scope, {
    cleanups: [],
    mountCallbacks: [],
    childScopes: new Set(),
    parentScope: null,
  });

  if (activeScope !== null) {
    linkChildScope(activeScope, scope);
  }

  return scope;
}

export function runWithCleanupScope<T>(scope: CleanupScope, fn: () => T): T {
  if (!scopes.has(scope)) {
    return fn();
  }

  const previousScope = activeScope;

  if (previousScope !== null && previousScope !== scope) {
    linkChildScope(previousScope, scope);
  }

  activeScope = scope;

  try {
    return fn();
  } finally {
    activeScope = previousScope;
  }
}

export function runWithoutCleanupScope<T>(fn: () => T): T {
  const previousScope = activeScope;
  activeScope = null;

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
  unlinkFromParent(scope, internal);

  const childScopes = [...internal.childScopes].reverse();
  internal.childScopes.clear();

  for (const childScope of childScopes) {
    disposeCleanupScope(childScope);
  }

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

function linkChildScope(parentScope: CleanupScope, childScope: CleanupScope): void {
  if (parentScope === childScope) {
    return;
  }

  const parentInternal = scopes.get(parentScope);
  const childInternal = scopes.get(childScope);

  if (parentInternal === undefined || childInternal === undefined) {
    return;
  }

  if (childInternal.parentScope !== null) {
    return;
  }

  childInternal.parentScope = parentScope;
  parentInternal.childScopes.add(childScope);
}

function unlinkFromParent(scope: CleanupScope, internal: ScopeInternal): void {
  const parentScope = internal.parentScope;

  if (parentScope === null) {
    return;
  }

  scopes.get(parentScope)?.childScopes.delete(scope);
  internal.parentScope = null;
}
