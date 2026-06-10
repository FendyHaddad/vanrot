---
name: vanrot-workflow
description: Use for all Vanrot coding, docs, cleanup, verification, hook, commit-readiness, and publish-readiness tasks. Enforces Vanrot source boundaries, task lanes, narrow verification, project-local AI rules, and spec/plan cleanup hygiene.
---

# Vanrot Workflow

Use this skill inside `/Users/user/IdeaProjects/vanrot`.

## Preflight

1. Read `AGENTS.md` or `CLAUDE.md`; they must match.
2. Read `.vanrot-ai/README.md`.
3. Classify the task lane from `references/task-lanes.md`.
4. Lock requirements and destructive permissions before editing.
5. Inspect exact source files and nearby tests before broad searches.

## Source Boundaries

Use `references/coding-conventions.md`.

- HTML owns user-facing copy and UI structure.
- TypeScript owns logic, imports, signals, computed values, and structured data needed by logic.
- CSS owns visuals for the component that renders the DOM.
- Large visual markup belongs in a page-local child component.
- Custom template tags must be covered by root and app web-types.

## Verification

Use `references/verification-ladder.md`.

Run the smallest proof that catches the mistake first. Escalate only when the lane requires it.

## Cleanup

Use `references/cleanup-diagnostic.md`.

Old specs and plans are not default context. Classify them before removal. Remove executed/obsolete specs/plans only when the current task explicitly authorizes file removal and the diagnostic proves the candidate.

Never change or delete DB/data values unless the user explicitly asks for that exact data operation.

## Reporting

Default final response: concise summary and changed files only. Mention verification/git/skipped proof only when it failed, was skipped, was requested, or affects commit/publish safety.
