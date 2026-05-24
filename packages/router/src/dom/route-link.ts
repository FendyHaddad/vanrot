import { effect, onDestroy, type Dispose } from '@vanrot/runtime';
import { buildRouteUrl } from '../route/url-builder.js';
import {
  getCurrentMatch,
  navigate,
  preloadRoute,
  preloadRouteOnIntent,
} from '../route/router-state.js';
import { routePreloadPolicyKinds } from '../route/route-types.js';
import type { DefinedRoute, RouteUrlInput } from '../route/route-types.js';

const anchorSelector = 'a[href]';
const routeLinkBoundaryEvent = {
  click: 'click',
  focusin: 'focusin',
  mouseover: 'mouseover',
  touchstart: 'touchstart',
} as const;

export function setupRouteLink(
  anchor: HTMLAnchorElement,
  route: DefinedRoute | undefined,
  input?: RouteUrlInput,
): void {
  if (route === undefined) {
    throw new Error('Unknown Vanrot route reference.');
  }

  const href = buildRouteUrl(route, input);
  anchor.setAttribute('href', href);
  anchor.textContent = route.label;

  effect(() => {
    const currentMatch = getCurrentMatch();

    if (currentMatch?.route === route) {
      anchor.setAttribute('aria-current', 'page');
      return;
    }

    anchor.removeAttribute('aria-current');
  });

  const listener = (event: MouseEvent): void => {
    if (shouldUseBrowserNavigation(event, anchor)) {
      return;
    }

    event.preventDefault();
    void navigate(href);
  };

  anchor.addEventListener('click', listener);

  const preloadListener = (): void => {
    if (route.preload.kind !== routePreloadPolicyKinds.intent) {
      return;
    }

    void preloadRoute(href);
  };

  anchor.addEventListener('mouseenter', preloadListener);
  anchor.addEventListener('focus', preloadListener);
  anchor.addEventListener('touchstart', preloadListener);
  onDestroy(() => {
    anchor.removeEventListener('click', listener);
    anchor.removeEventListener('mouseenter', preloadListener);
    anchor.removeEventListener('focus', preloadListener);
    anchor.removeEventListener('touchstart', preloadListener);
  });
}

export function setupRouteLinkBoundary(root: Element): Dispose {
  const clickListener = (event: Event): void => {
    if (!(event instanceof MouseEvent)) {
      return;
    }

    const anchor = findRouteAnchor(event.target, root);

    if (anchor === null || shouldUseBrowserNavigation(event, anchor)) {
      return;
    }

    const path = readRouterPath(anchor);

    if (path === null) {
      return;
    }

    event.preventDefault();
    void navigate(path);
  };

  const intentListener = (event: Event): void => {
    const anchor = findRouteAnchor(event.target, root);

    if (anchor === null || shouldIgnoreIntent(anchor)) {
      return;
    }

    const path = readRouterPath(anchor);

    if (path === null) {
      return;
    }

    void preloadRouteOnIntent(path);
  };

  root.addEventListener(routeLinkBoundaryEvent.click, clickListener);
  root.addEventListener(routeLinkBoundaryEvent.mouseover, intentListener);
  root.addEventListener(routeLinkBoundaryEvent.focusin, intentListener);
  root.addEventListener(routeLinkBoundaryEvent.touchstart, intentListener);

  return () => {
    root.removeEventListener(routeLinkBoundaryEvent.click, clickListener);
    root.removeEventListener(routeLinkBoundaryEvent.mouseover, intentListener);
    root.removeEventListener(routeLinkBoundaryEvent.focusin, intentListener);
    root.removeEventListener(routeLinkBoundaryEvent.touchstart, intentListener);
  };
}

function findRouteAnchor(target: EventTarget | null, root: Element): HTMLAnchorElement | null {
  if (!(target instanceof Node)) {
    return null;
  }

  const anchor = target instanceof HTMLAnchorElement ? target : target.parentElement?.closest(anchorSelector);

  if (!(anchor instanceof HTMLAnchorElement) || !root.contains(anchor)) {
    return null;
  }

  return anchor;
}

function shouldUseBrowserNavigation(event: MouseEvent, anchor: HTMLAnchorElement): boolean {
  if (event.defaultPrevented) {
    return true;
  }

  if (event.button !== 0) {
    return true;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return true;
  }

  if (anchor.hasAttribute('download')) {
    return true;
  }

  if (anchor.target.length > 0 && anchor.target !== '_self') {
    return true;
  }

  return isExternal(anchor.href);
}

function shouldIgnoreIntent(anchor: HTMLAnchorElement): boolean {
  if (anchor.hasAttribute('download')) {
    return true;
  }

  if (anchor.target.length > 0 && anchor.target !== '_self') {
    return true;
  }

  return isExternal(anchor.href);
}

function readRouterPath(anchor: HTMLAnchorElement): string | null {
  const href = anchor.getAttribute('href');

  if (href === null || href.length === 0 || href.startsWith('#')) {
    return null;
  }

  if (globalThis.window === undefined) {
    return href;
  }

  const url = new URL(anchor.href, globalThis.window.location.href);

  if (url.origin !== globalThis.window.location.origin) {
    return null;
  }

  if (
    url.pathname === globalThis.window.location.pathname &&
    url.search === globalThis.window.location.search &&
    url.hash.length > 0
  ) {
    return null;
  }

  return `${url.pathname}${url.search}`;
}

function isExternal(href: string): boolean {
  if (globalThis.window === undefined) {
    return false;
  }

  return new URL(href, globalThis.window.location.href).origin !== globalThis.window.location.origin;
}
