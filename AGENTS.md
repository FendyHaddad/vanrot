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

## Superpowers File Naming Protocol

Brainstorming specs and writing-plan files should follow the phase naming convention used by this repo.

- Phase specs live under `docs/superpowers/specs/` and use `Phase-XX.md` or `Phase-XXA.md` style names, such as `Phase-15A.md`.
- Writing plans live under `docs/superpowers/plans/` and use the matching phase name, such as `Phase-15A.md`.
- Do not create dated brainstorming or writing-plan filenames for numbered Vanrot phases unless the user explicitly asks for an addendum outside the phase convention.
- When a broad production phase is split, name each slice with a letter suffix, such as `Phase-15A`, `Phase-15B`, and `Phase-15C`.

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

# [vanrot] recent context, 2026-05-24 4:16am GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (13,585t read) | 1,634,340t work | 99% savings

### May 20, 2026
S596 Write @vanrot/runtime implementation plan phase-by-phase using writing-plans skill — plan only, no code (May 20 at 11:29 PM)
S597 @vanrot/runtime implementation plan written phase-by-phase — plan complete, awaiting execution approach decision (May 20 at 11:32 PM)
S598 @vanrot/runtime implementation plan complete — 9 phases, 15 tasks, awaiting execution approach decision (May 20 at 11:34 PM)
S652 Investigate why using Codex with claude-mem charges Claude API usage — determine if harnesses are co-dependent and how to fix it (May 20 at 11:34 PM)
### May 23, 2026
S653 Switch claude-mem provider from Claude API to Gemini to stop unexpected charges when using Codex harness (May 23 at 3:12 AM)
S654 Switch claude-mem provider from Claude API to Gemini free tier to eliminate unexpected charges when using Codex harness (May 23 at 3:13 AM)
S655 Clarify Claude-Mem provider billing and restart worker (May 23 at 3:15 AM)
S656 Address Claude-Mem provider billing and worker status (May 23 at 3:16 AM)
S657 Clarify billing for Claude Code, Claude-Mem, and Codex (May 23 at 3:16 AM)
1770 3:18a 🔵 Codex configuration files and model usage
S658 Clarify billing for Claude Code, Claude-Mem, and Codex (May 23 at 3:19 AM)
1773 2:08p 🔵 TaskCreate Tool Identified
1774 " 🟣 Task Creation for Project Context Exploration
1772 " 🟣 Enhanced UI for Superpowers Feature
1776 " 🔵 Context Mode Batch Execute Tool Identified
1778 " 🔵 Phase 14 CLI Design Details Discovered
1785 2:09p 🔵 CLI Renderer and Presentation Design Details Discovered
1800 " 🔵 CLI Entry Point and Command Handling Structure Identified
1818 " 🔵 Doctor Command Implementation Details
1792 2:10p 🔵 CLI Implementation Files and Commands Identified
1808 2:11p 🔵 Reporter Interface and Implementations Identified
1826 2:29p 🔵 Command Metadata and Aliases Defined
1827 3:01p 🟣 Phase-14 Superpowers Writing Plan
1828 " 🟣 Session Initialization for Phase-14 Plan
1829 " 🔵 Phase-14 Requirements and Documentation Context
1830 3:02p 🔵 Phase-14 CLI UI Enhancement Details
1831 " 🔵 CLI Package Structure and Scripts
1833 " 🔵 CLI Diagnostics and Doctor Checks Implementation
1835 " 🔵 Phase-14 CLI Output and Interaction Specifications
1837 " 🔵 Phase-14 Planning Context and Self-Review
1832 " 🔵 CLI Command Metadata and Structure
1841 " 🔵 Phase-14 CLI Implementation Plan and Spec Outline
1843 3:04p 🔵 Phase-14 CLI Implementation Plan Tasks
1856 3:07p ✅ Phase-14 CLI Product Experience Implementation Plan
1858 " 🔵 Phase-14 Plan Self-Review and Git Status
1850 3:08p 🔵 CLI Command Context and Intelligence Modules
1863 " ✅ Phase-14 Plan Placeholder Scan Update
1861 " 🔵 Phase-14 Plan Placeholder Scan
1869 3:14p 🔵 Phase-14 Plan Self-Review Checks
1876 4:50p 🟣 Brainstorming Phase 15 Initiated
1877 " ✅ Updated Project Plan
1878 4:51p 🔵 Project File Discovery
1880 7:36p 🔵 Route definition order impacts UI menu order
1881 8:52p ⚖️ Proposed separation of VR Router and VR Outlet responsibilities
1882 9:04p ⚖️ Simplify routing module by excluding 'group'
1884 9:06p 🔵 Phase 15A spec details and file structure identified
1885 9:13p 🟣 Phase 15B: Nested Layout Routing Implemented
1886 " ⚖️ Exclude 'group' routing construct in Phase 15B
1887 10:59p 🔵 User questions the method's complexity
1888 11:06p 🔵 Phase 15B Nested Layout Routing Specification
### May 24, 2026
1889 12:05a ✅ Initiate cleanup before planning next writing task
1891 12:07a 🔵 Review of tsconfig.base.json compiler options
1890 " 🔵 Review of AGENTS.md project rules
1892 12:08a 🔵 Code search for routing-related types
1894 1:42a 🔵 User confirms understanding of caching requirements
1895 3:16a ⚖️ VR UI Framework Naming and Theming
1896 " ⚖️ Package Distribution and Documentation
1897 " ⚖️ Framework Configuration for CSS
1899 3:55a 🟣 Enhanced CSS Token and Utility Testing
1898 3:56a ✅ Execution Plans Skill Documentation

Access 1634k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
