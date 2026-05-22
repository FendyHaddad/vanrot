## Vanrot Project Rules

All Vanrot code, examples, generated output, specs, and plans should follow the framework rules we expect users to follow:

- Use guard clauses instead of nested control flow.
- Use signals for state.
- Never put UI markup in TypeScript.
- Never put application logic in HTML.
- Use role-based file suffixes such as `.component.ts`, `.page.ts`, `.dialog.ts`, `.layout.ts`, `.widget.ts`, and `.form.ts`.
- Use scoped CSS for component styling.
- Avoid reused string literals. Shared strings such as route names, route paths, route labels, command names, diagnostic codes, file suffixes, and generated copy should live in one named source of truth and be referenced from there. Literal strings are acceptable only at the owning source of truth boundary or when a standard API requires them.
- Prefer readable, English-like APIs over clever shorthand. Short names are good only when they remain obvious to non-dev readers.

If existing files violate these rules, do not spread the pattern. Fix only the part touched by the current task unless the user asks for a broader cleanup.

## Phase Completion Protocol

When a Vanrot phase is completed:

1. Tick the matching phase in `docs/superpowers/feature-maturity.md`.
2. Mark every completed task in the matching `docs/superpowers/plans/Phase-XX.md`.
3. Update `docs/vanrot-presentation.html` so the roadmap slide matches the tracker.
4. Update `docs/superpowers/feature-maturity.md` whenever a phase changes feature maturity, scope, or production ordering.
5. Update `docs/superpowers/final-tdd-inventory.md` whenever a phase adds or changes a package, feature, component, command, convention, helper, example, or generated file.
6. If requirements changed, update the matching spec or plan under `docs/superpowers/`.
7. Run `pnpm verify`, which includes `verify:phase-docs` and the runtime size budget.
8. When committing, stage the maturity ledger, final TDD inventory, presentation, plan, and requirement docs together.

Do not mark a phase done until its verification criteria pass.

Production phases must be sliced from `docs/superpowers/feature-maturity.md`, not squeezed into vague all-in-one milestones. Treat the maturity ledger as the full production backlog. When a ledger section is broad, split it into the smallest coherent executable phase or sub-phase, keep unfinished production requirements tracked in `feature-maturity.md`, and only mark rows `Production-Ready` when the exact slice has implementation, edge-case coverage, integration coverage where relevant, diagnostics or docs hooks where relevant, and verification evidence.

`docs/superpowers/final-tdd-inventory.md` is the final release testing memory. It must grow with each production phase so Phase 26 can run complete failing and passing TDD coverage across every package, command, component, convention, helper, example, and generated file before distribution.

`pnpm verify:phase-docs` enforces the phase documentation guardrail:

- completed phases in `docs/superpowers/feature-maturity.md` must not have unchecked tasks in their matching plan file;
- feature maturity rows for completed phases must not remain `Planned`;
- the presentation roadmap must mark completed phases as done and the next pending phase as active.

A temporary local hook at `.git/hooks/pre-commit` enforces this for phase-completion commits. It can be bypassed only when intentionally needed:

```sh
VANROT_SKIP_PHASE_HOOK=1 git commit
```

## Git Ownership Protocol

The user owns commits and pushes by default.

Unless the user explicitly asks for a commit, branch, merge, tag, or push:

1. Make changes directly in the current local `main` workspace that tracks `origin/main`.
2. Do not create a separate branch or worktree.
3. Do not run `git add`.
4. Do not run `git commit`.
5. Do not run `git push`.
6. Leave completed changes in the working tree for the user to inspect, stage, commit, and push.

When work is complete, report:

- the changed files;
- the verification commands that passed or failed;
- the current `git status --short --branch`;
- whether any unrelated local changes were left untouched.

If a task genuinely requires committing or pushing, ask first unless the user already gave that instruction in the same task.

## Living Rules Protocol

Treat `AGENTS.md` as the durable project rulebook, but do not silently rewrite it.

During prolonged work, watch for durable preferences or repeated corrections from the user. Examples:

- "from now on..."
- "always..."
- "never..."
- repeated reminders about the same workflow mistake;
- project standards that should apply to future phases.

When a durable rule appears:

1. If the user explicitly asks to put it in `AGENTS.md`, update `AGENTS.md` immediately.
2. If the user states a likely durable preference but does not ask for an edit, mention a concise proposed `AGENTS.md` rule before or during the final response.
3. Do not add broad rules from one-off preferences, temporary debugging choices, or unclear frustration.
4. Record significant durable rules in memory with a deterministic `contentSessionId` so future sessions can recover the context.

At the start of significant tasks, read `AGENTS.md` first and follow the current rules over older habits from the conversation.

<claude-mem-context>
# Memory Context

# [vanrot] recent context, 2026-05-22 3:23pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (18,666t read) | 985,548t work | 98% savings

