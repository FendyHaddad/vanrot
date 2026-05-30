# Phase 18 Testing Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Vanrot `AGENTS.md` disables subagent-driven workflows for this repository, so execute inline with review checkpoints.

**Goal:** Make `@vanrot/testing` cover realistic component and page workflows with readable, English-first APIs.

**Architecture:** Extend the existing `@vanrot/testing` package instead of creating a separate test runner. The package should own page mounting, router test setup, accessibility assertions, async helpers, fake timer bridges, and generator-ready test helpers. CLI and generator changes stay thin and call testing-package primitives.

**Tech Stack:** TypeScript, Vitest, jsdom, existing Vanrot runtime/router/compiler APIs, existing CLI command metadata, generated `.test.ts` files, `apps/vanrot-site` documentation data.

---

## Execution Rules

- Execute in the current workspace. Do not create a branch or worktree unless the user asks.
- Do not use subagents. This repo explicitly disables them.
- Do not run `git add`, `git commit`, or `git push` unless the user asks.
- Use TDD: write failing tests for each public helper before implementation.
- Keep generated test examples readable to non-devs. Prefer `function (screen)` style examples when possible.
- Do not add a browser E2E framework in this phase. Phase 18 owns unit and integration testing helpers around Vanrot APIs.
- Defer Phase 21-only form and async-resource helpers until those APIs exist or are stable enough to test against.

## Module And Submodule Checklist

### Module 18A: Page Test Harness

- [ ] Add failing tests for `testPage(...)` in `packages/testing/tests`.
- [ ] Define a readable `testPage(...)` contract that mounts page components into a jsdom-backed app shell.
- [ ] Return stable helpers such as screen access, cleanup, lifecycle teardown, rerender, and user-event style actions.
- [ ] Verify `onMount()` and `onDestroy()` cleanup when a page test ends.
- [ ] Export the helper through `packages/testing/src/index.ts` and generated type declarations.
- [ ] Document examples that use role-based page files such as `.page.ts`, not generic component-only naming.

### Module 18B: Router And Navigation Test Helpers

- [ ] Add failing tests for route refs, route params, query params, redirects, guards, lazy pages, and teardown.
- [ ] Add router setup helpers that accept Vanrot route refs rather than reused string literals.
- [ ] Add memory-history navigation helpers that can assert the current route and route data.
- [ ] Verify cleanup removes route listeners and pending navigation state.
- [ ] Add diagnostics for missing route refs, invalid params, and guard failures.

### Module 18C: Accessibility Assertions

- [ ] Add failing tests for accessible name, role, disabled state, focus movement, and semantic misuse assertions.
- [ ] Add assertion helpers that read like user-facing checks instead of raw DOM internals.
- [ ] Provide source-aware failure messages when the helper can identify the component, page, or generated file.
- [ ] Keep accessibility helpers dependency-light and compatible with Vitest/jsdom.
- [ ] Add docs examples for button, input, dialog, and navigation scenarios.

### Module 18D: Async, Effects, And Fake Timers

- [ ] Add failing tests for controlled effect flushes, pending promise resolution, and fake timer coordination.
- [ ] Add helpers for flushing Vanrot effects and waiting on signal-driven DOM updates.
- [ ] Add fake timer bridge helpers that do not hide Vitest behavior behind surprising magic.
- [ ] Add async-resource and form test placeholders only when Phase 21 APIs are ready.
- [ ] Verify helper cleanup drains or cancels work so tests do not leak state across files.

### Module 18E: Generator-Wide `--test` Support

- [ ] Add failing CLI tests for `vr generate component <name> --test`.
- [ ] Add failing CLI tests for `vr generate page <name> --test`.
- [ ] Generate readable `.test.ts` files that use `@vanrot/testing` helpers.
- [ ] Keep generated tests compliant with Vanrot rules: no UI markup in TypeScript, no application logic in HTML, scoped CSS only.
- [ ] Update CLI metadata, help text, and diagnostics from named command constants.
- [ ] Add fixture coverage for generated test files in compiler/router examples where relevant.

### Module 18F: Optional CLI Test And Debug Helpers

- [ ] Decide whether `vr inspect` belongs in Phase 18 or should remain a later debug tool.
- [ ] Decide whether `vr cache clear` belongs in Phase 18 or should remain a local maintenance command.
- [ ] If accepted, add failing CLI tests before implementation.
- [ ] Keep any accepted command narrow, guided, colored, and human-readable.
- [ ] Update command metadata and docs only for commands that ship in this phase.

## Package, NPM, And Site Closeout

- [ ] Update `packages/testing/package.json` exports, dependencies, peer dependencies, and scripts for every public testing API added.
- [ ] Update `packages/cli/package.json` only if generator or CLI debug commands change.
- [ ] Update package project references such as `tsconfig.json` only when package boundaries change.
- [ ] Run `pnpm release:bump --package @vanrot/testing --type minor` after public testing APIs ship, adjusting package selectors if CLI or router packages also changed.
- [ ] Run `pnpm verify:release-dry-run` after npm package metadata or versions change.
- [ ] Update `apps/vanrot-site/src/docs/site-data.json` with the Testing documentation changes.
- [ ] Update `apps/vanrot-site/src/docs/framework-reference.json` and related docs data when public API entries change.
- [ ] Update `apps/vanrot-site/src/docs/example-matrix.ts` if testing examples are added or changed.
- [ ] Run `pnpm --filter @vanrot/vanrot-site test`, `pnpm --filter @vanrot/vanrot-site typecheck`, and `pnpm --filter @vanrot/vanrot-site build` after site changes.
- [ ] Restart the Vanrot site dev server and verify the relevant docs route responds at `http://localhost:1964` after site changes.

## Phase Tracking And Verification Closeout

- [ ] Tick Phase 18 only in `docs/superpowers/feature-maturity.md` after all tasks pass.
- [ ] Mark completed tasks in this plan as they pass.
- [ ] Update `docs/superpowers/final-tdd-inventory.md` with every package, command, helper, example, generated file, and docs page added by Phase 18.
- [ ] Update `docs/superpowers/post-production-implementation-ideas.md` when Phase 18 status changes, ships, is deferred, or is superseded.
- [ ] Update `docs/vanrot-presentation.html` so the roadmap matches the tracker after closeout.
- [ ] Run `vr ai build` and `vr ai verify` after framework-facing docs or package metadata change.
- [ ] Run `pnpm verify` before marking Phase 18 complete.
