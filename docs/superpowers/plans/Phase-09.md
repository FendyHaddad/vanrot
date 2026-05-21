# Vanrot UI And Tokens MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Phase 9 UI and Tokens MVP with `@vanrot/ui`, starter token CSS, compiler-lowered `<vr-button>`, typed `.button.*` role files, and `vr add button`.

**Architecture:** `@vanrot/ui` owns UI assets and metadata, but does not add behavior to `@vanrot/runtime`. The compiler lowers the single Phase 9 UI primitive into native DOM, while the CLI copies app-owned button files and CSS into generated apps. The Vite plugin recognizes `.button.ts` role files so the new UI naming convention is tool-visible instead of being only a folder style.

**Tech Stack:** TypeScript 5, Vitest 4, jsdom, pnpm workspaces, existing compiler code generation, existing Vite plugin transform pipeline, existing CLI reporter and template writer.

**Spec:** `docs/superpowers/specs/Phase-09.md`

---

## Prerequisites

Implementation happens on `main`; do not create a branch or worktree.

The user owns commits and pushes. Do not run:

```bash
git add
git commit
git push
```

Plan checkpoints replace commit steps. At each checkpoint, run the listed verification command and leave files unstaged for user review.

Before starting, verify the workspace state:

```bash
git status --short --branch
```

Expected planning state includes at least:

```txt
## main...origin/main
 M AGENTS.md
 M docs/superpowers/feature-maturity.md
?? docs/superpowers/specs/Phase-09.md
?? docs/superpowers/plans/Phase-09.md
```

Leave unrelated local changes untouched.

---

## Scope Check

Phase 9 touches four subsystems, but they form one testable milestone:

```txt
@vanrot/ui asset package
compiler lowering for one UI primitive
CLI create/add behavior
Vite fixture verification
```

Do not split this into multiple implementation plans. Do not implement production UI flavors, extra primitives, variants, Tailwind setup, utility classes, registry upgrades, true child components, props, slots, or the documentation site. Those stay in `docs/superpowers/feature-maturity.md`.

---

## File Structure

Target files and responsibilities:

```txt
packages/ui/
  package.json                                      - package metadata, exports, scripts, publish assets
  tsconfig.json                                     - UI package TypeScript project
  src/
    index.ts                                       - public metadata exports
    metadata.ts                                    - primitive names, file roles, package asset URLs
    tokens/
      vanrot-tokens.css                            - small token layer copied by CLI
    primitives/
      button/
        ui.button.ts                               - app-owned button role source blueprint
        ui.button.html                             - app-owned button role template blueprint
        ui.button.css                              - global button primitive styles copied into apps
        usage.home.html                            - starter-home snippet inserted by `vr add button`
  tests/
    metadata.test.ts                               - metadata exports and asset path checks
    assets.test.ts                                 - package asset files exist and remain file-backed

packages/compiler/
  src/api/types.ts                                 - add `VR010` and `ui-button`
  src/codegen/generate-component.ts                - lower `<vr-button>` and diagnose unsupported `vr-*`
  src/conventions/component-files.ts               - recognize `.button.ts/html/css`
  tests/codegen/generate-component.test.ts         - UI primitive lowering tests
  tests/conventions/component-files.test.ts        - `.button.*` role convention tests

packages/vite-plugin/
  src/component-files.ts                           - transform `.button.ts` entries
  tests/component-files.test.ts                    - `.button.ts` Vite role detection
  tests/fixtures/basic-app/                        - starter fixture uses tokens and `<vr-button>`
  tests/plugin-build.test.ts                       - fixture build still emits JS and CSS

packages/cli/
  package.json                                     - depend on `@vanrot/ui` and build it before CLI checks
  tsconfig.json                                    - reference `../ui`
  src/cli.ts                                      - dispatch `vr add`
  src/commands/add.ts                              - command entrypoint and reporter output
  src/commands/metadata.ts                         - `add` command metadata and help
  src/create/app-template.ts                       - starter dependency metadata and token import
  src/create/starter-ui-assets.ts                  - reads token CSS from `@vanrot/ui`
  src/create/write-app.ts                          - writes file-backed starter UI assets
  src/add/add-ui.ts                                - parse and execute `vr add button`
  src/add/file-edits.ts                            - write-if-missing and import-once helpers
  src/add/starter-home.ts                          - conservative generated-home patch
  src/add/ui-assets.ts                             - read `@vanrot/ui` asset URLs and render renamed files
  tests/add.test.ts                                - `vr add button` behavior and validation
  tests/cli.test.ts                                - root/help includes `vr add`
  tests/create.test.ts                             - starter includes tokens and `@vanrot/ui`

tsconfig.json                                      - root project reference for `packages/ui`

docs/
  brainstorm.md                                    - tick Phase 9 only after implementation verification
  vanrot-presentation.html                         - Phase 9 done and next phase active after verification
  superpowers/
    feature-maturity.md                            - move verified Phase 9 rows to Demo-Capable
    plans/Phase-09.md                              - mark completed tasks during implementation
```

---

## Stage 1 - UI Package Foundation

### Task 1: Add `@vanrot/ui` package metadata and assets

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/metadata.ts`
- Create: `packages/ui/src/tokens/vanrot-tokens.css`
- Create: `packages/ui/src/primitives/button/ui.button.ts`
- Create: `packages/ui/src/primitives/button/ui.button.html`
- Create: `packages/ui/src/primitives/button/ui.button.css`
- Create: `packages/ui/src/primitives/button/usage.home.html`
- Create: `packages/ui/tests/metadata.test.ts`
- Create: `packages/ui/tests/assets.test.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Write failing metadata tests**

Create `packages/ui/tests/metadata.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiPrimitive,
  uiPrimitiveType,
} from '../src/index.js';

describe('@vanrot/ui metadata', () => {
  it('exports the Phase 9 button primitive metadata', () => {
    expect(defaultUiPrefix).toBe('ui');
    expect(uiPrimitiveType.button).toBe('button');
    expect(uiPrimitive.button.type).toBe(uiPrimitiveType.button);
    expect(uiPrimitive.button.directory).toBe('src/ui/button');
    expect(uiPrimitive.button.role).toBe('button');
    expect(uiPrimitive.button.defaultFiles).toEqual([
      'ui.button.ts',
      'ui.button.html',
      'ui.button.css',
    ]);
  });

  it('exports app-owned style file paths', () => {
    expect(uiAppFile.tokens).toBe('src/styles/vanrot-tokens.css');
    expect(uiAppFile.styleEntry).toBe('src/styles/vanrot-ui.css');
    expect(uiAppFile.styleEntryImport).toBe("import './styles/vanrot-ui.css';");
    expect(uiAppFile.tokenImport).toBe("import './styles/vanrot-tokens.css';");
  });

  it('exports file-backed package asset URLs', () => {
    expect(uiAssetUrl.tokens.href).toContain('/src/tokens/vanrot-tokens.css');
    expect(uiAssetUrl.button.typescript.href).toContain('/src/primitives/button/ui.button.ts');
    expect(uiAssetUrl.button.html.href).toContain('/src/primitives/button/ui.button.html');
    expect(uiAssetUrl.button.css.href).toContain('/src/primitives/button/ui.button.css');
    expect(uiAssetUrl.button.homeUsage.href).toContain('/src/primitives/button/usage.home.html');
  });
});
```

