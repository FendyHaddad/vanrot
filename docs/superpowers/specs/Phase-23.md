# Phase 23 Devtools And Project Intelligence

## Purpose

Phase 23 turns Vanrot project intelligence into an authoritative graph system that humans, browser devtools, and AI tools can inspect without guessing framework behavior.

Earlier phases created deterministic project intelligence through `vr map`, `.vanrot/project-map.json`, and `.vanrot/ai-rules.md`. Phase 23 keeps that foundation and grows it into a graph manifest, a real Chrome and Edge DevTools panel, and configurable provider-neutral AI rules.

The goal is not to build a visual IDE. The goal is a reliable inspection layer: run `vr map`, start a Vanrot app, open Vanrot DevTools, and understand the app graph from local metadata.

## Approved Direction

Phase 23 uses the **Manifest-First Devtools** approach.

Approved decisions:

- Treat `.vanrot/project-map.json` as the authoritative graph manifest.
- Extend `vr map` quietly instead of adding `vr graph` or `vr inspect` now.
- Create a new `@vanrot/devtools` package.
- Ship a real Chrome and Edge DevTools extension panel.
- Make the first panel app-graph-first: routes, pages, layouts, components, imports, and generated metadata.
- Serve manifest data to the extension through a Vite dev-server metadata endpoint.
- Keep stale graph detection warn-only.
- Keep AI rules provider-neutral and make sections configurable from `vanrot.config.ts`.
- Consume existing compiler and Vite metadata only; do not expand compiler internals for deeper graph extraction in this phase.

## Phase Slices

Phase 23 is one parent architecture with five implementation slices:

- **23A Project Map Graph**: expand `.vanrot/project-map.json` into a versioned graph manifest.
- **23B Route And Component Graphs**: enrich the manifest with route, layout, page, component, import, style, and asset relationships.
- **23C Runtime Graph Metadata Contract**: define the runtime graph contract and minimal metadata hooks needed for later runtime inspection.
- **23D Devtools Panel And Metadata Transport**: ship `@vanrot/devtools`, the Chrome and Edge DevTools panel, and the Vite metadata endpoint.
- **23E AI Rules Customization**: make `.vanrot/ai-rules.md` configurable from `vanrot.config.ts` while staying provider-neutral.

The slices should share one graph contract. Later slices must not invent parallel metadata shapes.

## Architecture

The graph manifest is the center of the system.

```text
source files + routes + existing compiler/Vite metadata
  -> vr map
  -> .vanrot/project-map.json
  -> Vite metadata endpoint
  -> @vanrot/devtools panel
```

`@vanrot/cli` remains responsible for deterministic graph manifest generation through `vr map`.

`@vanrot/vite-plugin` serves generated metadata during local development. It should read the manifest, check whether it appears stale, and expose connection/status details to devtools. It should not become the primary graph builder.

`@vanrot/devtools` owns extension packaging, panel UI, shared devtools graph types, fixture data, panel state normalization, and future runtime graph UI work.

`@vanrot/config` owns AI rules customization shape and validation.

## Graph Manifest Contract

`.vanrot/project-map.json` should grow from a role-file inventory into a versioned graph manifest.

Required top-level fields:

- `schemaVersion`
- `generatedAt`
- `projectRoot`
- `sourceFingerprint`
- `stale`
- `roles`
- `graph`
- `routes`
- `compiler`
- `ai`

The `stale` field should include a boolean and readable reasons. Stale data is a warning, not a blocker.

The `graph` section should include:

- `nodes`: stable ids, type, label, source path, role, and metadata summary;
- `edges`: stable source id, target id, relationship kind, and optional source location;
- relationship kinds for route-to-page, route-to-layout, layout-to-child-route, component-to-style, component-to-import, component-to-template, and component-to-asset where available.

The `routes` section should include route refs, paths, parents, layouts, pages, children, and navigation metadata when already available.

The `compiler` section should include existing metadata only, such as template usage, bindings, styles, source locations, source-map-aligned metadata, and diagnostics where already exposed by compiler or Vite code.

The `ai` section should include generated rules path, enabled section ids, config source, warnings, and generated timestamp.

## Stale Detection

Stale detection should be conservative and warn-only.

`vr map` should write a source fingerprint from relevant project files and config. The Vite metadata endpoint should compare current source state to the manifest fingerprint and return stale status with reasons.

Consumers should still render stale data:

