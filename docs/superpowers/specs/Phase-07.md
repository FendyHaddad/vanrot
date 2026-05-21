# Vanrot Project Intelligence Foundation Design

**Date:** 2026-05-22
**Phase:** Phase 7 - Project intelligence
**Package:** `@vanrot/cli`
**Status:** Draft for review
**Related:**
- `docs/brainstorm.md`
- `docs/superpowers/specs/Phase-05.md`
- `docs/superpowers/specs/Phase-06.md`
- `docs/superpowers/feature-maturity.md`

---

## 1. Goal

Phase 7 gives a Vanrot project a provider-neutral intelligence layer:

```txt
vr map
.vanrot/project-map.json
vr init-ai
.vanrot/ai-rules.md
```

The goal is not to make Vanrot dependent on AI. The goal is to make the project explain itself to humans, tools, and AI assistants from files Vanrot owns.

The milestone is successful when a generated or example Vanrot app can write a stable project map and an AI rules document without requiring any AI provider, API key, cloud service, or runtime change.

---

## 2. Maturity Level

Phase 7 creates demo-capable project intelligence features only.

The following features may move to `Demo-Capable` after implementation and verification:

```txt
Project map `.vanrot/project-map.json`
AI rules `.vanrot/ai-rules.md`
```

The following work must stay visible as deferred production work:

```txt
strict vr doctor mode
i18n diagnostics
accessibility diagnostics
route and dependency graphing
compiler-aware project intelligence
AI provider integrations
```

Phase 7 must not mark diagnostics, i18n, accessibility, graphing, or AI integrations as production-ready.

---

## 3. Approach Decision

Three approaches were considered.

### Approach A - Minimal scanner

This would add only `vr map` and write `.vanrot/project-map.json`.

It is fast, but it leaves `.vanrot/ai-rules.md` missing even though Vanrot's stated identity is to help humans and AI understand clean UI projects.

This approach is rejected.

### Approach B - Project map plus AI rules

This adds `vr map` and `vr init-ai`.

`vr map` writes structured project metadata. `vr init-ai` writes Vanrot's framework rules into a durable Markdown file. Both commands are deterministic, local, provider-neutral, and owned by `@vanrot/cli`.

This is the chosen approach.

### Approach C - Compiler-aware intelligence

This would use compiler metadata and template parsing to build a richer app graph now.

It is powerful, but it pulls Phase 7 toward production diagnostics, source maps, route graphing, and deeper compiler integration before those areas have their own design.

This approach is rejected for Phase 7 and tracked as deferred production work.

---

## 4. Non-Goals

Phase 7 must not implement:

```txt
strict vr doctor mode
full i18n extraction
missing i18n key validation
accessibility audits
route graphing
component usage graphing
dependency graph visualization
compiler-aware template analysis
MCP server
Skill.sh package
AI provider commands
automatic code fixes
remote service integration
```

Those are production readiness tracks and must remain listed in `docs/superpowers/feature-maturity.md`.

---

## 5. CLI Command Surface

Phase 7 owns two new commands:

```bash
vr map
vr init-ai
```

Both commands should support `--help`.

`vr map` should:

```txt
scan the current project
create `.vanrot/` when missing
write `.vanrot/project-map.json`
report the written file path
exit non-zero only when `package.json`, `src/`, or `.vanrot/project-map.json` writing fails
```

`vr init-ai` should:

```txt
create `.vanrot/` when missing
write `.vanrot/ai-rules.md`
report the written file path
avoid AI provider setup
avoid API key prompts
```

The root CLI help must list both commands.

---

## 6. Project Map Shape

The Phase 7 project map should be stable and small.

Required JSON shape:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-05-22T00:00:00.000Z",
  "projectRoot": ".",
  "sourceRoot": "src",
  "roles": {
    "components": [],
    "pages": [],
    "dialogs": [],
    "layouts": [],
    "widgets": [],
    "forms": []
  },
  "i18n": {
    "locales": [],
    "files": []
  }
}
```

Role entries should use relative paths from the project root:

```json
{
  "name": "counter",
  "role": "component",
  "path": "src/counter/counter.component.ts",
  "stylePath": "src/counter/counter.component.css",
  "templatePath": "src/counter/counter.component.html"
}
```

Rules:

```txt
role files are discovered under `src/`
recognized roles are component, page, dialog, layout, widget, and form
missing sibling template or style files are represented as null
i18n JSON files are discovered under `src/i18n/`
i18n locale names come from the JSON filename stem, such as `en` from `src/i18n/en.json`
output ordering is deterministic
unknown files are ignored
paths use forward slashes
```

This is a filesystem convention map, not a full dependency graph.

---

## 7. AI Rules File

`.vanrot/ai-rules.md` should be human-readable and AI-readable.

It should include:

```txt
project title
Vanrot purpose
core rules
file naming conventions
state rule
template and TypeScript separation
scoped CSS rule
i18n-ready text guidance
accessibility culture guidance
project map location
note that AI providers are optional
```

Required rule content:

```md
# Vanrot AI Rules

