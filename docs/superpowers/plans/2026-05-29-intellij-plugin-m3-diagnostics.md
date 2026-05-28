# Vanrot IntelliJ Plugin — M3 Diagnostic Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (no subagents — CLAUDE.md). Checkbox steps.
>
> **Git policy:** User owns git. **Checkpoint** = stop + summarize; never `git add/commit/push`.
>
> **Depends on:** M0 (server + doc sync). Independent of M1/M2 logic but builds on the same server.

**Goal:** Editor squiggles in vanrot templates exactly match build errors — every `@vanrot/compiler` `VR####` diagnostic for the component is published to the editor with its precise range, refreshed (debounced) as the user types. Sequenced before M4 because it is direct compiler reuse: lower risk, high value.

**Architecture:** On open/change of a template document, resolve its component file set (template → sibling `.component.ts` + `.css`), compile with **live in-memory sources** via `compileComponent` (not `compileComponentFromFiles`, so unsaved edits are diagnosed), filter the resulting `CompileDiagnostic[]` to those whose `filePath` is the template, map them to LSP `Diagnostic[]`, and `publishDiagnostics`. A small debounce avoids compiling on every keystroke. No Kotlin changes.

**Tech Stack:** TypeScript, `@vanrot/compiler` (`compileComponent`, `createComponentFileSet`, `CompileDiagnostic`), `vscode-languageserver`, Node `fs`, vitest TDD.

---

## File Structure

- `packages/language-server/src/features/diagnostics.ts` — `diagnoseTemplate(...)` → `Diagnostic[]` (pure mapping) + `compileTemplateDiagnostics(...)` (reads sibling sources).
- `packages/language-server/src/lsp/debounce.ts` — tiny debounce helper.
- Modify `packages/language-server/src/server.ts` — run diagnostics on `onDidOpen`/`onDidChangeContent`, publish.
- Tests under `packages/language-server/tests/`.

---

## Task 1: Diagnostic mapping (compiler diagnostic → LSP diagnostic)

**Files:**
- Create: `packages/language-server/src/features/diagnostics.ts`
- Test: `packages/language-server/tests/diagnostics-map.test.ts`

`CompileDiagnostic` is 1-based (`line`/`column`/`endLine`/`endColumn`); LSP `Diagnostic.range` is 0-based. Map severity, attach the `VR####` code, and carry the source label.

- [x] **Step 1: Failing test**

`packages/language-server/tests/diagnostics-map.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { DiagnosticSeverity } from 'vscode-languageserver';
import type { CompileDiagnostic } from '@vanrot/compiler';
import { toLspDiagnostics } from '../src/features/diagnostics.js';

const compileDiagnostic: CompileDiagnostic = {
  code: 'VR006',
  severity: 'error',
  message: 'Unsupported expression.',
  filePath: '/app/x.component.html',
  line: 2,
  column: 5,
  endLine: 2,
  endColumn: 12,
  sourceText: '',
  codeFrame: '',
  suggestion: '',
  docsPath: '',
};

describe('toLspDiagnostics', () => {
  it('maps a compiler diagnostic for the target file to a 0-based LSP diagnostic', () => {
    const [diagnostic] = toLspDiagnostics([compileDiagnostic], '/app/x.component.html');
    expect(diagnostic?.severity).toBe(DiagnosticSeverity.Error);
    expect(diagnostic?.code).toBe('VR006');
    expect(diagnostic?.source).toBe('vanrot');
    expect(diagnostic?.range).toEqual({
      start: { line: 1, character: 4 },
      end: { line: 1, character: 11 },
    });
  });

  it('filters out diagnostics for other files', () => {
    expect(toLspDiagnostics([compileDiagnostic], '/app/other.component.html')).toHaveLength(0);
  });

  it('maps warning severity', () => {
    const warning = { ...compileDiagnostic, severity: 'warning' as const };
    expect(toLspDiagnostics([warning], '/app/x.component.html')[0]?.severity).toBe(DiagnosticSeverity.Warning);
  });
});
```

