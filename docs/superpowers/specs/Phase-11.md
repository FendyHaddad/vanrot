# Vanrot Production Standards Foundation Design

**Date:** 2026-05-22
**Phase:** Phase 11 - Production Roadmap And Guardrails Foundation
**Packages:** repo, docs, verification, local hooks
**Status:** Draft for review
**Related:**
- `AGENTS.md`
- `docs/superpowers/feature-maturity.md`
- `docs/vanrot-presentation.html`
- `scripts/verify-phase-docs.mjs`
- `.git/hooks/pre-commit`

## 1. Goal

Phase 11 turns Vanrot from a demo-phase project into a production-roadmap project.

Phases 0 through 10 proved the framework shape: runtime, compiler, Vite plugin, CLI, project intelligence, router, UI primitive generation, and testing foundations. Phase 11 does not add a new framework feature. It creates the production standards system that future phases must follow before any feature is called production-ready.

The primary source of truth becomes `docs/superpowers/feature-maturity.md`. Future phases should use that file to answer four questions:

- Which package owns this work?
- Which module or submodule does it belong to?
- Is it only demo-capable, or production-ready?
- What verification gate proves the status?

## 2. Core Decisions

### `feature-maturity.md` Is The Production Ledger

`docs/brainstorm.md` remains historical brainstorming context. It should not be the required completion tracker for production phases.

Production work lives in `docs/superpowers/feature-maturity.md`. That file must contain the ordered production roadmap, package sections, module sections, submodule rows, status vocabulary, and acceptance gates.

### Demo-Capable Is Not Production-Ready

Vanrot needs strict language for maturity. A feature can be useful in a demo while still missing edge cases, diagnostics, typing depth, integration tests, accessibility, performance validation, documentation, or release hardening.

Future phase work must mark only the status it actually earns.

### Guardrails Must Match The Ledger

The verifier and pre-commit hook should enforce the current source of truth:

- completed phases must be marked in `feature-maturity.md`;
- completed phase plans must have no unchecked tasks;
- completed maturity rows must not remain `Planned`;
- `docs/vanrot-presentation.html` must match the roadmap status;
- future changes should not reintroduce `brainstorm.md` as a mandatory production tracker.

### Phase 11 Is A Standards Phase

Phase 11 should not harden runtime/compiler/router/UI behavior. It prepares the rails for that work.

Phase 12 starts core framework hardening. Phase 11 should make Phase 12 easier to plan, verify, and review.

## 3. Status Vocabulary

Production roadmap rows should use clear status labels.

```txt
Planned
Demo-Capable
Production-Ready
Deferred
Blocked
```

`Planned` means the feature is not implemented or not verified.

`Demo-Capable` means the feature works for the current demo requirements, with known production gaps still tracked.

`Production-Ready` means the feature has implementation, edge-case tests, integration tests where relevant, diagnostics, documentation hooks, and known limitations recorded.

`Deferred` means the feature is intentionally out of the current production sequence.

`Blocked` means the feature cannot proceed until a dependency or decision is resolved.

## 4. Production Roadmap Model

The production checklist should be ordered by dependency:

1. Standards and guardrails.
2. Runtime/compiler/Vite hardening.
3. Project configuration.
4. CLI production experience.
5. Router production.
6. UI production flavors.
7. Testing production.
8. Store, forms, SSR, devtools, docs, AI consumption, and distribution.

Each roadmap phase should name:

- the phase number;
- the track;
- package/module/submodule ownership;
- a concrete acceptance gate.

## 5. Guardrail Model

Phase documentation verification should treat the maturity ledger as canonical.

The verifier should parse completed phases from `feature-maturity.md`, not `docs/brainstorm.md`. For each completed phase, it should confirm the matching plan file has all tasks ticked.

The presentation check should verify:

- completed roadmap phases are marked done;
- the next pending phase is active;
- the roadmap copy reflects production work, not only demo work.

The local pre-commit hook should only block phase-completion commits when the staged changes imply a phase was completed without the matching maturity ledger, plan, or presentation updates.

## 6. Explicit Non-Goals

Phase 11 must not:

- implement Phase 12 runtime/compiler/Vite hardening;
- add new CLI behavior;
- add new router behavior;
- add new UI primitives;
- create the docs website;
- publish packages;
- change package registry strategy;
- mark production features complete without verification.

## 7. Acceptance Criteria

Phase 11 is complete when:

- `docs/superpowers/specs/Phase-11.md` defines this production standards foundation.
- `docs/superpowers/plans/Phase-11.md` gives executable tasks for the standards and guardrails work.
- `docs/superpowers/feature-maturity.md` has the production roadmap checklist and package/module/submodule sections.
- `AGENTS.md` says future phase completion uses `feature-maturity.md`.
- `.git/hooks/pre-commit` checks phase completion against `feature-maturity.md`.
- `scripts/verify-phase-docs.mjs` checks completed production phases against plans and presentation state.
- `docs/vanrot-presentation.html` shows Phase 11 as the production standards starting point.
- `pnpm verify:phase-docs` passes.
- `pnpm verify` passes.

## 8. Self-Review Notes

- The design keeps Phase 11 narrow. That prevents production hardening work from leaking in before the roadmap system exists.
- The design honors the user-owned Git rule by requiring verification but not commits.
- The design avoids treating old brainstorming docs as mandatory production workflow.
- The design leaves Phase 12 free to focus on the real framework hardening work.
