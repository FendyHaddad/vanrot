# Vanrot Compiler MVP Design

**Date:** 2026-05-21
**Phase:** Phase 3 - Compiler MVP
**Package:** `@vanrot/compiler`
**Status:** Draft for review
**Related:**
- `docs/brainstorm.md`
- `docs/superpowers/specs/Phase-01.md`
- `docs/superpowers/specs/Phase-02.md`
- `docs/superpowers/feature-maturity.md`

---

## 1. Goal

Phase 3 creates the first demo-capable Vanrot compiler.

The compiler reads Vanrot convention files:

```txt
name.component.ts
name.component.html
name.component.css
```

It emits readable JavaScript-compatible render code and scoped CSS for a simple component.

Phase 3 is successful when a component with text interpolation, event binding, property binding, and scoped CSS can compile without hand-written glue.

---

## 2. Maturity Level

Phase 3 creates demo-capable compiler features, not production-ready compiler features.

Every Phase 3 feature must be recorded in:

```txt
docs/superpowers/feature-maturity.md
```

The ledger distinguishes:

```txt
planned
demo-capable
production-ready
deferred
```

This prevents narrow demo support from being mistaken for complete framework behavior.

---

## 3. Prerequisites

Phase 3 assumes Phase 1 has created the monorepo and `@vanrot/compiler` package shell.

Phase 3 depends on the Phase 2 runtime API contract:

```ts
import { effect } from '@vanrot/runtime';
import { listen } from '@vanrot/runtime/internal';
```

If Phase 2 is still being implemented in another workspace, Phase 3 implementation must not edit `@vanrot/runtime`. Compiler tests may assert generated imports as strings until the runtime package is merged.

---

## 4. Non-Goals

Phase 3 must not implement:

```txt
@if conditionals
@for loops
child components
slots
two-way binding
forms
i18n extraction
source maps
Vite integration
CLI commands
HMR
production-grade diagnostics
SSR rendering
hydration
```

These features are tracked in the feature maturity ledger with future phase ownership or deferred status.

---

## 5. Component File Convention

Phase 3 supports only separate Vanrot component files.

For a component entry:

```txt
counter.component.ts
```

The compiler resolves sibling files:

```txt
counter.component.html
counter.component.css
```

Required MVP rules:

- The TypeScript file suffix must be `.component.ts`.
- The HTML file suffix must be `.component.html`.
- The CSS file suffix must be `.component.css`.
- The component class must be a named export whose name matches the file role.
- `counter.component.ts` exports `CounterComponent`.
- The component class has no required constructor arguments.
- Template expressions run against the component instance as `ctx`.

Example:

```ts
import { signal } from '@vanrot/runtime';

export class CounterComponent {
  count = signal(0);
  label = signal('Increase');

  increment() {
    this.count.update((value) => value + 1);
  }
}
```

---

## 6. Supported Template Syntax

### 6.1 Text Interpolation

Supported:

```html
<p>Count: {{ count() }}</p>
```

Compiler output updates only the affected text node through `effect()`.

Generated expression shape:

```ts
effect(() => {
  text0.data = `Count: ${ctx.count()}`;
});
```

### 6.2 Event Binding

Supported:

```html
<button (click)="increment()">Increase</button>
```

Event binding values must be component method calls with no arguments.

Generated output uses `listen()` so cleanup belongs to the active runtime cleanup scope:

```ts
listen(button0, 'click', () => {
  ctx.increment();
});
```

### 6.3 Property Binding

Supported:

```html
<input [value]="name()" />
<button [disabled]="saving()">Save</button>
```

Property binding values use the same expression subset as interpolation.

Generated output assigns DOM properties inside `effect()`:

```ts
effect(() => {
  input0.value = ctx.name();
});
```

### 6.4 Static HTML

Supported:

```html
<section class="counter">
  <p>Static text</p>
</section>
```

Static attributes are emitted as direct `setAttribute()` calls.

---

## 7. Expression Subset

Phase 3 expressions are component-context expressions.

Supported expression forms:

```txt
count()
name()
saving()
user().name
items().length
count() + 1
`Count: ${count()}`
```

Unsupported expression forms:

```txt
assignments
statements
locals introduced by template syntax
pipes
filters
optional template variables
inline function declarations
destructuring
```

The compiler must not use `eval()` or `new Function()`.