Create `packages/ui/tests/assets.test.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { uiAssetUrl } from '../src/index.js';

describe('@vanrot/ui assets', () => {
  it('keeps tokens in CSS instead of TypeScript strings', async () => {
    const tokens = await readFile(fileURLToPath(uiAssetUrl.tokens), 'utf8');

    expect(tokens).toContain(':root');
    expect(tokens).toContain('--vr-color-surface');
    expect(tokens).toContain('--vr-radius-control');
  });

  it('keeps button markup in HTML files instead of TypeScript strings', async () => {
    const buttonTemplate = await readFile(fileURLToPath(uiAssetUrl.button.html), 'utf8');
    const homeUsage = await readFile(fileURLToPath(uiAssetUrl.button.homeUsage), 'utf8');

    expect(buttonTemplate).toContain('<vr-button type="button">');
    expect(homeUsage).toContain('<vr-button class="vr-button-primary" type="button">');
    expect(homeUsage).toContain("{{ t('home.cta') }}");
  });

  it('keeps button styles in CSS files', async () => {
    const buttonCss = await readFile(fileURLToPath(uiAssetUrl.button.css), 'utf8');

    expect(buttonCss).toContain('.vr-button');
    expect(buttonCss).toContain('.vr-button-primary');
  });
});
```

- [ ] **Step 2: Run tests to verify the package is missing**

Run:

```bash
pnpm --filter @vanrot/ui test
```

Expected:

```txt
No projects matched the filters
```

- [ ] **Step 3: Create the package manifest**

Create `packages/ui/package.json`:

```json
{
  "name": "@vanrot/ui",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "src/tokens",
    "src/primitives"
  ],
  "dependencies": {
    "@vanrot/runtime": "workspace:*"
  },
  "scripts": {
    "prebuild": "pnpm --filter @vanrot/runtime build",
    "build": "tsc -p tsconfig.json",
    "pretypecheck": "pnpm --filter @vanrot/runtime build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "pretest": "pnpm --filter @vanrot/runtime build",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

- [ ] **Step 4: Create the UI TypeScript config**

Create `packages/ui/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationDir": "dist",
    "outDir": "dist",
    "rootDir": "src",
    "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"
  },
  "include": ["src/**/*.ts"],
  "references": [{ "path": "../runtime" }]
}
```

- [ ] **Step 5: Add the root project reference**

Modify `tsconfig.json` so `references` includes UI after runtime:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/runtime" },
    { "path": "./packages/ui" },
    { "path": "./packages/router" },
    { "path": "./packages/compiler" },
    { "path": "./packages/vite-plugin" },
    { "path": "./packages/cli" }
  ]
}
```

- [ ] **Step 6: Create UI metadata exports**

Create `packages/ui/src/metadata.ts`:

```ts
export const defaultUiPrefix = 'ui';

export const uiPrimitiveType = {
  button: 'button',
} as const;

export type UiPrimitiveType = (typeof uiPrimitiveType)[keyof typeof uiPrimitiveType];

export const uiAppFile = {
  tokens: 'src/styles/vanrot-tokens.css',
  styleEntry: 'src/styles/vanrot-ui.css',
  tokenImport: "import './styles/vanrot-tokens.css';",
  styleEntryImport: "import './styles/vanrot-ui.css';",
} as const;

export const uiPrimitive = {
  button: {
    type: uiPrimitiveType.button,
    directory: 'src/ui/button',
    role: 'button',
    defaultFiles: ['ui.button.ts', 'ui.button.html', 'ui.button.css'],
    selector: 'vr-button',
    nativeTag: 'button',
    baseClass: 'vr-button',
  },
} as const;

export const uiAssetUrl = {
  tokens: new URL('../src/tokens/vanrot-tokens.css', import.meta.url),
  button: {
    typescript: new URL('../src/primitives/button/ui.button.ts', import.meta.url),
    html: new URL('../src/primitives/button/ui.button.html', import.meta.url),
    css: new URL('../src/primitives/button/ui.button.css', import.meta.url),
    homeUsage: new URL('../src/primitives/button/usage.home.html', import.meta.url),
  },
} as const;
```

Create `packages/ui/src/index.ts`:

```ts
export type { UiPrimitiveType } from './metadata.js';
export {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiPrimitive,
  uiPrimitiveType,
} from './metadata.js';
```

- [ ] **Step 7: Create the token CSS asset**

Create `packages/ui/src/tokens/vanrot-tokens.css`:

```css
:root {
  --vr-color-canvas: #0b0f14;
  --vr-color-surface: #121821;
  --vr-color-surface-raised: #182231;
  --vr-color-text: #eef4fb;
  --vr-color-muted: #9aa8b8;
  --vr-color-line: rgba(238, 244, 251, 0.14);
  --vr-color-accent: #f05a3d;
  --vr-color-accent-strong: #ff775c;
  --vr-radius-control: 8px;
  --vr-shadow-control: 0 14px 40px rgba(0, 0, 0, 0.24);
  --vr-font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --vr-motion-fast: 140ms ease;
}
```

- [ ] **Step 8: Create the button blueprint files**

Create `packages/ui/src/primitives/button/ui.button.ts`:

```ts
import { signal } from '@vanrot/runtime';

const buttonCopy = {
  label: 'Button',
} as const;

export class UiButton {
  label = signal(buttonCopy.label);
}
```

Create `packages/ui/src/primitives/button/ui.button.html`:

```html
<vr-button type="button">
  {{ label() }}
</vr-button>
```

Create `packages/ui/src/primitives/button/ui.button.css`:

```css
.vr-button {
  align-items: center;
  background: var(--vr-color-surface-raised);
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-control);
  box-shadow: none;
  color: var(--vr-color-text);
  cursor: pointer;
  display: inline-flex;
  font: 600 0.95rem/1 var(--vr-font-sans);
  gap: 8px;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  transition:
    background var(--vr-motion-fast),
    border-color var(--vr-motion-fast),
    color var(--vr-motion-fast),
    transform var(--vr-motion-fast);
}

.vr-button:hover {
  background: color-mix(in srgb, var(--vr-color-surface-raised) 82%, white);
  border-color: color-mix(in srgb, var(--vr-color-line) 55%, white);
}

.vr-button:active {
  transform: translateY(1px);
}

.vr-button:focus-visible {
  outline: 2px solid var(--vr-color-accent-strong);
  outline-offset: 2px;
}

.vr-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.vr-button-primary {
  background: var(--vr-color-accent);
  border-color: var(--vr-color-accent);
  color: #140906;
}

.vr-button-primary:hover {
  background: var(--vr-color-accent-strong);
  border-color: var(--vr-color-accent-strong);
}
```

Create `packages/ui/src/primitives/button/usage.home.html`:

```html
  <vr-button class="vr-button-primary" type="button">
    {{ t('home.cta') }}
  </vr-button>
```

- [ ] **Step 9: Run UI tests**

Run:

```bash
pnpm --filter @vanrot/ui test
```

Expected:

```txt
PASS  packages/ui/tests/metadata.test.ts
PASS  packages/ui/tests/assets.test.ts
```

- [ ] **Step 10: Checkpoint**

Run:

```bash
pnpm --filter @vanrot/ui typecheck
pnpm --filter @vanrot/ui build
git status --short --branch
```

Expected:

```txt
Both @vanrot/ui commands exit 0.
git status shows new packages/ui files and no staged changes.
```

---

## Stage 2 - Compiler UI Primitive Lowering

### Task 2: Lower `<vr-button>` to a native button

