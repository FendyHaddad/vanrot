# Vanrot Phase 12D Vite Plugin Production Hardening Implementation Plan

> **For inline execution:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@vanrot/vite-plugin` production-ready for current Vanrot component transforms, diagnostics, sourcemaps, dev HMR, and package-style build fixtures.

**Architecture:** Keep the Vite plugin as a thin integration layer. Add focused sourcemap conversion, richer diagnostic formatting, owner-module HMR, and package-output fixture coverage without changing runtime lifecycle semantics, compiler syntax, Phase 13 config conventions, or Phase 12E typing work.

**Tech Stack:** TypeScript, Vite 8 plugin API, Vitest, pnpm, Markdown.

**Execution Rule:** Work in the current `main` workspace only. Do not stage, commit, push, create a branch, create a worktree, or delegate work unless the user explicitly asks.

---

## File Structure

```txt
packages/vite-plugin/src/source-maps.ts
  Create. Converts compiler SourceMapping metadata into Vite-compatible source map objects for generated JS and CSS.

packages/vite-plugin/src/compile-for-vite.ts
  Modify. Include compiler metadata mappings in ViteCompileResult and build separate JS/CSS sourcemap objects.

packages/vite-plugin/src/plugin.ts
  Modify. Cache CSS and CSS maps per component path; return JS maps from component transforms; return CSS maps from virtual CSS loads.

packages/vite-plugin/src/hot-update.ts
  Modify. Return owner modules for Vite HMR when resolvable; send full reload only when no owner module can be found.

packages/vite-plugin/src/diagnostics.ts
  Modify. Format code frames, suggestions, and docs links in addition to location, code, and message.

packages/vite-plugin/tests/source-maps.test.ts
  Create. Unit tests for JS/CSS sourcemap conversion from compiler SourceMapping metadata.

packages/vite-plugin/tests/compile-for-vite.test.ts
  Modify. Assert compileForVite returns JS/CSS maps from compiler mappings.

packages/vite-plugin/tests/plugin-transform.test.ts
  Modify. Assert component transforms return maps and virtual CSS load returns code plus maps.

packages/vite-plugin/tests/plugin-dev-reload.test.ts
  Modify. Replace full-reload default expectation with owner-module HMR expectation and add missing-owner fallback coverage.

packages/vite-plugin/tests/diagnostics.test.ts
  Modify. Assert rich diagnostic formatting.

packages/vite-plugin/tests/plugin-build.test.ts
  Modify. Assert sourcemap assets are emitted and add clean fixture build coverage.

