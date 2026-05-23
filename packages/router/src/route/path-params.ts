import type { RouteParams } from './route-types.js';

const paramNamePattern = /^[A-Za-z_$][\w$]*$/u;

export function extractPathParamNames(path: string): string[] {
  return routeSegments(path)
    .filter((segment) => segment.startsWith(':'))
    .map((segment) => {
      const name = segment.slice(1);

      if (!paramNamePattern.test(name)) {
        throw new Error(`Invalid route param "${name}" in "${path}".`);
      }

      return name;
    });
}

export function matchRoutePath(routePath: string, currentPath: string): RouteParams | null {
  const routeParts = routeSegments(routePath);
  const currentParts = routeSegments(currentPath);

  if (routeParts.length !== currentParts.length) {
    return null;
  }

  const params: RouteParams = {};

  for (let index = 0; index < routeParts.length; index += 1) {
    const routePart = routeParts[index] ?? '';
    const currentPart = currentParts[index] ?? '';

    if (routePart.startsWith(':')) {
      params[routePart.slice(1)] = decodeURIComponent(currentPart);
      continue;
    }

    if (routePart !== currentPart) {
      return null;
    }
  }

  return params;
}

export function fillRoutePath(path: string, params: RouteParams = {}): string {
  return routeSegments(path).reduce((currentPath, segment) => {
    if (!segment.startsWith(':')) {
      return currentPath;
    }

    const name = segment.slice(1);
    const value = params[name];

    if (value === undefined) {
      throw new Error(`Missing required route param "${name}".`);
    }

    return currentPath.replace(`:${name}`, encodeURIComponent(value));
  }, path);
}

function routeSegments(path: string): string[] {
  if (path === '/') {
    return [];
  }

  return path.split('?')[0]?.split('/').filter(Boolean) ?? [];
}
