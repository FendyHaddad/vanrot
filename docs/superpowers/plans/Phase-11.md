# Vanrot Phase 11 Production Standards Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs/superpowers/feature-maturity.md` the production source of truth and enforce future phase-completion guardrails against it.

**Architecture:** Phase 11 is a standards and verification phase, not a framework feature phase. The maturity ledger owns production phase order, package/module/submodule ownership, and maturity status; the verifier and local hook enforce that completed phases stay aligned with plans and presentation.

**Tech Stack:** Markdown, HTML, POSIX shell, Node.js ESM, Vitest.

**Execution Rule:** Work in the current `main` workspace only. Do not stage, commit, push, branch, or create a worktree.

---

## File Structure

```txt
docs/superpowers/specs/Phase-11.md
  Owns the approved Phase 11 design, non-goals, status vocabulary, and acceptance criteria.

docs/superpowers/plans/Phase-11.md
  Owns the executable task checklist for Phase 11.

docs/superpowers/feature-maturity.md
  Owns the production roadmap checklist and package/module/submodule maturity rows.

AGENTS.md
  Owns durable workflow rules for future agents, including phase completion and Git ownership.

docs/vanrot-presentation.html
  Owns the visible roadmap slide shown to humans.

scripts/verify-phase-docs.mjs
  Owns automated phase-documentation verification.

scripts/verify-phase-docs.test.mjs
  Owns unit tests for the phase-documentation verifier.

.git/hooks/pre-commit
  Owns the temporary local phase-completion guard.
```

## Task 1: Confirm Phase 11 Spec Boundaries

**Files:**
- Create or modify: `docs/superpowers/specs/Phase-11.md`

- [x] Confirm the spec title is `Vanrot Production Standards Foundation Design`.
- [x] Confirm the spec identifies Phase 11 as `Production Roadmap And Guardrails Foundation`.
- [x] Confirm the goal says Phase 11 prepares production standards and does not add framework feature behavior.
- [x] Confirm the spec declares `docs/superpowers/feature-maturity.md` as the production ledger.
- [x] Confirm the spec separates `Demo-Capable` from `Production-Ready`.
- [x] Confirm the non-goals explicitly exclude runtime/compiler/Vite hardening, router work, UI primitives, docs website work, publishing, and registry strategy changes.

Verification:

```bash
grep -n "Production Roadmap And Guardrails Foundation" docs/superpowers/specs/Phase-11.md
grep -n "feature-maturity.md" docs/superpowers/specs/Phase-11.md
grep -n "Demo-Capable" docs/superpowers/specs/Phase-11.md
```

