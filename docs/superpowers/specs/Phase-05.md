# Vanrot CLI MVP Design

**Date:** 2026-05-21
**Phase:** Phase 5 - CLI MVP
**Package:** `@vanrot/cli`
**Status:** Draft for review
**Related:**
- `docs/brainstorm.md`
- `docs/superpowers/specs/Phase-01.md`
- `docs/superpowers/specs/Phase-02.md`
- `docs/superpowers/specs/Phase-03.md`
- `docs/superpowers/specs/Phase-04.md`
- `docs/superpowers/feature-maturity.md`

---

## 1. Goal

Phase 5 builds a demo-capable Vanrot command line interface around the `vr` command.

The CLI should prove that a user can:

```txt
create a Vanrot app
generate convention files
run basic project diagnostics
start Vite dev through the CLI
build through Vite
run tests through the project test script
```

Phase 5 is not production-ready CLI tooling. It creates the command architecture, core command behavior, and a first Quiet Premium terminal presentation layer that can later mature toward the quality of tools like Claude Code.

---

## 2. Maturity Level

Phase 5 creates demo-capable CLI features only.

Every Phase 5 capability must be tracked in:

```txt
docs/superpowers/feature-maturity.md
```

Rows added or moved for Phase 5 must distinguish:

```txt
Planned
Demo-Capable
Production-Ready
Deferred
```

No CLI feature may be marked `Production-Ready` in Phase 5. Production CLI work, including premium interactive polish, full diagnostics, build reports, `vr inspect`, `vr explain`, `vr map`, AI commands, and production package-manager handling stays tracked as deferred or future production-readiness work.

---

## 3. Prerequisites

Phase 5 assumes the previous demo-capable foundation exists:

```txt
@vanrot/runtime
@vanrot/compiler
@vanrot/vite-plugin
```

The CLI may depend on workspace packages where needed, but app authors should experience Vanrot as a unified tool:

```bash
vr create my-app
cd my-app
vr dev
```

Phase 5 does not need published npm packages. Tests may use internal fixture or workspace mode so the generated app can be verified before public package publishing exists.

---

## 4. Non-Goals

Phase 5 must not implement:

```txt
custom package manager behavior
package registry publishing
full dependency resolution
interactive terminal UI framework
Claude Code-quality production CLI polish
full accessibility diagnostics
full i18n extraction
full SSR safety diagnostics
import graph intelligence
project map generation
AI-powered explain or fix commands
build report budgets
router package
UI registry
counter demo app milestone
```

These features must remain visible in `docs/superpowers/feature-maturity.md` as deferred or future production-readiness work when relevant.

---

## 5. Approach Decision

Three approaches were considered.

### Approach A - Full demo command surface with plain output

This would implement all Phase 5 commands with minimal terminal output.

It is fast, but it delays Vanrot's CLI identity too far. The user experience would feel like generic tooling.

This approach is rejected.

### Approach B - Smaller command surface with polished output

This would focus on fewer commands, such as `vr create`, `vr generate component`, and `vr doctor`, and spend more Phase 5 effort on visual polish.

It would make the CLI feel special earlier, but it risks blocking Phase 6 because build, test, and page generation would still need follow-up work.

This approach is rejected.

### Approach C - Balanced CLI foundation

This implements the full demo command surface while introducing a shared reporter layer for Quiet Premium output.

The command behavior is separated from terminal presentation. Future production polish can improve the reporter without rewriting command logic.

This is the chosen approach.

---

## 6. Public Command Surface

Phase 5 owns these commands:

```bash
vr create <name>
vr generate component <name>
vr generate page <name>
vr doctor
vr dev
vr build
vr test
```

Aliases may exist only when they do not complicate the implementation:

```bash
vr g component <name>
vr g page <name>
```

The CLI should print help for:

```bash
vr --help
vr create --help
vr generate --help
vr doctor --help
vr dev --help
vr build --help
vr test --help
```

Invalid commands must exit non-zero and show a short suggestion when the intent is obvious.

---

## 7. CLI Architecture

The CLI should be split into focused units:

```txt
src/
  index.ts                 public package entry
  bin.ts                   executable entry
  cli.ts                   parse argv and dispatch commands
  commands/
    create.ts              create app command
    generate.ts            generate command group
    doctor.ts              doctor command
    dev.ts                 dev command
    build.ts               build command
    test.ts                test command
  create/
    write-app.ts           app template writer
    app-template.ts        demo app file templates
  generate/
    names.ts               parse and validate names
    write-role-files.ts    component/page file writer
  doctor/
    checks.ts              check registry
    project-health.ts      package, src, vite, script, sibling checks
    vanrot-rules.ts        starter convention checks
  process/
    runner.ts              injected command runner for dev/build/test
  reporter/
    reporter.ts            Quiet Premium output primitives
    diagnostics.ts         format doctor findings
```

Each unit should have one responsibility and be testable without invoking the real binary.

---

## 8. Reporter Direction

The Phase 5 reporter should use a Quiet Premium style:

```txt
calm headings
short status lines
clear success/warning/error states
low-noise next steps
consistent file path formatting
no excessive decoration
```

The reporter should avoid locking command handlers to raw `console.log()` calls. Command handlers should receive a reporter or return structured results that the reporter prints.

Example `vr doctor` shape:

```txt
Vanrot Doctor                                   2 warnings

warning
src/features/users/user-card.component.html
Raw user-facing text found in template.

warning
src/features/users/user-card.component.ts
Nested if statement can be a guard clause.

Next
> Replace visible text with an i18n key.
> Move early return to the top of the method.
```

