# Phase 18 Testing Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Vanrot `AGENTS.md` disables subagent-driven workflows for this repository, so execute inline with review checkpoints.

**Goal:** Make `@vanrot/testing` cover realistic component and page workflows with readable, English-first APIs.

**Architecture:** Extend the existing `@vanrot/testing` package instead of creating a separate test runner. The package should own page mounting, router test setup, accessibility assertions, async helpers, fake timer bridges, and generator-ready test helpers. CLI and generator changes stay thin and call testing-package primitives.

**Tech Stack:** TypeScript, Vitest, jsdom, existing Vanrot runtime/router/compiler APIs, existing CLI command metadata, generated `.test.ts` files, `apps/vanrot-site` documentation data.

**Spec:** `docs/superpowers/specs/Phase-18.md`

---

## Acceptance Criteria

- Existing `testComponent(...)`, `runComponentTest(...)`, `Screen`, and screen query tests pass unchanged.
- `testPage(...)` mounts page components in a jsdom app shell and destroys all app, router, DOM, timer, and effect state deterministically.
- Router helpers cover route refs, params, navigation, lazy pages, redirects, guards, and cleanup without string literal routing.
- Accessibility helpers cover role, name, disabled state, focus movement, and semantic misuse with deterministic messages.
- Async helpers coordinate effect flushes, promise resolution, cancellation, and Vitest fake timers without hiding Vitest behavior.
- Generated `.test.ts` files use role-based suffixes and readable `function (screen)` examples.
- `@vanrot/runtime` does not grow for testing-only behavior and remains within the `1.98 KB` gzip cap.
- Docs, AI bundles, final TDD inventory, feature maturity, and post-production ideas match the shipped status.

## Non-Goals And Decision Gates

- Do not add Playwright, Cypress, or another browser E2E framework in this phase.
- Do not add a test runner abstraction over Vitest.
- Do not design Phase 21 forms or async-resource APIs before those APIs are stable.
- Decide whether project inspection belongs in Phase 18 before implementing it.
- Decide whether `vr cache clean` belongs in Phase 18 before implementing it.
- Confirm the `testPage(...)` contract against current router exports before package code changes.

## Execution Rules

- Execute in the current workspace. Do not create a branch or worktree unless the user asks.
- Do not use subagents. This repo explicitly disables them.
- Do not run `git add`, `git commit`, or `git push` unless the user asks.
- Read and confirm `docs/superpowers/specs/Phase-18.md` before starting implementation.
- Use TDD: write failing tests for each public helper before implementation.
- Keep generated test examples readable to non-devs. Prefer `function (screen)` style examples when possible.
- Do not add a browser E2E framework in this phase. Phase 18 owns unit and integration testing helpers around Vanrot APIs.
- Defer Phase 21-only form and async-resource helpers until those APIs exist or are stable enough to test against.

## Module And Submodule Checklist

### Module 18A: Page Test Harness

- [x] Add failing tests for `testPage(...)` in `packages/testing/tests`.
- [x] Add compatibility tests proving existing `testComponent(...)`, `runComponentTest(...)`, `Screen`, and screen queries still behave unchanged.
- [x] Define a readable `testPage(...)` contract that mounts page components into a jsdom-backed app shell.
- [x] Return stable helpers such as screen access, cleanup, lifecycle teardown, rerender, and user-event style actions.
- [x] Verify `onMount()` and `onDestroy()` cleanup when a page test ends.
- [x] Export the helper through `packages/testing/src/index.ts` and generated type declarations.
- [x] Document examples that use role-based page files such as `.page.ts`, not generic component-only naming.

### Module 18B: Router And Navigation Test Helpers

- [x] Add failing tests for route refs, route params, query params, redirects, guards, lazy pages, and teardown.
- [x] Add router setup helpers that accept Vanrot route refs rather than reused string literals.
- [x] Add memory-history navigation helpers that can assert the current route and route data.
- [x] Verify cleanup removes route listeners and pending navigation state.
- [x] Add diagnostics for missing route refs, invalid params, and guard failures.

### Module 18C: Accessibility Assertions

- [x] Add failing tests for accessible name, role, disabled state, focus movement, and semantic misuse assertions.
- [x] Add assertion helpers that read like user-facing checks instead of raw DOM internals.
- [x] Provide source-aware failure messages when the helper can identify the component, page, or generated file.
- [x] Keep accessibility helpers dependency-light and compatible with Vitest/jsdom.
- [x] Add docs examples for button, input, dialog, and navigation scenarios.

