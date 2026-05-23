import { matchRouteChain } from './match-route-chain.js';
import { resolveRouteLayout, resolveRoutePage } from './page-loader.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { createRouteDiagnostic } from './route-diagnostics.js';
import type { RouteDiagnostic } from './route-diagnostics.js';
import type { DefinedRoute, DefinedRouteTable, RouteChainMatch } from './route-types.js';

const preloadDiagnostics: RouteDiagnostic[] = [];

export async function preloadRoutePath(
  routes: DefinedRouteTable,
  path: string,
): Promise<boolean> {
  const match = matchRouteChain(routes, path);

  if (match === null) {
    return false;
  }

  return preloadRouteChain(match);
}

export function getRoutePreloadDiagnosticsForTests(): readonly RouteDiagnostic[] {
  return preloadDiagnostics;
}

export function clearRoutePreloadStateForTests(): void {
  preloadDiagnostics.length = 0;
}

async function preloadRouteChain(match: RouteChainMatch): Promise<boolean> {
  const loaders = match.chain
    .map((routeMatch) => preloadRouteModule(routeMatch.route))
    .filter((loader): loader is Promise<unknown> => loader !== null);

  try {
    await Promise.all(loaders);
    return true;
  } catch (error) {
    recordPreloadFailure(match, error);
    return false;
  }
}

function preloadRouteModule(route: DefinedRoute): Promise<unknown> | null {
  if (route.kind === 'layout' && route.loadLayout !== undefined) {
    return resolveRouteLayout(route);
  }

  if (route.kind === 'page' && route.loadPage !== undefined) {
    return resolveRoutePage(route);
  }

  return null;
}

function recordPreloadFailure(match: RouteChainMatch, error: unknown): void {
  const route = match.chain[match.chain.length - 1]?.route;

  if (route === undefined) {
    return;
  }

  preloadDiagnostics.push(
    createRouteDiagnostic({
      code: routeDiagnosticCodes.routePreloadFailed,
      severity: 'warning',
      message: `Preload failed for route "${route.key}".`,
      suggestion: errorMessage(error),
      docsPath: 'router/routes#preload-policy',
    }),
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Retry navigation to load the route normally.';
}
