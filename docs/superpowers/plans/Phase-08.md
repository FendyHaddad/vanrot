# Vanrot Router MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Phase 8 Router MVP with `@vanrot/router`, `src/routes.ts` as the single route source of truth, compiler support for `<vr-router>` and `<vr route.name />`, `.page.ts` compilation, and a router-enabled `vr create` starter.

**Architecture:** `@vanrot/router` is a separate workspace package that depends on `@vanrot/runtime`; the runtime does not depend on the router. The compiler lowers router template primitives into small `@vanrot/router/internal` helper calls, while the Vite plugin compiles both `.component.ts` and `.page.ts` role files. The CLI starter owns app routes in `src/routes.ts` and templates reference named route objects instead of repeating route path or label strings.

**Tech Stack:** TypeScript 5, Vitest 4, jsdom, pnpm workspaces, existing Vanrot runtime cleanup scopes and `mount()`, existing compiler code generation, existing Vite plugin virtual module pipeline, existing CLI template writer.

**Spec:** `docs/superpowers/specs/Phase-08.md`

---

## Prerequisites

Implementation happens on `main`; do not create a branch or worktree.

The user owns commits and pushes. Do not run:

```bash
git add
git commit
git push
```

Plan checkpoints replace commit steps. At each checkpoint, run the listed verification command and leave files unstaged for user review.

Before starting, verify the workspace state:

```bash
git status --short --branch
```

Expected planning state includes at least:

```txt
## main...origin/main
 M AGENTS.md
 M docs/brainstorm.md
 M docs/superpowers/feature-maturity.md
?? docs/superpowers/plans/Phase-08.md
?? docs/superpowers/specs/Phase-08.md
```

Leave unrelated local changes untouched.

---

## File Structure

Target files and responsibilities:

```txt
packages/router/
  package.json                                      - package metadata, scripts, exports
  tsconfig.json                                     - router TypeScript project
  src/
    index.ts                                       - public API exports
    internal.ts                                    - compiler-facing helpers
    route/
      route-types.ts                               - route input, normalized route, params, page module types
      define-routes.ts                             - preserve route keys and attach route metadata
      match-route.ts                               - static and :param path matching
      page-loader.ts                               - resolve page or loadPage records
      router-state.ts                              - provided routes, current match, params signal, navigation
    dom/
      route-link.ts                                - setup accessible link from a named route record
      route-outlet.ts                              - mount and destroy matched route pages
    test/
      test-pages.ts                                - tiny compiled page modules for tests
  tests/
    route/
      define-routes.test.ts                        - named route table behavior
      match-route.test.ts                          - static and :param matching
      page-loader.test.ts                          - eager and lazy page resolution
      router-state.test.ts                         - provideRouter, navigate, routeParams
    dom/
      route-link.test.ts                           - link label, href, conservative click handling
      route-outlet.test.ts                         - page mount, lazy load, destroy cleanup
    smoke.test.ts                                  - public exports

packages/compiler/
  src/api/types.ts                                 - add router feature names and route diagnostic code
  src/conventions/component-files.ts               - support `.component.ts` and `.page.ts`
  src/codegen/generate-component.ts                - emit router helper calls
  tests/conventions/component-files.test.ts        - page role resolution
  tests/codegen/generate-component.test.ts         - router primitive codegen tests

packages/vite-plugin/
  src/component-files.ts                           - transform `.component.ts` and `.page.ts`
  tests/component-files.test.ts                    - role file detection
  tests/plugin-transform.test.ts                   - `.page.ts` transform
  tests/fixtures/basic-app/                        - router-enabled fixture
  tests/plugin-build.test.ts                       - fixture build still emits JS and CSS

packages/cli/
  src/create/app-template.ts                       - router-enabled starter
  tests/create.test.ts                             - starter files and string-source rule

docs/
  brainstorm.md                                    - tick Phase 8 only after implementation verification
  vanrot-presentation.html                         - Phase 8 done and Phase 9 active after verification
  superpowers/
    feature-maturity.md                            - move verified Phase 8 router rows to Demo-Capable
    plans/Phase-08.md                              - mark completed tasks during implementation
```

Generated command output must not be committed:

```txt
.vanrot/project-map.json
.vanrot/ai-rules.md
examples/*/.vanrot/
```

---

## Stage 1 - Router Package Foundation

### Task 1: Add the `@vanrot/router` workspace package

**Files:**
- Create: `packages/router/package.json`
- Create: `packages/router/tsconfig.json`
- Create: `packages/router/src/index.ts`
- Create: `packages/router/tests/smoke.test.ts`
- Modify: `tsconfig.json`

- [x] **Step 1: Write the failing router smoke test**

Create `packages/router/tests/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { defineRoutes, provideRouter, routeParams } from '../src/index.js';

describe('@vanrot/router exports', () => {
  it('exports the public router API', () => {
    expect(defineRoutes).toEqual(expect.any(Function));
    expect(provideRouter).toEqual(expect.any(Function));
    expect(routeParams).toEqual(expect.any(Function));
  });
});
```

- [x] **Step 2: Run the router test to verify the package is missing**

Run:

```bash
pnpm --filter @vanrot/router test
```

Expected:

```txt
No projects matched the filters
```

- [x] **Step 3: Create the router package manifest**

Create `packages/router/package.json`:

```json
{
  "name": "@vanrot/router",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./internal": {
      "types": "./dist/internal.d.ts",
      "import": "./dist/internal.js"
    }
  },
  "files": [
    "dist"
  ],
  "dependencies": {
    "@vanrot/runtime": "workspace:*"
  },
  "scripts": {
    "prebuild": "pnpm --filter @vanrot/runtime build",
    "build": "tsc -p tsconfig.json",
    "pretypecheck": "pnpm --filter @vanrot/runtime build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "pretest": "pnpm --filter @vanrot/runtime build",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

- [x] **Step 4: Create the router TypeScript config**

Create `packages/router/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationDir": "dist",
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"],
  "references": [{ "path": "../runtime" }]
}
```

- [x] **Step 5: Add the root project reference**

Modify `tsconfig.json` so `references` includes router between runtime and compiler:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/runtime" },
    { "path": "./packages/router" },
    { "path": "./packages/compiler" },
    { "path": "./packages/vite-plugin" },
    { "path": "./packages/cli" }
  ]
}
```

- [x] **Step 6: Create temporary public API stubs**

Create `packages/router/src/index.ts`:

```ts
import type { Signal } from '@vanrot/runtime';

export type RouteParams = Record<string, string>;

export function defineRoutes<T extends Record<string, unknown>>(routes: T): T {
  return routes;
}

export function provideRouter(): void {}

export const routeParams = (() => ({})) as Signal<RouteParams>;
```

- [x] **Step 7: Run the router smoke test**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/smoke.test.ts
```

Expected:

```txt
PASS packages/router/tests/smoke.test.ts
```

- [x] **Checkpoint 1: Verify package wiring**

Run:

```bash
pnpm --filter @vanrot/router typecheck
pnpm --filter @vanrot/router test
git status --short --branch
```

Expected:

```txt
typecheck passes
router tests pass
router files are unstaged
```

Do not run `git add`, `git commit`, or `git push`.

---

## Stage 2 - Route Table And Matching

### Task 2: Implement named routes and path matching

**Files:**
- Create: `packages/router/src/route/route-types.ts`
- Create: `packages/router/src/route/define-routes.ts`
- Create: `packages/router/src/route/match-route.ts`
- Modify: `packages/router/src/index.ts`
- Test: `packages/router/tests/route/define-routes.test.ts`
- Test: `packages/router/tests/route/match-route.test.ts`

- [x] **Step 1: Write the failing named route tests**

Create `packages/router/tests/route/define-routes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { defineRoutes } from '../../src/route/define-routes.js';
import { createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  home: '/',
  user: '/users/:id',
} as const;

