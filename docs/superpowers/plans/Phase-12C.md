# Phase 12C Compiler Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@vanrot/compiler` production-ready for the approved Phase 12C component model: rich diagnostics, exact source locations, hardened bindings, scoped CSS, `@if`, `@for`, child components, slots, and source-map-ready output.

**Architecture:** Keep the compiler as a staged pipeline: role resolver, metadata reader, template parser with spans, template analyzer, expression analyzer, style scoper, and code generator. Split large compiler responsibilities into focused files so source spans and diagnostics can flow through every stage without turning `generate-component.ts` into the whole framework.

**Tech Stack:** TypeScript, Vitest, parse5, PostCSS, postcss-selector-parser, existing `@vanrot/runtime` cleanup/effect internals, existing Vanrot package scripts.

---

## Project Rules For This Plan

- Do not create a branch or worktree.
- Do not run `git add`, `git commit`, or `git push` unless the user explicitly asks.
- Check off tasks in this file only when that task has been implemented and verified.
- Use failing tests before implementation for every behavior task.
- Keep literals centralized in catalog files when the value is reused.
- Keep UI markup out of TypeScript examples except compiler-generated JS strings.
- Keep application logic out of HTML examples.

## File Structure

### Compiler API And Diagnostics

- Modify `packages/compiler/src/api/types.ts`
  - Add source span, mapping, component dependency, input metadata, slot metadata, and new compile feature types.
  - Extend `CompileDiagnostic` with `endLine`, `endColumn`, `sourceText`, `codeFrame`, `suggestion`, and `docsPath`.
- Create `packages/compiler/src/source/location.ts`
  - Own line/column conversion, source slicing, span creation, and code-frame generation.
- Create `packages/compiler/src/diagnostics/catalog.ts`
  - Own diagnostic messages, suggestions, and docs paths.
- Modify `packages/compiler/src/diagnostics/diagnostics.ts`
  - Build rich diagnostics from the catalog and optional source spans.

### Template Parsing And Analysis

- Modify `packages/compiler/src/template/ast.ts`
  - Add `SourceSpan` to nodes and attributes.
  - Add `IfBlockNode`, `ForBlockNode`, and `SlotOutletNode`.
- Modify `packages/compiler/src/template/parse-template.ts`
  - Preserve source spans from parse5 for normal HTML.
  - Normalize self-closing Vanrot tags without losing source ownership.
  - Delegate control-flow parsing to `control-flow.ts`.
- Create `packages/compiler/src/template/control-flow.ts`
  - Parse `@if`, `@else`, `@for`, and `@empty` blocks into AST nodes.
- Modify `packages/compiler/src/template/bindings.ts`
  - Carry spans on interpolation, event, and property bindings.
  - Stop treating approved `@if` and `@for` syntax as unsupported.

### Expressions And Metadata

- Modify `packages/compiler/src/expressions/rewrite-expression.ts`
  - Accept source-span context and create precise diagnostics.
  - Keep event handlers restricted to zero-argument component method calls.
- Modify `packages/compiler/src/metadata/component-metadata.ts`
  - Distinguish missing class, default export, multiple plausible exports, and required constructor diagnostics.
- Create `packages/compiler/src/metadata/component-inputs.ts`
  - Read `input.required<T>()`, `input.required()`, and `input.default(value)` declarations from component classes.
- Modify `packages/compiler/src/conventions/component-files.ts`
  - Support role suffixes and prefix-first UI file names used by generated UI primitives.

### Code Generation

- Keep `packages/compiler/src/codegen/generate-component.ts` as the public entrypoint.
- Create `packages/compiler/src/codegen/state.ts`
  - Own `GenerateState`, import tracking, feature tracking, mappings, and child component dependency tracking.
- Create `packages/compiler/src/codegen/dom.ts`
  - Generate static elements, text nodes, static attributes, router primitives, and UI primitives.
- Create `packages/compiler/src/codegen/bindings.ts`
  - Generate interpolation, property binding, and event binding code.
- Create `packages/compiler/src/codegen/control-flow.ts`
  - Generate `@if`, `@else`, `@for`, and `@empty` code with cleanup scopes.
- Create `packages/compiler/src/codegen/components.ts`
  - Generate child component instantiation and parent-to-child input updates.
- Create `packages/compiler/src/codegen/slots.ts`
  - Generate default slots, named slots, and fallback slot content.
- Create `packages/compiler/src/codegen/mappings.ts`
  - Record source-map-ready generated-to-source mappings.

### Runtime Input Helper

- Create `packages/runtime/src/inputs/input.ts`
  - Add a minimal `input.required<T>()` and `input.default(value)` signal helper.
- Create `packages/runtime/tests/inputs/input.test.ts`
  - Cover required input missing-read behavior, parent writes, default values, and signal shape.
- Modify `packages/runtime/src/index.ts`
  - Export `input` and related input signal types.

### Tests And Fixtures

- Create or modify focused compiler tests:
  - `packages/compiler/tests/diagnostics/diagnostics.test.ts`
  - `packages/compiler/tests/source/location.test.ts`
  - `packages/compiler/tests/template/parse-template.test.ts`
  - `packages/compiler/tests/template/control-flow.test.ts`
  - `packages/compiler/tests/template/bindings.test.ts`
  - `packages/compiler/tests/expressions/rewrite-expression.test.ts`
  - `packages/compiler/tests/metadata/component-metadata.test.ts`
  - `packages/compiler/tests/metadata/component-inputs.test.ts`
  - `packages/compiler/tests/conventions/component-files.test.ts`
  - `packages/compiler/tests/styles/scope-css.test.ts`
  - `packages/compiler/tests/codegen/generate-component.test.ts`
  - `packages/compiler/tests/integration/compiler-production.test.ts`
- Modify `audits/core/compiler.audit.ts`
  - Keep the audit assertion, then let it pass after diagnostics are production-ready.

### Documentation

- Modify `docs/superpowers/feature-maturity.md`
  - Mark only verified Phase 12C compiler rows `Production-Ready` after implementation passes.
- Modify `docs/superpowers/final-tdd-inventory.md`
  - Record compiler production coverage added by Phase 12C.
- Modify `docs/vanrot-presentation.html`
  - Update roadmap text after implementation passes.

---

## Task 1: Source Spans And Diagnostic Foundation

**Files:**
- Create: `packages/compiler/src/source/location.ts`
- Create: `packages/compiler/tests/source/location.test.ts`
- Create: `packages/compiler/src/diagnostics/catalog.ts`
- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/diagnostics/diagnostics.ts`
- Modify: `packages/compiler/src/index.ts`
- Test: `packages/compiler/tests/api/compile-component.test.ts`
- Test: `packages/compiler/tests/diagnostics/diagnostics.test.ts`

- [x] **Step 1: Add failing source location tests**

Create `packages/compiler/tests/source/location.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  createCodeFrame,
  createLineIndex,
  createSourceSpan,
  getSourceText,
  positionAtOffset,
} from '../../src/source/location.js';

describe('source locations', () => {
  it('converts offsets to one-based line and column positions', () => {
    const source = '<section>\n  <button (click)="count++">Save</button>\n</section>';
    const lineIndex = createLineIndex(source);

    expect(positionAtOffset(lineIndex, 12)).toEqual({ line: 2, column: 3, offset: 12 });
  });

  it('creates spans with source text and code frames', () => {
    const source = '<button (click)="count++">Save</button>';
    const startOffset = source.indexOf('(click)');
    const endOffset = source.indexOf('>Save');
    const span = createSourceSpan(source, 'counter.component.html', startOffset, endOffset);

    expect(span).toMatchObject({
      filePath: 'counter.component.html',
      line: 1,
      column: 9,
      endLine: 1,
      endColumn: 26,
    });
    expect(getSourceText(source, span)).toBe('(click)="count++"');
    expect(createCodeFrame(source, span)).toContain('1 | <button (click)="count++">Save</button>');
    expect(createCodeFrame(source, span)).toContain('        ^^^^^^^^^^^^^^^^^');
  });
});
```

- [x] **Step 2: Run source location tests and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/source/location.test.ts
```

Expected: fail because `../../src/source/location.js` does not exist.

- [x] **Step 3: Implement source location helpers**

Create `packages/compiler/src/source/location.ts`:

