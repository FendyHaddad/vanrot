import type { DefinedRoute, RouteLayoutModule, RoutePageModule } from './route-types.js';

type ModuleCacheValue<Module> = Module | Promise<Module>;

const pageModuleCache = new Map<DefinedRoute, ModuleCacheValue<RoutePageModule>>();
const layoutModuleCache = new Map<DefinedRoute, ModuleCacheValue<RouteLayoutModule>>();

export function resolveRoutePage(route: DefinedRoute): Promise<RoutePageModule> {
  if (route.page !== undefined) {
    return Promise.resolve(route.page);
  }

  if (route.loadPage === undefined) {
    throw new Error(`Route "${route.key}" must define page or loadPage.`);
  }

  const cached = pageModuleCache.get(route);

  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  const pending = route.loadPage().then(
    (loaded) => {
      const resolved = normalizePageModule(loaded);
      pageModuleCache.set(route, resolved);
      return resolved;
    },
    (error: unknown) => {
      pageModuleCache.delete(route);
      throw error;
    },
  );
  pageModuleCache.set(route, pending);

  return pending;
}

export function resolveRouteLayout(route: DefinedRoute): Promise<RouteLayoutModule> {
  if (route.layout !== undefined) {
    return Promise.resolve(route.layout);
  }

  if (route.loadLayout === undefined) {
    throw new Error(`Route "${route.key}" must define layout or loadLayout.`);
  }

  const cached = layoutModuleCache.get(route);

  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  const pending = route.loadLayout().then(
    (loaded) => {
      const resolved = normalizeLayoutModule(loaded);
      layoutModuleCache.set(route, resolved);
      return resolved;
    },
    (error: unknown) => {
      layoutModuleCache.delete(route);
      throw error;
    },
  );
  layoutModuleCache.set(route, pending);

  return pending;
}

export function clearRouteModuleCacheForTests(): void {
  pageModuleCache.clear();
  layoutModuleCache.clear();
}

function normalizePageModule(loaded: RoutePageModule | { default: RoutePageModule }): RoutePageModule {
  if ('default' in loaded) {
    return loaded.default;
  }

  return loaded;
}

function normalizeLayoutModule(
  loaded: RouteLayoutModule | { default: RouteLayoutModule },
): RouteLayoutModule {
  if ('default' in loaded) {
    return loaded.default;
  }

  return loaded;
}
