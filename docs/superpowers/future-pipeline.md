# Future Pipeline

**Scope:** Future framework and tooling candidates that are not active phase plans yet.
**Purpose:** Show which parked ideas are done and which still need attention before they become phase work.

This file is a checkbox backlog, not an execution plan. When an entry becomes active, move the relevant unchecked ideas
into the matching spec and writing plan using the normal repo naming convention.

## Status Guide

- [x] Done: shipped or no longer pending here. Keep checked rows only when they explain nearby future work.
- [ ] Needs attention: parked future work that still needs a brainstorming, spec, and implementation plan pass.

## Planning Rules

- Keep tooling candidates, such as IntelliJ and editor tooling, parked here until project intelligence and distribution
  hardening make them practical.
- Keep shipped or no-longer-needed items in their implementation docs, history, or implementation files instead of this
  pipeline.
- Do not mark a listed idea complete from this file alone.
- Keep each future item sliced into small implementation passes before writing code.
- Preserve shared contracts across related packages, especially store APIs, forms, async resources, router integration,
  compiler output, and build tooling boundaries.
- Prefer readable, English-like APIs and named sources of truth over clever shorthand or repeated string literals.

## Behavior Expansion

- [x] Accordion / Collapsible / Disclosure.
- [x] Select / Listbox / Combobox.
- [x] Context Menu / Menubar / Navigation Menu.
- [x] Toggle Group / Toolbar.
- [x] Scroll Area, Portal, focus utilities, and visually hidden accessibility helpers.
- [x] Date picker/calendar, drag and drop, table column resizing, and richer multi-selection.

## Editor Tooling

The IntelliJ plugin foundation already exists. This section is now only for the deeper editor experience that should
arrive after the framework metadata, compiler diagnostics, and distribution story are stable. Future work should extend
the shipped foundation instead of planning it again.

Done:

- [x] `editors/intellij` contains the Gradle-built JetBrains plugin project.
- [x] The plugin metadata is now `com.vankode.vanrot` with the displayed name `Vanrot`.
- [x] The Kotlin plugin acts as a thin IntelliJ bridge around the Vanrot language-server path.
- [x] The plugin suppresses the noisy HTML empty-tag inspection for Vanrot template files.
- [x] The template-file rule is shared from `packages/language-server` and mirrored by the plugin so `.component.html`,
  `.page.html`, `.layout.html`, `.dialog.html`, `.widget.html`, and `.form.html` stay recognized consistently.
- [x] The plugin was built and tested with Java 21, and its packaged ZIP metadata was inspected through the nested JAR.
- [x] JetBrains Web Types support for route shorthand also shipped separately through global `html.attributes` metadata in
  the root, site, and router Web Types files, including the current `route.docs`, `route.components`, and
  `route.changelog` no-value route references.

Needs attention:

- [ ] Richer Web Types and editor metadata for Vanrot tags, attributes, variants, router elements, UI primitives, and route
  references.
- [ ] Project intelligence exports that expose the route graph, component graph, template usage, source locations,
  diagnostics, and generated metadata to editors.
- [ ] Jump-to-route, jump-to-page, jump-to-layout, jump-to-component, and route-reference navigation from templates.
- [ ] Rename-safe route references for syntax such as `<vr route.docs />`.
- [ ] Template diagnostics for unknown Vanrot elements, invalid variants, repeated route literals, router/outlet misuse, and
  framework convention violations.
- [ ] Auto-fixes for simple mistakes, such as adding missing generated metadata, correcting route references, or replacing
  repeated literals with named route objects.
- [ ] Completion and inline documentation for `vr-router`, `vr-outlet`, `vr-*` UI primitives, route references, variants,
  and framework-owned attributes.
- [ ] Compatibility checks across IntelliJ IDEA Ultimate, WebStorm, and future editor adapters where practical.

Possible slices:

- [ ] Web Types
- [ ] Intelligence Export
- [ ] Template Navigation
- [ ] Editor Fixes
- [ ] Plugin Packaging