packages/vite-plugin/tests/fixtures/clean-app/*
  Create. App-style Vite fixture that imports `@vanrot/vite-plugin` and consumes built package outputs instead of package `src` aliases.

docs/superpowers/final-tdd-inventory.md
  Modify at completion. Mark verified 12D Vite plugin rows as Production-Ready and keep deferred 12E/Phase 13 rows unfinished.

docs/superpowers/feature-maturity.md
  Modify at completion. Update Phase 12 notes for completed 12D slice without marking all Phase 12 done.

docs/vanrot-presentation.html
  Modify at completion. Keep roadmap synchronized with the tracker.

docs/superpowers/plans/Phase-12D.md
  Track this plan as tasks are completed.
```

## Task 1: Record Baseline And Add HMR Red Coverage

**Files:**
- Modify: `packages/vite-plugin/tests/plugin-dev-reload.test.ts`
- Read: `audits/core/vite-plugin.audit.ts`
- Read: `packages/vite-plugin/src/hot-update.ts`

- [x] **Step 1: Confirm the existing 12D audit is red before implementation**

Run:

```bash
pnpm audit:core
```

Expected before implementation: fails on `audits/core/vite-plugin.audit.ts` because `handleVanrotHotUpdate()` sends `{ type: 'full-reload' }` and returns `[]` for a template edit with a known owner module.

- [x] **Step 2: Replace the full-reload default unit expectation with owner-module HMR**

In `packages/vite-plugin/tests/plugin-dev-reload.test.ts`, replace the test named `requests a full reload when a component template changes` with:

```ts
  it('returns and invalidates the owner module when a component template changes', async () => {
    const sent: unknown[] = [];
    const invalidated: string[] = [];
    const ownerModule = { id: '/repo/src/app.component.ts' };

    const result = await handleVanrotHotUpdate({
      file: '/repo/src/app.component.html',
      timestamp: Date.now(),
      modules: [],
      server: {
        config: {
          root: '/repo',
        },
        moduleGraph: {
          getModuleById(id: string) {
            return id === ownerModule.id ? ownerModule : undefined;
          },
          async getModuleByUrl(url: string) {
            return url === '/src/app.component.ts' ? ownerModule : undefined;
          },
          invalidateModule(module: { id: string }) {
            invalidated.push(module.id);
          },
        },
        ws: {
          send(message: unknown) {
            sent.push(message);
          },
        },
      },
    } as never);

    expect(result).toEqual([ownerModule]);
    expect(invalidated).toEqual(['/repo/src/app.component.ts']);
    expect(sent).not.toContainEqual({ type: 'full-reload' });
  });
```

- [x] **Step 3: Add missing-owner fallback coverage**

In the same `describe('Vanrot dev reload', ...)` block, add:

```ts
  it('falls back to full reload when no owner module can be resolved', async () => {
    const sent: unknown[] = [];
    const invalidated: string[] = [];

    const result = await handleVanrotHotUpdate({
      file: '/repo/src/app.component.css',
      timestamp: Date.now(),
      modules: [],
      server: {
        config: {
          root: '/repo',
        },
        moduleGraph: {
          getModuleById() {
            return undefined;
          },
          async getModuleByUrl() {
            return undefined;
          },
          invalidateModule(module: { id: string }) {
            invalidated.push(module.id);
          },
        },
        ws: {
          send(message: unknown) {
            sent.push(message);
          },
        },
      },
    } as never);

    expect(result).toEqual([]);
    expect(invalidated).toEqual([]);
    expect(sent).toContainEqual({ type: 'full-reload' });
  });
```

- [x] **Step 4: Run HMR tests to verify the new tests fail**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- plugin-dev-reload.test.ts
```

Expected before implementation: the owner-module test fails because current `handleVanrotHotUpdate()` returns `[]` and sends a full reload.

## Task 2: Implement Owner-Module HMR And Fallback Reload

**Files:**
- Modify: `packages/vite-plugin/src/hot-update.ts`
- Test: `packages/vite-plugin/tests/plugin-dev-reload.test.ts`
- Test: `audits/core/vite-plugin.audit.ts`

- [x] **Step 1: Update `handleVanrotHotUpdate()` to return owner modules**

In `packages/vite-plugin/src/hot-update.ts`, change `handleVanrotHotUpdate()` to:

```ts
export async function handleVanrotHotUpdate(ctx: HmrContext): Promise<ModuleNode[] | undefined> {
  const ownerComponentPath = findOwnerComponentPath(ctx.file);

  if (ownerComponentPath === undefined) {
    return undefined;
  }

  ctx.server.moduleGraph.onFileChange?.(ownerComponentPath);

  const ownerModules = await findOwnerModules(ctx, ownerComponentPath);

  if (ownerModules.length === 0) {
    ctx.server.ws.send({ type: 'full-reload' });
    return [];
  }

  const invalidatedModules = new Set<ModuleNode>();

  for (const ownerModule of ownerModules) {
    ctx.server.moduleGraph.invalidateModule(
      ownerModule,
      invalidatedModules,
      ctx.timestamp,
      true,
    );
  }

  return ownerModules;
}
```

- [x] **Step 2: Run HMR unit tests**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- plugin-dev-reload.test.ts
```

Expected: the owner-module HMR and fallback reload tests pass. Existing rebuild tests continue to pass because owner invalidation still clears stale output.

- [x] **Step 3: Run the 12D audit**

Run:

```bash
pnpm audit:core
```

Expected after this task: the Vite plugin audit no longer fails on template edits forcing full reload. Any remaining audit failures should be from slices outside 12D.

## Task 3: Add Vite Sourcemap Conversion Utilities

**Files:**
- Create: `packages/vite-plugin/src/source-maps.ts`
- Create: `packages/vite-plugin/tests/source-maps.test.ts`

- [x] **Step 1: Write sourcemap utility tests**

Create `packages/vite-plugin/tests/source-maps.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createViteSourceMap } from '@/source-maps.js';

describe('createViteSourceMap', () => {
  it('creates a Vite map for generated JavaScript mappings', () => {
    const map = createViteSourceMap({
      file: '/repo/src/app.component.ts',
      source: 'js',
      generatedCode: 'const value = 1;\n',
      mappings: [
        {
          generatedFile: 'js',
          generatedLine: 1,
          generatedColumn: 0,
          sourceFilePath: '/repo/src/app.component.html',
          sourceLine: 3,
          sourceColumn: 4,
        },
      ],
    });

    expect(map).toMatchObject({
      version: 3,
      file: '/repo/src/app.component.ts',
      sources: ['/repo/src/app.component.html'],
      names: [],
    });
    expect(map.sourcesContent).toBeUndefined();
    expect(map.mappings).toContain('A');
  });

  it('creates a Vite map for generated CSS mappings', () => {
    const map = createViteSourceMap({
      file: '/repo/src/app.component.css',
      source: 'css',
      generatedCode: '.app[data-vr-a] { color: red; }\n',
      mappings: [
        {
          generatedFile: 'css',
          generatedLine: 1,
          generatedColumn: 0,
          sourceFilePath: '/repo/src/app.component.css',
          sourceLine: 1,
          sourceColumn: 0,
        },
      ],
    });

    expect(map).toMatchObject({
      version: 3,
      file: '/repo/src/app.component.css',
      sources: ['/repo/src/app.component.css'],
      names: [],
    });
    expect(map.mappings).toContain('A');
  });

  it('returns an empty Vite map when no compiler mappings exist', () => {
    const map = createViteSourceMap({
      file: '/repo/src/app.component.ts',
      source: 'js',
      generatedCode: 'export default {};\n',
      mappings: [],
    });

    expect(map).toEqual({
      version: 3,
      file: '/repo/src/app.component.ts',
      sources: [],
      sourcesContent: undefined,
      names: [],
      mappings: '',
    });
  });
});
```

- [x] **Step 2: Run the new sourcemap tests to verify they fail**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- source-maps.test.ts
```

Expected before implementation: fails because `@/source-maps.js` does not exist.

- [x] **Step 3: Implement `source-maps.ts`**

Create `packages/vite-plugin/src/source-maps.ts`:

```ts
import type { SourceMapping } from '@vanrot/compiler';

export interface ViteSourceMap {
  version: 3;
  file: string;
  sources: string[];
  sourcesContent: undefined;
  names: string[];
  mappings: string;
}

interface CreateViteSourceMapOptions {
  file: string;
  source: SourceMapping['generatedFile'];
  generatedCode: string;
  mappings: SourceMapping[];
}

interface SourceIndexState {
  indexes: Map<string, number>;
  sources: string[];
}

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function createViteSourceMap(options: CreateViteSourceMapOptions): ViteSourceMap {
  const sourceState: SourceIndexState = {
    indexes: new Map<string, number>(),
    sources: [],
  };
  const relevantMappings = options.mappings
    .filter((mapping) => mapping.generatedFile === options.source)
    .sort(compareMappings);

  return {
    version: 3,
    file: options.file,
    sources: sourceState.sources,
    sourcesContent: undefined,
    names: [],
    mappings: encodeMappings(options.generatedCode, relevantMappings, sourceState),
  };
}

function compareMappings(left: SourceMapping, right: SourceMapping): number {
  if (left.generatedLine !== right.generatedLine) {
    return left.generatedLine - right.generatedLine;
  }

  return left.generatedColumn - right.generatedColumn;
}

function encodeMappings(
  generatedCode: string,
  mappings: SourceMapping[],
  sourceState: SourceIndexState,
): string {
  const lineCount = countGeneratedLines(generatedCode);
  const segmentsByLine = new Map<number, string[]>();
  let previousGeneratedColumn = 0;
  let previousSourceIndex = 0;
  let previousSourceLine = 0;
  let previousSourceColumn = 0;

  for (const mapping of mappings) {
    const generatedLineIndex = Math.max(0, mapping.generatedLine - 1);
    const generatedColumn = Math.max(0, mapping.generatedColumn);
    const sourceIndex = getSourceIndex(sourceState, mapping.sourceFilePath);
    const sourceLineIndex = Math.max(0, mapping.sourceLine - 1);
    const sourceColumn = Math.max(0, mapping.sourceColumn);
    const segment = [
      encodeVlq(generatedColumn - previousGeneratedColumn),
      encodeVlq(sourceIndex - previousSourceIndex),
      encodeVlq(sourceLineIndex - previousSourceLine),
      encodeVlq(sourceColumn - previousSourceColumn),
    ].join('');

    const lineSegments = segmentsByLine.get(generatedLineIndex) ?? [];
    lineSegments.push(segment);
    segmentsByLine.set(generatedLineIndex, lineSegments);

    previousGeneratedColumn = generatedColumn;
    previousSourceIndex = sourceIndex;
    previousSourceLine = sourceLineIndex;
    previousSourceColumn = sourceColumn;
  }

  return Array.from({ length: lineCount }, (_, lineIndex) => {
    const segments = segmentsByLine.get(lineIndex);
    return segments?.join(',') ?? '';
  }).join(';');
}

function countGeneratedLines(generatedCode: string): number {
  return generatedCode.split('\n').length;
}

function getSourceIndex(state: SourceIndexState, sourceFilePath: string): number {
  const existingIndex = state.indexes.get(sourceFilePath);

  if (existingIndex !== undefined) {
    return existingIndex;
  }

  const nextIndex = state.sources.length;
  state.indexes.set(sourceFilePath, nextIndex);
  state.sources.push(sourceFilePath);
  return nextIndex;
}

function encodeVlq(value: number): string {
  let vlq = value < 0 ? ((-value) << 1) + 1 : value << 1;
  let encoded = '';

  do {
    let digit = vlq & 31;
    vlq >>>= 5;

    if (vlq > 0) {
      digit |= 32;
    }

    encoded += base64Chars[digit] ?? '';
  } while (vlq > 0);

  return encoded;
}
```

- [x] **Step 4: Run sourcemap tests**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- source-maps.test.ts
```

Expected: all `createViteSourceMap` tests pass.

## Task 4: Return JS And CSS Maps From Compile And Plugin Hooks

**Files:**
- Modify: `packages/vite-plugin/src/compile-for-vite.ts`
- Modify: `packages/vite-plugin/src/plugin.ts`
- Modify: `packages/vite-plugin/tests/compile-for-vite.test.ts`
- Modify: `packages/vite-plugin/tests/plugin-transform.test.ts`

- [x] **Step 1: Add failing compile-for-vite map coverage**

In `packages/vite-plugin/tests/compile-for-vite.test.ts`, add:

```ts
  it('returns JavaScript and CSS sourcemaps from compiler mappings', async () => {
    const result = await compileForVite('/repo/src/app.component.ts', async () => ({
      js: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }',
      css: '.app[data-vr-a] { color: red; }',
      diagnostics: [],
      metadata: {
        componentName: 'AppComponent',
        scopeAttribute: 'data-vr-a',
        features: [],
        componentDependencies: [],
        mappings: [
          {
            generatedFile: 'js',
            generatedLine: 1,
            generatedColumn: 0,
            sourceFilePath: '/repo/src/app.component.html',
            sourceLine: 1,
            sourceColumn: 0,
          },
          {
            generatedFile: 'css',
            generatedLine: 1,
            generatedColumn: 0,
            sourceFilePath: '/repo/src/app.component.css',
            sourceLine: 1,
            sourceColumn: 0,
          },
        ],
      },
    }));

    expect(result.map).toMatchObject({
      version: 3,
      file: '/repo/src/app.component.ts',
      sources: ['/repo/src/app.component.html'],
    });
    expect(result.cssMap).toMatchObject({
      version: 3,
      file: '/repo/src/app.component.css',
      sources: ['/repo/src/app.component.css'],
    });
  });
```

- [x] **Step 2: Run compile-for-vite tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- compile-for-vite.test.ts
```

Expected before implementation: fails because `ViteCompileResult` has no `map` or `cssMap`.

- [x] **Step 3: Update `compile-for-vite.ts`**

Replace `packages/vite-plugin/src/compile-for-vite.ts` with:

```ts
import type { CompileDiagnostic, CompileOptions, CompileResult } from '@vanrot/compiler';
import { compileComponentFromFiles } from '@vanrot/compiler';
import { createViteSourceMap, type ViteSourceMap } from './source-maps.js';
import { toPublicCssModuleId, toPublicSourceModuleId } from './virtual-modules.js';

export interface ViteCompileResult {
  code: string;
  css: string;
  map: ViteSourceMap;
  cssMap: ViteSourceMap;
  diagnostics: CompileDiagnostic[];
}

export type CompileForViteFunction = (
  componentPath: string,
  options: CompileOptions,
) => Promise<CompileResult>;

export async function compileForVite(
  componentPath: string,
  compile: CompileForViteFunction = compileComponentFromFiles,
): Promise<ViteCompileResult> {
  const sourceModuleId = toPublicSourceModuleId(componentPath);
  const cssModuleId = toPublicCssModuleId(componentPath);
  const result = await compile(componentPath, {
    componentImportSpecifier: sourceModuleId,
  });
  const code = [
    `import '${cssModuleId}';`,
    result.js,
    'const component = { createComponent };',
    'export default component;',
  ].join('\n\n');
  const stylePath = componentPath.replace(/\.(component|page|button)\.ts$/, '.$1.css');

  return {
    code,
    css: result.css,
    map: createViteSourceMap({
      file: componentPath,
      source: 'js',
      generatedCode: code,
      mappings: result.metadata.mappings,
    }),
    cssMap: createViteSourceMap({
      file: stylePath,
      source: 'css',
      generatedCode: result.css,
      mappings: result.metadata.mappings,
    }),
    diagnostics: result.diagnostics,
  };
}
```

- [x] **Step 4: Add plugin transform and virtual CSS map coverage**

In `packages/vite-plugin/tests/plugin-transform.test.ts`, update existing compile stubs to include `map` and `cssMap` where TypeScript requires them. Add this test:

```ts
  it('returns component and virtual CSS sourcemaps', async () => {
    const plugin = createVanrotPluginForTests({
      compile: async () => ({
        code: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }\nconst component = { createComponent };\nexport default component;',
        css: '.app{color:red}',
        map: {
          version: 3,
          file: '/repo/src/app.component.ts',
          sources: ['/repo/src/app.component.html'],
          sourcesContent: undefined,
          names: [],
          mappings: 'AAAA',
        },
        cssMap: {
          version: 3,
          file: '/repo/src/app.component.css',
          sources: ['/repo/src/app.component.css'],
          sourcesContent: undefined,
          names: [],
          mappings: 'AAAA',
        },
        diagnostics: [],
      }),
    });

    const transformResult = await getTransformHook(plugin).call(
      {
        addWatchFile() {},
        error(error: string) {
          throw new Error(error);
        },
        warn() {},
      } as never,
      'export class AppComponent {}',
      '/repo/src/app.component.ts',
    );

    expect(transformResult).toEqual(
      expect.objectContaining({
        code: expect.stringContaining('export default component;'),
        map: expect.objectContaining({
          sources: ['/repo/src/app.component.html'],
        }),
      }),
    );

    const css = await getLoadHook(plugin).call(
      {} as never,
      '\0vanrot:css:%2Frepo%2Fsrc%2Fapp.component.ts.css',
    );

    expect(css).toEqual({
      code: '.app{color:red}',
      map: expect.objectContaining({
        sources: ['/repo/src/app.component.css'],
      }),
    });
  });
```

- [x] **Step 5: Update `plugin.ts` to cache and return maps**

In `packages/vite-plugin/src/plugin.ts`:

1. Add a CSS map cache:

```ts
  const cssByComponentPath = internals.initialCss ?? new Map<string, string>();
  const cssMapByComponentPath = new Map<string, ViteCompileResult['cssMap']>();
```

2. Return code and map for virtual CSS loads:

```ts
      if (decoded.kind === 'css') {
        return {
          code: cssByComponentPath.get(decoded.filePath) ?? '',
          map: cssMapByComponentPath.get(decoded.filePath) ?? null,
        };
      }
```

3. Cache CSS maps and return transform maps:

```ts
      cssByComponentPath.set(files.componentPath, result.css);
      cssMapByComponentPath.set(files.componentPath, result.cssMap);

      return {
        code: result.code,
        map: result.map,
      };
```

- [x] **Step 6: Run compile and transform tests**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- compile-for-vite.test.ts plugin-transform.test.ts
```

Expected: compile and transform tests pass with maps returned.

## Task 5: Rich Diagnostic Formatting

**Files:**
- Modify: `packages/vite-plugin/src/diagnostics.ts`
- Modify: `packages/vite-plugin/tests/diagnostics.test.ts`
- Modify: `packages/vite-plugin/tests/plugin-transform.test.ts`

- [x] **Step 1: Replace diagnostics test with rich-format coverage**

In `packages/vite-plugin/tests/diagnostics.test.ts`, replace the existing test with:

```ts
import { describe, expect, it } from 'vitest';
import { formatDiagnostic } from '@/diagnostics.js';

describe('formatDiagnostic', () => {
  it('includes location, code, message, code frame, suggestion, and docs path', () => {
    expect(
      formatDiagnostic({
        severity: 'error',
        code: 'VR005',
        message: 'Unsupported template syntax',
        filePath: '/repo/src/app.component.html',
        line: 3,
        column: 12,
        endLine: 3,
        endColumn: 18,
        sourceText: '@bad',
        codeFrame: '3 | <button @bad></button>\n  |            ^^^^^^',
        suggestion: 'Use supported Vanrot template syntax.',
        docsPath: '/docs/compiler/template-syntax',
      }),
    ).toBe(
      [
        '/repo/src/app.component.html:3:12 VR005 Unsupported template syntax',
        '3 | <button @bad></button>',
        '  |            ^^^^^^',
        'Suggestion: Use supported Vanrot template syntax.',
        'Docs: /docs/compiler/template-syntax',
      ].join('\n'),
    );
  });

  it('omits optional detail lines when fields are empty', () => {
    expect(
      formatDiagnostic({
        severity: 'warning',
        code: 'VR008',
        message: 'CSS selector cannot be scoped',
        filePath: '/repo/src/app.component.css',
        line: 1,
        column: 1,
        endLine: 1,
        endColumn: 7,
        sourceText: '',
        codeFrame: '',
        suggestion: '',
        docsPath: '',
      }),
    ).toBe('/repo/src/app.component.css:1:1 VR008 CSS selector cannot be scoped');
  });
});
```

- [x] **Step 2: Run diagnostics tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- diagnostics.test.ts
```

Expected before implementation: rich-format test fails because current formatter returns only one line.

- [x] **Step 3: Implement rich formatter**

Replace `packages/vite-plugin/src/diagnostics.ts` with:

```ts
import type { CompileDiagnostic } from '@vanrot/compiler';

export function formatDiagnostic(diagnostic: CompileDiagnostic): string {
  return [
    `${diagnostic.filePath}:${diagnostic.line}:${diagnostic.column} ${diagnostic.code} ${diagnostic.message}`,
    diagnostic.codeFrame,
    diagnostic.suggestion === '' ? '' : `Suggestion: ${diagnostic.suggestion}`,
    diagnostic.docsPath === '' ? '' : `Docs: ${diagnostic.docsPath}`,
  ]
    .filter((line) => line !== '')
    .join('\n');
}
```

- [x] **Step 4: Run diagnostics and transform tests**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- diagnostics.test.ts plugin-transform.test.ts
```

Expected: diagnostics tests pass; transform tests that assert thrown/warned diagnostic text pass after expected strings are updated to include optional details where test diagnostics provide them.

## Task 6: Build Sourcemap And Clean Fixture Coverage

**Files:**
- Create: `packages/vite-plugin/tests/fixtures/clean-app/package.json`
- Create: `packages/vite-plugin/tests/fixtures/clean-app/index.html`
- Create: `packages/vite-plugin/tests/fixtures/clean-app/tsconfig.json`
- Create: `packages/vite-plugin/tests/fixtures/clean-app/vite.config.ts`
- Create: `packages/vite-plugin/tests/fixtures/clean-app/src/main.ts`
- Create: `packages/vite-plugin/tests/fixtures/clean-app/src/app/app.component.ts`
- Create: `packages/vite-plugin/tests/fixtures/clean-app/src/app/app.component.html`
- Create: `packages/vite-plugin/tests/fixtures/clean-app/src/app/app.component.css`
- Modify: `packages/vite-plugin/tests/plugin-build.test.ts`

- [x] **Step 1: Add clean fixture files**

Create `packages/vite-plugin/tests/fixtures/clean-app/package.json`:

```json
{
  "name": "@vanrot/fixture-clean-app",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.1.3",
  "dependencies": {
    "@vanrot/runtime": "workspace:*",
    "@vanrot/vite-plugin": "workspace:*",
    "vite": "^8.0.10"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

Create `packages/vite-plugin/tests/fixtures/clean-app/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanrot Clean Fixture</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Create `packages/vite-plugin/tests/fixtures/clean-app/tsconfig.json`:

```json
{
  "extends": "../../../../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "vite.config.ts"]
}
```

Create `packages/vite-plugin/tests/fixtures/clean-app/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import vanrot from '@vanrot/vite-plugin';

export default defineConfig({
  plugins: [vanrot()],
  build: {
    sourcemap: true,
  },
});
```

Create `packages/vite-plugin/tests/fixtures/clean-app/src/main.ts`:

```ts
import { mount } from '@vanrot/runtime';
import AppComponent from './app/app.component';

const target = document.querySelector('#app');

if (!(target instanceof HTMLElement)) {
  throw new Error('Missing app target.');
}

mount(AppComponent, target);
```

Create `packages/vite-plugin/tests/fixtures/clean-app/src/app/app.component.ts`:

```ts
export class AppComponent {
  readonly title = 'Clean fixture';
}
```

Create `packages/vite-plugin/tests/fixtures/clean-app/src/app/app.component.html`:

```html
<section class="clean-fixture">
  <h1>{{ title }}</h1>
</section>
```

Create `packages/vite-plugin/tests/fixtures/clean-app/src/app/app.component.css`:

```css
.clean-fixture {
  color: rebeccapurple;
}
```

- [x] **Step 2: Add build tests for sourcemaps and clean fixture**

In `packages/vite-plugin/tests/plugin-build.test.ts`, add `cleanFixtureRoot` and `cleanOutDir` constants:

```ts
const cleanFixtureRoot = resolve(import.meta.dirname, 'fixtures/clean-app');
const cleanOutDir = resolve(cleanFixtureRoot, 'dist');
```

Update `afterEach()`:

```ts
  afterEach(async () => {
    await Promise.all([
      rm(outDir, { recursive: true, force: true }),
      rm(cleanOutDir, { recursive: true, force: true }),
    ]);
  });
```

Add this test:

```ts
  it('builds a clean app-style fixture from package outputs with sourcemaps', async () => {
    await build({
      root: cleanFixtureRoot,
      logLevel: 'silent',
      build: {
        outDir: cleanOutDir,
        emptyOutDir: true,
        sourcemap: true,
      },
    });

    const assets = await readdir(resolve(cleanOutDir, 'assets'));
    expect(assets).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/\.js$/),
        expect.stringMatching(/\.css$/),
        expect.stringMatching(/\.js\.map$/),
        expect.stringMatching(/\.css\.map$/),
      ]),
    );

    const cssAssets = assets.filter((asset) => asset.endsWith('.css'));
    const cssOutput = await Promise.all(
      cssAssets.map((asset) => readFile(resolve(cleanOutDir, 'assets', asset), 'utf8')),
    );
    expect(cssOutput.join('\n')).toContain('rebeccapurple');
  });
```

- [x] **Step 3: Run build tests to verify failure before package-output compatibility is complete**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- plugin-build.test.ts
```

Expected before all previous tasks are integrated: fails if sourcemap assets are missing or package-output resolution cannot consume built outputs.

- [x] **Step 4: Run package build then build tests**

Run:

```bash
pnpm --filter @vanrot/vite-plugin build
pnpm --filter @vanrot/vite-plugin test -- plugin-build.test.ts
```

Expected: Vite plugin package builds, then both fixture build tests pass with JS, CSS, and sourcemap assets.

## Task 7: Package Verification And Audit Burn-Down

**Files:**
- Read: `packages/vite-plugin/package.json`
- Read: `vitest.audit.config.ts`
- Read: `audits/core/vite-plugin.audit.ts`

- [x] **Step 1: Run focused Vite plugin test suite**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test
```

Expected: all `@vanrot/vite-plugin` tests pass.

- [x] **Step 2: Run focused Vite plugin typecheck**

Run:

```bash
pnpm --filter @vanrot/vite-plugin typecheck
```

Expected: package source and test TypeScript projects typecheck cleanly.

- [x] **Step 3: Run core audit**

Run:

```bash
pnpm audit:core
```

Expected: the 12D Vite plugin audit passes. If audit failures remain for 12E TypeScript contracts, leave them tracked for 12E rather than broadening 12D.

## Task 8: Phase 12D Documentation And Tracker Updates

**Files:**
- Modify: `docs/superpowers/plans/Phase-12D.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/vanrot-presentation.html`

- [x] **Step 1: Update final TDD inventory Vite plugin rows**

In `docs/superpowers/final-tdd-inventory.md`, update the `@vanrot/vite-plugin` rows that Phase 12D verifies:

```md
| API | `vanrot()` default plugin export | Production-Ready | Plugin works in dev/build, has typed options, peer dependency behavior, and examples. | Phase 4, Phase 12D | Named `vanrotPlugin` alias also exists. |
| options | include/exclude normalization | Production-Ready | Options cover `.component.ts`, `.page.ts`, `.button.ts`, custom patterns, and invalid options. | Phase 4, Phase 12D | Phase 12D production-tests current defaults; Phase 13 owns config-driven convention expansion. |
| transform | component TS transform | Production-Ready | Vite transforms supported role modules consistently in dev and production build. | Phase 4, Phase 12D | Aligns with compiler source-map metadata. |
| virtual modules | virtual source module | Production-Ready | Prevents recursive transforms, preserves source imports, and handles encoded paths cross-platform. | Phase 4, Phase 12D | Needed for transformed component class imports. |
| virtual modules | virtual CSS module | Production-Ready | CSS loads in dev, extracts in build, invalidates correctly, and maps back to owner file. | Phase 4, Phase 12D | Build fixture emits CSS and sourcemaps. |
| diagnostics | Vite diagnostics bridge | Production-Ready | Compiler diagnostics surface as Vite errors/warnings with code frames, suggestions, docs links, and source positions. | Phase 4, Phase 12D | Phase 12D keeps this text-based; overlay metadata remains out of scope. |
| dev server | sibling file watching | Production-Ready | TS/HTML/CSS changes invalidate the right module without stale output. | Phase 4, Phase 12D | Owner-module HMR covers sibling edits. |
| dev server | full reload fallback | Production-Ready | Full reload remains correct as a fallback but does not hide missing true HMR. | Phase 4, Phase 12D | Full reload is only the missing-owner fallback. |
| dev server | true state-preserving HMR | Production-Ready | HTML/CSS updates preserve state where safe and clean up invalidated generated effects. | Phase 12D | Phase 12D returns owner modules to Vite; generated accept/dispose remains future hardening if needed. |
| build | production build fixture | Production-Ready | Build emits correct JS/CSS assets, sourcemaps where configured, and works from a clean fixture install. | Phase 4, Phase 12D, Phase 26 | Phase 12D adds clean app-style package-output fixture coverage; Phase 26 owns final release install. |
```

Keep the `typing | transformed component imports` row deferred to Phase 12E.

- [x] **Step 2: Update feature maturity ledger**

In `docs/superpowers/feature-maturity.md`, update Phase 12 notes so the Vite plugin sub-slice is recorded as completed, but keep the overall Phase 12 row unchecked until Phase 12E is complete.

Use this wording in the Phase 12 audit lane note if the surrounding table still matches:

```md
Phase 12A created the red lane. Phase 12B burned down runtime audit failures, Phase 12C burned down compiler audit failures, and Phase 12D burned down Vite plugin audit failures; TypeScript contract audit failures remain owned by 12E.
```

- [x] **Step 3: Update presentation roadmap**

In `docs/vanrot-presentation.html`, update the roadmap text for Phase 12 so it lists runtime, compiler, and Vite plugin hardening as completed slices while TypeScript contracts remain next/pending.

Use concise visible wording:

```html
<span>12B runtime, 12C compiler, and 12D Vite plugin hardening complete; 12E TypeScript contracts next.</span>
```

Adjust the exact tag only to match the existing slide markup.

- [x] **Step 4: Check off completed plan tasks**

As each task is completed, update the matching checkboxes in `docs/superpowers/plans/Phase-12D.md` from `- [ ]` to `- [x]`. Do not mark this documentation task complete until the inventory, maturity ledger, and presentation are synchronized.

- [x] **Step 5: Run phase documentation verifier**

Run:

```bash
pnpm verify:phase-docs
```

Expected: phase documentation guardrails pass. If they fail, update the tracker, plan, inventory, or presentation until the command passes.

## Task 9: Final Verification

**Files:**
- Read: `package.json`
- Read: `docs/superpowers/plans/Phase-12D.md`
- Read: `docs/superpowers/feature-maturity.md`
- Read: `docs/superpowers/final-tdd-inventory.md`
- Read: `docs/vanrot-presentation.html`

- [x] **Step 1: Run focused package verification**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/vite-plugin typecheck
```

Expected: both commands pass.

- [x] **Step 2: Run audit verification**

Run:

```bash
pnpm audit:core
```

Expected: Phase 12D Vite plugin audit passes. Any remaining failures must be explicitly attributable to a later phase before this task is considered complete.

- [x] **Step 3: Run full repository verification**

Run:

```bash
pnpm verify
```

Expected: full verification passes, including typecheck, tests, build, runtime size budget, and phase docs.

- [x] **Step 4: Record final workspace status**

Run:

```bash
git status --short --branch
```

Expected: changed files are limited to Phase 12D implementation, tests, docs, and any unrelated pre-existing user edits. Do not stage or commit unless the user asks.

## Self-Review

Spec coverage:

- Exports/options/defaults: Task 7 package verification plus existing tests; Task 8 inventory update.
- Transform and virtual modules: Tasks 3 and 4.
- JS/CSS sourcemaps: Tasks 3, 4, and 6.
- Diagnostics formatting: Task 5.
- Sibling watching and HMR: Tasks 1 and 2.
- Clean fixture: Task 6.
- Documentation and tracker updates: Task 8.
- Verification gates: Tasks 7 and 9.

Placeholder scan:

- No incomplete-marker terms or delayed-work phrases are used.
- Every code-changing step includes concrete code or exact replacement guidance.
- Commands include expected outcomes.

Type consistency:

- `ViteCompileResult` includes `code`, `css`, `map`, `cssMap`, and `diagnostics`.
- `createViteSourceMap()` consumes `SourceMapping[]` from `@vanrot/compiler`.
- Virtual CSS load returns `{ code, map }`, which Vite accepts from `load()`.
