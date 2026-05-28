# Vanrot IntelliJ Plugin — M1 Completion + Self-Close Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (subagents forbidden — CLAUDE.md). Checkbox (`- [ ]`) steps.
>
> **Git policy:** User owns git. Steps say **Checkpoint** — stop, summarize diff, let the user commit. No `git add/commit/push`.
>
> **Depends on:** M0 (`2026-05-29-intellij-plugin-m0-foundation.md`) complete — server connects, doc sync works.

**Goal:** Vanrot-aware completion in template files — `vr` / `vr-*` elements, `route.*` attributes (from `routes.ts`), slot names, and component tags — served by the language server. Self-close was already made legal in M0; M1 retires the `.idea` workaround for plugin users by delivering the completion that makes the plugin worth installing.

**Architecture:** All logic in `@vanrot/language-server`. A `RouteIndex` parses `routes.ts` (via the TS API) for route names + spans; a `ComponentIndex` scans `.component.ts`/page/layout files for component tag names; a `classifyCompletionContext` function parses the template fragment at the cursor and decides what kind of completion applies; `buildCompletions` assembles `CompletionItem[]`. The server advertises a `completionProvider` and answers `textDocument/completion`. The Kotlin plugin needs no change (completion flows through the existing LSP client).

**Tech Stack:** TypeScript, `typescript` compiler API (already a transitive dep via `@vanrot/compiler`), `vscode-languageserver`, vitest TDD.

---

## File Structure

- `packages/language-server/src/project/route-index.ts` — parse `routes.ts` → `RouteEntry[]` (name + `SourceSpan`).
- `packages/language-server/src/project/component-index.ts` — scan component files → `ComponentEntry[]` (tag name + class + path).
- `packages/language-server/src/project/project-root.ts` — locate project root + `src/routes.ts` (via `@vanrot/config`).
- `packages/language-server/src/features/completion-context.ts` — `classifyCompletionContext(source, offset)`.
- `packages/language-server/src/features/completion.ts` — `buildCompletions(...)` → `CompletionItem[]`.
- `packages/language-server/src/lsp/position.ts` — span↔LSP conversion helpers (shared by M2–M4).
- Modify `packages/language-server/src/server.ts` — register `completionProvider` + `onCompletion`.
- Tests under `packages/language-server/tests/`.

---

## Task 1: LSP position helpers

**Files:**
- Create: `packages/language-server/src/lsp/position.ts`
- Test: `packages/language-server/tests/position.test.ts`

Compiler `SourceSpan` is 1-based line/column; LSP `Position` is 0-based. One shared converter avoids off-by-one bugs across all later features.

- [ ] **Step 1: Failing test**

`packages/language-server/tests/position.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import type { SourceSpan } from '@vanrot/compiler';
import { spanToRange } from '../src/lsp/position.js';

const span: SourceSpan = {
  filePath: 'x.html', line: 3, column: 5, endLine: 3, endColumn: 9, startOffset: 0, endOffset: 0,
};

describe('spanToRange', () => {
  it('converts 1-based span to 0-based LSP range', () => {
    expect(spanToRange(span)).toEqual({
      start: { line: 2, character: 4 },
      end: { line: 2, character: 8 },
    });
  });
});
```

- [ ] **Step 2: Run — expect FAIL** (`Cannot find module '../src/lsp/position.js'`)

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/position.test.ts`

- [ ] **Step 3: Implement**

`packages/language-server/src/lsp/position.ts`:
```ts
import type { Range } from 'vscode-languageserver';
import type { SourceSpan } from '@vanrot/compiler';

export function spanToRange(span: SourceSpan): Range {
  return {
    start: { line: span.line - 1, character: span.column - 1 },
    end: { line: span.endLine - 1, character: span.endColumn - 1 },
  };
}

export function offsetAt(source: string, line: number, character: number): number {
  const lines = source.split('\n');
  let offset = 0;
  for (let index = 0; index < line; index += 1) {
    offset += (lines[index]?.length ?? 0) + 1;
  }
  return offset + character;
}
```

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 2: Route index (parse `routes.ts`)

**Files:**
- Create: `packages/language-server/src/project/route-index.ts`
- Test: `packages/language-server/tests/route-index.test.ts`

Route names are the property names of the object literal passed to `defineRoutes({...})`. Parse with the TS API and capture each name's span for completion (M1) and go-to-definition (M2).

- [ ] **Step 1: Failing test**

`packages/language-server/tests/route-index.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { parseRouteIndex } from '../src/project/route-index.js';

