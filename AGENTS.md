```
    *  ·  ✦  ·  *  ˚  ·    ✦  ·  *          ✦         *  ·  ˚  ·  ✦  *
  (  ˚  ·  ✦  ·  *  ˚  ) ·  ✦  ·  *  ·  (  ⊙  )  ·  ·  *  ˚  ·  ✦  ·
   )  *  ·  ˚  ·  ✦  ·  *  ˚  ·  ✦  ·  ˚  ·  *  ✦  ·  ˚  ·  *  ·  ✦
  (  ✦  ·  *  ˚  ·  ✦  ·  *  ˚  ·  ✦  ·  *  ˚  ·  ✦  ·  *  ˚  ·  ✦
  ▲  ˚  ·  *  ✦  ·  ˚  ·  *  ✦  ·  ˚  ·  *  ✦  ·  ˚  ·  *  ✦  ·  ˚
  █▲·  ✦  ·  ˚  *  ·  ✦  ·  ˚  *  ·  ✦  ·  ˚  *  ·  ✦  ·  ˚  *  ·
  ███ ·  ✦  ·  *  ˚  ·  ✦  ·  *  ˚  ·  ✦  ·  *  ˚  ·  ✦  ·  *  ˚
 ▄▄████▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 ████████████████████████████████████████████████████████
                      — vanrot agents —
```

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

## Runtime Size Budget Protocol

`@vanrot/runtime` is the core browser runtime and must stay under `1.98 KB` gzipped for `dist/index.js` plus `dist/internal.js`.

Headless UI/application behavior belongs in `@vanrot/behavior`, not `@vanrot/runtime`. If `pnpm verify:size` reaches or breaches the runtime cap, report the exact size and explain which core runtime feature caused it before raising the cap.

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

## Vanrot Framework Docs Page Component Protocol

Framework docs in `apps/vanrot-site` use real page components as the authoring surface.

- Human-authored framework guide content belongs in `.page.ts`, `.page.html`, and `.page.css` triplets under `apps/vanrot-site/src/pages/docs/`.
- Route, sidebar, article, and AI/search compatibility metadata should derive from `apps/vanrot-site/src/docs/docs-page-tree.ts`.
- Do not add or edit narrative framework guide content in `apps/vanrot-site/src/docs/site-data.json`; that file is no longer the source of truth for docs articles.
- Parent and child framework pages must both be real page routes. Do not represent child docs as `#section` anchors under one parent article.
- Common article UI should use the shared docs components and shared stylesheet under `apps/vanrot-site/src/pages/docs/shared/`.
- Page-local CSS should contain only page-specific exceptions. Most docs classes belong in `apps/vanrot-site/src/pages/docs/shared/docs.css`.
- Reusable docs code examples should use the shared docs code-block component instead of custom per-page snippet markup.
- Any custom docs template tag used by page components must be declared in both `web-types.json` and `apps/vanrot-site/web-types.json` so IntelliJ/WebStorm do not report unknown HTML tags.
- Special docs pages, such as visual examples or changelog-like layouts, may keep page-specific markup and CSS, but they must still be real page components and must not change the existing UI design unless explicitly requested.

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
3. Update `docs/superpowers/feature-maturity.md` whenever a phase changes feature maturity, scope, or production ordering.
4. Update `docs/superpowers/final-tdd-inventory.md` whenever a phase adds or changes a package, feature, component, command, convention, helper, example, or generated file.
5. Update `docs/superpowers/future-pipeline.md` whenever a future pipeline item changes status, ships, is deferred, is dropped, or is superseded by real implementation.
6. If requirements changed, update the matching spec or plan under `docs/superpowers/`.
7. For every feature, package, compiler feature, or planned phase, include the docs information architecture in the spec and plan before implementation: package parent vs child placement, sidebar/menu label, route path, child guide or section structure, generated AI-doc impact, public route metadata when relevant, and tests that prove the menu entry cannot disappear. If a sidebar child looks like a page, it must be a real child page with its own article key, route/path, route-to-article mapping, content source entry, generated AI-doc entry when applicable, and route/render test coverage. Do not ship fake child pages by compiling children into one parent article and linking them through `#section` anchors. Do not ship a package feature that is only reachable by URL search or guide metadata.
8. Run `pnpm verify`, which includes `verify:phase-docs` and the runtime size budget.
9. When committing, stage the maturity ledger, final TDD inventory, post-production ideas when status changed, plan, and requirement docs together.

Do not mark a phase done until its verification criteria pass.

Production phases must be sliced from `docs/superpowers/feature-maturity.md`, not squeezed into vague all-in-one milestones. Treat the maturity ledger as the full production backlog. When a ledger section is broad, split it into the smallest coherent executable phase or sub-phase, keep unfinished production requirements tracked in `feature-maturity.md`, and only mark rows `Production-Ready` when the exact slice has implementation, edge-case coverage, integration coverage where relevant, diagnostics or docs hooks where relevant, and verification evidence.

