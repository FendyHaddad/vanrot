# Phase 15E Router Navigation Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task in the current session. Do not use subagents, parallel agents, worktrees, staging, commits, or pushes in this repository unless the user explicitly asks. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add optional route-owned title/meta plus router-managed scroll and focus polish so Vanrot navigation feels like real page navigation.

**Architecture:** Keep 15E inside the existing router/config/Vite boundaries. Route metadata lives in `src/routes.ts`; `@vanrot/config` owns defaults and validation; the Vite plugin injects the normalized router polish config as a compile-time define; `@vanrot/router` applies document, scroll, and focus behavior only after navigation commits and the outlet view is ready.

**Tech Stack:** TypeScript, Vitest, jsdom, Vite plugin hooks, `@vanrot/config`, `@vanrot/router`, existing phase documentation guards.

---

## Scope

Implement only the approved Phase 15E surface:

- optional `title?: string`
- optional `meta?: { description?: string }`
- `router.navigationPolish.title/meta/scroll/focus`
- `router.diagnostics.missingTitle/missingMetaDescription`
- scroll-to-top for normal navigation
- scroll restoration for browser back/forward
- hash navigation safety
- focus after mounted view is ready

Do not implement route data loaders, API caching, animation, SSR, analytics, or a full CLI route graph parser.

## File Structure

- Modify `packages/config/src/types.ts`
  - Add typed router config, navigation polish booleans, and diagnostic level values.
- Modify `packages/config/src/defaults.ts`
  - Normalize router polish defaults.
- Modify `packages/config/src/validate.ts`
  - Validate boolean polish flags and diagnostic levels.
- Modify `packages/config/src/diagnostics.ts`
  - Add config diagnostic codes for invalid router polish config.
- Modify `packages/vite-plugin/src/plugin.ts`
  - Inject the normalized router polish config through a Vite `define` constant.
- Modify `packages/router/src/route/route-types.ts`
  - Add route document metadata types to page/layout/redirect definitions and defined routes.
- Modify `packages/router/src/route/route-diagnostic-codes.ts`
  - Add stable 15E diagnostic codes.
- Modify `packages/router/src/route/define-routes.ts`
  - Normalize metadata and emit configured missing/invalid metadata diagnostics.
- Create `packages/router/src/route/navigation-polish-config.ts`
  - Read Vite-injected router polish defaults and provide test overrides.
- Create `packages/router/src/route/navigation-polish.ts`
  - Own browser adapters for title/meta, scroll, focus, and scroll snapshot storage.
- Modify `packages/router/src/route/router-state.ts`
  - Track navigation source and expose post-commit metadata needed by the outlet.
- Modify `packages/router/src/dom/route-outlet.ts`
  - Apply scroll/focus only after mounting/restoring the active view.
- Modify `packages/router/src/index.ts`
  - Export only the minimal public/test-safe symbols required by existing patterns.
- Modify `apps/vanrot-site/src/routes.ts`
  - Add route-owned titles and meta descriptions for site routes as the dogfood example.
- Modify `apps/vanrot-site/vanrot.config.ts`
  - Keep default polish enabled explicitly only if it improves docs readability.
- Modify docs and inventory files after implementation:
  - `docs/superpowers/feature-maturity.md`
  - `docs/superpowers/final-tdd-inventory.md`
  - `docs/vanrot-presentation.html`
  - `docs/superpowers/plans/Phase-15.md`

## Task 1: Add Router Polish Config Shape

**Files:**
- Modify: `packages/config/src/types.ts`
- Modify: `packages/config/src/defaults.ts`
- Modify: `packages/config/src/diagnostics.ts`
- Modify: `packages/config/src/validate.ts`
- Test: `packages/config/tests/defaults.test.ts`
- Test: `packages/config/tests/validate.test.ts`

- [x] **Step 1: Add failing config default tests**

Add to `packages/config/tests/defaults.test.ts`:

```ts
it('normalizes router navigation polish defaults', () => {
  const normalized = normalizeVanrotConfig({});

  expect(normalized.router).toEqual({
    navigationPolish: {
      title: true,
      meta: true,
      scroll: true,
      focus: true,
    },
    diagnostics: {
      missingTitle: 'warn',
      missingMetaDescription: 'off',
    },
  });
});

it('preserves explicit router navigation polish config', () => {
  const normalized = normalizeVanrotConfig({
    router: {
      navigationPolish: {
        title: false,
        meta: false,
        scroll: false,
        focus: false,
      },
      diagnostics: {
        missingTitle: 'off',
        missingMetaDescription: 'error',
      },
    },
  });

  expect(normalized.router.navigationPolish.title).toBe(false);
  expect(normalized.router.navigationPolish.meta).toBe(false);
  expect(normalized.router.navigationPolish.scroll).toBe(false);
  expect(normalized.router.navigationPolish.focus).toBe(false);
  expect(normalized.router.diagnostics.missingTitle).toBe('off');
  expect(normalized.router.diagnostics.missingMetaDescription).toBe('error');
});
```

- [x] **Step 2: Add failing config validation tests**

Add to `packages/config/tests/validate.test.ts`:

```ts
it('reports invalid router navigation polish booleans', () => {
  const diagnostics = validateVanrotConfig({
    router: {
      navigationPolish: {
        scroll: 'yes',
      },
    },
  } as unknown as Parameters<typeof validateVanrotConfig>[0]);

  expect(diagnostics).toEqual([
    {
      code: configDiagnosticCode.invalidRouterNavigationPolish,
      severity: 'error',
      message: 'Invalid router.navigationPolish.scroll: yes',
      suggestion: 'Use true or false.',
    },
  ]);
});

it('reports invalid router diagnostic levels', () => {
  const diagnostics = validateVanrotConfig({
    router: {
      diagnostics: {
        missingTitle: 'loud',
      },
    },
  } as unknown as Parameters<typeof validateVanrotConfig>[0]);

  expect(diagnostics).toEqual([
    {
      code: configDiagnosticCode.invalidRouterDiagnosticLevel,
      severity: 'error',
      message: 'Invalid router.diagnostics.missingTitle: loud',
      suggestion: 'Use off, warn, or error.',
    },
  ]);
});
```

- [x] **Step 3: Run config tests and confirm they fail**

Run:

```sh
pnpm --filter @vanrot/config test -- defaults.test.ts validate.test.ts
```

Expected: FAIL because router config types/defaults/diagnostics do not exist yet.

- [x] **Step 4: Add config types and defaults**

In `packages/config/src/types.ts`, replace `router?: Record<string, unknown>;` with typed router config:

```ts
export const vanrotRouterDiagnosticLevel = {
  off: 'off',
  warn: 'warn',
  error: 'error',
} as const;

export type VanrotRouterDiagnosticLevel =
  (typeof vanrotRouterDiagnosticLevel)[keyof typeof vanrotRouterDiagnosticLevel];

export interface VanrotRouterNavigationPolishConfig {
  title?: boolean;
  meta?: boolean;
  scroll?: boolean;
  focus?: boolean;
}

export interface NormalizedVanrotRouterNavigationPolishConfig {
  title: boolean;
  meta: boolean;
  scroll: boolean;
  focus: boolean;
}

export interface VanrotRouterDiagnosticsConfig {
  missingTitle?: VanrotRouterDiagnosticLevel;
  missingMetaDescription?: VanrotRouterDiagnosticLevel;
}

export interface NormalizedVanrotRouterDiagnosticsConfig {
  missingTitle: VanrotRouterDiagnosticLevel;
  missingMetaDescription: VanrotRouterDiagnosticLevel;
}

export interface VanrotRouterConfig {
  navigationPolish?: VanrotRouterNavigationPolishConfig;
  diagnostics?: VanrotRouterDiagnosticsConfig;
}

export interface NormalizedVanrotRouterConfig {
  navigationPolish: NormalizedVanrotRouterNavigationPolishConfig;
  diagnostics: NormalizedVanrotRouterDiagnosticsConfig;
}
```

Then use `router?: VanrotRouterConfig;` in `VanrotConfig` and add `router: NormalizedVanrotRouterConfig;` to `NormalizedVanrotConfig`.

In `packages/config/src/defaults.ts`, normalize:

```ts
router: {
  navigationPolish: {
    title: config.router?.navigationPolish?.title ?? true,
    meta: config.router?.navigationPolish?.meta ?? true,
    scroll: config.router?.navigationPolish?.scroll ?? true,
    focus: config.router?.navigationPolish?.focus ?? true,
  },
  diagnostics: {
    missingTitle: config.router?.diagnostics?.missingTitle ?? vanrotRouterDiagnosticLevel.warn,
    missingMetaDescription:
      config.router?.diagnostics?.missingMetaDescription ?? vanrotRouterDiagnosticLevel.off,
  },
},
```

- [x] **Step 5: Add validation diagnostics**

In `packages/config/src/diagnostics.ts`, add:

```ts
invalidRouterNavigationPolish: 'VRCFG009',
invalidRouterDiagnosticLevel: 'VRCFG010',
```

In `packages/config/src/validate.ts`, add guarded validation:

```ts
const knownRouterDiagnosticLevels = new Set<string>(Object.values(vanrotRouterDiagnosticLevel));
const routerPolishKeys = ['title', 'meta', 'scroll', 'focus'] as const;
const routerDiagnosticKeys = ['missingTitle', 'missingMetaDescription'] as const;

const router = config.router;
if (router !== undefined) {
  for (const key of routerPolishKeys) {
    const value = router.navigationPolish?.[key];

    if (value === undefined || typeof value === 'boolean') {
      continue;
    }

    diagnostics.push({
      code: configDiagnosticCode.invalidRouterNavigationPolish,
      severity: 'error',
      message: `Invalid router.navigationPolish.${key}: ${String(value)}`,
      suggestion: 'Use true or false.',
    });
  }

  for (const key of routerDiagnosticKeys) {
    const value = router.diagnostics?.[key];

    if (value === undefined || knownRouterDiagnosticLevels.has(String(value))) {
      continue;
    }

    diagnostics.push({
      code: configDiagnosticCode.invalidRouterDiagnosticLevel,
      severity: 'error',
      message: `Invalid router.diagnostics.${key}: ${String(value)}`,
      suggestion: 'Use off, warn, or error.',
    });
  }
}
```

- [x] **Step 6: Run config tests and confirm they pass**

Run:

```sh
pnpm --filter @vanrot/config test
```

Expected: PASS.

## Task 2: Inject Router Config Through Vite

**Files:**
- Modify: `packages/vite-plugin/src/plugin.ts`
- Create: `packages/vite-plugin/tests/plugin-config.test.ts`

- [x] **Step 1: Add failing Vite plugin define test**

Create `packages/vite-plugin/tests/plugin-config.test.ts` with a Vite plugin hook helper and a temporary `vanrot.config.ts` that disables router polish:

```ts
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Plugin, UserConfig } from 'vite';
import vanrot from '@/index.js';

type ConfigHook = (
  this: unknown,
  config: UserConfig,
  env: { command: 'build' | 'serve'; mode: string },
) => UserConfig | Promise<UserConfig>;

function getConfigHook(plugin: Plugin): ConfigHook {
  const hook = plugin.config;

  if (typeof hook === 'function') {
    return hook as ConfigHook;
  }

  if (hook !== undefined && typeof hook === 'object' && 'handler' in hook) {
    return hook.handler as ConfigHook;
  }

  throw new Error('Expected config hook.');
}

describe('vanrot plugin config', () => {
it('injects normalized router navigation polish config', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vanrot-vite-router-config-'));
  await writeFile(
    join(root, 'vanrot.config.ts'),
    [
      'export default {',
      '  router: {',
      '    navigationPolish: { title: false, meta: false, scroll: false, focus: false },',
      '    diagnostics: { missingTitle: "off", missingMetaDescription: "error" },',
      '  },',
      '};',
      '',
    ].join('\n'),
  );

  const config = await getConfigHook(vanrot({ root })).call(
    {} as never,
    { root },
    { command: 'serve', mode: 'development' },
  );

  expect(config).toMatchObject({
    define: {
      __VANROT_ROUTER_NAVIGATION_POLISH__: JSON.stringify({
        navigationPolish: { title: false, meta: false, scroll: false, focus: false },
        diagnostics: { missingTitle: 'off', missingMetaDescription: 'error' },
      }),
    },
  });
});
});
```

- [x] **Step 2: Run the Vite plugin test and confirm it fails**

Run:

```sh
pnpm --filter @vanrot/vite-plugin test -- plugin-config.test.ts
```

