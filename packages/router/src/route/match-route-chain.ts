import { parseRouteQuery } from './query-string.js';
import type {
  DefinedRoute,
  DefinedRouteTable,
  RouteChainMatch,
  RouteMatch,
  RouteParams,
} from './route-types.js';

export function matchRouteChain(routes: DefinedRouteTable, path: string): RouteChainMatch | null {
  const normalizedPath = normalizePath(path);
  const query = parseRouteQuery(path);
  const segments = splitPath(normalizedPath);

  for (const route of Object.values(routes)) {
    if (route.parent !== undefined) {
      continue;
    }

    const match = matchRouteBranch(route, segments, normalizedPath, query, {}, []);

    if (match !== null) {
      return match;
    }
  }

  return null;
}

function matchRouteBranch(
  route: DefinedRoute,
  segments: string[],
  normalizedPath: string,
  query: RouteMatch['query'],
  params: RouteParams,
  chain: RouteMatch[],
): RouteChainMatch | null {
  const routeSegments = splitPath(route.path);
  const routeParams = matchSegments(routeSegments, segments.slice(0, routeSegments.length));

  if (routeParams === null) {
    return null;
  }

  const nextParams = { ...params, ...routeParams };
  const remainingSegments = segments.slice(routeSegments.length);
  const nextChain = [
    ...chain,
    {
      route,
      params: nextParams,
      query,
      path: normalizedPath,
    },
  ];

  if (remainingSegments.length === 0) {
    return matchBranchEnd(route, normalizedPath, query, nextParams, nextChain);
  }

  for (const child of route.children) {
    if (child.path.length === 0) {
      continue;
    }

    const childMatch = matchRouteBranch(
      child,
      remainingSegments,
      normalizedPath,
      query,
      nextParams,
      nextChain,
    );

    if (childMatch !== null) {
      return childMatch;
    }
  }

  return null;
}

function matchBranchEnd(
  route: DefinedRoute,
  normalizedPath: string,
  query: RouteMatch['query'],
  params: RouteParams,
  chain: RouteMatch[],
): RouteChainMatch | null {
  if (route.kind === 'page' || route.kind === 'redirect') {
    return {
      chain,
      params,
      query,
      path: normalizedPath,
    };
  }

  const indexChild = route.children.find((child) => child.path.length === 0);

  if (indexChild === undefined) {
    return null;
  }

  return matchRouteBranch(indexChild, [], normalizedPath, query, params, chain);
}

function matchSegments(routeSegments: string[], pathSegments: string[]): RouteParams | null {
  if (routeSegments.length !== pathSegments.length) {
    return null;
  }

  const params: RouteParams = {};

  for (let index = 0; index < routeSegments.length; index += 1) {
    const routeSegment = routeSegments[index];
    const pathSegment = pathSegments[index];

    if (routeSegment === undefined || pathSegment === undefined) {
      return null;
    }

    if (routeSegment.startsWith(':')) {
      params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
      continue;
    }

    if (routeSegment !== pathSegment) {
      return null;
    }
  }

  return params;
}

function normalizePath(path: string): string {
  const [pathname = '/'] = path.split('?');
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return normalizedPath.replace(/\/+$/u, '') || '/';
}

function splitPath(path: string): string[] {
  if (path.length === 0 || path === '/') {
    return [];
  }

  return path.replace(/^\/+|\/+$/gu, '').split('/').filter(Boolean);
}