Future pipeline items are a separate bucket. In `docs/superpowers/feature-maturity.md`, unfinished future phases and tooling candidates are not immediate core production-readiness phases. After Phase 16, do not flatten them into "next production phases" unless the user explicitly chooses that work. When asked what comes next, first call out Phase 16 closeout if its subplans are done, then separate future candidates from Phase 23-26 hardening, docs, AI-consumption, and distribution work. Before opening future pipeline work, check `docs/superpowers/future-pipeline.md`.

`docs/superpowers/final-tdd-inventory.md` is the final release testing memory. It must grow with each production phase so Phase 26 can run complete failing and passing TDD coverage across every package, command, component, convention, helper, example, and generated file before distribution.

Tracker and inventory closeout is Codex's responsibility, not a commit blocker. Do not add pre-commit checks that fail user commits solely because `docs/superpowers/feature-maturity.md`, `docs/superpowers/final-tdd-inventory.md`, or `docs/superpowers/future-pipeline.md` are unstaged or unchanged. Keep these reminders in this file, update the docs during Codex work when appropriate, and report any missing closeout updates in the final response.

`pnpm verify:phase-docs` enforces the phase documentation guardrail:

- completed phases in `docs/superpowers/feature-maturity.md` must not have unchecked tasks in their matching plan file;
- feature maturity rows for completed phases must not remain `Planned`.

A temporary local hook at `.git/hooks/pre-commit` runs the relevant verification commands for staged docs and metadata changes. It must not enforce tracker or inventory staging completeness. It can be bypassed only when intentionally needed:

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

# [vanrot] recent context, 2026-06-09 8:40pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (12,119t read) | 1,315,827t work | 99% savings

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
### Jun 3, 2026
2756 5:00a ✅ README added to vanrot repository
### Jun 4, 2026
2831 10:54p 🔵 Future pipeline tasks identified
### Jun 5, 2026
2835 3:00p ✅ Test file content extracted
2836 " 🔵 Package and route references identified in tests
2834 " ✅ Plan execution initiated
2837 " ✅ Added '@vanrot/forms' package to test assertions
2838 " ✅ Added '@vanrot/forms' package and documentation route to tests
2839 " ✅ Updated test assertions for '@vanrot/forms' and documentation routes
2841 " ✅ Updated test assertions to include '@vanrot/forms' and '/docs/forms' route
2843 " ✅ Updated test assertions for '@vanrot/forms' and '/docs/forms' route
2947 6:10p 🔵 User requested information about the future pipeline
2948 9:06p 🔵 Execution of Plans Tool Identified
### Jun 6, 2026
2950 12:29a 🔵 Unclear Future Pipeline Tasks
2953 2:36p ✅ Initiated Store Hardening Brainstorm
2965 3:08p 🔵 RxJS Bridges for Redux
2966 " ⚖️ Prioritize Vanrot-Native RxJS Bridges
2968 " 🔵 Store Documentation and Routing
2969 " 🔵 Framework Reference Documentation
2970 " 🔵 Phase 24 Documentation and Web Presence
2971 " 🔵 Store Package in AI Knowledge Graph
2972 " 🔵 Store Route Documentation
2973 " 🔵 Store Package in Site Data
2974 " 🔵 Store Package in Site Navigation
2975 " 🔵 Store Package in Route Definitions
2976 " 🔵 Store Documentation Test Failure
2977 " 🔵 Store Package Documentation Status
3028 5:23p ⚖️ Doc site coding convention identified as tech debt
3029 9:30p 🔴 Resolved disallowed attribute errors in action page
### Jun 7, 2026
3030 3:24p 🔵 User inquiry about Vanrot plugin and logo upload
3031 " 🔵 IntelliJ plugin development files and memory references found
3032 3:25p 🔵 IntelliJ plugin descriptor and icon file checks yield no results
3033 " 🔵 IntelliJ plugin descriptor missing version, icon tag, and specific icon files
3036 7:51p 🔵 User reports compatibility issues
3037 7:52p 🔵 Systematic Debugging Skill Documentation
3039 " 🔵 Verification Before Completion Skill Documentation
3042 " 🔵 IntelliJ plugin build artifacts and reports found
3044 " 🔵 IntelliJ plugin code and configuration details identified
3048 " 🔵 IntelliJ plugin configuration and API usage extracted
3054 " 🔵 IntelliJ plugin build configuration and dependencies detailed
3059 7:53p 🔵 IntelliJ plugin verification report analysis
3065 " 🔵 claude-mem session initialized for compatibility investigation
3075 " 🔵 claude-mem observations and summary queued for Vanrot IntelliJ compatibility
3084 7:56p 🔵 Superpowers skill summaries and AGENTS rules not found
### Jun 8, 2026
3092 1:49a 🔴 Homepage layout not responsive on mobile and tablet
3093 1:50a 🔵 Project structure and conventions for Vanrot UI framework
3101 11:31p 🟣 Devtools Shell Enhancement for Future Pipeline
### Jun 9, 2026
3102 2:35p 🔵 Clarification on creative generation and inspiration
3103 2:37p 🔵 Node.js script execution error in Sondaven artifact analysis
3104 " 🔵 AGENTS rules for artifact updates and memory interaction
3130 8:35p 🔵 Future Pipeline Status Check

Access 1316k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
