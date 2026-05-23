import type { DefinedRoute, RouteLayoutModule, RoutePageModule } from './route-types.js';

export async function resolveRoutePage(route: DefinedRoute): Promise<RoutePageModule> {
  if (route.page !== undefined) {
    return route.page;
  }

  if (route.loadPage === undefined) {
    throw new Error(`Route "${route.key}" must define page or loadPage.`);
  }

  const loaded = await route.loadPage();

  if ('default' in loaded) {
    return loaded.default;
  }

  return loaded;
}

export async function resolveRouteLayout(route: DefinedRoute): Promise<RouteLayoutModule> {
  if (route.layout !== undefined) {
    return route.layout;
  }

  if (route.loadLayout === undefined) {
    throw new Error(`Route "${route.key}" must define layout or loadLayout.`);
  }

  const loaded = await route.loadLayout();

  if ('default' in loaded) {
    return loaded.default;
  }

  return loaded;
}