**Files:**
- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/api/compile-component.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`

- [ ] **Step 1: Write failing codegen tests**

Append these tests inside the existing `describe('generateComponent', () => { ... })` block in `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
  it('lowers vr-button to a native button with base and user classes', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'vr-button',
          attributes: [
            { name: 'class', value: 'vr-button-primary flex w-full' },
            { name: 'type', value: 'button' },
          ],
          children: [{ kind: 'text', value: 'Save' }],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("const button0 = document.createElement('button');");
    expect(result.js).toContain("button0.setAttribute('data-vr-a1b2c3', '');");
    expect(result.js).toContain(
      "button0.setAttribute('class', 'vr-button vr-button-primary flex w-full');",
    );
    expect(result.js).toContain("button0.setAttribute('type', 'button');");
    expect(result.js).toContain("const text0 = document.createTextNode('Save');");
    expect(result.js).not.toContain("document.createElement('vr-button')");
    expect(result.features).toContain('ui-button');
  });

  it('does not duplicate the vr-button base class', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'vr-button',
          attributes: [{ name: 'class', value: 'vr-button vr-button-primary' }],
          children: [],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("button0.setAttribute('class', 'vr-button vr-button-primary');");
  });

  it('preserves interpolation, events, and property bindings on vr-button', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'vr-button',
          attributes: [
            { name: '(click)', value: 'save()' },
            { name: '[disabled]', value: 'saving()' },
            { name: 'aria-label', value: 'Save profile' },
          ],
          children: [{ kind: 'text', value: '{{ label() }}' }],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("import { effect } from '@vanrot/runtime';");
    expect(result.js).toContain("import { listen } from '@vanrot/runtime/internal';");
    expect(result.js).toContain("button0.setAttribute('aria-label', 'Save profile');");
    expect(result.js).toContain("listen(button0, 'click', () => {");
    expect(result.js).toContain('ctx.save();');
    expect(result.js).toContain('button0.disabled = ctx.saving();');
    expect(result.js).toContain('text0.data = `${ctx.label()}`;');
    expect(result.features).toContain('event-binding');
    expect(result.features).toContain('property-binding');
    expect(result.features).toContain('text-interpolation');
    expect(result.features).toContain('ui-button');
  });
```

- [ ] **Step 2: Run tests to verify `ui-button` is missing**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts
```

Expected:

```txt
FAIL  packages/compiler/tests/codegen/generate-component.test.ts
AssertionError: expected ... to contain "document.createElement('button')"
```

- [ ] **Step 3: Add the compiler feature type**

Modify `packages/compiler/src/api/types.ts`:

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
  | 'VR010';
```

Add `ui-button` to `CompileFeature`:

```ts
export type CompileFeature =
  | 'file-convention'
  | 'component-class'
  | 'text-interpolation'
  | 'event-binding'
  | 'property-binding'
  | 'scoped-css'
  | 'readable-output'
  | 'expression-rewriting'
  | 'router-outlet'
  | 'router-link'
  | 'ui-button';
```

- [ ] **Step 4: Add `ui-button` to feature ordering**

Modify the `featureOrder` array in `packages/compiler/src/api/compile-component.ts`:

```ts
const featureOrder: CompileFeature[] = [
  'file-convention',
  'component-class',
  'text-interpolation',
  'event-binding',
  'property-binding',
  'scoped-css',
  'readable-output',
  'expression-rewriting',
  'router-outlet',
  'router-link',
  'ui-button',
];
```

- [ ] **Step 5: Implement UI button lowering**

Modify `packages/compiler/src/codegen/generate-component.ts`.

Update `GenerateState`:

```ts
interface GenerateState {
  ids: IdentifierAllocator;
  lines: string[];
  diagnostics: CompileDiagnostic[];
  features: Set<CompileFeature>;
  usesEffect: boolean;
  usesListen: boolean;
  usesRouterOutlet: boolean;
  usesRouteLink: boolean;
  templatePath: string;
}

