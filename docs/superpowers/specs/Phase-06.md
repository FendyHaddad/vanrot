# Vanrot Counter Demo Milestone Design

**Date:** 2026-05-21
**Phase:** Phase 6 - Counter demo milestone
**Area:** `examples/counter`
**Status:** Draft for review
**Related:**
- `docs/brainstorm.md`
- `docs/superpowers/specs/Phase-02.md`
- `docs/superpowers/specs/Phase-03.md`
- `docs/superpowers/specs/Phase-04.md`
- `docs/superpowers/specs/Phase-05.md`
- `docs/superpowers/feature-maturity.md`

---

## 1. Goal

Phase 6 builds Vanrot's first real example app:

```txt
examples/counter
```

The counter demo proves the full demo-capable framework loop:

```txt
separate component TypeScript, HTML, and CSS files
signals-first state
compiler interpolation and event binding
scoped CSS
Vite plugin build integration
CLI dev, build, test, and doctor workflows
```

The app should be small enough to understand in one sitting while still proving that the pieces from Phases 1 through 5 work together.

---

## 2. Maturity Level

Phase 6 moves only the counter demo app capability to `Demo-Capable` after verification.

The maturity ledger remains the source of truth:

```txt
docs/superpowers/feature-maturity.md
```

Phase 6 must not mark compiler, runtime, Vite, CLI, router, UI, testing, SSR, or diagnostics capabilities as `Production-Ready`.

The demo may expose gaps that belong in future production hardening. Those gaps should be recorded in the maturity ledger as `Deferred`, `Planned`, or unchanged future rows instead of being hidden under the Phase 6 completion checkbox.

---

## 3. Prerequisites

Phase 6 assumes these demo-capable foundations already exist:

```txt
@vanrot/runtime
@vanrot/compiler
@vanrot/vite-plugin
@vanrot/cli
```

The example app should use workspace dependencies because Vanrot packages are not published yet:

```json
{
  "@vanrot/runtime": "workspace:*",
  "@vanrot/vite-plugin": "workspace:*",
  "@vanrot/cli": "workspace:*"
}
```

The app should be part of the existing pnpm workspace through:

```txt
examples/*
```

---

## 4. Non-Goals

Phase 6 must not implement:

```txt
router package
route config
child components
slots
@if conditionals
@for loops
two-way binding
forms
UI component registry
production terminal UI polish
full doctor diagnostics
project map generation
AI commands
SSR
hydration
production example gallery
```

Phase 6 also must not broaden the compiler grammar just to make the demo prettier. The counter should stay inside the behavior already implemented in Phases 2 through 5.

---

## 5. Approach Decision

Three approaches were considered.

### Approach A - Minimal proof demo

This would create a counter app that only verifies Vite build output.

It is fast, but it does not prove that the CLI from Phase 5 participates in the real user workflow.

This approach is rejected.

### Approach B - Demo plus CLI workflow

This creates a real counter example and verifies it through the Vanrot CLI where possible:

```bash
pnpm --filter @vanrot/example-counter dev
pnpm --filter @vanrot/example-counter build
pnpm --filter @vanrot/example-counter test
pnpm --filter @vanrot/example-counter doctor
```

The app itself remains small, but the milestone proves the user journey across runtime, compiler, Vite plugin, and CLI.

This is the chosen approach.

### Approach C - Polished showcase demo

This would spend Phase 6 effort on a more visually rich demo page.

That may be useful later, but it risks pulling Phase 6 into UI kit, visual QA, and production polish before the core framework loop is proven.

This approach is rejected for Phase 6.

---

## 6. Example App Shape

The example app should use the production-oriented component directory convention.

Required shape:

```txt
examples/counter/
  package.json
  index.html
  tsconfig.json
  vite.config.ts
  src/
    main.ts
    counter/
      counter.component.ts
      counter.component.html
      counter.component.css
  tests/
    counter-build.test.ts
```

The component files live together under:

```txt
src/counter/
```

This models the Vanrot cleanliness rule:

```txt
one component or feature directory
+ role-based files inside that directory
```

The demo should not scatter component files flat under `src/`.

Phase 6 should also align the existing CLI starter and generator output with this convention if they still create flat role files. New generated files should follow shapes such as:

```txt
src/app/app.component.ts
src/app/app.component.html
src/app/app.component.css

src/components/status-pill/status-pill.component.ts
src/components/status-pill/status-pill.component.html
src/components/status-pill/status-pill.component.css

src/pages/settings/settings.page.ts
src/pages/settings/settings.page.html
src/pages/settings/settings.page.css
```

This is a narrow convention-alignment change, not a full project intelligence or production diagnostics phase.

---

## 7. Counter Behavior

The counter should provide:

```txt
visible current count
increment button
decrement button
reset button
```

Rules:

```txt
count starts at 0
increment adds 1
decrement subtracts 1 only when count is above 0
reset returns count to 0
```

The TypeScript class should use `signal()` for state.

The decrement method should use a guard clause:

```ts
decrement(): void {
  if (this.count() === 0) {
    return;
  }

  this.count.set(this.count() - 1);
}
```

The HTML should use only Phase 3-supported template features:

```txt
{{ count() }}
(click)="increment()"
(click)="decrement()"
(click)="reset()"
```

The template should avoid unsupported control flow such as `@if` and `@for`.

---

## 8. Styling

The CSS should prove scoped CSS without introducing a design-system dependency.

It should include:

```txt
a root counter container class
button styles
a visible count display
a small responsive layout
```

The demo can look polished enough to feel intentional, but Phase 6 does not own production visual QA or a reusable UI kit.

---

## 9. CLI Workflow

The app package scripts should route through `vr`:

```json
{
  "scripts": {
    "dev": "vr dev",
    "build": "vr build",
    "test": "vitest run",
    "doctor": "vr doctor"
  }
}
```

`vr build` should prove the CLI can invoke Vite build for the example.

`vr doctor` should run against the example and report no errors. Existing starter warnings are acceptable only if the plan explicitly tracks why the warning is expected. The preferred outcome is a clean doctor result for the demo app.

`vr test` does not need to be the package script in Phase 6 if using it would cause recursive package-script invocation. The plan may add a direct command-level test for `vr test` separately if useful, but the example package should keep its own test script stable.

---

## 10. Testing

Phase 6 testing should prove the milestone externally, not only through small unit tests.

Required checks:

```bash
pnpm --filter @vanrot/example-counter build
pnpm --filter @vanrot/example-counter test
pnpm --filter @vanrot/example-counter doctor
pnpm verify
```

The example test should verify at least:

```txt
Vite can build the example app
generated output includes JavaScript
generated output includes CSS
```

The test may use a temporary output directory or the app's `dist` output as long as generated artifacts are not committed.

---

## 11. Documentation And Trackers

When Phase 6 is implemented and verified, update:

```txt
docs/brainstorm.md
docs/vanrot-presentation.html
docs/superpowers/feature-maturity.md
docs/superpowers/plans/Phase-06.md
```

Required tracker changes after verification:

```txt
Phase 6 checked in brainstorm.md
Phase 6 shown complete in vanrot-presentation.html
Phase 7 shown active in vanrot-presentation.html
counter demo app row moved to Demo-Capable in feature-maturity.md
Phase-06 plan checkboxes updated as tasks complete
```

Do not move Phase 7 or later capabilities forward during Phase 6.

---

## 12. Completion Gate

Phase 6 is complete when:

```txt
examples/counter exists with component files grouped under src/counter
vr create and vr generate create component/page role files inside role-owned directories
the counter uses signals and guard clauses
the template uses supported interpolation and event binding
scoped CSS is present and built by Vite
the example builds through vr build
the example test passes
vr doctor reports no errors for the example
pnpm verify passes from the repository root
the phase tracker docs are updated
the feature maturity ledger is updated only for verified Phase 6 work
```

At completion, the repo should still be on `main`. Phase 6 should not require a separate git branch or worktree.
