# Vanrot IntelliJ Plugin — M2 Go-to-Definition / References Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (no subagents — CLAUDE.md). Checkbox steps.
>
> **Git policy:** User owns git. **Checkpoint** = stop + summarize; never `git add/commit/push`.
>
> **Depends on:** M1 — `RouteIndex`, `ComponentIndex`, `WorkspaceIndex`, `spanToRange` all exist.

**Goal:** Ctrl-click navigation and find-usages in vanrot templates: a `route.<name>` ref → its registration in `routes.ts`; a component tag → its `.component.ts` class; a slot outlet name → its definition. References work in reverse (route name in `routes.ts` → all template `route.<name>` uses).

**Architecture:** A `resolveSymbolAt(source, offset)` parses the template (compiler `parseTemplate`) and classifies the symbol under the cursor (route ref / component tag / slot). `findDefinition` maps a symbol to a `Location` using the M1 indexes. `findReferences` scans open + indexed template documents for matching symbol occurrences. The server advertises `definitionProvider` + `referencesProvider`. No Kotlin changes.

**Tech Stack:** TypeScript, `@vanrot/compiler` (`parseTemplate`, AST, spans), `vscode-languageserver`, vitest TDD.

---

## File Structure

- `packages/language-server/src/features/symbol-at.ts` — `resolveSymbolAt(source, offset)` → `TemplateSymbol | null`.
- `packages/language-server/src/features/definition.ts` — `findDefinition(symbol, index)` → `Location | null`.
- `packages/language-server/src/features/references.ts` — `findReferences(symbol, documents)` → `Location[]`.
- `packages/language-server/src/project/document-store.ts` — tracks template docs for reference scanning.
- Modify `packages/language-server/src/server.ts` — register providers + handlers.
- Modify `packages/language-server/src/project/workspace.ts` — expose `routesPath` so definition can point at the file.

---

## Task 1: Symbol-at-cursor resolver

**Files:**
- Create: `packages/language-server/src/features/symbol-at.ts`
- Test: `packages/language-server/tests/symbol-at.test.ts`

Classify what the cursor sits on. Use the parsed AST so spans are accurate; fall back to a token scan only for attribute names (which the AST exposes via `TemplateAttribute`).

- [ ] **Step 1: Failing test**

`packages/language-server/tests/symbol-at.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { resolveSymbolAt } from '../src/features/symbol-at.js';

function at(markup: string) {
  const offset = markup.indexOf('|');
  return { source: markup.replace('|', ''), offset };
}

describe('resolveSymbolAt', () => {
  it('resolves a route ref', () => {
    const { source, offset } = at('<vr route.ho|me />');
    const symbol = resolveSymbolAt(source, offset);
    expect(symbol).toEqual(expect.objectContaining({ kind: 'route-ref', name: 'home' }));
  });

  it('resolves a component tag', () => {
    const { source, offset } = at('<user-ca|rd></user-card>');
    const symbol = resolveSymbolAt(source, offset);
    expect(symbol).toEqual(expect.objectContaining({ kind: 'component-tag', name: 'user-card' }));
  });

  it('resolves a slot outlet name', () => {
    const { source, offset } = at('<slot.bo|dy></slot.body>');
    const symbol = resolveSymbolAt(source, offset);
    expect(symbol).toEqual(expect.objectContaining({ kind: 'slot', name: 'body' }));
  });

  it('returns null in plain text', () => {
    const { source, offset } = at('hello |world');
    expect(resolveSymbolAt(source, offset)).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/symbol-at.test.ts`

- [ ] **Step 3: Implement**

