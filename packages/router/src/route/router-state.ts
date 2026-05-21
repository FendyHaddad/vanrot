import { signal, type Signal } from '@vanrot/runtime';
import { matchRoute } from './match-route.js';
import type { DefinedRouteTable, RouteMatch, RouteParams } from './route-types.js';

const emptyParams: RouteParams = {};

let providedRoutes: DefinedRouteTable | null = null;
let removePopstateListener: (() => void) | null = null;

const currentMatch = signal<RouteMatch | null>(null);
const currentParams = signal<RouteParams>(emptyParams);

export const routeParams = currentParams as Signal<RouteParams>;

export function provideRouter(routes: DefinedRouteTable): void {
  providedRoutes = routes;
  removePopstateListener?.();
  removePopstateListener = listenForPopstate();
  setPath(readBrowserPath(), false);
}

export function navigate(path: string): void {
  setPath(path, true);
}

export function getCurrentMatch(): RouteMatch | null {
  return currentMatch();
}

export function resetRouterForTests(): void {
  providedRoutes = null;
  removePopstateListener?.();
  removePopstateListener = null;
  currentMatch.set(null);
  currentParams.set(emptyParams);
}

function setPath(path: string, push: boolean): void {
  const routes = requireProvidedRoutes();
  const match = matchRoute(routes, path);

  if (match === null) {
    throw new Error(`No Vanrot route matches "${path}".`);
  }

  if (push && globalThis.window !== undefined) {
    globalThis.window.history.pushState(null, '', match.path);
  }

  currentMatch.set(match);
  currentParams.set(match.params);
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

  return globalThis.window.location.pathname;
}

function listenForPopstate(): (() => void) | null {
  if (globalThis.window === undefined) {
    return null;
  }

  const listener = (): void => {
    setPath(readBrowserPath(), false);
  };

  globalThis.window.addEventListener('popstate', listener);

  return () => globalThis.window.removeEventListener('popstate', listener);
}
