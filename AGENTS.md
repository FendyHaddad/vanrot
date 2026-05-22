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

## Superpowers Workflow Protocol

When using Superpowers skills in this repository, do not use subagents, parallel agents, agent dispatch, or subagent-driven workflows.

Adapt Superpowers workflows to inline execution in the current session, using explicit plans, checklists, and review checkpoints instead of delegating work.

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

# [vanrot] recent context, 2026-05-22 9:05pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (21,539t read) | 1,051,348t work | 98% savings

### May 20, 2026
S589 Vanrot Runtime Kernel Rule — full spec design complete, ready to write design doc (May 20 at 10:42 PM)
S590 @vanrot/runtime Reactive Kernel API spec — full surface defined, two open questions raised before freezing (May 20 at 10:51 PM)
S591 @vanrot/runtime Reactive Kernel API spec — full surface defined, two open questions raised before freezing (May 20 at 10:57 PM)
S592 @vanrot/runtime lifecycle and DOM helper boundaries finalized — two final questions before writing spec doc (May 20 at 10:57 PM)
S593 @vanrot/runtime lifecycle and DOM helper boundaries finalized — two final clarifications before writing spec doc (May 20 at 11:06 PM)
S595 Write @vanrot/runtime implementation plan phase-by-phase using writing-plans skill — plan only, no code (May 20 at 11:06 PM)
S594 Write @vanrot/runtime implementation plan (phase-by-phase, no code implementation) using writing-plans skill (May 20 at 11:23 PM)
S596 Write @vanrot/runtime implementation plan phase-by-phase using writing-plans skill — plan only, no code (May 20 at 11:29 PM)
S597 @vanrot/runtime implementation plan written phase-by-phase — plan complete, awaiting execution approach decision (May 20 at 11:32 PM)
S598 @vanrot/runtime implementation plan complete — 9 phases, 15 tasks, awaiting execution approach decision (May 20 at 11:34 PM)
### May 22, 2026
1704 3:07p 🟣 Phase 12A Task 1 implemented and verified successfully
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
1720 " 🔵 Vanrot Phase 12A Task 2 Spec Compliance Review — APPROVED
1721 3:24p 🟣 Vanrot Phase 12A Task 3: Compiler Diagnostics Red Audit Test Added
1724 3:29p 🟣 Vanrot Phase 12A Task 4: 12D Vite HMR Red Audit Test Added
1722 3:30p 🟣 audits/core/compiler.audit.ts Created — Phase 12A Task 3 Complete
1725 3:33p 🟣 Phase 12A Task 4 Complete: 12D Vite HMR Red Audit Test Created and Verified
1726 " 🔵 Current handleVanrotHotUpdate Behavior: Full-Reload on Template Changes
1727 " 🔵 Vanrot Audit Lane Structure: audit-slices.ts Defines 4 Phase-12 Slices
1728 3:34p 🟣 Phase 12E Red Audit Test: TypeScript Contracts
1729 3:36p 🟣 Phase 12A Task 5 Complete: 12E TypeScript Contracts Audit Test Created and Verified Red
1730 " 🔵 Phase 12A Task 5: TypeScript Contracts Audit File Review — APPROVED
1731 3:38p ⚖️ Phase 12A Task 5 TypeScript Contracts Audit — APPROVED
1733 " ✅ Vanrot Phase 12A Task 6: TDD Inventory Verification
1734 3:44p 🔵 Phase 12A Task 6: final-tdd-inventory.md Fully Pre-Populated, No Changes Needed
1735 " 🔵 rg Command Gotcha: zsh Backtick Substitution in Double-Quoted Patterns
1736 " 🔵 AGENTS.md Phase Completion Protocol Mandates final-tdd-inventory.md Updates
1739 " 🔵 Vanrot Phase 12A Task 8 Spec Compliance Review — APPROVED
1737 3:46p 🔵 Vanrot Phase 12A Task 8 — documentation review findings
1738 3:47p 🔵 Phase 12A Task 8 review verdict: ISSUES — presentation wording ambiguous on Phase 12 pending status
1743 6:28p 🟣 Source Span Infrastructure Added to Vanrot Compiler (Phase 12C Task 1)
1744 " 🟣 Diagnostic Catalog and Rich CompileDiagnostic Fields Added
1745 " 🔵 Pre-Task Compiler State: No Source Dir, Existing Test Uses toEqual on CompileDiagnostic
1746 " 🟣 TDD Red Phase Confirmed: location.test.ts Fails as Expected
1747 " 🟣 All Task 1 Source Files Written: location.ts, catalog.ts, types.ts, diagnostics.ts, index.ts, diagnostics.test.ts
1748 6:33p 🔵 Phase 12C Task 1 Spec Compliance Re-Review Initiated
1750 6:38p 🔵 Phase 12C Task 1 Post-Fix Code Quality Re-Review Scope
1753 6:40p 🟣 Phase 12C Task 2: Template AST Span Tracking Initiated
1749 " 🔵 Phase 12C Task 1: Spec Compliant — All Tests Pass
1751 6:41p 🔵 Phase 12C Task 1 Re-Review: All Three Fixes Verified Correct — APPROVED
1752 " 🔵 Phase 12C Task 1 Caller Drift Risk: Hardcoded Strings Duplicate Catalog Messages
1756 6:43p ⚖️ Phase 12C Task 2 Code-Quality Review — Two Additional Fixes Queued
1754 6:50p 🔵 Phase 12C Task 2: Template AST Spans And Normal HTML Parsing — Review Scope
1755 " 🟣 Phase 12C Task 2: SourceSpan Added to All Template AST Nodes and Bindings
1757 6:54p 🔵 Phase 12C Task 2 re-review: createAttributeValueSpan entity-robustness confirmed
1758 " 🔵 Phase 12C Task 2 re-review: bindings.ts intentionally skips if-block/for-block/slot-outlet traversal
1759 " 🔵 Phase 12C Task 2 compiler tests: 51 tests across 13 files all pass

Access 1051k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
