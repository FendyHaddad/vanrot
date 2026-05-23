import type { RouteBreadcrumbDefinition, RouteDefinition, RouteRef } from './route-types.js';

export interface RouteBuilder {
  page(definition: RouteDefinition): RouteRef;
  breadcrumb: {
    root(): RouteBreadcrumbDefinition;
    parent(parent: RouteRef): RouteBreadcrumbDefinition;
  };
}

export function createRoutes(): RouteBuilder {
  return createBuilder();
}

export function isRouteRef(value: RouteDefinition | RouteRef): value is RouteRef {
  return 'kind' in value && value.kind === 'page';
}

function createBuilder(parent?: RouteRef): RouteBuilder {
  return {
    page(definition) {
      return createRouteRef(definition, parent);
    },
    breadcrumb: {
      root() {
        return { kind: 'root' };
      },
      parent(parentRoute) {
        return { kind: 'parent', parent: parentRoute };
      },
    },
  };
}

function createRouteRef(definition: RouteDefinition, parent?: RouteRef): RouteRef {
  const routeRef = {
    kind: 'page' as const,
    definition,
    page(childDefinition: RouteDefinition) {
      return createRouteRef(childDefinition, routeRef);
    },
    ...(parent === undefined ? {} : { parent }),
  };

  return routeRef;
}
