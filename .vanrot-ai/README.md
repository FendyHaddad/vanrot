# Vanrot AI Workflow

`.vanrot-ai` is the project-owned AI control plane for Vanrot. Codex and Claude should use this directory before global habits or stale planning files.

## Layout

- `skills/vanrot-workflow/` — Vanrot coding, cleanup, and verification workflow.
- `hooks/` — versioned hook source. Local `.git/hooks/*` should delegate here.
- `diagnostics/` — read-only workflow hygiene and spec/plan cleanup checks.
- `reports/` — optional diagnostic output location when a user asks for saved reports.

## Rules

1. Load `skills/vanrot-workflow/SKILL.md` for Vanrot coding, docs, cleanup, verification, hook, commit-readiness, or publish-readiness work.
2. Use source, tests, built docs, and live site routes as current truth.
3. Do not read old `docs/superpowers/specs/**` or `docs/superpowers/plans/**` by default.
4. Use `diagnostics/spec-plan-cleanup.mjs` to classify old specs/plans before removing any.
5. Never change or delete database/data values unless the user explicitly asks for that exact data operation.
