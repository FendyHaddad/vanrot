# Vanrot Testing Foundation Design

**Date:** 2026-05-22
**Phase:** Phase 10 - Testing Foundation
**Packages:** `@vanrot/testing`, `@vanrot/cli`, `@vanrot/ui`
**Status:** Draft for review
**Related:**
- `docs/brainstorm.md`
- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/specs/Phase-05.md`
- `docs/superpowers/specs/Phase-09.md`

---

## 1. Goal

Phase 10 adds the first user-facing Vanrot testing package.

The milestone is successful when a user can ask the CLI to generate an optional `.test.ts` file beside an added button primitive, and that test uses a readable Vanrot-native API:

```ts
// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
// @ts-expect-error Vanrot's Vite plugin compiles button modules to default exports.
import PrimaryButton from './primary.button.ts';

const buttonCopy = {
  label: 'Button',
} as const;

testComponent(PrimaryButton).can('render its label', function (screen) {
  screen.expect.text(buttonCopy.label);
});
```

Phase 10 is not the full testing platform. It proves the foundation: readable test declarations, per-test component mounting, safe cleanup, a tiny screen helper, and opt-in CLI test generation.

---

## 2. Core Decisions

### Testing Is For User Apps

`@vanrot/testing` helps Vanrot users test their own components and pages.

Vanrot's internal package tests still use Vitest directly where that is clearer for framework implementation tests.

### `.test.ts` Is The Vanrot Test Suffix

Generated Vanrot test files use:

```txt
*.test.ts
```

Vanrot does not use `.spec.ts` for generated app tests.

### Tests Are Opt-In

Generated tests should not appear by default.

Default:

```bash
vr add primary button
```

creates:

```txt
src/ui/button/
  primary.button.ts
  primary.button.html
  primary.button.css
```

Opt-in:

```bash
vr add primary button --test
```

creates:

```txt
src/ui/button/
  primary.button.ts
  primary.button.html
  primary.button.css
  primary.button.test.ts
```

### Readable Beats Clever

The public API should read like plain English. Short names are useful only when they remain obvious to non-dev readers.

Generated tests should prefer:

```ts
function (screen) {
}
```

over:

```ts
(screen) => {
}
```

Both are valid TypeScript, but Vanrot examples and generated tests should choose the version that is easier to explain.

---

## 3. Explicit Non-Goals

Phase 10 must not implement:

```txt
testPage(...)
vr generate component --test
vr generate page --test
test files in vr create output by default
full framework documentation
docs website
API reference generator
router-aware testing
form testing helpers
async resource testing helpers
accessibility assertion catalog
Testing Library compatibility layer
browser end-to-end testing
snapshot testing policy
coverage policy
```

These belong in `docs/superpowers/feature-maturity.md` for later production planning.

---

## 4. Public Testing API

Phase 10 exposes one main helper:

```ts
testComponent(Component).can(description, function (screen) {
  // test steps
});
```

Meaning:

```txt
testComponent(Component)
  choose the component being tested

.can(description, testBody)
  declare one capability the component can prove

screen
  view of the mounted component
```

The demo-capable screen API is:

```ts
screen.click.button(label);
screen.expect.text(value);
```

Rules:

```txt
screen.click.button(label) finds a button by readable text and clicks it
screen.expect.text(value) checks that text exists in the mounted output
each .can(...) call mounts a fresh component
each .can(...) call destroys the mounted component after the test
test body may be sync or async
```

The testing API should wrap Vitest's `test(...)` internally. Users should not have to import `test`, `it`, or `expect` for the Phase 10 happy path.

---

## 5. Package Shape

Phase 10 creates:

```txt
packages/testing/
  package.json
  tsconfig.json
  src/
    index.ts
    component-test.ts
    screen.ts
  tests/
    component-test.test.ts
    screen.test.ts
