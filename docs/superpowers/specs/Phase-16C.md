# Phase 16C Vanrot Site Base

## Purpose

Phase 16C creates the public Vanrot learning and documentation site foundation for `vanrot.vankode.com`.

The site is not only the UI component catalog. It is the main place where users learn what Vanrot is, how to install it, how the framework is structured, how routing works, how UI works, how project conventions fit together, and how to build real apps with the framework.

This phase is not the final documentation audit. Phase 24 still owns the final pass for completeness, SEO, deployment polish, API coverage, missing guides, broken links, accessibility, analytics policy, and release-readiness checks.

Phase 16C exists earlier because Vanrot needs a real learning surface while the framework and UI system are being built. From Phase 16D onward, every UI primitive slice must update the site in the same phase, but non-UI framework documentation also belongs in this app as the framework matures.

## Approved Direction

The site should live in the same monorepo as a separate workspace app:

```text
apps/vanrot-site
```

The site should use the Phase 16B primitives that already exist:

- `<vr-button>`
- `<vr-card>`
- `<vr-badge>`
- `<vr-avatar>`
- `<vr-alert>`
- `<vr-loader>`
- `<vr-skeleton>`
- `<vr-separator>`

When the site needs UI that Vanrot has not implemented yet, Phase 16C may use site-local scoped CSS as a temporary bridge. Those temporary pieces must stay local to `apps/vanrot-site` and should be replaced by real Vanrot primitives as later Phase 16 slices land.

The documentation layout should follow the shadcn/ui quality bar and information rhythm: clear top navigation, left documentation sidebar, central content, right on-this-page navigation, preview-first component sections where relevant, install commands, usage examples, API tables, accessibility notes, framework guide pages, and previous/next navigation.

The site must not copy shadcn/ui text, branding, or React implementation. The reference is layout quality and docs ergonomics. Vanrot keeps its own identity: October tokens, `vanrotstyles.css`, semantic `vr-*` tags, Vanrot router examples, and source-owned component language.

## Scope

Phase 16C includes:

- `apps/vanrot-site` workspace app.
- Public landing page for Vanrot.
- Documentation shell with shadcn-style docs layout.
- Initial docs routes for introduction, installation, project structure, CLI, configuration, routing, UI, theming, examples, and conventions.
- Framework learning pages for runtime, compiler, Vite plugin, router, CLI, config, UI, testing direction, and release/distribution status where the current framework state is known.
- Current framework docs for the implemented surface from Phase 1 through Phase 15, plus Phase 16A and Phase 16B.
- Current command docs for supported CLI commands.
- Current reference data for packages, commands, diagnostics, route APIs, config keys, file conventions, UI primitives, and maturity status.
- Component page template for Phase 16B primitives.
- Component pages for every Phase 16B primitive.
- Preview and code-example pattern for component documentation.
- Site-local temporary shell CSS for missing Phase 16 layout/navigation primitives.
- A docs drift verification command that fails when implemented UI primitives or required framework learning pages are missing from the site.
- Root `pnpm verify` integration for the docs drift check.

## Out Of Scope

Phase 16C does not implement new UI primitives beyond what already exists in Phase 16B.

These slices remain separate:

| Slice | Responsibility |
| ----- | -------------- |
| Phase 16D | Layout, navigation, and media primitives, plus matching site docs updates |
| Phase 16E | Forms and data primitives, plus matching site docs updates |
| Phase 16F | Overlays, stateful interaction, visual QA, and matching site docs updates |
| Phase 24 | Final public documentation audit and production web presence hardening |

## Architecture

The site is a workspace app, not a framework package.

```text
apps/
  vanrot-site/
    package.json
    index.html
    src/
      main.ts
      routes.ts
      app/
        app.layout.ts
        app.layout.html
        app.layout.css
      shell/
        docs.layout.ts
        docs.layout.html
        docs.layout.css
      pages/
        home.page.ts
        home.page.html
        home.page.css
        docs/
        components/
      docs/
        component-docs.ts
        site-navigation.ts
      styles/
        site.css
```

`@vanrot/ui` remains the owner of primitive metadata, variants, source assets, tokens, and `vanrotstyles.css`.

`apps/vanrot-site` consumes that metadata to build docs navigation and component pages. The site should not duplicate primitive names, selectors, variant names, or source paths when those values already exist in `@vanrot/ui`.

Framework guide pages should reference source-of-truth docs and package metadata where available. If a page needs framework copy that is not yet represented in package metadata, that copy can live in the site docs registry until a later package-specific metadata source exists.

## Site Behavior

The first version should be static and simple:

- route-based navigation using Vanrot router;
- no server data dependency;
- no CMS dependency;
- no client-side search unless there is a small local implementation;
- no deployment-specific behavior inside the app logic;
- deployable later as a static site for `vanrot.vankode.com`.

This keeps Phase 16C focused on the product surface, learning experience, and docs workflow rather than hosting complexity.

## Information Architecture

The first navigation model should support the whole framework:

| Section | Purpose |
| ------- | ------- |
| Home | Explain Vanrot, show the core value, and send users to install or docs. |
| Get Started | Installation, create app, project structure, and first route/page. |
| Framework | Runtime, compiler, Vite plugin, routing, configuration, CLI, conventions, and diagnostics. |
| UI | October, `vanrotstyles.css`, tokens, theming, and component documentation. |
| Examples | Small framework examples that show real Vanrot usage without hiding code. |
| Reference | Commands, config keys, file conventions, diagnostics, package inventory, and current production status. |

Phase 16C only needs the base pages and enough content to make the site coherent. Later phases expand the pages as the production surface grows.

## Existing Framework Coverage

Because Phase 1 through Phase 15 are already implemented, the first site must document the framework surface that exists now. It should not present Vanrot as only a UI project.