```ts
export interface SourcePosition {
  line: number;
  column: number;
  offset: number;
}

export interface SourceSpan {
  filePath: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  startOffset: number;
  endOffset: number;
}

export interface LineIndex {
  source: string;
  lineStarts: number[];
}

export function createLineIndex(source: string): LineIndex {
  const lineStarts = [0];

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] !== '\n') {
      continue;
    }

    lineStarts.push(index + 1);
  }

  return { source, lineStarts };
}

export function positionAtOffset(lineIndex: LineIndex, offset: number): SourcePosition {
  const boundedOffset = Math.max(0, Math.min(offset, lineIndex.source.length));
  let lineIndexValue = 0;

  for (let index = 0; index < lineIndex.lineStarts.length; index += 1) {
    const lineStart = lineIndex.lineStarts[index] ?? 0;

    if (lineStart > boundedOffset) {
      break;
    }

    lineIndexValue = index;
  }

  const lineStart = lineIndex.lineStarts[lineIndexValue] ?? 0;

  return {
    line: lineIndexValue + 1,
    column: boundedOffset - lineStart + 1,
    offset: boundedOffset,
  };
}

export function createSourceSpan(
  source: string,
  filePath: string,
  startOffset: number,
  endOffset: number,
): SourceSpan {
  const lineIndex = createLineIndex(source);
  const start = positionAtOffset(lineIndex, startOffset);
  const end = positionAtOffset(lineIndex, endOffset);

  return {
    filePath,
    line: start.line,
    column: start.column,
    endLine: end.line,
    endColumn: end.column,
    startOffset: start.offset,
    endOffset: end.offset,
  };
}

export function getSourceText(source: string, span: SourceSpan): string {
  return source.slice(span.startOffset, span.endOffset);
}

export function createCodeFrame(source: string, span: SourceSpan): string {
  const lines = source.split('\n');
  const lineText = lines[span.line - 1] ?? '';
  const startColumn = span.column;
  const endColumn = span.line === span.endLine ? span.endColumn : lineText.length + 1;
  const markerLength = Math.max(1, endColumn - startColumn);
  const gutter = `${span.line} | `;

  return [
    `${gutter}${lineText}`,
    `${' '.repeat(gutter.length + startColumn - 1)}${'^'.repeat(markerLength)}`,
  ].join('\n');
}
```

- [x] **Step 4: Extend diagnostic types and catalog**

Modify `packages/compiler/src/api/types.ts` so the top section includes the new codes and diagnostic fields:

```ts
export type DiagnosticCode =
  | 'VR001'
  | 'VR002'
  | 'VR003'
  | 'VR004'
  | 'VR005'
  | 'VR006'
  | 'VR007'
  | 'VR008'
  | 'VR009'
  | 'VR010'
  | 'VR011'
  | 'VR012'
  | 'VR013'
  | 'VR014'
  | 'VR015'
  | 'VR016'
  | 'VR017'
  | 'VR018';

export type DiagnosticSeverity = 'error' | 'warning';

export interface CompileDiagnostic {
  code: DiagnosticCode;
  severity: DiagnosticSeverity;
  message: string;
  filePath: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  sourceText: string;
  codeFrame: string;
  suggestion: string;
  docsPath: string;
}
```

Create `packages/compiler/src/diagnostics/catalog.ts`:

```ts
import type { DiagnosticCode } from '../api/types.js';

export interface DiagnosticInfo {
  message: string;
  suggestion: string;
  docsPath: string;
}

export const diagnosticCatalog: Record<DiagnosticCode, DiagnosticInfo> = {
  VR001: {
    message: 'Missing sibling component template file.',
    suggestion: 'Create the matching template file beside the component source file.',
    docsPath: '/docs/compiler/file-conventions',
  },
  VR002: {
    message: 'Missing sibling component style file.',
    suggestion: 'Create the matching scoped CSS file beside the component source file.',
    docsPath: '/docs/compiler/file-conventions',
  },
  VR003: {
    message: 'Unsupported Vanrot role file.',
    suggestion: 'Use a supported role suffix such as .component.ts, .page.ts, or .button.ts.',
    docsPath: '/docs/compiler/file-conventions',
  },
  VR004: {
    message: 'Component class could not be read.',
    suggestion: 'Export a named class that matches the Vanrot role file name and has no required constructor arguments.',
    docsPath: '/docs/compiler/component-class',
  },
  VR005: {
    message: 'Unsupported template syntax.',
    suggestion: 'Use Vanrot template syntax supported by this compiler phase.',
    docsPath: '/docs/compiler/template-syntax',
  },
  VR006: {
    message: 'Unsupported expression syntax.',
    suggestion: 'Move assignments, updates, lambdas, and statement-like logic into the component TypeScript file.',
    docsPath: '/docs/compiler/expressions',
  },
  VR007: {
    message: 'Unsupported event binding expression.',
    suggestion: 'Use a zero-argument component method such as save().',
    docsPath: '/docs/compiler/event-binding',
  },
  VR008: {
    message: 'CSS selector cannot be scoped.',
    suggestion: 'Use scoped selectors, :host, :global(...), or @media syntax supported by Vanrot.',
    docsPath: '/docs/compiler/scoped-css',
  },
  VR009: {
    message: 'Invalid Vanrot route link syntax.',
    suggestion: 'Use <vr route.name /> for Vanrot route links.',
    docsPath: '/docs/router/links',
  },
  VR010: {
    message: 'Unsupported Vanrot UI primitive.',
    suggestion: 'Use a supported Vanrot UI primitive or add the primitive through the UI production plan.',
    docsPath: '/docs/ui/primitives',
  },
  VR011: {
    message: 'Invalid @for block.',
    suggestion: 'Use @for (item of items(); track item.id) { ... } with a required track expression.',
    docsPath: '/docs/compiler/for',
  },
  VR012: {
    message: 'Invalid child component input.',
    suggestion: 'Pass every required child input with [inputName]=\"value\".',
    docsPath: '/docs/compiler/child-components',
  },
  VR013: {
    message: 'Unknown slot target.',
    suggestion: 'Provide slots that the child component receives with <slot.name>.',
    docsPath: '/docs/compiler/slots',
  },
  VR014: {
    message: 'Default export is not a Vanrot component class.',
    suggestion: 'Use an exported named class that matches the role file name.',
    docsPath: '/docs/compiler/component-class',
  },
  VR015: {
    message: 'Multiple component class candidates were found.',
    suggestion: 'Keep one exported Vanrot component class per role file.',
    docsPath: '/docs/compiler/component-class',
  },
  VR016: {
    message: 'Required constructor arguments are not supported.',
    suggestion: 'Use input.required(), input.default(), signals, or services instead of constructor arguments.',
    docsPath: '/docs/compiler/component-class',
  },
  VR017: {
    message: 'Invalid input declaration.',
    suggestion: 'Use input.required<Model>() or input.default(value) in the component class.',
    docsPath: '/docs/compiler/inputs',
  },
  VR018: {
    message: 'Source mapping could not be created.',
    suggestion: 'Report this generated mapping issue with the component, template, and style files.',
    docsPath: '/docs/compiler/source-maps',
  },
};
```

- [x] **Step 5: Update `createDiagnostic()` to fill rich fields**

Modify `packages/compiler/src/diagnostics/diagnostics.ts`:

```ts
import type {
  CompileDiagnostic,
  DiagnosticCode,
  DiagnosticSeverity,
} from '../api/types.js';
import { diagnosticCatalog } from './catalog.js';
import {
  createCodeFrame,
  getSourceText,
  type SourceSpan,
} from '../source/location.js';

export interface DiagnosticSourceContext {
  source: string;
  span: SourceSpan;
}

export function createDiagnostic(
  code: DiagnosticCode,
  severity: DiagnosticSeverity,
  message: string,
  filePath: string,
  line = 1,
  column = 1,
  sourceContext?: DiagnosticSourceContext,
): CompileDiagnostic {
  const catalogEntry = diagnosticCatalog[code];

  if (sourceContext !== undefined) {
    return {
      code,
      severity,
      message,
      filePath: sourceContext.span.filePath,
      line: sourceContext.span.line,
      column: sourceContext.span.column,
      endLine: sourceContext.span.endLine,
      endColumn: sourceContext.span.endColumn,
      sourceText: getSourceText(sourceContext.source, sourceContext.span),
      codeFrame: createCodeFrame(sourceContext.source, sourceContext.span),
      suggestion: catalogEntry.suggestion,
      docsPath: catalogEntry.docsPath,
    };
  }

  return {
    code,
    severity,
    message,
    filePath,
    line,
    column,
    endLine: line,
    endColumn: column,
    sourceText: '',
    codeFrame: '',
    suggestion: catalogEntry.suggestion,
    docsPath: catalogEntry.docsPath,
  };
}
```

- [x] **Step 6: Export source helpers and add diagnostic tests**

Modify `packages/compiler/src/index.ts`:

```ts
export type { LineIndex, SourcePosition, SourceSpan } from './source/location.js';
export {
  createCodeFrame,
  createLineIndex,
  createSourceSpan,
  getSourceText,
  positionAtOffset,
} from './source/location.js';
export { diagnosticCatalog } from './diagnostics/catalog.js';
```

Create `packages/compiler/tests/diagnostics/diagnostics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createDiagnostic } from '../../src/diagnostics/diagnostics.js';
import { createSourceSpan } from '../../src/source/location.js';

describe('compiler diagnostics', () => {
  it('creates rich diagnostics from source context', () => {
    const source = '<button (click)="count++">Save</button>';
    const span = createSourceSpan(source, 'counter.component.html', 8, 25);

    expect(
      createDiagnostic(
        'VR007',
        'error',
        'Unsupported event binding expression.',
        'counter.component.html',
        1,
        1,
        { source, span },
      ),
    ).toMatchObject({
      code: 'VR007',
      severity: 'error',
      filePath: 'counter.component.html',
      line: 1,
      column: 9,
      endLine: 1,
      endColumn: 26,
      sourceText: '(click)="count++"',
      suggestion: 'Use a zero-argument component method such as save().',
      docsPath: '/docs/compiler/event-binding',
    });
  });
});
```

