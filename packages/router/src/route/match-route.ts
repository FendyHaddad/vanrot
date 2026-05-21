import type { DefinedRoute, DefinedRouteTable, RouteMatch, RouteParams } from './route-types.js';

export function matchRoute(routes: DefinedRouteTable, path: string): RouteMatch | null {
  const normalizedPath = normalizePath(path);

  for (const route of Object.values(routes)) {
    const params = matchPath(route.path, normalizedPath);

    if (params === null) {
      continue;
    }

    return {
      route: route as DefinedRoute,
      params,
      path: normalizedPath,
    };
  }

  return null;
}

function matchPath(pattern: string, path: string): RouteParams | null {
  const patternParts = splitPath(pattern);
  const pathParts = splitPath(path);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: RouteParams = {};

  for (const [index, patternPart] of patternParts.entries()) {
    const pathPart = pathParts[index];

    if (pathPart === undefined) {
      return null;
    }

    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }

    if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

function splitPath(path: string): string[] {
  if (path === '/') {
    return [];
  }

  return path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
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