Phase 16C should include useful docs for:

- workspace and package layout;
- runtime signals, computed values, effects, lifecycle, and mounting;
- compiler file roles, templates, scoped CSS, control flow, child components, slots, diagnostics, and source-map behavior;
- Vite plugin usage, dev/build integration, HMR behavior, diagnostics, and transformed role-module typing;
- `vanrot.config.ts`, config defaults, validation, migration, recovery, and `ui.styles`;
- CLI commands and their current maturity;
- router definitions, nested layouts, route refs, route params, query strings, redirects, guards, preloading, keepAlive, active links, breadcrumbs, and diagnostics;
- UI October tokens, `vanrotstyles.css`, config style modes, and Phase 16B primitives;
- testing direction and what is currently demo-capable;
- examples and generated app conventions;
- current production status from the maturity ledger.

Phase 16C should clearly distinguish:

- available now;
- demo-capable but not final-release complete;
- planned for a later phase;
- intentionally deferred.

The site should not pretend deferred features are available. It should give users practical docs for what they can use today and honest status for what is coming later.

## Source Data

The site should prefer existing source-of-truth data instead of duplicating lists by hand.

Initial source data should come from:

- `docs/superpowers/feature-maturity.md` for phase status and maturity language;
- `docs/superpowers/final-tdd-inventory.md` for package, command, convention, diagnostic, and generated-file inventory;
- package `package.json` files for package names and public scripts;
- `@vanrot/ui` metadata for UI primitives, variants, asset paths, docs paths, and style modes;
- CLI command metadata where available;
- router public exports and route diagnostic metadata where available;
- compiler and config diagnostic catalogs where available.

When an authoritative metadata source does not exist yet, Phase 16C may introduce a small site docs registry. That registry should be treated as temporary source data until the owning package gains metadata.

## Documentation Pages

Framework guide pages should generally follow this structure:

1. Title and plain-language purpose.
2. When to use the feature.
3. Minimal working example.
4. File or command conventions.
5. Related diagnostics or config keys.
6. Links to package/reference pages.
7. Current maturity or limitation notes where useful.

Each component page should follow this structure:

1. Title and one-line purpose.
2. Preview panel.
3. Install command.
4. Usage snippet.
5. Variant examples.
6. Accessibility notes.
7. API reference sourced from primitive metadata.
8. Source ownership note.
9. Previous and next links.

The initial component pages are:

- Button
- Card
- Badge
- Avatar
- Alert
- Loader
- Skeleton
- Separator

## Docs Drift Guard

Add a verification command:

```text
pnpm verify:site-docs
```

The guard should fail when:

- a required framework docs route is missing;
- a required framework docs route is missing from site navigation;
- a supported CLI command has no docs entry;
- an implemented package has no reference page;
- an implemented diagnostic catalog has no reference path;
- the current maturity/status data is missing from the site reference section;
- a primitive exists in `@vanrot/ui` metadata but has no docs page;
- a primitive docs page exists but is missing from site navigation;
- a primitive docs page has no preview;
- a primitive docs page has no usage example;
- a primitive docs page has no API or accessibility section;
- completed Phase 16 UI primitives are not represented on the site.

The guard should be deterministic and source-of-truth driven. It should read `@vanrot/ui` metadata for UI coverage, package or command metadata where available, and a small site docs registry for framework learning pages rather than relying on repeated string literals.

Add the guard to root `pnpm verify` so future Phase 16 work cannot forget the site.

## Styling Rules

The site should use:

- October tokens;
- `vanrotstyles.css`;
- Phase 16B primitives where available;
- scoped site CSS for temporary shell pieces;
- dark-first styling with supported light theme behavior.

Temporary site CSS is allowed only for UI that does not have a Vanrot primitive yet. When Phase 16D or later adds the real primitive, the matching temporary site CSS should be removed or narrowed.

## Deployment Direction

Phase 16C may prepare the app so it can be deployed to `vanrot.vankode.com`, but full deployment production hardening remains Phase 24 unless the user explicitly asks to deploy earlier.

The intended hosting shape is:

```text
vanrot.vankode.com -> apps/vanrot-site static build
```

`vankode.com` can remain its own live site. The Vanrot subdomain should be a separate deployment target pointed at this monorepo app.

## Acceptance Criteria

Phase 16C is complete when:

- `apps/vanrot-site` exists as a workspace app;
- the site runs locally;
- the site uses current Vanrot UI primitives where they exist;
- the docs shell visually follows the shadcn-style layout direction;
- Phase 16B primitive pages exist and are navigable;
- framework learning pages exist for getting started, runtime, compiler, Vite plugin, CLI, configuration, routing, UI, theming, conventions, examples, and reference status;
- current CLI command docs exist for supported commands through Phase 16B;
- current package reference pages exist for implemented Vanrot packages;
- current route, config, file convention, diagnostic, and maturity data are visible from the site;
- `pnpm verify:site-docs` catches missing primitive docs coverage;
- `pnpm verify:site-docs` catches missing required framework docs routes;
- `pnpm verify:site-docs` catches missing command, package, diagnostic, and maturity reference coverage;
- root `pnpm verify` passes;
- `docs/superpowers/feature-maturity.md`, `docs/superpowers/final-tdd-inventory.md`, and `docs/vanrot-presentation.html` reflect the completed slice.

## Open Questions Before Writing Plan

- Should the site start with only static pages, or should it also generate component pages from metadata during build?
- Should the first deploy target be Cloudflare Pages immediately, or should Phase 16C stop at a local static build?
- Should search be deferred until Phase 24, or should Phase 16C add a tiny local docs search?
- Should component code snippets be written by hand for readability, or generated from the same usage files used by `vr add`?