const routeLabel = {
  home: 'Home',
  user: 'User',
} as const;

describe('defineRoutes', () => {
  it('preserves named route keys on route records', () => {
    const route = defineRoutes({
      home: {
        path: routePath.home,
        label: routeLabel.home,
        page: createTestPage('home'),
      },
      user: {
        path: routePath.user,
        label: routeLabel.user,
        loadPage: async () => createTestPage('user'),
      },
    });

    expect(route.home.key).toBe('home');
    expect(route.home.path).toBe(routePath.home);
    expect(route.home.label).toBe(routeLabel.home);
    expect(route.user.key).toBe('user');
    expect(route.user.path).toBe(routePath.user);
    expect(route.user.label).toBe(routeLabel.user);
  });

  it('throws when a route is missing both page and loadPage', () => {
    expect(() =>
      defineRoutes({
        broken: {
          path: '/broken',
          label: 'Broken',
        },
      }),
    ).toThrow('Route "broken" must define page or loadPage.');
  });
});
```

- [x] **Step 2: Write the failing path matching tests**

Create `packages/router/tests/route/match-route.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { defineRoutes } from '../../src/route/define-routes.js';
import { matchRoute } from '../../src/route/match-route.js';
import { createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  home: '/',
  about: '/about',
  user: '/users/:id',
} as const;

const routeLabel = {
  home: 'Home',
  about: 'About',
  user: 'User',
} as const;

const route = defineRoutes({
  home: {
    path: routePath.home,
    label: routeLabel.home,
    page: createTestPage('home'),
  },
  about: {
    path: routePath.about,
    label: routeLabel.about,
    page: createTestPage('about'),
  },
  user: {
    path: routePath.user,
    label: routeLabel.user,
    page: createTestPage('user'),
  },
});

describe('matchRoute', () => {
  it('matches the root route', () => {
    expect(matchRoute(route, '/')).toMatchObject({
      route: { key: 'home' },
      params: {},
    });
  });

  it('matches static paths without query strings', () => {
    expect(matchRoute(route, '/about?tab=team')).toMatchObject({
      route: { key: 'about' },
      params: {},
    });
  });

  it('matches parameterized paths', () => {
    expect(matchRoute(route, '/users/42')).toMatchObject({
      route: { key: 'user' },
      params: { id: '42' },
    });
  });

  it('returns null for unknown paths', () => {
    expect(matchRoute(route, '/missing')).toBeNull();
  });
});
```

- [x] **Step 3: Add test page helpers**

Create `packages/router/src/test/test-pages.ts`:

```ts
import type { CompiledComponentModule } from '@vanrot/runtime';

export function createTestPage(name: string): CompiledComponentModule {
  return {
    createComponent() {
      const node = document.createElement('section');
      node.textContent = name;

      return {
        node,
        ctx: {},
      };
    },
  };
}
```

- [x] **Step 4: Run route tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes.test.ts tests/route/match-route.test.ts
```

Expected:

```txt
FAIL packages/router/tests/route/define-routes.test.ts
Cannot find module '../../src/route/define-routes.js'
```

- [x] **Step 5: Add route types**

Create `packages/router/src/route/route-types.ts`:

```ts
import type { CompiledComponentModule, Signal } from '@vanrot/runtime';

export type RouteParams = Record<string, string>;

export type RoutePageModule = CompiledComponentModule;

export type RoutePageLoader = () => Promise<RoutePageModule | { default: RoutePageModule }>;

export interface RouteDefinition {
  path: string;
  label: string;
  page?: RoutePageModule;
  loadPage?: RoutePageLoader;
}

export type RouteInput = Record<string, RouteDefinition>;

export type DefinedRoute<Key extends string = string> = RouteDefinition & {
  key: Key;
};

export type DefinedRouteTable<Input extends RouteInput = RouteInput> = {
  readonly [Key in keyof Input & string]: DefinedRoute<Key> & Input[Key];
};

export interface RouteMatch {
  route: DefinedRoute;
  params: RouteParams;
  path: string;
}

export type RouteParamsSignal = Signal<RouteParams>;
```

- [x] **Step 6: Implement `defineRoutes()`**

Create `packages/router/src/route/define-routes.ts`:

```ts
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
```

- [x] **Step 7: Implement path matching**

Create `packages/router/src/route/match-route.ts`:

```ts
import type { DefinedRoute, DefinedRouteTable, RouteMatch, RouteParams } from './route-types.js';

export function matchRoute(routes: DefinedRouteTable, path: string): RouteMatch | null {
  const normalizedPath = normalizePath(path);

  for (const route of Object.values(routes)) {
    const params = matchPath(route.path, normalizedPath);

    if (params === null) {
      continue;
    }

    return {
      route: route as DefinedRoute,
      params,
      path: normalizedPath,
    };
  }

  return null;
}

function matchPath(pattern: string, path: string): RouteParams | null {
  const patternParts = splitPath(pattern);
  const pathParts = splitPath(path);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: RouteParams = {};

  for (const [index, patternPart] of patternParts.entries()) {
    const pathPart = pathParts[index];

    if (pathPart === undefined) {
      return null;
    }

    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }

    if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

function splitPath(path: string): string[] {
  if (path === '/') {
    return [];
  }

  return path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
}

function normalizePath(path: string): string {
  const [pathname = '/'] = path.split('?');

  if (pathname.length === 0) {
    return '/';
  }

  if (pathname.startsWith('/')) {
    return pathname;
  }

  return `/${pathname}`;
}
```

- [x] **Step 8: Export the route API**

Replace `packages/router/src/index.ts` with:

```ts
export type {
  DefinedRoute,
  DefinedRouteTable,
  RouteDefinition,
  RouteInput,
  RouteMatch,
  RoutePageLoader,
  RoutePageModule,
  RouteParams,
  RouteParamsSignal,
} from './route/route-types.js';
export { defineRoutes } from './route/define-routes.js';
export { matchRoute } from './route/match-route.js';

export function provideRouter(): void {}

export const routeParams = (() => ({})) as import('./route/route-types.js').RouteParamsSignal;
```

- [x] **Step 9: Run route tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes.test.ts tests/route/match-route.test.ts
```

Expected:

```txt
PASS packages/router/tests/route/define-routes.test.ts
PASS packages/router/tests/route/match-route.test.ts
```

---

## Stage 3 - Router State, Navigation, And Params

### Task 3: Implement provided router state and lazy page resolution

**Files:**
- Create: `packages/router/src/route/page-loader.ts`
- Create: `packages/router/src/route/router-state.ts`
- Modify: `packages/router/src/index.ts`
- Test: `packages/router/tests/route/page-loader.test.ts`
- Test: `packages/router/tests/route/router-state.test.ts`

- [x] **Step 1: Write page loader tests**

Create `packages/router/tests/route/page-loader.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveRoutePage } from '../../src/route/page-loader.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('resolveRoutePage', () => {
  it('returns eager pages', async () => {
    const page = createTestPage('home');

    await expect(resolveRoutePage({ key: 'home', path: '/', label: 'Home', page })).resolves.toBe(page);
  });

  it('returns lazy default page modules', async () => {
    const page = createTestPage('about');

    await expect(
      resolveRoutePage({
        key: 'about',
        path: '/about',
        label: 'About',
        loadPage: async () => ({ default: page }),
      }),
    ).resolves.toBe(page);
  });

  it('returns lazy direct page modules', async () => {
    const page = createTestPage('settings');

    await expect(
      resolveRoutePage({
        key: 'settings',
        path: '/settings',
        label: 'Settings',
        loadPage: async () => page,
      }),
    ).resolves.toBe(page);
  });
});
```

- [x] **Step 2: Write router state tests**

Create `packages/router/tests/route/router-state.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { defineRoutes } from '../../src/route/define-routes.js';
import {
  getCurrentMatch,
  navigate,
  provideRouter,
  resetRouterForTests,
  routeParams,
} from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  home: '/',
  user: '/users/:id',
} as const;

