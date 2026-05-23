import type {
  RouteBreadcrumbDefinition,
  RouteDefinition,
  RouteKind,
  RouteNavMetadata,
  RouteRef,
} from './route-types.js';

export interface RouteBuilder {
  page(definition: RouteDefinition): RouteRef;
  layout(definition: RouteDefinition): RouteRef;
  breadcrumb: {
    root(): RouteBreadcrumbDefinition;
    parent(parent: RouteRef): RouteBreadcrumbDefinition;
  };
  nav: {
    primary(): RouteNavMetadata;
    hidden(): RouteNavMetadata;
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
  };
}

function createRouteRef(kind: RouteKind, definition: RouteDefinition, parent?: RouteRef): RouteRef {
  const routeRef = {
    kind,
    definition: { ...definition, kind },
    children: [] as RouteRef[],
    page(childDefinition: RouteDefinition) {
      return createRouteRef('page', childDefinition, routeRef);
    },
    layout(childDefinition: RouteDefinition) {
      return createRouteRef('layout', childDefinition, routeRef);
    },
    ...(parent === undefined ? {} : { parent }),
  };

  parent?.children.push(routeRef);

  return routeRef;
}