- [x] **Step 2: Run — expect FAIL.**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/diagnostics-map.test.ts`

- [x] **Step 3: Implement the mapping**

`packages/language-server/src/features/diagnostics.ts`:
```ts
import { type Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import type { CompileDiagnostic } from '@vanrot/compiler';

export function toLspDiagnostics(
  compileDiagnostics: readonly CompileDiagnostic[],
  templatePath: string,
): Diagnostic[] {
  const result: Diagnostic[] = [];
  for (const diagnostic of compileDiagnostics) {
    if (diagnostic.filePath !== templatePath) continue;
    result.push({
      severity: diagnostic.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
      code: diagnostic.code,
      source: 'vanrot',
      message: diagnostic.message,
      range: {
        start: { line: diagnostic.line - 1, character: diagnostic.column - 1 },
        end: { line: diagnostic.endLine - 1, character: diagnostic.endColumn - 1 },
      },
    });
  }
  return result;
}
```

- [x] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 2: Compile a template with live sources

**Files:**
- Modify: `packages/language-server/src/features/diagnostics.ts`
- Test: `packages/language-server/tests/diagnostics-compile.test.ts`

Given the open template path + its live text, locate the sibling `.component.ts` and `.css` (via `createComponentFileSet` after deriving the component path), read those from disk, compile with `compileComponent`, and return mapped diagnostics for the template.

- [x] **Step 1: Failing test (uses a temp fixture component on disk)**

`packages/language-server/tests/diagnostics-compile.test.ts`:
```ts
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileTemplateDiagnostics } from '../src/features/diagnostics.js';

function fixture(templateText: string) {
  const dir = mkdtempSync(join(tmpdir(), 'vr-diag-'));
  writeFileSync(join(dir, 'x.component.ts'), 'export class XComponent {}\n');
  writeFileSync(join(dir, 'x.component.css'), '');
  writeFileSync(join(dir, 'x.component.html'), templateText);
  return join(dir, 'x.component.html');
}

describe('compileTemplateDiagnostics', () => {
  it('returns no diagnostics for a valid template', async () => {
    const path = fixture('<p>hello</p>\n');
    const diagnostics = await compileTemplateDiagnostics(path, '<p>hello</p>\n');
    expect(diagnostics).toHaveLength(0);
  });

  it('flags an unsupported expression with a VR code', async () => {
    const path = fixture('<p>{{ a = 1 }}</p>\n');
    const diagnostics = await compileTemplateDiagnostics(path, '<p>{{ a = 1 }}</p>\n');
    expect(diagnostics.some((diagnostic) => typeof diagnostic.code === 'string')).toBe(true);
  });
});
```
> The second case assumes `{{ a = 1 }}` triggers `VR006` (assignment is unsupported — confirmed by `rewrite-expression.ts`). If the compiler reports it on a different node/file, adjust the assertion to the actual emitted diagnostic; the point is non-empty diagnostics with a `VR` code.

- [x] **Step 2: Run — expect FAIL.**

- [x] **Step 3: Implement**

Add to `diagnostics.ts`:
```ts
import { readFileSync } from 'node:fs';
import { compileComponent, createComponentFileSet } from '@vanrot/compiler';

export async function compileTemplateDiagnostics(
  templatePath: string,
  templateText: string,
): Promise<Diagnostic[]> {
  const componentPath = templatePath.replace(/\.html$/, '.ts');
  const fileSet = createComponentFileSet(componentPath);
  if (fileSet === null) return [];

  const componentSource = readOptional(fileSet.componentPath);
  const styleSource = readOptional(fileSet.stylePath);
  if (componentSource === null) return [];

  const result = compileComponent({
    componentPath: fileSet.componentPath,
    componentSource,
    templatePath: fileSet.templatePath,
    templateSource: templateText,
    stylePath: fileSet.stylePath,
    styleSource: styleSource ?? '',
  });

  return toLspDiagnostics(result.diagnostics, fileSet.templatePath);
}

function readOptional(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}
```
> Confirm `compileComponent` is synchronous and accepts a `ComponentSource` object as its first argument (per `packages/compiler/src/api/compile-component.ts`). If it is async, `await` it. Confirm `fileSet.templatePath` equals the on-disk template path so the `toLspDiagnostics` filter matches; if `createComponentFileSet` derives a different template name, pass `templatePath` directly to the filter instead.

- [x] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 3: Debounce helper

**Files:**
- Create: `packages/language-server/src/lsp/debounce.ts`
- Test: `packages/language-server/tests/debounce.test.ts`

- [x] **Step 1: Failing test**

`packages/language-server/tests/debounce.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/lsp/debounce.js';

describe('debounce', () => {
  it('invokes once after the trailing delay', async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const run = debounce(spy, 50);
    run('a');
    run('b');
    vi.advanceTimersByTime(60);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('b');
    vi.useRealTimers();
  });
});
```

- [x] **Step 2: Run — expect FAIL.**

- [x] **Step 3: Implement**

`packages/language-server/src/lsp/debounce.ts`:
```ts
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  let handle: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (handle !== null) clearTimeout(handle);
    handle = setTimeout(() => {
      handle = null;
      fn(...args);
    }, delayMs);
  };
}
```

- [x] **Step 4: Run — expect PASS.** **Step 5: Checkpoint.**

---

## Task 4: Publish diagnostics from the server

**Files:**
- Modify: `packages/language-server/src/server.ts`
- Test: `packages/language-server/tests/diagnostics-handler.test.ts`

- [x] **Step 1: Failing integration test (expects a `publishDiagnostics` notification after open)**

`packages/language-server/tests/diagnostics-handler.test.ts`:
```ts
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createConnection } from 'vscode-languageserver/node.js';
import {
  DidOpenTextDocumentNotification,
  InitializeRequest,
  PublishDiagnosticsNotification,
  StreamMessageReader,
  StreamMessageWriter,
  createProtocolConnection,
} from 'vscode-languageserver-protocol/node.js';
import { URI } from 'vscode-uri';
import { startLanguageServer } from '../src/server.js';

