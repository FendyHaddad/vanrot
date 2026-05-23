# Post-Production Implementation Ideas

**Scope:** Phase 17 through Phase 22
**Purpose:** Park implementation ideas for later production planning without turning them into active phase plans yet.

This file is an idea backlog, not an execution checklist. When a phase becomes active, move the relevant ideas into the
matching phase spec and writing plan using the normal `Phase-XX.md` naming convention.

## Planning Rules

- Keep Phase 17 through Phase 22 as post-production implementation candidates until the active production queue reaches
  them.
- Do not mark a listed idea complete from this file alone.
- Keep each future phase sliced into small implementation passes before writing code.
- Preserve shared contracts across related packages, especially UI flavor contracts, testing helpers, store APIs, forms,
  async resources, router integration, and SSR boundaries.
- Prefer readable, English-like APIs and named sources of truth over clever shorthand or repeated string literals.

## Phase 17: UI Production V02

Phase 17 should turn the brutalist UI flavor into a production-ready expression of the same component contracts created
for UI V01. V02 should feel visually different without forcing developers to learn a second component model.

Ideas to carry forward:

- Define the flavor architecture before styling individual components.
- Keep V01 and V02 on shared primitive contracts, props, variants, accessibility behavior, and file ownership rules.
- Separate V02 tokens from V01 tokens while keeping token names stable where the semantic meaning is shared.
- Add flavor selection through config or `vr add` without allowing accidental mixed-style output.
- Build component parity checks so V02 cannot silently lag behind V01.
- Add visual QA hooks for screenshots, token drift, accessibility states, focus rings, disabled states, and responsive
  behavior.
- Keep docs hooks ready, but defer full public docs to the later documentation phase.

Possible slices:

- 17A flavor architecture
- 17B V02 brutalist tokens
- 17C component parity checks
- 17D flavor selection tooling
- 17E visual QA and docs hooks

## Phase 18: Testing Production

Phase 18 should make Vanrot testing cover realistic page and component workflows while keeping test code readable to
non-devs. The package should help developers test the app from the user's point of view without exposing too much test
runner ceremony.

Ideas to carry forward:

- Add `testPage(...)` as the page-level companion to the existing component testing helper.
- Make router setup, route params, navigation, lazy pages, redirects, guards, and cleanup part of the helper contract.
- Add generator-wide `--test` support for components and pages after the helper APIs are stable.
- Add accessibility assertions around names, roles, disabled states, focus movement, and common semantic mistakes.
- Add async helpers, fake timers, and controlled flush behavior without making tests cryptic.
- Add forms and async-resource testing hooks once Phase 21 APIs exist or are stable enough to test against.
- Keep generated tests on `.test.ts` and preserve readable `function (screen)` examples.

Possible slices:

- 18A `testPage(...)`
- 18B router and page testing helpers
- 18C accessibility assertions
- 18D async and fake timer helpers
- 18E generator-wide `--test` support

## Phase 19: Store Foundation

Phase 19 should introduce a signal-native store that is lightweight by default and enterprise-capable by design. It
should learn from Redux and NgRx without copying their ceremony or making RxJS mandatory.

Ideas to carry forward:

- Start with a dedicated store brainstorming pass before API design.
- Define simple state containers with signal-native reads and predictable writes.
- Decide the smallest useful vocabulary for actions, reducers, selectors, and immutable updates.
- Keep package boundaries clean so `@vanrot/runtime` does not grow because store exists.
- Make state reads ergonomic in Vanrot components without requiring app logic in HTML.
- Include starter examples that show small-app usage and a path toward larger enterprise usage.
- Verify package exports, tree-shaking, SSR boundaries, docs hooks, and release checks.

Possible slices:

- 19A store brainstorming and API vocabulary
- 19B signal-native store core
- 19C actions, reducers, selectors, and immutable updates
- 19D package boundaries
- 19E starter examples

## Phase 20: Store Enterprise Hardening

Phase 20 should add the enterprise features that teams expect from a mature state package while keeping the default
store mental model signal-first.

Ideas to carry forward:

- Add effects only after the core action and reducer contracts are stable.
- Design cancellation and concurrency rules explicitly, especially for duplicate requests and stale writes.
- Add action tracing in a way that can feed future devtools without coupling store to devtools.
- Explore time travel only after state snapshots and replay rules are deterministic.
- Provide Redux mental-model interop for teams migrating from Redux-like systems.
- Provide RxJS interop as an opt-in bridge, not the default dependency or teaching path.
- Keep examples honest about when the enterprise layer is useful and when plain signals are enough.

Possible slices:

- 20A effects and cancellation
- 20B concurrency and action tracing
- 20C time travel and devtools bridge
- 20D Redux compatibility
- 20E RxJS interop

## Phase 21: Forms And Async Resources

Phase 21 should give Vanrot first-party patterns for form-heavy and async-heavy apps without bloating the runtime
kernel. Forms and async resources should be useful together but separable.

Ideas to carry forward:

- Define form state and field metadata before adding validation complexity.
- Decide how two-way binding should work with forms instead of patching it into the compiler alone.
- Add validation, touched/dirty state, messages, accessibility state, and submit lifecycle as explicit form concepts.
- Add an async resource primitive for loading, success, error, refresh, stale, and cancellation states.
- Define cache policy carefully so it stays understandable and does not become a hidden data framework.
- Coordinate async resources with SSR and future `@await` or `@defer` compiler ideas without implementing those early.
- Add testing helpers for forms and async resources once public APIs are stable.

Possible slices:

- 21A form state and field metadata
- 21B validation and messages
- 21C async resource primitive
- 21D cancellation and cache policy
- 21E form and resource testing helpers

## Phase 22: SSR And Hydration

Phase 22 should make Vanrot capable of server rendering and hydration while preserving the clear browser-only boundary
until SSR-specific APIs are intentionally designed.

Ideas to carry forward:

- Audit runtime, compiler, router, forms, async resources, and UI for browser-only assumptions.
- Keep browser APIs isolated behind explicit lifecycle boundaries such as `onMount()`.
- Define the server rendering contract before introducing hydration behavior.
- Add hydration mismatch diagnostics that point to source files and explain likely causes.
- Integrate routing with SSR without weakening the client router contract.
- Define streaming strategy only after basic render and hydrate flows are stable.
- Verify examples across pure client render, static server markup, hydrated routing, and async resource states.

Possible slices:

- 22A SSR-safe API audit
- 22B server rendering
- 22C hydration and mismatch diagnostics
- 22D router integration
- 22E streaming strategy

## Follow-Up When These Become Active

Before executing any of these phases:

- Run a fresh brainstorming pass for the active phase.
- Write or update `docs/superpowers/specs/Phase-XX.md`.
- Write `docs/superpowers/plans/Phase-XX.md`.
- Keep broad phases split into lettered slices when needed.
- Update `docs/superpowers/feature-maturity.md`, `docs/superpowers/final-tdd-inventory.md`, and
  `docs/vanrot-presentation.html` only when the phase status or framework surface changes.
- Run `pnpm verify` before marking anything complete.
