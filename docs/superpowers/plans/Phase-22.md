# Phase 22 SSR And Hydration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Vanrot `AGENTS.md` disables subagent-driven workflows for this repository, so execute inline with review checkpoints.

**Goal:** Make Vanrot capable of server rendering and hydration while preserving a clear browser-only boundary for browser APIs.

**Architecture:** Add SSR as an explicit, opt-in capability. Server rendering should live behind an SSR-facing package boundary, while runtime hydration hooks should stay minimal and browser-only. Browser APIs remain isolated behind lifecycle boundaries such as `onMount()`.

**Tech Stack:** TypeScript, Vitest, Node.js streams where needed, existing Vanrot runtime/compiler/router packages, explicit hydration diagnostics, `apps/vanrot-site` SSR and hydration documentation.

**Spec:** `docs/superpowers/specs/Phase-22.md`

---

## Acceptance Criteria

- Server rendering produces deterministic HTML for static pages without touching browser-only APIs.
- The HTML shell handles head, meta, style, script, body, asset URLs, and serialized state predictably.
- Serialized state is escaped and covered by security-focused tests.
- `hydrate(...)` attaches client behavior without rerunning server-only lifecycle work.
- `onMount()` runs only on the client after hydration begins.
- Hydration mismatch diagnostics are deterministic and include enough source or route context to fix common issues.
- Router SSR covers route refs, params, redirects, guards, lazy route boundaries, and divergence diagnostics.
- Streaming is either fully tested or explicitly deferred in docs and post-production tracking.
- `@vanrot/runtime` stays free of SSR-only dependencies and remains within the `1.98 KB` gzip cap.

## Non-Goals And Decision Gates

- Do not add Node-only assumptions to `@vanrot/runtime`.
- Do not add a server framework adapter in the first SSR release.
- Do not include partial hydration, islands architecture, resumability, or event replay unless they pass an explicit decision gate.
- Do not add streaming before non-streaming server render, hydration, diagnostics, router integration, shell output, and serialized state pass.
- Decide the `@vanrot/ssr` package boundary before implementation.
- Decide the HTML shell, serialized-state, asset URL, and escaping contracts before implementation.

## Execution Rules

- Execute in the current workspace. Do not create a branch or worktree unless the user asks.
- Do not use subagents. This repo explicitly disables them.
- Do not run `git add`, `git commit`, or `git push` unless the user asks.
- Read and confirm `docs/superpowers/specs/Phase-22.md` before starting implementation.
- Use TDD: write failing tests for each public SSR or hydration contract before implementation.
- Do not weaken the client router contract to make SSR easier.
- Do not let browser-only APIs execute during server rendering.
- Do not add streaming until basic server render and hydration flows are stable.

## Module And Submodule Checklist

### Module 22A: SSR-Safe API Audit

- [x] Add audit tests for top-level `window`, `document`, DOM, storage, and browser event assumptions across runtime, compiler, router, UI, forms, and async-resource candidates.
- [x] Isolate allowed browser APIs behind `onMount()` or explicit client-only helpers.
- [x] Add diagnostics for unsupported browser-only work during server rendering.
- [x] Document every public API as server-safe, client-only, or hydration-only.
- [x] Update package tests so SSR safety cannot regress silently.

### Module 22B: Server Rendering Package Boundary

- [x] Decide the package boundary for SSR, with `@vanrot/ssr` as the default opt-in package unless implementation proves a smaller path.
- [x] Add failing package tests for server rendering a component and a page to stable HTML.
- [x] Define the HTML shell contract for head, meta, styles, scripts, body markup, asset URLs, and serialized state.
- [x] Add escaping tests for text, attributes, inline serialized data, and unsafe user-provided values.
- [x] Add server render entrypoints such as `renderToString(...)` and, if needed later, `renderToReadableStream(...)`.
- [x] Keep server rendering deterministic and free of environment-specific output.
- [x] Add compiler support only where the server renderer needs a different artifact from browser rendering.
- [x] Ensure runtime package size remains protected by the existing size budget.

### Module 22C: Hydration Runtime Contract

