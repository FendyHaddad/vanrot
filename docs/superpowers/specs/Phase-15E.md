# Phase 15E Router Navigation Polish

## Purpose

Phase 15E adds the browser-level polish that makes Vanrot single-page navigation feel like real page navigation without
turning the router into a data framework.

Phase 15A made route definitions, params, query strings, generated links, and breadcrumbs production-ready. Phase 15B
made nested layouts and outlets production-ready. Phase 15C made guards and redirects production-ready. Phase 15D made
route entry feel fast through intent preload and same-day keepAlive views. Phase 15E adds the final user-facing
navigation polish layer:

- optional route-owned document title
- optional route-owned meta description
- scroll-to-top on normal navigation
- scroll restoration on browser back and forward
- accessible focus movement after successful navigation
- configurable diagnostics for missing or invalid route metadata

This phase does not implement route data loaders, API caches, async resources, route transition animation, SSR,
hydration, analytics, or a full SEO framework.

## Source Of Truth

`src/routes.ts` remains the owning source of truth for route paths, labels, hierarchy, layout ownership, breadcrumbs,
navigation metadata, redirects, guards, preload policy, keepAlive policy, document title, and route meta description.

User pages and templates should not repeat route titles, route labels, route paths, diagnostic codes, or meta description
strings. Literal strings remain acceptable at the route source-of-truth boundary or when a browser standard requires
them.

## Route Metadata

Routes may define document metadata, but it is optional.

```ts
const buttons = components.page({
  path: 'buttons',
  label: 'Button',
  title: 'Button - Vanrot',
  meta: {
    description: 'Button variants, usage, and accessibility guidance.',
  },
  page: ButtonPage,
});
```

Supported metadata for Phase 15E:

```ts
title?: string
meta?: {
  description?: string
}
```

The deepest matched route owns the active document metadata. Parent layout metadata may provide a fallback, but it must
not overwrite child page metadata when the child defines its own value.

Fallbacks:

- If `title` is missing, use the route `label`.
- If `meta.description` is missing, leave the current document description unchanged or omit it when no description tag
  exists.
- If all matched routes omit metadata, the router still works.

The router should update document metadata only after navigation successfully commits. Guard-blocked navigation and stale
async navigation results must not change the title or meta description.

## Configuration

Navigation polish is enabled by default but configurable through `vanrot.config.ts`.

```ts
export default defineVanrotConfig({
  router: {
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
  },
});
```

Default behavior:

- `navigationPolish.title`: `true`
- `navigationPolish.meta`: `true`
- `navigationPolish.scroll`: `true`
- `navigationPolish.focus`: `true`
- `diagnostics.missingTitle`: `warn`
- `diagnostics.missingMetaDescription`: `off`

Diagnostic levels are:

```ts
'off' | 'warn' | 'error'
```

This keeps quality visible for public sites and docs without forcing internal dashboards to carry SEO-style metadata.

## Scroll Behavior

Normal route navigation should scroll the routed content to the top after the next view is ready.

Browser back and forward navigation should restore the previous scroll position for that history entry. The router may
use `history.scrollRestoration = 'manual'` while active if needed, but it must keep the behavior scoped and predictable.

Hash navigation keeps normal browser hash behavior. If the target URL differs only by hash, Phase 15E should not hijack
the browser's hash scrolling.

Scroll behavior must run only after successful navigation. Guard-blocked navigation, redirect loops, stale async
navigation, and preload intent must not move scroll.

## Focus Behavior

After successful navigation, Vanrot should move keyboard and screen-reader focus to the new routed content.

The focus target order is:

1. The first page heading inside the active route view.
2. The active route view root.
3. The router outlet host.

If the target is not naturally focusable, the router may add `tabindex="-1"` before focusing it. The router should avoid
leaving unnecessary framework attributes behind when a temporary focus target can be cleaned up safely.

Focus must happen after the next view has mounted. The router must not focus an empty outlet while a lazy page is still
loading. If `navigationPolish.focus` is disabled, the router must not move focus.

## Runtime Architecture

Phase 15E should keep the router-owned polish layer narrow.

Expected module ownership:

- `route-types.ts` owns title and meta metadata types.
- `create-routes.ts` accepts optional metadata on page and layout route definitions.
- `define-routes.ts` normalizes metadata and creates diagnostics for invalid metadata.
- `router-state.ts` decides whether navigation committed and exposes enough information for post-commit polish.
- `route-outlet.ts` runs focus and scroll only after the active view is mounted or restored.
- a small browser adapter owns `document.title`, meta description lookup, scroll, and focus DOM operations.
- config integration owns navigation polish defaults and diagnostic level normalization.

The implementation should not expose a broad router event system in Phase 15E. If tests need visibility, they should use
small test-only helpers or the existing router state APIs.

## Diagnostics

Phase 15E adds stable diagnostics for route metadata and navigation polish configuration.

Expected diagnostics:

- missing route `title` when `missingTitle` is `warn` or `error`
- missing route `meta.description` when `missingMetaDescription` is `warn` or `error`
- empty `title`
- non-string `title`
- empty `meta.description`
- non-string `meta.description`
- invalid `navigationPolish` boolean values
- invalid diagnostic level values

Diagnostics should use named code constants, clear messages, suggestions, and docs hooks. Missing metadata warnings must
not block runtime navigation unless the user configures the relevant diagnostic as `error`.

## Testing

Phase 15E should add focused failing tests before implementation for:

- route builders accepting optional `title` and `meta.description`
- missing metadata falling back to route label without throwing
- deepest child route metadata winning over parent layout metadata
- title and meta updating only after successful navigation
- guard-blocked navigation not updating title or meta
- stale async navigation not updating title, meta, scroll, or focus
- normal navigation scrolling routed content to top
- browser back and forward restoring previous scroll position
- hash navigation preserving browser hash behavior
- focus moving after the active route view has mounted
- lazy route navigation not focusing an empty outlet before module resolution
- `vanrot.config.ts` disabling title, meta, scroll, or focus behavior
- diagnostics honoring `off`, `warn`, and `error`
- `resetRouterForTests()` restoring navigation polish state and browser adapters

The integration suite should include at least one nested route graph with:

- root page
- layout route with title fallback
- child page with its own title and meta description
- guarded route
- lazy page
- same-origin generated route link
- back and forward navigation
- hash navigation

## Documentation And Examples

Docs should describe this phase as navigation polish, not SEO magic.

Good:

```ts
const componentButtons = components.page({
  path: 'buttons',
  label: 'Button',
  title: 'Button - Vanrot',
  meta: {
    description: 'Button variants, usage, and accessibility guidance.',
  },
  page: ComponentButtonPage,
});
```

Good:

```ts
export default defineVanrotConfig({
  router: {
    navigationPolish: {
      title: true,
      meta: true,
      scroll: true,
      focus: true,
    },
  },
});
```

Avoid:

```ts
document.title = 'Button - Vanrot';
```

Avoid:

```ts
window.scrollTo(0, 0);
```

Pages may still perform their own browser work when an application truly needs a custom behavior, but the default path
should be route-owned and framework-managed.

## Production Readiness Outcome

After Phase 15E, `@vanrot/router` should provide the browser polish expected from a production single-page app:

- route titles and meta descriptions are route-owned and optional
- metadata diagnostics are configurable
- normal navigation scrolls to the top at the right time
- back and forward restore scroll position
- hash navigation remains native
- focus moves accessibly after view mount
- title, meta, scroll, and focus happen only after successful navigation commits
- all behavior can be disabled from `vanrot.config.ts`

The final verification command remains:

```sh
pnpm verify
```
