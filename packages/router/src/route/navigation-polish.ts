import { getRouterNavigationPolishConfig } from './navigation-polish-config.js';
import type { RouteChainMatch } from './route-types.js';

export type NavigationSource = 'initial' | 'push' | 'replace' | 'popstate';

interface ScrollPosition {
  left: number;
  top: number;
}

const scrollPositions = new Map<string, ScrollPosition>();

export function applyDocumentMetadata(match: RouteChainMatch): void {
  const config = getRouterNavigationPolishConfig();

  if (globalThis.document === undefined) {
    return;
  }

  if (config.navigationPolish.title) {
    const title = resolveDocumentTitle(match);

    if (title !== null) {
      globalThis.document.title = title;
    }
  }

  if (!config.navigationPolish.meta) {
    return;
  }

  const description = resolveMetaDescription(match);

  if (description === null) {
    return;
  }

  const meta = ensureDescriptionMeta();
  meta.setAttribute('content', description);
}

export function resolveDocumentTitle(match: RouteChainMatch): string | null {
  for (let index = match.chain.length - 1; index >= 0; index -= 1) {
    const routeMatch = match.chain[index];

    if (routeMatch === undefined) {
      continue;
    }

    const title = routeMatch.route.title;

    if (title === undefined) {
      continue;
    }

    return title;
  }

  const leaf = match.chain[match.chain.length - 1];

  return leaf?.route.label ?? null;
}

export function resolveMetaDescription(match: RouteChainMatch): string | null {
  for (let index = match.chain.length - 1; index >= 0; index -= 1) {
    const routeMatch = match.chain[index];

    if (routeMatch === undefined) {
      continue;
    }

    const description = routeMatch.route.meta?.description;

    if (description === undefined) {
      continue;
    }

    return description;
  }

  return null;
}

export function recordScrollPosition(path: string | null): void {
  if (path === null || globalThis.window === undefined) {
    return;
  }

  scrollPositions.set(scrollKey(path), {
    left: globalThis.window.scrollX,
    top: globalThis.window.scrollY,
  });
}

export function applyScrollPolish(input: {
  fromPath: string | null;
  toPath: string;
  source: NavigationSource;
}): void {
  const config = getRouterNavigationPolishConfig();

  if (!config.navigationPolish.scroll || globalThis.window === undefined) {
    return;
  }

  if (input.source === 'initial') {
    return;
  }

  if (isHashOnlyNavigation(input.fromPath, input.toPath)) {
    return;
  }

  if (input.source === 'popstate') {
    const restored = scrollPositions.get(scrollKey(input.toPath)) ?? { left: 0, top: 0 };
    scrollToPosition(restored);
    return;
  }

  scrollToPosition({ left: 0, top: 0 });
}

export function focusRouteView(host: Element): void {
  const config = getRouterNavigationPolishConfig();

  if (!config.navigationPolish.focus || globalThis.document === undefined) {
    return;
  }

  const target = findFocusTarget(host);

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const hadTabindex = target.hasAttribute('tabindex');

  if (!hadTabindex) {
    target.setAttribute('tabindex', '-1');
  }

  target.focus({ preventScroll: true });

  if (!hadTabindex) {
    target.removeAttribute('tabindex');
  }
}

export function resetNavigationPolishForTests(): void {
  scrollPositions.clear();
}

function scrollToPosition(position: ScrollPosition): void {
  if (isUnimplementedJsdomScrollTo()) {
    return;
  }

  globalThis.window.scrollTo({
    top: position.top,
    left: position.left,
    behavior: 'auto',
  });
}

function isUnimplementedJsdomScrollTo(): boolean {
  const scrollTo = globalThis.window.scrollTo as typeof globalThis.window.scrollTo & {
    _isMockFunction?: boolean;
  };

  return (
    globalThis.window.navigator.userAgent.includes('jsdom') &&
    scrollTo._isMockFunction !== true
  );
}

function isHashOnlyNavigation(fromPath: string | null, toPath: string): boolean {
  if (fromPath === null) {
    return false;
  }

  return scrollKey(fromPath) === scrollKey(toPath) && readHash(fromPath) !== readHash(toPath);
}

function scrollKey(path: string): string {
  return path.split('#')[0] ?? path;
}

function readHash(path: string): string {
  return path.split('#')[1] ?? '';
}

function findFocusTarget(host: Element): Element {
  const heading = host.querySelector('h1, h2, h3, h4, h5, h6');

  if (heading !== null) {
    return heading;
  }

  if (host.firstElementChild !== null) {
    return host.firstElementChild;
  }

  return host;
}

function ensureDescriptionMeta(): HTMLMetaElement {
  const existing = globalThis.document.querySelector<HTMLMetaElement>('meta[name="description"]');

  if (existing !== null) {
    return existing;
  }

  const meta = globalThis.document.createElement('meta');
  meta.setAttribute('name', 'description');
  globalThis.document.head.append(meta);

  return meta;
}
