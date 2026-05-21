import type { DefinedRouteTable, RouteInput } from './route-types.js';

export function defineRoutes<Input extends RouteInput>(routes: Input): DefinedRouteTable<Input> {
  const entries = Object.entries(routes).map(([key, route]) => {
    if (route.page === undefined && route.loadPage === undefined) {
      throw new Error(`Route "${key}" must define page or loadPage.`);
    }

    return [key, { ...route, key }];
  });

  return Object.fromEntries(entries) as DefinedRouteTable<Input>;
}
