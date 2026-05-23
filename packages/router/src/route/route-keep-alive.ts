import type { AppHandle } from '@vanrot/runtime';
import { extractPathParamNames } from './path-params.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { createRouteDiagnostic } from './route-diagnostics.js';
import type { RouteDiagnostic } from './route-diagnostics.js';
import type { DefinedRoute, RouteMatch } from './route-types.js';

export interface KeepAliveRouteView {
  identity: string;
  route: DefinedRoute;
  handle: AppHandle;
  nodes: Node[];
}

interface StoredKeepAliveRouteView extends KeepAliveRouteView {
  dayKey: string;
}

const keepAliveStore = new Map<string, StoredKeepAliveRouteView>();
const keepAliveDiagnostics: RouteDiagnostic[] = [];

let readNow = (): Date => new Date();

export function createKeepAliveRouteIdentity(
  match: RouteMatch,
  routeVersion: number,
): string | null {
  const paramPairs = collectParamPairs(match);

  if (paramPairs === null) {
    recordIdentityMissing(match.route);
    return null;
  }

  const queryPairs = Object.entries(match.query)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`);

  return [
    String(routeVersion),
    match.route.key,
    `params:${paramPairs.join(',')}`,
    `query:${queryPairs.join(',')}`,
  ].join('|');
}

export function storeKeepAliveRouteView(view: KeepAliveRouteView): void {
  const existing = keepAliveStore.get(view.identity);

  if (existing !== undefined) {
    existing.handle.destroy();
  }

  keepAliveStore.set(view.identity, {
    ...view,
    dayKey: currentDayKey(),
  });
}

export function takeKeepAliveRouteView(
  match: RouteMatch,
  routeVersion: number,
): KeepAliveRouteView | null {
  clearExpiredKeepAliveViews();

  const identity = createKeepAliveRouteIdentity(match, routeVersion);

  if (identity === null) {
    return null;
  }

  const stored = keepAliveStore.get(identity);

  if (stored === undefined) {
    return null;
  }

  keepAliveStore.delete(identity);

  return {
    identity: stored.identity,
    route: stored.route,
    handle: stored.handle,
    nodes: stored.nodes,
  };
}

export function recordKeepAliveRestoreBlocked(route: DefinedRoute): void {
  keepAliveDiagnostics.push(
    createRouteDiagnostic({
      code: routeDiagnosticCodes.keepAliveRestoreBlocked,
      severity: 'warning',
      message: `KeepAlive restore skipped because current guards blocked route "${route.key}".`,
      suggestion: 'Allow navigation before expecting a kept-alive route view to reattach.',
      docsPath: 'router/routes#keep-alive',
    }),
  );
}

export function clearRouteKeepAliveStoreForTests(): void {
  for (const entry of keepAliveStore.values()) {
    entry.handle.destroy();
  }

  keepAliveStore.clear();
  keepAliveDiagnostics.length = 0;
}

export function getRouteKeepAliveStoreSizeForTests(): number {
  clearExpiredKeepAliveViews();
  return keepAliveStore.size;
}

export function getRouteKeepAliveDiagnosticsForTests(): readonly RouteDiagnostic[] {
  return keepAliveDiagnostics;
}

export function setRouteKeepAliveNowForTests(reader: () => Date): void {
  readNow = reader;
}

function clearExpiredKeepAliveViews(): void {
  const dayKey = currentDayKey();

  for (const [identity, entry] of keepAliveStore.entries()) {
    if (entry.dayKey === dayKey) {
      continue;
    }

    entry.handle.destroy();
    keepAliveStore.delete(identity);
  }
}

function collectParamPairs(match: RouteMatch): string[] | null {
  const pairs: string[] = [];

  for (const paramName of extractPathParamNames(match.route.fullPath)) {
    const value = match.params[paramName];

    if (value === undefined) {
      return null;
    }

    pairs.push(`${paramName}=${value}`);
  }

  return pairs.sort();
}

function recordIdentityMissing(route: DefinedRoute): void {
  keepAliveDiagnostics.push(
    createRouteDiagnostic({
      code: routeDiagnosticCodes.keepAliveIdentityMissing,
      severity: 'warning',
      message: `KeepAlive identity cannot be built for route "${route.key}".`,
      suggestion: 'Ensure all route params needed by the full path are present before enabling keepAlive.',
      docsPath: 'router/routes#keep-alive',
    }),
  );
}

function currentDayKey(): string {
  const now = readNow();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');

  return `${now.getFullYear()}-${month}-${date}`;
}
