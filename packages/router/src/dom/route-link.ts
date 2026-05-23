import { effect, onDestroy } from '@vanrot/runtime';
import { buildRouteUrl } from '../route/url-builder.js';
import { getCurrentMatch, navigate } from '../route/router-state.js';
import type { DefinedRoute, RouteUrlInput } from '../route/route-types.js';

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
  onDestroy(() => anchor.removeEventListener('click', listener));
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

function isExternal(href: string): boolean {
  if (globalThis.window === undefined) {
    return false;
  }

  return new URL(href, globalThis.window.location.href).origin !== globalThis.window.location.origin;
}
