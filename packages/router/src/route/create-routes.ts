import {
  routeKeepAlivePolicyKinds,
  routePreloadPolicyKinds,
  type LayoutRouteDefinition,
  type PageRouteDefinition,
  type RedirectRouteDefinition,
  type RouteBreadcrumbDefinition,
  type RouteDefinition,
  type RouteKeepAlivePolicy,
  type RouteKind,
  type RouteNavMetadata,
  type RoutePreloadPolicy,
  type RouteRef,
  type RouteRedirectTarget,
  type RouteUrlInput,
} from './route-types.js';

export interface RouteBuilder {
  page(definition: PageRouteDefinition): RouteRef;
  layout(definition: LayoutRouteDefinition): RouteRef;
  redirect(definition: RedirectRouteDefinition): RouteRef;
  redirectTo(route: RouteRef, input?: RouteUrlInput): RouteRedirectTarget;
  breadcrumb: {
    root(): RouteBreadcrumbDefinition;
    parent(parent: RouteRef): RouteBreadcrumbDefinition;
  };
  nav: {
    primary(): RouteNavMetadata;
    hidden(): RouteNavMetadata;
  };
  preload: {
    none(): RoutePreloadPolicy;
    intent(): RoutePreloadPolicy;
  };
  keepAlive: {
    none(): RouteKeepAlivePolicy;
    sessionDay(): RouteKeepAlivePolicy;
  };
}

export function createRoutes(): RouteBuilder {
  return createBuilder();
}

export function isRouteRef(value: RouteDefinition | RouteRef): value is RouteRef {
  return 'definition' in value && 'children' in value;
}

function createBuilder(parent?: RouteRef): RouteBuilder {
  return {
    page(definition) {
      return createRouteRef('page', definition, parent);
    },
    layout(definition) {
      return createRouteRef('layout', definition, parent);
    },
    redirect(definition) {
      return createRouteRef('redirect', definition, parent);
    },
    redirectTo(route, input = {}) {
      return { kind: 'route-target', route, input };
    },
    breadcrumb: {
      root() {
        return { kind: 'root' };
      },
      parent(parentRoute) {
        return { kind: 'parent', parent: parentRoute };
      },
    },
    nav: {
      primary() {
        return { kind: 'primary' };
      },
      hidden() {
        return { kind: 'hidden' };
      },
    },
    preload: {
      none() {
        return { kind: routePreloadPolicyKinds.none };
      },
      intent() {
        return { kind: routePreloadPolicyKinds.intent };
      },
    },
    keepAlive: {
      none() {
        return { kind: routeKeepAlivePolicyKinds.none };
      },
      sessionDay() {
        return { kind: routeKeepAlivePolicyKinds.sessionDay };
      },
    },
  };
}

function createRouteRef(
  kind: RouteKind,
  definition: PageRouteDefinition | LayoutRouteDefinition | RedirectRouteDefinition,
  parent?: RouteRef,
): RouteRef {
  const routeRef = {
    kind,
    definition: { ...definition, kind },
    children: [] as RouteRef[],
    page(childDefinition: PageRouteDefinition) {
      return createRouteRef('page', childDefinition, routeRef);
    },
    layout(childDefinition: LayoutRouteDefinition) {
      return createRouteRef('layout', childDefinition, routeRef);
    },
    redirect(childDefinition: RedirectRouteDefinition) {
      return createRouteRef('redirect', childDefinition, routeRef);
    },
    ...(parent === undefined ? {} : { parent }),
  };

  parent?.children.push(routeRef);

  return routeRef;
}
