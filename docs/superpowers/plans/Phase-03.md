# Vanrot Compiler MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the demo-capable `@vanrot/compiler` MVP for Vanrot convention components with interpolation, event binding, property binding, scoped CSS, readable generated output, and feature maturity tracking.

**Architecture:** The compiler is split into pure phases: convention loading, component metadata extraction, template parsing, expression rewriting, CSS scoping, and code generation. `compileComponent()` is deterministic and source-driven; `compileComponentFromFiles()` is the file-system wrapper for future Vite and CLI integration.

**Tech Stack:** TypeScript 5, Vitest, Node `fs/promises`, `parse5` for HTML parsing, TypeScript compiler API for expression and component metadata parsing, PostCSS plus `postcss-selector-parser` for CSS selector rewriting.

**Spec:** `docs/superpowers/specs/Phase-03.md`

---

## Prerequisites

Do not start implementation until Phase 1 package scaffolding exists.

Phase 2 runtime may be in progress in another workspace. Phase 3 workers must not edit `packages/runtime`. If `@vanrot/runtime` is not merged yet, assert generated imports as strings and keep runtime integration tests disabled until the runtime package exists.

---

## File Structure

Target files and responsibilities:

```txt
packages/compiler/
  src/
    index.ts                         - public compiler exports
    api/
      types.ts                       - ComponentSource, CompileResult, diagnostics
      compile-component.ts           - pure compile pipeline
      compile-component-from-files.ts - convention file loader
    conventions/
      component-files.ts             - sibling file resolution and class name rules
    diagnostics/
      diagnostics.ts                 - diagnostic constructors and codes
    metadata/
      component-metadata.ts          - exported component class detection
    template/
      ast.ts                         - compiler-owned template AST
      parse-template.ts              - parse5 to template AST
      bindings.ts                    - interpolation, event, property binding extraction
    expressions/
      rewrite-expression.ts          - TypeScript AST expression rewrite to ctx access
      globals.ts                     - allowed globals that are not prefixed with ctx
    styles/
      scope-id.ts                    - deterministic scope attribute generation
      scope-css.ts                   - PostCSS selector scoping
    codegen/
      generate-component.ts          - readable DOM code generation
      identifiers.ts                 - stable generated variable names
  tests/
    fixtures/
      counter/
        counter.component.ts
        counter.component.html
        counter.component.css
    conventions/
      component-files.test.ts
    metadata/
      component-metadata.test.ts
    template/
      parse-template.test.ts
      bindings.test.ts
    expressions/
      rewrite-expression.test.ts
    styles/
      scope-css.test.ts
      scope-id.test.ts
    codegen/
      generate-component.test.ts
    api/
      compile-component.test.ts
      compile-component-from-files.test.ts
docs/
  superpowers/
    feature-maturity.md
```

Generated outputs:

```txt
packages/compiler/dist/
```

Generated outputs are not committed.

---

## Stage 1 - Dependencies and Public API

### Task 1: Add compiler dependencies

**Files:**

- Modify: `packages/compiler/package.json`
- Modify: `pnpm-lock.yaml`

**Steps:**

- [x] Add compiler-only dependencies:

```json
{
  "dependencies": {
    "parse5": "^7.1.2",
    "postcss": "^8.4.49",
    "postcss-selector-parser": "^6.1.2"
  }
}
```

- [x] Keep `@vanrot/runtime` out of compiler runtime dependencies for Phase 3. The compiler emits runtime imports as generated code strings; it does not execute runtime code.
- [x] Run:

```txt
pnpm install
```

- [x] Run:

```txt
pnpm --filter @vanrot/compiler build
```

Expected result:

```txt
@vanrot/compiler builds with no source behavior changes.
```

**Acceptance:**

- HTML and CSS parsing use structured parsers.
- Runtime package is not modified.

### Task 2: Define compiler API types

**Files:**

- Create: `packages/compiler/src/api/types.ts`
- Create: `packages/compiler/src/diagnostics/diagnostics.ts`
- Modify: `packages/compiler/src/index.ts`
- Create: `packages/compiler/tests/api/compile-component.test.ts`

**Steps:**

- [x] Write tests that import these public types and assert diagnostic constructors:

```ts
import { describe, expect, it } from 'vitest';
import { createDiagnostic } from '../../src/diagnostics/diagnostics.js';

describe('compiler api types', () => {
  it('creates diagnostics with stable fields', () => {
    expect(
      createDiagnostic('VR003', 'error', 'Invalid component suffix', 'src/counter.ts', 1, 1),
    ).toEqual({
      code: 'VR003',
      severity: 'error',
      message: 'Invalid component suffix',
      filePath: 'src/counter.ts',
      line: 1,
      column: 1,
    });
  });
});
```

- [x] Create `ComponentSource`, `CompileDiagnostic`, `CompileResult`, and `CompileFeature` types matching the Phase 3 spec.
- [x] Export the types from `packages/compiler/src/index.ts`.
- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/api/compile-component.test.ts
```

Expected result:

```txt
test passes and no compiler behavior exists yet.
```

**Acceptance:**

- Public types are stable enough for Vite and CLI phases to depend on.
- Diagnostic codes `VR001` through `VR008` are represented.

---

## Stage 2 - Convention Files and Component Metadata

### Task 3: Resolve Vanrot component sibling files

**Files:**

- Create: `packages/compiler/src/conventions/component-files.ts`
- Create: `packages/compiler/tests/conventions/component-files.test.ts`

**Steps:**

- [x] Write tests for:

```txt
counter.component.ts -> counter.component.html and counter.component.css
counter.page.ts -> VR003 invalid component file suffix for Phase 3
counter.ts -> VR003 invalid component file suffix
missing html -> VR001 missing sibling template file
missing css -> VR002 missing sibling style file
```

- [x] Implement a pure resolver that returns:

```ts
interface ComponentFileSet {
  componentPath: string;
  templatePath: string;
  stylePath: string;
  componentBaseName: string;
  expectedClassName: string;
}
```

- [x] Use the file basename to derive class names:

```txt
counter.component.ts -> CounterComponent
user-card.component.ts -> UserCardComponent
```

- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/conventions/component-files.test.ts
```

Expected result:

```txt
component file convention tests pass.
```

**Acceptance:**

- Phase 3 supports `.component.*` only.
- Future role suffixes stay tracked in the maturity ledger instead of being partially implemented.

### Task 4: Detect matching component class export

**Files:**

- Create: `packages/compiler/src/metadata/component-metadata.ts`
- Create: `packages/compiler/tests/metadata/component-metadata.test.ts`

**Steps:**

- [x] Write tests for:

```txt
export class CounterComponent -> found
class CounterComponent without export -> VR004
export class WrongName -> VR004
export default class CounterComponent -> VR004 for Phase 3
constructor(required: string) -> VR004 because Phase 3 component classes need no required constructor args
```

- [x] Use the TypeScript compiler API to parse the component source.
- [x] Return metadata:

```ts
interface ComponentMetadata {
  componentName: string;
  exportName: string;
  importPath: string;
}
```

- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/metadata/component-metadata.test.ts
```

Expected result:

```txt
component metadata tests pass.
```

**Acceptance:**

- The compiler never guesses component class names from template content.
- Default exports remain unsupported in Phase 3.

---

## Stage 3 - Template Parsing and Binding Extraction

### Task 5: Parse supported HTML into compiler template AST

**Files:**

- Create: `packages/compiler/src/template/ast.ts`
- Create: `packages/compiler/src/template/parse-template.ts`
- Create: `packages/compiler/tests/template/parse-template.test.ts`

**Steps:**

- [x] Write tests for:

```txt
single element with text
nested elements
static attributes
self-closing input element
comments ignored
unsupported parse node -> VR005
```

- [x] Parse HTML with `parse5`.
- [x] Convert parse5 nodes into a compiler-owned AST:

```ts
type TemplateNode = ElementNode | TextNode;

interface ElementNode {
  kind: 'element';
  tagName: string;
  attributes: TemplateAttribute[];
  children: TemplateNode[];
}

interface TextNode {
  kind: 'text';
  value: string;
}
```

- [x] Preserve source file path on diagnostics.
- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/template/parse-template.test.ts
```

Expected result:

```txt
template parser tests pass.
```

**Acceptance:**

- No string-only HTML parsing is used.
- The compiler AST is independent from parse5 internals.