Expected: FAIL because the plugin does not inject router config yet.

- [x] **Step 3: Implement the Vite define hook**

In `packages/vite-plugin/src/plugin.ts`, add a `config` hook that loads Vanrot config from `options.root ?? config.root ?? process.cwd()` and returns:

```ts
define: {
  __VANROT_ROUTER_NAVIGATION_POLISH__: JSON.stringify(loaded.config.router),
},
```

Keep the existing `configResolved` diagnostics behavior. Do not duplicate warning output. Use the same root fallback order in the `config` hook and `configResolved` so tests and app builds read the same config file.

- [x] **Step 4: Run Vite plugin tests**

Run:

```sh
pnpm --filter @vanrot/vite-plugin test
```

Expected: PASS.

## Task 3: Add Route Metadata Types And Diagnostics

**Files:**
- Modify: `packages/router/src/route/route-types.ts`
- Modify: `packages/router/src/route/route-diagnostic-codes.ts`
- Modify: `packages/router/src/route/define-routes.ts`
- Create: `packages/router/src/route/navigation-polish-config.ts`
- Test: `packages/router/tests/route/define-routes-metadata.test.ts`

- [x] **Step 1: Add failing metadata tests**

Create `packages/router/tests/route/define-routes-metadata.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes, routeDiagnosticCodes } from '../../src/index.js';
import {
  resetNavigationPolishConfigForTests,
  setNavigationPolishConfigForTests,
} from '../../src/route/navigation-polish-config.js';
import { TestPage } from '../../src/test/test-pages.js';

describe('route document metadata', () => {
  afterEach(() => {
    resetNavigationPolishConfigForTests();
  });

  it('keeps optional title and meta description on defined routes', () => {
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      title: 'Home - Vanrot',
      meta: { description: 'Home page.' },
      page: TestPage,
    });

    const route = defineRoutes({ home });

    expect(route.home.title).toBe('Home - Vanrot');
    expect(route.home.meta).toEqual({ description: 'Home page.' });
  });

  it('warns for missing titles when configured', () => {
    setNavigationPolishConfigForTests({
      navigationPolish: { title: true, meta: true, scroll: true, focus: true },
      diagnostics: { missingTitle: 'warn', missingMetaDescription: 'off' },
    });

    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: TestPage });
    const route = defineRoutes({ home });

    expect(route.home.diagnostics).toContainEqual(
      expect.objectContaining({
        code: routeDiagnosticCodes.missingTitle,
        severity: 'warning',
      }),
    );
  });

  it('throws for missing titles when configured as error', () => {
    setNavigationPolishConfigForTests({
      navigationPolish: { title: true, meta: true, scroll: true, focus: true },
      diagnostics: { missingTitle: 'error', missingMetaDescription: 'off' },
    });

    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: TestPage });

    expect(() => defineRoutes({ home })).toThrow(
      'VR_ROUTE_MISSING_TITLE: Route "home" is missing title metadata.',
    );
  });
});
```

- [x] **Step 2: Run metadata tests and confirm they fail**

Run:

```sh
pnpm --filter @vanrot/router exec vitest run tests/route/define-routes-metadata.test.ts
```

Expected: FAIL because metadata types, config helpers, and diagnostics are missing.

- [x] **Step 3: Add metadata types**

In `packages/router/src/route/route-types.ts`, add:

```ts
export interface RouteDocumentMetadata {
  description?: string;
}

export interface RouteMetadataDefinition {
  title?: string;
  meta?: RouteDocumentMetadata;
}
```

Extend `RouteDefinitionBase` with `RouteMetadataDefinition`.

- [x] **Step 4: Add router-side config helper**

Create `packages/router/src/route/navigation-polish-config.ts`:

```ts
export const routerDiagnosticLevel = {
  off: 'off',
  warn: 'warn',
  error: 'error',
} as const;

export type RouterDiagnosticLevel =
  (typeof routerDiagnosticLevel)[keyof typeof routerDiagnosticLevel];

export interface RouterNavigationPolishConfig {
  navigationPolish: {
    title: boolean;
    meta: boolean;
    scroll: boolean;
    focus: boolean;
  };
  diagnostics: {
    missingTitle: RouterDiagnosticLevel;
    missingMetaDescription: RouterDiagnosticLevel;
  };
}

export const defaultRouterNavigationPolishConfig: RouterNavigationPolishConfig = {
  navigationPolish: { title: true, meta: true, scroll: true, focus: true },
  diagnostics: { missingTitle: 'warn', missingMetaDescription: 'off' },
};

declare const __VANROT_ROUTER_NAVIGATION_POLISH__:
  | RouterNavigationPolishConfig
  | undefined;

let testConfig: RouterNavigationPolishConfig | null = null;

export function getRouterNavigationPolishConfig(): RouterNavigationPolishConfig {
  if (testConfig !== null) {
    return testConfig;
  }

  if (typeof __VANROT_ROUTER_NAVIGATION_POLISH__ === 'undefined') {
    return defaultRouterNavigationPolishConfig;
  }

  return __VANROT_ROUTER_NAVIGATION_POLISH__;
}

export function setNavigationPolishConfigForTests(config: RouterNavigationPolishConfig): void {
  testConfig = config;
}

export function resetNavigationPolishConfigForTests(): void {
  testConfig = null;
}
```

- [x] **Step 5: Add route diagnostics**

In `packages/router/src/route/route-diagnostic-codes.ts`, add:

```ts
missingTitle: 'VR_ROUTE_MISSING_TITLE',
missingMetaDescription: 'VR_ROUTE_MISSING_META_DESCRIPTION',
invalidTitle: 'VR_ROUTE_INVALID_TITLE',
invalidMetaDescription: 'VR_ROUTE_INVALID_META_DESCRIPTION',
```

In `define-routes.ts`, validate route metadata after render target validation. Missing metadata should respect config levels. Invalid metadata should throw because it is a route authoring error.

- [x] **Step 6: Run metadata tests and router typecheck**

Run:

```sh
pnpm --filter @vanrot/router exec vitest run tests/route/define-routes-metadata.test.ts
pnpm --filter @vanrot/router exec tsc -p tests/tsconfig.json --noEmit
```

Expected: PASS.

## Task 4: Add Document Metadata Runtime Polish

**Files:**
- Create: `packages/router/src/route/navigation-polish.ts`
- Modify: `packages/router/src/route/router-state.ts`
- Test: `packages/router/tests/route/navigation-polish.test.ts`
- Test: `packages/router/tests/route/router-state-navigation-polish.test.ts`

- [x] **Step 1: Add failing document metadata tests**

Create tests proving:

```ts
expect(document.title).toBe('Button - Vanrot');
expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
  'Button docs.',
);
```

Also test guard-blocked and stale async navigation:

```ts
expect(document.title).toBe('Current Page');
await navigate('/blocked');
expect(document.title).toBe('Current Page');
```

- [x] **Step 2: Run tests and confirm they fail**

Run:

```sh
pnpm --filter @vanrot/router exec vitest run tests/route/navigation-polish.test.ts tests/route/router-state-navigation-polish.test.ts
```

Expected: FAIL because document metadata polish does not exist.

- [x] **Step 3: Implement metadata selection and browser adapter**

Create `packages/router/src/route/navigation-polish.ts` with functions:

```ts
export function applyDocumentMetadata(match: RouteChainMatch): void;
export function resolveDocumentTitle(match: RouteChainMatch): string | null;
export function resolveMetaDescription(match: RouteChainMatch): string | null;
export function resetNavigationPolishForTests(): void;
```

Rules:

- deepest route title wins
- parent title can fallback
- missing title falls back to leaf route label
- deepest description wins
- missing description leaves existing meta unchanged
- no DOM access when `globalThis.document` is undefined

- [x] **Step 4: Call document polish only after commit**

In `router-state.ts`, call `applyDocumentMetadata(decision.match)` after `commitRouteChain(decision.match)` and before returning `true`. Guard blocked, redirect loop, stale, and preload paths must not call it.

- [x] **Step 5: Run router tests**

Run:

```sh
pnpm --filter @vanrot/router test
```

Expected: PASS.

## Task 5: Add Scroll Restoration

**Files:**
- Modify: `packages/router/src/route/navigation-polish.ts`
- Modify: `packages/router/src/route/router-state.ts`
- Test: `packages/router/tests/route/router-scroll-restoration.test.ts`