const uiButtonTagName = 'vr-button';
const uiButtonNativeTagName = 'button';
const uiButtonBaseClass = 'vr-button';
```

Update `generateElement()` so the UI primitive branch runs before normal element creation:

```ts
function generateElement(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  if (node.tagName === 'vr-router') {
    generateRouterOutlet(parentName, scopeAttribute, state);
    return;
  }

  if (node.tagName === 'vr') {
    generateRouterLink(node, parentName, scopeAttribute, state);
    return;
  }

  if (node.tagName === uiButtonTagName) {
    generateUiButton(node, parentName, scopeAttribute, state);
    return;
  }

  if (isUnsupportedVanrotUiTag(node.tagName)) {
    diagnoseUnsupportedVanrotUiTag(node.tagName, state);
    return;
  }

  const elementName = state.ids.next(node.tagName);

  state.lines.push(`  const ${elementName} = document.createElement(${quoteString(node.tagName)});`);
  state.lines.push(`  ${elementName}.setAttribute(${quoteString(scopeAttribute)}, '');`);

  for (const attribute of node.attributes) {
    generateAttribute(attribute, elementName, state);
  }

  for (const child of node.children) {
    generateNode(child, elementName, scopeAttribute, state);
  }

  state.lines.push(`  ${parentName}.append(${elementName});`);
}
```

Add these helper functions below `generateRouterLink()`:

```ts
function generateUiButton(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  const buttonName = state.ids.next(uiButtonNativeTagName);

  state.features.add('ui-button');
  state.lines.push(`  const ${buttonName} = document.createElement(${quoteString(uiButtonNativeTagName)});`);
  state.lines.push(`  ${buttonName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  generateUiButtonClass(node.attributes, buttonName, state);

  for (const attribute of node.attributes) {
    if (attribute.name === 'class') {
      continue;
    }

    generateAttribute(attribute, buttonName, state);
  }

  for (const child of node.children) {
    generateNode(child, buttonName, scopeAttribute, state);
  }

  state.lines.push(`  ${parentName}.append(${buttonName});`);
}

function generateUiButtonClass(
  attributes: readonly TemplateAttribute[],
  buttonName: string,
  state: GenerateState,
): void {
  const classAttribute = attributes.find((attribute) => attribute.name === 'class');
  const classValue = mergeClassValue(uiButtonBaseClass, classAttribute?.value ?? '');

  state.lines.push(
    `  ${buttonName}.setAttribute(${quoteString('class')}, ${quoteString(classValue)});`,
  );
}

function mergeClassValue(baseClass: string, userClassValue: string): string {
  const classNames = new Set(
    [baseClass, ...userClassValue.split(/\s+/)].filter((className) => className.length > 0),
  );

  return [...classNames].join(' ');
}

function isUnsupportedVanrotUiTag(tagName: string): boolean {
  return tagName.startsWith('vr-');
}

function diagnoseUnsupportedVanrotUiTag(tagName: string, state: GenerateState): void {
  state.diagnostics.push(
    createDiagnostic(
      'VR010',
      'error',
      `${tagName} is not a supported Vanrot UI primitive in Phase 9. Use <vr-button> or add this primitive to the production UI plan.`,
      state.templatePath,
    ),
  );
}
```

- [ ] **Step 6: Run codegen tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts
```

Expected:

```txt
PASS  packages/compiler/tests/codegen/generate-component.test.ts
```

### Task 3: Diagnose unsupported Vanrot UI tags

**Files:**
- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`

- [ ] **Step 1: Write the failing unsupported-tag test**

Append this test inside `describe('generateComponent', () => { ... })`:

```ts
  it('diagnoses unsupported Vanrot UI primitive tags', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'vr-card',
          attributes: [],
          children: [{ kind: 'text', value: 'Card' }],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
    });

    expect(result.js).not.toContain("document.createElement('vr-card')");
    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR010',
        severity: 'error',
        message:
          'vr-card is not a supported Vanrot UI primitive in Phase 9. Use <vr-button> or add this primitive to the production UI plan.',
      },
    ]);
  });
```

- [ ] **Step 2: Run the unsupported-tag test**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts
```

Expected:

```txt
PASS  packages/compiler/tests/codegen/generate-component.test.ts
```

- [ ] **Step 3: Checkpoint**

Run:

```bash
pnpm --filter @vanrot/compiler typecheck
pnpm --filter @vanrot/compiler test
git status --short --branch
```

Expected:

```txt
Both @vanrot/compiler commands exit 0.
git status shows compiler edits and no staged changes.
```

---

## Stage 3 - `.button.*` Role Conventions

### Task 4: Teach compiler file resolution about `.button.ts`

**Files:**
- Modify: `packages/compiler/src/conventions/component-files.ts`
- Modify: `packages/compiler/tests/conventions/component-files.test.ts`

- [ ] **Step 1: Write the failing `.button.*` convention test**

Append this test inside `packages/compiler/tests/conventions/component-files.test.ts`:

```ts
  it('resolves button primitive siblings and expected class names', async () => {
    const root = await createFixtureDirectory({
      'ui.button.ts': 'export class UiButton {}',
      'ui.button.html': '<vr-button type="button">Button</vr-button>',
      'ui.button.css': '.vr-button { display: inline-flex; }',
      'primary.button.ts': 'export class PrimaryButton {}',
      'primary.button.html': '<vr-button type="button">Primary</vr-button>',
      'primary.button.css': '.vr-button-primary { display: inline-flex; }',
    });

    await expect(resolveComponentFiles(join(root, 'ui.button.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'ui',
        expectedClassName: 'UiButton',
        templatePath: join(root, 'ui.button.html'),
        stylePath: join(root, 'ui.button.css'),
      },
      diagnostics: [],
    });
    await expect(resolveComponentFiles(join(root, 'primary.button.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'primary',
        expectedClassName: 'PrimaryButton',
        templatePath: join(root, 'primary.button.html'),
        stylePath: join(root, 'primary.button.css'),
      },
      diagnostics: [],
    });
  });
```

- [ ] **Step 2: Run convention tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/conventions/component-files.test.ts
```

Expected:

```txt
FAIL  packages/compiler/tests/conventions/component-files.test.ts
diagnostics: [{ code: 'VR003' }]
```

- [ ] **Step 3: Add `button` to component roles**

Modify `packages/compiler/src/conventions/component-files.ts`:

```ts
type ComponentRole = 'component' | 'page' | 'button';
```

Update the invalid suffix diagnostic:

```ts
createDiagnostic(
  'VR003',
  'error',
  'Vanrot supports .component.ts, .page.ts, and .button.ts role files.',
  componentPath,
),
```

Update `resolveRole()`:

```ts
function resolveRole(fileName: string): ComponentRole | null {
  if (fileName.endsWith('.component.ts')) {
    return 'component';
  }

  if (fileName.endsWith('.page.ts')) {
    return 'page';
  }

  if (fileName.endsWith('.button.ts')) {
    return 'button';
  }

  return null;
}
```

- [ ] **Step 4: Run convention tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/conventions/component-files.test.ts
```

Expected:

```txt
PASS  packages/compiler/tests/conventions/component-files.test.ts
```

### Task 5: Teach Vite role detection about `.button.ts`

**Files:**
- Modify: `packages/vite-plugin/src/component-files.ts`
- Modify: `packages/vite-plugin/tests/component-files.test.ts`

- [ ] **Step 1: Write failing Vite role tests**

Append this test inside `packages/vite-plugin/tests/component-files.test.ts`:

```ts
  it('recognizes button primitive entries', () => {
    expect(isComponentEntry('/repo/src/ui/button/ui.button.ts')).toBe(true);
    expect(resolveComponentFiles('/repo/src/ui/button/ui.button.ts')).toEqual({
      componentPath: '/repo/src/ui/button/ui.button.ts',
      templatePath: '/repo/src/ui/button/ui.button.html',
      stylePath: '/repo/src/ui/button/ui.button.css',
    });
  });
```

- [ ] **Step 2: Run Vite component-file tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- tests/component-files.test.ts
```

Expected:

```txt
FAIL  packages/vite-plugin/tests/component-files.test.ts
expected false to be true
```

- [ ] **Step 3: Add `button` to Vite role suffixes**

Modify `packages/vite-plugin/src/component-files.ts`:

```ts
const roleSuffixes = ['component', 'page', 'button'] as const;
```

- [ ] **Step 4: Run Vite component-file tests**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- tests/component-files.test.ts
```

Expected:

```txt
PASS  packages/vite-plugin/tests/component-files.test.ts
```

- [ ] **Step 5: Checkpoint**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/conventions/component-files.test.ts
pnpm --filter @vanrot/vite-plugin test -- tests/component-files.test.ts
git status --short --branch
```

Expected:

```txt
Both test commands exit 0.
git status shows compiler and Vite plugin edits and no staged changes.
```

---

## Stage 4 - Starter Token CSS

### Task 6: Add UI assets to `vr create`

**Files:**
- Modify: `packages/cli/package.json`
- Modify: `packages/cli/tsconfig.json`
- Modify: `packages/cli/src/create/app-template.ts`
- Create: `packages/cli/src/create/starter-ui-assets.ts`
- Modify: `packages/cli/src/create/write-app.ts`
- Modify: `packages/cli/tests/create.test.ts`

- [ ] **Step 1: Write failing create tests**

Append this test inside `packages/cli/tests/create.test.ts`:

```ts
  it('includes Vanrot UI tokens without adding button files by default', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'ui-ready-app', '--workspace'], { cwd, reporter });
    const appRoot = join(cwd, 'ui-ready-app');

    expect(result.exitCode).toBe(0);

    const packageJson = await readFile(join(appRoot, 'package.json'), 'utf8');
    const main = await readFile(join(appRoot, 'src', 'main.ts'), 'utf8');
    const tokens = await readFile(join(appRoot, 'src', 'styles', 'vanrot-tokens.css'), 'utf8');
    const homePageTs = await readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.ts'), 'utf8');
    const homePageHtml = await readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.html'), 'utf8');

    expect(packageJson).toContain('"@vanrot/ui": "workspace:*"');
    expect(main).toContain("import './styles/vanrot-tokens.css';");
    expect(tokens).toContain('--vr-color-surface');
    expect(tokens).toContain('--vr-radius-control');
    expect(homePageTs).toContain("'home.cta': 'Start building'");
    expect(homePageHtml).toContain("{{ t('home.title') }}");
    expect(homePageHtml).toContain("{{ t('home.summary') }}");

    await expect(readFile(join(appRoot, 'src', 'ui', 'button', 'ui.button.ts'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });
```

- [ ] **Step 2: Run create tests to verify token file is missing**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected:

```txt
FAIL  packages/cli/tests/create.test.ts
ENOENT: no such file or directory, open '.../src/styles/vanrot-tokens.css'
```

- [ ] **Step 3: Add CLI dependency on `@vanrot/ui`**

Modify `packages/cli/package.json`:

```json
{
  "name": "@vanrot/cli",
  "version": "0.0.0",
  "type": "module",
  "bin": {
    "vr": "./dist/bin.js"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "dependencies": {
    "@vanrot/ui": "workspace:*"
  },
  "scripts": {
    "prebuild": "pnpm --filter @vanrot/ui build",
    "build": "tsc -p tsconfig.json",
    "pretypecheck": "pnpm --filter @vanrot/ui build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "pretest": "pnpm --filter @vanrot/ui build",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

Modify `packages/cli/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"
  },
  "include": ["src/**/*.ts"],
  "references": [{ "path": "../ui" }]
}
```

- [ ] **Step 4: Add starter UI asset reader**

Create `packages/cli/src/create/starter-ui-assets.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { uiAppFile, uiAssetUrl } from '@vanrot/ui';
import type { TemplateFile } from './app-template.js';