## Store Foundation

Store foundation should introduce a signal-native store that is lightweight by default and enterprise-capable by design.
It should learn from Redux and NgRx without copying their ceremony or making RxJS mandatory.

Ideas to carry forward:

- [ ] Start with a dedicated store brainstorming pass before API design.
- [ ] Define simple state containers with signal-native reads and predictable writes.
- [ ] Decide the smallest useful vocabulary for actions, reducers, selectors, and immutable updates.
- [ ] Keep package boundaries clean so `@vanrot/runtime` does not grow because store exists.
- [ ] Make state reads ergonomic in Vanrot components without requiring app logic in HTML.
- [ ] Include starter examples that show small-app usage and a path toward larger enterprise usage.
- [ ] Verify package exports, tree-shaking, SSR boundaries, docs hooks, and release checks.

Possible slices:

- [ ] API Vocabulary
- [ ] Store Core
- [ ] State Updates
- [ ] Package Boundaries
- [ ] Starter Examples

## Store Hardening

Store hardening should add the enterprise features that teams expect from a mature state package while keeping the
default store mental model signal-first.

Ideas to carry forward:

- [ ] Add effects only after the core action and reducer contracts are stable.
- [ ] Design cancellation and concurrency rules explicitly, especially for duplicate requests and stale writes.
- [ ] Add action tracing in a way that can feed future devtools without coupling store to devtools.
- [ ] Explore time travel only after state snapshots and replay rules are deterministic.
- [ ] Provide Redux mental-model interop for teams migrating from Redux-like systems.
- [ ] Provide RxJS interop as an opt-in bridge, not the default dependency or teaching path.
- [ ] Keep examples honest about when the enterprise layer is useful and when plain signals are enough.

Possible slices:

- [ ] Effects Cancellation
- [ ] Concurrency Tracing
- [ ] Time Travel
- [ ] Redux Compatibility
- [ ] RxJS Interop

## Forms And Resources

Phase 21 shipped `@vanrot/forms` as the owning package for forms and form-scoped async resources. A standalone
`@vanrot/resources` package remains unnecessary unless later non-form resource use proves that boundary.

Shipped:

- [x] Package foundation for `@vanrot/forms`.
- [x] Field state, field metadata, named refs, and `.form.ts` discovery.
- [x] Validation messages, touch/change visibility, all-errors-on-submit, and schema adapters.
- [x] UI helper state for labels, descriptions, validation messages, pending, disabled, arrays, and wizard steps.
- [x] Wizards and field arrays with nested refs and stable row keys.
- [x] Async resources with loading, success, error, refresh, stale, cancellation, and latest-interaction-wins behavior.
- [x] Draft persistence with local, session, custom adapter, versioning, reset, and sensitive-field policy.
- [x] Vite-first forms metadata and terminal diagnostics for `.form.ts` role files.
- [x] Forms testing helpers exported from `@vanrot/forms`.

Deferred:

- [ ] General non-form resources package if a future use case needs it.
- [ ] Compiler two-way binding syntax that is explicitly forms-aware.
- [ ] Coordination with future `@await` or `@defer` compiler ideas.
- [ ] Future Forge consumption of the same forms metadata contract.

## Formatters And Template Pipes

Phase 29 shipped compiler-owned template pipes backed by `@vanrot/formatters`. Vanrot now supports pipe-like
interpolation syntax, a built-in formatter suite, custom `.pipe.ts` role files, named presets, enum pipes, formatting
context defaults, Vite discovery, terminal diagnostics, `/docs/formatters`, `examples/formatters-pipes`, and AI/reference
coverage.

Shipped in Phase 29:

- [x] Design a typed formatter registry that keeps reusable formatting out of templates and avoids repeated string
  literals.
- [x] Support pipe-like template sugar in interpolation with `{{ value | pipeName }}`,
  `{{ value | pipeName(arg) }}`, `{{ value | namespace.variant }}`, and left-to-right chaining.
