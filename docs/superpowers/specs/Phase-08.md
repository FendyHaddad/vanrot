# Vanrot Router MVP Design

**Date:** 2026-05-22
**Phase:** Phase 8 - Router MVP
**Packages:** `@vanrot/router`, `@vanrot/compiler`, `@vanrot/vite-plugin`, `@vanrot/cli`
**Status:** Draft for review
**Related:**
- `docs/brainstorm.md`
- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/specs/Phase-03.md`
- `docs/superpowers/specs/Phase-04.md`
- `docs/superpowers/specs/Phase-05.md`
- `docs/superpowers/specs/Phase-07.md`

---

## 1. Goal

Phase 8 adds Vanrot's first-party router.

The router should feel familiar to Angular developers while staying lightweight and compiler-first:

```txt
Angular-style route ownership
+
Vanrot role-based pages
+
Svelte-like lazy route output
+
tiny runtime helpers
```

The milestone is successful when a generated Vanrot app uses `@vanrot/router` by default, defines routes in `src/routes.ts`, renders navigation with named route references, and navigates between pages through the first-party router.

---

## 2. Core Decision

Phase 8 uses a compiler-aware router MVP.

The public template API is:

```html
<nav>
  <vr route.home />
  <vr route.about />
</nav>

<vr-router></vr-router>
```

The route config API is:

```ts
import { defineRoutes } from '@vanrot/router';
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
  user: {
    path: '/users/:id',
    label: 'User',
    loadPage: () => import('./pages/user/user.page.ts'),
  },
});
```

The app shell imports the route table once and exposes it to the template:

```ts
import { route as appRoute } from '../routes.ts';

export class AppComponent {
  route = appRoute;
}
```

This keeps route strings and route labels in one source of truth while allowing templates to read naturally.

---

## 3. Source Of Truth Rule

Route paths and generated route labels must live in `src/routes.ts`.

Vanrot-authored templates should not repeat route path strings or route label strings:

```html
<vr route.home />
```

instead of:

```html
<a vr-link="/about">About</a>
```

The string literals in `src/routes.ts` are acceptable because `routes.ts` is the owning source-of-truth boundary.

Generated code may include internal string values when needed, but user-facing Vanrot code should avoid reused string literals and reference named route objects instead.

This rule belongs to Vanrot's broader cleanliness model:

```txt
route paths live in routes.ts
route labels live in routes.ts for generated links
templates reference route objects
pages read route state through router APIs
```

---

## 4. Public API

Phase 8 owns these public exports from `@vanrot/router`:

```ts
defineRoutes()
provideRouter()
routeParams
```

`defineRoutes()` preserves named route keys and normalizes route records.

`provideRouter(route)` registers the app route table before the root component is mounted.

`routeParams` exposes matched route params as a signal-style read:

```ts
import { routeParams } from '@vanrot/router';

export class UserPage {
  params = routeParams;
}
```

Page templates can read params through existing interpolation support:

```html
<p>{{ params().id }}</p>
```

Phase 8 supports route records with:

```ts
page
loadPage
path
label
```

`page` is useful for root or tiny routes. `loadPage` is the recommended default for non-root pages so route pages become natural bundle boundaries.

Both `page` and `loadPage` accept compiled Vanrot page or component modules. The recommended role suffix for route-owned screens is `.page.ts`, but `.component.ts` is allowed when a reusable component is intentionally mounted as a route page.

---

## 5. Generated App Shape

`vr create` should include routing by default after Phase 8.

Required generated shape:

```txt
src/
  main.ts
  routes.ts
  app/
    app.component.ts
    app.component.html
    app.component.css
  pages/
    home/
      home.page.ts
      home.page.html
      home.page.css
    about/
      about.page.ts
      about.page.html
      about.page.css
```

`src/main.ts` wires the router once:

```ts
import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
import App from './app/app.component.ts';
import { route as appRoute } from './routes.ts';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

provideRouter(appRoute);
mount(App, target);
```

`src/app/app.component.html` owns the shell and route outlet:

```html
<main class="app">
  <nav>
    <vr route.home />
    <vr route.about />
  </nav>

  <vr-router></vr-router>
