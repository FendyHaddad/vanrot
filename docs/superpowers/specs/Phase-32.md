# Phase 32 Vanrot Forge Spec

## Status

Implemented in Phase 32.

Phase 32 turned the `Vanrot Forge` future-pipeline item into the concrete `@vanrot/forge` package, engine-aware config and
CLI flows, native dev/build surfaces, docs IA, AI docs, examples, and benchmark guardrails. Public performance claims stay
blocked until the benchmark harness records measured Forge and Vite timings from the same fixture shape.

## Goal

Ship `@vanrot/forge` as the native Vanrot app engine.

Forge should become the recommended engine for new Vanrot apps because it only needs to understand Vanrot. Vite remains a
supported compatibility engine for teams that need the wider Vite ecosystem, existing plugin chains, or migration comfort.

The finished Forge release should make normal Vanrot apps faster to start, faster to edit, clearer to diagnose, simpler to
build, and easier to document than the Vite compatibility path.

## Product Thesis

Forge is not a Vite replacement for every frontend project. Forge is Vanrot's own app engine.

Vite can support many Vanrot features through `@vanrot/vite-plugin`, but Vite starts from a generic module graph and lets
Vanrot adapt itself through plugin hooks. Forge starts from the Vanrot app graph:

- pages;
- layouts;
- components;
- templates;
- scoped styles;
- route metadata;
- SSR and static output modes;
- first-party package capabilities;
- diagnostics;
- AI, devtools, and editor metadata.

For Vanrot apps, Forge must be the best supported path. Any normal Vanrot app where the Vite path is faster, clearer, or
more complete should be treated as either a Forge backlog bug or an explicitly documented compatibility exception.

## Engine Contract

`vr create` should ask which engine the project uses:

- `Forge` is the recommended default.
- `Vite` remains available as the compatibility path.

The selected engine belongs in `vanrot.config.ts` as a top-level app lifecycle setting:

```ts
import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  engine: 'forge',
});
```

Engine values:

- `forge`: `vr dev` and `vr build` dispatch to `@vanrot/forge`.
- `vite`: `vr dev` and `vr build` dispatch to Vite with `@vanrot/vite-plugin`.

CLI behavior:

- `vr dev` reads `vanrot.config.ts` and uses the selected engine.
- `vr build` reads `vanrot.config.ts` and uses the selected engine.
- `vr dev --forge` and `vr build --forge` override config for one command.
- `vr dev --vite` and `vr build --vite` override config for one command.
- `vr doctor` reports engine, dependency, and config mismatches.
- `vr config recover` writes the canonical engine default.

Starter script behavior:

```json
{
  "scripts": {
    "dev": "vr dev",
    "build": "vr build"
  }
}
```

Package scripts should not encode the engine. The project config owns the engine choice.

## Package Boundaries

### `@vanrot/forge`

The native Vanrot app engine. It owns dev, build, diagnostics, app graph, route graph, and first-party package hooks.

Internal areas:

- `core`: config loading, app graph, route graph, file ownership, source roots, dependency graph, and shared diagnostics.
- `dev`: local server, file watcher, reload planner, browser client, route-aware refresh behavior, and dev overlays.
- `build`: static output, SSR-ready entries, assets, route manifests, metadata manifests, and deployment output.
- `hooks`: narrow first-party hook API for Vanrot packages.
- `diagnostics`: Forge-specific codes, fix hints, docs links, and doctor integration.
- `benchmarks`: repeatable fixtures and measurements against the Vite compatibility path.

### `@vanrot/cli`

The user command surface. It should not duplicate Forge internals.

- `vr create` records the selected engine.
- `vr dev` and `vr build` dispatch to Forge or Vite.
- `vr doctor` explains engine mismatches and migration issues.

### `@vanrot/config`

The source of truth for shared project settings.

- Adds `engine: 'forge' | 'vite'`.
- Normalizes the default engine.
- Validates invalid engine values.
- Renders canonical config with the engine field.

### `@vanrot/vite-plugin`

The compatibility implementation. It stays supported and maintained.

Vite should remain a valid path for teams that need Vite ecosystem behavior, but Vite should not define the native Vanrot
engine contract.

## First-Party Hook Model

Forge should not clone the full Vite plugin surface. The first hook API should be narrow and Vanrot-native.

Initial hook concepts:

- contribute diagnostics;
- read and extend the Vanrot app graph;
- contribute route metadata;
- contribute SSR or static build metadata;
- contribute asset or manifest outputs;
- contribute devtools metadata;
- contribute AI/editor metadata;
- observe build and dev lifecycle phases.

