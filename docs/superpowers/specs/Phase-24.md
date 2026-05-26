# Phase 24 Documentation And Web Presence

## Purpose

Phase 24 makes Vanrot understandable, trustworthy, and deployment-ready as a public framework site.

Earlier phases built the framework surface: runtime, compiler, router, config, CLI, UI, testing, devtools, and project intelligence. Phase 24 turns that working surface into complete public knowledge. A new user, maintainer, or AI assistant should be able to understand Vanrot from official docs instead of guessing from source code or old plans.

The goal is not a full redesign and not a live domain launch. The goal is an audit-first documentation system, a tasteful framework landing page, a coherent docs shell, verified runnable examples, and checks that prevent docs from drifting behind code.

## Approved Direction

Phase 24 uses the **Framework Docs First, Landing Page Credibility Pass** approach.

Approved decisions:

- Treat the framework docs section as the main Phase 24 target.
- Keep the UI/component docs section mostly as a Phase 16 surface and audit it for freshness, navigation, labels, and integration only.
- Rename the landing-page docs CTA to `Framework Documentation`.
- Rename the landing-page UI CTA to `Design Component`.
- Use a hybrid docs architecture: structured registries for checkable inventories and long-form guide sources for narrative documentation.
- Document every public export and enforce drift checks.
- Build a full canonical example matrix where runnable examples are the source of truth and docs reference or mirror them.
- Keep the current Vanrot visual direction, but polish the public site to the same tasteful shadcn-inspired standard already chosen for the UI docs.
- Make the site deployment-ready for `vanrot.vankode.com`, but do not require live DNS, credentials, analytics setup, or hosting changes.
- Use Vanrot's own components and primitives as much as practical when rendering docs and site surfaces.

## Public Site Model

`vanrot.vankode.com` has two public documentation paths.

The first path is **Framework Documentation**. This is the main Phase 24 surface. It covers packages, public APIs, commands, diagnostics, generated files, conventions, examples, limitations, production caveats, install guidance, build guidance, and deployment-readiness notes.

The second path is **Design Component**. This is the UI/component catalog. Phase 16 already made this surface nearly complete. Phase 24 should not redesign it or make it the center of the phase. It should only check that component docs remain fresh, discoverable, visually aligned, and correctly connected from the landing page and docs navigation.

The landing page is the front door. It should make the two paths clear:

- `Framework Documentation`: learn Vanrot as a framework.
- `Design Component`: inspect the UI/component system.

## Phase Slices

Phase 24 has five implementation slices:

- **24A Inventory Foundation**: build authoritative inventories for packages, public exports, commands, diagnostics, generated files, conventions, examples, and maturity/status rows.
- **24B Framework Documentation**: complete the framework docs path with package references, API references, and long-form guides.
- **24C Example Matrix**: make runnable examples the source of truth for package and workflow learning, with docs registration and freshness checks.
- **24D Site And Docs-Shell Polish**: make the landing page tasteful, rename CTAs, align `/docs` with `/docs/components`, and dogfood Vanrot components where practical.
- **24E Deployment-Ready Checks**: verify SEO metadata, accessibility basics, production build, public routing, deployment notes, and docs completeness inside normal verification.

The slices are ordered by risk. First prove the inventory. Then write the docs. Then connect docs to runnable examples. Then polish the public surface. Then harden checks.

## Documentation Architecture

Phase 24 should use a hybrid documentation architecture.

Structured registries should own data that must be checked:

- packages;
- public exports;
- CLI commands;
- diagnostic codes;
- generated files;
- conventions;
- examples;
- feature maturity and status rows;
- known limitations and production caveats.

Long-form guide sources should own narrative documentation:

- installation;
- project structure;
- runtime and signals;
- compiler templates;
- routing;
- UI usage from the framework-docs perspective;
- configuration;
- testing;
- devtools and project intelligence;
- build and deployment;
- limitations and production caveats.

The site should render both through the existing Vanrot site architecture. Phase 24 should not introduce a separate docs engine unless the implementation plan proves the current renderer cannot carry the required content.

## Vanrot-Native Rendering

The docs site should dogfood Vanrot as much as practical.

When a first-party Vanrot component or primitive exists, Phase 24 should prefer using it over ad hoc markup for documentation surfaces. This applies especially to repeated reference sections, navigation, status displays, examples, callouts, tables, tabs, badges, empty states, and copyable code surfaces.

This requirement should stay pragmatic. Phase 24 should improve the surfaces it touches and should not become a broad rewrite of every page. The goal is coherent Vanrot-native documentation, not churn.

## Framework Documentation Coverage

The framework docs path should cover the whole current framework surface.

Required reference coverage:

- every workspace package;
- every public export from each package;
- every CLI command and subcommand;
- every diagnostic code from compiler, config, router, CLI, and related packages;
- every generated file or generated directory users are expected to see;
- every framework convention users are expected to follow;
- every canonical example;
- every known production caveat or limitation;
- every current maturity/status section users need to understand.

Required guide coverage:

- install and create a project;
- understand the project file structure;
- build a component;
- use signals and lifecycle APIs;
- write compiler-known templates;
- use scoped CSS;
- configure Vanrot;
- add routes and navigation;
- add UI components from the framework-docs path;
- test components, pages, and workflows;
- use devtools and project intelligence;
- build for production;
- prepare deployment for `vanrot.vankode.com` style hosting.

