## Memory Protocol

Use the local claude-mem HTTP API at `http://localhost:37777`.

Do not call memory endpoints without a `contentSessionId`.

At the start of a significant Codex task, initialize a deterministic session id:

```sh
curl -sS -X POST http://localhost:37777/api/sessions/init \
  -H 'Content-Type: application/json' \
  -d '{"contentSessionId":"codex-YYYY-MM-DD-short-task-name","project":"CURRENT_WORKING_DIRECTORY","prompt":"Brief task description","platformSource":"codex"}'
```

After completing significant work, queue observations. This claude-mem version requires `tool_name`:

```sh
curl -sS -X POST http://localhost:37777/api/sessions/observations \
  -H 'Content-Type: application/json' \
  -d '{"contentSessionId":"codex-YYYY-MM-DD-short-task-name","platformSource":"codex","tool_name":"codex","observations":["What changed, with file paths and verification details."]}'
```

At session end, queue a summary:

```sh
curl -sS -X POST http://localhost:37777/api/sessions/summarize \
  -H 'Content-Type: application/json' \
  -d '{"contentSessionId":"codex-YYYY-MM-DD-short-task-name","platformSource":"codex","last_assistant_message":"Concise final result and any verification performed."}'
```

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

## Vanrot Site Dev Server Protocol

When finishing changes to `apps/vanrot-site`, restart the local site dev server before the final response so the in-app browser reflects the finished work.

Use the standard local preview target:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

After restart, verify the relevant site route responds on `http://localhost:1964`.

## Vanrot Component Docs Protocol

When creating or updating component documentation pages for `apps/vanrot-site`, use the local Codex skill `vanrot-doc-component`.

That skill records the approved Button docs pattern:

- keep the page title only at the top;
- remove the old eyebrow, lead paragraph, generic usage line, and top selector chip;
- keep the variants overview card;
- create one dedicated variant section per variant;
- use dotted preview backgrounds, shadcn-style code snippets, icon-only copy buttons, and mobile-ready CSS;
- verify with the site page tests, typecheck, `pnpm verify`, local server reboot, and browser inspection.

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
6. Update `docs/superpowers/post-production-implementation-ideas.md` whenever a Phase 17-22 item or later post-production candidate changes status, ships, is deferred, or is superseded by real implementation.
7. If requirements changed, update the matching spec or plan under `docs/superpowers/`.
8. Run `pnpm verify`, which includes `verify:phase-docs` and the runtime size budget.
9. When committing, stage the maturity ledger, final TDD inventory, post-production ideas when status changed, presentation, plan, and requirement docs together.

Do not mark a phase done until its verification criteria pass.

Production phases must be sliced from `docs/superpowers/feature-maturity.md`, not squeezed into vague all-in-one milestones. Treat the maturity ledger as the full production backlog. When a ledger section is broad, split it into the smallest coherent executable phase or sub-phase, keep unfinished production requirements tracked in `feature-maturity.md`, and only mark rows `Production-Ready` when the exact slice has implementation, edge-case coverage, integration coverage where relevant, diagnostics or docs hooks where relevant, and verification evidence.

Post-production phases are a separate bucket. In `docs/superpowers/feature-maturity.md`, Phase 17 through Phase 22 are explicitly `Post-production implementation` phases, not immediate core production-readiness phases. After Phase 16, do not flatten them into "next production phases" unless the user explicitly chooses to enter post-production work. When asked what comes next, first call out Phase 16 closeout if its subplans are done, then separate Phase 17-22 post-production candidates from Phase 23-26 hardening, docs, AI-consumption, and distribution work. Before opening or planning Phase 17-22, check `docs/superpowers/post-production-implementation-ideas.md`.

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

# [vanrot] recent context, 2026-05-30 11:48pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (14,942t read) | 1,714,828t work | 99% savings

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
S658 Clarify billing for Claude Code, Claude-Mem, and Codex (May 23 at 3:19 AM)
### May 26, 2026
2046 6:52p 🔵 Codex TOML configuration for Claude-Mem server validated
2055 6:53p 🔵 Relevant lines identified in AGENTS.md for memory protocol
2065 11:22p ✅ Staged files for Vanrot commit
2066 " 🔵 Phase 16G completion status and next steps identified
### May 27, 2026
2071 10:14p 🔵 Phase 25 AI Consumption Scope and Requirements
2073 " 🔵 Memory Registry Search for Phase 25 and Related Terms
2080 10:17p 🔵 Verification Scripts and Hooks for Phase Documentation
### May 28, 2026
2121 5:29a 🔵 User is experiencing repeated failures with systematic-debugging skill
2122 " ✅ Updated web-types.json with route attributes
2123 5:30a ✅ Corrected regex in web-types.test.ts
### May 29, 2026
2231 1:08a ✅ Cleared Session State
2232 3:31p 🔵 Plugin Upload Mechanism
2233 3:32p 🔵 IntelliJ Plugin Project Structure and Files
2234 " 🔵 IntelliJ Plugin Development Plan
2235 " 🔵 IntelliJ Plugin Build Configuration and Artifacts
2236 " 🔵 IntelliJ Plugin Build Configuration Details
2238 3:33p 🔵 IntelliJ Plugin Build Artifacts and Configuration
2242 3:34p 🔵 IntelliJ Plugin Template File Recognition
2249 3:36p 🔵 IntelliJ Plugin Integration and Template File Handling
2254 " 🔵 IntelliJ Plugin ID and Name References
2259 " 🔵 Claude-Mem Session Initialization
2260 " ✅ IntelliJ Plugin Metadata Renamed
2270 3:37p 🔴 IntelliJ Plugin Build Failure
2272 " 🔵 Gradle Build Failure - Kotlin/Java Module Issue
2276 " 🔴 Java Version Mismatch in IntelliJ Plugin Build
2286 " 🔵 Installed Java Versions Identified
2297 " ✅ IntelliJ Plugin Build Successful with Java 21
2309 " 🔵 IntelliJ Plugin ZIP Metadata Verification Failed
2319 3:38p 🔵 IntelliJ Plugin ZIP Contents Listed
2330 " 🔵 IntelliJ Plugin Metadata Extracted Successfully
2342 9:51p 🟣 Welcome Screen Documentation
### May 30, 2026
2343 7:04p ✅ Improve Component Documentation Structure
2344 " 🔵 Context Search for Runtime Docs and Signals
2345 7:05p 🔵 Vanrot Documentation and Development Protocols
2346 " ✅ Initialize Claude-Mem Session for Runtime Docs Task
2347 " 🔵 Search for Vanrot Runtime Docs, Signals, and Site-Data
2349 " 🔵 Browser Skill Instructions and Tool Names
2351 " 🔵 Browser Skill Usage and Setup
2355 " 🔵 Browser Skill Outline and Searchable Terms
2359 " ✅ Browser Connection Established for Runtime Docs Polish
2368 " 🔵 Browser Tab and Page Interaction Examples
2374 " 🔵 Tab API Properties
2389 " 🔵 Playwright API Properties
2423 7:06p 🔵 Tab API Deep Inspection
2431 " ✅ Runtime Documentation Loaded
2441 " 🔵 Timeline Around Anchor Point
2443 " 🔵 Timeline Around Anchor Point
2453 " 🔵 Memory Registry Search Results
2459 " 🔵 Site Data and Article Rendering Analysis
2465 " 🔵 Runtime Article JSON Content

Access 1715k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
