import { onDestroy } from '@vanrot/runtime';
import { navigate } from '../route/router-state.js';
import type { DefinedRoute } from '../route/route-types.js';

export function setupRouteLink(anchor: HTMLAnchorElement, route: DefinedRoute | undefined): void {
  if (route === undefined) {
    throw new Error('Unknown Vanrot route reference.');
  }

  if (route.path.includes(':')) {
    throw new Error(`Route "${route.key}" requires params. Typed param links are deferred from Phase 8.`);
  }

  anchor.href = route.path;
  anchor.textContent = route.label;

  const listener = (event: MouseEvent): void => {
    if (shouldUseBrowserNavigation(event, anchor)) {
      return;
    }

    event.preventDefault();
    navigate(route.path);
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