- [x] **Step 7: Run diagnostic foundation tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/source/location.test.ts tests/diagnostics/diagnostics.test.ts tests/api/compile-component.test.ts
```

Expected: pass.

- [x] **Step 8: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: changed compiler source and test files only. Do not stage or commit.

---

## Task 2: Template AST Spans And Normal HTML Parsing

**Files:**
- Modify: `packages/compiler/src/template/ast.ts`
- Modify: `packages/compiler/src/template/parse-template.ts`
- Modify: `packages/compiler/src/template/bindings.ts`
- Modify: `packages/compiler/src/index.ts`
- Test: `packages/compiler/tests/template/parse-template.test.ts`
- Test: `packages/compiler/tests/template/bindings.test.ts`

- [x] **Step 1: Add failing parser span tests**

Append to `packages/compiler/tests/template/parse-template.test.ts`:

```ts
it('preserves source spans for elements, attributes, and text nodes', () => {
  const result = parseTemplate('<button (click)="save()">Save</button>', 'counter.component.html');
  const button = result.nodes[0];

  expect(button).toMatchObject({
    kind: 'element',
    tagName: 'button',
    span: {
      filePath: 'counter.component.html',
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 40,
    },
  });

  if (button?.kind !== 'element') {
    throw new Error('Expected element node');
  }

  expect(button.attributes[0]).toMatchObject({
    name: '(click)',
    value: 'save()',
    span: {
      line: 1,
      column: 9,
      endLine: 1,
      endColumn: 25,
    },
  });
  expect(button.children[0]).toMatchObject({
    kind: 'text',
    value: 'Save',
    span: {
      line: 1,
      column: 26,
      endLine: 1,
      endColumn: 30,
    },
  });
});
```

- [x] **Step 2: Run parser test and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/template/parse-template.test.ts
```

Expected: fail because nodes and attributes do not include `span`.

- [x] **Step 3: Add spans to AST types**

Modify `packages/compiler/src/template/ast.ts`:

```ts
import type { SourceSpan } from '../source/location.js';

export type TemplateNode = ElementNode | TextNode | IfBlockNode | ForBlockNode | SlotOutletNode;

export interface ElementNode {
  kind: 'element';
  tagName: string;
  attributes: TemplateAttribute[];
  children: TemplateNode[];
  span: SourceSpan;
}

export interface TextNode {
  kind: 'text';
  value: string;
  span: SourceSpan;
}

export interface TemplateAttribute {
  name: string;
  value: string;
  span: SourceSpan;
  valueSpan: SourceSpan;
}

export interface IfBlockNode {
  kind: 'if-block';
  expression: string;
  expressionSpan: SourceSpan;
  consequent: TemplateNode[];
  alternate: TemplateNode[];
  span: SourceSpan;
}

export interface ForBlockNode {
  kind: 'for-block';
  itemName: string;
  iterableExpression: string;
  trackExpression: string;
  expressionSpan: SourceSpan;
  body: TemplateNode[];
  empty: TemplateNode[];
  span: SourceSpan;
}

export interface SlotOutletNode {
  kind: 'slot-outlet';
  name: string;
  fallback: TemplateNode[];
  span: SourceSpan;
}
```

- [x] **Step 4: Preserve parse5 spans in normal parser**

Modify `packages/compiler/src/template/parse-template.ts` so `parseTemplate()` stores the source string and each node gets
a span:

```ts
import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';
import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { createSourceSpan, type SourceSpan } from '../source/location.js';
import type { TemplateAttribute, TemplateNode } from './ast.js';
import { parseControlFlowTemplate } from './control-flow.js';

export interface ParseTemplateResult {
  nodes: TemplateNode[];
  diagnostics: CompileDiagnostic[];
}

export function parseTemplate(templateSource: string, templatePath: string): ParseTemplateResult {
  if (templateSource.includes('@if') || templateSource.includes('@for')) {
    return parseControlFlowTemplate(templateSource, templatePath, parseHtmlFragment);
  }

  return parseHtmlFragment(templateSource, templatePath, 0);
}

export function parseHtmlFragment(
  templateSource: string,
  templatePath: string,
  offsetBase: number,
): ParseTemplateResult {
  const normalized = normalizeVanrotSelfClosingTags(templateSource);
  const fragment = parseFragment(normalized.source, { sourceCodeLocationInfo: true });
  const diagnostics: CompileDiagnostic[] = [];
  const nodes: TemplateNode[] = [];

  for (const child of fragment.childNodes) {
    const node = convertNode(child, normalized.source, templatePath, diagnostics, offsetBase);

    if (node === null) {
      continue;
    }

    nodes.push(node);
  }

  return { nodes, diagnostics };
}

interface NormalizedTemplate {
  source: string;
}

function normalizeVanrotSelfClosingTags(templateSource: string): NormalizedTemplate {
  return {
    source: templateSource.replace(/<vr(\s+route\.[A-Za-z_$][\w$]*)\s*\/>/g, '<vr$1></vr>'),
  };
}
```

Also update `convertNode()` and `toTemplateAttribute()` to call `createSourceSpan()`. Use `location.startOffset` and
`location.endOffset` from parse5. For attribute spans, use `node.sourceCodeLocation?.attrs?.[attribute.name]`.

- [x] **Step 5: Make binding extraction span-aware**

Update `packages/compiler/src/template/bindings.ts` so binding records include `span` and `expressionSpan`:

```ts
import type { SourceSpan } from '../source/location.js';

export type TemplateBinding =
  | InterpolationBinding
  | { kind: 'event'; eventName: string; handler: string; span: SourceSpan; expressionSpan: SourceSpan }
  | { kind: 'property'; propertyName: string; expression: string; span: SourceSpan; expressionSpan: SourceSpan };

export interface InterpolationBinding {
  kind: 'interpolation';
  expression: string;
  staticParts: string[];
  span: SourceSpan;
  expressionSpan: SourceSpan;
}
```

Update existing test expectations with `toMatchObject()` so they check binding kinds and spans instead of exact object
equality.

- [x] **Step 6: Run template parser tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/template/parse-template.test.ts tests/template/bindings.test.ts
```

Expected: pass.

- [x] **Step 7: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: changed parser, AST, binding, and template test files. Do not stage or commit.

---

## Task 3: Expression Diagnostics And Audit Burn-Down

**Files:**
- Modify: `packages/compiler/src/expressions/rewrite-expression.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/src/template/bindings.ts`
- Test: `packages/compiler/tests/expressions/rewrite-expression.test.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`
- Test: `audits/core/compiler.audit.ts`

- [x] **Step 1: Add failing exact event diagnostic test**

Append to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
it('diagnoses unsupported event expressions with source frame metadata', () => {
  const result = generateComponent({
    metadata,
    nodes: [
      {
        kind: 'element',
        tagName: 'button',
        attributes: [
          {
            name: '(click)',
            value: 'count++',
            span: {
              filePath: 'counter.component.html',
              line: 1,
              column: 9,
              endLine: 1,
              endColumn: 26,
              startOffset: 8,
              endOffset: 25,
            },
            valueSpan: {
              filePath: 'counter.component.html',
              line: 1,
              column: 18,
              endLine: 1,
              endColumn: 25,
              startOffset: 17,
              endOffset: 24,
            },
          },
        ],
        children: [],
        span: {
          filePath: 'counter.component.html',
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 40,
          startOffset: 0,
          endOffset: 39,
        },
      },
    ],
    scopeAttribute: 'data-vr-a1b2c3',
    templatePath: 'counter.component.html',
    templateSource: '<button (click)="count++">Save</button>',
  });

  expect(result.diagnostics).toMatchObject([
    {
      code: 'VR007',
      sourceText: '(click)="count++"',
      suggestion: 'Use a zero-argument component method such as save().',
      docsPath: '/docs/compiler/event-binding',
    },
  ]);
  expect(result.diagnostics[0]?.codeFrame).toContain('(click)="count++"');
});
```

- [x] **Step 2: Run event diagnostic tests and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts
```

Expected: fail because `GenerateComponentInput` does not accept `templateSource` and expression diagnostics do not use
attribute spans.

- [x] **Step 3: Add expression source context**

Modify `packages/compiler/src/expressions/rewrite-expression.ts`:

```ts
import type { SourceSpan } from '../source/location.js';

export interface ExpressionSourceContext {
  filePath: string;
  source: string;
  span: SourceSpan;
}

export function rewriteExpression(
  expression: string,
  context: ExpressionSourceContext,
): RewriteExpressionResult {
  const parsed = parseExpression(expression, context.filePath, 'VR006', context);

  if (parsed.expression === null) {
    return { expression: null, diagnostics: parsed.diagnostics };
  }

  if (containsUnsupportedExpression(parsed.expression)) {
    return unsupportedExpression(context, 'VR006');
  }

  return {
    expression: printExpression(rewriteIdentifiers(parsed.expression), parsed.expression.getSourceFile()),
    diagnostics: [],
  };
}

