import { effect, mount, onDestroy, type AppHandle, type ComponentType, type Dispose } from '@vanrot/runtime';
import { readCurrentOutletDepth, runWithOutletDepth } from './route-outlet-context.js';
import { resolveRouteLayout, resolveRoutePage } from '../route/page-loader.js';
import { getCurrentRouteChain } from '../route/router-state.js';
import type { DefinedRoute } from '../route/route-types.js';

export interface RouterOutletOptions {
  kind?: 'router' | 'outlet';
}

export function createRouterOutlet(host: Element, options: RouterOutletOptions = {}): Dispose {
  const outletKind = options.kind ?? 'router';
  const depth = outletKind === 'router' ? 0 : readCurrentOutletDepth() + 1;
  let mountedRoute: DefinedRoute | null = null;
  let mountedComponent: AppHandle | null = null;
  let version = 0;

  const disposeEffect = effect(() => {
    const chain = getCurrentRouteChain();
    const match = chain?.chain[depth];
    const currentVersion = ++version;

    if (match === undefined) {
      disposeMountedComponent();
      host.replaceChildren(...emptyOutletContent(outletKind));
      return;
    }

    if (mountedRoute === match.route) {
      return;
    }

    disposeMountedComponent();
    host.replaceChildren();

    const component = resolveRouteComponent(match.route);

    if (!isPromise(component)) {
      mountResolvedComponent(component, match.route, currentVersion);
      return;
    }

    void component
      .then((resolvedComponent) => {
        if (currentVersion !== version) {
          return;
        }

        mountResolvedComponent(resolvedComponent, match.route, currentVersion);
      })
      .catch((error: unknown) => {
        if (currentVersion !== version) {
          return;
        }

        host.replaceChildren(createRouterMessage(errorMessage(error)));
      });
  });

  const dispose = (): void => {
    version += 1;
    disposeEffect();
    disposeMountedComponent();
    host.replaceChildren();
  };

  onDestroy(dispose);

  return dispose;

  function disposeMountedComponent(): void {
    mountedComponent?.destroy();
    mountedComponent = null;
    mountedRoute = null;
  }

  function mountResolvedComponent(
    component: ComponentType,
    route: DefinedRoute,
    currentVersion: number,
  ): void {
    if (currentVersion !== version) {
      return;
    }

    runWithOutletDepth(depth, () => {
      mountedComponent = mount(component, host);
      mountedRoute = route;
    });
  }
}

function resolveRouteComponent(route: DefinedRoute): ComponentType | Promise<ComponentType> {
  if (route.kind === 'layout') {
    if (route.layout !== undefined) {
      return route.layout;
    }

    return resolveRouteLayout(route);
  }

  if (route.page !== undefined) {
    return route.page;
  }

  return resolveRoutePage(route);
}

function isPromise(value: ComponentType | Promise<ComponentType>): value is Promise<ComponentType> {
  return typeof (value as Promise<ComponentType>).then === 'function';
}

function emptyOutletContent(kind: 'router' | 'outlet'): Text[] {
  if (kind === 'outlet') {
    return [];
  }

  return [createRouterMessage('No route matched.')];
}

function createRouterMessage(message: string): Text {
  return document.createTextNode(message);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load route page.';
}