- [x] Keep formatter support compiler-aware and tooling-readable so Vite, Forge, editor diagnostics, and AI-readable
  reports can detect unknown formatters and invalid formatter arguments.
- [x] Cover date, number, currency, pluralization, masks, and validation-message formatting without coupling the feature
  to `@vanrot/forms`.
- [x] Keep implementation outside `@vanrot/runtime` unless a tiny runtime hook is proven necessary and fits the size
  budget.

Deferred follow-ups:

- [ ] Rich editor completions for discovered pipe names, namespace variants, and argument hints.
- [ ] Future Forge UI consumption of `.pipe.ts` metadata when Forge exists.
- [ ] Additional built-in pipes only when real app usage proves the gap.

Possible slices:

- [ ] Formatter Registry
- [ ] Template Syntax Decision
- [ ] Tooling Diagnostics
- [ ] Common Formatter Set

## vanrot/seo

`vanrot/seo` shipped in Phase 27 as `@vanrot/seo`. It remains opt-in, keeps metadata behavior out of
`@vanrot/runtime`, and is covered by package, config, CLI, Vite build, doctor, and site-doc tests.

Shipped scope:

- [x] Typed metadata helpers, constants, static metadata, dynamic/async metadata, metadata ladder resolution, and canonical
  URL handling.
- [x] Structured data helpers, social metadata helpers, social image validation, SSR tag rendering, and client head updates.
- [x] Sitemap and robots generation hooks for app builds once `seo.siteUrl` is configured.
- [x] `vr create --seo`, `vr create --no-seo`, `vr add seo`, generated `src/app/seo.ts`, SEO config upsert, and `vr doctor`
  package/config drift checks.
- [x] Site docs explain the SEO ladder, `siteUrl` warning behavior, opt-in flows, build outputs, and the no-image-generation
  boundary.

## Vanrot Forge

Vanrot Forge is the parked name for a first-party Vite-like dev server and build tool for Vanrot apps. It should stay
post-production until the compiler, router, SSR, hydration, and docs/site surfaces are stable enough to dogfood it
without expanding the core runtime.

Forge should not decommission or replace Vite as a supported integration path. Some teams will still prefer Vite for
existing tooling, ecosystem plugins, or migration comfort. When Forge becomes available, `vr create` should prompt users
to choose between Forge and Vite, with Forge presented as the recommended first-party path because it can be tailored to
Vanrot's compiler, router, SSR, diagnostics, and project conventions.

Possible scope:

- [ ] Fast local dev server for Vanrot apps, including route-aware reloads and useful diagnostics.
- [ ] Production build pipeline that compiles Vanrot components, handles assets, and emits deployable static or SSR-ready
  output.
- [ ] First-party plugin hooks for framework packages without copying Vite's whole plugin surface too early.
- [ ] `vr create` project setup that offers Forge or Vite and keeps both starter paths maintained.

## CLI Prompt Roadmap

The `vr create` prompt flow is the framework's first impression. Keep the full prompt polish pass parked until the last
project juncture, after the first-party packages and major features are implemented.

Possible scope:

- [ ] One optional package selection step that can offer SEO, behavior, UI primitives, Forge, and future first-party packages.
- [ ] Package-specific follow-up prompts only after a package is selected, such as SEO's optional production `siteUrl`.
- [ ] Clear recommended defaults that help new users without hiding opt-out paths.
- [ ] Consistent wording, ordering, non-interactive flags, and `vr doctor` follow-up hints across every optional package.

## Activation Rules

Before executing any of these entries:

- [ ] Run a fresh brainstorming pass for the active entry.
- [ ] Write or update the matching spec.
- [ ] Write the matching implementation plan.
- [ ] Keep broad work split into lettered slices when needed.
- [ ] Update `docs/superpowers/feature-maturity.md` and `docs/superpowers/final-tdd-inventory.md` only when the
  entry status or framework surface changes.
- [ ] Run `pnpm verify` before marking anything complete.