- CLI output should warn that the graph may be stale.
- Devtools should show stale status near the manifest metadata.
- AI rules metadata should show warnings without suppressing generated guidance.

Auto-regeneration is out of scope for Phase 23.

## Devtools Product Shape

`@vanrot/devtools` should ship a real browser DevTools extension panel for Chrome and Edge.

The first panel should answer one practical question:

> What Vanrot app structure is this running with?

Initial panel views:

- app graph overview;
- route tree;
- component relationship view;
- selected-node details;
- manifest status;
- endpoint connection state;
- schema compatibility state;
- empty and error states.

The panel should inspect authoritative metadata. It should not scrape the DOM or infer project structure from rendered markup.

The panel should use separate HTML, TypeScript, and CSS files. Do not put UI markup in TypeScript.

## Metadata Endpoint

`@vanrot/vite-plugin` should expose a local development endpoint for devtools metadata.

The endpoint should return:

- graph manifest data;
- manifest freshness;
- schema version support;
- generated timestamp;
- endpoint status;
- actionable warnings for missing, stale, unreadable, or unsupported manifest files.

The endpoint should be local-development-only and should not expose unrelated project files.

The extension should handle endpoint unavailable, no manifest, stale manifest, and unsupported schema states without crashing.

## Runtime Graph Contract

Phase 23C should create the contract for runtime graph inspection without forcing the first panel to ship a full signal graph UI.

The contract should identify:

- runtime graph schema version;
- app/session identity;
- component instance nodes;
- signal, computed, and effect node shapes;
- dependency edge shapes;
- update event shape;
- disposal event shape;
- unsupported-runtime warning shape.

The first implementation can expose minimal hooks and fixture-backed panel states. Full signal graph visualization is not required for Phase 23D's first app-graph panel.

## AI Rules Customization

Phase 23E should keep `.vanrot/ai-rules.md` generated and provider-neutral.

`vanrot.config.ts` should support:

- enabling and disabling known AI rules sections;
- adding project-specific rule sections;
- deterministic section ordering;
- validation diagnostics for unknown section ids;
- validation diagnostics for invalid ordering;
- generated-file warnings.

Phase 23 should not create Codex-specific or Claude-specific rules files. Provider-specific consumption belongs to Phase 25.

## Error Handling

Phase 23 should prefer useful degradation over hard failure.

Expected error states:

- manifest missing;
- manifest stale;
- manifest schema unsupported;
- manifest unreadable;
- Vite metadata endpoint unavailable;
- compiler metadata unavailable;
- route graph partially unresolved;
- AI rules config invalid.

CLI and devtools output should explain the problem, show what still rendered, and give the next action when clear.

## Testing And Verification

Phase 23 should add focused coverage for each slice:

- graph manifest schema tests;
- `vr map` generation tests;
- route, component, import, style, and asset graph tests;
- stale warning tests;
- Vite metadata endpoint tests;
- devtools data normalization tests;
- devtools empty, stale, unsupported-schema, and endpoint-error state tests;
- AI rules customization tests;
- config validation diagnostics tests.

If browser extension automation is reliable in the local toolchain, add a minimal browser check that the devtools panel renders fixture graph data. If extension automation is brittle, keep the panel view tested through package-level rendering or fixture tests and document the manual verification path.

`pnpm verify` remains the final gate before marking the phase complete.

## Out Of Scope

These stay outside Phase 23:

- deep compiler rewrites for graph extraction;
- a new `vr graph` command;
- a new `vr inspect` command;
- auto-regenerating stale graph data;
- provider-specific AI files;
- Phase 25 AI knowledge bundle work;
- MCP server work;
- Skill.sh package work;
- full runtime signal graph UI as the first devtools panel;
- non-Chrome and non-Edge extension support unless it is cheap and verified;
- DOM scraping as a source of truth.

## Completion Criteria

Phase 23 can be marked complete when:

- `.vanrot/project-map.json` is a versioned graph manifest;
- `vr map` writes app graph data with warn-only stale detection;
- route, layout, page, component, import, style, and asset relationships are represented where available;
- compiler-aware fields consume existing metadata without deep compiler expansion;
- `@vanrot/devtools` exists and owns the browser extension panel;
- the Chrome and Edge DevTools panel renders app graph data through the Vite metadata endpoint;
- missing, stale, unsupported, and endpoint-error states are handled clearly;
- AI rules sections are configurable through `vanrot.config.ts`;
- docs, tests, inventory, presentation, and maturity ledger are updated during implementation;
- `pnpm verify` passes.