Initial package candidates:

- `@vanrot/router`;
- `@vanrot/ssr`;
- `@vanrot/seo`;
- `@vanrot/store`;
- `@vanrot/forms`;
- `@vanrot/ui`;
- `@vanrot/behavior`;
- `@vanrot/devtools`;
- `@vanrot/ai`;
- `@vanrot/testing`.

The hook API should favor readable object/function shapes over shorthand. Unsupported third-party ecosystem behavior should
produce clear diagnostics instead of hidden partial support.

## Dev Server Contract

Forge dev mode should be built around Vanrot file roles, not generic frontend files.

Tracked source surfaces:

- `.page.ts`;
- `.page.html`;
- `.page.css`;
- `.component.ts`;
- `.component.html`;
- `.component.css`;
- `.layout.ts`;
- `.layout.html`;
- `.layout.css`;
- route metadata;
- `vanrot.config.ts`;
- generated Vanrot metadata;
- first-party package config and generated files.

Reload planner outcomes:

- template patch;
- scoped style patch;
- component refresh;
- route refresh;
- layout refresh;
- app graph rebuild;
- full browser reload;
- dev server restart for config or dependency changes.

Dev diagnostics should include:

- diagnostic code;
- severity;
- affected file and role;
- affected route or component when known;
- plain-English fix hint;
- docs link;
- related `vr doctor` check when relevant.

## Build Contract

Forge build mode should emit Vanrot deployment output from the same app graph used by dev.

Required outputs:

- browser assets;
- static route output when configured;
- SSR-ready entries when configured;
- route manifest;
- asset manifest;
- SEO outputs when `@vanrot/seo` is enabled;
- AI/editor metadata when enabled;
- devtools metadata when enabled;
- diagnostics summary.

Build should not emit generic adapter files unless a deployment target needs them. Vanrot output should be readable and
traceable to source routes and components.

## Performance And Weight Contract

Forge is allowed to be faster and lighter than Vite because it does not need to support React, Vue, Svelte, arbitrary Vite
plugin chains, or non-Vanrot app models.

Performance claims must be tested, not marketed.

Benchmark targets:

- faster cold `vr dev` startup than the Vite starter path;
- faster edit loop for `.page.html`;
- faster edit loop for `.page.css`;
- faster edit loop for `.page.ts`;
- faster edit loop for `.component.*`;
- faster route metadata rebuilds;
- smaller dev dependency surface than `vite + @vanrot/vite-plugin`;
- equal or better production output for Vanrot fixture apps.

Benchmarks should live in repo fixtures and be repeatable in CI or a documented local benchmark command. Any benchmark that
cannot run deterministically should be documented as exploratory rather than acceptance proof.

## Docs Information Architecture

Forge docs must be rich and follow the existing Vanrot docs-site convention. Thin pages are incomplete work.

Every Forge docs page must be a real page component triplet under `apps/vanrot-site/src/pages/docs/framework/forge/` (the same `docs/framework/<engine>/` layout used by the `vite-plugin` docs):

- `.page.ts`;
- `.page.html`;
- `.page.css`.

Every page must be wired through `apps/vanrot-site/src/docs/docs-page-tree.ts`. Sidebar children that look like pages must
be real child pages with their own article keys, route paths, route-to-article mapping, generated docs entry, AI-doc output,
and route/render tests. Do not represent Forge child pages as `#section` anchors inside the parent article.

Required routes:

- `/docs/forge`;
- `/docs/forge/dev`;
- `/docs/forge/build`;
- `/docs/forge/config`;
- `/docs/forge/hooks`;
- `/docs/forge/benchmarks`.

### `/docs/forge`

Parent overview page.

Must cover:

- what Forge is;
- why Vanrot has a native engine;
- Forge vs Vite positioning;
- package boundaries;
- lifecycle map from create to dev to build to deploy;
- performance and benchmark promise;
- links to every Forge child guide.

### `/docs/forge/dev`

Dev server guide.

Must cover:

- Vanrot file roles;
- app graph scanning;
- route-aware reload behavior;
- reload planner outcomes;
- diagnostics and overlays;
- config and dependency change behavior;
- common failure states and repairs;
- Vite compatibility comparison.

### `/docs/forge/build`

Build guide.

Must cover:

- static output;
- SSR-ready output;
- asset handling;
- route manifests;
- SEO outputs;
- AI/editor metadata;
- devtools metadata;
- deployment output shape;
- build diagnostics;
- Vite compatibility comparison.

