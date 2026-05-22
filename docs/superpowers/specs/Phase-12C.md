# Vanrot Phase 12C Compiler Production Hardening Design

**Date:** 2026-05-22
**Phase:** Phase 12C - Compiler Production Hardening
**Packages:** compiler, runtime input helper, tests, docs
**Status:** Draft for review
**Related:**
- `AGENTS.md`
- `audits/core/compiler.audit.ts`
- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/final-tdd-inventory.md`
- `packages/compiler`
- `packages/runtime`
- `packages/vite-plugin`

## 1. Goal

Phase 12C makes the core `@vanrot/compiler` component model production-ready.

The phase should not only improve diagnostics. It should harden the compiler path from role-file discovery to generated
JS/CSS, covering template source locations, existing binding behavior, scoped CSS, control flow, child components, slots,
and source-map-ready metadata.

This phase is intentionally one full compiler production slice. The implementation plan may split the work into tasks,
but the design owns the complete Phase 12C compiler surface.

## 2. Locked User Syntax

### Component Source

Vanrot keeps source, markup, and scoped CSS separate:

```txt
src/pages/home/
  home.page.ts
  home.page.html
  home.page.css

src/components/profile-card/
  profile-card.component.ts
  profile-card.component.html
  profile-card.component.css

src/ui/button/
  ui.button.ts
  ui.button.html
  ui.button.css
```

Component TypeScript keeps state and behavior. HTML keeps markup.

```ts
import { computed, input, signal } from '@vanrot/runtime';
import type { UserModel } from './user.model';

export class ProfileCardComponent {
  user = input.required<UserModel>();
  compact = input.default(false);
  saving = signal(false);
  canEdit = computed(() => !this.saving());

  editUser(): void {
    this.saving.set(true);
  }
}
```

The generic model syntax is acceptable for production inputs:

```ts
user = input.required<UserModel>();
```

Quick examples may omit the model when no strong type is needed:

```ts
user = input.required();
compact = input.default(false);
```

### Interpolation

```html
<h1>{{ title() }}</h1>
<p>{{ count() }}</p>
<p>{{ doubled() }}</p>
```

Interpolation reads values. Mutations, assignments, lambdas, and statement-like logic should produce diagnostics.

### Event Binding

```html
<vr-button (click)="increment()">
  Add
</vr-button>
```

Phase 12C keeps the event policy readable: event bindings call zero-argument component methods.

```html
(click)="save()"
(click)="cancel()"
(input)="rename()"
```

Unsupported event expressions should point at the exact expression and suggest moving logic into a component method.

### Property Binding

```html
<vr-button [disabled]="saving()">
  Save
</vr-button>

<input [value]="name()" />
```

Property binding reads values. Complex decisions should live in computed signals.

```ts
canSubmit = computed(() => !this.saving() && this.submitCount() <= 3);
```

```html
<vr-button [disabled]="!canSubmit()">
  Save
</vr-button>
```

### Control Flow

Phase 12C implements the first production control-flow set:

```html
@if (loggedIn()) {
  <p>Welcome back</p>
} @else {
  <p>Please sign in</p>
}
```

```html
@for (user of users(); track user.id) {
  <p>{{ user.name }}</p>
} @empty {
  <p>No users yet</p>
}
```

Only these `@` blocks are in scope for Phase 12C:

- `@if`
- `@else`
- `@for`
- `@empty`

Future `@switch`, `@await`, and `@defer` syntax should be recorded in the maturity ledger but not implemented in Phase
12C.

### Child Components

Child components compile from kebab-case component tags:

```html
<profile-card [user]="selectedUser()" [compact]="isCompact()">
  <h2 slot.title>Account owner</h2>
  <p>{{ selectedUser().email }}</p>
  <vr-button slot.actions (click)="editUser()">Edit</vr-button>
</profile-card>
```

Child component inputs use signal-style input declarations:

```ts
import { input } from '@vanrot/runtime';
import type { UserModel } from './user.model';

export class ProfileCardComponent {
  user = input.required<UserModel>();
  compact = input.default(false);
}
```

The compiler should connect parent property bindings to child input signals. Destroying a parent must destroy the child
component and its owned effects, listeners, control-flow blocks, and slots.

### Slots

Vanrot uses clean slot names instead of string-literal slot attributes.

Parent usage:

```html
<profile-card [user]="selectedUser()">
  <h2 slot.title>Account owner</h2>
  <p>{{ selectedUser().email }}</p>
  <vr-button slot.actions (click)="editUser()">Edit</vr-button>
