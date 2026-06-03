# Phase 27: `@vanrot/seo` Package Design

## Status

Approved brainstorming design. This spec defines the target architecture for Phase 27, a complete first-party SEO package for Vanrot.

Implementation plan: `docs/superpowers/plans/Phase-27.md`.

## Goal

Give Vanrot apps a best-in-class SEO layer without adding bloat to `@vanrot/runtime` or scattering package settings across many project files.

The package should make SEO correct at project creation, installable later when users opt out, and easy to audit through `vr doctor`.

## Non-Goals

- Do not generate social preview images.
- Do not move SEO behavior into `@vanrot/runtime`.
- Do not create separate package-specific settings files when `vanrot.config.ts` can own the setting.
- Do not make the first phase an MVP that requires a later completion pass.

## Design Principles

- Keep `vanrot.config.ts` as the single project control plane.
- Keep repeated SEO literals in named constants or generated app utilities.
- Keep static SEO static whenever possible.
- Import dynamic/client SEO behavior only when an app uses it.
- Make `vr create`, `vr add seo`, `vr doctor`, and the site docs teach the same mental model.
- Treat syntax and contract violations as errors, and launch-readiness concerns as warnings unless strict diagnostics are enabled.

## Package Boundary

`@vanrot/seo` is an optional first-party package. It can be installed during `vr create` or later through `vr add seo`.

It must not be imported by `@vanrot/runtime`. Runtime size remains governed by the existing `@vanrot/runtime` gzip budget.

The SEO package owns:

- typed metadata APIs;
- metadata resolution;
- canonical URL helpers;
- Open Graph and Twitter/X helpers;
- structured data helpers;
- sitemap and robots generation;
- SSR metadata rendering hooks;
- optional client head updates;
- SEO diagnostics consumed by `vr doctor`.

## Config Model

Global SEO policy lives in `vanrot.config.ts`:

```ts
export default defineVanrotConfig({
  seo: {
    siteUrl: undefined,
    defaults: {},
    social: {},
    robots: {},
    sitemap: {},
    structuredData: {},
    diagnostics: {
      mode: 'warn',
    },
  },
});
```

The `siteUrl` field can be skipped during project creation. Apps remain valid without it, but `vr doctor` should warn that production canonical, sitemap, and social preview checks are incomplete.

If a user opts out during `vr create`, the generated `vanrot.config.ts` should stay clean and should not include an empty `seo` block. Running `vr add seo` later should safely add and populate the same rich SEO config shape.

## Metadata Ladder

SEO metadata resolves through this priority ladder:

```txt
vanrot.config.ts defaults
route SEO overrides
page SEO overrides
dynamic SEO overrides
```

Each layer can override the layer before it. Site docs must explain this ladder directly, with examples for simple static pages and dynamic route pages.

`vr doctor` should warn when the same field is repeatedly defined across layers in a way that is likely to confuse maintainers.

## Public API

`@vanrot/seo` should expose typed helpers and constants:

```ts
import {
  articleSchema,
  breadcrumbSchema,
  defineDynamicSeo,
  defineSeo,
  openGraphType,
  rawSchema,
  robots,
  twitterCard,
} from '@vanrot/seo';
```

The package should support:

- static page metadata through `defineSeo(...)`;
- async metadata through `defineSeo(async ...)` or `defineDynamicSeo(...)`;
- typed constants for robots directives, Open Graph types, Twitter/X cards, schema types, canonical policies, and sitemap change frequency;
- typed structured data builders plus `rawSchema(...)` as an escape hatch;
- route-aware canonical resolution from `seo.siteUrl`;
- Open Graph and Twitter/X metadata;
- social image validation without social image generation;
- SSR metadata rendering;
- optional client-side head updates for route changes and async metadata.

## Generated App SEO Utility

When users opt into SEO during `vr create`, or later through `vr add seo`, the CLI should generate one app-level SEO utility file:

```ts
// src/app/seo.ts
export const appSeo = {
  siteName: '...',
  defaultImage: '/social/default.png',
  defaultAuthor: '...',
} as const;
```

This file owns app-specific repeated values. Page files should import from it instead of copying site names, default authors, image paths, or repeated title templates.

Additional generated SEO files should be avoided unless the implementation needs real separation. The default experience should be less boilerplate, not more.

## CLI Create Flow

`vr create` should move toward one optional package selection step:

```txt
Add optional Vanrot packages?
[ ] SEO
[ ] Behavior
[ ] UI primitives
```

The SEO path should be designed now so it can plug into that future prompt system. If SEO is selected, `vr create` should:

- install `@vanrot/seo`;
- generate `src/app/seo.ts`;
- populate `vanrot.config.ts` with the rich `seo` block;
- ask for the production `siteUrl`, while allowing the user to skip it;
- add starter page SEO examples;
- wire sitemap and robots generation;
- suggest running `vr doctor`.

If SEO is skipped, the generated project should not include an SEO dependency, SEO config block, or SEO utility file.

## Add Command

`vr add seo` should mirror the create-time setup for users who opt in later:

- install `@vanrot/seo`;
- safely merge `seo` into `vanrot.config.ts`;
- preserve existing user edits;
- ask for `siteUrl`, while allowing the user to skip it;
- generate missing SEO support files;
- add starter examples where safe;
- avoid overwriting existing SEO files unless a force option is explicitly used;
- run or recommend `vr doctor` after setup.

If `vanrot.config.ts` already contains partial SEO config, `vr add seo` should merge the missing fields instead of replacing the block.

## Sitemap And Robots

The package should generate `sitemap.xml` and `robots.txt` as build outputs.

Sitemap generation should support:

- automatic static route discovery;
- explicit dynamic route providers;
- canonical URL generation from `seo.siteUrl`;
- route exclusion rules;
- change frequency and priority constants;
- validation that provider output uses the expected route contract.

Dynamic routes must not be guessed. Apps should register providers explicitly.

Robots generation should support:

- global defaults from `vanrot.config.ts`;
- route-level overrides;
- sitemap URL inclusion when `siteUrl` is available;
- diagnostics for conflicting route and global policies.

## Doctor Rules

`vr doctor` should understand SEO deeply.

Error-level checks:

- invalid `defineSeo(...)` syntax or return shape;
- invalid async SEO contract;
- invalid robots values;
- invalid canonical config;
- invalid Open Graph or Twitter/X fields;
- broken structured data shape;
- sitemap provider returns invalid routes;
- SEO package/config mismatch.

Warning-level checks:

- missing `siteUrl`;
- title too short or too long;
- missing description;
- duplicate titles;
- duplicate descriptions;
- missing social image;
- invalid local social image path;
- missing image alt text;
- accidental `noindex` on public routes;
- sitemap excludes likely public routes;
- robots policy conflicts with route metadata.

Diagnostics strictness is controlled by config:

```ts
seo: {
  diagnostics: {
    mode: 'warn',
  },
}
```

The default mode is balanced. Syntax and contract issues are errors. Content quality and launch readiness are warnings. In strict mode, selected readiness warnings can fail doctor.

## Documentation Requirements

The Vanrot site docs must include:

- installing SEO during `vr create`;
- installing SEO later with `vr add seo`;
- the `vanrot.config.ts` SEO control plane;
- the metadata ladder: config defaults, route overrides, page overrides, dynamic overrides;
- static metadata examples;
- async metadata examples;
- generated app SEO utility file usage;
- typed constants that avoid repeated string literals;
- sitemap and robots examples;
- dynamic sitemap provider examples;
- `vr doctor` warning and error examples;
- guidance for projects without a production `siteUrl` yet.

## Future Pipeline Note

The future pipeline should include a CLI prompt roadmap item. That work should happen near the final project juncture, after first-party packages and major features are implemented, because `vr create` is the framework's first impression.

This SEO package should be compatible with that roadmap but should not wait for the full prompt redesign to ship.

## Testing Requirements

The implementation plan should include tests for:

- `defineSeo(...)` static contracts;
- async SEO contracts;
- metadata ladder merge order;
- config schema support;
- `vr create` SEO opt-in;
- `vr create` SEO opt-out;
- `vr add seo` setup;
- safe config merge behavior;
- sitemap generation for static routes;
- sitemap generation for explicit dynamic providers;
- robots generation;
- SSR metadata rendering;
- optional client head updates;
- doctor error diagnostics;
- doctor warning diagnostics;
- strict diagnostics mode;
- docs route coverage for the SEO guide.

## Acceptance Criteria

- `@vanrot/seo` is optional and does not bloat `@vanrot/runtime`.
- `vr create` can install and configure SEO when selected.
- `vr create` leaves no SEO residue when skipped.
- `vr add seo` can install and configure SEO later.
- `vanrot.config.ts` owns global SEO settings.
- Page and route metadata work through the approved metadata ladder.
- Repeated SEO literals can be centralized through exported package constants and generated app utilities.
- `vr doctor` detects SEO syntax, contract, readiness, and content-quality issues.
- Sitemap and robots outputs are generated.
- Social images are validated but not generated.
- Site docs explain the SEO package as a complete first-party feature.