const routesSource = `
import { defineRoutes } from '@vanrot/router';
const home = {}; const docs = {};
export const route = defineRoutes({
  home,
  docs,
});
`;

describe('parseRouteIndex', () => {
  it('extracts route names from the defineRoutes call', () => {
    const entries = parseRouteIndex('src/routes.ts', routesSource);
    expect(entries.map((entry) => entry.name)).toEqual(['home', 'docs']);
  });

  it('records a span for each route name', () => {
    const entries = parseRouteIndex('src/routes.ts', routesSource);
    const home = entries.find((entry) => entry.name === 'home');
    expect(home?.span.filePath).toBe('src/routes.ts');
    expect(home?.span.line).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/route-index.test.ts`

- [ ] **Step 3: Implement**

`packages/language-server/src/project/route-index.ts`:
```ts
import * as ts from 'typescript';
import { createSourceSpan, type SourceSpan } from '@vanrot/compiler';

export interface RouteEntry {
  name: string;
  span: SourceSpan;
}

export function parseRouteIndex(filePath: string, source: string): RouteEntry[] {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const call = findDefineRoutesCall(sourceFile);
  if (call === null) return [];
  const argument = call.arguments[0];
  if (argument === undefined || !ts.isObjectLiteralExpression(argument)) return [];

  const entries: RouteEntry[] = [];
  for (const property of argument.properties) {
    const name = property.name;
    if (name === undefined || !ts.isIdentifier(name)) continue;
    entries.push({
      name: name.text,
      span: createSourceSpan(source, filePath, name.getStart(sourceFile), name.getEnd()),
    });
  }
  return entries;
}

function findDefineRoutesCall(node: ts.Node): ts.CallExpression | null {
  let found: ts.CallExpression | null = null;
  const visit = (current: ts.Node): void => {
    if (found !== null) return;
    if (
      ts.isCallExpression(current) &&
      ts.isIdentifier(current.expression) &&
      current.expression.text === 'defineRoutes'
    ) {
      found = current;
      return;
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  return found;
}
```

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 3: Project root + routes file resolution

**Files:**
- Create: `packages/language-server/src/project/project-root.ts`
- Test: `packages/language-server/tests/project-root.test.ts`

The server gets a `rootUri` at `initialize`. Resolve the routes file at `<root>/src/routes.ts` (the convention used by `apps/vanrot-site`), keeping the path computation testable and isolated. (Config-driven source roots are a later refinement; `src` is the default per `@vanrot/config` `defaultSourceRoot`.)

- [ ] **Step 1: Failing test**

`packages/language-server/tests/project-root.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { resolveRoutesPath } from '../src/project/project-root.js';

describe('resolveRoutesPath', () => {
  it('joins the project root with src/routes.ts', () => {
    expect(resolveRoutesPath('/work/app')).toBe('/work/app/src/routes.ts');
  });

  it('normalizes a trailing slash', () => {
    expect(resolveRoutesPath('/work/app/')).toBe('/work/app/src/routes.ts');
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

`packages/language-server/src/project/project-root.ts`:
```ts
import { defaultSourceRoot } from '@vanrot/config';

export function resolveRoutesPath(projectRoot: string): string {
  const root = projectRoot.replace(/\/+$/, '');
  return `${root}/${defaultSourceRoot}/routes.ts`;
}
```
> Verify the export name: `defaultSourceRoot` is exported by `@vanrot/config` (`packages/config/src/index.ts`). If its value is not `'src'`, the test expectation above must match the real default — read `packages/config/src/constants.ts` and adjust the test, not the implementation.

- [ ] **Step 4: Run — expect PASS (adjust per the real default if needed).** **Step 5: Checkpoint.**

---

## Task 4: Component index (component tag names)

**Files:**
- Create: `packages/language-server/src/project/component-index.ts`
- Test: `packages/language-server/tests/component-index.test.ts`

Component tags in templates are the kebab-case form of the component class. Build the index from `.component.ts` files via `readComponentMetadata` + `createComponentFileSet` from the compiler, so tag derivation stays owned by the compiler conventions.

- [ ] **Step 1: Failing test**

`packages/language-server/tests/component-index.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { componentTagFromClassName } from '../src/project/component-index.js';

describe('componentTagFromClassName', () => {
  it('kebab-cases a component class name', () => {
    expect(componentTagFromClassName('UserCardComponent')).toBe('user-card');
    expect(componentTagFromClassName('HomePage')).toBe('home');
  });
});
```
> The exact tag-derivation rule must match the compiler's `child-component` codegen. Before implementing, read `packages/compiler/src/codegen/components.ts` (or the module that maps class names to tags) and mirror its rule precisely. The test above encodes the *expected* contract — correct it to whatever the compiler actually does (e.g. whether the `Component`/`Page` suffix is stripped) and keep implementation in lockstep.

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement `componentTagFromClassName` to match the compiler rule, plus `buildComponentIndex(files)` that maps each `{ path, source }` through `readComponentMetadata` and records `{ tagName, className, path }`.**

`packages/language-server/src/project/component-index.ts` (skeleton — fill the tag rule to match the compiler):
```ts
import { createComponentFileSet, readComponentMetadata } from '@vanrot/compiler';

export interface ComponentEntry {
  tagName: string;
  className: string;
  path: string;
}

export function componentTagFromClassName(className: string): string {
  const stripped = className.replace(/(Component|Page|Layout|Dialog|Widget|Form)$/, '');
  return stripped
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export function buildComponentIndex(
  files: ReadonlyArray<{ path: string; source: string }>,
): ComponentEntry[] {
  const entries: ComponentEntry[] = [];
  for (const file of files) {
    const fileSet = createComponentFileSet(file.path);
    const result = readComponentMetadata(fileSet, file.source);
    if (result.metadata === null) continue;
    entries.push({
      tagName: componentTagFromClassName(result.metadata.componentName),
      className: result.metadata.componentName,
      path: file.path,
    });
  }
  return entries;
}
```
> Confirm `createComponentFileSet(path)` accepts a single `.component.ts` path and returns the expected `expectedClassName`. Read `packages/compiler/src/conventions/component-files.ts` and adjust the call shape if it differs.

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 5: Completion context classifier

**Files:**
- Create: `packages/language-server/src/features/completion-context.ts`
- Test: `packages/language-server/tests/completion-context.test.ts`

Given the raw template text and a cursor offset, decide what to complete. Keep this a pure function — it is the most test-worthy logic in M1.

- [ ] **Step 1: Failing test**

`packages/language-server/tests/completion-context.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { classifyCompletionContext } from '../src/features/completion-context.js';

function at(markup: string) {
  const offset = markup.indexOf('|');
  return { source: markup.replace('|', ''), offset };
}

describe('classifyCompletionContext', () => {
  it('detects a tag-name position after <', () => {
    const { source, offset } = at('<div><|');
    expect(classifyCompletionContext(source, offset).kind).toBe('tag-name');
  });

  it('detects an attribute-name position inside an open tag', () => {
    const { source, offset } = at('<vr |></vr>');
    expect(classifyCompletionContext(source, offset).kind).toBe('attribute-name');
  });

  it('detects a route-ref position after route.', () => {
    const { source, offset } = at('<vr route.|');
    expect(classifyCompletionContext(source, offset).kind).toBe('route-ref');
  });

  it('returns none in plain text', () => {
    const { source, offset } = at('hello |world');
    expect(classifyCompletionContext(source, offset).kind).toBe('none');
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement (guard clauses, scanning backward from the cursor)**

`packages/language-server/src/features/completion-context.ts`:
```ts
export type CompletionContextKind = 'tag-name' | 'attribute-name' | 'route-ref' | 'none';

export interface CompletionContext {
  kind: CompletionContextKind;
}

export function classifyCompletionContext(source: string, offset: number): CompletionContext {
  const before = source.slice(0, offset);
  const lastOpen = before.lastIndexOf('<');
  const lastClose = before.lastIndexOf('>');

  if (lastOpen <= lastClose) return { kind: 'none' };

  const tagText = before.slice(lastOpen);
  if (/^<[A-Za-z0-9._-]*$/.test(tagText)) return { kind: 'tag-name' };
  if (/route\.[A-Za-z0-9_]*$/.test(tagText)) return { kind: 'route-ref' };
  if (/[\s][A-Za-z0-9._-]*$/.test(tagText)) return { kind: 'attribute-name' };
  return { kind: 'none' };
}
```

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 6: Build completions

**Files:**
- Create: `packages/language-server/src/features/completion.ts`
- Test: `packages/language-server/tests/completion.test.ts`

Assemble `CompletionItem[]` from the classified context + indexes. Static elements (`vr`, `vr-outlet`, `vr-router`) come from the same names the router `web-types.json` declares — define them once here as the server-side source.

- [ ] **Step 1: Failing test**

`packages/language-server/tests/completion.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { CompletionItemKind } from 'vscode-languageserver';
import { buildCompletions } from '../src/features/completion.js';

const indexes = {
  routes: [{ name: 'home', span: anySpan() }, { name: 'docs', span: anySpan() }],
  components: [{ tagName: 'user-card', className: 'UserCardComponent', path: 'a.ts' }],
};
function anySpan() {
  return { filePath: '', line: 1, column: 1, endLine: 1, endColumn: 1, startOffset: 0, endOffset: 0 };
}

describe('buildCompletions', () => {
  it('offers route names for a route-ref context', () => {
    const items = buildCompletions({ kind: 'route-ref' }, indexes);
    expect(items.map((item) => item.label).sort()).toEqual(['docs', 'home']);
  });

  it('offers vr elements and component tags for a tag-name context', () => {
    const items = buildCompletions({ kind: 'tag-name' }, indexes);
    const labels = items.map((item) => item.label);
    expect(labels).toContain('vr');
    expect(labels).toContain('user-card');
  });

  it('offers route.* for an attribute-name context', () => {
    const items = buildCompletions({ kind: 'attribute-name' }, indexes);
    expect(items.some((item) => item.label === 'route.')).toBe(true);
    expect(items[0]?.kind).toBe(CompletionItemKind.Property);
  });
});
```

- [ ] **Step 2: Run — expect FAIL.**

- [ ] **Step 3: Implement**

`packages/language-server/src/features/completion.ts`:
```ts
import { type CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import type { CompletionContext } from './completion-context.js';
import type { RouteEntry } from '../project/route-index.js';
import type { ComponentEntry } from '../project/component-index.js';

export const vanrotElements = ['vr', 'vr-outlet', 'vr-router'] as const;

export interface CompletionIndexes {
  routes: readonly RouteEntry[];
  components: readonly ComponentEntry[];
}

export function buildCompletions(
  context: CompletionContext,
  indexes: CompletionIndexes,
): CompletionItem[] {
  if (context.kind === 'route-ref') {
    return indexes.routes.map((route) => ({
      label: route.name,
      kind: CompletionItemKind.EnumMember,
    }));
  }

  if (context.kind === 'tag-name') {
    const elements = vanrotElements.map((name) => ({
      label: name,
      kind: CompletionItemKind.Class,
    }));
    const components = indexes.components.map((component) => ({
      label: component.tagName,
      kind: CompletionItemKind.Class,
      detail: component.className,
    }));
    return [...elements, ...components];
  }

  if (context.kind === 'attribute-name') {
    return [{ label: 'route.', kind: CompletionItemKind.Property }];
  }

  return [];
}
```

- [ ] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 7: Wire completion into the server + workspace indexes

**Files:**
- Modify: `packages/language-server/src/server.ts`
- Create: `packages/language-server/src/project/workspace.ts` (loads routes + component indexes from disk on initialize)
- Test: `packages/language-server/tests/completion-handler.test.ts`

- [ ] **Step 1: Failing integration test (in-process LSP, drives `textDocument/completion`)**

`packages/language-server/tests/completion-handler.test.ts`:
```ts
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createConnection } from 'vscode-languageserver/node.js';
import {
  CompletionRequest,
  DidOpenTextDocumentNotification,
  InitializeRequest,
  StreamMessageReader,
  StreamMessageWriter,
  createProtocolConnection,
} from 'vscode-languageserver-protocol/node.js';
import { startLanguageServer } from '../src/server.js';

describe('completion handler', () => {
  it('returns vr elements for a tag-name position', async () => {
    const c2s = new PassThrough();
    const s2c = new PassThrough();
    startLanguageServer(createConnection(new StreamMessageReader(c2s), new StreamMessageWriter(s2c)));
    const client = createProtocolConnection(new StreamMessageReader(s2c), new StreamMessageWriter(c2s));
    client.listen();

    await client.sendRequest(InitializeRequest.type, { processId: null, rootUri: null, capabilities: {} });
    const uri = 'file:///app/x.component.html';
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: '<' },
    });

    const result = await client.sendRequest(CompletionRequest.type, {
      textDocument: { uri },
      position: { line: 0, character: 1 },
    });
    const items = Array.isArray(result) ? result : (result?.items ?? []);
    expect(items.some((item) => item.label === 'vr')).toBe(true);
    client.dispose();
  });
});
```

- [ ] **Step 2: Run — expect FAIL** (no completion capability / handler yet).

- [ ] **Step 3: Add the workspace loader**

`packages/language-server/src/project/workspace.ts`:
```ts
import { readFileSync, existsSync } from 'node:fs';
import { parseRouteIndex, type RouteEntry } from './route-index.js';
import { buildComponentIndex, type ComponentEntry } from './component-index.js';
import { resolveRoutesPath } from './project-root.js';

export interface WorkspaceIndex {
  routes: RouteEntry[];
  components: ComponentEntry[];
}

export function loadWorkspaceIndex(projectRoot: string | null): WorkspaceIndex {
  if (projectRoot === null) return { routes: [], components: [] };
  const routesPath = resolveRoutesPath(projectRoot);
  const routes = existsSync(routesPath)
    ? parseRouteIndex(routesPath, readFileSync(routesPath, 'utf8'))
    : [];
  // Component scanning across the tree is added incrementally; start with routes.
  const components = buildComponentIndex([]);
  return { routes, components };
}
```
> Component-file discovery (walking the source tree for `*.component.ts`) is intentionally deferred to a follow-up step within M1 to keep this task shippable; `routes` completion lands first. Add a directory walk feeding `buildComponentIndex` once the route path is green.

- [ ] **Step 4: Wire the handler in `server.ts`**

Add the completion capability and handler. Replace the body of `startLanguageServer` with:
```ts
import {
  type Connection,
  type InitializeParams,
  type InitializeResult,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { loadWorkspaceIndex, type WorkspaceIndex } from './project/workspace.js';
import { classifyCompletionContext } from './features/completion-context.js';
import { buildCompletions } from './features/completion.js';
import { offsetAt } from './lsp/position.js';

const serverInfo = { name: 'vanrot-language-server', version: '0.0.0' } as const;

export function buildInitializeResult(_params: InitializeParams): InitializeResult {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { triggerCharacters: ['<', '.', ' '] },
    },
    serverInfo: { name: serverInfo.name, version: serverInfo.version },
  };
}

export function startLanguageServer(connection: Connection): void {
  const documents = new TextDocuments(TextDocument);
  let index: WorkspaceIndex = { routes: [], components: [] };

  connection.onInitialize((params) => {
    const root = params.rootUri ? URI.parse(params.rootUri).fsPath : null;
    index = loadWorkspaceIndex(root);
    return buildInitializeResult(params);
  });

  connection.onCompletion((params) => {
    const document = documents.get(params.textDocument.uri);
    if (document === undefined) return [];
    const source = document.getText();
    const offset = offsetAt(source, params.position.line, params.position.character);
    const context = classifyCompletionContext(source, offset);
    return buildCompletions(context, index);
  });

  documents.listen(connection);
  connection.listen();
}
```
Add `vscode-uri` to dependencies: edit `packages/language-server/package.json` dependencies → `"vscode-uri": "^3.0.8"`, then `pnpm install`.

- [ ] **Step 5: Run — expect PASS.**

Run: `pnpm install && pnpm --filter @vanrot/language-server exec vitest run tests/completion-handler.test.ts`

- [ ] **Step 6: Full package gate**

Run: `pnpm --filter @vanrot/language-server typecheck && pnpm --filter @vanrot/language-server test`
Expected: all suites green.

- [ ] **Step 7: `runIde` smoke**

Build server (`pnpm --filter @vanrot/language-server build`), `gradle runIde` from `editors/intellij/`, open a template, type `<` and `<vr route.` — verify element and route completions appear.

- [ ] **Step 8: Checkpoint — review M1 for commit.**

---

## Self-Review

- Spec M1 ("completion for vr/vr-* elements, route.* attributes, slots, and component tags") → Tasks 4–7 cover elements, routes, components; **slots completion** is partially covered (component tags) — slot-name completion needs the parent component's slot declarations and is folded into M2's slot resolution; note added here so it is not lost. The route + element + component tag completions are the M1 shippable core.
- Placeholder scan: deferred items (component tree walk, slot completion) are explicit decisions with a concrete landing point, not vague TODOs.
- Name consistency: `parseRouteIndex`/`RouteEntry`, `buildComponentIndex`/`ComponentEntry`, `classifyCompletionContext`/`CompletionContext`, `buildCompletions`/`CompletionIndexes`, `loadWorkspaceIndex`/`WorkspaceIndex`, `spanToRange`/`offsetAt` — consistent across tasks.