</main>
```

The generated starter should not copy route path strings or route labels into templates.

---

## 6. Compiler And Vite Behavior

Phase 8 extends Vanrot's compiler-aware role conventions:

```txt
.component.ts
.page.ts
```

`.page.ts` files compile through the same component contract as `.component.ts` files:

```ts
createComponent()
```

The compiler recognizes two router primitives:

```html
<vr-router></vr-router>
<vr route.home />
```

`<vr-router>` emits a router outlet helper call.

`<vr route.home />` emits a route link helper call. The route expression is resolved from component context, so the app shell can expose the imported `route` object instead of duplicating strings.

The generated DOM for route links should be accessible anchor behavior, not a custom clickable div.

Vite must transform `.page.ts` files through the Vanrot plugin so eager and lazy route pages both compile correctly.

---

## 7. Runtime Behavior

At startup:

```txt
provideRouter(route)
mount(App, target)
```

The router owns reactive state for:

```txt
current path
matched route
params
active page module
```

The outlet subscribes to router state and mounts the matched page.

When navigation changes, the outlet destroys the previous page before mounting the next page so cleanup scopes continue to work.

Route matching supports:

```txt
/
static paths such as /about
param paths such as /users/:id
```

Link navigation should be conservative and browser-friendly. The router intercepts normal same-origin left-clicks only. It must let the browser handle:

```txt
modifier-key clicks
middle clicks
new-tab behavior
download links
external links
target attributes
```

If a lazy page import fails, the outlet may render a small framework-owned error node for the demo and report a clear error message. Custom route error pages remain deferred.

---

## 8. Non-Goals

Phase 8 must not implement:

```txt
query string API
nested routes
layouts
guards
preloading
route data loaders
scroll restoration
active link state
custom route-link labels
typed param-link generation
route transition animations
route graph diagnostics
production route diagnostics
designed localhost welcome page
production `vr dev` terminal and browser experience
```

These are production-readiness tracks and must stay visible in `docs/superpowers/feature-maturity.md`.

---

## 9. Error Handling

Phase 8 should prefer clear fatal errors over hidden fallback behavior.

Required errors:

```txt
provideRouter() missing before router primitives are used
route link receives an unknown route reference
no route matches the current path
route record does not define page or loadPage
lazy loadPage promise rejects
```

Diagnostics should be readable, but production code frames and docs links remain deferred.

---

## 10. Testing Strategy

Router package tests should cover:

```txt
defineRoutes() preserves named route keys
static route matching
:param route matching
routeParams() updates as a signal-style read
lazy loadPage route resolution
same-origin link navigation rules
outlet destroys the previous page before mounting the next one
missing route fallback behavior
```

Compiler tests should cover:

```txt
<vr-router></vr-router> emits router outlet helper code
<vr route.home /> emits route link helper code
unknown route syntax is diagnosed clearly
.page.ts role files compile like .component.ts files
```

Vite plugin tests should cover:

```txt
.page.ts transforms through the Vanrot compiler
route lazy imports work in a fixture build
router helper imports do not break CSS scoping
```

CLI/starter tests should cover:

```txt
vr create includes @vanrot/router by default
generated starter has src/routes.ts
generated starter has app shell and home/about pages
generated starter builds through vr build
generated starter uses route-name links instead of path strings in templates
```

Final verification gate:

```bash
pnpm verify
```

---

## 11. Completion Criteria

Phase 8 is complete when:

```txt
@vanrot/router exists as a workspace package
route config can render eager and lazy pages
<vr-router> renders the active route page
<vr route.home /> renders an accessible route link from routes.ts metadata
routeParams() exposes params for /users/:id style routes
.page.ts files compile through Vite
vr create uses the router by default
docs/brainstorm.md marks Phase 8 complete
docs/vanrot-presentation.html marks Phase 8 complete and Phase 9 active
docs/superpowers/feature-maturity.md marks only verified Phase 8 router features as Demo-Capable
pnpm verify passes
```

No branch, worktree, stage, commit, or push should happen unless the user explicitly asks.
