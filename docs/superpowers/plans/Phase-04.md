# Vanrot Vite Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build demo-capable Vite integration so Vanrot component convention files compile through Vite dev/build and rebuild when TypeScript, HTML, or CSS component files change.

**Architecture:** `@vanrot/vite-plugin` runs as a pre-transform Vite plugin for `.component.ts` entries, delegates component compilation to `@vanrot/compiler`, and exposes original component source and scoped CSS through internal virtual modules. A narrow runtime mount bridge lets app code import the transformed component module and call `mount(App, target)`.

**Tech Stack:** TypeScript 5, Vitest 4, Vite 8 plugin API, Node `fs/promises`, `node:path`, Vite programmatic `build()` and dev server APIs, Vanrot compiler Phase 3 API, Vanrot runtime Phase 2 API.

**Spec:** `docs/superpowers/specs/Phase-04.md`

---

## Prerequisites

Do not start implementation until Phase 3 compiler work is merged or available in an isolated worktree.

If Phase 3 is still running in another Codex app session, keep this plan as documentation only. Do not edit `packages/compiler`, `packages/runtime`, or `packages/vite-plugin` in this workspace until the Phase 3 branch is integrated or a separate worktree is created.

Before implementing, verify the compiler exports:

```ts
compileComponentFromFiles(componentPath: string, options?: {
  componentImportSpecifier?: string;
}): Promise<CompileResult>;
```

If the option is missing after Phase 3 lands, Task 2 adds that narrow compiler integration option before Vite plugin work continues.

---

## File Structure

Target files and responsibilities:

```txt
packages/compiler/
  src/
    api/
      types.ts                         - add optional CompileOptions integration type if missing
      compile-component.ts             - pass CompileOptions to code generation if missing
      compile-component-from-files.ts   - accept CompileOptions if missing
    codegen/
      generate-component.ts            - use componentImportSpecifier override if missing
  tests/
    api/
      compile-component-from-files.test.ts - assert custom component import specifier if missing
    codegen/
      generate-component.test.ts       - assert generated import override if missing

packages/runtime/
  src/
    mounting/
      mount.ts                         - accept compiled component modules and append returned node
    index.ts                           - export compiled component mount types
  tests/
    mounting/
      mount.test.ts                    - compiled component module mount and destroy coverage

packages/vite-plugin/
  src/
    index.ts                           - public exports
    plugin.ts                          - Vite plugin factory and hook wiring
    options.ts                         - VanrotPluginOptions and normalization
    component-files.ts                 - .component.ts detection and sibling path resolution
    virtual-modules.ts                 - virtual source and CSS module ID creation/decoding
    compile-for-vite.ts                - compiler call, diagnostics bridge, generated module wrapping
    diagnostics.ts                     - format compiler diagnostics for Vite
    hot-update.ts                      - dev invalidation and full reload behavior
  tests/
    exports.test.ts
    options.test.ts
    component-files.test.ts
    virtual-modules.test.ts
    compile-for-vite.test.ts
    diagnostics.test.ts
    plugin-transform.test.ts
    plugin-build.test.ts
    plugin-dev-reload.test.ts
    fixtures/
      basic-app/
        index.html
        package.json
        tsconfig.json
        vite.config.ts
        src/
          main.ts
          app.component.ts
          app.component.html
          app.component.css

docs/
  brainstorm.md
  superpowers/
    feature-maturity.md
```

Generated outputs:

```txt
packages/compiler/dist/
packages/runtime/dist/
packages/vite-plugin/dist/
packages/vite-plugin/tests/fixtures/basic-app/dist/
```

Generated outputs are not committed.

---

## Stage 1 - Dependency and Contract Setup

### Task 1: Add Vite plugin package dependencies

**Files:**

- Modify: `packages/vite-plugin/package.json`
- Modify: `pnpm-lock.yaml`

**Steps:**

- [ ] Add `@vanrot/compiler` as a workspace dependency:

```json
{
  "dependencies": {
    "@vanrot/compiler": "workspace:*"
  }
}
```

- [ ] Add Vite as a peer dependency and package-local dev dependency:

```json
{
  "peerDependencies": {
    "vite": "^8.0.0"
  },
  "devDependencies": {
    "vite": "^8.0.10"
  }
}
```

- [ ] Do not add `@vanrot/runtime` as a Vite plugin dependency. Runtime imports appear in generated app code, not in the plugin implementation.
- [ ] Run:

```txt
pnpm install
```

- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin build
```

Expected result:

```txt
@vanrot/vite-plugin builds after dependency wiring.
```

**Acceptance:**

- Vite is peer-owned by the consuming app.
- The plugin can import compiler APIs.
- No runtime dependency is added to the plugin package.

### Task 2: Add compiler import override if Phase 3 does not already provide it

**Files:**

- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/api/compile-component.ts`
- Modify: `packages/compiler/src/api/compile-component-from-files.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Test: `packages/compiler/tests/api/compile-component-from-files.test.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`

**Steps:**

- [ ] Write a failing codegen test that expects a custom source import:

```ts
import { describe, expect, it } from 'vitest';
import { generateComponent } from '../../src/codegen/generate-component.js';

describe('generateComponent', () => {
  it('uses the component import override when provided', () => {
    const result = generateComponent(
      {
        componentName: 'CounterComponent',
        componentImportPath: './counter.component.ts',
        scopeAttribute: 'data-vr-counter',
        nodes: [],
        bindings: [],
      },
      {
        componentImportSpecifier: 'virtual:vanrot-source:%2Fsrc%2Fcounter.component.ts',
      },
    );

    expect(result.js).toContain(
      "from 'virtual:vanrot-source:%2Fsrc%2Fcounter.component.ts'",
    );
    expect(result.js).not.toContain("from './counter.component.ts'");
  });
});
```

- [ ] Write a failing API test that passes the option through `compileComponentFromFiles()`:

```ts
import { describe, expect, it } from 'vitest';
import { compileComponentFromFiles } from '../../src/index.js';

describe('compileComponentFromFiles options', () => {
  it('passes componentImportSpecifier into generated output', async () => {
    const result = await compileComponentFromFiles(
      new URL('../fixtures/counter/counter.component.ts', import.meta.url).pathname,
      {
        componentImportSpecifier: 'virtual:vanrot-source:%2Ffixture%2Fcounter.component.ts',
      },
    );

    expect(result.js).toContain(
      "from 'virtual:vanrot-source:%2Ffixture%2Fcounter.component.ts'",
    );
  });
});
```

- [ ] Add the public option type:

```ts
export interface CompileOptions {
  componentImportSpecifier?: string;
}
```

- [ ] Update compiler API signatures:

```ts
export function compileComponent(
  source: ComponentSource,
  options?: CompileOptions,
): CompileResult;

export function compileComponentFromFiles(
  componentPath: string,
  options?: CompileOptions,
): Promise<CompileResult>;
```

- [ ] Update code generation to use:

```ts
const componentImportSpecifier =
  options.componentImportSpecifier ?? componentImportPath;
```

- [ ] Run:

```txt
pnpm --filter @vanrot/compiler test
```

Expected result:

```txt
Compiler tests pass with the import override and existing compiler behavior unchanged when the option is omitted.
```

**Acceptance:**

- The option changes only the generated component class import.
- Existing Phase 3 compiler tests still pass.
- The Vite plugin has a non-recursive way to load the original component class.

---

## Stage 2 - Runtime Mount Bridge

### Task 3: Add compiled component module support to `mount()`

**Files:**

- Modify: `packages/runtime/src/mounting/mount.ts`
- Modify: `packages/runtime/src/index.ts`
- Test: `packages/runtime/tests/mounting/mount.test.ts`

**Steps:**

- [ ] Add failing tests for mounting a compiled component module:

```ts
it('mounts a compiled component module and appends its node', () => {
  const target = document.createElement('div');
  const node = document.createElement('p');
  node.textContent = 'Hello Vanrot';

  const app = mount(
    {
      createComponent() {
        return { node, ctx: {} };
      },
    },
    target,
  );

  expect(target.textContent).toBe('Hello Vanrot');

  app.destroy();
  expect(target.textContent).toBe('');
});
```

- [ ] Add a failing cleanup test:

```ts
it('runs compiled component effects inside the root cleanup scope', () => {
  const target = document.createElement('div');
  const count = signal(0);
  const spy = vi.fn();

  const app = mount(
    {
      createComponent() {
        effect(() => {
          count();
          spy();
        });

        return { node: document.createTextNode('count'), ctx: {} };
      },
    },
    target,
  );

  spy.mockClear();
  app.destroy();
  count.set(1);

  expect(spy).not.toHaveBeenCalled();
});
```

- [ ] Define runtime types:

```ts
export interface CompiledComponentInstance {
  node: Node;
  ctx: unknown;
}

