# Vanrot IntelliJ Plugin — M4 Expression Binding Smarts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (no subagents — CLAUDE.md). Checkbox steps.
>
> **Git policy:** User owns git. **Checkpoint** = stop + summarize; never `git add/commit/push`.
>
> **Depends on:** M0–M3. Reuses `spanToRange`/`offsetAt`, the component/file resolution, and the diagnostics push channel.

**Goal:** Inside template expressions (`{{ expr }}`, property bindings, event handlers, `if`/`for` expressions), provide member completion, hover types, type errors, and safe rename — resolved against the component class. This is the technique Angular Language Service and Volar use: compile each template into a **virtual TypeScript document** where each expression lives in the component-class scope, then drive a TS `LanguageService` over it and map results back to template ranges.

**Architecture:** `enumerateExpressions` collects every template expression + its `expressionSpan` (via the compiler's `extractTemplateBindings`). `buildVirtualDocument` emits a TS file = the original component source + a generated function whose body references the component instance (`ctx`) and embeds each expression, while recording a **position map** between template offsets and virtual-file offsets. A `VirtualLanguageService` wraps `ts.createLanguageService` over an in-memory host serving the component file + the virtual file. Feature handlers translate an LSP request position → virtual offset → TS query → results mapped back to template ranges. The Kotlin plugin is unchanged.

> **Risk note (from the design spec):** M4 is the hard milestone — the virtual-TS mapping is intricate. It is sequenced last and behind M0–M3 value. This plan delivers a working **expression-granular** mapping with documented limitations, and lands features incrementally (hover/types first, completion next, rename last) so partial value ships even if rename proves costly.

**Tech Stack:** TypeScript compiler API (`ts.createLanguageService`, `LanguageServiceHost`), `@vanrot/compiler` (`extractTemplateBindings`, `parseTemplate`, `expressionGlobals`), `vscode-languageserver`, vitest TDD.

---

## File Structure

- `packages/language-server/src/expressions/enumerate.ts` — `enumerateExpressions(source)` → `TemplateExpression[]`.
- `packages/language-server/src/expressions/virtual-document.ts` — `buildVirtualDocument(componentSource, className, expressions)` → `{ text, map }`.
- `packages/language-server/src/expressions/position-map.ts` — `PositionMap` (template offset ↔ virtual offset) + lookups.
- `packages/language-server/src/expressions/language-service.ts` — in-memory `ts.LanguageService` factory over component + virtual files.
- `packages/language-server/src/features/expression-completion.ts`, `expression-hover.ts`, `expression-diagnostics.ts`, `expression-rename.ts`.
- Modify `packages/language-server/src/server.ts` — route requests inside expressions to these handlers; merge expression diagnostics with M3 compiler diagnostics.

---

## Task 1: Enumerate template expressions

**Files:**
- Create: `packages/language-server/src/expressions/enumerate.ts`
- Test: `packages/language-server/tests/enumerate.test.ts`

- [ ] **Step 1: Failing test**

`packages/language-server/tests/enumerate.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { enumerateExpressions } from '../src/expressions/enumerate.js';

describe('enumerateExpressions', () => {
  it('collects interpolation expressions with spans', () => {
    const list = enumerateExpressions('<p>{{ user.name }}</p>');
    expect(list).toHaveLength(1);
    expect(list[0]?.expression).toBe('user.name');
    expect(list[0]?.span.startOffset).toBeGreaterThan(0);
  });

  it('collects property and event binding expressions', () => {
    const list = enumerateExpressions('<button (click)="save()" [disabled]="busy">x</button>');
    expect(list.map((entry) => entry.expression).sort()).toEqual(['busy', 'save()']);
  });
});
```
> Verify the compiler's binding attribute syntax: confirm property bindings are `[prop]="expr"` and events `(event)="handler"` by reading `packages/compiler/src/template/bindings.ts` / codegen. If vanrot uses a different syntax, correct the test markup to the real one — the contract (every expression + its `expressionSpan`) is fixed.

- [ ] **Step 2: Run — expect FAIL.**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/enumerate.test.ts`

- [ ] **Step 3: Implement (wrap `extractTemplateBindings`)**

`packages/language-server/src/expressions/enumerate.ts`:
```ts
import { extractTemplateBindings, parseTemplate, type SourceSpan } from '@vanrot/compiler';

export interface TemplateExpression {
  expression: string;
  span: SourceSpan;
}

export function enumerateExpressions(source: string): TemplateExpression[] {
  const parsed = parseTemplate(source, 'template.html');
  const { bindings } = extractTemplateBindings(parsed.nodes, 'template.html');
  const expressions: TemplateExpression[] = [];
  for (const binding of bindings) {
    if (binding.kind === 'interpolation') {
      expressions.push({ expression: binding.expression, span: binding.expressionSpan });
    }
    if (binding.kind === 'property') {
      expressions.push({ expression: binding.expression, span: binding.expressionSpan });
    }
    if (binding.kind === 'event') {
      expressions.push({ expression: binding.handler, span: binding.expressionSpan });
    }
  }
  return expressions;
}
```
> Also fold in `if-block`/`for-block` expressions: walk `parsed.nodes` and push `node.expression`/`node.iterableExpression` with `node.expressionSpan`. Add a test for `{#if ready}` once the real control-flow template syntax is confirmed from the compiler tests.

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 2: Position map

**Files:**
- Create: `packages/language-server/src/expressions/position-map.ts`
- Test: `packages/language-server/tests/position-map.test.ts`

A list of segments, each mapping a template offset range to a virtual offset range of equal length (expressions are embedded verbatim, so within a segment offsets shift by a constant delta).

- [ ] **Step 1: Failing test**

`packages/language-server/tests/position-map.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { PositionMap } from '../src/expressions/position-map.js';

describe('PositionMap', () => {
  it('maps template offset to virtual offset within a segment', () => {
    const map = new PositionMap([{ templateStart: 5, virtualStart: 100, length: 9 }]);
    expect(map.toVirtual(5)).toBe(100);
    expect(map.toVirtual(8)).toBe(103);
    expect(map.toVirtual(14)).toBe(109);
  });

  it('maps virtual offset back to template offset', () => {
    const map = new PositionMap([{ templateStart: 5, virtualStart: 100, length: 9 }]);
    expect(map.toTemplate(103)).toBe(8);
  });

  it('returns null outside any segment', () => {
    const map = new PositionMap([{ templateStart: 5, virtualStart: 100, length: 9 }]);
    expect(map.toVirtual(2)).toBeNull();
    expect(map.toTemplate(50)).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

`packages/language-server/src/expressions/position-map.ts`:
```ts
export interface MapSegment {
  templateStart: number;
  virtualStart: number;
  length: number;
}

export class PositionMap {
  constructor(private readonly segments: readonly MapSegment[]) {}

  toVirtual(templateOffset: number): number | null {
    for (const segment of this.segments) {
      const end = segment.templateStart + segment.length;
      if (templateOffset >= segment.templateStart && templateOffset <= end) {
        return segment.virtualStart + (templateOffset - segment.templateStart);
      }
    }
    return null;
  }

  toTemplate(virtualOffset: number): number | null {
    for (const segment of this.segments) {
      const end = segment.virtualStart + segment.length;
      if (virtualOffset >= segment.virtualStart && virtualOffset <= end) {
        return segment.templateStart + (virtualOffset - segment.virtualStart);
      }
    }
    return null;
  }
}
```

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 3: Build the virtual TS document

**Files:**
- Create: `packages/language-server/src/expressions/virtual-document.ts`
- Test: `packages/language-server/tests/virtual-document.test.ts`

Emit the component source unchanged, then a generated function that binds `ctx` to the component instance and embeds each expression verbatim, recording a segment per expression. Bare member access resolves because each expression is evaluated as `ctx.<expr-with-prefixed-identifiers>` — but to keep offsets exact (verbatim embedding), M4 embeds the expression inside a `with`-free typed scope using a leading destructure of `ctx`.

> **Design decision (offset fidelity vs. identifier resolution):** Embedding verbatim keeps the position map a simple constant-delta per segment. To make bare identifiers (`user`, `count`) resolve to instance members without rewriting them (which would break offsets), the virtual document destructures the instance's members into locals at the top of the generated function: `const { ...members } = ctx;` is not type-safe for completion. Instead emit one local `const __m = ctx;` and prefix is avoided by referencing members through a `with`-like pattern unavailable in TS. **Therefore M4 uses the established Volar approach: embed each expression as `ctx.(<expr>)` is rejected; instead emit `;(<expr>);` inside a function that declares the instance members as in-scope via `type`-level mapping.** Concretely, generate:
> ```ts
> function __vrTpl(ctx: __VrInstance) {
>   const { /* destructured names */ } = ctx;
>   ;(EXPR);
> }
> ```
> where the destructured names are the component's public members (from `readComponentInputs` + class members). Destructuring brings members into local scope at their verbatim names, so `user.name` resolves and the embedded expression offsets are preserved. Members are enumerated from the class; unknown identifiers correctly surface as type errors (the desired diagnostic).

- [ ] **Step 1: Failing test**

`packages/language-server/tests/virtual-document.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { buildVirtualDocument } from '../src/expressions/virtual-document.js';

const componentSource = `export class XComponent {\n  user = { name: 'a' };\n}\n`;

describe('buildVirtualDocument', () => {
  it('embeds each expression verbatim and maps its offset', () => {
    const expr = { expression: 'user.name', span: span(3, 12) }; // startOffset 3, endOffset 12
    const result = buildVirtualDocument(componentSource, 'XComponent', [expr]);
    expect(result.text).toContain('user.name');
    const virtualOffset = result.map.toVirtual(3);
    expect(virtualOffset).not.toBeNull();
    expect(result.text.slice(virtualOffset!, virtualOffset! + 9)).toBe('user.name');
  });
});
function span(startOffset: number, endOffset: number) {
  return { filePath: '', line: 1, column: 1, endLine: 1, endColumn: 1, startOffset, endOffset };
}
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

`packages/language-server/src/expressions/virtual-document.ts`:
```ts
import { PositionMap, type MapSegment } from './position-map.js';
import { collectInstanceMemberNames } from './members.js';
import type { TemplateExpression } from './enumerate.js';

export interface VirtualDocument {
  text: string;
  map: PositionMap;
}

export function buildVirtualDocument(
  componentSource: string,
  className: string,
  expressions: readonly TemplateExpression[],
): VirtualDocument {
  const members = collectInstanceMemberNames(componentSource, className);
  const destructure = members.length > 0 ? `  const { ${members.join(', ')} } = ctx;\n` : '';
  const header = `${componentSource}\n` +
    `type __VrInstance = InstanceType<typeof ${className}>;\n` +
    `function __vrTpl(ctx: __VrInstance) {\n${destructure}`;

  const segments: MapSegment[] = [];
  let body = '';
  for (const expression of expressions) {
    const prefix = '  ;(';
    const virtualStart = header.length + body.length + prefix.length;
    segments.push({
      templateStart: expression.span.startOffset,
      virtualStart,
      length: expression.expression.length,
    });
    body += `${prefix}${expression.expression});\n`;
  }

  const text = `${header}${body}}\n`;
  return { text, map: new PositionMap(segments) };
}
```

- [ ] **Step 4: Add `collectInstanceMemberNames`**

`packages/language-server/src/expressions/members.ts`:
```ts
import * as ts from 'typescript';

export function collectInstanceMemberNames(componentSource: string, className: string): string[] {
  const sourceFile = ts.createSourceFile('c.ts', componentSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const classDeclaration = sourceFile.statements.find(
    (statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement) && statement.name?.text === className,
  );
  if (classDeclaration === undefined) return [];

  const names: string[] = [];
  for (const member of classDeclaration.members) {
    if (isPrivate(member)) continue;
    const name = member.name;
    if (name === undefined || !ts.isIdentifier(name)) continue;
    if (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member) || ts.isGetAccessorDeclaration(member)) {
      names.push(name.text);
    }
  }
  return [...new Set(names)];
}

function isPrivate(member: ts.ClassElement): boolean {
  const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];
  return modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword);
}
```

- [ ] **Step 5: Run — expect PASS.** **Step 6: Checkpoint.**

> **Limitation (documented, not a bug):** signal members written as `count` in templates but typed as `Signal<number>` need a call (`count()`) to read. M3's diagnostics already catch misuse; M4 expression *types* will reflect the signal type, not the unwrapped value, until a signal-aware unwrap is added. Track as a follow-up; ship the non-signal path first.

---

## Task 4: In-memory TS language service

**Files:**
- Create: `packages/language-server/src/expressions/language-service.ts`
- Test: `packages/language-server/tests/language-service.test.ts`

- [ ] **Step 1: Failing test (completion at a member position resolves instance members)**

`packages/language-server/tests/language-service.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createVirtualLanguageService } from '../src/expressions/language-service.js';

const virtualText = `export class XComponent { user = { name: 'a' }; }
type __VrInstance = InstanceType<typeof XComponent>;
function __vrTpl(ctx: __VrInstance) {
  const { user } = ctx;
  ;(user.);
}
`;

describe('createVirtualLanguageService', () => {
  it('offers member completions after user.', () => {
    const service = createVirtualLanguageService('/v.ts', virtualText);
    const offset = virtualText.indexOf('user.') + 'user.'.length;
    const info = service.getCompletionsAtPosition('/v.ts', offset, undefined);
    expect(info?.entries.some((entry) => entry.name === 'name')).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement an in-memory `LanguageServiceHost`**

`packages/language-server/src/expressions/language-service.ts`:
```ts
import * as ts from 'typescript';

export function createVirtualLanguageService(fileName: string, text: string): ts.LanguageService {
  const files = new Map<string, { text: string; version: number }>();
  files.set(fileName, { text, version: 1 });

  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  };

  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => [...files.keys()],
    getScriptVersion: (name) => String(files.get(name)?.version ?? 0),
    getScriptSnapshot: (name) => {
      const file = files.get(name);
      if (file !== undefined) return ts.ScriptSnapshot.fromString(file.text);
      if (!ts.sys.fileExists(name)) return undefined;
      const onDisk = ts.sys.readFile(name);
      return onDisk === undefined ? undefined : ts.ScriptSnapshot.fromString(onDisk);
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };

  return ts.createLanguageService(host, ts.createDocumentRegistry());
}
```

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 5: Expression hover + type diagnostics (ship first)

**Files:**
- Create: `packages/language-server/src/features/expression-hover.ts`
- Create: `packages/language-server/src/features/expression-diagnostics.ts`
- Test: `packages/language-server/tests/expression-hover.test.ts`, `tests/expression-diagnostics.test.ts`

A single helper assembles the virtual doc from a template + component source; hover and diagnostics consume it.

- [ ] **Step 1: Failing hover test**

`packages/language-server/tests/expression-hover.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { expressionHover } from '../src/features/expression-hover.js';

