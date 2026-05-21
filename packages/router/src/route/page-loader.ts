import type { DefinedRoute, RoutePageModule } from './route-types.js';

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