- [x] **Step 1: Add failing scroll tests**

Create `packages/router/tests/route/router-scroll-restoration.test.ts` with jsdom-safe spies:

```ts
const scrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', { value: scrollTo, configurable: true });
Object.defineProperty(window, 'scrollY', { value: 480, configurable: true });

await navigate('/next');

expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
```

Add a popstate/back-forward test that records scroll for the previous path and restores it on popstate:

```ts
expect(scrollTo).toHaveBeenCalledWith({ top: 480, left: 0, behavior: 'auto' });
```

Add a hash-only test:

```ts
await navigate('/docs#button');
expect(scrollTo).not.toHaveBeenCalled();
```

- [x] **Step 2: Run scroll tests and confirm they fail**

Run:

```sh
pnpm --filter @vanrot/router exec vitest run tests/route/router-scroll-restoration.test.ts
```

Expected: FAIL because scroll snapshots and navigation source handling do not exist.

- [x] **Step 3: Track navigation source**

In `router-state.ts`, extend navigation options to include:

```ts
source: 'initial' | 'push' | 'replace' | 'popstate'
```

Use:

- `provideRouter(...)`: `source: 'initial'`
- `navigate(...)`: `source: 'push'`
- `popstate`: `source: 'popstate'`
- redirect recursion: preserve the original source

- [x] **Step 4: Implement scroll snapshots**

In `navigation-polish.ts`, store scroll by path before pushing a new route:

```ts
export function recordScrollPosition(path: string): void;
export function applyScrollPolish(input: {
  fromPath: string | null;
  toPath: string;
  source: NavigationSource;
}): void;
```

Rules:

- if scroll disabled, do nothing
- if source is `popstate`, restore stored position for `toPath`
- if target differs only by hash, do nothing
- otherwise scroll to top
- clear stored positions in `resetNavigationPolishForTests()`

- [x] **Step 5: Run scroll tests and router tests**

Run:

```sh
pnpm --filter @vanrot/router exec vitest run tests/route/router-scroll-restoration.test.ts
pnpm --filter @vanrot/router test
```

Expected: PASS.

## Task 6: Add Focus After View Mount

**Files:**
- Modify: `packages/router/src/route/navigation-polish.ts`
- Modify: `packages/router/src/dom/route-outlet.ts`
- Test: `packages/router/tests/dom/route-outlet-navigation-polish.test.ts`

- [x] **Step 1: Add failing focus tests**

Create `packages/router/tests/dom/route-outlet-navigation-polish.test.ts`:

```ts
it('focuses the first heading after navigation view mounts', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const dispose = createRouterOutlet(host, { kind: 'router' });

  await provideRouter(route);
  await navigate('/buttons');

  expect(document.activeElement?.textContent).toBe('Button');

  dispose();
});
```

Add lazy route coverage:

```ts
expect(document.activeElement).not.toBe(host);
resolveLazyPage();
await lazyNavigation;
expect(document.activeElement?.textContent).toBe('Lazy Button');
```

- [x] **Step 2: Run focus tests and confirm they fail**

Run:

```sh
pnpm --filter @vanrot/router exec vitest run tests/dom/route-outlet-navigation-polish.test.ts
```

Expected: FAIL because route outlet does not apply focus polish.

- [x] **Step 3: Implement focus helper**

In `navigation-polish.ts`, add:

```ts
export function focusRouteView(host: Element): void;
```

Target order:

1. `h1`
2. `[data-vr-route-view]`
3. outlet host

If the chosen element is not focusable, add `tabindex="-1"`, focus with `{ preventScroll: true }`, and remove only a framework-added temporary tabindex when safe.

- [x] **Step 4: Wire route outlet after mount and restore**

In `route-outlet.ts`, call focus and scroll view polish after:

- `host.replaceChildren(...restoredView.nodes)`
- `mountResolvedComponent(...)` completes mounting

Do not focus when the match is undefined or when a lazy component is still unresolved.

- [x] **Step 5: Run focus and outlet tests**

Run:

```sh
pnpm --filter @vanrot/router exec vitest run tests/dom/route-outlet-navigation-polish.test.ts tests/dom/route-outlet.test.ts
pnpm --filter @vanrot/router test
```