export async function createStarterUiAssets(): Promise<TemplateFile[]> {
  const tokens = await readFile(fileURLToPath(uiAssetUrl.tokens), 'utf8');

  return [
    {
      path: uiAppFile.tokens,
      content: tokens,
    },
  ];
}
```

- [ ] **Step 5: Update starter package and home page copy**

Modify `packages/cli/src/create/app-template.ts`.

Add `@vanrot/ui` to generated dev dependencies:

```ts
          devDependencies: {
            '@vanrot/cli': dependencyVersion,
            '@vanrot/ui': dependencyVersion,
            '@vanrot/vite-plugin': dependencyVersion,
            typescript: '^5.9.3',
            vite: '^8.0.10',
            vitest: '^4.0.14',
          },
```

Update `src/main.ts` content to import tokens once:

```ts
      path: 'src/main.ts',
      content: `import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
// @ts-expect-error Vanrot's Vite plugin compiles component modules to default exports.
import App from './app/app.component.ts';
import { route as appRoute } from './routes.ts';
import './styles/vanrot-tokens.css';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

provideRouter(appRoute);
mount(App, target);
`,
```

Update generated home page TypeScript:

```ts
    {
      path: 'src/pages/home/home.page.ts',
      content: `const homeCopy = {
  'home.title': 'Build with Vanrot',
  'home.summary': 'Start with named routes, page files, and a small runtime foundation.',
  'home.cta': 'Start building',
} as const;

type HomeCopyKey = keyof typeof homeCopy;

export class HomePage {
  t(key: HomeCopyKey): string {
    return homeCopy[key];
  }
}
`,
    },
```

Update generated home page HTML:

```ts
    {
      path: 'src/pages/home/home.page.html',
      content: `<section class="page">
  <h1>{{ t('home.title') }}</h1>
  <p>{{ t('home.summary') }}</p>
</section>
`,
    },
```

- [ ] **Step 6: Write UI assets during app creation**

Modify `packages/cli/src/create/write-app.ts`:

```ts
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createAppTemplate } from './app-template.js';
import { createStarterUiAssets } from './starter-ui-assets.js';
```

Update the template creation inside `writeApp()`:

```ts
  const template = [
    ...createAppTemplate({
      appName: options.appName,
      workspace: options.workspace,
    }),
    ...(await createStarterUiAssets()),
  ];
```

- [ ] **Step 7: Run create tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected:

```txt
PASS  packages/cli/tests/create.test.ts
```

- [ ] **Step 8: Checkpoint**

Run:

```bash
pnpm --filter @vanrot/cli typecheck
pnpm --filter @vanrot/cli test -- tests/create.test.ts
git status --short --branch
```

Expected:

```txt
Both @vanrot/cli commands exit 0.
git status shows CLI create edits and no staged changes.
```

---

## Stage 5 - `vr add button`

### Task 7: Add CLI command metadata and dispatch

**Files:**
- Create: `packages/cli/src/commands/add.ts`
- Modify: `packages/cli/src/cli.ts`
- Modify: `packages/cli/src/commands/metadata.ts`
- Modify: `packages/cli/tests/cli.test.ts`

- [ ] **Step 1: Write failing CLI help test**

Update the root help test in `packages/cli/tests/cli.test.ts` so it checks for `vr add button`:

```ts
    expect(reporter.output()).toContain('vr add button');
```

Add this test inside `describe('runCli', () => { ... })`:

```ts
  it('prints add command help without executing the command', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['add', '--help'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('vr add button');
    expect(reporter.output()).toContain('vr add <local-prefix> button');
  });
```

- [ ] **Step 2: Run CLI help tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/cli.test.ts
```

Expected:

```txt
FAIL  packages/cli/tests/cli.test.ts
Unknown command: add
```

- [ ] **Step 3: Add command metadata**

Modify `packages/cli/src/commands/metadata.ts`.

Add `add` to `commandName`:

```ts
export const commandName = {
  create: 'create',
  generate: 'generate',
  add: 'add',
  doctor: 'doctor',
  map: 'map',
  initAi: 'init-ai',
  dev: 'dev',
  build: 'build',
  test: 'test',
} as const;
```

Insert add command metadata after generate:

```ts
  {
    name: commandName.add,
    usage: 'vr add button',
    secondaryUsages: ['vr add <local-prefix> button'],
    help: `vr add <primitive>

Primitives
  button

Examples
  vr add button
  vr add primary button`,
  },
```

- [ ] **Step 4: Add the command entrypoint**

Create `packages/cli/src/commands/add.ts`:

```ts
import { addUiPrimitive } from '../add/add-ui.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function addCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  return addUiPrimitive(args, context);
}
```

- [ ] **Step 5: Dispatch the command**

Modify `packages/cli/src/cli.ts`.

Add the import:

```ts
import { addCommand } from './commands/add.js';
```

Add to `commandHandlers`:

```ts
  [commandName.add, addCommand],
```

- [ ] **Step 6: Add a temporary `addUiPrimitive` stub**

Create `packages/cli/src/add/add-ui.ts`:

```ts
import type { CommandContext, CommandResult } from '../result.js';
import { fail } from '../result.js';

export async function addUiPrimitive(
  _args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  context.reporter.error('vr add is not implemented yet.');
  return fail();
}
```

- [ ] **Step 7: Run CLI help tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/cli.test.ts
```

Expected:

```txt
PASS  packages/cli/tests/cli.test.ts
```

### Task 8: Implement `vr add button`

**Files:**
- Create: `packages/cli/src/add/ui-assets.ts`
- Create: `packages/cli/src/add/file-edits.ts`
- Create: `packages/cli/src/add/starter-home.ts`
- Modify: `packages/cli/src/add/add-ui.ts`
- Create: `packages/cli/tests/add.test.ts`

- [ ] **Step 1: Write failing `vr add button` tests**

Create `packages/cli/tests/add.test.ts`:

```ts
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'vanrot-cli-add-'));
}

