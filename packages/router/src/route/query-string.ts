import type { RouteQuery, RouteQueryDefinitionMap, RouteQueryValue } from './route-types.js';

export type ParsedRouteQuery = Record<string, string | string[]>;

export function parseRouteQuery(path: string): ParsedRouteQuery {
  const queryText = path.split('?')[1] ?? '';
  const searchParams = new URLSearchParams(queryText);
  const query: ParsedRouteQuery = {};

  for (const [key, value] of searchParams.entries()) {
    const existingValue = query[key];

    if (existingValue === undefined) {
      query[key] = value;
      continue;
    }

    if (Array.isArray(existingValue)) {
      existingValue.push(value);
      continue;
    }

    query[key] = [existingValue, value];
  }

  return query;
}

export function buildRouteQueryString(
  definitions: RouteQueryDefinitionMap | undefined,
  query: RouteQuery = {},
  routeKey: string,
): string {
  if (definitions === undefined) {
    const unknownKey = Object.keys(query)[0];

    if (unknownKey !== undefined) {
      throw new Error(`Route "${routeKey}" does not define query "${unknownKey}".`);
    }

    return '';
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    const definition = definitions[key];

    if (definition === undefined) {
      throw new Error(`Route "${routeKey}" does not define query "${key}".`);
    }

    if (shouldOmitQueryValue(value, definition.default)) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();

  if (queryString.length === 0) {
    return '';
  }

  return `?${queryString}`;
}

function shouldOmitQueryValue(value: RouteQueryValue, defaultValue: RouteQueryValue): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (Array.isArray(value) || Array.isArray(defaultValue)) {
    return JSON.stringify(value) === JSON.stringify(defaultValue);
  }

  return value === defaultValue;
}