export interface CompiledComponentModule {
  createComponent(): CompiledComponentInstance;
}
```

- [ ] Update `ComponentType` to include compiled modules:

```ts
export type ComponentType =
  | (new (...args: never[]) => unknown)
  | CompiledComponentModule;
```

- [ ] Update `mount()` to detect compiled modules:

```ts
function isCompiledComponentModule(value: ComponentType): value is CompiledComponentModule {
  return typeof value === 'object' && value !== null && 'createComponent' in value;
}
```

- [ ] For compiled modules, run `createComponent()` inside `runWithCleanupScope()`, append the returned node, flush mount callbacks, and remove the node during destroy.
- [ ] Preserve the existing constructor placeholder behavior for Phase 2 tests.
- [ ] Run:

```txt
pnpm --filter @vanrot/runtime test
```

Expected result:

```txt
Runtime tests pass, including compiled component mounting and existing lifecycle behavior.
```

**Acceptance:**

- `mount(App, target)` works when `App` is the Vite-transformed component default export.
- Effects and event listener cleanup are owned by the root cleanup scope.
- No router, provider, or dependency injection behavior is added.

---

## Stage 3 - Public Plugin API

### Task 4: Define plugin options and exports

**Files:**

- Create: `packages/vite-plugin/src/options.ts`
- Create: `packages/vite-plugin/src/plugin.ts`
- Modify: `packages/vite-plugin/src/index.ts`
- Test: `packages/vite-plugin/tests/options.test.ts`
- Test: `packages/vite-plugin/tests/exports.test.ts`

**Steps:**

- [ ] Write tests for option normalization:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeOptions } from '../src/options.js';

describe('normalizeOptions', () => {
  it('uses the component file default include pattern', () => {
    const options = normalizeOptions({}, '/repo/app');

    expect(options.root).toBe('/repo/app');
    expect(options.include.some((pattern) => pattern.test('/repo/app/src/app.component.ts'))).toBe(true);
    expect(options.include.some((pattern) => pattern.test('/repo/app/src/app.ts'))).toBe(false);
  });
});
```

- [ ] Write tests for public exports:

```ts
import vanrot, { vanrotPlugin } from '../src/index.js';

it('exports default and named plugin factories', () => {
  expect(vanrot().name).toBe('vanrot');
  expect(vanrotPlugin().name).toBe('vanrot');
});
```

- [ ] Define public options:

```ts
export interface VanrotPluginOptions {
  include?: RegExp | RegExp[];
  exclude?: RegExp | RegExp[];
  root?: string;
}
```

- [ ] Define normalized options:

```ts
export interface NormalizedVanrotPluginOptions {
  include: RegExp[];
  exclude: RegExp[];
  root: string;
}
```

- [ ] Implement `vanrot(options?: VanrotPluginOptions)` returning:

```ts
{
  name: 'vanrot',
  enforce: 'pre',
}
```

- [ ] Export:

```ts
export { vanrot, vanrot as vanrotPlugin };
export type { VanrotPluginOptions } from './options.js';
export default vanrot;
```

- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- options exports
```

Expected result:

```txt
Options and export tests pass.
```

**Acceptance:**

- The plugin has one obvious user-facing factory: `vanrot()`.
- App authors do not import compiler internals.

### Task 5: Add component file detection and sibling path resolution

**Files:**

- Create: `packages/vite-plugin/src/component-files.ts`
- Test: `packages/vite-plugin/tests/component-files.test.ts`

**Steps:**

- [ ] Write tests:

```ts
import { describe, expect, it } from 'vitest';
import { isComponentEntry, resolveComponentFiles } from '../src/component-files.js';