export function rewriteEventHandlerExpression(
  expression: string,
  context: ExpressionSourceContext,
): RewriteExpressionResult {
  const parsed = parseExpression(expression, context.filePath, 'VR007', context);

  if (parsed.expression === null) {
    return { expression: null, diagnostics: parsed.diagnostics };
  }

  if (!ts.isCallExpression(parsed.expression)) {
    return unsupportedExpression(context, 'VR007');
  }

  if (!ts.isIdentifier(parsed.expression.expression) || parsed.expression.arguments.length > 0) {
    return unsupportedExpression(context, 'VR007');
  }

  return {
    expression: `ctx.${parsed.expression.expression.text}()`,
    diagnostics: [],
  };
}
```

Update helper functions to receive `ExpressionSourceContext` and pass `{ source: context.source, span: context.span }`
to `createDiagnostic()`.

- [x] **Step 4: Pass template source into codegen**

Modify `GenerateComponentInput` in `packages/compiler/src/codegen/generate-component.ts`:

```ts
export interface GenerateComponentInput {
  metadata: ComponentMetadata;
  nodes: readonly TemplateNode[];
  scopeAttribute: string;
  templatePath: string;
  templateSource: string;
}
```

Update `generateText()`, `generatePropertyBinding()`, and `generateEventBinding()` so calls to expression rewriting use:

```ts
{
  filePath: state.templatePath,
  source: state.templateSource,
  span: attribute.span,
}
```

For interpolation, use the interpolation binding expression span from Task 2.

- [x] **Step 5: Update compile pipeline to pass template source**

Modify `packages/compiler/src/api/compile-component.ts` call to `generateComponent()`:

```ts
const generated = generateComponent({
  metadata: metadataResult.metadata,
  nodes: parsedTemplate.nodes,
  scopeAttribute,
  templatePath: source.templatePath,
  templateSource: source.templateSource,
}, options);
```

- [x] **Step 6: Run compiler audit and focused tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/expressions/rewrite-expression.test.ts tests/codegen/generate-component.test.ts
pnpm audit:core
```

Expected: compiler package focused tests pass. `pnpm audit:core` may still fail for 12D and 12E, but the test named
`12C compiler diagnostics and source locations: unsupported event expressions include code frame, suggestion, and docs path`
must pass.

- [x] **Step 7: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: compiler audit burn-down files are changed. Do not stage or commit.

---

## Task 4: Role File Resolver And Component Metadata Diagnostics

**Files:**
- Modify: `packages/compiler/src/conventions/component-files.ts`
- Modify: `packages/compiler/src/metadata/component-metadata.ts`
- Create: `packages/compiler/src/metadata/component-inputs.ts`
- Modify: `packages/compiler/src/index.ts`
- Test: `packages/compiler/tests/conventions/component-files.test.ts`
- Test: `packages/compiler/tests/metadata/component-metadata.test.ts`
- Test: `packages/compiler/tests/metadata/component-inputs.test.ts`

- [x] **Step 1: Add failing role resolver tests**

Append to `packages/compiler/tests/conventions/component-files.test.ts`:

```ts
it('resolves prefix-first UI role files', () => {
  expect(createComponentFileSet('/src/ui/button/ui.button.ts')).toMatchObject({
    componentPath: '/src/ui/button/ui.button.ts',
    templatePath: '/src/ui/button/ui.button.html',
    stylePath: '/src/ui/button/ui.button.css',
    componentBaseName: 'ui',
    expectedClassName: 'UiButton',
  });

  expect(createComponentFileSet('/src/ui/button/primary.button.ts')).toMatchObject({
    componentPath: '/src/ui/button/primary.button.ts',
    templatePath: '/src/ui/button/primary.button.html',
    stylePath: '/src/ui/button/primary.button.css',
    componentBaseName: 'primary',
    expectedClassName: 'PrimaryButton',
  });
});
```

- [x] **Step 2: Add failing metadata diagnostics tests**

Append to `packages/compiler/tests/metadata/component-metadata.test.ts`:

```ts
it('distinguishes default exports from missing named component exports', () => {
  const result = readComponentMetadata(
    {
      componentPath: 'profile-card.component.ts',
      templatePath: 'profile-card.component.html',
      stylePath: 'profile-card.component.css',
      componentBaseName: 'profile-card',
      expectedClassName: 'ProfileCardComponent',
    },
    'export default class ProfileCardComponent {}',
  );

  expect(result.diagnostics).toMatchObject([{ code: 'VR014' }]);
});

it('distinguishes multiple plausible component class exports', () => {
  const result = readComponentMetadata(
    {
      componentPath: 'profile-card.component.ts',
      templatePath: 'profile-card.component.html',
      stylePath: 'profile-card.component.css',
      componentBaseName: 'profile-card',
      expectedClassName: 'ProfileCardComponent',
    },
    [
      'export class ProfileCardComponent {}',
      'export class ProfileCardPage {}',
    ].join('\n'),
  );

  expect(result.diagnostics).toMatchObject([{ code: 'VR015' }]);
});

it('distinguishes required constructor arguments', () => {
  const result = readComponentMetadata(
    {
      componentPath: 'profile-card.component.ts',
      templatePath: 'profile-card.component.html',
      stylePath: 'profile-card.component.css',
      componentBaseName: 'profile-card',
      expectedClassName: 'ProfileCardComponent',
    },
    'export class ProfileCardComponent { constructor(service: unknown) {} }',
  );

  expect(result.diagnostics).toMatchObject([{ code: 'VR016' }]);
});
```

- [x] **Step 3: Add failing input metadata tests**

Create `packages/compiler/tests/metadata/component-inputs.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { readComponentInputs } from '../../src/metadata/component-inputs.js';

describe('component input metadata', () => {
  it('reads required and default signal inputs from component classes', () => {
    const result = readComponentInputs(
      'profile-card.component.ts',
      [
        "import { input } from '@vanrot/runtime';",
        'import type { UserModel } from "./user.model";',
        'export class ProfileCardComponent {',
        '  user = input.required<UserModel>();',
        '  compact = input.default(false);',
        '}',
      ].join('\n'),
      'ProfileCardComponent',
    );

    expect(result).toMatchObject({
      inputs: [
        { name: 'user', required: true, modelName: 'UserModel' },
        { name: 'compact', required: false, defaultExpression: 'false' },
      ],
      diagnostics: [],
    });
  });
});
```

- [x] **Step 4: Run metadata tests and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/conventions/component-files.test.ts tests/metadata/component-metadata.test.ts tests/metadata/component-inputs.test.ts
```

Expected: fail on new role and input metadata behavior.

- [x] **Step 5: Implement resolver and metadata changes**

Modify `packages/compiler/src/conventions/component-files.ts`:

```ts
type ComponentRole = 'component' | 'page' | 'button';
```

Keep `button` role but allow prefix-first names by preserving current `componentBaseName` calculation for any
`*.button.ts` file. Confirm `toPascalCase('primary') + toPascalCase('button')` returns `PrimaryButton`.

Modify `packages/compiler/src/metadata/component-metadata.ts` so diagnostics use:

- `VR014` for default export matching the expected class name.
- `VR015` when more than one exported class name ends with `Component`, `Page`, or `Button`.
- `VR016` when the expected class has required constructor parameters.
- `VR004` when no matching named export exists.

Create `packages/compiler/src/metadata/component-inputs.ts`:

```ts
import * as ts from 'typescript';
import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';

export interface ComponentInputMetadata {
  name: string;
  required: boolean;
  modelName: string;
  defaultExpression: string;
}

export interface ComponentInputsResult {
  inputs: ComponentInputMetadata[];
  diagnostics: CompileDiagnostic[];
}

export function readComponentInputs(
  componentPath: string,
  componentSource: string,
  componentName: string,
): ComponentInputsResult {
  const sourceFile = ts.createSourceFile(componentPath, componentSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const classDeclaration = sourceFile.statements.find((statement): statement is ts.ClassDeclaration => {
    return ts.isClassDeclaration(statement) && statement.name?.text === componentName;
  });

  if (classDeclaration === undefined) {
    return { inputs: [], diagnostics: [] };
  }

  const inputs: ComponentInputMetadata[] = [];
  const diagnostics: CompileDiagnostic[] = [];

  for (const member of classDeclaration.members) {
    if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) {
      continue;
    }

    const initializer = member.initializer;

    if (initializer === undefined || !ts.isCallExpression(initializer)) {
      continue;
    }

    if (!ts.isPropertyAccessExpression(initializer.expression)) {
      continue;
    }

    const receiver = initializer.expression.expression;
    const method = initializer.expression.name.text;

    if (!ts.isIdentifier(receiver) || receiver.text !== 'input') {
      continue;
    }

    if (method === 'required') {
      inputs.push({
        name: member.name.text,
        required: true,
        modelName: initializer.typeArguments?.[0]?.getText(sourceFile) ?? '',
        defaultExpression: '',
      });
      continue;
    }

    if (method === 'default') {
      inputs.push({
        name: member.name.text,
        required: false,
        modelName: '',
        defaultExpression: initializer.arguments[0]?.getText(sourceFile) ?? '',
      });
      continue;
    }

    diagnostics.push(createDiagnostic('VR017', 'error', 'Invalid input declaration.', componentPath));
  }

  return { inputs, diagnostics };
}
```

Export the input reader from `packages/compiler/src/index.ts`.

- [x] **Step 6: Run metadata tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/conventions/component-files.test.ts tests/metadata/component-metadata.test.ts tests/metadata/component-inputs.test.ts
```

Expected: pass.