describe('vr add', () => {
  it('adds the default button primitive to a generated app', async () => {
    const cwd = await tempRoot();
    const createReporter = createMemoryReporter();
    await runCli(['create', 'demo-app', '--workspace'], { cwd, reporter: createReporter });
    const appRoot = join(cwd, 'demo-app');
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd: appRoot, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(appRoot, 'src', 'ui', 'button', 'ui.button.ts'), 'utf8')).resolves.toContain(
      'export class UiButton',
    );
    await expect(readFile(join(appRoot, 'src', 'ui', 'button', 'ui.button.html'), 'utf8')).resolves.toContain(
      '<vr-button type="button">',
    );
    await expect(readFile(join(appRoot, 'src', 'ui', 'button', 'ui.button.css'), 'utf8')).resolves.toContain(
      '.vr-button-primary',
    );
    await expect(readFile(join(appRoot, 'src', 'styles', 'vanrot-ui.css'), 'utf8')).resolves.toContain(
      "@import '../ui/button/ui.button.css';",
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "import './styles/vanrot-ui.css';",
    );
    await expect(readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.html'), 'utf8')).resolves.toContain(
      '<vr-button class="vr-button-primary" type="button">',
    );
    expect(reporter.output()).toContain('Added button');
  });

  it('adds a custom-prefixed button primitive', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'primary', 'button'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'src', 'ui', 'button', 'primary.button.ts'), 'utf8')).resolves.toContain(
      'export class PrimaryButton',
    );
    await expect(readFile(join(cwd, 'src', 'ui', 'button', 'primary.button.html'), 'utf8')).resolves.toContain(
      '<vr-button type="button">',
    );
    await expect(readFile(join(cwd, 'src', 'styles', 'vanrot-ui.css'), 'utf8')).resolves.toContain(
      "@import '../ui/button/primary.button.css';",
    );
  });

  it('does not add duplicate style imports', async () => {
    const cwd = await tempRoot();
    await mkdir(join(cwd, 'src'), { recursive: true });
    await writeFile(join(cwd, 'src', 'main.ts'), "import './styles/vanrot-ui.css';\n");
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd, reporter });
    const main = await readFile(join(cwd, 'src', 'main.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(main.match(/vanrot-ui\.css/g)).toHaveLength(1);
  });

  it('rejects unsupported primitives', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'card'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Unsupported UI primitive: card');
    expect(reporter.output()).toContain('Phase 9 supports: button');
  });

  it('rejects invalid local prefixes', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'Primary', 'button'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Invalid UI primitive prefix: Primary');
    expect(reporter.output()).toContain('Use lowercase kebab-case, for example primary or marketing-primary.');
  });

  it('does not overwrite existing primitive files', async () => {
    const cwd = await tempRoot();
    await mkdir(join(cwd, 'src', 'ui', 'button'), { recursive: true });
    await writeFile(join(cwd, 'src', 'ui', 'button', 'ui.button.ts'), 'keep me');
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('File already exists: src/ui/button/ui.button.ts');
    await expect(readFile(join(cwd, 'src', 'ui', 'button', 'ui.button.ts'), 'utf8')).resolves.toBe(
      'keep me',
    );
  });
});
```

- [ ] **Step 2: Run add tests to verify failure**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/add.test.ts
```

Expected:

```txt
FAIL  packages/cli/tests/add.test.ts
error vr add is not implemented yet.
```

- [ ] **Step 3: Add file-edit helpers**

Create `packages/cli/src/add/file-edits.ts`:

```ts
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export async function assertFilesMissing(root: string, relativePaths: readonly string[]): Promise<void> {
  for (const relativePath of relativePaths) {
    if (await fileExists(root, relativePath)) {
      throw new Error(`File already exists: ${relativePath}`);
    }
  }
}

export async function writeNewFile(root: string, relativePath: string, content: string): Promise<void> {
  if (await fileExists(root, relativePath)) {
    throw new Error(`File already exists: ${relativePath}`);
  }

  const absolutePath = join(root, relativePath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
}

export async function writeFileIfMissing(
  root: string,
  relativePath: string,
  content: string,
): Promise<boolean> {
  if (await fileExists(root, relativePath)) {
    return false;
  }

  const absolutePath = join(root, relativePath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
  return true;
}

export async function ensureLineInFile(
  root: string,
  relativePath: string,
  line: string,
): Promise<boolean> {
  const absolutePath = join(root, relativePath);
  const existing = await readTextIfExists(absolutePath);

  if (existing.includes(line)) {
    return false;
  }

  const nextContent = existing.length === 0 ? `${line}\n` : `${existing.trimEnd()}\n${line}\n`;
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, nextContent);
  return true;
}

export async function ensureMainImport(root: string, importLine: string): Promise<boolean> {
  const relativePath = join('src', 'main.ts');
  const absolutePath = join(root, relativePath);
  const existing = await readTextIfExists(absolutePath);

  if (existing.includes(importLine)) {
    return false;
  }

  if (existing.length === 0) {
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, `${importLine}\n`);
    return true;
  }

  const lines = existing.split('\n');
  const insertAt = firstNonImportIndex(lines);
  const nextLines = [...lines.slice(0, insertAt), importLine, ...lines.slice(insertAt)];
  await writeFile(absolutePath, nextLines.join('\n'));
  return true;
}

async function fileExists(root: string, relativePath: string): Promise<boolean> {
  try {
    await access(join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readTextIfExists(absolutePath: string): Promise<string> {
  try {
    return await readFile(absolutePath, 'utf8');
  } catch (error) {
    if (isMissingFileError(error)) {
      return '';
    }

    throw error;
  }
}

function firstNonImportIndex(lines: readonly string[]): number {
  const index = lines.findIndex((line) => line.length > 0 && !line.startsWith('import '));

  if (index === -1) {
    return lines.length;
  }

  return index;
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}
```

- [ ] **Step 4: Add UI asset rendering**

Create `packages/cli/src/add/ui-assets.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defaultUiPrefix, uiAssetUrl, uiPrimitive } from '@vanrot/ui';
import { toPascalCase } from '../generate/names.js';

export interface RenderedUiFile {
  path: string;
  content: string;
}

export async function renderButtonFiles(prefix: string): Promise<RenderedUiFile[]> {
  const [typescript, html, css] = await Promise.all([
    readAsset(uiAssetUrl.button.typescript),
    readAsset(uiAssetUrl.button.html),
    readAsset(uiAssetUrl.button.css),
  ]);
  const className = `${toPascalCase(prefix)}Button`;

  return [
    {
      path: `${uiPrimitive.button.directory}/${prefix}.button.ts`,
      content: renameButtonClass(typescript, className),
    },
    {
      path: `${uiPrimitive.button.directory}/${prefix}.button.html`,
      content: html,
    },
    {
      path: `${uiPrimitive.button.directory}/${prefix}.button.css`,
      content: css,
    },
  ];
}

export async function readTokenCss(): Promise<string> {
  return readAsset(uiAssetUrl.tokens);
}

export async function readHomeButtonUsage(): Promise<string> {
  return readAsset(uiAssetUrl.button.homeUsage);
}

export function buttonStyleImport(prefix: string): string {
  return `@import '../ui/button/${prefix}.button.css';`;
}

async function readAsset(url: URL): Promise<string> {
  return readFile(fileURLToPath(url), 'utf8');
}

function renameButtonClass(source: string, className: string): string {
  if (className === 'UiButton') {
    return source;
  }

  return source.replace(`class ${toPascalCase(defaultUiPrefix)}Button`, `class ${className}`);
}
```

- [ ] **Step 5: Add starter home patching**

Create `packages/cli/src/add/starter-home.ts`:

```ts
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const generatedHomePath = join('src', 'pages', 'home', 'home.page.html');
const homeSectionClose = '</section>';
const buttonSelector = '<vr-button';

export interface PatchStarterHomeResult {
  patched: boolean;
  path: string;
}

export async function patchStarterHome(
  root: string,
  usageMarkup: string,
): Promise<PatchStarterHomeResult> {
  const absolutePath = join(root, generatedHomePath);
  const existing = await readHomeIfExists(absolutePath);

  if (existing === null || existing.includes(buttonSelector) || !existing.includes(homeSectionClose)) {
    return {
      patched: false,
      path: generatedHomePath,
    };
  }

  const nextContent = existing.replace(homeSectionClose, `${usageMarkup}\n${homeSectionClose}`);
  await writeFile(absolutePath, nextContent);

  return {
    patched: true,
    path: generatedHomePath,
  };
}

async function readHomeIfExists(absolutePath: string): Promise<string | null> {
  try {
    return await readFile(absolutePath, 'utf8');
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }

    throw error;
  }
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}
```