`packages/language-server/src/features/symbol-at.ts`:
```ts
import { parseTemplate, type SourceSpan, type TemplateNode } from '@vanrot/compiler';

export type TemplateSymbolKind = 'route-ref' | 'component-tag' | 'slot';

export interface TemplateSymbol {
  kind: TemplateSymbolKind;
  name: string;
  span: SourceSpan;
}

export function resolveSymbolAt(source: string, offset: number): TemplateSymbol | null {
  const parsed = parseTemplate(source, 'template.html');
  return walk(parsed.nodes, source, offset);
}

function walk(nodes: readonly TemplateNode[], source: string, offset: number): TemplateSymbol | null {
  for (const node of nodes) {
    const found = inspect(node, source, offset);
    if (found !== null) return found;
  }
  return null;
}

function inspect(node: TemplateNode, source: string, offset: number): TemplateSymbol | null {
  if (node.kind === 'slot-outlet' && within(node.span, offset)) {
    return { kind: 'slot', name: node.name, span: node.span };
  }

  if (node.kind === 'element') {
    for (const attribute of node.attributes) {
      if (attribute.name.startsWith('route.') && within(attribute.span, offset)) {
        return { kind: 'route-ref', name: attribute.name.slice('route.'.length), span: attribute.span };
      }
    }
    if (isComponentTag(node.tagName) && within(node.span, offset)) {
      return { kind: 'component-tag', name: node.tagName, span: node.span };
    }
    return walk(node.children, source, offset);
  }

  if (node.kind === 'if-block') return walk([...node.consequent, ...node.alternate], source, offset);
  if (node.kind === 'for-block') return walk([...node.body, ...node.empty], source, offset);
  return null;
}

function within(span: SourceSpan, offset: number): boolean {
  return offset >= span.startOffset && offset <= span.endOffset;
}

function isComponentTag(tagName: string): boolean {
  return tagName.includes('-') && !tagName.startsWith('vr');
}
```
> Confirm `parseTemplate`'s return shape: M1/M0 used `parseTemplate(source, filePath)`. Read `packages/compiler/src/template/parse-template.ts` for the exact result property holding the node array (`nodes` vs `ast` vs `root.children`) and the argument order, then adjust. The `slot.body` AST: verify whether `<slot.body>` parses to a `slot-outlet` node with `name: 'body'` or an `element` with `tagName: 'slot.body'`; adjust `inspect` to match. (Recall from the design session that the self-close normalizer does not cover `slot`, so slots may surface as elements — handle both.)

- [ ] **Step 4: Run — expect PASS (after matching the real AST shape).** **Step 5: Checkpoint.**

---

## Task 2: Definition resolver

**Files:**
- Modify: `packages/language-server/src/project/workspace.ts` (add `routesPath`)
- Create: `packages/language-server/src/features/definition.ts`
- Test: `packages/language-server/tests/definition.test.ts`

- [ ] **Step 1: Add `routesPath` to the workspace index**

In `workspace.ts`, extend `WorkspaceIndex` with `routesPath: string | null` and set it in `loadWorkspaceIndex` (the resolved path when the file exists, else `null`).

```ts
export interface WorkspaceIndex {
  routes: RouteEntry[];
  components: ComponentEntry[];
  routesPath: string | null;
}
```
Set `routesPath: existsSync(routesPath) ? routesPath : null` in the return.

- [ ] **Step 2: Failing test**

`packages/language-server/tests/definition.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { findDefinition } from '../src/features/definition.js';

const index = {
  routes: [{ name: 'home', span: span('/app/src/routes.ts', 4, 3, 4, 7) }],
  components: [{ tagName: 'user-card', className: 'UserCardComponent', path: '/app/user-card.component.ts' }],
  routesPath: '/app/src/routes.ts',
};
function span(filePath: string, line: number, column: number, endLine: number, endColumn: number) {
  return { filePath, line, column, endLine, endColumn, startOffset: 0, endOffset: 0 };
}

describe('findDefinition', () => {
  it('points a route ref at the routes.ts name span', () => {
    const location = findDefinition({ kind: 'route-ref', name: 'home', span: span('t.html', 1, 1, 1, 1) }, index);
    expect(location?.uri).toBe('file:///app/src/routes.ts');
    expect(location?.range.start).toEqual({ line: 3, character: 2 });
  });

  it('points a component tag at its .component.ts', () => {
    const location = findDefinition({ kind: 'component-tag', name: 'user-card', span: span('t.html', 1, 1, 1, 1) }, index);
    expect(location?.uri).toBe('file:///app/user-card.component.ts');
  });

  it('returns null for an unknown route', () => {
    expect(findDefinition({ kind: 'route-ref', name: 'nope', span: span('t.html', 1, 1, 1, 1) }, index)).toBeNull();
  });
});
```

- [ ] **Step 3: Run — expect FAIL.**

- [ ] **Step 4: Implement**

`packages/language-server/src/features/definition.ts`:
```ts
import type { Location } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { spanToRange } from '../lsp/position.js';
import type { TemplateSymbol } from './symbol-at.js';
import type { WorkspaceIndex } from '../project/workspace.js';

export function findDefinition(symbol: TemplateSymbol, index: WorkspaceIndex): Location | null {
  if (symbol.kind === 'route-ref') {
    const route = index.routes.find((entry) => entry.name === symbol.name);
    if (route === undefined) return null;
    return { uri: URI.file(route.span.filePath).toString(), range: spanToRange(route.span) };
  }

  if (symbol.kind === 'component-tag') {
    const component = index.components.find((entry) => entry.tagName === symbol.name);
    if (component === undefined) return null;
    return {
      uri: URI.file(component.path).toString(),
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
    };
  }

  return null; // slot definition handled in Task 3
}
```