describe('component files', () => {
  it('detects only Vanrot component TypeScript entries', () => {
    expect(isComponentEntry('/repo/src/app.component.ts')).toBe(true);
    expect(isComponentEntry('/repo/src/app.ts')).toBe(false);
    expect(isComponentEntry('/repo/src/app.component.html')).toBe(false);
    expect(isComponentEntry('virtual:vanrot-source:%2Frepo%2Fsrc%2Fapp.component.ts')).toBe(false);
    expect(isComponentEntry('\0vanrot:source:%2Frepo%2Fsrc%2Fapp.component.ts')).toBe(false);
  });

  it('resolves sibling template and style files', () => {
    expect(resolveComponentFiles('/repo/src/app.component.ts')).toEqual({
      componentPath: '/repo/src/app.component.ts',
      templatePath: '/repo/src/app.component.html',
      stylePath: '/repo/src/app.component.css',
    });
  });
});
```

- [ ] Implement:

```ts
export interface ComponentFiles {
  componentPath: string;
  templatePath: string;
  stylePath: string;
}

export function isComponentEntry(id: string): boolean {
  if (id.startsWith('virtual:vanrot-') || id.startsWith('\0vanrot:')) {
    return false;
  }

  return id.split('?')[0]?.endsWith('.component.ts') === true;
}

export function resolveComponentFiles(componentPath: string): ComponentFiles {
  const cleanPath = componentPath.split('?')[0] ?? componentPath;

  return {
    componentPath: cleanPath,
    templatePath: cleanPath.replace(/\.component\.ts$/, '.component.html'),
    stylePath: cleanPath.replace(/\.component\.ts$/, '.component.css'),
  };
}
```

- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- component-files
```

Expected result:

```txt
Component file tests pass.
```

**Acceptance:**

- Only `.component.ts` entries are transformed.
- Sibling files follow Vanrot conventions.

### Task 6: Add virtual module ID helpers

**Files:**

- Create: `packages/vite-plugin/src/virtual-modules.ts`
- Test: `packages/vite-plugin/tests/virtual-modules.test.ts`

**Steps:**

- [ ] Write tests:

```ts
import { describe, expect, it } from 'vitest';
import {
  decodeVirtualModuleId,
  toPublicCssModuleId,
  toPublicSourceModuleId,
  toResolvedVirtualModuleId,
} from '../src/virtual-modules.js';

describe('virtual module IDs', () => {
  it('creates public and resolved source IDs', () => {
    const publicId = toPublicSourceModuleId('/repo/src/app.component.ts');
    const resolvedId = toResolvedVirtualModuleId(publicId);

    expect(publicId).toBe('virtual:vanrot-source:%2Frepo%2Fsrc%2Fapp.component.ts');
    expect(resolvedId).toBe('\0vanrot:source:%2Frepo%2Fsrc%2Fapp.component.ts');
    expect(decodeVirtualModuleId(resolvedId)).toEqual({
      kind: 'source',
      filePath: '/repo/src/app.component.ts',
    });
  });

  it('creates public CSS IDs', () => {
    expect(toPublicCssModuleId('/repo/src/app.component.ts')).toBe(
      'virtual:vanrot-css:%2Frepo%2Fsrc%2Fapp.component.ts',
    );
  });
});
```

- [ ] Implement stable prefixes:

```ts
const PUBLIC_SOURCE_PREFIX = 'virtual:vanrot-source:';
const PUBLIC_CSS_PREFIX = 'virtual:vanrot-css:';
const RESOLVED_SOURCE_PREFIX = '\0vanrot:source:';
const RESOLVED_CSS_PREFIX = '\0vanrot:css:';
```

- [ ] Export helpers for public IDs, resolved IDs, detection, and decoding.
- [ ] Use `encodeURIComponent()` and `decodeURIComponent()` for path encoding.
- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- virtual-modules
```

Expected result:

```txt
Virtual module tests pass.
```

**Acceptance:**

- App authors never import resolved `\0` IDs.
- Internal IDs are stable enough for cache keys and tests.

---

## Stage 4 - Compile Pipeline

### Task 7: Format compiler diagnostics for Vite

**Files:**

- Create: `packages/vite-plugin/src/diagnostics.ts`
- Test: `packages/vite-plugin/tests/diagnostics.test.ts`

**Steps:**

- [ ] Write tests:

```ts
import { describe, expect, it } from 'vitest';
import { formatDiagnostic } from '../src/diagnostics.js';