const routeLabel = {
  home: 'Home',
  user: 'User',
} as const;

const route = defineRoutes({
  home: {
    path: routePath.home,
    label: routeLabel.home,
    page: createTestPage('home'),
  },
  user: {
    path: routePath.user,
    label: routeLabel.user,
    page: createTestPage('user'),
  },
});

describe('router state', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', routePath.home);
  });

  it('provides the initial route from the browser path', () => {
    provideRouter(route);

    expect(getCurrentMatch()).toMatchObject({
      route: { key: 'home' },
      params: {},
    });
    expect(routeParams()).toEqual({});
  });

  it('navigates and updates params', () => {
    provideRouter(route);
    navigate('/users/42');

    expect(getCurrentMatch()).toMatchObject({
      route: { key: 'user' },
      params: { id: '42' },
    });
    expect(routeParams()).toEqual({ id: '42' });
  });

  it('throws when no route matches', () => {
    provideRouter(route);

    expect(() => navigate('/missing')).toThrow('No Vanrot route matches "/missing".');
  });

  it('throws when navigation happens before provideRouter()', () => {
    expect(() => navigate(routePath.home)).toThrow('Call provideRouter() before using Vanrot router primitives.');
  });
});
```

- [x] **Step 3: Run the new tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/page-loader.test.ts tests/route/router-state.test.ts
```

Expected:

```txt
FAIL packages/router/tests/route/page-loader.test.ts
Cannot find module '../../src/route/page-loader.js'
```

- [x] **Step 4: Implement page resolution**

Create `packages/router/src/route/page-loader.ts`:

```ts
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
```

- [x] **Step 5: Implement router state**

Create `packages/router/src/route/router-state.ts`:

```ts
import { signal, type Signal } from '@vanrot/runtime';
import { matchRoute } from './match-route.js';
import type { DefinedRouteTable, RouteMatch, RouteParams } from './route-types.js';

const emptyParams: RouteParams = {};

let providedRoutes: DefinedRouteTable | null = null;
let removePopstateListener: (() => void) | null = null;

const currentMatch = signal<RouteMatch | null>(null);
const currentParams = signal<RouteParams>(emptyParams);

export const routeParams = currentParams as Signal<RouteParams>;

export function provideRouter(routes: DefinedRouteTable): void {
  providedRoutes = routes;
  removePopstateListener?.();
  removePopstateListener = listenForPopstate();
  setPath(readBrowserPath(), false);
}

export function navigate(path: string): void {
  setPath(path, true);
}

export function getCurrentMatch(): RouteMatch | null {
  return currentMatch();
}

export function resetRouterForTests(): void {
  providedRoutes = null;
  removePopstateListener?.();
  removePopstateListener = null;
  currentMatch.set(null);
  currentParams.set(emptyParams);
}

function setPath(path: string, push: boolean): void {
  const routes = requireProvidedRoutes();
  const match = matchRoute(routes, path);

  if (match === null) {
    throw new Error(`No Vanrot route matches "${path}".`);
  }

  if (push && globalThis.window !== undefined) {
    globalThis.window.history.pushState(null, '', match.path);
  }

  currentMatch.set(match);
  currentParams.set(match.params);
}

function requireProvidedRoutes(): DefinedRouteTable {
  if (providedRoutes !== null) {
    return providedRoutes;
  }

  throw new Error('Call provideRouter() before using Vanrot router primitives.');
}

function readBrowserPath(): string {
  if (globalThis.window === undefined) {
    return '/';
  }

  return globalThis.window.location.pathname;
}

function listenForPopstate(): (() => void) | null {
  if (globalThis.window === undefined) {
    return null;
  }

  const listener = (): void => {
    setPath(readBrowserPath(), false);
  };

  globalThis.window.addEventListener('popstate', listener);

  return () => globalThis.window.removeEventListener('popstate', listener);
}
```

- [x] **Step 6: Update public exports**

Replace `packages/router/src/index.ts` with:

```ts
export type {
  DefinedRoute,
  DefinedRouteTable,
  RouteDefinition,
  RouteInput,
  RouteMatch,
  RoutePageLoader,
  RoutePageModule,
  RouteParams,
  RouteParamsSignal,
} from './route/route-types.js';
export { defineRoutes } from './route/define-routes.js';
export { matchRoute } from './route/match-route.js';
export { resolveRoutePage } from './route/page-loader.js';
export { navigate, provideRouter, routeParams } from './route/router-state.js';
```

- [x] **Step 7: Run router route tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route
```

Expected:

```txt
PASS packages/router/tests/route/define-routes.test.ts
PASS packages/router/tests/route/match-route.test.ts
PASS packages/router/tests/route/page-loader.test.ts
PASS packages/router/tests/route/router-state.test.ts
```

---

## Stage 4 - DOM Helpers For Compiler Output

### Task 4: Add compiler-facing route link and outlet helpers

**Files:**
- Create: `packages/router/src/dom/route-link.ts`
- Create: `packages/router/src/dom/route-outlet.ts`
- Create: `packages/router/src/internal.ts`
- Test: `packages/router/tests/dom/route-link.test.ts`
- Test: `packages/router/tests/dom/route-outlet.test.ts`

- [x] **Step 1: Write route link tests**

Create `packages/router/tests/dom/route-link.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineRoutes } from '../../src/route/define-routes.js';
import { provideRouter, resetRouterForTests } from '../../src/route/router-state.js';
import { setupRouteLink } from '../../src/dom/route-link.js';
import { createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  home: '/',
  about: '/about',
  user: '/users/:id',
} as const;

const routeLabel = {
  home: 'Home',
  about: 'About',
  user: 'User',
} as const;

const route = defineRoutes({
  home: {
    path: routePath.home,
    label: routeLabel.home,
    page: createTestPage('home'),
  },
  about: {
    path: routePath.about,
    label: routeLabel.about,
    page: createTestPage('about'),
  },
  user: {
    path: routePath.user,
    label: routeLabel.user,
    page: createTestPage('user'),
  },
});

describe('setupRouteLink', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', routePath.home);
    provideRouter(route);
  });

  it('renders an accessible anchor from route metadata', () => {
    const anchor = document.createElement('a');

    setupRouteLink(anchor, route.about);

    expect(anchor.textContent).toBe(routeLabel.about);
    expect(anchor.getAttribute('href')).toBe(routePath.about);
  });

  it('navigates on normal same-origin left click', () => {
    const anchor = document.createElement('a');
    setupRouteLink(anchor, route.about);

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));

    expect(window.location.pathname).toBe(routePath.about);
  });

  it('lets modified clicks use browser behavior', () => {
    const anchor = document.createElement('a');
    setupRouteLink(anchor, route.about);

    anchor.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, metaKey: true }),
    );

    expect(window.location.pathname).toBe(routePath.home);
  });

  it('throws for parameterized route links until typed param links are designed', () => {
    const anchor = document.createElement('a');

    expect(() => setupRouteLink(anchor, route.user)).toThrow(
      'Route "user" requires params. Typed param links are deferred from Phase 8.',
    );
  });

  it('throws for missing route references', () => {
    const anchor = document.createElement('a');

    expect(() => setupRouteLink(anchor, undefined)).toThrow('Unknown Vanrot route reference.');
  });
});
```

- [x] **Step 2: Write route outlet tests**

Create `packages/router/tests/dom/route-outlet.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { onDestroy } from '@vanrot/runtime';
import { createRouterOutlet } from '../../src/dom/route-outlet.js';
import { defineRoutes } from '../../src/route/define-routes.js';
import { navigate, provideRouter, resetRouterForTests } from '../../src/route/router-state.js';

