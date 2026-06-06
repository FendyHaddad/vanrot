# Phase 31 Editor Tooling Release Spec

## Status

Approved for planning.

Phase 31 turns the `Editor Tooling` future-pipeline bucket into one release. It must not be split into separate Web
Types, intelligence, navigation, fixes, and packaging phases. Those are workstreams inside this release.

## Goal

Ship the first release-grade JetBrains editor experience for Vanrot while keeping the JetBrains plugin a thin bridge over
the language server.

The finished release should let IntelliJ IDEA Ultimate and WebStorm users open a Vanrot repo and get useful recognition,
completion, navigation, diagnostics, code actions, and packaging confidence without Kotlin-side feature duplication.

## Problem

The current foundation is real but incomplete:

- `editors/intellij` exists and starts the bundled Vanrot language server.
- The plugin metadata is `com.vankode.vanrot` and displays as `Vanrot`.
- The plugin suppresses noisy empty-tag warnings for Vanrot template files.
- Root, site, UI, and router Web Types already cover core recognition paths.
- The language server already has initial completion, hover, definition, references, diagnostics, and expression rename.

The remaining gap is release quality. Web Types, language-server indexes, generated intelligence, template diagnostics,
rename/reference safety, docs, and plugin packaging still need to behave like one coherent editor product.

## Release Scope

Phase 31 ships all of this in one pass:

- Rich Web Types for Vanrot elements, route references, dotted no-value attributes, docs shared components, UI primitives,
  router elements, variants, and framework-owned attributes.
- A project intelligence export that exposes route graph, page/layout targets, component graph, template usage, source
  locations, diagnostics, generated metadata, and Web Types coverage to editors.
- Template navigation from route references, router elements, component tags, docs shared components, UI primitives, slot
  outlets, pages, and layouts.
- Rename-safe route references for syntax such as `<vr route.docs />`.
- Template diagnostics for unknown Vanrot elements, invalid variants, unknown route refs, repeated route literals,
  router/outlet misuse, and Vanrot file/convention mistakes.
- Code actions for simple mistakes such as route typos, route literal replacement, missing generated metadata, and missing
  Web Types/project metadata.
- Completion and inline documentation for `vr-router`, `vr-outlet`, `vr-*` UI primitives, route refs, variants, docs
  shared components, and framework-owned attributes.
- JetBrains compatibility and packaging smoke checks for IntelliJ IDEA Ultimate, WebStorm, the bundled server, plugin
  metadata, template globs, and release ZIP contents.

## Non-Goals

- Do not build editor behavior in Kotlin when the language server or Web Types can own it.
- Do not add a VS Code plugin in this phase.
- Do not change Vanrot template syntax to satisfy one IDE warning.
- Do not treat native bracket bindings such as `[hidden]`, `[href]`, `[disabled]`, or `[id]` as Vanrot failures when the
  compiler accepts the template.
- Do not treat docs shared component bindings such as `[title]`, `[summary]`, `[sectionLinks]`, `[sectionId]`, `[points]`,
  or `[code]` as page-authoring defects.
- Do not make `@vanrot/runtime` heavier.

## Architecture

### Language Server Owns Behavior

`packages/language-server` is the editor brain. It owns:

- project-root discovery;
- route, page, layout, component, and template indexes;
- Web Types ingestion;
- completion, hover, definition, references, rename, diagnostics, and code actions;
- project intelligence export;
- bundled-server output for JetBrains.

`editors/intellij` stays thin. It should:

- locate Node;
- start the bundled Vanrot language server;
- pass the project root to the server;
- register Vanrot template-file support;
- suppress only the known empty-tag inspection noise;
- package the server and metadata.

### Web Types Own Recognition

Web Types stay the first line of IDE recognition:

- `web-types.json` owns root project coverage.
- `apps/vanrot-site/web-types.json` owns docs-site-specific shared component and route symbols.
- `packages/ui/web-types.json` owns UI primitive symbols.
- `packages/router/web-types.json` owns router element and route shorthand symbols.

The language server may read these files to avoid duplicating element, attribute, variant, and source metadata.

### Project Intelligence Contract

Phase 31 adds a stable editor intelligence shape generated at `.vanrot/editor-intelligence.json`. The language server
should expose the same payload through its project loader so editor adapters and AI tooling read one contract:

```ts
interface VanrotEditorIntelligence {
  schemaVersion: 1;
  projectRoot: string;
  routes: VanrotEditorRoute[];
  components: VanrotEditorComponent[];
  templates: VanrotEditorTemplate[];
  webTypes: VanrotEditorWebTypesSummary;
  diagnostics: VanrotEditorDiagnosticSummary[];
  generatedMetadata: VanrotEditorGeneratedMetadata[];
}
```

Routes must include route key, route-table source span, path or path expression when available, page target, layout target,
children, and source-file locations. Components must include tag name, class name, role suffix, component file, template
file, style file, source span, and docs/Web Types source when available. Templates must include used Vanrot tags, route
refs, dotted no-value attributes, bracket bindings, source locations, and unknown symbols.

## Editor Behavior

### Completion And Inline Docs

Completion should use the workspace index and Web Types metadata to offer:

- route names after `route.`;
- `vr`, `vr-router`, and `vr-outlet`;
- UI primitive tags and anatomy tags;
- docs shared component tags inside the docs app;
- page, layout, component, dialog, widget, and form tags discovered from the workspace;
- route attributes and route-specific attributes;
- dotted no-value attributes such as `value.settings`;
- variant and framework-owned attributes;
- useful `detail` and `documentation` strings.

### Navigation

Definitions should support:

- route ref to route key in `src/routes.ts`;
- route ref to page and layout target locations when the route table declares them;
- component tag to component source file;
- docs shared component tag to shared component source file;
- UI primitive tag and anatomy tag to primitive source file;
- slot references to owning slot outlet;
- router elements to router package source when source is available.

When multiple useful targets exist, the language server should return multiple definition locations rather than choosing a
single lossy target.

### References And Rename

References should use indexed templates, not only currently opened documents.

Route rename must be safe for `<vr route.name />` syntax:

- renaming a route reference updates matching route attributes in indexed templates;
- the route key in `src/routes.ts` is included when the route table is indexed;
- unrelated dotted attributes are not touched;
- unknown or ambiguous route refs return no edit rather than guessing.

Expression rename remains scoped to expression references and should not be mixed with route rename edits.

### Diagnostics

Template diagnostics should flag:

- unknown Vanrot elements;
- invalid UI variant attributes;
- unknown route refs;
- repeated literal paths that match known routes;
- `vr-router` and `vr-outlet` misuse;
- missing generated metadata or stale Web Types coverage;
- Vanrot convention mistakes in role-suffixed files.

Diagnostics must preserve current compiler diagnostics and expression diagnostics. They should add editor-only findings
only when the compiler and Web Types source of truth support the finding.

### Code Actions

Code actions should cover simple, deterministic fixes:

- correct a route typo to the closest known route;
- replace a literal link/path with `<vr route.name />` or the named route object pattern;
- refresh or add missing generated editor metadata;
- point to the exact Web Types file when a metadata declaration is missing.

Actions must not silently rewrite app logic.

## JetBrains Plugin Release

The plugin release should prove these files are in the ZIP or sandbox:

- `META-INF/plugin.xml` with id `com.vankode.vanrot` and name `Vanrot`;
- the bundled language-server entrypoint;
- the bundled language-server package metadata;
- template globs generated from `packages/language-server/src/template-files.ts`;
- any editor intelligence metadata needed by the bundled server;
- tests proving the template-file rules match the language-server rules.

The plugin should be verified against IntelliJ IDEA Ultimate and WebStorm through the JetBrains verifier matrix when the
local toolchain can fetch the IDE artifacts. If that matrix is unavailable locally, the release must record the reason and
still run deterministic Gradle tests plus ZIP-content smoke checks.

## Docs IA

Phase 31 adds real docs page routes, not hash-only sections:

- parent label: `Editor Tooling`
- parent route: `/docs/editor-tooling`
- child route: `/docs/editor-tooling/web-types`
- child route: `/docs/editor-tooling/navigation`
- child route: `/docs/editor-tooling/diagnostics`
- child route: `/docs/editor-tooling/jetbrains`

Each page must have `.page.ts`, `.page.html`, and `.page.css` files under `apps/vanrot-site/src/pages/docs/`, use shared
docs components, and derive route/sidebar/article metadata from `apps/vanrot-site/src/docs/docs-page-tree.ts`.

AI docs must include the editor tooling routes, language-server behavior, Web Types contract, JetBrains plugin setup, and
known non-issues so AI tools stop treating valid docs bindings or native bracket bindings as source bugs.

## Verification

Phase 31 is done only when these pass:

- `pnpm --filter @vanrot/language-server test`
- `pnpm --filter @vanrot/language-server typecheck`
- `pnpm --filter @vanrot/language-server build:intellij`
- `pnpm exec vitest run scripts/verify-web-types-coverage.test.mjs`
- `pnpm exec vitest run scripts/verify-component-cascade.test.mjs`
- `pnpm exec vitest run apps/vanrot-site/tests/docs-page-tree.test.ts`
- `pnpm verify:site-docs`
- `pnpm verify:ai-docs`
- `cd editors/intellij && ./gradlew test`
- `cd editors/intellij && ./gradlew buildPlugin`
- `pnpm verify`

Release verification must also inspect the built plugin ZIP for `plugin.xml`, bundled server files, and generated template
globs.

## Tracker Closeout

When the implementation ships:

- tick Phase 31 in `docs/superpowers/feature-maturity.md`;
- mark the Editor Tooling future-pipeline section as shipped or remove the active candidate;
- add final TDD inventory rows for editor metadata, language-server intelligence, template navigation, diagnostics/code
  actions, route rename, docs IA, AI docs, and JetBrains plugin packaging;
- update changelog and release notes if public package behavior changes;
- report commit safety and `publish.sh` safety from current gates.

## Release Acceptance

Users should be able to install the JetBrains plugin, open a Vanrot repo, and get a coherent Vanrot-aware editor surface:
recognition, completion, navigation, diagnostics, fixes, docs, and packaged language-server behavior all come from shared
Vanrot sources of truth.
