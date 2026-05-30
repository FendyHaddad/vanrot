# WebGL And three.js Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Vanrot `AGENTS.md` disables subagent-driven workflows for this repository, so execute inline with review checkpoints.

**Goal:** Make WebGL and three.js feel first-class in Vanrot without pulling heavy 3D dependencies into the core runtime.

**Architecture:** Keep `three` as an opt-in app dependency or peer dependency. The default direction is a blessed lifecycle recipe plus a small adapter package only if shared helper APIs prove valuable. `@vanrot/runtime` must not depend on `three`.

**Tech Stack:** TypeScript, Vitest, jsdom with WebGL stubs where useful, optional `three` peer dependency, Vanrot `.widget.ts` lifecycle patterns, signals feeding render loops and uniforms, `apps/vanrot-site` docs and examples.

---

## Execution Rules

- Execute in the current workspace. Do not create a branch or worktree unless the user asks.
- Do not use subagents. This repo explicitly disables them.
- Do not run `git add`, `git commit`, or `git push` unless the user asks.
- Use TDD for any helper API. Recipe-only documentation still needs verification through examples or docs tests.
- Never add `three` to `@vanrot/runtime` dependencies.
- Keep WebGL work opt-in and lazy. The basic Vanrot app path must stay lean.
- If this candidate becomes a numbered phase later, rename this plan to the matching `Phase-XX.md` file before execution.

## Module And Submodule Checklist

### Module WG1: Integration Boundary Decision

- [ ] Decide whether the first shipped shape is recipe-only or a small adapter package.
- [ ] If an adapter package ships, use `@vanrot/three` as the package name unless the product direction changes.
- [ ] Keep `three` as a peer dependency or app dependency, not a runtime dependency.
- [ ] Add bundle and package tests proving `@vanrot/runtime` does not import or depend on `three`.
- [ ] Document the boundary: Vanrot owns lifecycle, cleanup, signal binding, and docs; three.js owns rendering.

### Module WG2: Lifecycle-Safe Canvas Widget Recipe

- [ ] Add a `.widget.ts` recipe that creates a renderer in `onMount()` and disposes it in `onDestroy()`.
- [ ] Add resize handling with cleanup for container resize and device-pixel-ratio changes.
- [ ] Add render-loop cancellation so animation stops when the widget is destroyed.
- [ ] Add tests or verified examples for teardown, resize cleanup, and repeated mount/destroy cycles.
- [ ] Keep UI markup in Vanrot templates, not TypeScript.

### Module WG3: Signal-To-Scene Binding Helpers

- [ ] Add failing tests for binding Vanrot signals to scene state, uniforms, or object transforms.
- [ ] Provide helper APIs only if they reduce repeated integration code.
- [ ] Ensure every binding returns a cleanup function or joins the widget cleanup scope.
- [ ] Add examples for color, camera, rotation, and material updates from signals.
- [ ] Avoid clever shorthand; API names should be obvious to non-dev readers.

### Module WG4: Assets, Loading, And Error States

- [ ] Define how examples load textures, models, and generated assets without hiding network or asset failures.
- [ ] Add loading and error-state patterns that work with existing Vanrot async conventions.
- [ ] Keep asset paths centralized instead of repeating string literals.
- [ ] Document progressive enhancement for users who cannot run WebGL.
- [ ] Add diagnostics or docs notes for missing WebGL support and context loss.

### Module WG5: Example App And Test Fixtures

- [ ] Add an example app such as `examples/webgl-threejs` only if implementation ships beyond docs-only recipes.
- [ ] Add build, typecheck, and smoke tests for the example.
- [ ] Use local fixture assets or deterministic generated assets so verification is repeatable.
- [ ] Keep the example small enough that it does not dominate repo verification time.
- [ ] Add docs references from the example matrix.

### Module WG6: Vanrot Site Docs And Showcase

- [ ] Add or update `apps/vanrot-site` documentation for WebGL lifecycle, cleanup, signal binding, and dependency boundaries.
- [ ] If the site includes a 3D showcase, load it lazily and verify it does not hurt the default docs route.
- [ ] Keep site examples accessible with a non-WebGL fallback or clear unsupported state.
- [ ] Update docs tests for new site data, routes, examples, and references.
- [ ] Restart the Vanrot site dev server and verify the relevant docs route responds at `http://localhost:1964` after site changes.

## Package, NPM, And Site Closeout

- [ ] If `@vanrot/three` ships, create or update `packages/three/package.json` with `three` as a peer dependency.
- [ ] If no package ships, update docs and examples only and do not add new npm surface area.
- [ ] Update root `tsconfig.json` project references only if a new package ships.
- [ ] Run `pnpm release:bump --package @vanrot/three --type minor` if a public adapter package ships.
- [ ] Run `pnpm verify:release-dry-run` after npm package metadata or versions change.
- [ ] Update `apps/vanrot-site/src/docs/site-data.json` with the WebGL/three.js docs entry.
- [ ] Update `apps/vanrot-site/src/docs/framework-reference.json` only for public helper APIs.
- [ ] Update `apps/vanrot-site/src/docs/example-matrix.ts` if a WebGL example ships.
- [ ] Run `pnpm --filter @vanrot/vanrot-site test`, `pnpm --filter @vanrot/vanrot-site typecheck`, and `pnpm --filter @vanrot/vanrot-site build` after site changes.

## Tracking And Verification Closeout

- [ ] Update `docs/superpowers/post-production-implementation-ideas.md` when this candidate is scheduled, shipped, deferred, or superseded.
- [ ] Update `docs/superpowers/feature-maturity.md` if this becomes a numbered phase or changes the production roadmap.
- [ ] Update `docs/superpowers/final-tdd-inventory.md` with every package, helper, example, generated file, and docs page added by the integration.
- [ ] Update `docs/vanrot-presentation.html` if the roadmap or site positioning changes.
- [ ] Run `vr ai build` and `vr ai verify` after framework-facing docs or package metadata change.
- [ ] Run `pnpm verify` before marking the integration complete.
