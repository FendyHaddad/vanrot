# Phase 22 SSR And Hydration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Vanrot `AGENTS.md` disables subagent-driven workflows for this repository, so execute inline with review checkpoints.

**Goal:** Make Vanrot capable of server rendering and hydration while preserving a clear browser-only boundary for browser APIs.

**Architecture:** Add SSR as an explicit, opt-in capability. Server rendering should live behind an SSR-facing package boundary, while runtime hydration hooks should stay minimal and browser-only. Browser APIs remain isolated behind lifecycle boundaries such as `onMount()`.

**Tech Stack:** TypeScript, Vitest, Node.js streams where needed, existing Vanrot runtime/compiler/router packages, explicit hydration diagnostics, `apps/vanrot-site` SSR and hydration documentation.

---

## Execution Rules

- Execute in the current workspace. Do not create a branch or worktree unless the user asks.
- Do not use subagents. This repo explicitly disables them.
- Do not run `git add`, `git commit`, or `git push` unless the user asks.
- Use TDD: write failing tests for each public SSR or hydration contract before implementation.
- Do not weaken the client router contract to make SSR easier.
- Do not let browser-only APIs execute during server rendering.
- Do not add streaming until basic server render and hydration flows are stable.

## Module And Submodule Checklist

### Module 22A: SSR-Safe API Audit

- [ ] Add audit tests for top-level `window`, `document`, DOM, storage, and browser event assumptions across runtime, compiler, router, UI, forms, and async-resource candidates.
- [ ] Isolate allowed browser APIs behind `onMount()` or explicit client-only helpers.
- [ ] Add diagnostics for unsupported browser-only work during server rendering.
- [ ] Document every public API as server-safe, client-only, or hydration-only.
- [ ] Update package tests so SSR safety cannot regress silently.

### Module 22B: Server Rendering Package Boundary

- [ ] Decide the package boundary for SSR, with `@vanrot/ssr` as the default opt-in package unless implementation proves a smaller path.
- [ ] Add failing package tests for server rendering a component and a page to stable HTML.
- [ ] Add server render entrypoints such as `renderToString(...)` and, if needed later, `renderToReadableStream(...)`.
- [ ] Keep server rendering deterministic and free of environment-specific output.
- [ ] Add compiler support only where the server renderer needs a different artifact from browser rendering.
- [ ] Ensure runtime package size remains protected by the existing size budget.

### Module 22C: Hydration Runtime Contract

- [ ] Add failing tests for attaching client behavior to static server markup.
- [ ] Define explicit `hydrate(...)` behavior, lifecycle ordering, and cleanup semantics.
- [ ] Ensure `onMount()` runs only on the client after hydration begins.
- [ ] Preserve signal-driven updates without double-rendering initial markup.
- [ ] Verify hydration works for nested components, slots, conditional DOM, and lists.
- [ ] Keep hydration APIs readable and source-of-truth friendly.

### Module 22D: Hydration Mismatch Diagnostics

- [ ] Add failing tests for text, attribute, element order, missing node, and extra node mismatches.
- [ ] Add diagnostic codes and source-aware messages that explain likely causes.
- [ ] Keep mismatch handling deterministic so tests can assert exact output.
- [ ] Add docs examples for common mismatch fixes.
- [ ] Add integration coverage that proves diagnostics work through compiled output, not only hand-written fixtures.

### Module 22E: Router Integration

- [ ] Add failing tests for SSR route matching, route params, redirects, guards, and lazy route boundaries.
- [ ] Define a server-side route resolution path that reuses route refs instead of string literal routing.
- [ ] Hydrate route state without replacing the router's client contract.
- [ ] Add diagnostics for SSR/client route divergence.
- [ ] Verify static pages, hydrated routes, redirects, and guarded pages.

### Module 22F: Streaming And Async States

- [ ] Start streaming work only after server render, hydration, diagnostics, and router integration pass.
- [ ] Add failing tests for async resource states once Phase 21 APIs exist or are stable.
- [ ] Define fallback behavior for pending async work during server rendering.
- [ ] Add stream cancellation and cleanup tests if `renderToReadableStream(...)` ships.
- [ ] Document which async patterns are supported in the first SSR release.

## Package, NPM, And Site Closeout

- [ ] Add or update `packages/ssr/package.json` if SSR ships as `@vanrot/ssr`.
- [ ] Update `packages/runtime/package.json`, `packages/router/package.json`, and `packages/compiler/package.json` only for public SSR or hydration API changes.
- [ ] Add root `tsconfig.json` project references when a new package ships.
- [ ] Keep `@vanrot/runtime` free of SSR-only or three.js-style heavy dependencies.
- [ ] Run `pnpm release:bump --package @vanrot/ssr --type minor` when a new SSR package ships, adjusting selectors for runtime, router, or compiler public changes.
- [ ] Run `pnpm verify:release-dry-run` after npm package metadata or versions change.
- [ ] Update `apps/vanrot-site/src/docs/site-data.json` with SSR and hydration documentation.
- [ ] Update `apps/vanrot-site/src/docs/framework-reference.json` for public SSR and hydration APIs.
- [ ] Add or update an SSR/hydration example in the site example matrix when examples ship.
- [ ] Run `pnpm --filter @vanrot/vanrot-site test`, `pnpm --filter @vanrot/vanrot-site typecheck`, and `pnpm --filter @vanrot/vanrot-site build` after site changes.
- [ ] Restart the Vanrot site dev server and verify the relevant docs route responds at `http://localhost:1964` after site changes.

## Phase Tracking And Verification Closeout

- [ ] Tick Phase 22 only in `docs/superpowers/feature-maturity.md` after all tasks pass.
- [ ] Mark completed tasks in this plan as they pass.
- [ ] Update `docs/superpowers/final-tdd-inventory.md` with every package, command, helper, example, generated file, and docs page added by Phase 22.
- [ ] Update `docs/superpowers/post-production-implementation-ideas.md` when Phase 22 status changes, ships, is deferred, or is superseded.
- [ ] Update `docs/vanrot-presentation.html` so the roadmap matches the tracker after closeout.
- [ ] Run `vr ai build` and `vr ai verify` after framework-facing docs or package metadata change.
- [ ] Run `pnpm verify` before marking Phase 22 complete.
