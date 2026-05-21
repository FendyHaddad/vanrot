## Vanrot Project Rules

All Vanrot code, examples, generated output, specs, and plans should follow the framework rules we expect users to follow:

- Use guard clauses instead of nested control flow.
- Use signals for state.
- Never put UI markup in TypeScript.
- Never put application logic in HTML.
- Use role-based file suffixes such as `.component.ts`, `.page.ts`, `.dialog.ts`, `.layout.ts`, `.widget.ts`, and `.form.ts`.
- Use scoped CSS for component styling.

If existing files violate these rules, do not spread the pattern. Fix only the part touched by the current task unless the user asks for a broader cleanup.

## Phase Completion Protocol

When a Vanrot phase is completed:

1. Tick the matching phase in `docs/brainstorm.md`.
2. Mark every completed task in the matching `docs/superpowers/plans/Phase-XX.md`.
3. Update `docs/vanrot-presentation.html` so the roadmap slide matches the tracker.
4. Update `docs/superpowers/feature-maturity.md` whenever a phase changes feature maturity.
5. If requirements changed, update `docs/brainstorm.md` and the matching spec or plan under `docs/superpowers/`.
6. Run `pnpm verify`, which includes `verify:phase-docs` and the runtime size budget.
7. Stage the tracker, presentation, maturity ledger, plan, and requirement docs together.

Do not mark a phase done until its verification criteria pass.

`pnpm verify:phase-docs` enforces the phase documentation guardrail:

- completed phases in `docs/brainstorm.md` must not have unchecked tasks in their matching plan file;
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

# [vanrot] recent context, 2026-05-21 11:17pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 37 obs (14,113t read) | 609,137t work | 98% savings

### May 20, 2026
1639 10:18p ⚖️ Framework Scope Creep Concern: Library vs Framework Trade-off
1640 10:40p ⚖️ @vanrot/runtime Kernel Rule Architecture Decision
1641 " 🔵 Vanrot docs/brainstorm.md: Existing Runtime Scope and Architecture
1642 10:41p ⚖️ @vanrot/runtime Hard Size Budget: 3KB gzip target, 5KB hard ceiling
1643 " ⚖️ @vanrot/runtime Boundary Evaluation Order: Disqualifiers Before Qualifiers
1644 " ⚖️ @vanrot/runtime DOM Helper Inclusion Rule with Explicit Allow/Deny List
S589 Vanrot Runtime Kernel Rule — full spec design complete, ready to write design doc (May 20 at 10:42 PM)
S590 @vanrot/runtime Reactive Kernel API spec — full surface defined, two open questions raised before freezing (May 20 at 10:51 PM)
1645 10:57p ⚖️ @vanrot/runtime Reactive Kernel API: Full Public Surface Defined
S591 @vanrot/runtime Reactive Kernel API spec — full surface defined, two open questions raised before freezing (May 20 at 10:57 PM)
S592 @vanrot/runtime lifecycle and DOM helper boundaries finalized — two final questions before writing spec doc (May 20 at 10:57 PM)
1646 11:06p ⚖️ @vanrot/runtime Lifecycle API: Ownership-Only Primitives, Not Full Lifecycle System
1647 " ⚖️ @vanrot/runtime DOM Helper Policy: Compiler-Inline by Default, Runtime Only for Cleanup-Linked Helpers
1648 " ⚖️ @vanrot/runtime MVP Final API Surface: Complete Confirmed List
S593 @vanrot/runtime lifecycle and DOM helper boundaries finalized — two final clarifications before writing spec doc (May 20 at 11:06 PM)
S595 Write @vanrot/runtime implementation plan phase-by-phase using writing-plans skill — plan only, no code (May 20 at 11:06 PM)
1649 11:14p ⚖️ @vanrot/runtime mount() and listen() Final Definitions Locked
1650 " ⚖️ @vanrot/runtime Complete Final API Inventory — All Symbols and Export Paths Locked
1651 11:15p 🟣 @vanrot/runtime Kernel Design Spec Written to docs/superpowers/specs/
1652 " ⚖️ mount() cleanup scope contract clarified — component creation runs inside root scope
1653 " ⚖️ Size budget scope expanded to include @vanrot/runtime/internal
1654 " ⚖️ effect() error behavior decided: propagate synchronously in dev and production
1655 " ⚖️ @vanrot/runtime/internal declared explicitly unsupported for app authors
1656 " ⚖️ @vanrot/runtime kernel identity finalized
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

Access 609k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
