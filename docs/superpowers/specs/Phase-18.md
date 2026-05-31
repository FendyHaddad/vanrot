# Phase 18 Testing Production Spec

## Status

Implemented post-production slice. Phase 18 now ships the testing package production surface while keeping forms and async-resource-specific helpers deferred to Phase 21.

Implementation plan: `docs/superpowers/plans/Phase-18.md`.

## Goal

Make `@vanrot/testing` cover realistic component and page workflows with readable, English-first APIs while preserving the existing lightweight Vitest and jsdom foundation.

## Problem

The current testing package exposes component-oriented helpers. It does not yet give users a first-party page harness, router-aware setup, accessibility assertions, async/fake-timer coordination, or generator-created tests that look like normal Vanrot code. Without a tighter spec, Phase 18 can drift into a browser E2E runner, a CLI debugging phase, or a generic testing framework.

## Design Principles

- Extend `@vanrot/testing`; do not create a new test runner.
- Keep tests readable from the user's point of view.
- Preserve compatibility for `testComponent(...)`, `runComponentTest(...)`, `Screen`, and existing screen queries.
- Keep CLI and generator work thin. They should call testing-package primitives.
- Keep browser E2E out of scope for this phase.
- Do not increase `@vanrot/runtime` to support testing-only behavior.

## Scope

Phase 18 owns:

- `testPage(...)` as the page-level companion to `testComponent(...)`.
- Router setup helpers for route refs, route params, navigation, lazy pages, redirects, guards, and cleanup.
- Accessibility assertions for roles, names, disabled state, focus movement, and common semantic mistakes.
- Async helpers for controlled effect flushes, promise resolution, cancellation, and fake timers.
- Generator-wide `--test` support after helper APIs are stable.
- Optional CLI test/debug helpers only if the spec decision gate accepts them.

Phase 18 may add placeholders for Phase 21 forms and async-resource testing, but it must not design those APIs before Phase 21 stabilizes the underlying runtime surface.

## Non-Goals

- No Playwright, Cypress, or browser E2E framework.
- No test runner abstraction over Vitest.
- No generic snapshot-testing policy.
- No forms or async-resource helper API beyond stable placeholders.
- No runtime behavior added only for tests.
- No CLI commands that are not needed for repeatable tests or generated fixtures.

## Decision Gates

Before implementation starts:

- Decide whether `vr inspect` belongs in Phase 18 or remains a later debug-tooling candidate.
- Decide whether `vr cache clear` belongs in Phase 18 or remains a local maintenance command.
- Confirm the first `testPage(...)` contract against current router exports, especially route refs and route params.

Decision: `vr inspect` and `vr cache clear` stay deferred. Phase 18 ships only testing APIs and generator-wide `--test` support.
- Confirm the compatibility matrix for existing `@vanrot/testing` exports.

If any gate is unresolved, the plan should record the decision before package code changes.

## Acceptance Criteria

Phase 18 is complete only when:

- Existing `testComponent(...)`, `runComponentTest(...)`, `Screen`, and screen query tests still pass unchanged.
- `testPage(...)` can mount a page in a jsdom app shell and clean it up deterministically.
- Router helpers cover route refs, params, navigation, redirects, guards, lazy pages, and cleanup.
- Accessibility helpers produce deterministic assertion messages and stay dependency-light.
- Async helpers coordinate effects, promises, cancellation, and Vitest fake timers without hiding Vitest behavior.
- Generated `.test.ts` files use role-based suffixes and readable `function (screen)` examples.
- Any new CLI commands have command metadata, diagnostics, tests, and docs.
- `@vanrot/runtime` size stays within the `1.98 KB` gzip cap for `dist/index.js` plus `dist/internal.js`.
- Docs, AI bundles, final TDD inventory, feature maturity, and future-pipeline tracking reflect the shipped status.

## Verification

Minimum closeout verification:

- `pnpm --filter @vanrot/testing test`
- `pnpm --filter @vanrot/testing typecheck`
- CLI tests for every generator or debug command changed by the phase.
- Site tests, typecheck, build, server restart, and route response check after site docs change.
- `pnpm verify:size`
- `pnpm verify:release-dry-run` after package metadata or version changes.
- `PUBLISH_DRY_RUN=1 ./publish.sh` after package metadata or version changes; confirm `testing` remains covered by `publish.sh`.
- `pnpm verify`
