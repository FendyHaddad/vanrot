import {
  buildRouteUrl,
  getCurrentRouteChain,
  navigate as navigatePath,
  provideRouter,
  resolveRoutePage,
  type DefinedRoute,
  type DefinedRouteTable,
  type RouteParams,
  type RouteQuery,
  type RouteUrlInput,
} from '@vanrot/router';
import { resetRouterForTests } from '@vanrot/router/internal';
import { expect } from 'vitest';

export interface RouterTestOptions {
  initialRoute?: DefinedRoute;
  initialPath?: string;
  params?: RouteParams;
  query?: RouteQuery;
}

export interface RouterTestHarness {
  readonly routes: DefinedRouteTable;
  routeUrl(route: DefinedRoute, input?: RouteUrlInput): string;
  navigate(route: DefinedRoute, input?: RouteUrlInput): Promise<boolean>;
  cleanup(): Promise<void>;
  readonly expect: {
    currentRoute(route: DefinedRoute): void;
    currentPath(path: string): void;
    params(params: RouteParams): void;
    query(query: RouteQuery): void;
  };
}

export async function setupRouterTest(
  routes: DefinedRouteTable,
  options: RouterTestOptions = {},
): Promise<RouterTestHarness> {
  let cleaned = false;
  resetRouterForTests();

  const initialPath =
    options.initialPath ??
    (options.initialRoute !== undefined
      ? buildRouteUrl(options.initialRoute, routeUrlInputFromOptions(options))
      : '/');

  window.history.replaceState(null, '', initialPath);
  await provideRouter(routes);
  await resolveCurrentPage();

  const assertActive = (): void => {
    if (cleaned) {
      throw new Error('Router test has already been cleaned up.');
    }
  };

  const harness: RouterTestHarness = {
    routes,
    routeUrl(route: DefinedRoute, input: RouteUrlInput = {}): string {
      assertActive();
      return buildRouteUrl(route, input);
    },
    async navigate(route: DefinedRoute, input: RouteUrlInput = {}): Promise<boolean> {
      assertActive();
      const didNavigate = await navigatePath(buildRouteUrl(route, input));

      if (didNavigate) {
        await resolveCurrentPage();
      }

      return didNavigate;
    },
    async cleanup(): Promise<void> {
      if (cleaned) {
        return;
      }

      cleaned = true;
      resetRouterForTests();
      window.history.replaceState(null, '', '/');
    },
    expect: {
      currentRoute(route: DefinedRoute): void {
        assertActive();
        expect(readCurrentRoute()?.route).toBe(route);
      },
      currentPath(path: string): void {
        assertActive();
        expect(`${window.location.pathname}${window.location.search}`).toBe(path);
      },
      params(params: RouteParams): void {
        assertActive();
        expect(readCurrentRoute()?.params).toEqual(params);
      },
      query(query: RouteQuery): void {
        assertActive();
        expect(readCurrentRoute()?.query).toEqual(query);
      },
    },
  };

  return harness;
}

function readCurrentRoute() {
  const chain = getCurrentRouteChain();

  if (chain === null) {
    return null;
  }

  return chain.chain[chain.chain.length - 1] ?? null;
}

function routeUrlInputFromOptions(options: RouterTestOptions): RouteUrlInput {
  return {
    ...(options.params !== undefined ? { params: options.params } : {}),
    ...(options.query !== undefined ? { query: options.query } : {}),
  };
}

async function resolveCurrentPage(): Promise<void> {
  const match = readCurrentRoute();

  if (match === null) {
    return;
  }

  await resolveRoutePage(match.route);
}
