import { extractPathParamNames, fillRoutePath } from './path-params.js';
import { buildRouteQueryString } from './query-string.js';
import type { DefinedRoute, RouteUrlInput } from './route-types.js';

export function buildRouteUrl(route: DefinedRoute, input: RouteUrlInput = {}): string {
  const params = input.params ?? {};
  const paramNames = extractPathParamNames(route.path);

  for (const paramName of paramNames) {
    if (params[paramName] === undefined) {
      throw new Error(`Route "${route.key}" is missing required param "${paramName}".`);
    }
  }

  for (const paramName of Object.keys(params)) {
    if (!paramNames.includes(paramName)) {
      throw new Error(`Route "${route.key}" does not define param "${paramName}".`);
    }
  }

  const path = fillRoutePath(route.path, params);
  const query = buildRouteQueryString(route.query, input.query, route.key);

  return `${path}${query}`;
}