### Module 18D: Async, Effects, And Fake Timers

- [x] Add failing tests for controlled effect flushes, pending promise resolution, and fake timer coordination.
- [x] Add helpers for flushing Vanrot effects and waiting on signal-driven DOM updates.
- [x] Add fake timer bridge helpers that do not hide Vitest behavior behind surprising magic.
- [x] Add async-resource and form test placeholders only when Phase 21 APIs are ready.
- [x] Verify helper cleanup drains or cancels work so tests do not leak state across files.

### Module 18E: Generator-Wide `--test` Support

- [x] Add failing CLI tests for `vr generate component <name> --test`.
- [x] Add failing CLI tests for `vr generate page <name> --test`.
- [x] Generate readable `.test.ts` files that use `@vanrot/testing` helpers.
- [x] Add a fixture matrix for generated component tests, generated page tests, router-backed page tests, and no-router page tests.
- [x] Keep generated tests compliant with Vanrot rules: no UI markup in TypeScript, no application logic in HTML, scoped CSS only.
- [x] Update CLI metadata, help text, and diagnostics from named command constants.
- [x] Add fixture coverage for generated test files in compiler/router examples where relevant.

### Module 18F: Optional CLI Test And Debug Helpers

- [x] Decide whether project inspection belongs in Phase 18 or should remain a later doctor/project-intelligence enhancement.
- [x] Decide whether `vr cache clean` belongs in Phase 18 or should remain a local maintenance command.
- [x] If accepted, add failing CLI tests before implementation.
- [x] Keep any accepted command narrow, guided, colored, and human-readable.
- [x] Update command metadata and docs only for commands that ship in this phase.

Decision: both optional commands remain deferred. Phase 18 ships testing APIs and generator `--test`
support only; no debug or cache command was accepted into scope.

## Package, NPM, And Site Closeout

- [x] Update `packages/testing/package.json` exports, dependencies, peer dependencies, and scripts for every public testing API added.
- [x] Update `packages/cli/package.json` only if generator or CLI debug commands change.
- [x] Update package project references such as `tsconfig.json` only when package boundaries change.
- [x] Run `pnpm release:bump --package @vanrot/testing --type minor` after public testing APIs ship, adjusting package selectors if CLI or router packages also changed.
- [x] Run `pnpm verify:release-dry-run` after npm package metadata or versions change.
- [x] Confirm `publish.sh` already includes `testing` in `PUBLISH_PACKAGES`; edit it only if Phase 18 adds another public package.
- [x] Run `PUBLISH_DRY_RUN=1 ./publish.sh` after package metadata or versions change so the publish path matches the release dry-run output.
- [x] Run `pnpm verify:size` and confirm `@vanrot/runtime` remains within the `1.98 KB` gzip cap.
- [x] Update `apps/vanrot-site/src/docs/site-data.json` with the Testing documentation changes.
- [x] Update `apps/vanrot-site/src/docs/framework-reference.json` and related docs data when public API entries change.
- [x] Update `apps/vanrot-site/src/docs/example-matrix.ts` if testing examples are added or changed.
- [x] Run `pnpm --filter @vanrot/vanrot-site test`, `pnpm --filter @vanrot/vanrot-site typecheck`, and `pnpm --filter @vanrot/vanrot-site build` after site changes.
- [x] Restart the Vanrot site dev server and verify the relevant docs route responds at `http://localhost:1964` after site changes.

## Phase Tracking And Verification Closeout

- [x] Tick Phase 18 only in `docs/superpowers/feature-maturity.md` after all tasks pass.
- [x] Mark completed tasks in this plan as they pass.
- [x] Update `docs/superpowers/final-tdd-inventory.md` with every package, command, helper, example, generated file, and docs page added by Phase 18.
- [x] Update `docs/superpowers/future-pipeline.md` when Phase 18 status changes, ships, is deferred, or is superseded.
- [x] Update `docs/superpowers/specs/Phase-18.md` if implementation requirements change.
- [x] Update `docs/vanrot-presentation.html` so the roadmap matches the tracker after closeout.
- [x] Run `vr ai build` and `vr ai verify` after framework-facing docs or package metadata change.
- [x] Run `pnpm verify` before marking Phase 18 complete.