- Use guard clauses instead of nested control flow.
- Use signals for state.
- Never put UI markup in TypeScript.
- Never put application logic in HTML.
- Use role-based file suffixes such as `.component.ts`, `.page.ts`, `.dialog.ts`, `.layout.ts`, `.widget.ts`, and `.form.ts`.
- Use scoped CSS for component styling.
- Prefer i18n-ready text for user-facing strings.
- Prefer accessible UI primitives and keyboard-friendly behavior.
- Read `.vanrot/project-map.json` before making broad project changes.
- Do not assume an AI provider is required for Vanrot projects.
```

The file may be overwritten by rerunning `vr init-ai` in Phase 7. Custom merge behavior is deferred.

---

## 8. CLI Architecture

Phase 7 should keep intelligence code inside `packages/cli`.

Target units:

```txt
src/
  commands/
    init-ai.ts              command handler for `.vanrot/ai-rules.md`
    map.ts                  command handler for `.vanrot/project-map.json`
  intelligence/
    ai-rules.ts             AI rules file content
    project-map.ts          project scan orchestration and JSON shape
    role-files.ts           role-file discovery and classification
    write-vanrot-file.ts    `.vanrot/` directory creation and file writing
```

Responsibilities:

```txt
command files parse CLI arguments and call focused helpers
project-map.ts owns the public JSON data shape
role-files.ts owns src/ scanning and role classification
ai-rules.ts owns Markdown content
write-vanrot-file.ts owns safe `.vanrot/` file writes
```

No runtime, compiler, or Vite plugin changes are required for Phase 7.

---

## 9. Error Handling

Commands should use guard clauses.

`vr map` should return a clear error when:

```txt
the current directory has no `package.json`
the current directory has no `src/` directory
the `src/` directory cannot be read
`.vanrot/project-map.json` cannot be written
```

`vr init-ai` should return a clear error when:

```txt
`.vanrot/ai-rules.md` cannot be written
```

Both commands should keep output calm and consistent with the existing reporter.

---

## 10. Testing

Phase 7 tests should cover:

```txt
role-file classification
deterministic map output
missing sibling template and style paths
i18n file detection
`vr map` command success
`vr init-ai` command success
root help and command help
filesystem write failures by injecting a writer that throws
```

The generated `generatedAt` value should be injectable in tests so snapshots do not depend on wall-clock time.

Verification should include:

```bash
pnpm --filter @vanrot/cli test
pnpm verify
```

---

## 11. Documentation And Tracker Updates

When Phase 7 implementation is completed, update:

```txt
docs/brainstorm.md
docs/superpowers/plans/Phase-07.md
docs/superpowers/feature-maturity.md
docs/vanrot-presentation.html
```

`docs/superpowers/feature-maturity.md` should:

```txt
move Project map `.vanrot/project-map.json` to Demo-Capable only after verification
move AI rules `.vanrot/ai-rules.md` to Demo-Capable only after verification
keep strict diagnostics, i18n diagnostics, accessibility diagnostics, graphing, compiler-aware intelligence, and AI integrations Deferred
```

`docs/brainstorm.md` should tick Phase 7 only after `pnpm verify` passes.

---

## 12. Acceptance Criteria

Phase 7 is complete when:

```txt
`vr map` writes `.vanrot/project-map.json`
`vr init-ai` writes `.vanrot/ai-rules.md`
the counter example or generated app can run both commands
CLI tests cover command behavior and helper behavior
feature maturity distinguishes Phase 7 demo features from deferred production intelligence
roadmap docs mark Phase 7 complete and Phase 8 active
`pnpm verify` passes
```

No commits, branches, worktrees, staging, or pushes are required unless the user explicitly asks.