const routePath = {
  home: '/',
  about: '/about',
} as const;

const routeLabel = {
  home: 'Home',
  about: 'About',
} as const;

describe('createRouterOutlet', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', routePath.home);
  });

  it('mounts the current route page', async () => {
    const host = document.createElement('main');
    const route = defineRoutes({
      home: {
        path: routePath.home,
        label: routeLabel.home,
        page: pageWithText('Home page'),
      },
    });

    provideRouter(route);
    createRouterOutlet(host);
    await Promise.resolve();

    expect(host.textContent).toBe('Home page');
  });

  it('destroys the previous page before mounting the next one', async () => {
    const destroyed = vi.fn();
    const host = document.createElement('main');
    const route = defineRoutes({
      home: {
        path: routePath.home,
        label: routeLabel.home,
        page: pageWithDestroy('Home page', destroyed),
      },
      about: {
        path: routePath.about,
        label: routeLabel.about,
        loadPage: async () => pageWithText('About page'),
      },
    });

    provideRouter(route);
    createRouterOutlet(host);
    await Promise.resolve();
    navigate(routePath.about);
    await Promise.resolve();

    expect(destroyed).toHaveBeenCalledOnce();
    expect(host.textContent).toBe('About page');
  });
});

function pageWithText(text: string) {
  return {
    createComponent() {
      const node = document.createElement('section');
      node.textContent = text;

      return { node, ctx: {} };
    },
  };
}

function pageWithDestroy(text: string, destroyed: () => void) {
  return {
    createComponent() {
      onDestroy(destroyed);
      const node = document.createElement('section');
      node.textContent = text;

      return { node, ctx: {} };
    },
  };
}
```

- [x] **Step 3: Run DOM helper tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom
```

Expected:

```txt
FAIL packages/router/tests/dom/route-link.test.ts
Cannot find module '../../src/dom/route-link.js'
```

- [x] **Step 4: Implement route link setup**

Create `packages/router/src/dom/route-link.ts`:

```ts
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
```

- [x] **Step 5: Implement router outlet**

Create `packages/router/src/dom/route-outlet.ts`:

```ts
import { effect, mount, type AppHandle } from '@vanrot/runtime';
import { resolveRoutePage } from '../route/page-loader.js';
import { getCurrentMatch } from '../route/router-state.js';

export function createRouterOutlet(host: Element): void {
  let mountedPage: AppHandle | null = null;
  let version = 0;

  effect(() => {
    const match = getCurrentMatch();
    const currentVersion = ++version;

    mountedPage?.destroy();
    mountedPage = null;
    host.replaceChildren();

    if (match === null) {
      host.append(createRouterMessage('No route matched.'));
      return;
    }

    void resolveRoutePage(match.route)
      .then((page) => {
        if (currentVersion !== version) {
          return;
        }

        mountedPage = mount(page, host);
      })
      .catch((error: unknown) => {
        if (currentVersion !== version) {
          return;
        }

        host.replaceChildren(createRouterMessage(errorMessage(error)));
      });

    return () => {
      version += 1;
      mountedPage?.destroy();
      mountedPage = null;
      host.replaceChildren();
    };
  });
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
```

- [x] **Step 6: Export compiler-facing helpers**

Create `packages/router/src/internal.ts`:

```ts
// Internal APIs are compiler-facing and are not covered by public semver.

export { setupRouteLink } from './dom/route-link.js';
export { createRouterOutlet } from './dom/route-outlet.js';
```

- [x] **Step 7: Run router tests**

Run:

```bash
pnpm --filter @vanrot/router test
```

Expected:

```txt
PASS packages/router/tests/smoke.test.ts
PASS packages/router/tests/route/define-routes.test.ts
PASS packages/router/tests/route/match-route.test.ts
PASS packages/router/tests/route/page-loader.test.ts
PASS packages/router/tests/route/router-state.test.ts
PASS packages/router/tests/dom/route-link.test.ts
PASS packages/router/tests/dom/route-outlet.test.ts
```

- [x] **Checkpoint 2: Verify router package**

Run:

```bash
pnpm --filter @vanrot/router typecheck
pnpm --filter @vanrot/router test
git status --short --branch
```

Expected:

```txt
router typecheck passes
router tests pass
router changes are unstaged
```

---

## Stage 5 - Compiler Role And Router Primitive Support

### Task 5: Compile `.page.ts`, `<vr-router>`, and `<vr route.name />`

**Files:**
- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/conventions/component-files.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Test: `packages/compiler/tests/conventions/component-files.test.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`

- [x] **Step 1: Add failing `.page.ts` convention expectations**

Append this test to `packages/compiler/tests/conventions/component-files.test.ts`:

```ts
it('resolves page siblings and expected class names', async () => {
  const root = await createFixtureDirectory({
    'settings.page.ts': 'export class SettingsPage {}',
    'settings.page.html': '<p>Ready</p>',
    'settings.page.css': 'p { color: red; }',
  });

  await expect(resolveComponentFiles(join(root, 'settings.page.ts'))).resolves.toMatchObject({
    fileSet: {
      componentBaseName: 'settings',
      expectedClassName: 'SettingsPage',
      templatePath: join(root, 'settings.page.html'),
      stylePath: join(root, 'settings.page.css'),
    },
    diagnostics: [],
  });
});
```

Update the invalid suffix test so `counter.page.ts` is no longer invalid:

```ts
it('reports invalid component file suffixes', async () => {
  const root = await createFixtureDirectory({
    'counter.ts': '',
  });

  await expect(resolveComponentFiles(join(root, 'counter.ts'))).resolves.toMatchObject({
    fileSet: null,
    diagnostics: [{ code: 'VR003' }],
  });
});
```

- [x] **Step 2: Add failing router codegen expectations**

