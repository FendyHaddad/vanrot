# Vanrot Phase 12D Vite Plugin Production Hardening Design

**Date:** 2026-05-22
**Phase:** Phase 12D - Vite Plugin Production Hardening
**Packages:** vite-plugin, compiler, tests, docs
**Status:** Draft for review
**Related:**
- `AGENTS.md`
- `audits/core/vite-plugin.audit.ts`
- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/final-tdd-inventory.md`
- `packages/vite-plugin`
- `packages/compiler`

## 1. Goal

Phase 12D makes `@vanrot/vite-plugin` production-ready for the current Vanrot component model.

Phases 4 and 12A left the Vite plugin demo-capable with known production gaps. The current red audit exposes one of those gaps: template edits force a full reload instead of returning the owner component module for Vite-managed HMR. Phase 12D owns that gap and the rest of the Vite plugin production contract: exports, defaults, transforms, virtual modules, diagnostics, dev invalidation, HMR fallback behavior, source maps, and clean fixture build behavior.

This phase should not change Vanrot runtime lifecycle semantics, compiler template syntax, router behavior, UI packages, or Phase 13 project configuration conventions.

## 2. Scope

Phase 12D covers the current `@vanrot/vite-plugin` surface:

- the `vanrot()` default plugin export and `vanrotPlugin` alias;
- default include behavior for `.component.ts`, `.page.ts`, and `.button.ts`;
- component TypeScript transforms in dev and production build;
- virtual source modules used by transformed component code;
- virtual CSS modules used by generated CSS imports;
- compiler diagnostic formatting for Vite errors and warnings;
- sibling HTML/CSS watching and invalidation;
- owner-module HMR for sibling template/style edits;
- full reload fallback when owner-module HMR cannot be applied;
- Vite-facing JavaScript and CSS sourcemaps;
- a clean app-style fixture that consumes built workspace package outputs.

The `@vanrot/vite-plugin` rows in `docs/superpowers/final-tdd-inventory.md` may be marked `Production-Ready` only after this slice has implementation, focused package coverage, audit coverage, build fixture coverage, docs tracker updates, and verification evidence.

## 3. Architecture

The plugin remains a thin Vite integration layer. Each module keeps one clear responsibility:

- `plugin.ts` orchestrates Vite hooks and delegates work.
- `compile-for-vite.ts` converts compiler output into Vite transform output, including JS/CSS sourcemap payloads.
- `virtual-modules.ts` owns public and resolved virtual module IDs.
- `component-files.ts` owns role-file path conventions for `.component`, `.page`, and `.button`.
- `hot-update.ts` maps sibling HTML/CSS changes to owner component modules and chooses HMR or fallback reload.
- `diagnostics.ts` formats compiler diagnostics for Vite warnings and errors.

The plugin should treat Vanrot component modules like normal Vite modules. Transform hooks return code and maps. Virtual CSS participates in dev and build. Sibling file edits invalidate the owning component module. HMR returns owner modules when possible. Full reload remains a fallback, not the default behavior for valid owner modules.

## 4. Transform And Virtual Module Flow

When Vite transforms a supported role TypeScript file:

1. The plugin resolves the owner component path and sibling template/style paths.
2. The plugin calls `this.addWatchFile()` for the sibling template and style files.
3. `compileForVite()` calls the compiler with a virtual source import specifier.
4. Compiler JavaScript is wrapped with a virtual CSS import and a default component export.
5. Compiler CSS is stored by owner component path for the virtual CSS module.
6. The transform result returns `{ code, map }` with a Vite-valid JavaScript sourcemap.

Virtual source modules must preserve the original component TypeScript source import without recursive Vanrot transforms. Virtual CSS modules must serve the current compiled CSS for the owner component path and return a Vite-valid CSS sourcemap when sourcemaps are enabled.

Virtual module IDs must remain encoded and cross-platform safe. Public IDs remain user-facing import specifiers. Resolved IDs remain internal plugin IDs.

## 5. Source Maps

Phase 12D adds real Vite-facing sourcemaps for transformed component JavaScript and virtual CSS.

If the compiler already exposes enough mapping data, the Vite plugin should pass that through. If the compiler output is not sufficient, Phase 12D may add the smallest compiler result shape needed for the plugin to produce valid maps. That addition should stay source-map focused and must not expand compiler syntax or runtime behavior.

The source map contract is:

- component transform maps point generated JavaScript back to the component source, template, or style source where the compiler can identify the origin;
- virtual CSS maps point generated CSS back to the owner style file;
- production build emits map assets when Vite sourcemaps are enabled;
- dev transform results contain valid map objects instead of always returning `null`.

Source-map perfection is not required in this phase. Vite-valid maps with stable source references and regression tests are required.

## 6. Diagnostics Contract

The diagnostics bridge remains text-based in Phase 12D.

`formatDiagnostic()` should format every compiler diagnostic as:

```text
file:line:column CODE message
```

Additional details are appended only when present:

- `codeFrame` on following lines;
- `Suggestion: ...` for `suggestion`;
- `Docs: ...` for `docsPath`.

Compiler errors call `this.error(formatted)`. Compiler warnings call `this.warn(formatted)`.

This phase does not add Vite overlay metadata, custom error objects, or editor navigation hooks beyond the formatted message.

## 7. Hot Update Contract

`handleVanrotHotUpdate()` should follow guard-clause flow:

1. If the changed file is not a Vanrot sibling template/style file, return `undefined`.
2. Resolve the owner component TypeScript path.
3. Notify the module graph that the owner file changed when the Vite API is available.
4. Find owner modules by file, id, and URL.
5. If owner modules exist, invalidate each owner module and return those modules.
6. If no owner module exists, send a full reload and return `[]`.

For a known owner module, the plugin must not send `{ type: 'full-reload' }`. Returning owner modules lets Vite perform its normal HMR propagation. This is the state-preserving behavior owned by Phase 12D.

Generated `import.meta.hot.accept()` and `import.meta.hot.dispose()` support is intentionally deferred. That later work may improve state preservation and cleanup, but Phase 12D should not cross into runtime/compiler-owned HMR lifecycle semantics.

## 8. Clean Fixture Contract

Phase 12D should add or adapt a Vite fixture that behaves like an app consuming built workspace packages.

The fixture should avoid direct aliases to package `src` entries for the plugin, runtime, and router. It should consume built package outputs through app-style package resolution. The fixture does not need to simulate registry publication, but it should prove that a clean app can use package outputs rather than internal source paths.

Build tests should prove:

- JavaScript assets are emitted;
- CSS assets are emitted;
- sourcemap assets are emitted when sourcemaps are enabled;
- compiled Vanrot CSS appears in the output;
- stale fixture output is cleaned between runs.

## 9. Testing Model

Normal package tests should cover:

- `vanrot()` default export and `vanrotPlugin` alias;
- default include behavior for `.component.ts`, `.page.ts`, and `.button.ts`;
- transform results that include code and Vite-valid JavaScript sourcemaps;
- virtual source modules that avoid recursive transforms and preserve imports;
- virtual CSS dev loading and CSS sourcemaps;
- rich diagnostic formatting with code frame, suggestion, and docs path;
- sibling HTML/CSS edits that invalidate and return the owner module;
- missing owner modules that fall back to full reload;
- production build output for JS, CSS, and sourcemaps;
- clean app-style fixture package consumption.

The audit lane should pass the 12D Vite plugin audit after owner-module HMR replaces template-change full reloads. Audit failures owned by later phases should remain tracked instead of being hidden by broad workarounds.

## 10. Documentation And Tracker Updates

When Phase 12D implementation completes:

- mark the matching `docs/superpowers/plans/Phase-12D.md` tasks complete;
- update the Vite plugin rows in `docs/superpowers/final-tdd-inventory.md`;
- update `docs/superpowers/feature-maturity.md` for any Vite plugin maturity changes;
- update `docs/vanrot-presentation.html` so the roadmap matches the tracker;
- keep deferred HMR accept/dispose, Phase 13 config conventions, and Phase 12E type-contract work tracked as unfinished where applicable.

Do not mark Phase 12 complete unless all Phase 12 slices and phase documentation checks are complete.

## 11. Verification Gates

Phase 12D should run:

```sh
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/vite-plugin typecheck
pnpm audit:core
pnpm verify
```

`pnpm verify` remains the phase-completion gate because it includes package typecheck, tests, build, runtime size budget, and phase documentation verification.

## 12. Non-Goals

Phase 12D does not include:

- generated `import.meta.hot.accept()` or `import.meta.hot.dispose()` code;
- Vanrot-owned runtime state preservation beyond Vite owner-module HMR;
- custom role suffixes or config-driven conventions;
- malformed plugin option shape checks;
- transformed module typing without `@ts-expect-error`;
- Vite overlay metadata beyond formatted diagnostic text;
- registry publication simulation.

## 13. Acceptance Criteria

Phase 12D is accepted when:

- the Vite plugin audit passes for owner-module HMR;
- template and style edits return owner modules when Vite can resolve them;
- full reload occurs only as the missing-owner fallback;
- transforms and virtual CSS return Vite-valid sourcemaps;
- production build emits JS, CSS, and sourcemap assets when configured;
- diagnostics include source location, code, message, code frame, suggestion, and docs path when present;
- the clean fixture proves package-output consumption;
- Vite plugin package tests and typecheck pass;
- `pnpm audit:core` passes for the Phase 12D slice;
- `pnpm verify` passes before tracker rows are marked done.

## 14. Self-Review Notes

This spec has no incomplete requirements. The scope is one production hardening slice for `@vanrot/vite-plugin`. Deferred HMR accept/dispose, Phase 13 config expansion, and Phase 12E type contracts are named explicitly so implementation does not absorb unrelated work.