### `/docs/forge/config`

Config guide.

Must cover:

- `engine: 'forge' | 'vite'`;
- default `Forge` choice during `vr create`;
- command overrides;
- starter scripts;
- dependency expectations;
- `vr doctor` checks;
- migration from Vite to Forge;
- migration from Forge to Vite when a project needs compatibility behavior.

### `/docs/forge/hooks`

Hook guide.

Must cover:

- first-party hook lifecycle;
- supported hook capabilities;
- unsupported plugin-ecosystem expectations;
- package integration examples;
- diagnostics for unsupported hooks;
- why Forge hooks are narrower than Vite plugins.

### `/docs/forge/benchmarks`

Benchmark guide.

Must cover:

- what is benchmarked;
- fixture apps;
- cold dev startup;
- edit loop timings;
- dependency surface;
- production output checks;
- how to run the benchmark;
- how to interpret failures;
- why claims must stay tied to evidence.

## Docs Verification

Forge docs implementation must include tests that fail if docs are thin or detached.

Required proof:

- route/page mapping test for every Forge page;
- sidebar/menu test for the Forge parent and children;
- render test for every Forge page;
- generated AI-doc inclusion for every Forge page;
- route-to-article mapping for every Forge page;
- test that child pages are real routes, not `#section` links;
- docs examples use real import paths, config fields, commands, and package names.

When site files change, the local docs dev server must be restarted on port `1964`, the relevant Forge route must respond,
and browser inspection must verify visible output.

## Delivery Slices

### Slice 1: Spec And Config Contract

- Add this spec.
- Add planning notes for `engine: 'forge' | 'vite'`.
- Keep Vite supported.
- Define benchmark and docs acceptance requirements before implementation.

### Slice 2: Package Shell

- Add `packages/forge`.
- Add exports, package metadata, typecheck, tests, and build.
- Add CLI detection that produces useful diagnostics when Forge is selected before the implementation is ready.

### Slice 3: Dev Server MVP

- Build the Vanrot app graph scanner.
- Build the local dev server.
- Build file watching and reload planner.
- Support template and scoped style edits first.
- Add diagnostics for unsupported project shapes.

### Slice 4: Build MVP

- Compile Vanrot components from the app graph.
- Emit static output first.
- Add SSR-ready entries after static output is stable.
- Emit route, asset, SEO, AI/editor, and devtools manifests where applicable.

### Slice 5: Hooks And Package Integration

- Add first-party hook API.
- Integrate router, SSR, SEO, devtools, and AI metadata first.
- Add Store, Forms, UI, Behavior, and Testing integration when their metadata contracts are stable.

### Slice 6: Create, Migration, And Doctor

- Update `vr create` to choose Forge or Vite.
- Keep starter scripts engine-neutral.
- Add doctor checks for engine dependencies and config mismatch.
- Add migration guidance and diagnostics.

### Slice 7: Docs And Benchmarks

- Ship full Forge docs IA.
- Ship benchmark fixtures and commands.
- Verify Forge is faster/lighter for supported Vanrot fixtures before making public claims.

## Acceptance Criteria

Forge is ready for its first release when:

- `@vanrot/forge` exists and builds cleanly;
- `vanrot.config.ts` supports `engine: 'forge' | 'vite'`;
- `vr create` writes the selected engine;
- `vr dev` and `vr build` dispatch by selected engine;
- Vite remains a maintained compatibility path;
- Forge dev server supports route-aware Vanrot reloads;
- Forge build emits deployable Vanrot output;
- first-party package hooks exist without cloning Vite's whole plugin surface;
- benchmark fixtures prove Forge performance claims against the Vite path;
- rich docs pages exist for every Forge route listed in this spec;
- AI docs and docs-site navigation include Forge;
- `pnpm verify` passes.

## Non-Goals

- Supporting React, Vue, Svelte, or generic frontend frameworks.
- Replacing Vite for teams that need Vite ecosystem plugin chains.
- Cloning Vite's plugin API.
- Adding browser runtime weight to `@vanrot/runtime`.
- Shipping public performance claims without committed benchmark proof.
- Shipping docs as one parent article with fake child anchors.

## Open Questions For Planning

- Which benchmark command should become the canonical Forge performance gate?
- Should Forge ship static output before SSR output, or should the first build MVP support both behind separate fixtures?
- Which first-party packages must have hooks in the first Forge release?
- Should `engine` default to `forge` for recovered config in existing apps, or only for newly created apps?
- What explicit diagnostics should appear when a Vite-engine project tries to use Forge-only config?