Append this test to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
it('generates router outlet and named route links', () => {
  const result = generateComponent({
    metadata,
    nodes: [
      {
        kind: 'element',
        tagName: 'main',
        attributes: [],
        children: [
          {
            kind: 'element',
            tagName: 'nav',
            attributes: [],
            children: [
              {
                kind: 'element',
                tagName: 'vr',
                attributes: [{ name: 'route.home', value: '' }],
                children: [],
              },
            ],
          },
          {
            kind: 'element',
            tagName: 'vr-router',
            attributes: [],
            children: [],
          },
        ],
      },
    ],
    scopeAttribute: 'data-vr-a1b2c3',
    templatePath: 'app.component.html',
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain(
    "import { createRouterOutlet, setupRouteLink } from '@vanrot/router/internal';",
  );
  expect(result.js).toContain("const a0 = document.createElement('a');");
  expect(result.js).toContain("a0.setAttribute('data-vr-a1b2c3', '');");
  expect(result.js).toContain('setupRouteLink(a0, ctx.route.home);');
  expect(result.js).toContain("const div0 = document.createElement('div');");
  expect(result.js).toContain('createRouterOutlet(div0);');
  expect(result.features).toContain('router-link');
  expect(result.features).toContain('router-outlet');
});
```

Append this diagnostic test:

```ts
it('diagnoses invalid router primitive syntax', () => {
  const result = generateComponent({
    metadata,
    nodes: [
      {
        kind: 'element',
        tagName: 'vr',
        attributes: [],
        children: [],
      },
    ],
    scopeAttribute: 'data-vr-a1b2c3',
    templatePath: 'app.component.html',
  });

  expect(result.diagnostics).toMatchObject([
    {
      code: 'VR009',
      message: 'Use <vr route.name /> for Vanrot route links.',
    },
  ]);
});
```

- [x] **Step 3: Run compiler tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/conventions/component-files.test.ts tests/codegen/generate-component.test.ts
```

Expected:

```txt
FAIL packages/compiler/tests/conventions/component-files.test.ts
expected diagnostics to equal []
```

- [x] **Step 4: Add router feature and diagnostic types**

Modify `packages/compiler/src/api/types.ts`:

```ts
export type DiagnosticCode =
  | 'VR001'
  | 'VR002'
  | 'VR003'
  | 'VR004'
  | 'VR005'
  | 'VR006'
  | 'VR007'
  | 'VR008'
  | 'VR009';
```

Update `CompileFeature`:

```ts
export type CompileFeature =
  | 'file-convention'
  | 'component-class'
  | 'text-interpolation'
  | 'event-binding'
  | 'property-binding'
  | 'scoped-css'
  | 'readable-output'
  | 'expression-rewriting'
  | 'router-outlet'
  | 'router-link';
```

- [x] **Step 5: Support role suffixes in file convention resolution**

Replace `packages/compiler/src/conventions/component-files.ts` with:

```ts
import { access } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { CompileDiagnostic } from '../api/types.js';

type ComponentRole = 'component' | 'page';

export interface ComponentFileSet {
  componentPath: string;
  templatePath: string;
  stylePath: string;
  componentBaseName: string;
  expectedClassName: string;
}

export interface ComponentFileResolution {
  fileSet: ComponentFileSet | null;
  diagnostics: CompileDiagnostic[];
}

export async function resolveComponentFiles(componentPath: string): Promise<ComponentFileResolution> {
  const fileSet = createComponentFileSet(componentPath);

  if (fileSet === null) {
    return {
      fileSet: null,
      diagnostics: [
        createDiagnostic(
          'VR003',
          'error',
          'Vanrot supports .component.ts and .page.ts role files.',
          componentPath,
        ),
      ],
    };
  }

  const diagnostics: CompileDiagnostic[] = [];

  if (!(await fileExists(fileSet.templatePath))) {
    diagnostics.push(
      createDiagnostic('VR001', 'error', 'Missing sibling component template file.', fileSet.templatePath),
    );
  }

  if (!(await fileExists(fileSet.stylePath))) {
    diagnostics.push(
      createDiagnostic('VR002', 'error', 'Missing sibling component style file.', fileSet.stylePath),
    );
  }

  return {
    fileSet,
    diagnostics,
  };
}

export function createComponentFileSet(componentPath: string): ComponentFileSet | null {
  const fileName = basename(componentPath);
  const role = resolveRole(fileName);

  if (role === null) {
    return null;
  }

  const suffix = `.${role}.ts`;
  const componentBaseName = fileName.slice(0, -suffix.length);

  if (componentBaseName.length === 0) {
    return null;
  }

  const root = dirname(componentPath);

  return {
    componentPath,
    templatePath: join(root, `${componentBaseName}.${role}.html`),
    stylePath: join(root, `${componentBaseName}.${role}.css`),
    componentBaseName,
    expectedClassName: `${toPascalCase(componentBaseName)}${toPascalCase(role)}`,
  };
}

function resolveRole(fileName: string): ComponentRole | null {
  if (fileName.endsWith('.component.ts')) {
    return 'component';
  }

  if (fileName.endsWith('.page.ts')) {
    return 'page';
  }

  return null;
}

function toPascalCase(value: string): string {
  return value
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join('');
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
```

- [x] **Step 6: Add router helper codegen state**

In `packages/compiler/src/codegen/generate-component.ts`, extend `GenerateState`:

```ts
interface GenerateState {
  ids: IdentifierAllocator;
  lines: string[];
  diagnostics: CompileDiagnostic[];
  features: Set<CompileFeature>;
  usesEffect: boolean;
  usesListen: boolean;
  usesRouterOutlet: boolean;
  usesRouteLink: boolean;
  templatePath: string;
}
```

Initialize the new fields in `generateComponent()`:

```ts
usesRouterOutlet: false,
usesRouteLink: false,
```

- [x] **Step 7: Emit router helper imports**

In `generateImports()`, add this block before returning:

```ts
const routerImports: string[] = [];

if (state.usesRouterOutlet) {
  routerImports.push('createRouterOutlet');
}

if (state.usesRouteLink) {
  routerImports.push('setupRouteLink');
}

if (routerImports.length > 0) {
  imports.push(`import { ${routerImports.join(', ')} } from '@vanrot/router/internal';`);
}
```

- [x] **Step 8: Generate router primitives before normal elements**

At the top of `generateElement()`, before creating a normal DOM element, add:

```ts
if (node.tagName === 'vr-router') {
  generateRouterOutlet(parentName, scopeAttribute, state);
  return;
}

if (node.tagName === 'vr') {
  generateRouterLink(node, parentName, scopeAttribute, state);
  return;
}
```

Add these helper functions near `generateElement()`:

```ts
function generateRouterOutlet(
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  const outletName = state.ids.next('div');

  state.usesRouterOutlet = true;
  state.features.add('router-outlet');
  state.lines.push(`  const ${outletName} = document.createElement('div');`);
  state.lines.push(`  ${outletName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  state.lines.push(`  createRouterOutlet(${outletName});`);
  state.lines.push(`  ${parentName}.append(${outletName});`);
}

function generateRouterLink(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  const routeAttribute = node.attributes.find((attribute) => /^route\.[A-Za-z_$][\w$]*$/.test(attribute.name));

  if (routeAttribute === undefined) {
    state.diagnostics.push(
      createDiagnostic('VR009', 'error', 'Use <vr route.name /> for Vanrot route links.', state.templatePath),
    );
    return;
  }

  const routeLinkName = state.ids.next('a');
  state.usesRouteLink = true;
  state.features.add('router-link');
  state.lines.push(`  const ${routeLinkName} = document.createElement('a');`);
  state.lines.push(`  ${routeLinkName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  state.lines.push(`  setupRouteLink(${routeLinkName}, ctx.${routeAttribute.name});`);
  state.lines.push(`  ${parentName}.append(${routeLinkName});`);
}
```

Add `createDiagnostic` to the import list at the top of the file:

```ts
import { createDiagnostic } from '../diagnostics/diagnostics.js';
```

- [x] **Step 9: Support self-closing `<vr route.name />` parsing**

During plan execution, verify that `parse5` treats custom `<vr route.home />` tags as normal non-void HTML elements. Add a parser regression in `packages/compiler/tests/template/parse-template.test.ts` for:

```html
<nav><vr route.home /><vr route.about /></nav><vr-router></vr-router>
```

Then update `packages/compiler/src/template/parse-template.ts` so only Vanrot route-link primitives are normalized before parsing:

```ts
function normalizeVanrotSelfClosingTags(templateSource: string): string {
  return templateSource.replace(
    /<vr(\s+route\.[A-Za-z_$][\w$]*)\s*\/>/g,
    '<vr$1></vr>',
  );
}
```

`parseTemplate()` should call this helper before `parseFragment()`. This preserves the approved `<vr route.name />` API without changing general HTML behavior.

- [x] **Step 10: Run focused compiler tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/conventions/component-files.test.ts tests/codegen/generate-component.test.ts tests/template/parse-template.test.ts
```

Expected:

```txt
PASS packages/compiler/tests/conventions/component-files.test.ts
PASS packages/compiler/tests/codegen/generate-component.test.ts
PASS packages/compiler/tests/template/parse-template.test.ts
```

- [x] **Checkpoint 3: Verify compiler package**

Run:

```bash
pnpm --filter @vanrot/compiler typecheck
pnpm --filter @vanrot/compiler test
git status --short --branch
```

Expected:

```txt
compiler typecheck passes
compiler tests pass
compiler changes are unstaged
```

---

## Stage 6 - Vite Plugin Role Support

### Task 6: Transform `.page.ts` files through Vite

**Files:**
- Modify: `packages/vite-plugin/src/component-files.ts`
- Modify: `packages/vite-plugin/tests/component-files.test.ts`
- Modify: `packages/vite-plugin/tests/plugin-transform.test.ts`

- [x] **Step 1: Add failing `.page.ts` Vite tests**

Append to `packages/vite-plugin/tests/component-files.test.ts`:

```ts
it('recognizes page entries', () => {
  expect(isComponentEntry('/repo/src/pages/home/home.page.ts')).toBe(true);
  expect(resolveComponentFiles('/repo/src/pages/home/home.page.ts')).toEqual({
    componentPath: '/repo/src/pages/home/home.page.ts',
    templatePath: '/repo/src/pages/home/home.page.html',
    stylePath: '/repo/src/pages/home/home.page.css',
  });
});
```

Append to `packages/vite-plugin/tests/plugin-transform.test.ts`:

```ts
it('transforms page entries and registers sibling files', async () => {
  const watched: string[] = [];
  const plugin = createVanrotPluginForTests({
    compile: async () => ({
      code: 'export function createComponent() { return { node: document.createTextNode("page"), ctx: {} }; }\nconst component = { createComponent };\nexport default component;',
      css: 'main{display:block}',
      diagnostics: [],
    }),
  });

  const result = await getTransformHook(plugin).call(
    {
      addWatchFile(filePath: string) {
        watched.push(filePath);
      },
      error(error: string) {
        throw new Error(error);
      },
      warn() {},
    } as never,
    'export class HomePage {}',
    '/repo/src/pages/home/home.page.ts',
  );

  expect(watched).toEqual([
    '/repo/src/pages/home/home.page.html',
    '/repo/src/pages/home/home.page.css',
  ]);
  expect(result).toEqual({
    code: expect.stringContaining('export default component;'),
    map: null,
  });
});
```

- [x] **Step 2: Run Vite plugin tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- tests/component-files.test.ts tests/plugin-transform.test.ts
```

Expected:

```txt
FAIL packages/vite-plugin/tests/component-files.test.ts
expected false to be true
```

- [x] **Step 3: Update Vite component file role detection**

Replace `packages/vite-plugin/src/component-files.ts` with:

```ts
export interface ComponentFiles {
  componentPath: string;
  templatePath: string;
  stylePath: string;
}

const roleSuffixes = ['component', 'page'] as const;

export function isComponentEntry(id: string): boolean {
  if (id.startsWith('virtual:vanrot-') || id.startsWith('\0vanrot:')) {
    return false;
  }

  return roleSuffixes.some((role) => cleanModuleId(id).endsWith(`.${role}.ts`));
}

export function resolveComponentFiles(componentPath: string): ComponentFiles {
  const cleanPath = cleanModuleId(componentPath);
  const role = roleSuffixes.find((candidate) => cleanPath.endsWith(`.${candidate}.ts`));

  if (role === undefined) {
    return {
      componentPath: cleanPath,
      templatePath: cleanPath,
      stylePath: cleanPath,
    };
  }

  return {
    componentPath: cleanPath,
    templatePath: cleanPath.replace(new RegExp(`\\.${role}\\.ts$`), `.${role}.html`),
    stylePath: cleanPath.replace(new RegExp(`\\.${role}\\.ts$`), `.${role}.css`),
  };
}

function cleanModuleId(id: string): string {
  return id.split('?')[0] ?? id;
}
```

- [x] **Step 4: Run focused Vite plugin tests**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- tests/component-files.test.ts tests/plugin-transform.test.ts
```

Expected:

```txt
PASS packages/vite-plugin/tests/component-files.test.ts
PASS packages/vite-plugin/tests/plugin-transform.test.ts
```

---

## Stage 7 - Router Build Fixture

### Task 7: Update the Vite fixture to prove lazy route pages build

**Files:**
- Modify: `packages/vite-plugin/package.json`
- Modify: `packages/vite-plugin/tests/fixtures/basic-app/package.json`
- Modify: `packages/vite-plugin/tests/fixtures/basic-app/src/main.ts`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/routes.ts`
- Move or replace: `packages/vite-plugin/tests/fixtures/basic-app/src/app.component.*`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/app/app.component.ts`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/app/app.component.html`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/app/app.component.css`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.ts`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.html`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.css`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/pages/about/about.page.ts`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/pages/about/about.page.html`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/pages/about/about.page.css`
- Test: `packages/vite-plugin/tests/plugin-build.test.ts`

- [x] **Step 1: Add router dependency to Vite plugin package**

Modify `packages/vite-plugin/package.json` dependencies:

```json
"dependencies": {
  "@vanrot/compiler": "workspace:*",
  "@vanrot/router": "workspace:*"
}
```

Update scripts that build dependencies:

```json
"prebuild": "pnpm --filter @vanrot/compiler build && pnpm --filter @vanrot/router build",
"pretypecheck": "pnpm --filter @vanrot/compiler build && pnpm --filter @vanrot/router build",
"pretest": "pnpm --filter @vanrot/compiler build && pnpm --filter @vanrot/router build"
```

- [x] **Step 2: Keep the fixture manifest install-clean**

Do not add local `file:` dependencies to `packages/vite-plugin/tests/fixtures/basic-app/package.json`.
That can reintroduce npm failures when linked workspace packages contain `workspace:*`
dependencies. Keep the fixture manifest free of workspace protocol dependencies and resolve
`@vanrot/router` through the Vite plugin package workspace dependency instead.

`packages/vite-plugin/tests/fixture-package.test.ts` remains the guard that this fixture does not
declare `workspace:*` dependencies.

- [x] **Step 3: Replace fixture `main.ts`**

Replace `packages/vite-plugin/tests/fixtures/basic-app/src/main.ts`:

```ts
import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
// @ts-expect-error Vanrot's Vite plugin compiles component modules to default exports.
import App from './app/app.component.ts';
import { route as appRoute } from './routes.ts';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing app target.');
}

provideRouter(appRoute);
mount(App, target);
```

- [x] **Step 4: Add fixture routes**

Create `packages/vite-plugin/tests/fixtures/basic-app/src/routes.ts`:

```ts
import { defineRoutes } from '@vanrot/router';
// @ts-expect-error Vanrot's Vite plugin compiles page modules to default exports.
import HomePage from './pages/home/home.page.ts';

export const route = defineRoutes({
  home: {
    path: '/',
    label: 'Home',
    page: HomePage,
  },
  about: {
    path: '/about',
    label: 'About',
    loadPage: () => import('./pages/about/about.page.ts'),
  },
});
```

- [x] **Step 5: Add fixture app shell files**

Create `packages/vite-plugin/tests/fixtures/basic-app/src/app/app.component.ts`:

```ts
import { route as appRoute } from '../routes.ts';

export class AppComponent {
  route = appRoute;
}
```

Create `packages/vite-plugin/tests/fixtures/basic-app/src/app/app.component.html`:

```html
<main class="app">
  <nav class="nav">
    <vr route.home />
    <vr route.about />
  </nav>

  <vr-router></vr-router>
</main>
```

Create `packages/vite-plugin/tests/fixtures/basic-app/src/app/app.component.css`:

```css
.app {
  display: grid;
  gap: 16px;
}

.nav {
  display: flex;
  gap: 12px;
}
```

- [x] **Step 6: Add fixture page files**

Create `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.ts`:

```ts
const homeCopy = {
  title: 'Home route',
};

export class HomePage {
  copy = homeCopy;
}
```

Create `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.html`:

```html
<section class="home">
  <h1>{{ copy.title }}</h1>
</section>
```

Create `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.css`:

```css
.home {
  display: block;
}
```

Create `packages/vite-plugin/tests/fixtures/basic-app/src/pages/about/about.page.ts`:

```ts
const aboutCopy = {
  title: 'About route',
};

export class AboutPage {
  copy = aboutCopy;
}
```

Create `packages/vite-plugin/tests/fixtures/basic-app/src/pages/about/about.page.html`:

```html
<section class="about">
  <h1>{{ copy.title }}</h1>
</section>
```

Create `packages/vite-plugin/tests/fixtures/basic-app/src/pages/about/about.page.css`:

```css
.about {
  display: block;
}
```

- [x] **Step 7: Remove old flat fixture app component files**

Delete these old fixture files after the new app shell exists:

```txt
packages/vite-plugin/tests/fixtures/basic-app/src/app.component.ts
packages/vite-plugin/tests/fixtures/basic-app/src/app.component.html
packages/vite-plugin/tests/fixtures/basic-app/src/app.component.css
```

- [x] **Step 8: Run fixture package guard and build test**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- tests/fixture-package.test.ts tests/plugin-build.test.ts
```

Expected:

```txt
PASS packages/vite-plugin/tests/fixture-package.test.ts
PASS packages/vite-plugin/tests/plugin-build.test.ts
```

- [x] **Checkpoint 4: Verify Vite plugin**

Run:

```bash
pnpm --filter @vanrot/vite-plugin typecheck
pnpm --filter @vanrot/vite-plugin test
git status --short --branch
```

Expected:

```txt
vite-plugin typecheck passes
vite-plugin tests pass
vite-plugin changes are unstaged
```

---

## Stage 8 - Router-Enabled CLI Starter

### Task 8: Update `vr create` to generate a routed app by default

**Files:**
- Modify: `packages/cli/src/create/app-template.ts`
- Modify: `packages/cli/tests/create.test.ts`

- [x] **Step 1: Add failing starter expectations**

Update `packages/cli/tests/create.test.ts` inside `creates a router-enabled Vanrot app` to assert router files:

```ts
await expect(readFile(join(cwd, 'demo-app', 'package.json'), 'utf8')).resolves.toContain(
  '"@vanrot/router": "^0.1.0"',
);
await expect(readFile(join(cwd, 'demo-app', 'src', 'routes.ts'), 'utf8')).resolves.toContain(
  'defineRoutes',
);
await expect(
  readFile(join(cwd, 'demo-app', 'src', 'app', 'app.component.ts'), 'utf8'),
).resolves.toContain('route = appRoute');
await expect(
  readFile(join(cwd, 'demo-app', 'src', 'app', 'app.component.html'), 'utf8'),
).resolves.toContain('<vr route.home />');
await expect(
  readFile(join(cwd, 'demo-app', 'src', 'app', 'app.component.html'), 'utf8'),
).resolves.toContain('<vr-router></vr-router>');
await expect(
  readFile(join(cwd, 'demo-app', 'src', 'pages', 'home', 'home.page.ts'), 'utf8'),
).resolves.toContain('export class HomePage');
await expect(
  readFile(join(cwd, 'demo-app', 'src', 'pages', 'about', 'about.page.ts'), 'utf8'),
).resolves.toContain('export class AboutPage');
```

Update the workspace dependency test:

```ts
expect(packageJson).toContain('"@vanrot/router": "workspace:*"');
```

Add this test to enforce the route string rule:

```ts
it('keeps starter route paths and labels in routes.ts', async () => {
  const cwd = await tempRoot();
  const reporter = createMemoryReporter();

  const result = await runCli(['create', 'routed-app'], { cwd, reporter });

  expect(result.exitCode).toBe(0);
  const routes = await readFile(join(cwd, 'routed-app', 'src', 'routes.ts'), 'utf8');
  const shellHtml = await readFile(
    join(cwd, 'routed-app', 'src', 'app', 'app.component.html'),
    'utf8',
  );

  expect(routes).toContain("path: '/'");
  expect(routes).toContain("label: 'Home'");
  expect(routes).toContain("path: '/about'");
  expect(routes).toContain("label: 'About'");
  expect(shellHtml).toContain('<vr route.home />');
  expect(shellHtml).toContain('<vr route.about />');
  expect(shellHtml).not.toContain('href="/');
  expect(shellHtml).not.toContain('>Home<');
  expect(shellHtml).not.toContain('>About<');
});
```

- [x] **Step 2: Run CLI create tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected:

```txt
FAIL packages/cli/tests/create.test.ts
expected package.json to contain "@vanrot/router"
```

- [x] **Step 3: Update app template dependencies and main**

In `packages/cli/src/create/app-template.ts`, add router dependency in generated `package.json`:

```ts
dependencies: {
  '@vanrot/runtime': dependencyVersion,
  '@vanrot/router': dependencyVersion,
},
```

Replace the generated `src/main.ts` template with:

```ts
{
  path: 'src/main.ts',
  content: `import { mount } from '@vanrot/runtime';\nimport { provideRouter } from '@vanrot/router';\n// @ts-expect-error Vanrot's Vite plugin compiles component modules to default exports.\nimport App from './app/app.component.ts';\nimport { route as appRoute } from './routes.ts';\n\nconst target = document.getElementById('app');\n\nif (target === null) {\n  throw new Error('Missing #app mount target.');\n}\n\nprovideRouter(appRoute);\nmount(App, target);\n`,
},
```

- [x] **Step 4: Add generated `routes.ts`**

Add this template entry:

```ts
{
  path: 'src/routes.ts',
  content: `import { defineRoutes } from '@vanrot/router';\n// @ts-expect-error Vanrot's Vite plugin compiles page modules to default exports.\nimport HomePage from './pages/home/home.page.ts';\n\nexport const route = defineRoutes({\n  home: {\n    path: '/',\n    label: 'Home',\n    page: HomePage,\n  },\n  about: {\n    path: '/about',\n    label: 'About',\n    loadPage: () => import('./pages/about/about.page.ts'),\n  },\n});\n`,
},
```

- [x] **Step 5: Replace generated app shell**

Replace the existing `src/app/app.component.ts` entry:

```ts
{
  path: 'src/app/app.component.ts',
  content: `import { route as appRoute } from '../routes.ts';\n\nexport class AppComponent {\n  route = appRoute;\n}\n`,
},
```

Replace `src/app/app.component.html`:

```ts
{
  path: 'src/app/app.component.html',
  content: `<main class="app">\n  <nav class="app-nav">\n    <vr route.home />\n    <vr route.about />\n  </nav>\n\n  <vr-router></vr-router>\n</main>\n`,
},
```

Replace `src/app/app.component.css`:

```ts
{
  path: 'src/app/app.component.css',
  content: `.app {\n  display: grid;\n  gap: 24px;\n  padding: 32px;\n  font-family: system-ui, sans-serif;\n}\n\n.app-nav {\n  display: flex;\n  gap: 12px;\n}\n`,
},
```

- [x] **Step 6: Add generated home and about pages**

Add these template entries. Implementation keeps page markup and page copy in HTML so the starter also follows the Vanrot rule that UI belongs in templates, while route labels remain centralized in `src/routes.ts`:

```ts
{
  path: 'src/pages/home/home.page.ts',
  content: `export class HomePage {}\n`,
},
{
  path: 'src/pages/home/home.page.html',
  content: `<section class="page">\n  <h1>Build with Vanrot</h1>\n  <p>Start with named routes, page files, and a small runtime foundation.</p>\n</section>\n`,
},
{
  path: 'src/pages/home/home.page.css',
  content: `.page {\n  display: grid;\n  gap: 12px;\n}\n`,
},
{
  path: 'src/pages/about/about.page.ts',
  content: `export class AboutPage {}\n`,
},
{
  path: 'src/pages/about/about.page.html',
  content: `<section class="page">\n  <h1>About this app</h1>\n  <p>This page is lazy loaded through the route table.</p>\n</section>\n`,
},
{
  path: 'src/pages/about/about.page.css',
  content: `.page {\n  display: grid;\n  gap: 12px;\n}\n`,
},
```

- [x] **Step 7: Run CLI create tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected:

```txt
PASS packages/cli/tests/create.test.ts
```

- [x] **Checkpoint 5: Verify CLI package**

Run:

```bash
pnpm --filter @vanrot/cli typecheck
pnpm --filter @vanrot/cli test
git status --short --branch
```

Expected:

```txt
cli typecheck passes
cli tests pass
cli changes are unstaged
```

---

## Stage 9 - Generated App Workflow Verification

### Task 9: Prove the routed starter builds through `vr`

**Files:**
- Modify: `packages/cli/src/process/runner.ts` if this workflow reveals a local binary resolution bug.
- Create: `packages/cli/tests/process-runner.test.ts` if runner behavior needs coverage.

- [x] **Step 1: Build workspace packages needed by the CLI**

Run:

```bash
pnpm --filter @vanrot/runtime build
pnpm --filter @vanrot/router build
pnpm --filter @vanrot/compiler build
pnpm --filter @vanrot/vite-plugin build
pnpm --filter @vanrot/cli build
```

Expected:

```txt
each build exits with code 0
```

- [x] **Step 2: Create a temporary routed app inside the workspace**

Run:

```bash
cd /Users/user/IdeaProjects/vanrot/apps
node /Users/user/IdeaProjects/vanrot/packages/cli/dist/bin.js create phase-8-app --workspace
cd phase-8-app
pnpm install --no-lockfile
node /Users/user/IdeaProjects/vanrot/packages/cli/dist/bin.js build
```

Expected:

```txt
Created phase-8-app
workspace dependencies link without adding a generated app to pnpm-lock.yaml
vite build completes
dist/assets contains JavaScript and CSS assets
```

Implementation note: this workflow exposed that direct `node packages/cli/dist/bin.js build` could not find the generated app's local `vite` binary. The root cause was the process runner not prepending `cwd/node_modules/.bin` to `PATH`. A failing `process-runner.test.ts` was added first, then `createNodeProcessRunner()` was fixed to include the project-local binary directory.

- [x] **Step 3: Verify the generated app route string rule**

Run from the temporary app:

```bash
grep -R "href=\"/" src/app src/pages && exit 1 || true
grep -R "<vr route.home />" src/app/app.component.html
grep -R "<vr route.about />" src/app/app.component.html
```

Expected:

```txt
no href="/..." literals under src/app or src/pages
<vr route.home /> is found
<vr route.about /> is found
```

- [x] **Step 4: Clean the temporary app**

Run:

```bash
cd /Users/user/IdeaProjects/vanrot
rm -rf apps/phase-8-app
```

Expected:

```txt
temporary app is removed
git status does not show generated app files
```

---

## Stage 10 - Phase Completion Docs

### Task 10: Mark Phase 8 complete after verification passes

**Files:**
- Modify: `docs/brainstorm.md`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/plans/Phase-08.md`
- Modify: `docs/vanrot-presentation.html`

- [x] **Step 1: Run full verification before touching completion docs**

Run:

```bash
pnpm verify
```

Expected:

```txt
typecheck passes
tests pass
build passes
runtime size passes
phase docs pass
```

Do not mark Phase 8 complete if this command fails.

- [x] **Step 2: Tick Phase 8 in brainstorm**

In `docs/brainstorm.md`, change the Phase 8 row from:

```md
| [ ] | Phase 8 - Router MVP | `@vanrot/router` with `src/routes.ts`, named route config, `<vr-router>`, `<vr route.name />`, params, and lazy `loadPage`. | A generated app can navigate between pages using first-party routing without repeating route path or label strings in templates. |
```

to:

```md
| [x] | Phase 8 - Router MVP | `@vanrot/router` with `src/routes.ts`, named route config, `<vr-router>`, `<vr route.name />`, params, and lazy `loadPage`. | A generated app can navigate between pages using first-party routing without repeating route path or label strings in templates. |
```

- [x] **Step 3: Move verified Phase 8 maturity rows to Demo-Capable**

In `docs/superpowers/feature-maturity.md`, change these Phase 8 router rows from `Planned` to `Demo-Capable` only after implementation verification passes:

```txt
Router named route config
Router route outlet `<vr-router>`
Router named route primitive `<vr route.name />`
Router route params
Router lazy `loadPage`
Router `.page.ts` compilation
```

Keep these rows `Deferred`:

```txt
Router query string API
Router nested routes and layouts
Router guards
Router preloading
Router active links and custom labels
Router typed param-link generation
Router route diagnostics
CLI `vr dev` localhost experience
Designed starter welcome page
```

- [x] **Step 4: Update the roadmap slide**

In `docs/vanrot-presentation.html`, update the roadmap so:

```txt
Phase 8 card has class `phase-card done`
Phase 9 card has class `phase-card active-phase`
Done label says `Done: Phases 0-8`
Active label says `Active: Phase 9 (UI & Tokens MVP)`
Queued label says `Queued: Phases 10-11`
```

Use the existing slide structure and only change the roadmap state text/classes.

- [x] **Step 5: Mark this plan's completed tasks**

In `docs/superpowers/plans/Phase-08.md`, change every completed task checkbox from:

```md
unchecked Step checkbox
```

to:

```md
- [x] **Step
```

Do this only for steps actually completed and verified.

- [x] **Step 6: Run phase docs verification**

Run:

```bash
pnpm verify:phase-docs
```

Expected:

```txt
Phase documentation verification passed.
```

- [x] **Step 7: Run final full verification**

Run:

```bash
pnpm verify
```

Expected:

```txt
typecheck passes
tests pass
build passes
runtime size passes
phase docs pass
```

- [x] **Step 8: Final status check**

Run:

```bash
git status --short --branch
```

Expected:

```txt
## main...origin/main
 M AGENTS.md
 M docs/brainstorm.md
 M docs/superpowers/feature-maturity.md
 M docs/superpowers/plans/Phase-08.md
 M docs/vanrot-presentation.html
 M packages/cli/src/create/app-template.ts
 M packages/cli/tests/create.test.ts
 M packages/compiler/src/api/types.ts
 M packages/compiler/src/codegen/generate-component.ts
 M packages/compiler/src/conventions/component-files.ts
 M packages/compiler/tests/codegen/generate-component.test.ts
 M packages/compiler/tests/conventions/component-files.test.ts
 M packages/vite-plugin/package.json
 M packages/vite-plugin/src/component-files.ts
 M packages/vite-plugin/tests/component-files.test.ts
 M packages/vite-plugin/tests/fixture-package.test.ts
 M packages/vite-plugin/tests/fixtures/basic-app/package.json
 M packages/vite-plugin/tests/fixtures/basic-app/src/main.ts
 M packages/vite-plugin/tests/plugin-build.test.ts
 M packages/vite-plugin/tests/plugin-transform.test.ts
 M tsconfig.json
?? docs/superpowers/specs/Phase-08.md
?? packages/router/
?? packages/vite-plugin/tests/fixtures/basic-app/src/app/
?? packages/vite-plugin/tests/fixtures/basic-app/src/pages/
?? packages/vite-plugin/tests/fixtures/basic-app/src/routes.ts
```

The exact status can include additional modified files from earlier user-owned work. Do not revert user-owned changes.

---

## Final Verification Matrix

Run these commands before claiming Phase 8 is complete:

```bash
pnpm --filter @vanrot/router typecheck
pnpm --filter @vanrot/router test
pnpm --filter @vanrot/compiler typecheck
pnpm --filter @vanrot/compiler test
pnpm --filter @vanrot/vite-plugin typecheck
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/cli typecheck
pnpm --filter @vanrot/cli test
pnpm verify
```

Expected:

```txt
all commands exit with code 0
```

Final response must include:

```txt
changed files
verification commands and results
git status --short --branch
confirmation that no branch, worktree, stage, commit, or push was created
```