The docs should avoid promising Phase 17 through Phase 22 post-production work as if it were current framework behavior.

## Example Matrix

Runnable examples are the source of truth for Phase 24 examples.

The example matrix should cover:

- every package;
- every major workflow;
- important cross-package combinations;
- examples that explain the difference between framework docs and component docs;
- examples used by guide pages.

Expected example coverage includes:

- create and install starter flow;
- runtime signals and lifecycle;
- compiler templates, slots, control flow, and scoped CSS;
- routing, nested layouts, guards, links, and route metadata;
- config and diagnostics;
- CLI commands;
- UI primitives from the framework-docs perspective;
- testing helpers;
- devtools and project intelligence;
- build and deploy flow.

This does not mean every possible permutation. The standard is: can a real user learn each important workflow from a verified runnable example?

Docs snippets should either come from runnable examples or be freshness-checked against them.

## Public Site Visual Direction

The landing page must be tasteful. This is non-negotiable.

The site should keep the restrained, premium, shadcn-inspired direction already chosen for Vanrot UI. It should not become a noisy marketing page, a generic SaaS template, or a disconnected design experiment.

Phase 24 should improve:

- landing-page copy clarity;
- CTA labels and hierarchy;
- responsive layout;
- SEO metadata;
- accessibility basics;
- public route metadata;
- docs readability;
- visual consistency between framework docs and component docs.

The `/docs` sidebar is not acceptable in its current direction. The framework docs sidebar should follow the sidebar design and overall visual language of `/docs/components`. Framework docs and component docs should feel like two sections of the same product.

## Deployment-Ready Web Presence

Phase 24 should make the site deployment-ready without requiring a live deployment.

Required deployment-readiness coverage:

- documented deployment target and assumptions for `vanrot.vankode.com`;
- production build verification for `apps/vanrot-site`;
- SEO title and description coverage for landing and docs routes;
- accessible navigation and responsive docs layouts;
- clear public routing between landing, `Framework Documentation`, and `Design Component`;
- not-found behavior if supported by the app, or an explicit documented limitation if not;
- site metadata and docs status references that match the maturity ledger.

Actual DNS changes, hosting credentials, analytics setup, and live deployment are out of scope unless they already exist in the repo and are safe to use.

## Completeness And Drift Checks

Phase 24 should extend the normal verification path, preferably through `verify:site-docs`, so documentation completeness is enforced automatically.

Checks should fail when:

- a workspace package exists without package reference docs;
- a public export exists without API/reference coverage;
- a CLI command exists without docs;
- a diagnostic code exists without a reference entry;
- a generated file or convention exists without documentation;
- a runnable example exists without docs registration;
- a docs-registered example no longer builds or tests;
- a feature maturity row is missing from the public status/reference surface;
- landing-page CTAs drift from `Framework Documentation` and `Design Component`;
- `/docs` and `/docs/components` navigation drift into visibly separate systems.

These checks should be strong enough to prevent accidental omissions, but they should not require AI-specific output. AI-readable bundles belong to Phase 25.

## Error Handling And User Experience

Docs should handle incomplete or deferred areas honestly.

Expected states:

- feature exists and is production-ready;
- feature exists but is demo-capable or limited;
- feature is deferred to a later phase;
- package exists but has no browser-facing workflow;
- command or diagnostic exists but requires context;
- example exists but is not relevant to every package manager;
- deploy target is documented but not live from this repo.

The public docs should explain these states plainly. They should not hide limitations and should not imply post-production phases are complete.

## Testing And Verification

Phase 24 should add focused coverage for:

- package inventory completeness;
- public export documentation coverage;
- command documentation coverage;
- diagnostic documentation coverage;
- generated file and convention documentation coverage;
- runnable example registration;
- docs snippet/example freshness;
- framework docs route coverage;
- landing-page CTA labels;
- `/docs` sidebar alignment with `/docs/components`;
- production build of `apps/vanrot-site`;
- SEO metadata for important public routes;
- responsive and accessibility smoke checks where practical.

`pnpm verify` remains the final gate before marking the phase complete.

## Out Of Scope

These stay outside Phase 24:

- actual DNS changes or live deployment;
- hosting credential setup;
- analytics vendor integration;
- Phase 25 AI-readable docs bundle, MCP server, Skill.sh package, or AI command work;
- Phase 26 publishing, provenance, changelog, Homebrew, or release automation;
- full component docs redesign;
- Phase 17 through Phase 22 post-production feature work;
- new framework features unless documentation exposes a small broken contract that blocks docs correctness.

## Completion Criteria

Phase 24 can be marked complete when:

- the landing page clearly separates `Framework Documentation` and `Design Component`;
- the landing page meets the tasteful Vanrot/shadcn-inspired visual bar;
- `/docs` follows the sidebar design and visual language of `/docs/components`;
- framework docs cover every current package, public export, command, diagnostic, generated file, convention, limitation, and production caveat;
- long-form guides exist for the major framework workflows;
- runnable examples cover every package, every major workflow, and important cross-package combinations;
- docs snippets are derived from or freshness-checked against runnable examples;
- `verify:site-docs` or an equivalent normal verification gate catches missing docs coverage;
- `apps/vanrot-site` has production build, SEO, accessibility, responsive, and deployment-readiness checks where practical;
- docs, tests, inventory, presentation, and maturity ledger are updated during implementation;
- `pnpm verify` passes.