- [x] **Step 7: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: resolver and metadata files changed. Do not stage or commit.

---

## Task 5: Runtime `input()` Helper

**Files:**
- Create: `packages/runtime/src/inputs/input.ts`
- Create: `packages/runtime/tests/inputs/input.test.ts`
- Modify: `packages/runtime/src/index.ts`
- Test: `packages/runtime/tests/exports/exports.test.ts`

- [x] **Step 1: Add failing runtime input tests**

Create `packages/runtime/tests/inputs/input.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { input } from '../../src/index.js';

describe('input', () => {
  it('creates a default input signal', () => {
    const compact = input.default(false);

    expect(compact()).toBe(false);

    compact.set(true);

    expect(compact()).toBe(true);
  });

  it('creates a required input signal that reports missing reads', () => {
    const user = input.required<{ name: string }>();

    expect(() => user()).toThrow('Required input was read before a value was provided.');

    user.set({ name: 'Ali' });

    expect(user()).toEqual({ name: 'Ali' });
  });
});
```

- [x] **Step 2: Run runtime input tests and verify failure**

Run:

```bash
pnpm --filter @vanrot/runtime test -- tests/inputs/input.test.ts
```

Expected: fail because `input` is not exported.

- [x] **Step 3: Implement minimal input helper**

Create `packages/runtime/src/inputs/input.ts`:

```ts
import { signal } from '../reactive/signal.js';
import type { WritableSignal } from '../reactive/types.js';

export type InputSignal<T> = WritableSignal<T>;

const missingInput = Symbol('vanrot missing input');

export const input = {
  required<T>(): InputSignal<T> {
    const value = signal<T | typeof missingInput>(missingInput);
    const read = (() => {
      const current = value();

      if (current === missingInput) {
        throw new Error('Required input was read before a value was provided.');
      }

      return current;
    }) as InputSignal<T>;

    read.set = (next: T) => value.set(next);
    read.update = (updater: (current: T) => T) => {
      read.set(updater(read()));
    };

    return read;
  },

  default<T>(initialValue: T): InputSignal<T> {
    return signal(initialValue);
  },
};
```

Modify `packages/runtime/src/index.ts`:

```ts
export type { InputSignal } from './inputs/input.js';
export { input } from './inputs/input.js';
```

- [x] **Step 4: Add export coverage**

Append to `packages/runtime/tests/exports/exports.test.ts`:

```ts
it('exports input helpers', async () => {
  const runtime = await import('../../src/index.js');

  expect(runtime.input.required).toBeTypeOf('function');
  expect(runtime.input.default).toBeTypeOf('function');
});
```

- [x] **Step 5: Run runtime tests**

Run:

```bash
pnpm --filter @vanrot/runtime test -- tests/inputs/input.test.ts tests/exports/exports.test.ts
pnpm --filter @vanrot/runtime typecheck
```

Expected: pass.

- [x] **Step 6: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: runtime input helper files changed. Do not stage or commit.

---

## Task 6: Existing Bindings Production Hardening

**Files:**
- Modify: `packages/compiler/src/expressions/rewrite-expression.ts`
- Modify: `packages/compiler/src/template/bindings.ts`
- Modify: `packages/compiler/src/codegen/bindings.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Test: `packages/compiler/tests/expressions/rewrite-expression.test.ts`
- Test: `packages/compiler/tests/template/bindings.test.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`

- [x] **Step 1: Add failing expression policy tests**

Append to `packages/compiler/tests/expressions/rewrite-expression.test.ts`:

```ts
import { createSourceSpan } from '../../src/source/location.js';

const expressionSource = 'count++';
const expressionContext = {
  filePath: 'counter.component.html',
  source: '<p>{{ count++ }}</p>',
  span: createSourceSpan('<p>{{ count++ }}</p>', 'counter.component.html', 3, 16),
};

it('rejects interpolation updates with exact source metadata', () => {
  const result = rewriteExpression(expressionSource, expressionContext);

  expect(result.expression).toBeNull();
  expect(result.diagnostics).toMatchObject([
    {
      code: 'VR006',
      docsPath: '/docs/compiler/expressions',
      sourceText: '{{ count++ }}',
    },
  ]);
});

it('keeps event handlers restricted to zero-argument component methods', () => {
  const result = rewriteEventHandlerExpression('save(user.id)', {
    filePath: 'counter.component.html',
    source: '<button (click)="save(user.id)">Save</button>',
    span: createSourceSpan('<button (click)="save(user.id)">Save</button>', 'counter.component.html', 8, 31),
  });

  expect(result.expression).toBeNull();
  expect(result.diagnostics).toMatchObject([{ code: 'VR007' }]);
});
```

- [x] **Step 2: Run expression tests and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/expressions/rewrite-expression.test.ts
```

Expected: fail until all call sites and tests use the new expression context signature.

- [x] **Step 3: Split binding codegen**

Create `packages/compiler/src/codegen/bindings.ts` and move interpolation, property binding, and event binding generation
from `generate-component.ts` into exported functions:

```ts
export function generateText(node: TextNode, parentName: string, state: GenerateState): void;
export function generateAttribute(attribute: TemplateAttribute, elementName: string, state: GenerateState): void;
export function generatePropertyBinding(
  propertyName: string,
  expression: string,
  attribute: TemplateAttribute,
  elementName: string,
  state: GenerateState,
): void;
export function generateEventBinding(
  eventName: string,
  expression: string,
  attribute: TemplateAttribute,
  elementName: string,
  state: GenerateState,
): void;
```

Create `packages/compiler/src/codegen/state.ts` and move `GenerateState` plus import flags there. The state must include:

```ts
export interface GenerateState {
  ids: IdentifierAllocator;
  lines: string[];
  diagnostics: CompileDiagnostic[];
  features: Set<CompileFeature>;
  mappings: SourceMapping[];
  componentDependencies: ComponentDependency[];
  usesEffect: boolean;
  usesListen: boolean;
  usesRouterOutlet: boolean;
  usesRouteLink: boolean;
  usesCleanupScopes: boolean;
  templatePath: string;
  templateSource: string;
}
```

- [x] **Step 4: Run binding tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/template/bindings.test.ts tests/expressions/rewrite-expression.test.ts tests/codegen/generate-component.test.ts
```

Expected: pass.

- [x] **Step 5: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: binding generation moved into focused files. Do not stage or commit.

---

## Task 7: Scoped CSS Production Behavior

**Files:**
- Modify: `packages/compiler/src/styles/scope-css.ts`
- Test: `packages/compiler/tests/styles/scope-css.test.ts`

- [x] **Step 1: Add failing scoped CSS tests**

Append to `packages/compiler/tests/styles/scope-css.test.ts`:

```ts
it('supports :host and :global selectors', () => {
  const result = scopeCss(
    [
      ':host { display: block; }',
      ':host(.active) { color: red; }',
      ':global(body) { margin: 0; }',
      '.card:hover { color: blue; }',
    ].join('\n'),
    'data-vr-a1b2c3',
    'profile-card.component.css',
  );

  expect(result.diagnostics).toEqual([]);
  expect(result.css).toContain('[data-vr-a1b2c3] { display: block; }');
  expect(result.css).toContain('[data-vr-a1b2c3].active { color: red; }');
  expect(result.css).toContain('body { margin: 0; }');
  expect(result.css).toContain('.card:hover[data-vr-a1b2c3] { color: blue; }');
});

it('reports unscopable selectors with CSS source metadata', () => {
  const result = scopeCss(':host-context(.dark) .card { color: white; }', 'data-vr-a1b2c3', 'x.css');

  expect(result.diagnostics).toMatchObject([
    {
      code: 'VR008',
      docsPath: '/docs/compiler/scoped-css',
    },
  ]);
});
```

- [x] **Step 2: Run scoped CSS tests and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/styles/scope-css.test.ts
```

Expected: fail because `:global(...)` currently reports unsupported and `:host` is not transformed.

- [x] **Step 3: Implement scoped CSS behavior**

Modify `packages/compiler/src/styles/scope-css.ts`:

- Transform `:global(body)` to `body` and skip adding the scope attribute inside that selector.
- Transform `:host` to `[data-vr-a1b2c3]`.
- Transform `:host(.active)` to `[data-vr-a1b2c3].active`.
- Keep scoping normal selectors and selectors inside `@media`.
- Report `VR008` for `:host-context(...)`.

The selector parser function should use guard clauses:

```ts
function scopeSelector(selector: SelectorContainer, scopeAttribute: string): void {
  if (replaceGlobalSelector(selector)) {
    return;
  }

  replaceHostSelector(selector, scopeAttribute);
  scopeNormalCompounds(selector, scopeAttribute);
}
```

- [x] **Step 4: Run scoped CSS tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/styles/scope-css.test.ts
```

Expected: pass.

- [x] **Step 5: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: scoped CSS source and tests changed. Do not stage or commit.

---

## Task 8: `@if` And `@else` Control Flow

**Files:**
- Create: `packages/compiler/src/template/control-flow.ts`
- Create: `packages/compiler/src/codegen/control-flow.ts`
- Modify: `packages/compiler/src/template/ast.ts`
- Modify: `packages/compiler/src/template/parse-template.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Test: `packages/compiler/tests/template/control-flow.test.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`

