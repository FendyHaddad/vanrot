import { matchRoutePath } from './path-params.js';
import { parseRouteQuery } from './query-string.js';
import type { DefinedRoute, DefinedRouteTable, RouteMatch } from './route-types.js';

export function matchRoute(routes: DefinedRouteTable, path: string): RouteMatch | null {
  const normalizedPath = normalizePath(path);

  for (const route of Object.values(routes)) {
    const params = matchRoutePath(route.path, normalizedPath);

    if (params === null) {
      continue;
    }

    return {
      route: route as DefinedRoute,
      params,
      query: parseRouteQuery(path),
      path: normalizedPath,
    };
  }

  return null;
}

function normalizePath(path: string): string {
  const [pathname = '/'] = path.split('?');

  if (pathname.length === 0) {
    return '/';
  }

  if (pathname.startsWith('/')) {
    return pathname;
  }

  return `/${pathname}`;
}