Expression rewriting uses a TypeScript AST pass. Bare component identifiers are rewritten to `ctx.<identifier>`, while property names and known JavaScript globals are left unchanged.

Examples:

```txt
count()            -> ctx.count()
user().name        -> ctx.user().name
Math.max(count(), 0) -> Math.max(ctx.count(), 0)
```

---

## 8. CSS Scoping

Component CSS is scoped by default.

Input:

```css
button {
  color: red;
}
```

Generated scope id:

```txt
data-vr-a1b2c3
```

Generated HTML:

```html
<button data-vr-a1b2c3>
```

Generated CSS:

```css
button[data-vr-a1b2c3] {
  color: red;
}
```

MVP CSS scoping supports:

- type selectors
- class selectors
- id selectors
- compound selectors
- descendant selectors
- child selectors
- comma-separated selector lists
- `@media` rules containing supported selectors

MVP CSS scoping does not support global escapes yet. A future production-ready compiler feature will define explicit global CSS syntax.

---

## 9. Compiler API

The compiler exposes a pure compiler API and a file-based API.

```ts
export interface ComponentSource {
  componentPath: string;
  componentSource: string;
  templatePath: string;
  templateSource: string;
  stylePath: string;
  styleSource: string;
}

export interface CompileDiagnostic {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  filePath: string;
  line: number;
  column: number;
}

export interface CompileResult {
  js: string;
  css: string;
  diagnostics: CompileDiagnostic[];
  metadata: {
    componentName: string;
    scopeAttribute: string;
    features: string[];
  };
}

export function compileComponent(source: ComponentSource): CompileResult;
export function compileComponentFromFiles(componentPath: string): Promise<CompileResult>;
```

`compileComponent()` is the core deterministic API used by tests, Vite integration, and CLI integration.

`compileComponentFromFiles()` resolves sibling files using Vanrot conventions and reads them from disk.

---

## 10. Generated Output Contract

Phase 3 output is designed for readability.

The generated JavaScript must:

- import the component class from the source component file
- import `effect` from `@vanrot/runtime`
- import `listen` from `@vanrot/runtime/internal` when event bindings exist
- instantiate the component class
- create DOM nodes through direct DOM APIs
- apply the component CSS scope attribute to every element node
- wire text interpolation through `effect()`
- wire property binding through `effect()`
- wire event binding through `listen()`
- export a component factory consumed by future Vite and CLI integration

MVP factory shape:

```ts
export function createComponent() {
  const ctx = new CounterComponent();
  const fragment = document.createDocumentFragment();

  // generated DOM creation and bindings

  return {
    node: fragment,
    ctx,
  };
}
```

The Phase 2 `mount()` placeholder must be updated in a later integration phase if its `ComponentType` shape differs from this compiler output.

---

## 11. Diagnostics

Phase 3 diagnostics are basic fatal diagnostics, not production diagnostics.

Required diagnostics:

```txt
VR001 missing sibling template file
VR002 missing sibling style file
VR003 invalid component file suffix
VR004 missing matching component class export
VR005 unsupported template syntax
VR006 unsupported expression syntax
VR007 unsupported event binding expression
VR008 CSS selector cannot be scoped by the MVP compiler
```

Diagnostics must include file path, line, and column when the parser can provide them.

Production diagnostics with rich suggestions, code frames, recovery, and documentation links are tracked separately in the feature maturity ledger.

---

## 12. Testing Requirements

Phase 3 implementation must include tests for:

- file convention resolution
- component class name detection
- template parsing
- interpolation parsing
- event binding parsing
- property binding parsing
- expression rewriting
- CSS scope id generation
- CSS selector rewriting
- generated code snapshots
- full fixture compilation for a counter component

The full fixture must contain:

```txt
counter.component.ts
counter.component.html
counter.component.css
```

The fixture must compile with:

```txt
{{ count() }}
(click)="increment()"
[disabled]="saving()"
scoped button CSS
```

---

## 13. Phase Completion Rule

Phase 3 is complete only when:

- `pnpm --filter @vanrot/compiler test` passes.
- `pnpm --filter @vanrot/compiler build` passes.
- the compiler fixture produces readable generated JavaScript and scoped CSS.
- `docs/superpowers/feature-maturity.md` marks Phase 3 features as demo-capable.
- deferred compiler features remain tracked as deferred or planned.
- `docs/brainstorm.md` Phase 3 checkbox is updated only after verification.