- [x] **Step 1: Add failing `@if` parser tests**

Create `packages/compiler/tests/template/control-flow.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseTemplate } from '../../src/template/parse-template.js';

describe('template control flow', () => {
  it('parses @if and @else blocks', () => {
    const result = parseTemplate(
      [
        '@if (loggedIn()) {',
        '  <p>Welcome back</p>',
        '} @else {',
        '  <p>Please sign in</p>',
        '}',
      ].join('\n'),
      'home.page.html',
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.nodes).toMatchObject([
      {
        kind: 'if-block',
        expression: 'loggedIn()',
        consequent: [{ kind: 'element', tagName: 'p' }],
        alternate: [{ kind: 'element', tagName: 'p' }],
      },
    ]);
  });
});
```

- [x] **Step 2: Add failing `@if` codegen test**

Append to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
it('generates cleanup-safe @if and @else branches', () => {
  const result = generateComponent({
    metadata,
    nodes: [
      {
        kind: 'if-block',
        expression: 'loggedIn()',
        expressionSpan: {
          filePath: 'home.page.html',
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 16,
          startOffset: 5,
          endOffset: 15,
        },
        consequent: [],
        alternate: [],
        span: {
          filePath: 'home.page.html',
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 31,
          startOffset: 0,
          endOffset: 30,
        },
      },
    ],
    scopeAttribute: 'data-vr-a1b2c3',
    templatePath: 'home.page.html',
    templateSource: '@if (loggedIn()) { } @else { }',
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain("import { effect } from '@vanrot/runtime';");
  expect(result.js).toContain("import { createCleanupScope, disposeCleanupScope, runWithCleanupScope } from '@vanrot/runtime/internal';");
  expect(result.js).toContain('if (ctx.loggedIn())');
  expect(result.metadata.features).toContain('control-flow-if');
});
```

- [x] **Step 3: Run `@if` tests and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/template/control-flow.test.ts tests/codegen/generate-component.test.ts
```

Expected: fail because control-flow nodes and generator do not exist.

- [x] **Step 4: Implement `@if` parsing**

Create `packages/compiler/src/template/control-flow.ts` with:

```ts
import type { ParseTemplateResult } from './parse-template.js';
import type { IfBlockNode, TemplateNode } from './ast.js';
import { createSourceSpan } from '../source/location.js';

export type HtmlFragmentParser = (
  source: string,
  templatePath: string,
  offsetBase: number,
) => ParseTemplateResult;

export function parseControlFlowTemplate(
  templateSource: string,
  templatePath: string,
  parseHtmlFragment: HtmlFragmentParser,
): ParseTemplateResult {
  const ifMatch = /^@if\s*\(([^)]+)\)\s*\{([\s\S]*)\}\s*@else\s*\{([\s\S]*)\}\s*$/.exec(templateSource.trim());

  if (ifMatch !== null) {
    const expression = ifMatch[1]?.trim() ?? '';
    const consequentSource = ifMatch[2] ?? '';
    const alternateSource = ifMatch[3] ?? '';
    const consequent = parseHtmlFragment(consequentSource, templatePath, templateSource.indexOf(consequentSource));
    const alternate = parseHtmlFragment(alternateSource, templatePath, templateSource.indexOf(alternateSource));
    const expressionStart = templateSource.indexOf(expression);
    const node: IfBlockNode = {
      kind: 'if-block',
      expression,
      expressionSpan: createSourceSpan(templateSource, templatePath, expressionStart, expressionStart + expression.length),
      consequent: consequent.nodes,
      alternate: alternate.nodes,
      span: createSourceSpan(templateSource, templatePath, 0, templateSource.length),
    };

    return {
      nodes: [node],
      diagnostics: [...consequent.diagnostics, ...alternate.diagnostics],
    };
  }

  return parseHtmlFragment(templateSource, templatePath, 0);
}
```

The first implementation may support top-level control-flow blocks. Nested control-flow is covered in the integration
task after codegen can recurse through `TemplateNode`.

- [x] **Step 5: Implement `@if` codegen**

Create `packages/compiler/src/codegen/control-flow.ts`:

```ts
import { rewriteExpression } from '../expressions/rewrite-expression.js';
import type { IfBlockNode } from '../template/ast.js';
import type { GenerateState } from './state.js';
import { generateNode } from './generate-component.js';

export function generateIfBlock(
  node: IfBlockNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  const markerName = state.ids.next('ifMarker');
  const scopeName = state.ids.next('ifScope');
  const fragmentName = state.ids.next('ifFragment');
  const rewritten = rewriteExpression(node.expression, {
    filePath: state.templatePath,
    source: state.templateSource,
    span: node.expressionSpan,
  });

  state.diagnostics.push(...rewritten.diagnostics);

  if (rewritten.expression === null) {
    return;
  }

  state.usesEffect = true;
  state.usesCleanupScopes = true;
  state.features.add('control-flow-if');
  state.lines.push(`  const ${markerName} = document.createComment('vr-if');`);
  state.lines.push(`  ${parentName}.append(${markerName});`);
  state.lines.push(`  let ${scopeName} = null;`);
  state.lines.push('  effect(() => {');
  state.lines.push(`    if (${scopeName} !== null) { disposeCleanupScope(${scopeName}); ${scopeName} = null; }`);
  state.lines.push(`    ${scopeName} = createCleanupScope();`);
  state.lines.push(`    const ${fragmentName} = document.createDocumentFragment();`);
  state.lines.push(`    runWithCleanupScope(${scopeName}, () => {`);
  state.lines.push(`      if (${rewritten.expression}) {`);

  for (const child of node.consequent) {
    generateNode(child, fragmentName, scopeAttribute, state);
  }

  state.lines.push('      } else {');

  for (const child of node.alternate) {
    generateNode(child, fragmentName, scopeAttribute, state);
  }

  state.lines.push('      }');
  state.lines.push('    });');
  state.lines.push(`    ${markerName}.after(${fragmentName});`);
  state.lines.push('  });');
}
```

Update `generateNode()` so `node.kind === 'if-block'` delegates to `generateIfBlock()`.

- [x] **Step 6: Run `@if` tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/template/control-flow.test.ts tests/codegen/generate-component.test.ts
```

Expected: pass for `@if`.

- [x] **Step 7: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: control-flow parser and codegen files changed. Do not stage or commit.

---

## Task 9: `@for` And `@empty` Control Flow

**Files:**
- Modify: `packages/compiler/src/template/control-flow.ts`
- Modify: `packages/compiler/src/codegen/control-flow.ts`
- Test: `packages/compiler/tests/template/control-flow.test.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`

- [x] **Step 1: Add failing `@for` parser test**

Append to `packages/compiler/tests/template/control-flow.test.ts`:

```ts
it('parses @for and @empty blocks with required track expression', () => {
  const result = parseTemplate(
    [
      '@for (user of users(); track user.id) {',
      '  <p>{{ user.name }}</p>',
      '} @empty {',
      '  <p>No users yet</p>',
      '}',
    ].join('\n'),
    'home.page.html',
  );

  expect(result.diagnostics).toEqual([]);
  expect(result.nodes).toMatchObject([
    {
      kind: 'for-block',
      itemName: 'user',
      iterableExpression: 'users()',
      trackExpression: 'user.id',
      body: [{ kind: 'element', tagName: 'p' }],
      empty: [{ kind: 'element', tagName: 'p' }],
    },
  ]);
});
```

- [x] **Step 2: Add failing missing-track diagnostic test**

Append to `packages/compiler/tests/template/control-flow.test.ts`:

```ts
it('diagnoses @for blocks without track expressions', () => {
  const result = parseTemplate('@for (user of users()) { <p>{{ user.name }}</p> }', 'home.page.html');

  expect(result.diagnostics).toMatchObject([
    {
      code: 'VR011',
      suggestion: 'Use @for (item of items(); track item.id) { ... } with a required track expression.',
    },
  ]);
});
```

- [x] **Step 3: Add failing `@for` codegen test**

Append to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
it('generates keyed @for loops with empty branches', () => {
  const result = compileComponent({
    componentPath: 'home.page.ts',
    componentSource: 'export class HomePage { users() { return [{ id: 1, name: "Ali" }]; } }',
    templatePath: 'home.page.html',
    templateSource: '@for (user of users(); track user.id) { <p>{{ user.name }}</p> } @empty { <p>No users yet</p> }',
    stylePath: 'home.page.css',
    styleSource: 'p { color: red; }',
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain('const forItems');
  expect(result.js).toContain('const forKey');
  expect(result.js).toContain('ctx.users()');
  expect(result.metadata.features).toContain('control-flow-for');
});
```

- [x] **Step 4: Run `@for` tests and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/template/control-flow.test.ts tests/codegen/generate-component.test.ts
```

Expected: fail because `@for` parser and generator are not implemented.

- [x] **Step 5: Implement `@for` parsing**

Update `parseControlFlowTemplate()` to match:

```txt
@for (item of iterableExpression; track trackExpression) { body } @empty { empty }
```

Create `ForBlockNode` values with `VR011` diagnostics when:

- `itemName` is missing.
- `of` is missing.
- `track` is missing.
- the body block is missing.

- [x] **Step 6: Implement `@for` codegen**

Add `generateForBlock()` to `packages/compiler/src/codegen/control-flow.ts`. It must:

- rewrite `iterableExpression` with normal expression rules;
- evaluate each item in an effect;
- compute each key from `trackExpression`;
- keep a `Map` from key to `{ scope, nodes }`;
- dispose removed item scopes;
- render `@empty` when the array is empty;
- add feature `control-flow-for`.

The generated code should import cleanup helpers from `@vanrot/runtime/internal` and use `effect()` from
`@vanrot/runtime`.

- [x] **Step 7: Run `@for` tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/template/control-flow.test.ts tests/codegen/generate-component.test.ts
```

Expected: pass for `@if`, `@else`, `@for`, and `@empty`.

- [x] **Step 8: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: control-flow files changed. Do not stage or commit.

---

## Task 10: Child Components And Input Bindings

**Files:**
- Create: `packages/compiler/src/codegen/components.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/api/compile-component.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`
- Test: `packages/compiler/tests/integration/compiler-production.test.ts`

- [x] **Step 1: Add failing child component integration test**

Create `packages/compiler/tests/integration/compiler-production.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { compileComponent } from '../../src/index.js';

describe('compiler production integration', () => {
  it('records child component dependencies and parent input bindings', () => {
    const result = compileComponent({
      componentPath: 'home.page.ts',
      componentSource: [
        'export class HomePage {',
        '  selectedUser() { return { name: "Ali" }; }',
        '  isCompact() { return false; }',
        '}',
      ].join('\n'),
      templatePath: 'home.page.html',
      templateSource: '<profile-card [user]="selectedUser()" [compact]="isCompact()"></profile-card>',
      stylePath: 'home.page.css',
      styleSource: 'profile-card { display: block; }',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.metadata.componentDependencies).toMatchObject([
      {
        tagName: 'profile-card',
        componentName: 'ProfileCardComponent',
        inputs: [
          { name: 'user', expression: 'selectedUser()' },
          { name: 'compact', expression: 'isCompact()' },
        ],
      },
    ]);
    expect(result.js).toContain('createProfileCardComponent');
    expect(result.metadata.features).toContain('child-component');
  });
});
```

- [x] **Step 2: Run child component test and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/integration/compiler-production.test.ts
```

Expected: fail because `metadata.componentDependencies` and child component codegen do not exist.

- [x] **Step 3: Add dependency metadata types**

Modify `packages/compiler/src/api/types.ts`:

```ts
export interface ComponentDependencyInput {
  name: string;
  expression: string;
}

export interface ComponentDependency {
  tagName: string;
  componentName: string;
  importPath: string;
  inputs: ComponentDependencyInput[];
}
```

Extend `CompileResult.metadata`:

```ts
metadata: {
  componentName: string;
  scopeAttribute: string;
  features: CompileFeature[];
  componentDependencies: ComponentDependency[];
  mappings: SourceMapping[];
};
```

- [x] **Step 4: Implement child component codegen**

Create `packages/compiler/src/codegen/components.ts`:

```ts
import type { ElementNode } from '../template/ast.js';
import type { GenerateState } from './state.js';

export function isChildComponentTag(tagName: string): boolean {
  return /^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(tagName) && !tagName.startsWith('vr-');
}

export function toComponentName(tagName: string): string {
  return `${tagName
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join('')}Component`;
}

export function generateChildComponent(
  node: ElementNode,
  parentName: string,
  state: GenerateState,
): void {
  const componentName = toComponentName(node.tagName);
  const instanceName = state.ids.next(componentName[0]?.toLowerCase() + componentName.slice(1));
  const inputAttributes = node.attributes.filter((attribute) => /^\[([^\]]+)\]$/.test(attribute.name));

  state.features.add('child-component');
  state.componentDependencies.push({
    tagName: node.tagName,
    componentName,
    importPath: `./${node.tagName}/${node.tagName}.component.js`,
    inputs: inputAttributes.map((attribute) => ({
      name: attribute.name.slice(1, -1),
      expression: attribute.value,
    })),
  });
  state.lines.push(`  const ${instanceName} = create${componentName}();`);

  for (const attribute of inputAttributes) {
    const inputName = attribute.name.slice(1, -1);
    state.lines.push(`  effect(() => { ${instanceName}.ctx.${inputName}.set(ctx.${attribute.value}); });`);
  }

  state.lines.push(`  ${parentName}.append(${instanceName}.node);`);
}
```

Wire `generateElement()` so child component tags delegate before normal HTML elements.

- [x] **Step 5: Run child component tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/integration/compiler-production.test.ts tests/codegen/generate-component.test.ts
```

Expected: pass for child component metadata and generated output assertions.

- [x] **Step 6: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: child component codegen files changed. Do not stage or commit.

---

## Task 11: Slots And Slot Projection

**Files:**
- Create: `packages/compiler/src/codegen/slots.ts`
- Modify: `packages/compiler/src/template/parse-template.ts`
- Modify: `packages/compiler/src/template/ast.ts`
- Modify: `packages/compiler/src/codegen/components.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Test: `packages/compiler/tests/template/parse-template.test.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`
- Test: `packages/compiler/tests/integration/compiler-production.test.ts`

- [x] **Step 1: Add failing slot parser test**

Append to `packages/compiler/tests/template/parse-template.test.ts`:

```ts
it('parses named slot receivers and parent slot attributes', () => {
  const result = parseTemplate(
    '<profile-card><h2 slot.title>Owner</h2></profile-card><slot.actions><button>Edit</button></slot.actions>',
    'profile-card.component.html',
  );

  expect(result.diagnostics).toEqual([]);
  expect(result.nodes).toMatchObject([
    {
      kind: 'element',
      tagName: 'profile-card',
      children: [
        {
          kind: 'element',
          tagName: 'h2',
          attributes: [{ name: 'slot.title' }],
        },
      ],
    },
    {
      kind: 'slot-outlet',
      name: 'actions',
      fallback: [{ kind: 'element', tagName: 'button' }],
    },
  ]);
});
```

- [x] **Step 2: Add failing slot codegen test**

Append to `packages/compiler/tests/integration/compiler-production.test.ts`:

```ts
it('generates named slots with fallback content', () => {
  const result = compileComponent({
    componentPath: 'profile-card.component.ts',
    componentSource: 'export class ProfileCardComponent {}',
    templatePath: 'profile-card.component.html',
    templateSource: '<article><slot.title><h2>Fallback</h2></slot.title><slot /></article>',
    stylePath: 'profile-card.component.css',
    styleSource: 'article { display: block; }',
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain('renderSlot');
  expect(result.metadata.features).toContain('slot');
});
```

- [x] **Step 3: Run slot tests and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/template/parse-template.test.ts tests/integration/compiler-production.test.ts
```

Expected: fail because `slot-outlet` nodes and slot codegen do not exist.

- [x] **Step 4: Implement slot parsing**

Modify `convertNode()` in `packages/compiler/src/template/parse-template.ts`:

- If `node.tagName === 'slot'`, return `SlotOutletNode` with `name: 'default'`.
- If `node.tagName` matches `slot.${name}`, return `SlotOutletNode` with that name.
- Preserve fallback children on the slot outlet.
- Keep parent slot attributes such as `slot.title` as normal attributes on projected child nodes.

- [x] **Step 5: Implement slot codegen**

Create `packages/compiler/src/codegen/slots.ts`:

```ts
import type { SlotOutletNode } from '../template/ast.js';
import type { GenerateState } from './state.js';
import { generateNode } from './generate-component.js';

export function generateSlotOutlet(
  node: SlotOutletNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  const slotName = node.name === 'default' ? 'default' : node.name;
  const fallbackName = state.ids.next('slotFallback');

  state.features.add('slot');
  state.lines.push(`  const ${fallbackName} = document.createDocumentFragment();`);

  for (const child of node.fallback) {
    generateNode(child, fallbackName, scopeAttribute, state);
  }

  state.lines.push(`  renderSlot(${parentName}, ${JSON.stringify(slotName)}, ${fallbackName});`);
}
```

Track `usesSlots` in `GenerateState` and emit a generated local helper:

```ts
function renderSlot(parent, name, fallback) {
  parent.append(fallback);
}
```

This helper renders fallback content in Phase 12C. Parent-to-child projected content metadata is recorded in child
component dependencies for the future Vite/TypeScript boundary.

- [x] **Step 6: Run slot tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/template/parse-template.test.ts tests/integration/compiler-production.test.ts tests/codegen/generate-component.test.ts
```

Expected: pass.

- [x] **Step 7: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: slot parser and codegen files changed. Do not stage or commit.

---

## Task 12: Source-Map-Ready Mappings And Compile Metadata

**Files:**
- Create: `packages/compiler/src/codegen/mappings.ts`
- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/codegen/state.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/src/api/compile-component.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`
- Test: `packages/compiler/tests/api/compile-component.test.ts`

- [x] **Step 1: Add failing mapping metadata test**

Append to `packages/compiler/tests/api/compile-component.test.ts`:

```ts
it('returns source-map-ready mappings for generated template output', () => {
  const result = compileComponent({
    componentPath: 'counter.component.ts',
    componentSource: 'export class CounterComponent { count() { return 1; } }',
    templatePath: 'counter.component.html',
    templateSource: '<p>Count: {{ count() }}</p>',
    stylePath: 'counter.component.css',
    styleSource: 'p { color: red; }',
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.metadata.mappings).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        sourceFilePath: 'counter.component.html',
        sourceLine: 1,
        sourceColumn: 1,
        generatedFile: 'js',
      }),
    ]),
  );
});
```

- [x] **Step 2: Run mapping test and verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/api/compile-component.test.ts
```

Expected: fail because `metadata.mappings` does not exist.

- [x] **Step 3: Add mapping types**

Modify `packages/compiler/src/api/types.ts`:

```ts
export type GeneratedFileKind = 'js' | 'css';

export interface SourceMapping {
  generatedFile: GeneratedFileKind;
  generatedLine: number;
  generatedColumn: number;
  sourceFilePath: string;
  sourceLine: number;
  sourceColumn: number;
}
```

Create `packages/compiler/src/codegen/mappings.ts`:

```ts
import type { SourceMapping } from '../api/types.js';
import type { SourceSpan } from '../source/location.js';

export function createGeneratedMapping(
  generatedFile: SourceMapping['generatedFile'],
  generatedLine: number,
  generatedColumn: number,
  span: SourceSpan,
): SourceMapping {
  return {
    generatedFile,
    generatedLine,
    generatedColumn,
    sourceFilePath: span.filePath,
    sourceLine: span.line,
    sourceColumn: span.column,
  };
}
```

- [x] **Step 4: Record mappings in codegen**

Whenever `GenerateState.lines.push()` adds generated code for a template node, add a mapping with that node's `span`.

Keep the mapping simple for Phase 12C:

```ts
state.mappings.push(createGeneratedMapping('js', state.lines.length + 1, 1, node.span));
```

For CSS, update `scopeCss()` result to include `mappings: SourceMapping[]` for each scoped rule that has source
information available from PostCSS.

- [x] **Step 5: Return mappings from compile result**

Modify `packages/compiler/src/api/compile-component.ts`:

```ts
metadata: {
  componentName: metadataResult.metadata.componentName,
  scopeAttribute,
  features: featureOrder.filter((feature) => features.has(feature)),
  componentDependencies: generated.componentDependencies,
  mappings: [...generated.mappings, ...scopedCss.mappings],
}
```

- [x] **Step 6: Run mapping tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/api/compile-component.test.ts tests/codegen/generate-component.test.ts tests/styles/scope-css.test.ts
```

Expected: pass.

- [x] **Step 7: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: mapping files and compile API changed. Do not stage or commit.

---

## Task 13: End-To-End Compiler Production Fixture

**Files:**
- Modify: `packages/compiler/tests/integration/compiler-production.test.ts`
- Modify: `audits/core/compiler.audit.ts`
- Test: root audit lane

- [x] **Step 1: Add full fixture test**

Append to `packages/compiler/tests/integration/compiler-production.test.ts`:

```ts
it('compiles a production component using inputs, control flow, children, slots, and scoped CSS', () => {
  const result = compileComponent({
    componentPath: 'home.page.ts',
    componentSource: [
      "import { computed, signal } from '@vanrot/runtime';",
      'export class HomePage {',
      '  users = signal([{ id: 1, name: "Ali", email: "ali@example.test" }]);',
      '  selectedUser = computed(() => this.users()[0]);',
      '  loggedIn = computed(() => this.users().length > 0);',
      '  editUser(): void {}',
      '}',
    ].join('\n'),
    templatePath: 'home.page.html',
    templateSource: [
      '@if (loggedIn()) {',
      '  <profile-card [user]="selectedUser()">',
      '    <h2 slot.title>Account owner</h2>',
      '    @for (user of users(); track user.id) {',
      '      <p>{{ user.name }}</p>',
      '    } @empty {',
      '      <p>No users yet</p>',
      '    }',
      '    <vr-button slot.actions (click)="editUser()">Edit</vr-button>',
      '  </profile-card>',
      '} @else {',
      '  <p>Please sign in</p>',
      '}',
    ].join('\n'),
    stylePath: 'home.page.css',
    styleSource: [
      ':host { display: block; }',
      '.card:hover { color: var(--vr-color-accent); }',
      ':global(body) { margin: 0; }',
    ].join('\n'),
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.metadata.features).toEqual(
    expect.arrayContaining([
      'control-flow-if',
      'control-flow-for',
      'child-component',
      'slot',
      'scoped-css',
      'ui-button',
    ]),
  );
  expect(result.metadata.mappings.length).toBeGreaterThan(0);
  expect(result.css).toContain('[data-vr-');
});
```

- [x] **Step 2: Run integration fixture and verify failure or pass**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/integration/compiler-production.test.ts
```

Expected: pass if Tasks 1 through 12 are complete. If it fails, fix the failing compiler stage named in the assertion or
stack trace before continuing.

- [x] **Step 3: Run compiler audit**

Run:

```bash
pnpm audit:core
```

Expected: 12C compiler audit passes. The command may still exit non-zero for:

```txt
12D Vite dev/build/HMR hardening
12E TypeScript contracts and maturity gates
```

There must be no remaining failure containing:

```txt
12C compiler diagnostics and source locations
```

- [x] **Step 4: Local checkpoint**

Run:

```bash
git status --short --branch
```

Expected: integration fixture files changed. Do not stage or commit.

---

## Task 14: Documentation, Maturity, And Final Verification

**Files:**
- Modify: `docs/superpowers/plans/Phase-12C.md`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`

- [x] **Step 1: Update feature maturity rows**

In `docs/superpowers/feature-maturity.md`, mark these verified compiler rows `Production-Ready` after all tests pass:

- Compiler file convention resolver
- Compiler component class detection
- Compiler text interpolation `{{ }}`
- Compiler event binding `(event)`
- Compiler property binding `[property]`
- Compiler expression rewriting
- Compiler `@if` conditionals
- Compiler `@for` loops
- Compiler child components
- Compiler slots
- Compiler scoped CSS
- Compiler readable generated output
- Compiler source maps
- Compiler production diagnostics

Do not mark these rows production-ready in Phase 12C:

- Component module TypeScript typing
- Compiler i18n extraction
- Vite true HMR
- Vite diagnostics overlay bridge if the custom overlay itself was not implemented

- [x] **Step 2: Update final TDD inventory**

In `docs/superpowers/final-tdd-inventory.md`, update compiler rows so Phase 26 knows Phase 12C added production coverage
for:

- source locations;
- production diagnostics;
- existing binding features;
- scoped CSS;
- control flow;
- child components;
- slots;
- source-map-ready mapping metadata.

- [x] **Step 3: Update presentation roadmap**

In `docs/vanrot-presentation.html`, update the roadmap copy so Phase 12C is shown complete and Phase 12D is next. Use
language equivalent to:

```txt
12C compiler hardening complete; 12D Vite HMR next
```

- [x] **Step 4: Check all completed boxes in this plan**

Check every completed task box in `docs/superpowers/plans/Phase-12C.md`. Leave unchecked only work that truly did not
ship.

- [x] **Step 5: Run final verification**

Run:

```bash
pnpm --filter @vanrot/compiler test
pnpm --filter @vanrot/compiler typecheck
pnpm --filter @vanrot/compiler build
pnpm --filter @vanrot/runtime test
pnpm audit:core
pnpm verify
```

Expected:

- Compiler test, typecheck, and build pass.
- Runtime tests pass.
- `pnpm audit:core` has no 12C compiler failure. It may still fail only for 12D and 12E.
- `pnpm verify` passes. If `pnpm verify` fails because `audit:core` is intentionally separate, report the exact failing
  command and output.

- [x] **Step 6: Final local status**

Run:

```bash
git status --short --branch
```

Expected: working tree contains Phase 12C implementation and docs changes. Do not stage or commit unless the user asks.

---

## Self-Review

### Spec Coverage

- Rich diagnostics and source locations: Tasks 1, 2, and 3.
- Role-file resolver and component class diagnostics: Task 4.
- `input.required<UserModel>()` and `input.default(false)`: Tasks 4, 5, and 10.
- Existing interpolation, property binding, event binding, and expression rules: Tasks 3 and 6.
- Scoped CSS with `:host`, `:global(...)`, pseudo classes, and `@media`: Task 7.
- `@if` and `@else`: Task 8.
- `@for` and `@empty`: Task 9.
- Child components and parent-to-child input bindings: Task 10.
- `slot.name` and `<slot.name>`: Task 11.
- Source-map-ready mappings: Task 12.
- End-to-end production fixture and audit burn-down: Task 13.
- Maturity ledger, final TDD inventory, and presentation: Task 14.

### Open Marker Scan

The plan has no deferred work markers in implementation steps. Future syntax such as `@switch`, `@await`, and `@defer`
remains in `docs/superpowers/feature-maturity.md`, outside this implementation plan.

### Type Consistency

- `SourceSpan`, `CompileDiagnostic`, `ComponentDependency`, `SourceMapping`, and `InputSignal` are introduced before
  later tasks depend on them.
- `GenerateState` owns `mappings`, `componentDependencies`, and import flags before control-flow, component, and slot
  codegen tasks use them.
- `input.required<T>()` and `input.default(value)` match the approved Phase 12C syntax.