## Task 2: Update The Production Maturity Ledger

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`

- [x] Add or confirm a production roadmap checklist after demo Phase 10.
- [x] Confirm Phase 11 is titled `Production roadmap and standards foundation`.
- [x] Confirm Phase 11 modules include feature maturity ledger, production gates, phase order, package/module ownership, and release-readiness vocabulary.
- [x] Confirm the production roadmap continues through the current planned production tracks:

```txt
Phase 11 Production roadmap and standards foundation
Phase 12 Core framework hardening
Phase 13 Project configuration system
Phase 14 CLI production experience
Phase 15 Router production
Phase 16 UI production V01
Phase 17 UI production V02
Phase 18 Testing production
Phase 19 Store foundation
Phase 20 Store enterprise hardening
Phase 21 Forms and async resources
Phase 22 SSR and hydration
Phase 23 Devtools and project intelligence hardening
Phase 24 Documentation and web presence
Phase 25 AI consumption
Phase 26 Distribution and release hardening
```

- [x] Add or confirm the `Repo -> Production Standards Foundation` section.
- [x] Ensure that section has Phase 11 rows for:

```txt
Production phase checklist
Production readiness gates
Package/module ownership map
```

- [x] Keep Phase 11 checklist and maturity rows unchecked or `Planned` until Phase 11 implementation verification passes.
- [x] Do not require `docs/brainstorm.md` for production phase completion.

Verification:

```bash
grep -n "Production Roadmap Checklist" docs/superpowers/feature-maturity.md
grep -n "Phase 11 | Production roadmap and standards foundation" docs/superpowers/feature-maturity.md
grep -n "Production Standards Foundation" docs/superpowers/feature-maturity.md
```

## Task 3: Update Durable Agent Rules

**Files:**
- Modify: `AGENTS.md`

- [x] Update the Phase Completion Protocol so completed phases tick `docs/superpowers/feature-maturity.md`.
- [x] Remove `docs/brainstorm.md` as a required production phase-completion file.
- [x] Keep the rule that `docs/vanrot-presentation.html` must reflect roadmap state.
- [x] Keep the rule that matching plans must have completed tasks checked before a phase is marked done.
- [x] Keep the user-owned Git rule: no staging, commit, push, branch, or worktree unless explicitly requested.
- [x] Document that `pnpm verify:phase-docs` uses `feature-maturity.md` as the phase source of truth.

Verification:

```bash
grep -n "feature-maturity.md" AGENTS.md
grep -n "Git Ownership Protocol" AGENTS.md
grep -n "verify:phase-docs" AGENTS.md
```

## Task 4: Test-Drive Phase Documentation Verification

**Files:**
- Modify: `scripts/verify-phase-docs.test.mjs`

- [x] Add or confirm a test that parses completed and pending phases from the feature maturity roadmap table.
- [x] Add or confirm a test that fails when a completed phase plan still has unchecked tasks.
- [x] Add or confirm a test that fails when a completed phase has no matching plan file content.
- [x] Add or confirm a test that fails when a completed phase has maturity rows still marked `Planned`.
- [x] Add or confirm a test that fails when the presentation does not mark completed phases as done and the next pending phase as active.
- [x] Ensure expected failure messages reference `docs/superpowers/feature-maturity.md`, not `docs/brainstorm.md`.

Verification:

```bash
pnpm test:phase-docs
```

## Task 5: Implement Feature Maturity Verifier Rules

**Files:**
- Modify: `scripts/verify-phase-docs.mjs`

- [x] Ensure `parseMaturityRoadmapPhases(markdown)` parses roadmap rows shaped like:

```txt
| [x] | Phase 11 | Production roadmap and standards foundation | ... |
| [ ] | Phase 12 | Core framework hardening | ... |
```

- [x] Ensure `checkCompletedPhasePlans(phases, planContentByPhase)` fails when a completed phase has no plan file.
- [x] Ensure `checkCompletedPhasePlans(phases, planContentByPhase)` fails when a completed phase plan still has unchecked `- [ ]` tasks.
- [x] Ensure `checkMaturityRows(phases, maturityMarkdown)` fails when a completed phase still has maturity rows marked `Planned`.
- [x] Ensure `checkPresentationRoadmap(phases, presentationHtml)` fails when completed phases are not `.done` and the next pending phase is not `.active-phase`.
- [x] Ensure the script reads `docs/superpowers/feature-maturity.md`.
- [x] Ensure the script does not read `docs/brainstorm.md` for production phase status.

Verification:

```bash
pnpm test:phase-docs
pnpm verify:phase-docs
```

## Task 6: Update The Temporary Phase-Completion Hook

**Files:**
- Modify: `.git/hooks/pre-commit`

- [x] Detect phase completion when staged changes tick a phase in `docs/superpowers/feature-maturity.md`.
- [x] Detect phase completion when a staged plan appears fully checked.
- [x] Require `docs/superpowers/feature-maturity.md` when phase completion is detected.
- [x] Require `docs/vanrot-presentation.html` when phase completion is detected.
- [x] Do not require `docs/brainstorm.md` when phase completion is detected.
- [x] Keep the temporary bypass command unchanged:

```bash
VANROT_SKIP_PHASE_HOOK=1 git commit
```

Verification:

```bash
sh -n .git/hooks/pre-commit
grep -n "feature-maturity.md" .git/hooks/pre-commit
```

## Task 7: Update The Presentation Roadmap

**Files:**
- Modify: `docs/vanrot-presentation.html`

- [x] Update the roadmap slide so it presents the production roadmap, not only demo phases.
- [x] Mark Phase 11 as the active production phase while the phase is in progress.
- [x] Include Phase 12 through Phase 26 as planned production phases.
- [x] State that `docs/superpowers/feature-maturity.md` is the tracker for production phase completion.
- [x] Keep the slide concise enough to scan; do not turn it into documentation prose.

Verification:

```bash
grep -n "Production Roadmap" docs/vanrot-presentation.html
grep -n "Phase 11" docs/vanrot-presentation.html
grep -n "feature-maturity.md" docs/vanrot-presentation.html
```

## Task 8: Complete Phase 11 Documentation State

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/plans/Phase-11.md`
- Modify: `docs/vanrot-presentation.html`

Run this task only after Tasks 1 through 7 pass their verification commands.

- [x] Tick Phase 11 in the production roadmap checklist in `docs/superpowers/feature-maturity.md`.
- [x] Set verified Phase 11 maturity rows to `Production-Ready`.
- [x] Mark Phase 11 done in `docs/vanrot-presentation.html`.
- [x] Mark Phase 12 active in `docs/vanrot-presentation.html`.
- [x] Mark every completed task in this plan as checked.
- [x] Leave Phase 12 and later roadmap rows unchecked.

Verification:

```bash
pnpm verify:phase-docs
```

## Final Verification

Run:

```bash
pnpm test:phase-docs
pnpm verify:phase-docs
git diff --check
pnpm verify
git status --short --branch
```

Expected final state:

```txt
Phase documentation verification passed.
```

`git status --short --branch` should show only intentional local changes. Do not stage, commit, push, branch, or create a worktree.