- [ ] **Step 5: Run — expect PASS.** **Step 6: Checkpoint.**

---

## Task 3: Slot definition (within the same template / fallback)

**Files:**
- Modify: `packages/language-server/src/features/definition.ts`
- Test: `packages/language-server/tests/definition-slot.test.ts`

A slot reference resolves to its outlet declaration. For M2, resolve a slot name to the first `slot-outlet`/slot element with that name in the same template (the common case for layouts/components defining their own slots).

- [ ] **Step 1: Failing test**

`packages/language-server/tests/definition-slot.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { findSlotDefinition } from '../src/features/definition.js';

const template = '<div>\n  <slot.body></slot.body>\n</div>';

describe('findSlotDefinition', () => {
  it('locates the slot outlet by name in the template', () => {
    const location = findSlotDefinition('body', template, 'file:///app/x.layout.html');
    expect(location?.uri).toBe('file:///app/x.layout.html');
    expect(location?.range.start.line).toBe(1);
  });

  it('returns null for an unknown slot', () => {
    expect(findSlotDefinition('missing', template, 'file:///app/x.layout.html')).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement `findSlotDefinition` (add to `definition.ts`), reusing the AST walk**

```ts
import { parseTemplate, type SourceSpan, type TemplateNode } from '@vanrot/compiler';

export function findSlotDefinition(name: string, source: string, uri: string): Location | null {
  const parsed = parseTemplate(source, 'template.html');
  const span = findSlotSpan(parsed.nodes, name);
  if (span === null) return null;
  return { uri, range: spanToRange(span) };
}

function findSlotSpan(nodes: readonly TemplateNode[], name: string): SourceSpan | null {
  for (const node of nodes) {
    if (node.kind === 'slot-outlet' && node.name === name) return node.span;
    const children = childrenOf(node);
    const nested = findSlotSpan(children, name);
    if (nested !== null) return nested;
  }
  return null;
}

function childrenOf(node: TemplateNode): readonly TemplateNode[] {
  if (node.kind === 'element') return node.children;
  if (node.kind === 'if-block') return [...node.consequent, ...node.alternate];
  if (node.kind === 'for-block') return [...node.body, ...node.empty];
  return [];
}
```
> Match `parsed.nodes` to the real `parseTemplate` result property (same caveat as Task 1). If slots surface as `element` nodes with `tagName: 'slot.body'`, branch on that too.

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 4: References resolver

**Files:**
- Create: `packages/language-server/src/features/references.ts`
- Test: `packages/language-server/tests/references.test.ts`

Find all template occurrences of a symbol across the supplied documents. For M2, references operate on the set of open/known template documents.

- [ ] **Step 1: Failing test**

`packages/language-server/tests/references.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { findReferences } from '../src/features/references.js';

const docs = [
  { uri: 'file:///a.html', text: '<vr route.home /> <vr route.docs />' },
  { uri: 'file:///b.html', text: '<vr route.home />' },
];

describe('findReferences', () => {
  it('finds every route ref across documents', () => {
    const locations = findReferences({ kind: 'route-ref', name: 'home', span: anySpan() }, docs);
    expect(locations.map((location) => location.uri).sort()).toEqual(['file:///a.html', 'file:///b.html']);
  });
});
function anySpan() {
  return { filePath: '', line: 1, column: 1, endLine: 1, endColumn: 1, startOffset: 0, endOffset: 0 };
}
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement (reuse `resolveSymbolAt`-style AST walk to collect matching spans)**

`packages/language-server/src/features/references.ts`:
```ts
import type { Location } from 'vscode-languageserver';
import { parseTemplate, type SourceSpan, type TemplateNode } from '@vanrot/compiler';
import { spanToRange } from '../lsp/position.js';
import type { TemplateSymbol } from './symbol-at.js';

export interface TextDocumentLike {
  uri: string;
  text: string;
}

export function findReferences(symbol: TemplateSymbol, documents: readonly TextDocumentLike[]): Location[] {
  const locations: Location[] = [];
  for (const document of documents) {
    const parsed = parseTemplate(document.text, 'template.html');
    for (const span of collect(parsed.nodes, symbol)) {
      locations.push({ uri: document.uri, range: spanToRange(span) });
    }
  }
  return locations;
}

function collect(nodes: readonly TemplateNode[], symbol: TemplateSymbol): SourceSpan[] {
  const spans: SourceSpan[] = [];
  for (const node of nodes) {
    if (node.kind === 'element') {
      if (symbol.kind === 'route-ref') {
        for (const attribute of node.attributes) {
          if (attribute.name === `route.${symbol.name}`) spans.push(attribute.span);
        }
      }
      if (symbol.kind === 'component-tag' && node.tagName === symbol.name) spans.push(node.span);
      spans.push(...collect(node.children, symbol));
    }
    if (node.kind === 'slot-outlet' && symbol.kind === 'slot' && node.name === symbol.name) {
      spans.push(node.span);
    }
    if (node.kind === 'if-block') spans.push(...collect([...node.consequent, ...node.alternate], symbol));
    if (node.kind === 'for-block') spans.push(...collect([...node.body, ...node.empty], symbol));
  }
  return spans;
}
```

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 5: Wire providers into the server

