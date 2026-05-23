import { isRouteRef } from './create-routes.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { createRouteDiagnostic } from './route-diagnostics.js';
import type { RouteDiagnostic } from './route-diagnostics.js';
import type { DefinedRoute, DefinedRouteTable, RouteDefinition, RouteInput, RouteRef } from './route-types.js';

export function defineRoutes<Input extends RouteInput>(routes: Input): DefinedRouteTable<Input> {
  const refToKey = collectRouteRefKeys(routes);
  const routeByRef = new Map<RouteRef, DefinedRoute>();
  const entries: Array<[string, DefinedRoute]> = [];
  const routeRecords: Array<{ input: RouteInput[string]; route: DefinedRoute }> = [];

  for (const [key, input] of Object.entries(routes)) {
    const route = isRouteRef(input)
      ? normalizeRouteRef(key, input, routeByRef, refToKey)
      : normalizeObjectRoute(key, input);

    entries.push([key, route]);
    routeRecords.push({ input, route });

    if (isRouteRef(input)) {
      routeByRef.set(input, route);
    }
  }

  linkChildren(routeRecords, routeByRef);
  linkBreadcrumbParents(routeRecords, routeByRef);
  validateRouteGraph(routeRecords);

  return Object.fromEntries(entries) as DefinedRouteTable<Input>;
}

function collectRouteRefKeys(routes: RouteInput): Map<RouteRef, string> {
  const refToKey = new Map<RouteRef, string>();

  for (const [key, input] of Object.entries(routes)) {
    if (!isRouteRef(input)) {
      continue;
    }

    refToKey.set(input, key);
  }

  return refToKey;
}

function normalizeRouteRef(
  key: string,
  ref: RouteRef,
  routeByRef: Map<RouteRef, DefinedRoute>,
  refToKey: Map<RouteRef, string>,
): DefinedRoute {
  const parent = resolveParentRoute(key, ref, routeByRef, refToKey);
  const diagnostics: RouteDiagnostic[] = [];
  const route: DefinedRoute = {
    ...ref.definition,
    key,
    kind: ref.kind,
    path: ref.definition.path,
    fullPath: normalizeRoutePath(ref.definition.path, parent),
    children: [],
    diagnostics,
    ...(parent === undefined ? {} : { parent }),
  };

  validateRenderTarget(key, route, diagnostics);

  return route;
}

function normalizeObjectRoute(key: string, definition: RouteDefinition): DefinedRoute {
  const kind = definition.kind ?? 'page';
  const diagnostics: RouteDiagnostic[] = [];
  const route: DefinedRoute = {
    ...definition,
    key,
    kind,
    path: normalizeRootPath(definition.path),
    fullPath: normalizeRootPath(definition.path),
    children: [],
    diagnostics,
  };

  validateRenderTarget(key, route, diagnostics);

  return route;
}

function resolveParentRoute(
  key: string,
  ref: RouteRef,
  routeByRef: Map<RouteRef, DefinedRoute>,
  refToKey: Map<RouteRef, string>,
): DefinedRoute | undefined {
  if (ref.parent === undefined) {
    return undefined;
  }

  const parent = routeByRef.get(ref.parent);

  if (parent !== undefined) {
    return parent;
  }

  throwRouteDiagnostic(
    routeDiagnosticCodes.childBeforeParent,
    `Route "${key}" must appear after parent route "${refToKey.get(ref.parent) ?? 'unregistered parent'}" in defineRoutes().`,
    `Move "${key}" below its parent route in defineRoutes({ ... }).`,
    'router/routes#route-order',
  );
}

function validateRenderTarget(
  key: string,
  route: DefinedRoute,
  diagnostics: RouteDiagnostic[],
): void {
  if (route.kind === 'layout') {
    if (route.layout !== undefined || route.loadLayout !== undefined) {
      return;
    }

    throwRouteDiagnostic(
      routeDiagnosticCodes.layoutMissingComponent,
      `Layout route "${key}" must define layout or loadLayout.`,
      `Add a layout component to route "${key}".`,
      'router/routes#layout-routes',
    );
  }

  if (route.page !== undefined || route.loadPage !== undefined) {
    return;
  }

  diagnostics.push(
    createRouteDiagnostic({
      code: routeDiagnosticCodes.missingRenderTarget,
      message: `Route "${key}" must define page or loadPage.`,
      suggestion: 'Add page or loadPage to the route definition.',
      docsPath: 'router/routes#render-targets',
    }),
  );
}

function linkChildren(
  routeRecords: Array<{ input: RouteInput[string]; route: DefinedRoute }>,
  routeByRef: Map<RouteRef, DefinedRoute>,
): void {
  for (const record of routeRecords) {
    if (!isRouteRef(record.input)) {
      continue;
    }

    record.route.children = record.input.children
      .map((child) => routeByRef.get(child))
      .filter((child): child is DefinedRoute => child !== undefined);
  }
}

function linkBreadcrumbParents(
  routeRecords: Array<{ input: RouteInput[string]; route: DefinedRoute }>,
  routeByRef: Map<RouteRef, DefinedRoute>,
): void {
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
}

function validateRouteGraph(routeRecords: Array<{ input: RouteInput[string]; route: DefinedRoute }>): void {
  for (const record of routeRecords) {
    const route = record.route;
    const refChildren = isRouteRef(record.input) ? record.input.children : [];

    if (route.kind === 'page' && (route.children.length > 0 || refChildren.length > 0)) {
      throwRouteDiagnostic(
        routeDiagnosticCodes.pageHasChildren,
        `Route "${route.key}" is a page route and cannot own child routes.`,
        `Change "${route.key}" to routes.layout(...) or move its children to a layout route.`,
        'router/routes#page-routes',
      );
    }

    if (route.kind === 'layout') {
      validateLayoutRoute(route);
    }
  }
}

function validateLayoutRoute(route: DefinedRoute): void {
  if (route.children.length === 0) {
    throwRouteDiagnostic(
      routeDiagnosticCodes.layoutWithoutChildren,
      `Layout route "${route.key}" must own at least one child route.`,
      `Add "${route.key}.page(...)" or change "${route.key}" to routes.page(...).`,
      'router/routes#layout-routes',
    );
  }

  const indexChildren = route.children.filter((child) => child.path === '');

  if (indexChildren.length > 1) {
    throwRouteDiagnostic(
      routeDiagnosticCodes.duplicateIndexRoute,
      `Layout route "${route.key}" can only own one index page.`,
      `Keep one child route with path: "" under "${route.key}".`,
      'router/routes#index-routes',
    );
  }

  const indexLayout = indexChildren.find((child) => child.kind === 'layout');

  if (indexLayout === undefined) {
    return;
  }

  throwRouteDiagnostic(
    routeDiagnosticCodes.invalidIndexLayout,
    `Route "${indexLayout.key}" uses path "" and must be a page route.`,
    `Change "${indexLayout.key}" from .layout(...) to .page(...).`,
    'router/routes#index-routes',
  );
}

function normalizeRoutePath(path: string, parent: DefinedRoute | undefined): string {
  if (parent === undefined) {
    return normalizeRootPath(path);
  }

  if (path.length === 0) {
    return parent.fullPath;
  }

  return `${parent.fullPath.replace(/\/+$/u, '')}/${path.replace(/^\/+/u, '')}`;
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

function throwRouteDiagnostic(
  code: Parameters<typeof createRouteDiagnostic>[0]['code'],
  message: string,
  suggestion: string,
  docsPath: string,
): never {
  throw new Error(
    `${createRouteDiagnostic({
      code,
      message,
      suggestion,
      docsPath,
    }).code}: ${message}`,
  );
}
