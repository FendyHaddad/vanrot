import { effect, mount, onDestroy, type AppHandle, type ComponentType, type Dispose } from '@vanrot/runtime';
import { runWithoutCleanupScope } from '@vanrot/runtime/internal';
import { readCurrentOutletDepth, runWithOutletDepth } from './route-outlet-context.js';
import { setupRouteLinkBoundary } from './route-link.js';
import { resolveRouteLayout, resolveRoutePage } from '../route/page-loader.js';
import {
  createKeepAliveRouteIdentity,
  storeKeepAliveRouteView,
  takeKeepAliveRouteView,
  type KeepAliveRouteView,
} from '../route/route-keep-alive.js';
import {
  getCurrentRouteChain,
  getRouteDefinitionVersion,
} from '../route/router-state.js';
import { routeKeepAlivePolicyKinds } from '../route/route-types.js';
import type { DefinedRoute, RouteMatch } from '../route/route-types.js';

export interface RouterOutletOptions {
  kind?: 'router' | 'outlet';
}

interface MountedRouteView {
  identity: string | null;
  route: DefinedRoute;
  handle: AppHandle;
  nodes: Node[];
}

export function createRouterOutlet(host: Element, options: RouterOutletOptions = {}): Dispose {
  const outletKind = options.kind ?? 'router';
  const depth = outletKind === 'router' ? 0 : readCurrentOutletDepth() + 1;
  const disposeRouteLinks = setupRouteLinkBoundary(host);
  let mountedView: MountedRouteView | null = null;
  let version = 0;

  const disposeEffect = effect(() => {
    const chain = getCurrentRouteChain();
    const match = chain?.chain[depth];
    const currentVersion = ++version;

    if (match === undefined) {
      detachOrDestroyMountedView();
      host.replaceChildren(...emptyOutletContent(outletKind));
      return;
    }

    const identity = createKeepAliveRouteIdentity(match, getRouteDefinitionVersion());

    if (mountedView?.route === match.route && mountedView.identity === identity) {
      return;
    }

    const restoredView = restoreMountedView(match);

    if (restoredView !== null) {
      detachOrDestroyMountedView();
      mountedView = restoredView;
      host.replaceChildren(...restoredView.nodes);
      return;
    }

    const component = resolveRouteComponent(match.route);

    if (!isPromise(component)) {
      mountResolvedComponent(component, match, currentVersion);
      return;
    }

    void component
      .then((resolvedComponent) => {
        if (currentVersion !== version) {
          return;
        }

        mountResolvedComponent(resolvedComponent, match, currentVersion);
      })
      .catch((error: unknown) => {
        if (currentVersion !== version) {
          return;
        }

        detachOrDestroyMountedView();
        host.replaceChildren(createRouterMessage(errorMessage(error)));
      });
  });

  const dispose = (): void => {
    version += 1;
    disposeEffect();
    disposeRouteLinks();
    detachOrDestroyMountedView();
    host.replaceChildren();
  };

  onDestroy(dispose);

  return dispose;

  function detachOrDestroyMountedView(): void {
    if (mountedView === null) {
      return;
    }

    if (
      mountedView.route.keepAlive.kind !== routeKeepAlivePolicyKinds.sessionDay ||
      mountedView.identity === null
    ) {
      mountedView.handle.destroy();
      mountedView = null;
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const node of mountedView.nodes) {
      fragment.append(node);
    }

    storeKeepAliveRouteView({
      identity: mountedView.identity,
      route: mountedView.route,
      handle: mountedView.handle,
      nodes: mountedView.nodes,
    });
    mountedView = null;
  }

  function restoreMountedView(match: RouteMatch): KeepAliveRouteView | null {
    if (match.route.keepAlive.kind !== routeKeepAlivePolicyKinds.sessionDay) {
      return null;
    }

    return takeKeepAliveRouteView(match, getRouteDefinitionVersion());
  }

  function mountResolvedComponent(
    component: ComponentType,
    match: RouteMatch,
    currentVersion: number,
  ): void {
    if (currentVersion !== version) {
      return;
    }

    detachOrDestroyMountedView();
    host.replaceChildren();

    runWithOutletDepth(depth, () => {
      const handle = runWithoutCleanupScope(() => mount(component, host));
      const identity = createKeepAliveRouteIdentity(match, getRouteDefinitionVersion());

      mountedView = {
        identity,
        route: match.route,
        handle,
        nodes: Array.from(host.childNodes),
      };
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