### Task 6: Extract interpolation, event binding, and property binding

**Files:**

- Create: `packages/compiler/src/template/bindings.ts`
- Create: `packages/compiler/tests/template/bindings.test.ts`

**Steps:**

- [x] Write tests for:

```txt
Text "Count: {{ count() }}" -> static segment "Count: " and expression "count()"
Attribute "(click)" with value "increment()" -> event binding
Attribute "[value]" with value "name()" -> property binding
Attribute "class" with value "primary" -> static attribute
"[(value)]" -> VR005 unsupported template syntax
"*if" -> VR005 unsupported template syntax
"@if" text/control syntax -> VR005 unsupported template syntax
```

- [x] Implement binding extraction from AST nodes.
- [x] Normalize binding records:

```ts
type TemplateBinding =
  | { kind: 'interpolation'; expression: string; staticParts: string[] }
  | { kind: 'event'; eventName: string; handler: string }
  | { kind: 'property'; propertyName: string; expression: string };
```

- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/template/bindings.test.ts
```

Expected result:

```txt
binding extraction tests pass.
```

**Acceptance:**

- Unsupported syntax produces diagnostics instead of silent output.
- Attribute binding syntax is explicit and Angular-like.

---

## Stage 4 - Expression Rewriting

### Task 7: Rewrite component expressions to `ctx`

**Files:**

- Create: `packages/compiler/src/expressions/globals.ts`
- Create: `packages/compiler/src/expressions/rewrite-expression.ts`
- Create: `packages/compiler/tests/expressions/rewrite-expression.test.ts`

**Steps:**

- [x] Write tests for:

```txt
count() -> ctx.count()
user().name -> ctx.user().name
items().length -> ctx.items().length
count() + 1 -> ctx.count() + 1
Math.max(count(), 0) -> Math.max(ctx.count(), 0)
assignment expression -> VR006
function declaration -> VR006
```

- [x] Parse expressions with the TypeScript compiler API.
- [x] Prefix root identifiers with `ctx.` unless they are known JavaScript globals.
- [x] Do not prefix property access names after a dot.
- [x] Reject statements and assignment forms for Phase 3.
- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/expressions/rewrite-expression.test.ts
```

Expected result:

```txt
expression rewrite tests pass.
```

**Acceptance:**

- The compiler does not use `eval()` or `new Function()`.
- Expressions stay readable in generated output.

### Task 8: Validate event handler expressions

**Files:**

- Modify: `packages/compiler/src/expressions/rewrite-expression.ts`
- Modify: `packages/compiler/tests/expressions/rewrite-expression.test.ts`

**Steps:**

- [x] Add tests for:

```txt
increment() -> ctx.increment()
saveUser() -> ctx.saveUser()
increment(1) -> VR007
count.set(1) -> VR007
() => increment() -> VR007
```

- [x] Add an event-handler mode that accepts only zero-argument component method calls.
- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/expressions/rewrite-expression.test.ts
```

Expected result:

```txt
event handler validation tests pass.
```

**Acceptance:**

- Event binding remains intentionally narrow.
- Rich event argument support remains deferred in the ledger.

---

## Stage 5 - CSS Scoping

### Task 9: Generate deterministic scope attributes

**Files:**

- Create: `packages/compiler/src/styles/scope-id.ts`
- Create: `packages/compiler/tests/styles/scope-id.test.ts`

**Steps:**

- [x] Write tests for:

```txt
same path and CSS -> same scope attribute
different path -> different scope attribute
attribute starts with data-vr-
attribute is safe for HTML attribute usage
```

- [x] Generate a short deterministic hash from normalized component path plus CSS source.
- [x] Return scope attributes in the form:

```txt
data-vr-a1b2c3
```

- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/styles/scope-id.test.ts
```

Expected result:

```txt
scope id tests pass.
```

**Acceptance:**

- Scope ids are stable for tests and generated output.

### Task 10: Rewrite CSS selectors with component scope

**Files:**

- Create: `packages/compiler/src/styles/scope-css.ts`
- Create: `packages/compiler/tests/styles/scope-css.test.ts`

**Steps:**

- [x] Write tests for:

```txt
button -> button[data-vr-a1b2c3]
.primary -> .primary[data-vr-a1b2c3]
#save -> #save[data-vr-a1b2c3]
button.primary -> button.primary[data-vr-a1b2c3]
.toolbar button -> .toolbar[data-vr-a1b2c3] button[data-vr-a1b2c3]
.a, .b -> .a[data-vr-a1b2c3], .b[data-vr-a1b2c3]
@media (...) { button { ... } } -> scoped nested selector
:global(body) -> VR008 in Phase 3
```

- [x] Parse CSS with PostCSS.
- [x] Rewrite selectors with `postcss-selector-parser`.
- [x] Preserve declarations and supported at-rules.
- [x] Return scoped CSS plus diagnostics.
- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/styles/scope-css.test.ts
```

Expected result:

```txt
CSS scoping tests pass.
```

**Acceptance:**

- Component CSS cannot leak for supported selectors.
- Global escape syntax remains deferred and tracked.

---

## Stage 6 - Code Generation

### Task 11: Generate readable DOM creation code

**Files:**

- Create: `packages/compiler/src/codegen/identifiers.ts`
- Create: `packages/compiler/src/codegen/generate-component.ts`
- Create: `packages/compiler/tests/codegen/generate-component.test.ts`

**Steps:**

- [x] Write snapshot tests for static HTML:

```html
<section class="counter">
  <p>Ready</p>
</section>
```

- [x] Expected generated behavior:

```txt
imports component class
creates ctx with new CounterComponent()
creates document fragment
creates element and text nodes
sets static attributes
sets scope attribute on every element
returns { node: fragment, ctx }
```

- [x] Generate stable variable names:

```txt
fragment
section0
p0
text0
```

- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/codegen/generate-component.test.ts
```

Expected result:

```txt
static code generation snapshots pass.
```

**Acceptance:**

- Generated output is readable enough for future `vr inspect`.
- No virtual DOM abstraction is introduced.

### Task 12: Generate interpolation effects

**Files:**

- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`

**Steps:**

- [x] Add snapshot tests for:

```html
<p>Count: {{ count() }}</p>
```

- [x] Expected generated output includes:

```ts
import { effect } from '@vanrot/runtime';
```

and:

```ts
effect(() => {
  text0.data = `Count: ${ctx.count()}`;
});
```

- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/codegen/generate-component.test.ts
```

Expected result:

```txt
interpolation code generation snapshots pass.
```

**Acceptance:**

- Text interpolation updates only the affected text node.

### Task 13: Generate property binding effects

**Files:**

- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`

**Steps:**

- [x] Add snapshot tests for:

```html
<input [value]="name()" />
<button [disabled]="saving()">Save</button>
```

- [x] Expected generated output includes:

```ts
effect(() => {
  input0.value = ctx.name();
});

effect(() => {
  button0.disabled = ctx.saving();
});
```

- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/codegen/generate-component.test.ts
```

Expected result:

```txt
property binding code generation snapshots pass.
```

**Acceptance:**

- DOM properties are assigned directly.
- Attribute/property mapping beyond direct property assignment remains production maturity work.

### Task 14: Generate event binding code

**Files:**

- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`

**Steps:**

- [x] Add snapshot tests for:

```html
<button (click)="increment()">Increase</button>
```

- [x] Expected generated output includes:

```ts
import { listen } from '@vanrot/runtime/internal';
```

and:

```ts
listen(button0, 'click', () => {
  ctx.increment();
});
```

- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/codegen/generate-component.test.ts
```

Expected result:

```txt
event binding code generation snapshots pass.
```

**Acceptance:**

- Event cleanup is delegated to runtime `listen()`.

---

## Stage 7 - Compile Pipeline

### Task 15: Implement `compileComponent()`

**Files:**

- Create: `packages/compiler/src/api/compile-component.ts`
- Modify: `packages/compiler/src/index.ts`
- Modify: `packages/compiler/tests/api/compile-component.test.ts`

**Steps:**

- [x] Write fixture-based tests using in-memory sources for:

```txt
component metadata detection
template parsing
expression rewriting
CSS scoping
generated JS output
generated CSS output
metadata.features includes interpolation, event-binding, property-binding, scoped-css
```

- [x] Pipeline order:

```txt
1. validate component file convention
2. detect component metadata
3. parse template
4. extract bindings
5. rewrite expressions
6. generate scope attribute
7. scope CSS
8. generate JS
9. return CompileResult
```

- [x] Export `compileComponent()` from `packages/compiler/src/index.ts`.
- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/api/compile-component.test.ts
```

Expected result:

```txt
compileComponent tests pass.
```

**Acceptance:**

- The pure compiler API is deterministic.
- Diagnostics are returned in `CompileResult.diagnostics`.

### Task 16: Implement `compileComponentFromFiles()`

**Files:**

- Create: `packages/compiler/src/api/compile-component-from-files.ts`
- Create: `packages/compiler/tests/api/compile-component-from-files.test.ts`
- Create: `packages/compiler/tests/fixtures/counter/counter.component.ts`
- Create: `packages/compiler/tests/fixtures/counter/counter.component.html`
- Create: `packages/compiler/tests/fixtures/counter/counter.component.css`
- Modify: `packages/compiler/src/index.ts`

**Steps:**

- [x] Create fixture component:

```ts
import { signal } from '@vanrot/runtime';

export class CounterComponent {
  count = signal(0);
  saving = signal(false);

  increment() {
    this.count.update((value) => value + 1);
  }
}
```

- [x] Create fixture template:

```html
<section class="counter">
  <p>Count: {{ count() }}</p>
  <button type="button" [disabled]="saving()" (click)="increment()">Increase</button>
</section>
```

- [x] Create fixture style:

```css
.counter {
  display: grid;
}

button {
  color: red;
}
```

- [x] Write tests that call `compileComponentFromFiles()` with the fixture component path.
- [x] Assert the result has generated JS, generated CSS, no diagnostics, and all Phase 3 features in metadata.
- [x] Export `compileComponentFromFiles()` from `packages/compiler/src/index.ts`.
- [x] Run:

```txt
pnpm --filter @vanrot/compiler test tests/api/compile-component-from-files.test.ts
```

Expected result:

```txt
file-based compile tests pass.
```

**Acceptance:**

- Future Vite and CLI packages can call the file-based compiler wrapper.

---

## Stage 8 - Verification and Maturity Tracking

### Task 17: Run compiler verification

**Commands:**

```txt
pnpm --filter @vanrot/compiler test
pnpm --filter @vanrot/compiler build
pnpm test
pnpm build
```

**Steps:**

- [x] Run `pnpm --filter @vanrot/compiler test`.
- [x] Run `pnpm --filter @vanrot/compiler build`.
- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Confirm Phase 3 did not modify `packages/runtime`.
- [x] Confirm generated outputs under `packages/compiler/dist/` are not committed.

**Acceptance:**

- Compiler package tests pass.
- Workspace tests and build pass.
- Runtime package changes are absent unless separately merged from Phase 2.

### Task 18: Update feature maturity ledger

**Files:**

- Modify: `docs/superpowers/feature-maturity.md`

**Steps:**

- [x] Move these rows to `Demo-Capable` after verification passes:

```txt
Compiler file convention resolver
Compiler text interpolation `{{ }}`
Compiler event binding `(event)`
Compiler property binding `[property]`
Compiler scoped CSS
Compiler readable generated output
Compiler component class detection
Compiler expression rewriting
```

- [x] Keep these rows `Deferred`:

```txt
Compiler `@if` conditionals
Compiler `@for` loops
Compiler child components
Compiler slots
Compiler two-way binding
Compiler i18n extraction
Compiler source maps
Vite transform integration
CLI commands
Production diagnostics
```

- [x] Add a note to each moved row that Phase 3 support is demo-capable, not production-ready.

**Acceptance:**

- No Phase 3 feature is marked production-ready.
- Deferred work remains visible.

### Task 19: Update roadmap tracker

**Files:**

- Modify: `docs/brainstorm.md`

**Steps:**

- [x] Update the Phase 3 row only after Task 17 and Task 18 pass.
- [x] Keep future phase rows unchecked.
- [x] Mention `docs/superpowers/feature-maturity.md` in the Phase 3 tick condition or nearby tracker notes.

**Acceptance:**

- Roadmap milestone state and maturity state remain separate.
- Phase 3 is not marked complete until verified.

