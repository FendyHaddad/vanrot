import { isRouteRef } from './create-routes.js';
import { matchRouteChain } from './match-route-chain.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { buildRouteUrl } from './url-builder.js';
import type {
  DefinedRoute,
  DefinedRouteTable,
  RouteChainMatch,
  RouteGuard,
  RouteGuardContext,
  RouteGuardResult,
  RouteMatch,
  RouteRedirectTarget,
  RouteRef,
  RouteUrlInput,
} from './route-types.js';

export interface NavigationDecisionInput {
  routes: DefinedRouteTable;
  path: string;
  from: RouteMatch | null;
  navigationId: number;
  isCurrentNavigation(navigationId: number): boolean;
}

export type NavigationDecision =
  | { kind: 'commit'; match: RouteChainMatch; path: string; replace: boolean }
  | { kind: 'redirect'; path: string; replace: boolean }
  | { kind: 'blocked' }
  | { kind: 'stale' };

export async function resolveNavigationDecision(
  input: NavigationDecisionInput,
): Promise<NavigationDecision> {
  const match = matchRouteChain(input.routes, input.path);

  if (match === null) {
    throw new Error(`No Vanrot route matches "${input.path}".`);
  }

  const redirectDecision = resolveRedirectRoute(match);

  if (redirectDecision !== null) {
    return redirectDecision;
  }

  const guardDecision = await runGuardChain(input, match);

  if (!input.isCurrentNavigation(input.navigationId)) {
    return { kind: 'stale' };
  }

  if (guardDecision !== null) {
    return guardDecision;
  }

  return { kind: 'commit', match, path: input.path, replace: false };
}

function resolveRedirectRoute(match: RouteChainMatch): NavigationDecision | null {
  const leaf = match.chain[match.chain.length - 1]?.route;

  if (leaf?.kind !== 'redirect') {
    return null;
  }

  const redirect = leaf.redirect;

  if (redirect === undefined) {
    throw new Error(`${routeDiagnosticCodes.redirectTargetMissing}: Redirect route "${leaf.key}" has no target.`);
  }

  const input = buildRedirectInput(
    redirect.input,
    redirect.params?.(match.params),
    redirect.queryInput?.(match.query),
  );

  return {
    kind: 'redirect',
    path: buildRouteUrl(redirect.to, input),
    replace: true,
  };
}

function buildRedirectInput(
  baseInput: RouteUrlInput | undefined,
  params: RouteUrlInput['params'],
  query: RouteUrlInput['query'],
): RouteUrlInput {
  return {
    params: { ...(baseInput?.params ?? {}), ...(params ?? {}) },
    query: { ...(baseInput?.query ?? {}), ...(query ?? {}) },
  };
}

async function runGuardChain(
  input: NavigationDecisionInput,
  match: RouteChainMatch,
): Promise<NavigationDecision | null> {
  const leaf = match.chain[match.chain.length - 1];

  if (leaf === undefined) {
    return null;
  }

  const context: RouteGuardContext = {
    to: leaf,
    from: input.from,
  };

  for (const routeMatch of match.chain) {
    const guards = normalizeGuards(routeMatch.route);

    for (const guard of guards) {
      const result = await guard(context);

      if (!input.isCurrentNavigation(input.navigationId)) {
        return { kind: 'stale' };
      }

      const decision = normalizeGuardResult(result, input.routes);

      if (decision === null) {
        continue;
      }

      return decision;
    }
  }

  return null;
}

function normalizeGuards(route: DefinedRoute): RouteGuard[] {
  if (route.canEnter === undefined) {
    return [];
  }

  if (Array.isArray(route.canEnter)) {
    return [...route.canEnter];
  }

  return [route.canEnter as RouteGuard];
}

function normalizeGuardResult(
  result: unknown,
  routes: DefinedRouteTable,
): NavigationDecision | null {
  if (result === true) {
    return null;
  }

  if (result === false) {
    return { kind: 'blocked' };
  }

  if (isStructuredRouteTarget(result)) {
    const route = resolveGuardTarget(result.route, routes);

    return {
      kind: 'redirect',
      path: buildRouteUrl(route, result.input),
      replace: true,
    };
  }

  if (isRouteRefCandidate(result)) {
    const route = resolveGuardTarget(result, routes);

    return {
      kind: 'redirect',
      path: buildRouteUrl(route, {}),
      replace: true,
    };
  }

  throw new Error(
    `${routeDiagnosticCodes.invalidGuardResult}: Guard returned an unsupported navigation result.`,
  );
}

function isRouteRefCandidate(value: unknown): value is RouteRef {
  return typeof value === 'object' && value !== null && isRouteRef(value as never);
}

function isStructuredRouteTarget(
  value: unknown,
): value is Extract<RouteRedirectTarget, { kind: 'route-target' }> {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'route-target';
}

function resolveGuardTarget(target: RouteRef, routes: DefinedRouteTable): DefinedRoute {
  for (const route of Object.values(routes)) {
    if (route.ref === target) {
      return route;
    }
  }

  throw new Error(
    `${routeDiagnosticCodes.guardRedirectTargetMissing}: Guard returned a route that is not defined.`,
  );
}