describe('formatDiagnostic', () => {
  it('includes code, message, file, line, and column', () => {
    expect(
      formatDiagnostic({
        severity: 'error',
        code: 'VR005',
        message: 'Unsupported template syntax',
        filePath: '/repo/src/app.component.html',
        line: 3,
        column: 12,
      }),
    ).toBe('/repo/src/app.component.html:3:12 VR005 Unsupported template syntax');
  });
});
```

- [ ] Implement:

```ts
export function formatDiagnostic(diagnostic: CompileDiagnostic): string {
  return `${diagnostic.filePath}:${diagnostic.line}:${diagnostic.column} ${diagnostic.code} ${diagnostic.message}`;
}
```

- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- diagnostics
```

Expected result:

```txt
Diagnostic formatting tests pass.
```

**Acceptance:**

- Compiler diagnostics can be passed directly to `this.error()` and `this.warn()`.
- Production code frames remain outside Phase 4.

### Task 8: Compile a component for Vite

**Files:**

- Create: `packages/vite-plugin/src/compile-for-vite.ts`
- Test: `packages/vite-plugin/tests/compile-for-vite.test.ts`

**Steps:**

- [ ] Write a test using a fake compiler result:

```ts
import { describe, expect, it, vi } from 'vitest';
import { compileForVite } from '../src/compile-for-vite.js';

describe('compileForVite', () => {
  it('wraps generated JS with CSS import and default component export', async () => {
    const compile = vi.fn(async () => ({
      js: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }',
      css: 'p[data-vr-app]{color:red}',
      diagnostics: [],
      metadata: {
        componentName: 'AppComponent',
        scopeAttribute: 'data-vr-app',
        features: [],
      },
    }));

    const result = await compileForVite('/repo/src/app.component.ts', compile);

    expect(compile).toHaveBeenCalledWith('/repo/src/app.component.ts', {
      componentImportSpecifier: 'virtual:vanrot-source:%2Frepo%2Fsrc%2Fapp.component.ts',
    });
    expect(result.code).toContain("import 'virtual:vanrot-css:%2Frepo%2Fsrc%2Fapp.component.ts';");
    expect(result.code).toContain('const component = { createComponent };');
    expect(result.code).toContain('export default component;');
    expect(result.css).toBe('p[data-vr-app]{color:red}');
  });
});
```

- [ ] Define:

```ts
export interface ViteCompileResult {
  code: string;
  css: string;
  diagnostics: CompileDiagnostic[];
}
```

- [ ] Implement `compileForVite(componentPath, compile = compileComponentFromFiles)` that:

```ts
const sourceModuleId = toPublicSourceModuleId(componentPath);
const cssModuleId = toPublicCssModuleId(componentPath);
const result = await compile(componentPath, {
  componentImportSpecifier: sourceModuleId,
});

return {
  code: [
    `import ${JSON.stringify(cssModuleId)};`,
    result.js,
    'const component = { createComponent };',
    'export default component;',
  ].join('\n\n'),
  css: result.css,
  diagnostics: result.diagnostics,
};
```

- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- compile-for-vite
```

Expected result:

```txt
Compile wrapper tests pass.
```

**Acceptance:**

- Generated component modules import CSS through Vite.
- Generated component modules provide a default value for `mount(App, target)`.
- Original source import goes through the virtual source module.

---

## Stage 5 - Vite Plugin Hooks

### Task 9: Implement transform hook

**Files:**

- Modify: `packages/vite-plugin/src/plugin.ts`
- Test: `packages/vite-plugin/tests/plugin-transform.test.ts`

**Steps:**

- [ ] Write a test for ignored files:

```ts
it('ignores non-component TypeScript files', async () => {
  const plugin = vanrot();
  const result = await plugin.transform?.call({} as never, 'export const value = 1;', '/repo/src/main.ts');

  expect(result).toBeUndefined();
});
```

- [ ] Write a test for transformed component entries with a mocked compile function through an internal plugin factory test seam:

```ts
it('transforms component entries and registers sibling files', async () => {
  const watched: string[] = [];
  const plugin = createVanrotPluginForTests({
    compile: async () => ({
      code: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }\nconst component = { createComponent };\nexport default component;',
      css: 'p{color:red}',
      diagnostics: [],
    }),
  });

  const result = await plugin.transform?.call(
    {
      addWatchFile(filePath: string) {
        watched.push(filePath);
      },
      error(error: string) {
        throw new Error(error);
      },
      warn() {},
    } as never,
    'export class AppComponent {}',
    '/repo/src/app.component.ts',
  );

  expect(watched).toEqual([
    '/repo/src/app.component.html',
    '/repo/src/app.component.css',
  ]);
  expect(result).toEqual({
    code: expect.stringContaining('export default component;'),
    map: null,
  });
});
```

- [ ] Implement `transform(code, id)`:

```ts
if (!isComponentEntry(id)) {
  return undefined;
}

const files = resolveComponentFiles(id);
this.addWatchFile(files.templatePath);
this.addWatchFile(files.stylePath);

const result = await compileForVite(files.componentPath);
for (const diagnostic of result.diagnostics) {
  const message = formatDiagnostic(diagnostic);
  if (diagnostic.severity === 'error') {
    this.error(message);
    continue;
  }
  this.warn(message);
}

setCss(files.componentPath, result.css);

return {
  code: result.code,
  map: null,
};
```

- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- plugin-transform
```

Expected result:

```txt
Transform hook tests pass.
```

**Acceptance:**

- Non-component files stay with Vite's normal TypeScript pipeline.
- Component files become generated Vanrot component modules.
- Sibling HTML and CSS files are watched.

### Task 10: Implement virtual source and CSS module hooks

**Files:**

- Modify: `packages/vite-plugin/src/plugin.ts`
- Test: `packages/vite-plugin/tests/plugin-transform.test.ts`

**Steps:**

- [ ] Add tests for `resolveId()`:

```ts
it('resolves Vanrot virtual module IDs', async () => {
  const plugin = vanrot();

  await expect(plugin.resolveId?.call({} as never, 'virtual:vanrot-css:%2Frepo%2Fsrc%2Fapp.component.ts')).resolves.toBe(
    '\0vanrot:css:%2Frepo%2Fsrc%2Fapp.component.ts',
  );
});
```

- [ ] Add tests for `load()`:

```ts
it('loads cached virtual CSS', async () => {
  const plugin = createVanrotPluginForTests({
    initialCss: new Map([['/repo/src/app.component.ts', 'p{color:red}']]),
  });

  const css = await plugin.load?.call({} as never, '\0vanrot:css:%2Frepo%2Fsrc%2Fapp.component.ts');

  expect(css).toBe('p{color:red}');
});
```

- [ ] Implement `resolveId(source)`:

```ts
if (isPublicVanrotVirtualModuleId(source)) {
  return toResolvedVirtualModuleId(source);
}

return undefined;
```

- [ ] Implement `load(id)` for CSS modules:

```ts
const decoded = decodeVirtualModuleId(id);
if (decoded?.kind === 'css') {
  return getCss(decoded.filePath) ?? '';
}
```

- [ ] Implement `load(id)` for source modules by reading the original `.component.ts` file:

```ts
const decoded = decodeVirtualModuleId(id);
if (decoded?.kind === 'source') {
  return readFile(decoded.filePath, 'utf8');
}
```

- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- plugin-transform
```

Expected result:

```txt
Virtual module hook tests pass.
```

**Acceptance:**

- Generated code can import original component class source without recursively importing the transformed component module.
- Generated CSS flows through Vite's CSS pipeline.

### Task 11: Implement dev hot update fallback

**Files:**

- Create: `packages/vite-plugin/src/hot-update.ts`
- Modify: `packages/vite-plugin/src/plugin.ts`
- Test: `packages/vite-plugin/tests/plugin-dev-reload.test.ts`

**Steps:**

- [ ] Write tests for owner component lookup:

```ts
import { findOwnerComponentPath } from '../src/hot-update.js';