```

`@vanrot/testing` depends on:

```txt
@vanrot/runtime
vitest
jsdom for generated app tests that opt into DOM testing
```

`vitest` should be a peer dependency for app projects and a dev dependency for Vanrot's package tests.

`@vanrot/testing` should not add behavior to `@vanrot/runtime`.

---

## 6. Component Mounting Contract

`testComponent(...)` accepts the same compiled component module shape that `@vanrot/runtime` can mount.

The helper creates a DOM target, mounts the component, passes a screen helper to the test body, and destroys the mount after the body completes.

Conceptually:

```txt
create target element
mount component into target
create screen around target
run user test body
destroy mounted app
remove target element
```

Cleanup must happen even if the test body throws.

If a component cannot be mounted, the error should stay direct and readable. Phase 10 does not need a full diagnostic system.

---

## 7. CLI Contract

Phase 10 extends:

```bash
vr add button
vr add primary button
```

with:

```bash
--test
```

Supported commands:

```bash
vr add button --test
vr add primary button --test
```

Unsupported in Phase 10:

```bash
vr generate component user-card --test
vr generate page dashboard --test
vr create my-app --test
```

The CLI should keep existing Phase 9 behavior when `--test` is absent.

When `--test` is present, the CLI writes the test file beside the three button files and reports it in the command output.

Existing file safety still applies. If any generated output file already exists, the command should fail before writing partial output.

---

## 8. Generated Button Test

For:

```bash
vr add primary button --test
```

the generated test should be:

```ts
// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
// @ts-expect-error Vanrot's Vite plugin compiles button modules to default exports.
import PrimaryButton from './primary.button.ts';

const buttonCopy = {
  label: 'Button',
} as const;

testComponent(PrimaryButton).can('render its label', function (screen) {
  screen.expect.text(buttonCopy.label);
});
```

The import and class name must follow the same prefix rename behavior as the generated button TypeScript file.

The generated test must not use a raw repeated label outside the local `buttonCopy` source of truth.

When a project has `package.json`, `vr add button --test` should add `@vanrot/testing` and `jsdom` to `devDependencies` if they are missing.

---

## 9. Documentation Boundary

Phase 10 no longer owns full framework docs.

Small package notes for `@vanrot/testing` are allowed if they are needed to explain the public helper, but the serious documentation work is deferred:

```txt
deep documentation system
framework API docs
guide docs
docs site
AI-readable docs bundle
```

Those items remain in `docs/superpowers/feature-maturity.md` as post-demo production tracks.

---

## 10. Feature Maturity Updates

When Phase 10 is implemented and verified, move only these rows to `Demo-Capable`:

```txt
@vanrot/testing package foundation
testComponent(...).can(...)
screen.expect.text(...)
screen.click.button(...)
CLI vr add button --test
.test.ts convention
```

Keep these rows `Deferred`:

```txt
testPage(...)
vr generate component --test
vr generate page --test
starter tests by default
advanced testing helpers
full framework docs
docs site
AI-readable docs bundle
```

No Phase 10 feature should be marked `Production-Ready`.

---

## 11. Verification

Phase 10 implementation should be test-driven.

Required verification before marking the phase complete:

```bash
pnpm --filter @vanrot/testing test
pnpm --filter @vanrot/cli test
pnpm verify:phase-docs
pnpm verify
```

The implementation should also verify that:

```txt
vr add primary button still creates only three files by default
vr add primary button --test creates the fourth .test.ts file
generated tests use function syntax
generated tests do not repeat label strings outside the copy source
testComponent cleanup runs after passing and failing tests
```

---

## 12. Completion Checklist

Phase 10 is complete when:

```txt
@vanrot/testing exists and builds
testComponent(...).can(...) works in jsdom
screen.expect.text(...) works
screen.click.button(...) works
vr add button --test works
vr add <local-prefix> button --test works
default vr add output remains test-free
docs/brainstorm.md marks Phase 10 complete
docs/vanrot-presentation.html marks Phase 10 complete and Phase 11 active
docs/superpowers/feature-maturity.md marks only verified Phase 10 rows Demo-Capable
pnpm verify passes
```

Until those are true, Phase 10 remains planned.
