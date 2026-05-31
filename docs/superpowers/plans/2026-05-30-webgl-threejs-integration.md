# WebGL And three.js Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Vanrot `AGENTS.md` disables subagent-driven workflows for this repository, so execute inline with review checkpoints.

**Goal:** Make WebGL and three.js feel first-class in Vanrot without pulling heavy 3D dependencies into the core runtime.

**Architecture:** Keep `three` as an opt-in app dependency or peer dependency. The default direction is a blessed lifecycle recipe plus a small adapter package only if shared helper APIs prove valuable. `@vanrot/runtime` must not depend on `three`.

**Tech Stack:** TypeScript, Vitest, jsdom with WebGL stubs where useful, optional `three` peer dependency, Vanrot `.widget.ts` lifecycle patterns, signals feeding render loops and uniforms, `apps/vanrot-site` docs and examples.

**Spec:** `docs/superpowers/specs/2026-05-30-webgl-threejs-integration-design.md`

---

## Acceptance Criteria

- Recipe-only or adapter-package direction is explicitly recorded before implementation continues.
- `@vanrot/runtime` has no import, dependency, or transitive dependency on `three` and remains within the `1.98 KB` gzip cap.
- The lifecycle recipe cleans up renderer resources, render loops, resize observers/listeners, signal bindings, textures, materials, geometries, and controls.
- Missing WebGL, context loss, context restore, reduced motion, and mobile fallback behavior are documented and verified.
- Any helper API returns cleanup or joins a widget cleanup scope.
- Examples use local deterministic assets and centralized asset paths.
- Any live site showcase is lazy-loaded, accessible, mobile-safe, and verified with desktop/mobile screenshots plus a canvas-pixel sanity check.
- Docs, AI bundles, final TDD inventory, feature maturity when applicable, and post-production ideas match the shipped status.

## Non-Goals And Decision Gates

- Do not add `three` to `@vanrot/runtime`.
- Do not replace the default homepage hero with 3D.
- Do not create a renderer abstraction that attempts to wrap all of three.js.
- Do not ship a public adapter package unless recipe-only examples prove repeated integration code that should be shared.
- Decide recipe-only vs `@vanrot/three` before package work begins.
- Decide the supported browser capability floor and site showcase performance requirements before implementation.

## Execution Rules

- Execute in the current workspace. Do not create a branch or worktree unless the user asks.
- Do not use subagents. This repo explicitly disables them.
- Do not run `git add`, `git commit`, or `git push` unless the user asks.
- Read and confirm `docs/superpowers/specs/2026-05-30-webgl-threejs-integration-design.md` before starting implementation.
- Use TDD for any helper API. Recipe-only documentation still needs verification through examples or docs tests.
- Never add `three` to `@vanrot/runtime` dependencies.
- Keep WebGL work opt-in and lazy. The basic Vanrot app path must stay lean.
- If this candidate becomes a numbered phase later, rename this plan to the matching `Phase-XX.md` file before execution.

## Module And Submodule Checklist

### Module WG1: Integration Boundary Decision

- [x] Decide whether the first shipped shape is recipe-only or a small adapter package. Decision: recipe-only.
- [x] Record the decision in this plan and in `docs/superpowers/specs/2026-05-30-webgl-threejs-integration-design.md` before implementation continues.
- [x] If an adapter package ships, use `@vanrot/three` as the package name unless the product direction changes. Not applicable; no adapter shipped.
- [x] Keep `three` as a peer dependency or app dependency, not a runtime dependency.
- [x] Add bundle and package tests proving `@vanrot/runtime` does not import or depend on `three`.
- [x] Document the boundary: Vanrot owns lifecycle, cleanup, signal binding, and docs; three.js owns rendering.

### Module WG2: Lifecycle-Safe Canvas Widget Recipe

- [x] Add a `.widget.ts` recipe that creates a renderer in `onMount()` and disposes it in `onDestroy()`.
- [x] Add resize handling with cleanup for container resize and device-pixel-ratio changes.
- [x] Add render-loop cancellation so animation stops when the widget is destroyed.
- [x] Add context-loss and context-restore handling for examples that create a WebGL context.
- [x] Add reduced-motion handling so examples can render a static frame instead of an animation loop.
- [x] Add tests or verified examples for teardown, resize cleanup, resource disposal, and repeated mount/destroy cycles.
- [x] Keep UI markup in Vanrot templates, not TypeScript.

### Module WG3: Signal-To-Scene Binding Helpers

- [x] Add failing tests for binding Vanrot signals to scene state, uniforms, or object transforms.
- [x] Provide helper APIs only if they reduce repeated integration code.
- [x] Ensure every binding returns a cleanup function or joins the widget cleanup scope.
- [x] Add examples for color, camera, rotation, and material updates from signals.
- [x] Avoid clever shorthand; API names should be obvious to non-dev readers.

