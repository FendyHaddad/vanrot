import { isRouteRef } from './create-routes.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { createRouteDiagnostic } from './route-diagnostics.js';
import type { RouteDiagnostic } from './route-diagnostics.js';
import type { DefinedRoute, DefinedRouteTable, RouteInput } from './route-types.js';

export function defineRoutes<Input extends RouteInput>(routes: Input): DefinedRouteTable<Input> {
  const routeByRef = new Map<object, DefinedRoute>();
  const entries: Array<[string, DefinedRoute]> = [];
  const routeRecords: Array<{ input: RouteInput[string]; route: DefinedRoute }> = [];

  for (const [key, input] of Object.entries(routes)) {
    const definition = isRouteRef(input) ? input.definition : input;
    const parentRef = isRouteRef(input) ? input.parent : undefined;
    const parent = parentRef === undefined ? undefined : routeByRef.get(parentRef);
    const diagnostics: RouteDiagnostic[] = [];
    const route: DefinedRoute = {
      ...definition,
      key,
      path: normalizeRoutePath(definition.path, parent),
      diagnostics,
      ...(parent === undefined ? {} : { parent }),
    };

    if (route.page === undefined && route.loadPage === undefined) {
      diagnostics.push(
        createRouteDiagnostic({
          code: routeDiagnosticCodes.missingRenderTarget,
          message: `Route "${key}" must define page or loadPage.`,
          suggestion: 'Add page or loadPage to the route definition.',
          docsPath: 'router/routes#render-targets',
        }),
      );
    }

    entries.push([key, route]);
    routeRecords.push({ input, route });

    if (isRouteRef(input)) {
      routeByRef.set(input, route);
    }
  }

  for (const record of routeRecords) {
    const definition = isRouteRef(record.input) ? record.input.definition : record.input;

    if (definition.breadcrumb?.kind !== 'parent') {
      continue;
    }

    const breadcrumbParentRef = definition.breadcrumb.parent;

    if (breadcrumbParentRef === undefined) {
      continue;
    }

    const breadcrumbParent = routeByRef.get(breadcrumbParentRef);

    if (breadcrumbParent === undefined) {
      record.route.diagnostics.push(
        createRouteDiagnostic({
          code: routeDiagnosticCodes.breadcrumbParentMissing,
          message: `Route "${record.route.key}" references a breadcrumb parent that is not defined.`,
          suggestion: 'Return the breadcrumb parent route from defineRoutes().',
          docsPath: 'router/routes#breadcrumbs',
        }),
      );
      continue;
    }

    record.route.breadcrumbParent = breadcrumbParent;
  }

  return Object.fromEntries(entries) as DefinedRouteTable<Input>;
}

function normalizeRoutePath(path: string, parent: DefinedRoute | undefined): string {
  if (parent === undefined) {
    return normalizeRootPath(path);
  }

  if (path.length === 0) {
    return parent.path;
  }

  return `${parent.path.replace(/\/+$/u, '')}/${path.replace(/^\/+/u, '')}`;
}

function normalizeRootPath(path: string): string {
  if (path.length === 0 || path === '/') {
    return '/';
  }

  if (path.startsWith('/')) {
    return path.replace(/\/+$/u, '') || '/';
  }

  return `/${path.replace(/\/+$/u, '')}`;
}