</profile-card>
```

Child receiver:

```html
<article>
  <slot.title>
    <h2>{{ user().name }}</h2>
  </slot.title>

  <slot />

  @if (!compact()) {
    <slot.actions />
  }
</article>
```

`<slot />` is the default slot. `<slot.title>` and `<slot.actions />` are named slots. Fallback content belongs inside
the receiving slot block.

### Scoped CSS

```css
:host {
  display: block;
}

.card {
  border: 1px solid currentColor;
}

.card:hover {
  border-color: var(--vr-color-accent);
}

:global(body) {
  margin: 0;
}
```

Phase 12C should support normal selectors, pseudo classes, `:host`, `:global(...)`, and `@media` without losing source
location ownership for diagnostics.

## 3. Compiler Architecture

The compiler should have an explicit production pipeline:

```txt
role files
  -> role resolver
  -> component metadata reader
  -> template parser with spans
  -> template analyzer
  -> expression analyzer
  -> style scoper with spans
  -> code generator
  -> diagnostics, generated JS/CSS, and source-map-ready mappings
```

Each stage owns its diagnostics. Generic unsupported-syntax errors are acceptable only when the compiler cannot classify
the construct more specifically.

The template AST should carry source spans so later stages can report exact template locations even when diagnostics are
created during expression analysis or code generation.

## 4. Diagnostics Contract

`CompileDiagnostic` should grow into a production shape while preserving existing stable fields:

```ts
{
  code: 'VR007',
  severity: 'error',
  message: 'Unsupported event binding expression.',
  filePath: 'src/pages/home/home.page.html',
  line: 8,
  column: 22,
  endLine: 8,
  endColumn: 29,
  sourceText: '(click)="count++"',
  codeFrame: '...',
  suggestion: 'Move this logic into a zero-argument component method.',
  docsPath: '/docs/compiler/event-binding'
}
```

Phase 12C must burn down the existing compiler audit failure:

- unsupported event expressions include a code frame;
- the code frame includes the exact bad event expression;
- the diagnostic includes a useful suggestion;
- the diagnostic includes `/docs/compiler/event-binding`.

Diagnostics should prefer clear English and stable codes. Suggestions should teach the Vanrot way, not merely describe
the parser error.

## 5. Feature Contracts

### Role Files And Component Classes

The resolver should support current role files and production UI role naming:

- `.component.ts/html/css`
- `.page.ts/html/css`
- `.button.ts/html/css`
- prefix-first UI names such as `ui.button.ts/html/css` and `primary.button.ts/html/css`

Component class diagnostics should distinguish:

- missing expected class;
- default export where named export is required;
- multiple plausible exports;
- required constructor arguments;
- invalid file suffix or unsupported role.

### Expressions

Expressions remain a readable subset. Reads, signal calls, property access, unary operators, basic boolean expressions,
and simple value composition are allowed. Assignments, updates, lambdas, function declarations, and statement-like logic
are rejected with exact source spans.

Event bindings remain stricter than interpolation and property binding: they call zero-argument component methods.

### Control Flow

`@if` creates and disposes its rendered block as the condition changes. `@else` is optional. Switching branches must clean
up listeners, effects, child components, and nested slots owned by the old branch.

`@for` renders array-like values and uses the required `track` expression for keyed updates. Reordering should preserve
item-owned DOM and cleanup scopes where keys match. Removed keys must dispose their owned scopes. `@empty` renders only
when the iterable is empty.

### Child Components And Inputs

The compiler should instantiate child components through the same ownership model used by root compiled components.
Parent bindings should update child input signals. Required inputs should produce diagnostics when the parent omits them.

Phase 12C may add a minimal `input()` helper to `@vanrot/runtime` because the approved child-input syntax imports from
runtime. This helper is additive and compiler-supporting; it must not reopen the Phase 12B runtime kernel.

### Slots

Slots are compiler-owned projection points.

Named slot declarations use `slot.name` attributes in parent markup and `<slot.name>` receivers in child markup. The slot
name is the source of truth, not a reused string literal. Missing slots render fallback content when fallback content
exists. Unused provided slots should produce a warning or a tracked diagnostic decision in the implementation plan.

### Source Maps And Inspection

Phase 12C should produce source-map-ready metadata for generated JS and CSS. If full source map emission is too risky for
one implementation pass, the plan must still introduce stable mapping data structures and tests that prove template and
style positions survive the pipeline.

Readable generated output should remain stable enough for snapshot tests and future `vr inspect`.

## 6. Testing Model

Phase 12C must be test-driven.

The implementation plan should add failing tests before implementation for:

- production diagnostic fields and code frames;
- exact template spans for interpolation, property binding, event binding, control flow, child components, and slots;
- exact style spans for scoped CSS diagnostics;
- role-file suffix support;
- component class detection diagnostics;
- interpolation edge cases;
- property binding edge cases;
- event binding edge cases;
- scoped CSS edge cases;
- `@if`, `@else`, nested cleanup, and branch replacement;
- `@for`, required track expression, keyed reordering, removal cleanup, and `@empty`;
- child component inputs, required input diagnostics, parent-to-child updates, and child cleanup;
- default slots, named slots, fallback content, and missing slot behavior;
- generated output snapshots;
- source-map-ready mapping data;
- `pnpm audit:core` no longer failing on the 12C compiler slice.

The tests should stay focused by module. Avoid one massive compiler production test.

## 7. Documentation And Tracker Updates

Phase 12C completion must update:

- `docs/superpowers/plans/Phase-12C.md` with all tasks checked;
- `docs/superpowers/feature-maturity.md` so compiler rows reflect verified production status;
- `docs/superpowers/final-tdd-inventory.md` so Phase 26 knows which compiler features were hardened;
- `docs/vanrot-presentation.html` so the production roadmap shows Phase 12C correctly.

Future `@switch`, `@await`, and `@defer` should remain in `docs/superpowers/feature-maturity.md` as deferred compiler
features.

## 8. Verification Gates

The Phase 12C implementation is not complete until these commands have been run and their results recorded:

```bash
pnpm --filter @vanrot/compiler test
pnpm --filter @vanrot/compiler typecheck
pnpm --filter @vanrot/compiler build
pnpm --filter @vanrot/runtime test
pnpm audit:core
pnpm verify
```

If `pnpm audit:core` still exits non-zero because of 12D or 12E, that is acceptable only when the output proves there are
no remaining 12C compiler failures.

## 9. Non-Goals

Phase 12C must not:

- implement Vite true HMR; Phase 12D owns that;
- solve transformed component TypeScript import declarations; Phase 12E owns that;
- implement `@switch`, `@await`, or `@defer`;
- implement forms or two-way binding;
- implement router production features;
- implement i18n extraction;
- implement CLI `vr inspect`, docs website pages, or custom Vite overlays;
- mark all of Phase 12 complete while 12D and 12E remain unresolved;
- create a branch, worktree, commit, or push without an explicit user request.

## 10. Acceptance Criteria

Phase 12C is complete when:

- the Phase 12C spec exists and defines the compiler production contract;
- the Phase 12C plan exists and tracks every implementation task;
- approved syntax is covered in tests and compiler fixtures;
- the 12A compiler audit no longer reports a compiler failure;
- compiler package tests, typecheck, and build pass;
- runtime tests pass if `input()` is added;
- root `pnpm verify` passes;
- `docs/superpowers/feature-maturity.md` marks only verified compiler rows `Production-Ready`;
- `docs/superpowers/final-tdd-inventory.md` records the new compiler production coverage;
- `docs/vanrot-presentation.html` reflects the Phase 12C production slice;
- Phase 12D and Phase 12E remain tracked as pending if their audit failures still exist.

## 11. Self-Review Notes

- The design covers the full Phase 12C compiler surface chosen during brainstorming.
- The design keeps Vite HMR and TypeScript import-boundary work in 12D and 12E.
- The design records the approved syntax: `slot.name`, `<slot.name>`, `input.required<UserModel>()`,
  `@if`, `@else`, `@for`, and `@empty`.
- The design treats `input()` as a narrow additive runtime helper only because the approved compiler syntax requires it.
- The design avoids implementation details that belong in the later written plan.
- The design does not require git staging, committing, pushing, branching, or worktrees.