it('finds owner component path for template and style files', () => {
  expect(findOwnerComponentPath('/repo/src/app.component.html')).toBe('/repo/src/app.component.ts');
  expect(findOwnerComponentPath('/repo/src/app.component.css')).toBe('/repo/src/app.component.ts');
  expect(findOwnerComponentPath('/repo/src/main.ts')).toBeUndefined();
});
```

- [ ] Write tests for full reload behavior with a fake server:

```ts
it('requests a full reload when a component template changes', () => {
  const sent: unknown[] = [];
  const invalidated: string[] = [];

  handleVanrotHotUpdate({
    file: '/repo/src/app.component.html',
    timestamp: Date.now(),
    modules: [],
    server: {
      moduleGraph: {
        getModuleById(id: string) {
          return { id };
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
    } as never,
  });

  expect(invalidated).toContain('/repo/src/app.component.ts');
  expect(sent).toContainEqual({ type: 'full-reload' });
});
```

- [ ] Implement owner path mapping:

```ts
export function findOwnerComponentPath(filePath: string): string | undefined {
  if (filePath.endsWith('.component.html')) {
    return filePath.replace(/\.component\.html$/, '.component.ts');
  }

  if (filePath.endsWith('.component.css')) {
    return filePath.replace(/\.component\.css$/, '.component.ts');
  }

  return undefined;
}
```

- [ ] Implement `handleHotUpdate(ctx)` to invalidate the owner component module and send:

```ts
ctx.server.ws.send({ type: 'full-reload' });
return [];
```

- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- plugin-dev-reload
```

Expected result:

```txt
Dev reload tests pass.
```

**Acceptance:**

- Template and CSS edits rebuild reliably.
- State-preserving HMR remains deferred and tracked separately.

---

## Stage 6 - Vite Integration Fixtures

### Task 12: Add a basic Vite fixture app

**Files:**

- Create: `packages/vite-plugin/tests/fixtures/basic-app/index.html`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/package.json`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/tsconfig.json`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/vite.config.ts`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/main.ts`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/app.component.ts`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/app.component.html`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/app.component.css`

**Steps:**

- [ ] Create `index.html`:

```html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

- [ ] Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import vanrot from '@vanrot/vite-plugin';

export default defineConfig({
  plugins: [vanrot()],
});
```

- [ ] Create `src/main.ts`:

```ts
import { mount } from '@vanrot/runtime';
import App from './app.component.ts';

mount(App, document.getElementById('app')!);
```

- [ ] Create `src/app.component.ts`:

```ts
import { signal } from '@vanrot/runtime';

export class AppComponent {
  count = signal(0);

  increment() {
    this.count.update((value) => value + 1);
  }
}
```

- [ ] Create `src/app.component.html`:

```html
<section class="counter">
  <p>Count: {{ count() }}</p>
  <button (click)="increment()">Increase</button>
</section>
```

- [ ] Create `src/app.component.css`:

```css
.counter {
  display: grid;
  gap: 8px;
}

button {
  padding: 8px 12px;
}
```

**Acceptance:**

- The fixture uses Vanrot separate-file conventions.
- The fixture does not introduce CLI behavior or example-app milestone docs.

### Task 13: Add Vite build integration test

**Files:**

- Create: `packages/vite-plugin/tests/plugin-build.test.ts`

**Steps:**

- [ ] Write the build test:

```ts
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

const fixtureRoot = resolve(import.meta.dirname, 'fixtures/basic-app');
const outDir = resolve(fixtureRoot, 'dist');

describe('Vanrot Vite build integration', () => {
  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  it('builds a Vanrot component app', async () => {
    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      build: {
        outDir,
        emptyOutDir: true,
      },
    });

    await expect(import('node:fs/promises').then(({ readdir }) => readdir(resolve(outDir, 'assets')))).resolves.toEqual(
      expect.arrayContaining([expect.stringMatching(/\.js$/), expect.stringMatching(/\.css$/)]),
    );
  });
});
```

- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- plugin-build
```

Expected result:

```txt
The fixture app builds through Vite and emits JavaScript plus CSS assets.
```

**Acceptance:**

- Vite build consumes Vanrot component imports.
- CSS from `.component.css` appears in Vite's CSS output.

### Task 14: Add Vite dev rebuild integration test

**Files:**

- Create: `packages/vite-plugin/tests/plugin-dev-reload.test.ts`

**Steps:**

- [ ] Add a dev server test that updates template content:

```ts
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

const fixtureRoot = resolve(import.meta.dirname, 'fixtures/basic-app');
const templatePath = resolve(fixtureRoot, 'src/app.component.html');

describe('Vanrot Vite dev reload integration', () => {
  let restoreTemplate = '';

  afterEach(async () => {
    if (restoreTemplate !== '') {
      await writeFile(templatePath, restoreTemplate);
      restoreTemplate = '';
    }
  });

  it('rebuilds when component HTML changes', async () => {
    restoreTemplate = await readFile(templatePath, 'utf8');
    const server = await createServer({
      root: fixtureRoot,
      logLevel: 'silent',
      server: { middlewareMode: true },
    });

    try {
      await server.pluginContainer.buildStart({});
      await writeFile(templatePath, restoreTemplate.replace('Increase', 'Add one'));

      const module = await server.moduleGraph.getModuleByUrl('/src/app.component.ts');
      expect(module).toBeDefined();
    } finally {
      await server.close();
    }
  });
});
```

- [ ] Add a style change variant for `app.component.css`.
- [ ] Run:

```txt
pnpm --filter @vanrot/vite-plugin test -- plugin-dev-reload
```

Expected result:

```txt
Dev reload integration tests pass for component HTML and CSS changes.
```

**Acceptance:**

- Vite sees sibling file changes.
- The plugin invalidates the owning component module.
- True state-preserving HMR remains out of scope.

---

## Stage 7 - Final Tracking and Verification

### Task 15: Update feature maturity ledger after verified implementation

**Files:**

- Modify: `docs/superpowers/feature-maturity.md`

**Steps:**

- [ ] After all implementation verification passes, move these Phase 4 rows from `Planned` to `Demo-Capable`:

```txt
Vite plugin public API
Vite transform integration
Vite virtual source modules
Vite CSS virtual modules
Vite file watching
Vite diagnostics overlay bridge
Vite production build integration
Runtime compiled component mount bridge
Compiler Vite import override
```

- [ ] Keep these rows `Deferred`:

```txt
Vite true HMR
Vite config loading
Compiler source maps
Compiler production diagnostics
CLI commands
Counter demo app
```

- [ ] Do not mark any Phase 4 row `Production-Ready`.

**Acceptance:**

- The maturity ledger reflects demo capability only after implementation evidence exists.
- Production-ready gates remain explicit.

### Task 16: Update roadmap tracker after verified implementation

**Files:**

- Modify: `docs/brainstorm.md`

**Steps:**

- [ ] After all verification commands pass, update only this row:

```txt
Phase 4 - Vite integration
```

- [ ] Change `[ ]` to `[x]`.
- [ ] Do not change Phase 5 or Phase 6 tracker rows.

**Acceptance:**

- Roadmap status and feature maturity status stay separate.
- Phase 4 is checked off only after Vite dev/build behavior works.

### Task 17: Run final verification

**Files:**

- Read: `docs/superpowers/specs/Phase-04.md`
- Read: `docs/superpowers/plans/Phase-04.md`
- Read: `docs/superpowers/feature-maturity.md`

**Steps:**

- [ ] Run package checks:

```txt
pnpm --filter @vanrot/compiler test
pnpm --filter @vanrot/runtime test
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/vite-plugin build
```

- [ ] Run workspace checks:

```txt
pnpm test
pnpm build
```

- [ ] Confirm no generated outputs are committed:

```txt
git status --short
```

- [ ] Confirm `dist/` and fixture `dist/` directories are ignored or removed before commit.

**Acceptance:**

- Vite plugin tests pass.
- Runtime tests pass if `mount()` changes.
- Compiler tests pass if the import override changes compiler code.
- Workspace test and build commands pass.
- Feature maturity and roadmap docs are updated only after verification.