### Module WG4: Assets, Loading, And Error States

- [x] Define how examples load textures, models, and generated assets without hiding network or asset failures.
- [x] Add loading and error-state patterns that work with existing Vanrot async conventions.
- [x] Keep asset paths centralized instead of repeating string literals.
- [x] Document progressive enhancement for users who cannot run WebGL.
- [x] Add diagnostics or docs notes for missing WebGL support, context loss, context restore, CORS-safe local assets, and mobile fallback.
- [x] Add cleanup guidance for textures, materials, geometries, controls, loaders, and renderer-owned resources.

### Module WG5: Example App And Test Fixtures

- [x] Add an example app such as `examples/webgl-threejs` only if implementation ships beyond docs-only recipes.
- [x] Add build, typecheck, and smoke tests for the example.
- [x] Use local fixture assets or deterministic generated assets so verification is repeatable.
- [x] Add a lightweight performance guard for example render loops, including animation pause on teardown and reduced-motion static rendering.
- [x] Keep the example small enough that it does not dominate repo verification time.
- [x] Add docs references from the example matrix.

### Module WG6: Vanrot Site Docs And Showcase

- [x] Add or update `apps/vanrot-site` documentation for WebGL lifecycle, cleanup, signal binding, and dependency boundaries.
- [x] If the site includes a 3D showcase, load it lazily and verify it does not hurt the default docs route. Not applicable; no live 3D showcase shipped.
- [x] Keep site examples accessible with a non-WebGL fallback or clear unsupported state.
- [x] Verify any live site 3D showcase with desktop and mobile screenshots plus a nonblank canvas-pixel sanity check. Not applicable; no live site 3D showcase shipped.
- [x] Verify the example render loop respects reduced-motion and does not overlap or occlude surrounding content. Reduced motion is covered by example tests; no live site 3D showcase shipped.
- [x] Update docs tests for new site data, routes, examples, and references.
- [x] Restart the Vanrot site dev server and verify the relevant docs route responds at `http://localhost:1964` after site changes. Verified `/docs/examples/webgl-threejs` returns HTTP 200.

## Package, NPM, And Site Closeout

- [x] If `@vanrot/three` ships, create or update `packages/three/package.json` with `three` as a peer dependency. Not applicable; no package shipped.
- [x] If no package ships, update docs and examples only and do not add new npm surface area.
- [x] Update root `tsconfig.json` project references only if a new package ships. Not applicable; no package shipped.
- [x] Run `pnpm verify:size` and confirm `@vanrot/runtime` remains within the `1.98 KB` gzip cap. Verified at `1.8 kB`.
- [x] If `@vanrot/three` ships, add `three` to `publish.sh` `PUBLISH_PACKAGES` before release dry-run or publishing. Not applicable; no package shipped.
- [x] Run `pnpm release:bump --package @vanrot/three --type minor` if a public adapter package ships. Not applicable; no package shipped.
- [x] Run `pnpm verify:release-dry-run` after npm package metadata or versions change.
- [x] Run `PUBLISH_DRY_RUN=1 ./publish.sh` after package metadata or versions change so the publish path includes the WebGL adapter. Not applicable; no adapter package shipped.
- [x] Update `apps/vanrot-site/src/docs/site-data.json` with the WebGL/three.js docs entry.
- [x] Update `apps/vanrot-site/src/docs/framework-reference.json` only for public helper APIs.
- [x] Update `apps/vanrot-site/src/docs/example-matrix.ts` if a WebGL example ships.
- [x] Run `pnpm --filter @vanrot/vanrot-site test`, `pnpm --filter @vanrot/vanrot-site typecheck`, and `pnpm --filter @vanrot/vanrot-site build` after site changes.

## Tracking And Verification Closeout

- [x] Update `docs/superpowers/future-pipeline.md` when this candidate is scheduled, shipped, deferred, or superseded.
- [x] Update `docs/superpowers/specs/2026-05-30-webgl-threejs-integration-design.md` if implementation requirements change.
- [x] Update `docs/superpowers/feature-maturity.md` if this becomes a numbered phase or changes the production roadmap. Not applicable; this stayed a post-production recipe candidate.
- [x] Update `docs/superpowers/final-tdd-inventory.md` with every package, helper, example, generated file, and docs page added by the integration.
- [x] Update `docs/vanrot-presentation.html` if the roadmap or site positioning changes. Not applicable; no roadmap or site positioning change.
- [x] Run `vr ai build` and `vr ai verify` after framework-facing docs or package metadata change. Verified through the built CLI with `node packages/cli/dist/bin.js ai build` and `node packages/cli/dist/bin.js ai verify`.
- [x] Run `pnpm verify` before marking the integration complete.
