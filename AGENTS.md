# Vanrot Agent Rules

This file must stay byte-identical to its mirror file. Codex and Claude share the same rulebook.

## Project AI Source

Use `.vanrot-ai/` as the Vanrot-owned AI control plane.

- Load `.vanrot-ai/README.md` and `.vanrot-ai/skills/vanrot-workflow/SKILL.md` for Vanrot coding, docs, cleanup, hooks, verification, commit-readiness, and publish-readiness work.
- `.vanrot-ai/hooks/` is the versioned hook source. Local `.git/hooks/*` should delegate there.
- `.vanrot-ai/diagnostics/` contains read-only workflow hygiene and spec/plan cleanup checks.
- Do not use old `docs/superpowers/specs/**` or `docs/superpowers/plans/**` as default context. Use them only for phase planning, archaeology, or cleanup.

## Memory Protocol

Use the local claude-mem HTTP API at `http://localhost:37777` for significant tasks.

- Always include a deterministic `contentSessionId`, such as `codex-YYYY-MM-DD-short-task-name`.
- Initialize with `POST /api/sessions/init`.
- Queue observations with `POST /api/sessions/observations`; this claude-mem version requires `"tool_name":"codex"`.
- Queue a summary with `POST /api/sessions/summarize`.
- Use `GET /api/health` for a fast sanity check.
- Do not call memory endpoints without `contentSessionId`.
- Do not use `GET /api/sessions`; it returns the web UI HTML.

## Vanrot Code Rules

- Use guard clauses instead of nested control flow.
- Use signals for state.
- Never put UI markup in TypeScript.
- Never put application logic in HTML.
- HTML owns user-facing page copy and static labels.
- TypeScript owns logic, imports, signals, computed values, and structured data needed by logic.
- CSS owns visuals for the component that renders the DOM.
- Use role suffixes: `.component.ts`, `.page.ts`, `.dialog.ts`, `.layout.ts`, `.widget.ts`, `.form.ts`.
- Use scoped CSS for component styling.
- Large inline visual markup, including large SVG blocks, belongs in a page-local child component.
- Shared route names, paths, labels, command names, diagnostic codes, file suffixes, and generated copy live in one named source of truth. Literal strings are acceptable at the owning source boundary; page-authored UI copy normally belongs in the HTML template.
- If a custom site template tag is added, update both `web-types.json` and `apps/vanrot-site/web-types.json`.

## Vanrot Site

When finishing changes to `apps/vanrot-site`, restart the local site dev server so the in-app browser reflects finished work:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Then verify the relevant route responds at `http://localhost:1964` and, for frontend-visible changes, check rendered DOM/page errors rather than HTTP 200 alone.

## Docs And Components

- Vanrot framework docs in `apps/vanrot-site` use real `.page.ts/.page.html/.page.css` page components.
- Route, sidebar, article, and AI/search metadata should derive from `apps/vanrot-site/src/docs/docs-page-tree.ts`.
- Do not move narrative framework guide content back into `apps/vanrot-site/src/docs/site-data.json`.
- Parent and child docs that look like pages must be real routes, not `#section` anchors.
- Shared docs UI belongs under `apps/vanrot-site/src/pages/docs/shared/`.
- Use the `vanrot-doc-component` skill for Vanrot component documentation pages.

## Verification Lanes

Start narrow, then escalate only when needed.

- Page/site work: focused page tests or source checks, site build, then rendered route proof.
- Docs/IA work: route/sidebar/page tests, web-types coverage, site docs verifier, AI docs when generated content changes.
- Runtime/compiler work: focused package tests, typecheck/build, and runtime size check when `@vanrot/runtime` changes.
- Package/API work: package-specific tests/build and source-import/export checks.
- Release or publish readiness: run the broad gate only when the change affects public site/package/docs/release output or the user asks if it is safe to commit, publish, or deploy.

The broad gate is:

```sh
pnpm verify
```

Avoid repeated broad runs during normal coding. One full run is enough unless a failure is fixed and must be rerun.

## Runtime Size Budget

`@vanrot/runtime` must stay under `1.98 KB` gzipped for `dist/index.js` plus `dist/internal.js`.

Headless UI/application behavior belongs in `@vanrot/behavior`, not `@vanrot/runtime`. If the runtime size gate reaches or breaches the cap, report the exact size and the feature that caused it before raising the cap.

## Hooks And Cleanup

- `.git/hooks/pre-commit` should delegate to `.vanrot-ai/hooks/pre-commit.sh`.
- The hook should be staged-file based and should not run broad release/publish checks by default.
- Use `.vanrot-ai/diagnostics/workflow-hygiene.mjs` to check agent/hook drift.
- Use `.vanrot-ai/diagnostics/spec-plan-cleanup.mjs` to classify old specs/plans.
- Remove executed/obsolete specs/plans only when the current task authorizes file removal and the diagnostic proves the candidate.
- Never change or delete database/data values unless the user explicitly asks for that exact data operation.

## Superpowers

When using Superpowers in this repo, do not use subagents, parallel agents, agent dispatch, or subagent-driven workflows. Adapt the workflow inline with explicit plans and checkpoints.

Brainstorming specs and writing-plan files for Vanrot phases use `docs/superpowers/specs/Phase-XX.md` and `docs/superpowers/plans/Phase-XX.md` names only when phase planning is genuinely needed.

## Git Ownership

The user owns commits and pushes by default.

Unless explicitly asked, do not create branches/worktrees, run `git add`, run `git commit`, or run `git push`. Make changes in the current workspace and leave them for the user to inspect.

Default final response after code changes: brief summary plus changed files. Mention verification, git status, unrelated dirty files, skipped proof, or publish safety only when it failed, was skipped, was requested, or affects commit/publish risk.

## Living Rules

Treat the mirrored root rulebooks as durable, with `.vanrot-ai/` as the detailed workflow source. Do not silently rewrite rules. If a durable user preference appears, propose the rule or update it only when the user asks.