const component = `export class XComponent { count = 1; }\n`;
const template = '<p>{{ count }}</p>';

describe('expressionHover', () => {
  it('returns the type of an expression member', () => {
    const offset = template.indexOf('count');
    const hover = expressionHover(template, component, 'XComponent', offset);
    expect(hover?.contents).toMatch(/number/);
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement hover**

`packages/language-server/src/features/expression-hover.ts`:
```ts
import * as ts from 'typescript';
import { enumerateExpressions } from '../expressions/enumerate.js';
import { buildVirtualDocument } from '../expressions/virtual-document.js';
import { createVirtualLanguageService } from '../expressions/language-service.js';

const VIRTUAL_PATH = '/__vanrot_virtual__.ts';

export interface ExpressionHover {
  contents: string;
}

export function expressionHover(
  template: string,
  componentSource: string,
  className: string,
  templateOffset: number,
): ExpressionHover | null {
  const { text, map } = buildVirtualDocument(componentSource, className, enumerateExpressions(template));
  const virtualOffset = map.toVirtual(templateOffset);
  if (virtualOffset === null) return null;

  const service = createVirtualLanguageService(VIRTUAL_PATH, text);
  const info = service.getQuickInfoAtPosition(VIRTUAL_PATH, virtualOffset);
  if (info === undefined) return null;
  return { contents: ts.displayPartsToString(info.displayParts) };
}
```

- [ ] **Step 4: Run hover test — expect PASS.**

- [ ] **Step 5: Failing diagnostics test**

`packages/language-server/tests/expression-diagnostics.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { expressionDiagnostics } from '../src/features/expression-diagnostics.js';

const component = `export class XComponent { count = 1; }\n`;

describe('expressionDiagnostics', () => {
  it('flags an unknown member', () => {
    const template = '<p>{{ nope }}</p>';
    const diagnostics = expressionDiagnostics(template, component, 'XComponent');
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0]?.range.start.character).toBeGreaterThanOrEqual(0);
  });

  it('passes a valid member', () => {
    const template = '<p>{{ count }}</p>';
    expect(expressionDiagnostics(template, component, 'XComponent')).toHaveLength(0);
  });
});
```

- [ ] **Step 6: Run — expect FAIL.**

- [ ] **Step 7: Implement diagnostics (map semantic diagnostics back to template ranges)**

`packages/language-server/src/features/expression-diagnostics.ts`:
```ts
import { type Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { enumerateExpressions } from '../expressions/enumerate.js';
import { buildVirtualDocument } from '../expressions/virtual-document.js';
import { createVirtualLanguageService } from '../expressions/language-service.js';
import { offsetAt, spanToRange } from '../lsp/position.js';
import { createLineIndex, positionAtOffset } from '@vanrot/compiler';

const VIRTUAL_PATH = '/__vanrot_virtual__.ts';

export function expressionDiagnostics(
  template: string,
  componentSource: string,
  className: string,
): Diagnostic[] {
  const { text, map } = buildVirtualDocument(componentSource, className, enumerateExpressions(template));
  const service = createVirtualLanguageService(VIRTUAL_PATH, text);
  const semantic = service.getSemanticDiagnostics(VIRTUAL_PATH);
  const lineIndex = createLineIndex(template);

  const result: Diagnostic[] = [];
  for (const diagnostic of semantic) {
    if (diagnostic.start === undefined) continue;
    const templateStart = map.toTemplate(diagnostic.start);
    if (templateStart === null) continue;
    const templateEnd = map.toTemplate(diagnostic.start + (diagnostic.length ?? 0)) ?? templateStart;
    const start = positionAtOffset(lineIndex, templateStart);
    const end = positionAtOffset(lineIndex, templateEnd);
    result.push({
      severity: DiagnosticSeverity.Error,
      source: 'vanrot-ts',
      message: typeof diagnostic.messageText === 'string'
        ? diagnostic.messageText
        : diagnostic.messageText.messageText,
      range: {
        start: { line: start.line - 1, character: start.column - 1 },
        end: { line: end.line - 1, character: end.column - 1 },
      },
    });
  }
  return result;
}
```
> `offsetAt`/`spanToRange` imports may be unused here — remove if so. Confirm `createLineIndex`/`positionAtOffset` are exported from `@vanrot/compiler` (they are, per `packages/compiler/src/index.ts`).

- [ ] **Step 8: Run diagnostics test — expect PASS.** **Step 9: Checkpoint.**

---

## Task 6: Expression completion

**Files:**
- Create: `packages/language-server/src/features/expression-completion.ts`
- Test: `packages/language-server/tests/expression-completion.test.ts`

- [ ] **Step 1: Failing test**

`packages/language-server/tests/expression-completion.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { expressionCompletion } from '../src/features/expression-completion.js';

const component = `export class XComponent { user = { name: 'a' }; }\n`;

describe('expressionCompletion', () => {
  it('offers members after a dot', () => {
    const template = '<p>{{ user. }}</p>';
    const offset = template.indexOf('user.') + 'user.'.length;
    const items = expressionCompletion(template, component, 'XComponent', offset);
    expect(items.some((item) => item.label === 'name')).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement (map offset → virtual → `getCompletionsAtPosition` → `CompletionItem[]`)**

`packages/language-server/src/features/expression-completion.ts`:
```ts
import { type CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { enumerateExpressions } from '../expressions/enumerate.js';
import { buildVirtualDocument } from '../expressions/virtual-document.js';
import { createVirtualLanguageService } from '../expressions/language-service.js';

const VIRTUAL_PATH = '/__vanrot_virtual__.ts';

export function expressionCompletion(
  template: string,
  componentSource: string,
  className: string,
  templateOffset: number,
): CompletionItem[] {
  const { text, map } = buildVirtualDocument(componentSource, className, enumerateExpressions(template));
  const virtualOffset = map.toVirtual(templateOffset);
  if (virtualOffset === null) return [];

  const service = createVirtualLanguageService(VIRTUAL_PATH, text);
  const info = service.getCompletionsAtPosition(VIRTUAL_PATH, virtualOffset, undefined);
  if (info === undefined) return [];
  return info.entries.map((entry) => ({
    label: entry.name,
    kind: CompletionItemKind.Property,
  }));
}
```
> `{{ user. }}` must parse so the expression span covers `user.`. If the compiler's interpolation parser rejects a trailing-dot expression, the completion offset will fall outside any segment. Mitigation: when `map.toVirtual` returns null, retry by trimming the cursor back to the nearest enclosing expression span boundary (handle in this function with a fallback that finds the expression whose span contains the offset and re-maps). Add that fallback if the test fails on the parse.

- [ ] **Step 4: Run — expect PASS (apply the fallback note if needed).** **Step 5: Checkpoint.**

---

## Task 7: Expression rename (ship last)

**Files:**
- Create: `packages/language-server/src/features/expression-rename.ts`
- Test: `packages/language-server/tests/expression-rename.test.ts`

Rename a member used in a template: find rename locations in the virtual doc, map template-side ones back to template ranges, and pass component-side ones through (their virtual offsets equal real component offsets since the component source is emitted first, unchanged).

- [ ] **Step 1: Failing test**

`packages/language-server/tests/expression-rename.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { expressionRename } from '../src/features/expression-rename.js';

const component = `export class XComponent { count = 1; }\n`;
const template = '<p>{{ count }}</p>';

describe('expressionRename', () => {
  it('returns a template edit for the member occurrence', () => {
    const offset = template.indexOf('count');
    const edits = expressionRename(template, component, 'XComponent', offset, 'total');
    expect(edits.template.length).toBeGreaterThan(0);
    expect(edits.template[0]?.newText).toBe('total');
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

`packages/language-server/src/features/expression-rename.ts`:
```ts
import { type TextEdit } from 'vscode-languageserver';
import { enumerateExpressions } from '../expressions/enumerate.js';
import { buildVirtualDocument } from '../expressions/virtual-document.js';
import { createVirtualLanguageService } from '../expressions/language-service.js';
import { createLineIndex, positionAtOffset } from '@vanrot/compiler';

const VIRTUAL_PATH = '/__vanrot_virtual__.ts';

export interface RenameEdits {
  template: TextEdit[];
}

export function expressionRename(
  template: string,
  componentSource: string,
  className: string,
  templateOffset: number,
  newName: string,
): RenameEdits {
  const { text, map } = buildVirtualDocument(componentSource, className, enumerateExpressions(template));
  const virtualOffset = map.toVirtual(templateOffset);
  if (virtualOffset === null) return { template: [] };

  const service = createVirtualLanguageService(VIRTUAL_PATH, text);
  const locations = service.findRenameLocations(VIRTUAL_PATH, virtualOffset, false, false) ?? [];
  const lineIndex = createLineIndex(template);

  const edits: TextEdit[] = [];
  for (const location of locations) {
    const templateStart = map.toTemplate(location.textSpan.start);
    if (templateStart === null) continue; // component-side edits handled by the platform's own TS rename
    const templateEnd = map.toTemplate(location.textSpan.start + location.textSpan.length) ?? templateStart;
    const start = positionAtOffset(lineIndex, templateStart);
    const end = positionAtOffset(lineIndex, templateEnd);
    edits.push({
      range: {
        start: { line: start.line - 1, character: start.column - 1 },
        end: { line: end.line - 1, character: end.column - 1 },
      },
      newText: newName,
    });
  }
  return { template: edits };
}
```
> Cross-file rename (template edit triggering a component edit and vice versa) requires a `WorkspaceEdit` spanning both files. M4 delivers in-template rename first; wiring component-side edits into the same `WorkspaceEdit` is the final integration step in Task 8.

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 8: Wire expression features into the server

**Files:**
- Modify: `packages/language-server/src/server.ts`
- Test: `packages/language-server/tests/expression-handler.test.ts`

- [ ] **Step 1: Add a helper that loads the component source for an open template**

Reuse M3's path derivation: `templatePath → .ts`, `createComponentFileSet`, read component source, read class name from `fileSet.expectedClassName`.

- [ ] **Step 2: Route requests inside expression spans**

In the existing `onCompletion`/`onHover`/`onRenameRequest` handlers, first check whether the cursor offset falls inside an expression span (`enumerateExpressions`); if so, delegate to the expression handler; otherwise fall back to M1 completion / no-op. Merge `expressionDiagnostics` into the M3 publish (concatenate compiler diagnostics + expression diagnostics before `sendDiagnostics`).

Capabilities to add to `buildInitializeResult`: `hoverProvider: true`, `renameProvider: true`. (Completion provider already present from M1.)

- [ ] **Step 3: Failing integration test (hover inside an expression)**

`packages/language-server/tests/expression-handler.test.ts` — open a fixture component (component `.ts` + template on disk, as in M3), send `textDocument/hover` at a member offset, assert the hover contents include the member type.

(Model the harness on `tests/diagnostics-handler.test.ts` from M3: temp dir, write `.component.ts`/`.css`/`.html`, `initialize`, `didOpen`, then `HoverRequest`.)

- [ ] **Step 4: Run — expect FAIL, then implement the wiring, then PASS.**

- [ ] **Step 5: Full gate + `runIde` smoke**

Run: `pnpm --filter @vanrot/language-server typecheck && pnpm --filter @vanrot/language-server test`
Then build + `gradle runIde`: in a template, hover a member → see its type; type `user.` → member completions; reference an unknown member → type-error squiggle (`vanrot-ts` source); rename a member used in the template → template occurrence updates.

- [ ] **Step 6: Checkpoint — review M4 for commit. Update `docs/superpowers/final-tdd-inventory.md` for the new expression modules.**

---

## Self-Review

- Spec M4 ("virtual TS document per template, each expression rewritten into the component-class scope; TS bridge type-checks it; yields member completion, hover types, type errors, safe rename") → Tasks 3 (virtual doc), 4 (TS service), 5 (hover + type errors), 6 (completion), 7 (rename). ✔
- Sequencing within M4 ships hover/diagnostics before completion before rename, so partial value lands if the harder mapping work overruns — consistent with the spec's "isolate last to contain risk."
- Documented limitations (signal unwrap, trailing-dot parse, cross-file rename) are explicit decisions with concrete follow-up landing points, not vague placeholders.
- Name consistency: `enumerateExpressions`/`TemplateExpression`, `PositionMap`/`MapSegment`, `buildVirtualDocument`/`VirtualDocument`, `collectInstanceMemberNames`, `createVirtualLanguageService`, `expressionHover`/`expressionDiagnostics`/`expressionCompletion`/`expressionRename` — consistent; `VIRTUAL_PATH` constant reused across handlers.