### May 20, 2026
S589 Vanrot Runtime Kernel Rule — full spec design complete, ready to write design doc (May 20 at 10:42 PM)
S590 @vanrot/runtime Reactive Kernel API spec — full surface defined, two open questions raised before freezing (May 20 at 10:51 PM)
S591 @vanrot/runtime Reactive Kernel API spec — full surface defined, two open questions raised before freezing (May 20 at 10:57 PM)
S592 @vanrot/runtime lifecycle and DOM helper boundaries finalized — two final questions before writing spec doc (May 20 at 10:57 PM)
S593 @vanrot/runtime lifecycle and DOM helper boundaries finalized — two final clarifications before writing spec doc (May 20 at 11:06 PM)
S595 Write @vanrot/runtime implementation plan phase-by-phase using writing-plans skill — plan only, no code (May 20 at 11:06 PM)
1658 11:23p ⚖️ @vanrot/runtime implementation plan requested with phase-by-phase structure
S594 Write @vanrot/runtime implementation plan (phase-by-phase, no code implementation) using writing-plans skill (May 20 at 11:23 PM)
1657 11:28p 🔵 Vanrot Framework Vision Documented in brainstorm.md
1659 " ⚖️ Vanrot Architectural Decisions and Long-Term Identity Confirmed
1660 " 🔵 Vanrot Full MVP Build Order and CLI Command Catalog Extracted
1662 " 🔵 Vanrot Repo Is Docs-Only — No Package Directories Exist Yet
1663 " ✅ Codex Subagent Dispatched to Add Phase Checklist to brainstorm.md
S596 Write @vanrot/runtime implementation plan phase-by-phase using writing-plans skill — plan only, no code (May 20 at 11:29 PM)
1661 11:30p 🔵 @vanrot/runtime Kernel Design Spec Exists and Is Approved
S597 @vanrot/runtime implementation plan written phase-by-phase — plan complete, awaiting execution approach decision (May 20 at 11:32 PM)
1664 11:32p ✅ Phase Checklist Table (Section 38) Added to docs/brainstorm.md
1670 " 🔴 vite-plugin fixture npm EUNSUPPORTEDPROTOCOL error fixed
1671 " 🟣 Regression test added for fixture package.json validity
1672 " ✅ Phase-06.md plan updated with packageManager field in counter example
1673 " 🔵 Full pnpm verify baseline confirmed clean before Phase 6 start
S598 @vanrot/runtime implementation plan complete — 9 phases, 15 tasks, awaiting execution approach decision (May 20 at 11:34 PM)
### May 21, 2026
1674 10:46p 🔵 Phase 6 plan loaded — 7 tasks across 6 stages
1675 " 🔵 CLI create/generate current state vs Phase 6 required changes
1676 " ✅ Commit dd51b30 "Fix package" pushed to origin/main
1678 10:47p ⚖️ Phase 0–6 Code Review + TDD Before Phase 6 Demo
1679 10:54p ✅ AGENTS.md: Git Ownership + Living Rules Protocols Added
1680 11:00p ⚖️ Phase 0–6 Review + TDD + Demo Session Plan Initialized
1681 " 🔵 Vanrot Phase 0–6 Code Surface Confirmed for Review
### May 22, 2026
1685 12:25p 🔵 VanRot Framework — Multi-Phase Demo Complete (Phases 1–10)
1686 " ⚖️ File Suffix Convention: Role-Based Prefix System (.ui, .page, .component, .test)
1687 " ⚖️ Router Design: route.ts Single Source of Truth, No String Literals in Templates
1688 " ⚖️ NPM Retained Over JSR — Masking Strategy Deferred
1689 " ⚖️ No Auto-Commit Rule — Developer Controls All Git Commits
1690 " ⚖️ Testing Syntax: English-First Readable Tests Chosen Over `it`/`describe`
1691 " ⚖️ feature-maturity.md Structure: Packages/Modules/Submodules with Phased Checklist
1692 " ✅ Hook Updated: Phase Completion Triggers feature-maturity.md + presentation.html Updates
1693 " 🔵 Workspace Protocol Error: @vanrot/router Not Resolvable from npm Registry
1694 " ⚖️ UI Components Use Custom Element Tags: &lt;vr-button&gt;, &lt;vr-tabs&gt;, etc.
1696 12:33p 🟣 Phase 11 Spec Created: Production Roadmap + Guardrails Foundation
1697 " ⚖️ feature-maturity.md Replaces brainstorm.md as Mandatory Phase Completion Tracker
1698 12:38p 🟣 Phase 11 Implementation Plan Written: 8-Task Production Standards Checklist
1701 3:07p 🟣 Vanrot Phase 12A Task 1: Isolated Core Audit Lane
1702 " 🔵 Vanrot AGENTS.md: Project Rules and Phase Protocols
1703 " 🔵 Vanrot working tree state at Phase 12A Task 1 start
1704 " 🟣 Phase 12A Task 1 implemented and verified successfully
1705 " 🔵 Vanrot working tree state after Phase 12A Task 1 completion
1706 3:08p 🔵 Local memory API /api/sessions/observations requires tool_name field
1708 " 🔵 Vanrot Phase 12A Task 1 Spec Compliance Review
1709 3:11p 🔵 Vanrot Phase 12A Task 1 — Spec Compliance APPROVED
1710 3:12p 🔵 Vitest 4.1.6 does not support --include as a CLI flag
1711 " 🔴 Fixed audit:core test discovery via dedicated vitest.audit.config.ts
1712 3:14p 🔵 Vanrot Phase 12A Task 1 Spec Compliance Re-Review Requested
1713 3:16p 🔵 Vanrot Phase 12A Task 1 Code Review — APPROVED
1714 3:17p 🔵 Vanrot Phase 12A Task 1 Spec Compliance — APPROVED
1715 3:18p 🔵 Vanrot audit files confirmed excluded from root tsconfig.json project references
1716 " 🔵 Phase 12A Task 1 review verdict APPROVED — observations submitted to worker session store
1717 3:19p 🟣 Phase 12A Task 2: Red Runtime Audit Test Added
1718 3:21p 🔵 Runtime cleanup-scope lacks parent-child disposal chain
1719 " 🟣 audits/core/runtime.audit.ts created and verified red

Access 986k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