- [ ] **Step 6: Implement command parsing and file writes**

Replace `packages/cli/src/add/add-ui.ts`:

```ts
import { defaultUiPrefix, uiAppFile, uiPrimitiveType } from '@vanrot/ui';
import { isKebabCase } from '../generate/names.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import {
  assertFilesMissing,
  ensureLineInFile,
  ensureMainImport,
  writeFileIfMissing,
  writeNewFile,
} from './file-edits.js';
import {
  buttonStyleImport,
  readHomeButtonUsage,
  readTokenCss,
  renderButtonFiles,
} from './ui-assets.js';
import { patchStarterHome } from './starter-home.js';

interface AddUiRequest {
  prefix: string;
  primitive: string;
}

export async function addUiPrimitive(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const request = parseAddUiRequest(args);

  if (request === null) {
    context.reporter.error('Usage: vr add button', 'Or use: vr add <local-prefix> button');
    return fail();
  }

  if (request.primitive !== uiPrimitiveType.button) {
    context.reporter.error(
      `Unsupported UI primitive: ${request.primitive}`,
      `Phase 9 supports: ${uiPrimitiveType.button}`,
    );
    return fail();
  }

  if (!isKebabCase(request.prefix)) {
    context.reporter.error(
      `Invalid UI primitive prefix: ${request.prefix}`,
      'Use lowercase kebab-case, for example primary or marketing-primary.',
    );
    return fail();
  }

  try {
    const files = await renderButtonFiles(request.prefix);
    const tokens = await readTokenCss();
    const usage = await readHomeButtonUsage();

    await assertFilesMissing(context.cwd, files.map((file) => file.path));
    await writeFileIfMissing(context.cwd, uiAppFile.tokens, tokens);

    for (const file of files) {
      await writeNewFile(context.cwd, file.path, file.content);
    }

    await ensureLineInFile(context.cwd, uiAppFile.styleEntry, buttonStyleImport(request.prefix));
    await ensureMainImport(context.cwd, uiAppFile.styleEntryImport);

    const homePatch = await patchStarterHome(context.cwd, usage);
    context.reporter.success(`Added ${request.primitive}`, files.map((file) => file.path).join('\n'));

    if (!homePatch.patched) {
      context.reporter.nextSteps([
        `Add the <vr-button> snippet to the page where this button should appear.`,
      ]);
    }

    return ok();
  } catch (error) {
    context.reporter.error(error instanceof Error ? error.message : 'Failed to add UI primitive.');
    return fail();
  }
}

function parseAddUiRequest(args: readonly string[]): AddUiRequest | null {
  if (args.length === 1) {
    return {
      prefix: defaultUiPrefix,
      primitive: args[0] ?? '',
    };
  }

  if (args.length === 2) {
    return {
      prefix: args[0] ?? '',
      primitive: args[1] ?? '',
    };
  }

  return null;
}
```

