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
2. Update `docs/vanrot-presentation.html` so the roadmap slide matches the tracker.
3. If requirements changed, update `docs/brainstorm.md` and the matching spec or plan under `docs/superpowers/`.
4. Stage the tracker, presentation, and requirement docs together.

Do not mark a phase done until its verification criteria pass.

A temporary local hook at `.git/hooks/pre-commit` enforces this for phase-completion commits. It can be bypassed only when intentionally needed:

```sh
VANROT_SKIP_PHASE_HOOK=1 git commit
```

<claude-mem-context>
# Memory Context

# [vanrot] recent context, 2026-05-21 12:51pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 26 obs (10,285t read) | 268,595t work | 96% savings

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
S598 @vanrot/runtime implementation plan complete — 9 phases, 15 tasks, awaiting execution approach decision (May 20 at 11:34 PM)
**Investigated**: Spec fully read. All 12 kernel symbols reviewed. Vanrot repo confirmed empty (docs/ only, no packages/, no tooling).

**Learned**: - Tooling chosen from scratch: TypeScript 5, Vitest 2, pnpm workspaces, size-limit 11, jsdom for DOM tests
    - Reactive graph owns all mutable state; reactive primitives import functions only
    - CleanupScope is WeakMap-backed opaque handle
    - signal tests depend on effect — Task 5 must precede full Task 4 test run
    - Both export paths (public + internal) count toward 5KB hard fail

**Completed**: docs/superpowers/plans/2026-05-20-vanrot-runtime-kernel.md written and saved.
    Phase 1: monorepo scaffold | Phase 2: graph.ts | Phase 3: signal+effect+untrack+computed+batch | Phase 4: cleanup-scope | Phase 5: onDestroy+onMount | Phase 6: mount() | Phase 7: listen() | Phase 8: entrypoint wiring | Phase 9: size-limit CI gate.
    All 20 spec requirements covered. No placeholders. Types consistent across all 15 tasks.

**Next Steps**: User choosing execution approach: Subagent-Driven (recommended) or Inline Execution. Once chosen, implementation begins with Task 1 (monorepo scaffold).


Access 269k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
