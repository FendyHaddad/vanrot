import { signal, type Signal } from '@vanrot/runtime';
import { matchRouteChain } from './match-route-chain.js';
import { resolveNavigationDecision } from './navigation-decisions.js';
import { clearRouteModuleCacheForTests } from './page-loader.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import {
  clearRouteKeepAliveStoreForTests,
  recordKeepAliveRestoreBlocked,
} from './route-keep-alive.js';
import {
  clearRoutePreloadStateForTests,
  preloadRoutePath,
} from './route-preload.js';
import { routeKeepAlivePolicyKinds } from './route-types.js';
import { buildRouteUrl } from './url-builder.js';
import { extractPathParamNames } from './path-params.js';
import type {
  DefinedRoute,
  DefinedRouteTable,
  RouteBreadcrumb,
  RouteChainMatch,
  RouteMatch,
  RouteParams,
} from './route-types.js';

const emptyParams: RouteParams = {};

let providedRoutes: DefinedRouteTable | null = null;
let removePopstateListener: (() => void) | null = null;
let navigationId = 0;
let routeDefinitionVersion = 0;

const currentRouteChain = signal<RouteChainMatch | null>(null);
const currentParams = signal<RouteParams>(emptyParams);

export const routeParams = currentParams as Signal<RouteParams>;

export async function provideRouter(routes: DefinedRouteTable): Promise<boolean> {
  providedRoutes = routes;
  routeDefinitionVersion += 1;
  removePopstateListener?.();
  removePopstateListener = listenForPopstate();
  return startNavigation(readBrowserPath(), { history: 'replace' });
}

export async function navigate(path: string): Promise<boolean> {
  return startNavigation(path, { history: 'push' });
}

export async function preloadRoute(path: string): Promise<boolean> {
  return preloadRoutePath(requireProvidedRoutes(), path);
}

export function getCurrentMatch(): RouteMatch | null {
  const match = currentRouteChain();

  if (match === null) {
    return null;
  }

  return match.chain[match.chain.length - 1] ?? null;
}

export function getCurrentRouteChain(): RouteChainMatch | null {
  return currentRouteChain();
}

export function getRouteDefinitionVersion(): number {
  return routeDefinitionVersion;
}

export function buildRouteBreadcrumbs(match: RouteMatch | null = getCurrentMatch()): RouteBreadcrumb[] {
  if (match === null) {
    return [];
  }

  return collectBreadcrumbRoutes(match.route).map((route) => ({
    route,
    label: route.label,
    href: buildRouteUrl(route, { params: selectRouteParams(route, match.params) }),
  }));
}

export function resetRouterForTests(): void {
  providedRoutes = null;
  removePopstateListener?.();
  removePopstateListener = null;
  navigationId = 0;
  routeDefinitionVersion = 0;
  currentRouteChain.set(null);
  currentParams.set(emptyParams);
  clearRouteModuleCacheForTests();
  clearRoutePreloadStateForTests();
  clearRouteKeepAliveStoreForTests();
}

async function startNavigation(
  path: string,
  options: { history: 'push' | 'replace' | 'none' },
  visitedPaths: Set<string> = new Set(),
): Promise<boolean> {
  if (visitedPaths.has(path)) {
    throw new Error(
      `${routeDiagnosticCodes.guardRedirectLoop}: Guard redirects created a navigation loop at "${path}".`,
    );
  }

  visitedPaths.add(path);

  const routes = requireProvidedRoutes();
  const nextNavigationId = navigationId + 1;
  navigationId = nextNavigationId;
  const decision = await resolveNavigationDecision({
    routes,
    path,
    from: getCurrentMatch(),
    navigationId: nextNavigationId,
    isCurrentNavigation: (candidateId) => candidateId === navigationId,
  });

  if (decision.kind === 'stale') {
    return false;
  }

  if (decision.kind === 'blocked') {
    recordBlockedKeepAliveRestore(path);
    return false;
  }

  if (decision.kind === 'redirect') {
    return startNavigation(
      decision.path,
      { history: decision.replace ? 'replace' : options.history },
      visitedPaths,
    );
  }

  commitRouteChain(decision.match);
  writeHistory(decision.path, options.history);

  return true;
}

function recordBlockedKeepAliveRestore(path: string): void {
  const routes = providedRoutes;

  if (routes === null) {
    return;
  }

  const match = matchRouteChain(routes, path);
  const leaf = match?.chain[match.chain.length - 1];

  if (leaf === undefined) {
    return;
  }

  if (leaf.route.keepAlive.kind !== routeKeepAlivePolicyKinds.sessionDay) {
    return;
  }

  recordKeepAliveRestoreBlocked(leaf.route);
}

function commitRouteChain(match: RouteChainMatch): void {
  currentRouteChain.set(match);
  currentParams.set(match.params);
}

function writeHistory(path: string, mode: 'push' | 'replace' | 'none'): void {
  if (mode === 'none' || globalThis.window === undefined) {
    return;
  }

  if (mode === 'replace') {
    globalThis.window.history.replaceState(null, '', path);
    return;
  }

  globalThis.window.history.pushState(null, '', path);
}

function requireProvidedRoutes(): DefinedRouteTable {
  if (providedRoutes !== null) {
    return providedRoutes;
  }

  throw new Error('Call provideRouter() before using Vanrot router primitives.');
}

function readBrowserPath(): string {
  if (globalThis.window === undefined) {
    return '/';
  }

  return `${globalThis.window.location.pathname}${globalThis.window.location.search}`;
}

function listenForPopstate(): (() => void) | null {
  if (globalThis.window === undefined) {
    return null;
  }

  const listener = (): void => {
    void startNavigation(readBrowserPath(), { history: 'replace' });
  };

  globalThis.window.addEventListener('popstate', listener);

  return () => globalThis.window.removeEventListener('popstate', listener);
}

function collectBreadcrumbRoutes(route: DefinedRoute): DefinedRoute[] {
  if (route.breadcrumb?.kind === 'root') {
    return [route];
  }

  const parent = route.breadcrumbParent ?? route.parent;

  if (parent === undefined) {
    return [route];
  }

  return [...collectBreadcrumbRoutes(parent), route];
}

function selectRouteParams(route: DefinedRoute, params: RouteParams): RouteParams {
  const selectedParams: RouteParams = {};

  for (const paramName of extractPathParamNames(route.fullPath)) {
    const value = params[paramName];

    if (value === undefined) {
      continue;
    }

    selectedParams[paramName] = value;
  }

  return selectedParams;
}