- [ ] **Step 7: Run add tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/add.test.ts
```

Expected:

```txt
PASS  packages/cli/tests/add.test.ts
```

- [ ] **Step 8: Run all CLI tests**

Run:

```bash
pnpm --filter @vanrot/cli test
```

Expected:

```txt
PASS  packages/cli/tests/*.test.ts
```

- [ ] **Step 9: Checkpoint**

Run:

```bash
pnpm --filter @vanrot/cli typecheck
pnpm --filter @vanrot/cli test
git status --short --branch
```

Expected:

```txt
Both @vanrot/cli commands exit 0.
git status shows CLI add edits and no staged changes.
```

---

## Stage 6 - Vite Build Fixture

### Task 9: Verify `<vr-button>` in a buildable app

**Files:**
- Modify: `packages/vite-plugin/tests/fixtures/basic-app/package.json`
- Modify: `packages/vite-plugin/tests/fixtures/basic-app/src/main.ts`
- Modify: `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.ts`
- Modify: `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.html`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/styles/vanrot-tokens.css`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/styles/vanrot-ui.css`
- Create: `packages/vite-plugin/tests/fixtures/basic-app/src/ui/button/ui.button.css`
- Modify: `packages/vite-plugin/tests/plugin-build.test.ts`

- [ ] **Step 1: Update fixture app package metadata**

Modify `packages/vite-plugin/tests/fixtures/basic-app/package.json` so dependencies include `@vanrot/ui`:

```json
{
  "name": "vanrot-basic-app-fixture",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "@vanrot/runtime": "0.0.0",
    "@vanrot/router": "0.0.0",
    "@vanrot/ui": "0.0.0"
  },
  "devDependencies": {
    "@vanrot/vite-plugin": "0.0.0",
    "typescript": "^5.9.3",
    "vite": "^8.0.10"
  }
}
```

- [ ] **Step 2: Import UI styles in the fixture entry**

Modify `packages/vite-plugin/tests/fixtures/basic-app/src/main.ts` so the imports include:

```ts
import './styles/vanrot-tokens.css';
import './styles/vanrot-ui.css';
```

- [ ] **Step 3: Add fixture UI CSS**

Create `packages/vite-plugin/tests/fixtures/basic-app/src/styles/vanrot-tokens.css`:

```css
:root {
  --vr-color-canvas: #0b0f14;
  --vr-color-surface: #121821;
  --vr-color-surface-raised: #182231;
  --vr-color-text: #eef4fb;
  --vr-color-muted: #9aa8b8;
  --vr-color-line: rgba(238, 244, 251, 0.14);
  --vr-color-accent: #f05a3d;
  --vr-color-accent-strong: #ff775c;
  --vr-radius-control: 8px;
  --vr-shadow-control: 0 14px 40px rgba(0, 0, 0, 0.24);
  --vr-font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --vr-motion-fast: 140ms ease;
}
```

Create `packages/vite-plugin/tests/fixtures/basic-app/src/styles/vanrot-ui.css`:

```css
@import '../ui/button/ui.button.css';
```

Create `packages/vite-plugin/tests/fixtures/basic-app/src/ui/button/ui.button.css`:

```css
.vr-button {
  align-items: center;
  background: var(--vr-color-surface-raised);
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-control);
  box-shadow: none;
  color: var(--vr-color-text);
  cursor: pointer;
  display: inline-flex;
  font: 600 0.95rem/1 var(--vr-font-sans);
  gap: 8px;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  transition:
    background var(--vr-motion-fast),
    border-color var(--vr-motion-fast),
    color var(--vr-motion-fast),
    transform var(--vr-motion-fast);
}

.vr-button:hover {
  background: color-mix(in srgb, var(--vr-color-surface-raised) 82%, white);
  border-color: color-mix(in srgb, var(--vr-color-line) 55%, white);
}

.vr-button:active {
  transform: translateY(1px);
}

.vr-button:focus-visible {
  outline: 2px solid var(--vr-color-accent-strong);
  outline-offset: 2px;
}

.vr-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.vr-button-primary {
  background: var(--vr-color-accent);
  border-color: var(--vr-color-accent);
  color: #140906;
}

.vr-button-primary:hover {
  background: var(--vr-color-accent-strong);
  border-color: var(--vr-color-accent-strong);
}
```

- [ ] **Step 4: Update fixture home page copy and template**

Modify `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.ts`:

```ts
const homeCopy = {
  'home.title': 'Build with Vanrot',
  'home.summary': 'Start with named routes, page files, and a small runtime foundation.',
  'home.cta': 'Start building',
} as const;

type HomeCopyKey = keyof typeof homeCopy;

export class HomePage {
  t(key: HomeCopyKey): string {
    return homeCopy[key];
  }
}
```

Modify `packages/vite-plugin/tests/fixtures/basic-app/src/pages/home/home.page.html`:

```html
<section class="page">
  <h1>{{ t('home.title') }}</h1>
  <p>{{ t('home.summary') }}</p>
  <vr-button class="vr-button-primary" type="button">
    {{ t('home.cta') }}
  </vr-button>
</section>
```

- [ ] **Step 5: Strengthen the build test**

Modify `packages/vite-plugin/tests/plugin-build.test.ts` so the import line includes `readFile`:

```ts
import { readFile, readdir, rm } from 'node:fs/promises';
```

Then replace the existing build test body with:

```ts
  it('builds a Vanrot component app', async () => {
    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      build: {
        outDir,
        emptyOutDir: true,
      },
    });

    const assets = await readdir(resolve(outDir, 'assets'));
    expect(assets).toEqual(
      expect.arrayContaining([expect.stringMatching(/\.js$/), expect.stringMatching(/\.css$/)]),
    );

    const cssAssets = assets.filter((asset) => asset.endsWith('.css'));
    const cssOutput = await Promise.all(
      cssAssets.map((asset) => readFile(resolve(outDir, 'assets', asset), 'utf8')),
    );
    expect(cssOutput.join('\n')).toContain('.vr-button');
    expect(cssOutput.join('\n')).toContain('.vr-button-primary');
  });
```

- [ ] **Step 6: Run Vite plugin tests**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test
```

Expected:

```txt
PASS  packages/vite-plugin/tests/plugin-build.test.ts
PASS  packages/vite-plugin/tests/component-files.test.ts
```

- [ ] **Step 7: Checkpoint**

Run:

```bash
pnpm --filter @vanrot/vite-plugin typecheck
pnpm --filter @vanrot/vite-plugin test
git status --short --branch
```

Expected:

```txt
Both @vanrot/vite-plugin commands exit 0.
git status shows Vite fixture edits and no staged changes.
```

---

## Stage 7 - Phase Completion Docs

### Task 10: Mark Phase 9 complete after verification

**Files:**
- Modify: `docs/brainstorm.md`
- Modify: `docs/superpowers/plans/Phase-09.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/feature-maturity.md`

- [ ] **Step 1: Run pre-completion verification before docs completion**

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm verify:size
```

Expected:

```txt
All four commands exit 0 before Phase 9 is marked complete in the docs.
```

- [ ] **Step 2: Tick Phase 9 in the brainstorm tracker**

Modify the Phase 9 row in `docs/brainstorm.md`:

```md
| [x] | Phase 9 - UI and tokens MVP | `@vanrot/ui`, `vr add`, design tokens, and first basic components. | Users can add official UI components without bloating `@vanrot/runtime`. |
```

- [ ] **Step 3: Mark completed tasks in this plan**

In `docs/superpowers/plans/Phase-09.md`, change every implementation task checkbox from:

```md
- [ ] **Step
```

to:

```md
- [x] **Step
```

Only do this after the implementation and verification steps in this plan have run.

- [ ] **Step 4: Update the presentation roadmap**

Modify `docs/vanrot-presentation.html` so Phase 9 is marked complete and the next phase is active.

The Phase 9 card should use the completed status style already used by completed roadmap cards:

```html
<div class="phase-card done">
  <div class="phase-num">Phase 9</div>
  <div class="phase-title">UI &amp; Tokens MVP</div>
  <div class="phase-status">✅</div>
</div>
```

Update the Phase 10 card to the active style:

```html
<div class="phase-card active-phase">
  <div class="phase-num">Phase 10</div>
  <div class="phase-title">Testing &amp; Docs</div>
  <div class="phase-status" style="color:var(--cyan);">⚡</div>
</div>
```

Update the roadmap status copy:

```html
<span style="color:var(--green);">✅ Done: Phases 0–9</span>
<span style="color:var(--cyan);">⚡ Active: Phase 10 (Testing &amp; Docs)</span>
<span style="color:var(--muted);">○ Queued: Phase 11</span>
```

Use the existing text pattern in the file; do not introduce a new presentation style.

- [ ] **Step 5: Move verified Phase 9 maturity rows to Demo-Capable**

In `docs/superpowers/feature-maturity.md`, update these rows from `Deferred` to `Demo-Capable`:

```txt
UI package foundation
Design tokens
Compiler-lowered `<vr-button>`
CLI `vr add button`
CLI `vr add <local-prefix> button`
Typed UI primitive file roles
```

Keep these rows as `Deferred`:

```txt
UI primitive catalog *
UI component parameters and variants *
Tailwind interoperability
Vanrot utility class layer *
UI registry and upgrade workflow
UI custom add destinations
UI flavor `V01` *
UI flavor `V02` *
UI flavor selection
```

Do not mark any Phase 9 UI capability as `Production-Ready`.

- [ ] **Step 6: Run phase-doc verification**

Run:

```bash
pnpm verify:phase-docs
```

Expected:

```txt
Phase documentation verification passed.
```

- [ ] **Step 7: Run full verification**

Run:

```bash
pnpm verify
```

Expected:

```txt
typecheck, test, build, runtime size, and phase-doc verification all pass.
```

- [ ] **Step 8: Final status report**

Run:

```bash
git status --short --branch
```

Expected:

```txt
Working tree contains unstaged Phase 9 implementation and docs changes.
No files are staged.
No commits or pushes were created by the agent.
```

---

## Execution Notes

Use TDD order inside each task: write the test, run the focused failing command, implement the smallest change, run the focused passing command, then run the checkpoint command.

Keep these project rules visible while implementing:

```txt
Use guard clauses.
Use signals for state.
Never put UI markup in TypeScript.
Never put logic in HTML.
Use role-based file suffixes.
Use scoped CSS.
Avoid reused string literals outside a named source of truth.
Do not create branches or worktrees unless the user asks.
Do not stage, commit, or push unless the user asks.
```

The existing `packages/cli/src/create/app-template.ts` already contains generated HTML and CSS as TypeScript strings. Phase 9 may touch that file narrowly, but new reusable UI assets must be file-backed under `packages/ui/src/...` and read by the CLI instead of being embedded as TS strings.

---

## Self-Review Checklist For Executor

Before claiming Phase 9 is complete, verify these exact requirements:

```txt
@vanrot/ui exists and builds.
@vanrot/ui exports metadata and file-backed asset URLs.
Vanrot token CSS is copied into new apps.
src/main.ts imports vanrot-tokens.css once.
vr create does not copy ui.button.ts/html/css by default.
compiler lowers <vr-button> to document.createElement('button').
compiler adds the vr-button base class.
compiler preserves user classes, child interpolation, (click), and [disabled].
compiler diagnoses unsupported vr-* UI tags with VR010.
compiler and Vite plugin recognize .button.ts/html/css role files.
vr add button writes ui.button.ts/html/css.
vr add primary button writes primary.button.ts/html/css.
vr add button writes src/styles/vanrot-ui.css.
vr add button imports src/styles/vanrot-ui.css from src/main.ts once.
vr add button patches the generated starter home page when recognized.
vr add rejects unsupported primitives.
vr add rejects invalid prefixes.
Vite fixture builds with <vr-button>.
pnpm verify passes.
docs/brainstorm.md, this plan, docs/vanrot-presentation.html, and feature-maturity.md are updated.
No Phase 9 row is marked Production-Ready.
```