describe('diagnostics handler', () => {
  it('publishes diagnostics for an opened template', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'vr-diag-h-'));
    writeFileSync(join(dir, 'x.component.ts'), 'export class XComponent {}\n');
    writeFileSync(join(dir, 'x.component.css'), '');
    const templatePath = join(dir, 'x.component.html');
    writeFileSync(templatePath, '<p>{{ a = 1 }}</p>\n');
    const uri = URI.file(templatePath).toString();

    const c2s = new PassThrough();
    const s2c = new PassThrough();
    startLanguageServer(createConnection(new StreamMessageReader(c2s), new StreamMessageWriter(s2c)));
    const client = createProtocolConnection(new StreamMessageReader(s2c), new StreamMessageWriter(c2s));
    client.listen();

    const received = new Promise<number>((resolve) => {
      client.onNotification(PublishDiagnosticsNotification.type, (params) => {
        if (params.uri === uri) resolve(params.diagnostics.length);
      });
    });

    await client.sendRequest(InitializeRequest.type, { processId: null, rootUri: null, capabilities: {} });
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: '<p>{{ a = 1 }}</p>\n' },
    });

    expect(await received).toBeGreaterThan(0);
    client.dispose();
  });
});
```

- [x] **Step 2: Run — expect FAIL.**

- [x] **Step 3: Wire diagnostics in `server.ts`**

In `startLanguageServer`, after wiring documents, add a debounced runner that compiles + publishes on open/change:
```ts
import { compileTemplateDiagnostics } from './features/diagnostics.js';
import { debounce } from './lsp/debounce.js';
import { URI } from 'vscode-uri';

  const runDiagnostics = (uri: string): void => {
    const document = documents.get(uri);
    if (document === undefined) return;
    const fsPath = URI.parse(uri).fsPath;
    void compileTemplateDiagnostics(fsPath, document.getText()).then((diagnostics) => {
      connection.sendDiagnostics({ uri, diagnostics });
    });
  };
  const scheduleDiagnostics = debounce(runDiagnostics, 200);

  documents.onDidOpen((event) => runDiagnostics(event.document.uri));
  documents.onDidChangeContent((event) => scheduleDiagnostics(event.document.uri));
```
(Open runs immediately; edits are debounced. `connection.sendDiagnostics` is the push channel.)

- [x] **Step 4: Run — expect PASS.**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/diagnostics-handler.test.ts`

- [ ] **Step 5: Full gate + `runIde` smoke**

Run: `pnpm --filter @vanrot/language-server typecheck && pnpm --filter @vanrot/language-server test`
Then build + `gradle runIde`: open a template with a known compiler error (e.g. missing sibling file, unsupported expression) and confirm the squiggle + `VR####` code matches `vr build`. Fix the error and confirm the squiggle clears on edit (debounced).

  - 2026-05-29: Automated M3 gates passed: targeted red/green diagnostics tests, `pnpm --filter @vanrot/language-server typecheck`, `pnpm --filter @vanrot/language-server test`, `pnpm --filter @vanrot/language-server build`, root `pnpm typecheck`, root `pnpm test`, root `pnpm build`, size/site/AI/security/final-inventory/phase-doc verifiers, and escalated `pnpm verify:release-dry-run`. IntelliJ Gradle gate passed on Corretto 21 (`test buildPlugin verifyPlugin`) and `runIde` loaded Vanrot Templates (0.0.0) without current-run plugin errors. Native IDE squiggle/edit-clear UI smoke remains manual, so this checkbox stays open.

- [ ] **Step 6: Checkpoint — review M3 for commit.**

---

## Self-Review

- Spec M3 ("pipe @vanrot/compiler VR#### diagnostics straight to LSP diagnostics with source ranges; sequenced before M4") → Tasks 1 (mapping + ranges + code), 2 (live compile), 4 (push). ✔
- Live editing: uses `compileComponent` with in-memory template text so unsaved edits are diagnosed — deliberate choice over `compileComponentFromFiles` (disk only). ✔
- Placeholder scan: the two compiler-shape caveats are concrete verification steps. No vague TODOs.
- Name consistency: `toLspDiagnostics`, `compileTemplateDiagnostics`, `debounce`, `runDiagnostics`/`scheduleDiagnostics` — consistent; reuses no conflicting names from M1/M2.
