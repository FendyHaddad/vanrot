import { isRouteRef } from './create-routes.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { createRouteDiagnostic } from './route-diagnostics.js';
import type { RouteDiagnostic } from './route-diagnostics.js';
import {
  defaultRouteKeepAlivePolicy,
  defaultRoutePreloadPolicy,
  routeKeepAlivePolicyKinds,
  routePreloadPolicyKinds,
  type DefinedRoute,
  type DefinedRouteTable,
  type RouteDefinition,
  type RouteInput,
  type RouteRedirectTarget,
  type RouteRef,
  type RouteUrlInput,
} from './route-types.js';

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

  linkChildren(routeRecords);
  linkRedirectTargets(routeRecords, routeByRef);
  linkBreadcrumbParents(routeRecords, routeByRef);
  validateRouteGraph(routeRecords);
  validateRedirectLoops(routeRecords.map((record) => record.route));

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
    ref,
    path: ref.definition.path,
    fullPath: normalizeRoutePath(ref.definition.path, parent),
    children: [],
    diagnostics,
    preload: ref.definition.preload === undefined
      ? defaultRoutePreloadPolicy
      : ref.definition.preload,
    keepAlive: ref.definition.keepAlive === undefined
      ? defaultRouteKeepAlivePolicy
      : ref.definition.keepAlive,
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
    preload: definition.preload === undefined
      ? defaultRoutePreloadPolicy
      : definition.preload,
    keepAlive: definition.keepAlive === undefined
      ? defaultRouteKeepAlivePolicy
      : definition.keepAlive,
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
  if (route.kind === 'redirect') {
    return;
  }

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

function linkRedirectTargets(
  routeRecords: Array<{ input: RouteInput[string]; route: DefinedRoute }>,
  routeByRef: Map<RouteRef, DefinedRoute>,
): void {
  for (const record of routeRecords) {
    const definition = isRouteRef(record.input) ? record.input.definition : record.input;

    if (record.route.kind !== 'redirect') {
      continue;
    }

    if (definition.to === undefined) {
      throwRouteDiagnostic(
        routeDiagnosticCodes.redirectTargetMissing,
        `Redirect route "${record.route.key}" targets a route that is not defined.`,
        'Return the redirect target from defineRoutes({ ... }).',
        'router/routes#redirect-targets',
      );
    }

    const target = normalizeRedirectTarget(record.route, definition.to, routeByRef);
    const redirect: NonNullable<DefinedRoute['redirect']> = { to: target.route };

    if (target.input !== undefined) {
      redirect.input = target.input;
    }

    if (definition.params !== undefined) {
      redirect.params = definition.params;
    }

    if (definition.queryInput !== undefined) {
      redirect.queryInput = definition.queryInput;
    }

    record.route.redirect = redirect;
  }
}

function normalizeRedirectTarget(
  route: DefinedRoute,
  target: RouteRedirectTarget,
  routeByRef: Map<RouteRef, DefinedRoute>,
): { route: DefinedRoute; input?: RouteUrlInput } {
  const targetRef = isStructuredRouteTarget(target) ? target.route : target;
  const definedTarget = routeByRef.get(targetRef);

  if (definedTarget !== undefined) {
    return {
      route: definedTarget,
      ...(isStructuredRouteTarget(target) ? { input: target.input } : {}),
    };
  }

  throwRouteDiagnostic(
    routeDiagnosticCodes.redirectTargetMissing,
    `Redirect route "${route.key}" targets a route that is not defined.`,
    'Return the redirect target from defineRoutes({ ... }).',
    'router/routes#redirect-targets',
  );
}

function isStructuredRouteTarget(
  value: RouteRedirectTarget,
): value is Extract<RouteRedirectTarget, { kind: 'route-target' }> {
  return 'kind' in value && value.kind === 'route-target';
}