**Files:**
- Modify: `packages/language-server/src/server.ts`
- Test: `packages/language-server/tests/definition-handler.test.ts`

- [ ] **Step 1: Failing integration test (drives `textDocument/definition`)**

`packages/language-server/tests/definition-handler.test.ts`:
```ts
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createConnection } from 'vscode-languageserver/node.js';
import {
  DefinitionRequest,
  DidOpenTextDocumentNotification,
  InitializeRequest,
  StreamMessageReader,
  StreamMessageWriter,
  createProtocolConnection,
} from 'vscode-languageserver-protocol/node.js';
import { startLanguageServer } from '../src/server.js';

describe('definition handler', () => {
  it('does not error on a route ref when no project is loaded', async () => {
    const c2s = new PassThrough();
    const s2c = new PassThrough();
    startLanguageServer(createConnection(new StreamMessageReader(c2s), new StreamMessageWriter(s2c)));
    const client = createProtocolConnection(new StreamMessageReader(s2c), new StreamMessageWriter(c2s));
    client.listen();
    await client.sendRequest(InitializeRequest.type, { processId: null, rootUri: null, capabilities: {} });
    const uri = 'file:///app/x.component.html';
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: '<vr route.home />' },
    });
    const result = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri },
      position: { line: 0, character: 12 },
    });
    expect(result).toBeNull(); // no routes.ts → no definition, but no crash
    client.dispose();
  });
});
```

- [ ] **Step 2: Run — expect FAIL** (no definition capability).

- [ ] **Step 3: Wire handlers in `server.ts`**

Add to `buildInitializeResult` capabilities: `definitionProvider: true, referencesProvider: true`.
In `startLanguageServer`, after `onCompletion`, add:
```ts
  connection.onDefinition((params) => {
    const document = documents.get(params.textDocument.uri);
    if (document === undefined) return null;
    const source = document.getText();
    const offset = offsetAt(source, params.position.line, params.position.character);
    const symbol = resolveSymbolAt(source, offset);
    if (symbol === null) return null;
    if (symbol.kind === 'slot') return findSlotDefinition(symbol.name, source, params.textDocument.uri);
    return findDefinition(symbol, index);
  });

  connection.onReferences((params) => {
    const document = documents.get(params.textDocument.uri);
    if (document === undefined) return [];
    const source = document.getText();
    const offset = offsetAt(source, params.position.line, params.position.character);
    const symbol = resolveSymbolAt(source, offset);
    if (symbol === null) return [];
    const open = documents.all().map((doc) => ({ uri: doc.uri, text: doc.getText() }));
    return findReferences(symbol, open);
  });
```
Add imports for `resolveSymbolAt`, `findDefinition`, `findSlotDefinition`, `findReferences`.

- [ ] **Step 4: Run — expect PASS.**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/definition-handler.test.ts`

- [ ] **Step 5: Full gate + `runIde` smoke**

Run: `pnpm --filter @vanrot/language-server typecheck && pnpm --filter @vanrot/language-server test`
Then build + `gradle runIde`: Ctrl-click `route.home` jumps to `routes.ts`; Ctrl-click a component tag opens its `.component.ts`; Find Usages on a route ref lists template uses.

- [ ] **Step 6: Checkpoint — review M2 for commit.**

---

## Self-Review

- Spec M2 ("route name → routes.ts, component tag → .component.ts, slot → its definition; find-usages across template + TS") → Tasks 2 (route, component), 3 (slot), 4 (references). Component definition targets file top (line 0) — precise class-span targeting is a refinement noted for M4 when the TS bridge is available. References across `.ts` (route name usages in TS) is scoped to template docs in M2; TS-side usages ride on the platform's own TS find-usages once go-to-def lands.
- Placeholder scan: AST-shape caveats are concrete verification instructions, not vague TODOs.
- Name consistency: `resolveSymbolAt`/`TemplateSymbol`, `findDefinition`, `findSlotDefinition`, `findReferences`/`TextDocumentLike`, `spanToRange`, `WorkspaceIndex.routesPath` — consistent.
