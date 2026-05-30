# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm build              # build all packages (tsc, respects pre* scripts)
pnpm typecheck          # typecheck all packages
pnpm test               # test all packages + verify-phase-docs
pnpm lint               # lint all packages
pnpm verify             # full gate: typecheck + test + build + verify:size + verify:phase-docs
pnpm audit:core         # run audits (vitest.audit.config.ts)
```

Single-package (deps are built automatically via `pre*` scripts):
```sh
pnpm --filter @vanrot/runtime test
pnpm --filter @vanrot/compiler build
```

Phase-doc guardrail only:
```sh
pnpm verify:phase-docs
pnpm verify:size         # size-limit budget on @vanrot/runtime
```

## Runtime Size Budget

`@vanrot/runtime` is the core browser runtime and must stay under `1.98 KB` gzipped for `dist/index.js` plus `dist/internal.js`.

Headless UI/application behavior belongs in `@vanrot/behavior`, not `@vanrot/runtime`. If `pnpm verify:size` reaches or breaches the runtime cap, report the exact size and explain which core runtime feature caused it before raising the cap.

## Architecture

Vanrot is a signal-based TypeScript UI framework. Components are authored as three separate files: a `.component.ts` logic file, a `.component.html` template, and a `.component.css` scoped stylesheet.

### Package dependency order

```
@vanrot/runtime          ← signals, lifecycle, mounting (no internal deps)
@vanrot/compiler         ← HTML template → JS codegen (no internal deps; uses parse5 + postcss)
@vanrot/config           ← project config load/validate/migrate (no internal deps)
@vanrot/router           ← client-side routing (depends on runtime)
@vanrot/ui               ← design tokens, CSS primitives, metadata (depends on runtime)
@vanrot/testing          ← test helpers (depends on runtime)
@vanrot/vite-plugin      ← dev/build integration (depends on compiler + config + router)
@vanrot/cli              ← `vr` binary (depends on config + ui)
```

### Key packages

**`@vanrot/runtime`** — reactive primitives: `signal`, `computed`, `effect`, `batch`, `untrack`; lifecycle: `onMount`, `onDestroy`; mounting: `mount`. Exposes a `/internal` subpath for framework internals. Has a size budget enforced by `pnpm verify:size`.

**`@vanrot/compiler`** — parse5 parses `.html` templates into an AST; codegen modules (`bindings`, `control-flow`, `components`, `slots`, `ui-elements`) emit JavaScript. `scope-css` / `scope-id` handle scoped style transforms. Diagnostics live in `diagnostics/catalog.ts`.

**`@vanrot/router`** — `defineRoutes` / `createRoutes` build a typed route table. `RouteOutlet` renders the matched page/layout. `RouteLink` navigates. Supports nested layouts, keep-alive policies, preload policies, path params, query strings, and route guards. Route names/paths/labels must be defined once in `defineRoutes` and referenced from there.

**`@vanrot/cli`** — the `vr` binary. Commands: `dev`, `build`, `create`, `generate`, `add`, `config`, `doctor`, `test`, `map`, `metadata`, `ai`, `init-ai`. Doctor checks live in `doctor/checks.ts`; diagnostic codes in `diagnostics/catalog.ts`.

**`@vanrot/ui`** — design tokens (`src/tokens`), CSS primitives (`src/primitives`), scoped styles (`src/styles`), and component metadata (`src/metadata.ts`). Source files under `src/docs` are published alongside dist.

**`@vanrot/testing`** — vitest-based helpers for testing components against the runtime.

### Routing note

Route definition order in `defineRoutes` determines UI menu order. There is no `group` routing construct — layouts are first-class route kinds.

## Code rules

From `AGENTS.md` (authoritative source — read it at the start of significant tasks):

- Guard clauses over nested control flow.
- Signals for all mutable state.
- No UI markup in TypeScript; no application logic in HTML.
- Role-based file suffixes: `.component.ts`, `.page.ts`, `.dialog.ts`, `.layout.ts`, `.widget.ts`, `.form.ts`.
- Scoped CSS for component styling.
- Shared strings (route names, paths, labels, command names, diagnostic codes, file suffixes) must have exactly one named source of truth. Literal strings are only acceptable at that owning boundary.
- English-like APIs; short names only when obvious to non-developers.

Do not spread violations in existing files — fix only the part touched by the current task.

## Workflow rules

- **No subagents or parallel agent dispatch** — adapt Superpowers workflows to inline execution.
- **Git ownership belongs to the user** — do not `git add`, `git commit`, or `git push` unless explicitly asked. Leave changes in the working tree.
- **`AGENTS.md` is the durable rulebook** — when rules conflict with older habits, follow `AGENTS.md`.

## Phase documentation

Each production phase has a spec and a plan:
- Specs: `docs/superpowers/specs/Phase-XX.md` (or `Phase-XXA.md` for sub-phases)
- Plans: `docs/superpowers/plans/Phase-XX.md`
- Maturity ledger: `docs/superpowers/feature-maturity.md`
- TDD inventory: `docs/superpowers/final-tdd-inventory.md`
- Presentation: `docs/vanrot-presentation.html`

**Phase completion checklist** (from `AGENTS.md`):
1. Tick phase in `feature-maturity.md`.
2. Mark all tasks in `plans/Phase-XX.md`.
3. Update presentation roadmap slide.
4. Update `feature-maturity.md` for any maturity/scope changes.
5. Grow `final-tdd-inventory.md` for any new package, command, component, convention, helper, or generated file.
6. Update spec/plan if requirements changed.
7. Run `pnpm verify` (must pass, including size budget).
8. Stage maturity ledger + TDD inventory + presentation + plan + spec together in one commit.

`pnpm verify:phase-docs` enforces: completed phases must have all plan tasks checked; maturity rows for completed phases must not be `Planned`; presentation must mark the right phases done/active.

Pre-commit hook bypass (only when intentionally needed):
```sh
VANROT_SKIP_PHASE_HOOK=1 git commit
```