- [x] Add failing tests for attaching client behavior to static server markup.
- [x] Define explicit `hydrate(...)` behavior, lifecycle ordering, and cleanup semantics.
- [x] Decide and document the first-release event replay policy: unsupported, deferred, or implemented with tests.
- [x] Add tests for serialized-state read, validation, and cleanup during hydration.
- [x] Ensure `onMount()` runs only on the client after hydration begins.
- [x] Preserve signal-driven updates without double-rendering initial markup.
- [x] Verify hydration works for nested components, slots, conditional DOM, and lists.
- [x] Keep hydration APIs readable and source-of-truth friendly.

### Module 22D: Hydration Mismatch Diagnostics

- [x] Add failing tests for text, attribute, element order, missing node, and extra node mismatches.
- [x] Add failing tests for serialized-state mismatches and unsafe serialized-state input.
- [x] Add diagnostic codes and source-aware messages that explain likely causes.
- [x] Keep mismatch handling deterministic so tests can assert exact output.
- [x] Add docs examples for common mismatch fixes.
- [x] Add integration coverage that proves diagnostics work through compiled output, not only hand-written fixtures.

### Module 22E: Router Integration

- [x] Add failing tests for SSR route matching, route params, redirects, guards, and lazy route boundaries.
- [x] Define a server-side route resolution path that reuses route refs instead of string literal routing.
- [x] Hydrate route state without replacing the router's client contract.
- [x] Add diagnostics for SSR/client route divergence.
- [x] Verify static pages, hydrated routes, redirects, and guarded pages.

### Module 22F: Streaming And Async States

- [x] Start streaming work only after server render, hydration, diagnostics, router integration, HTML shell output, and serialized-state handling pass.
- [x] Add failing tests for async resource states once Phase 21 APIs exist or are stable.
- [x] Define fallback behavior for pending async work during server rendering.
- [x] Add stream cancellation and cleanup tests if `renderToReadableStream(...)` ships.
- [x] Document which async patterns are supported in the first SSR release.

## Package, NPM, And Site Closeout

- [x] Add or update `packages/ssr/package.json` if SSR ships as `@vanrot/ssr`.
- [x] Update `packages/runtime/package.json`, `packages/router/package.json`, and `packages/compiler/package.json` only for public SSR or hydration API changes.
- [x] Add root `tsconfig.json` project references when a new package ships.
- [x] Keep `@vanrot/runtime` free of SSR-only or three.js-style heavy dependencies.
- [x] Run `pnpm verify:size` and confirm `@vanrot/runtime` remains within the `1.98 KB` gzip cap.
- [x] If `@vanrot/ssr` ships, add `ssr` to `publish.sh` `PUBLISH_PACKAGES` before release dry-run or publishing.
- [x] Run `pnpm release:bump --package @vanrot/ssr --type minor` when a new SSR package ships, adjusting selectors for runtime, router, or compiler public changes.
- [x] Run `pnpm verify:release-dry-run` after npm package metadata or versions change.
- [x] Run `PUBLISH_DRY_RUN=1 ./publish.sh` after package metadata or versions change so the publish path includes SSR.
- [x] Update `apps/vanrot-site/src/docs/site-data.json` with SSR and hydration documentation.
- [x] Update `apps/vanrot-site/src/docs/framework-reference.json` for public SSR and hydration APIs.
- [x] Add or update an SSR/hydration example in the site example matrix when examples ship.
- [x] Run `pnpm --filter @vanrot/vanrot-site test`, `pnpm --filter @vanrot/vanrot-site typecheck`, and `pnpm --filter @vanrot/vanrot-site build` after site changes.
- [x] Restart the Vanrot site dev server and verify the relevant docs route responds at `http://localhost:1964` after site changes.

## Phase Tracking And Verification Closeout

- [x] Tick Phase 22 only in `docs/superpowers/feature-maturity.md` after all tasks pass.
- [x] Mark completed tasks in this plan as they pass.
- [x] Update `docs/superpowers/final-tdd-inventory.md` with every package, command, helper, example, generated file, and docs page added by Phase 22.
- [x] Update `docs/superpowers/future-pipeline.md` when Phase 22 status changes, ships, is deferred, or is superseded.
- [x] Update `docs/superpowers/specs/Phase-22.md` if implementation requirements change.
- [x] Update `docs/vanrot-presentation.html` so the roadmap matches the tracker after closeout.
- [x] Run `vr ai build` and `vr ai verify` after framework-facing docs or package metadata change.
- [x] Run `pnpm verify` before marking Phase 22 complete.