Phase 5 can use plain ANSI color helpers or a tiny local formatter. It must not introduce a large terminal UI framework just for polish.

---

## 9. `vr create`

`vr create <name>` creates a minimal Vanrot app.

Default generated shape should look like a future standalone user project:

```txt
my-app/
  package.json
  index.html
  tsconfig.json
  vite.config.ts
  src/
    main.ts
    app.component.ts
    app.component.html
    app.component.css
```

The generated app should use separate TypeScript, HTML, and CSS files.

The generated `package.json` should expose:

```json
{
  "scripts": {
    "dev": "vr dev",
    "build": "vr build",
    "test": "vr test",
    "doctor": "vr doctor"
  }
}
```

Because packages are not published yet, Phase 5 should support an internal fixture or workspace mode for tests. That mode may write local workspace dependency references or fixture paths, but it must not be the default user-facing design in docs or output.

The command must guard against overwriting a non-empty target directory unless an explicit force option is provided.

---

## 10. `vr generate`

Phase 5 supports:

```bash
vr generate component user-card
vr generate page dashboard
```

Component output:

```txt
src/features/<feature>/components/user-card.component.ts
src/features/<feature>/components/user-card.component.html
src/features/<feature>/components/user-card.component.css
```

Page output:

```txt
src/features/<feature>/dashboard.page.ts
src/features/<feature>/dashboard.page.html
src/features/<feature>/dashboard.page.css
```

If no feature is supplied, the command may default to a simple location such as:

```txt
src/components/
src/pages/
```

Name validation should enforce lowercase kebab-case file names for the demo.

Generated TypeScript must keep UI out of TypeScript. Generated HTML must keep application logic out of HTML. Generated CSS is scoped by convention because the compiler and Vite plugin own CSS scoping.

---

## 11. `vr doctor`

Phase 5 doctor covers project health plus the first Vanrot rule checks.

Project health checks:

```txt
missing package.json
missing src directory
missing vite.config.ts
missing package scripts for dev, build, test, or doctor
missing sibling .html or .css for .component.ts or .page.ts files
```

Starter Vanrot rule checks:

```txt
files with unsupported UI role suffixes
component or page files missing role-based suffixes
raw visible text in component/page templates
nested if statements in component/page TypeScript
```

Phase 5 doctor must not claim to perform complete accessibility, i18n, SSR, import-depth, unused CSS, unused component, or cleanup analysis. Those belong in future maturity rows.

Doctor results should be structured before formatting:

```ts
interface DoctorFinding {
  severity: 'error' | 'warning';
  code: string;
  filePath: string;
  message: string;
  nextStep: string;
}
```

The command exits:

```txt
0 when no findings exist
1 when errors exist
0 when only warnings exist, unless a future --strict option says otherwise
```

---

## 12. `vr dev`, `vr build`, and `vr test`

`vr dev` wraps the app's Vite dev server workflow.

For Phase 5, it may run:

```bash
vite
```

through an injected process runner.

`vr build` wraps the app's Vite build workflow.

For Phase 5, it may run:

```bash
vite build
```

through an injected process runner.

`vr test` wraps the app's test workflow.

For Phase 5, it may run:

```bash
vitest run
```

or the project's configured test script through an injected process runner.

Tests for these commands should not require slow real subprocesses for every case. Unit tests should inject a fake runner and assert the intended command and output. One fixture-level integration check may run a real command if it is reliable in the monorepo.

---

## 13. Error Handling

All commands should use guard clauses:

```txt
missing required argument
invalid command
invalid generated name
target directory already exists and is not empty
project root cannot be found
required project file is missing
wrapped subprocess exits non-zero
```

Errors should be short, actionable, and formatted by the reporter.

Command handlers should return explicit success or failure results. The binary entry should be the only layer that calls `process.exitCode`.

---

## 14. Testing Strategy

Phase 5 implementation should follow TDD.

Required test coverage:

```txt
command parsing and help
create app files
create overwrite protection
workspace/fixture create mode
generate component files
generate page files
invalid name diagnostics
doctor clean project
doctor project-health warnings
doctor Vanrot rule warnings
build runner invocation
dev runner invocation
test runner invocation
reporter output snapshots or focused string checks
```

Tests should use temporary directories and injected dependencies where possible.

Root `pnpm verify` must continue to pass, including:

```txt
typecheck
test
build
runtime size budget
phase documentation guardrail
```

---

## 15. Documentation and Tracker Updates

When Phase 5 is implemented and verified:

```txt
docs/brainstorm.md
docs/vanrot-presentation.html
docs/superpowers/plans/Phase-05.md
docs/superpowers/feature-maturity.md
```

must be updated together.

The maturity ledger should move only verified Phase 5 command features to `Demo-Capable`.

Deferred production work should remain listed, including:

```txt
premium Claude Code-like terminal experience
full doctor diagnostics
build reports and budgets
vr inspect
vr explain
vr map
AI commands
```

---

## 16. Acceptance Criteria

Phase 5 is complete when:

```txt
the `vr` binary exists
`vr create <name>` writes a minimal Vanrot app
`vr generate component <name>` writes role-based component files
`vr generate page <name>` writes role-based page files
`vr doctor` reports project health and starter Vanrot rule findings
`vr dev` invokes the dev runner
`vr build` invokes the build runner
`vr test` invokes the test runner
CLI output uses the shared Quiet Premium reporter
all CLI tests pass
root `pnpm verify` passes
feature maturity rows reflect demo-capable versus deferred work honestly
```