function linkChildren(
  routeRecords: Array<{ input: RouteInput[string]; route: DefinedRoute }>,
): void {
  for (const record of routeRecords) {
    if (!isRouteRef(record.input)) {
      continue;
    }

    record.route.children = routeRecords
      .filter((childRecord) => childRecord.route.parent === record.route)
      .map((childRecord) => childRecord.route);
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
  validateDuplicateFullPaths(routeRecords.map((record) => record.route));

  for (const record of routeRecords) {
    const route = record.route;
    const refChildren = isRouteRef(record.input) ? record.input.children : [];

    validateCanEnter(route);
    validatePerformancePolicy(route);

    if (route.kind === 'redirect') {
      validateRedirectRoute(route);
      continue;
    }

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

function validateDuplicateFullPaths(routes: DefinedRoute[]): void {
  const usedPaths = new Map<string, DefinedRoute>();

  for (const route of routes) {
    const firstRoute = usedPaths.get(route.fullPath);

    if (firstRoute !== undefined && route.path !== '') {
      throwRouteDiagnostic(
        routeDiagnosticCodes.duplicatePath,
        `Route path "${route.fullPath}" is already used by "${firstRoute.key}".`,
        `Give "${route.key}" a different path.`,
        'router/routes#duplicate-paths',
      );
    }

    usedPaths.set(route.fullPath, route);
  }
}

function validateCanEnter(route: DefinedRoute): void {
  if (route.canEnter === undefined) {
    return;
  }

  const guards = Array.isArray(route.canEnter) ? route.canEnter : [route.canEnter];

  if (guards.every((guard) => typeof guard === 'function')) {
    return;
  }

  throwRouteDiagnostic(
    routeDiagnosticCodes.invalidGuard,
    `Route "${route.key}" canEnter must be a function or function array.`,
    `Replace canEnter on "${route.key}" with a guard function or an array of guard functions.`,
    'router/routes#guards',
  );
}

function validatePerformancePolicy(route: DefinedRoute): void {
  if (route.kind === 'redirect') {
    validateRedirectPerformancePolicy(route);
    return;
  }

  if (route.preload.kind !== routePreloadPolicyKinds.intent) {
    return;
  }

  if (route.loadPage !== undefined || route.loadLayout !== undefined) {
    return;
  }

  route.diagnostics.push(
    createRouteDiagnostic({
      code: routeDiagnosticCodes.preloadWithoutLazyTarget,
      severity: 'warning',
      message: `Route "${route.key}" declares preload intent but has no lazy page or lazy layout.`,
      suggestion: `Remove preload from "${route.key}" or switch the route to loadPage/loadLayout.`,
      docsPath: 'router/routes#preload-policy',
    }),
  );
}

function validateRedirectPerformancePolicy(route: DefinedRoute): void {
  if (route.preload.kind !== routePreloadPolicyKinds.none) {
    throwRouteDiagnostic(
      routeDiagnosticCodes.redirectHasPreloadPolicy,
      `Redirect route "${route.key}" must not declare preload policy.`,
      `Remove preload from redirect route "${route.key}".`,
      'router/routes#redirect-routes',
    );
  }

  if (route.keepAlive.kind === routeKeepAlivePolicyKinds.none) {
    return;
  }

  throwRouteDiagnostic(
    routeDiagnosticCodes.redirectHasKeepAlivePolicy,
    `Redirect route "${route.key}" must not declare keepAlive policy.`,
    `Remove keepAlive from redirect route "${route.key}".`,
    'router/routes#redirect-routes',
  );
}

function validateRedirectRoute(route: DefinedRoute): void {
  if (
    route.page !== undefined ||
    route.loadPage !== undefined ||
    route.layout !== undefined ||
    route.loadLayout !== undefined
  ) {
    throwRouteDiagnostic(
      routeDiagnosticCodes.redirectHasRenderTarget,
      `Redirect route "${route.key}" must not define page, loadPage, layout, or loadLayout.`,
      `Remove the render target from "${route.key}" or change it to routes.page(...) or routes.layout(...).`,
      'router/routes#redirect-routes',
    );
  }

  if (route.children.length === 0) {
    return;
  }

  throwRouteDiagnostic(
    routeDiagnosticCodes.redirectHasChildren,
    `Redirect route "${route.key}" must not own child routes.`,
    `Move child routes under a layout route instead of "${route.key}".`,
    'router/routes#redirect-routes',
  );
}

function validateRedirectLoops(routes: DefinedRoute[]): void {
  for (const route of routes) {
    if (route.kind !== 'redirect') {
      continue;
    }

    const visited = new Set<DefinedRoute>();
    let next: DefinedRoute | undefined = route;

    while (next?.kind === 'redirect') {
      if (visited.has(next)) {
        throwRouteDiagnostic(
          routeDiagnosticCodes.redirectLoop,
          `Redirect route "${route.key}" creates a redirect loop.`,
          'Point one redirect in the chain at a page or layout route.',
          'router/routes#redirect-loops',
        );
      }

      visited.add(next);
      next = next.redirect?.to;
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