Expected: PASS.

## Task 7: Dogfood 15E In Vanrot Site

**Files:**
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/vanrot.config.ts`
- Test: `apps/vanrot-site/tests/site-workspace.test.ts`

- [x] **Step 1: Add failing site metadata test**

Add a site test that imports `route` and checks every public docs/component route has a `title`:

```ts
const siteRoutes = Object.values(route);
const visibleRoutes = siteRoutes.filter((item) => item.kind !== 'redirect');

expect(visibleRoutes.every((item) => typeof item.title === 'string' && item.title.length > 0)).toBe(true);
```

- [x] **Step 2: Run site test and confirm it fails**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- site-workspace.test.ts
```

Expected: FAIL because route titles are not present yet.

- [x] **Step 3: Add site route titles and descriptions**

In `apps/vanrot-site/src/routes.ts`, add a small local source of truth:

```ts
const siteTitleSuffix = ' - Vanrot';

function pageTitle(label: string): string {
  return `${label}${siteTitleSuffix}`;
}
```

Use route-owned metadata on site pages:

```ts
title: pageTitle('Button'),
meta: {
  description: 'Button variants, usage, and accessibility guidance for Vanrot UI.',
},
```

Keep strings in `routes.ts`; do not move titles into page components.

- [x] **Step 4: Keep site config explicit**

In `apps/vanrot-site/vanrot.config.ts`, add:

```ts
router: {
  navigationPolish: {
    title: true,
    meta: true,
    scroll: true,
    focus: true,
  },
  diagnostics: {
    missingTitle: 'warn',
    missingMetaDescription: 'warn',
  },
},
```

- [x] **Step 5: Run site tests and typecheck**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test
pnpm --filter @vanrot/vanrot-site typecheck
```

Expected: PASS.

## Task 8: Update Docs And Maturity State After Implementation

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/plans/Phase-15.md`
- Modify: `docs/superpowers/plans/Phase-15E.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `apps/vanrot-site/src/docs/site-data.json` if the reference page lists router diagnostics

- [x] **Step 1: Update final TDD inventory**

Add entries for:

- route `title`
- route `meta.description`
- router navigation polish config
- Vite define injection
- document title/meta updates
- scroll restoration
- focus restoration
- metadata diagnostics
- site dogfood metadata

- [x] **Step 2: Mark Phase 15E plan tasks complete**

After implementation and verification pass, tick every completed checkbox in this file.

- [x] **Step 3: Mark Phase 15 complete again**

In `docs/superpowers/feature-maturity.md`, change the Phase 15 roadmap row back to `[x]` only after tests pass and the router navigation polish row is no longer `Planned`.

Set the `Router navigation polish` row status to `Production-Ready` with notes naming Phase 15E.

- [x] **Step 4: Update presentation roadmap**

In `docs/vanrot-presentation.html`, mark Phase 15 `done`, Phase 16 `active-phase`, and update the status text so Phase 16E is next again after 15E is complete.

- [x] **Step 5: Run phase docs verification**

Run:

```sh
pnpm verify:phase-docs
```

Expected: PASS.

## Task 9: Final Verification

**Files:**
- All files changed by Tasks 1-8.

- [x] **Step 1: Run focused package checks**

Run:

```sh
pnpm --filter @vanrot/config test
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/router test
pnpm --filter @vanrot/router exec tsc -p tests/tsconfig.json --noEmit
pnpm --filter @vanrot/vanrot-site test
pnpm --filter @vanrot/vanrot-site typecheck
```

Expected: PASS.

- [x] **Step 2: Run full repository verification**

Run:

```sh
pnpm verify
```

Expected: PASS, including typecheck, tests, builds, size limit, phase docs, and site docs.

- [x] **Step 3: Restart Vanrot site dev server if site files changed**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 3000" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 3000
```

Expected: dev server serves `http://localhost:3000`.

- [x] **Step 4: Verify the browser route responds**

Run:

```sh
curl -I -sS http://localhost:3000/docs/components/stacks
```

Expected: HTTP 200.

- [x] **Step 5: Inspect git status**

Run:

```sh
git status --short --branch
```

Expected: changed files are visible and unstaged. Do not run `git add`, `git commit`, or `git push` unless the user explicitly asks.
