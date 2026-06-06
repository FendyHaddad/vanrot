# Phase 31 Editor Tooling Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task in the current Vanrot workspace. Vanrot `AGENTS.md` disables subagents for Superpowers workflows. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the one-shot Phase 31 editor tooling release for JetBrains IDEs, with the JetBrains plugin kept thin and the language server owning recognition, navigation, diagnostics, code actions, project intelligence, and packaging confidence.

**Architecture:** `packages/language-server` is the editor brain. It loads project routes, components, templates, Web Types metadata, and generated editor intelligence, then serves LSP completion, hover, definition, references, rename, diagnostics, and code actions. `editors/intellij` only finds Node, starts the bundled language server, registers supported template files, suppresses the known empty-tag inspection, and packages the generated server files.

**Tech Stack:** TypeScript 6, Vitest, `vscode-languageserver`, `@vanrot/compiler`, Web Types JSON, Kotlin 1.9.24, JetBrains IntelliJ Platform Gradle plugin 2.0.1, Vanrot docs page components.

---

## Release Boundary

This is one release plan. Do not split it into Web Types, intelligence export, navigation, editor fixes, and plugin packaging phases. Those are tasks inside Phase 31.

Commit steps are written for execution discipline, but Vanrot git ownership rules still apply: run the commit commands only when the user explicitly approves commits in the same task.

## File Structure

### Language Server

- Create: `packages/language-server/src/project/web-types.ts`
  - Reads `web-types.json`, `apps/vanrot-site/web-types.json`, `packages/ui/web-types.json`, and `packages/router/web-types.json`.
  - Normalizes Vanrot element, attribute, source, variant, and docs metadata into language-server-owned shapes.
- Create: `packages/language-server/src/project/template-index.ts`
  - Scans real template files from workspace source roots.
  - Records route refs, dotted no-value attributes, bracket bindings, custom tags, and unknown symbols with source spans.
- Create: `packages/language-server/src/project/editor-intelligence.ts`
  - Defines `VanrotEditorIntelligence`.
  - Builds the shared `.vanrot/editor-intelligence.json` payload from workspace routes, components, templates, Web Types, diagnostics, and generated metadata.
- Create: `packages/language-server/src/project/export-intelligence.ts`
  - Writes `.vanrot/editor-intelligence.json` atomically.
- Create: `packages/language-server/src/features/code-actions.ts`
  - Produces deterministic editor fixes for route typos, literal route paths, stale intelligence metadata, and missing Web Types declarations.
- Modify: `packages/language-server/src/project/workspace.ts`
  - Add Web Types summary, template index, and editor intelligence to `WorkspaceIndex`.
- Modify: `packages/language-server/src/features/completion.ts`
  - Use Web Types and project intelligence for richer tag, attribute, route, component, and inline docs completions.
- Modify: `packages/language-server/src/features/definition.ts`
  - Navigate from route refs, component tags, docs tags, and Web Types-backed UI tags to source locations.
- Modify: `packages/language-server/src/features/references.ts`
  - Find route and component references across open documents and indexed workspace templates.
- Modify: `packages/language-server/src/features/diagnostics.ts`
  - Add editor-only diagnostics for unknown route refs, unknown Vanrot tags, and stale/missing editor intelligence.
  - Keep valid bracket bindings, docs bindings, dotted no-value attributes, and native HTML as non-issues.
- Modify: `packages/language-server/src/features/symbol-at.ts`
  - Resolve symbols inside route refs, component tags, docs tags, and bracket/dotted attributes without treating valid syntax as unknown.
- Modify: `packages/language-server/src/server.ts`
  - Advertise `codeActionProvider`.
  - Use workspace template references for references and route rename.
  - Expose code actions and metadata refresh requests.
- Modify: `packages/language-server/src/index.ts`
  - Export the intelligence and Web Types APIs used by tests and JetBrains packaging checks.
- Modify: `packages/language-server/src/bin/server.ts`
  - Keep `--stdio`; add a guarded `--export-intelligence <projectRoot>` mode for deterministic metadata generation.
- Modify: `packages/language-server/package.json`
  - Add the `vanrot-editor-intelligence` bin and keep `build:intellij` bundling it.
- Test:
  - `packages/language-server/tests/web-types.test.ts`
  - `packages/language-server/tests/template-index.test.ts`
  - `packages/language-server/tests/editor-intelligence.test.ts`
  - `packages/language-server/tests/export-intelligence.test.ts`
  - `packages/language-server/tests/code-actions.test.ts`
  - Existing completion, definition, references, diagnostics, symbol, server, and handshake tests.

### Web Types

- Modify: `web-types.json`
  - Add root editor tooling metadata needed by IntelliJ/WebStorm recognition.
- Modify: `apps/vanrot-site/web-types.json`
  - Add docs shared component tags used by editor-tooling pages.
- Modify: `packages/ui/web-types.json`
  - Keep UI primitive metadata aligned with language server completions and navigation.
- Modify: `packages/router/web-types.json`
  - Keep route shorthand and route-object refs aligned with route diagnostics and code actions.
- Test: `scripts/verify-web-types-coverage.test.mjs`

### JetBrains Plugin

- Modify: `editors/intellij/build.gradle.kts`
  - Keep the `buildIntellijLanguageServer` task as the only server build path.
  - Add ZIP/package verification tasks that assert `plugin.xml`, bundled server files, and generated template globs exist.
- Modify: `editors/intellij/src/main/resources/META-INF/plugin.xml`
  - Update description from M0 to release-grade editor tooling while keeping Kotlin-side behavior thin.
- Modify: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotBundledServer.kt`
  - Validate bundled server script and package metadata paths.
- Modify: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotLspServerDescriptor.kt`
  - Pass the project root to the server and keep `--stdio`.
- Modify: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFiles.kt`
  - Mirror generated template globs from `packages/language-server`.
- Test:
  - `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFilesTest.kt`
  - Create `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotBundledServerTest.kt`
  - Create `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotLspServerDescriptorTest.kt`

### Docs IA

- Create parent route triplet:
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/editor-tooling.page.ts`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/editor-tooling.page.html`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/editor-tooling.page.css`
- Create child route triplets:
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/web-types/web-types.page.ts`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/web-types/web-types.page.html`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/web-types/web-types.page.css`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/navigation/navigation.page.ts`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/navigation/navigation.page.html`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/navigation/navigation.page.css`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.ts`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.html`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.css`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.ts`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.html`
  - `apps/vanrot-site/src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.css`
- Modify: `apps/vanrot-site/src/docs/docs-page-tree.ts`
  - Add real parent and child pages under `docsPageSection.framework`.
- Modify: `apps/vanrot-site/tests/docs-page-tree.test.ts`
  - Add required paths and assertions that child pages have components and no hash-only child links.
- Verification:
  - `pnpm exec vitest run apps/vanrot-site/tests/docs-page-tree.test.ts`
  - `pnpm verify:site-docs`
  - `pnpm verify:ai-docs`

### Trackers

- Modify: `docs/superpowers/feature-maturity.md`
  - Mark Phase 31 complete only after all verification passes.
- Modify: `docs/superpowers/future-pipeline.md`
  - Mark Editor Tooling as shipped after implementation passes.
- Modify: `docs/superpowers/final-tdd-inventory.md`
  - Add final coverage rows for Web Types metadata, intelligence export, template navigation, diagnostics, code actions, route rename, docs IA, AI docs, and JetBrains packaging.
- Modify: `docs/superpowers/specs/Phase-31.md`
  - Only update if the implementation reveals a changed requirement.

---

## Tasks

### Task 1: Baseline And Guardrail Tests

**Files:**
- Read: `docs/superpowers/specs/Phase-31.md`
- Read: `docs/superpowers/future-pipeline.md`
- Read: `docs/superpowers/feature-maturity.md`
- Read: `packages/language-server/package.json`
- Read: `editors/intellij/build.gradle.kts`

- [ ] **Step 1: Confirm the spec is one release**

Run:

```bash
rg -n "one-shot|Do not split|Phase 31" docs/superpowers/specs/Phase-31.md docs/superpowers/future-pipeline.md docs/superpowers/feature-maturity.md
```

Expected: output includes `Phase 31`, `one-shot`, and the no-split instruction.

- [ ] **Step 2: Run current editor tooling tests**

Run:

```bash
pnpm --filter @vanrot/language-server test
```

Expected: PASS. If it fails before edits, record the failing test names and fix only the baseline blocker before continuing.

- [ ] **Step 3: Run current Web Types guard**

Run:

```bash
pnpm exec vitest run scripts/verify-web-types-coverage.test.mjs
```

Expected: PASS.

- [ ] **Step 4: Run current JetBrains template tests**

Run:

```bash
cd editors/intellij && ./gradlew test
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git status --short --branch
git add docs/superpowers/plans/Phase-31.md
git commit -m "docs: add phase 31 editor tooling plan"
```

Expected: commit succeeds with only the plan file staged from this task.

### Task 2: Web Types Loader

**Files:**
- Create: `packages/language-server/src/project/web-types.ts`
- Create: `packages/language-server/tests/web-types.test.ts`
- Modify: `packages/language-server/src/project/workspace.ts`
- Modify: `packages/language-server/src/index.ts`
- Read: `web-types.json`
- Read: `apps/vanrot-site/web-types.json`
- Read: `packages/ui/web-types.json`
- Read: `packages/router/web-types.json`

- [ ] **Step 1: Write the failing Web Types tests**

Create `packages/language-server/tests/web-types.test.ts`:

```ts
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadVanrotWebTypes } from '../src/project/web-types.ts';

function workspace(): string {
  return mkdtempSync(join(tmpdir(), 'vanrot-web-types-'));
}

describe('loadVanrotWebTypes', () => {
  it('loads root, app, ui, and router web types into one summary', () => {
    const root = workspace();
    mkdirSync(join(root, 'apps/vanrot-site'), { recursive: true });
    mkdirSync(join(root, 'packages/ui'), { recursive: true });
    mkdirSync(join(root, 'packages/router'), { recursive: true });

    writeFileSync(
      join(root, 'web-types.json'),
      JSON.stringify({
        name: 'root',
        contributions: {
          html: {
            tags: [
              { name: 'vr', description: 'Route object shorthand' },
            ],
          },
        },
      }),
    );
    writeFileSync(
      join(root, 'apps/vanrot-site/web-types.json'),
      JSON.stringify({
        name: 'site',
        contributions: {
          html: {
            tags: [
              { name: 'docs-page', description: 'Docs page shell' },
            ],
          },
        },
      }),
    );
    writeFileSync(
      join(root, 'packages/ui/web-types.json'),
      JSON.stringify({
        name: 'ui',
        contributions: {
          html: {
            tags: [
              { name: 'vr-button', description: 'Button primitive' },
            ],
          },
        },
      }),
    );
    writeFileSync(
      join(root, 'packages/router/web-types.json'),
      JSON.stringify({
        name: 'router',
        contributions: {
          html: {
            attributes: [
              { name: 'route.home', description: 'Home route ref' },
            ],
          },
        },
      }),
    );

    const summary = loadVanrotWebTypes(root);

    expect(summary.sources.map((source) => source.path)).toEqual([
      'web-types.json',
      'apps/vanrot-site/web-types.json',
      'packages/ui/web-types.json',
      'packages/router/web-types.json',
    ]);
    expect(summary.tags.map((tag) => tag.name)).toEqual([
      'vr',
      'docs-page',
      'vr-button',
    ]);
    expect(summary.attributes.map((attribute) => attribute.name)).toEqual(['route.home']);
  });

  it('returns an empty summary when project root is null', () => {
    expect(loadVanrotWebTypes(null)).toEqual({
      sources: [],
      tags: [],
      attributes: [],
    });
  });
});
```

- [ ] **Step 2: Run the Web Types tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/web-types.test.ts
```

Expected: FAIL with an import error for `../src/project/web-types.ts`.

- [ ] **Step 3: Create the Web Types loader**

Create `packages/language-server/src/project/web-types.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const webTypesPaths = [
  'web-types.json',
  'apps/vanrot-site/web-types.json',
  'packages/ui/web-types.json',
  'packages/router/web-types.json',
] as const;

export interface VanrotWebTypesSource {
  path: string;
  name: string | null;
}

export interface VanrotWebTypesTag {
  name: string;
  description: string | null;
  sourcePath: string;
}

export interface VanrotWebTypesAttribute {
  name: string;
  description: string | null;
  sourcePath: string;
}

export interface VanrotWebTypesSummary {
  sources: VanrotWebTypesSource[];
  tags: VanrotWebTypesTag[];
  attributes: VanrotWebTypesAttribute[];
}

interface RawWebTypes {
  name?: unknown;
  contributions?: {
    html?: {
      tags?: Array<{ name?: unknown; description?: unknown }>;
      attributes?: Array<{ name?: unknown; description?: unknown }>;
    };
  };
}

export function loadVanrotWebTypes(projectRoot: string | null): VanrotWebTypesSummary {
  if (projectRoot === null) {
    return emptySummary();
  }

  const summary = emptySummary();

  for (const relativePath of webTypesPaths) {
    const absolutePath = join(projectRoot, relativePath);

    if (!existsSync(absolutePath)) {
      continue;
    }

    const parsed = readWebTypesFile(absolutePath);
    summary.sources.push({ path: relativePath, name: stringOrNull(parsed.name) });

    for (const tag of parsed.contributions?.html?.tags ?? []) {
      if (typeof tag.name !== 'string') {
        continue;
      }

      summary.tags.push({
        name: tag.name,
        description: stringOrNull(tag.description),
        sourcePath: relativePath,
      });
    }

    for (const attribute of parsed.contributions?.html?.attributes ?? []) {
      if (typeof attribute.name !== 'string') {
        continue;
      }

      summary.attributes.push({
        name: attribute.name,
        description: stringOrNull(attribute.description),
        sourcePath: relativePath,
      });
    }
  }

  return summary;
}

function readWebTypesFile(path: string): RawWebTypes {
  return JSON.parse(readFileSync(path, 'utf8')) as RawWebTypes;
}

function emptySummary(): VanrotWebTypesSummary {
  return { sources: [], tags: [], attributes: [] };
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
```

- [ ] **Step 4: Wire Web Types into the workspace index**

Modify `packages/language-server/src/project/workspace.ts`:

```ts
import { loadVanrotWebTypes, type VanrotWebTypesSummary } from './web-types.js';
```

Add to `WorkspaceIndex`:

```ts
  webTypes: VanrotWebTypesSummary;
```

Use this empty index shape when `projectRoot === null`:

```ts
    return {
      routes: [],
      components: [],
      routesPath: null,
      projectRoot: null,
      webTypes: loadVanrotWebTypes(null),
    };
```

Add this before the `return`:

```ts
  const webTypes = loadVanrotWebTypes(projectRoot);
```

Return:

```ts
  return { routes, components, routesPath: existsSync(routesPath) ? routesPath : null, projectRoot, webTypes };
```

Update the default `WorkspaceIndex` value in `packages/language-server/src/server.ts`:

```ts
  let index: WorkspaceIndex = {
    routes: [],
    components: [],
    routesPath: null,
    projectRoot: null,
    webTypes: { sources: [], tags: [], attributes: [] },
  };
```

- [ ] **Step 5: Export the Web Types API**

Modify `packages/language-server/src/index.ts`:

```ts
export {
  loadVanrotWebTypes,
  type VanrotWebTypesAttribute,
  type VanrotWebTypesSource,
  type VanrotWebTypesSummary,
  type VanrotWebTypesTag,
} from './project/web-types.js';
```

- [ ] **Step 6: Run Web Types tests**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/web-types.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run workspace tests**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/project-root.test.ts packages/language-server/tests/component-index.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add packages/language-server/src/project/web-types.ts packages/language-server/src/project/workspace.ts packages/language-server/src/index.ts packages/language-server/tests/web-types.test.ts
git commit -m "feat(language-server): load vanrot web types"
```

Expected: commit succeeds with only Web Types loader files staged from this task.

### Task 3: Template Index And Editor Intelligence Contract

**Files:**
- Create: `packages/language-server/src/project/template-index.ts`
- Create: `packages/language-server/src/project/editor-intelligence.ts`
- Create: `packages/language-server/tests/template-index.test.ts`
- Create: `packages/language-server/tests/editor-intelligence.test.ts`
- Modify: `packages/language-server/src/project/workspace.ts`
- Modify: `packages/language-server/src/index.ts`

- [ ] **Step 1: Write the failing template index tests**

Create `packages/language-server/tests/template-index.test.ts`:

```ts
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTemplateIndex } from '../src/project/template-index.ts';

function workspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'vanrot-template-index-'));
  mkdirSync(join(root, 'src/pages'), { recursive: true });
  return root;
}

describe('buildTemplateIndex', () => {
  it('records route refs, custom tags, bracket bindings, and dotted no-value attributes', () => {
    const root = workspace();
    const templatePath = join(root, 'src/pages/home.page.html');
    writeFileSync(
      templatePath,
      [
        '<docs-page [article]="article">',
        '  <vr route.home />',
        '  <vr-button behavior.tooltip>',
        '    {{ user.name }}',
        '  </vr-button>',
        '</docs-page>',
      ].join('\n'),
    );

    const index = buildTemplateIndex(root);
    const template = index.templates[0];

    expect(template.path).toBe(templatePath);
    expect(template.routeRefs.map((ref) => ref.name)).toEqual(['home']);
    expect(template.tags.map((tag) => tag.name)).toEqual(['docs-page', 'vr', 'vr-button']);
    expect(template.bracketBindings.map((binding) => binding.name)).toEqual(['article']);
    expect(template.dottedAttributes.map((attribute) => attribute.name)).toEqual(['behavior.tooltip']);
  });

  it('returns an empty index when project root is null', () => {
    expect(buildTemplateIndex(null)).toEqual({ templates: [] });
  });
});
```

- [ ] **Step 2: Run the template index test and confirm failure**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/template-index.test.ts
```

Expected: FAIL with an import error for `../src/project/template-index.ts`.

- [ ] **Step 3: Create the template index**

Create `packages/language-server/src/project/template-index.ts`:

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultSourceRoot } from '@vanrot/config';
import { parseTemplate, type SourceSpan, type TemplateNode } from '@vanrot/compiler';

const templateFilePattern = /\.(component|page|layout|dialog|widget|form|button)\.html$/;
const routeAttributePrefix = 'route.';

export interface TemplateReference {
  name: string;
  span: SourceSpan;
}

export interface TemplateFileEntry {
  path: string;
  tags: TemplateReference[];
  routeRefs: TemplateReference[];
  bracketBindings: TemplateReference[];
  dottedAttributes: TemplateReference[];
}

export interface TemplateIndex {
  templates: TemplateFileEntry[];
}

export function buildTemplateIndex(projectRoot: string | null): TemplateIndex {
  if (projectRoot === null) {
    return { templates: [] };
  }

  const templates = collectTemplatePaths(projectRoot).map((path) =>
    parseTemplateFile(path, readFileSync(path, 'utf8')),
  );

  return { templates };
}

function collectTemplatePaths(projectRoot: string): string[] {
  const sourceRoot = join(projectRoot, defaultSourceRoot);

  if (!existsSync(sourceRoot)) {
    return [];
  }

  const files: string[] = [];
  const pending = [sourceRoot];

  while (pending.length > 0) {
    const directory = pending.pop();

    if (directory === undefined) {
      continue;
    }

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        pending.push(path);
        continue;
      }

      if (entry.isFile() && templateFilePattern.test(entry.name)) {
        files.push(path);
      }
    }
  }

  return files.sort();
}

function parseTemplateFile(path: string, source: string): TemplateFileEntry {
  const parsed = parseTemplate(source, path);
  const entry: TemplateFileEntry = {
    path,
    tags: [],
    routeRefs: [],
    bracketBindings: [],
    dottedAttributes: [],
  };

  collectFromNodes(parsed.nodes, source, entry);
  return entry;
}

function collectFromNodes(nodes: readonly TemplateNode[], source: string, entry: TemplateFileEntry): void {
  for (const node of nodes) {
    collectFromNode(node, source, entry);
  }
}

function collectFromNode(node: TemplateNode, source: string, entry: TemplateFileEntry): void {
  if (node.kind === 'element') {
    entry.tags.push({ name: node.tagName, span: node.span });
    collectAttributes(node, source, entry);
    collectFromNodes(node.children, source, entry);
    return;
  }

  if (node.kind === 'slot-outlet') {
    collectFromNodes(node.fallback, source, entry);
    return;
  }

  if (node.kind === 'if-block') {
    collectFromNodes([...node.consequent, ...node.alternate], source, entry);
    return;
  }

  if (node.kind === 'for-block') {
    collectFromNodes([...node.body, ...node.empty], source, entry);
  }
}

function collectAttributes(
  node: Extract<TemplateNode, { kind: 'element' }>,
  source: string,
  entry: TemplateFileEntry,
): void {
  const openTag = source.slice(node.span.startOffset, node.span.endOffset).split('>')[0] ?? '';
  const routePattern = /\broute\.([A-Za-z0-9_-]+)/g;
  const bracketPattern = /\[([A-Za-z0-9_-]+)]=/g;
  const dottedPattern = /\b([A-Za-z][A-Za-z0-9_-]*\.[A-Za-z0-9_.-]+)(?=\s|>|\/)/g;

  for (const match of openTag.matchAll(routePattern)) {
    entry.routeRefs.push({ name: match[1] ?? '', span: spanForMatch(node.span, match) });
  }

  for (const match of openTag.matchAll(bracketPattern)) {
    entry.bracketBindings.push({ name: match[1] ?? '', span: spanForMatch(node.span, match) });
  }

  for (const match of openTag.matchAll(dottedPattern)) {
    const name = match[1] ?? '';

    if (name.startsWith(routeAttributePrefix)) {
      continue;
    }

    entry.dottedAttributes.push({ name, span: spanForMatch(node.span, match) });
  }
}

function spanForMatch(parent: SourceSpan, match: RegExpMatchArray): SourceSpan {
  const startOffset = parent.startOffset + (match.index ?? 0);
  const endOffset = startOffset + match[0].length;

  return {
    ...parent,
    startOffset,
    endOffset,
  };
}
```

- [ ] **Step 4: Write the failing editor intelligence tests**

Create `packages/language-server/tests/editor-intelligence.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildEditorIntelligence } from '../src/project/editor-intelligence.ts';
import type { WorkspaceIndex } from '../src/project/workspace.ts';

describe('buildEditorIntelligence', () => {
  it('builds the stable schema version 1 payload', () => {
    const workspace: WorkspaceIndex = {
      projectRoot: '/repo',
      routesPath: '/repo/src/routes.ts',
      routes: [
        {
          name: 'home',
          path: '/',
          page: './pages/home.page',
          span: {
            filePath: '/repo/src/routes.ts',
            startLine: 1,
            startColumn: 14,
            endLine: 1,
            endColumn: 18,
            startOffset: 13,
            endOffset: 17,
          },
        },
      ],
      components: [
        {
          tagName: 'home-page',
          className: 'HomePage',
          path: '/repo/src/pages/home.page.ts',
        },
      ],
      webTypes: {
        sources: [{ path: 'web-types.json', name: 'root' }],
        tags: [{ name: 'vr', description: 'Route shorthand', sourcePath: 'web-types.json' }],
        attributes: [{ name: 'route.home', description: 'Home route', sourcePath: 'web-types.json' }],
      },
      templates: {
        templates: [
          {
            path: '/repo/src/pages/home.page.html',
            tags: [],
            routeRefs: [],
            bracketBindings: [],
            dottedAttributes: [],
          },
        ],
      },
    };

    expect(buildEditorIntelligence(workspace)).toMatchObject({
      schemaVersion: 1,
      projectRoot: '/repo',
      routes: [{ key: 'home', path: '/', page: './pages/home.page' }],
      components: [{ tagName: 'home-page', className: 'HomePage' }],
      templates: [{ path: '/repo/src/pages/home.page.html' }],
      webTypes: { sources: [{ path: 'web-types.json', name: 'root' }] },
      diagnostics: [],
      generatedMetadata: [],
    });
  });
});
```

- [ ] **Step 5: Run intelligence tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/editor-intelligence.test.ts
```

Expected: FAIL with an import error for `../src/project/editor-intelligence.ts`.

- [ ] **Step 6: Create the editor intelligence contract**

Create `packages/language-server/src/project/editor-intelligence.ts`:

```ts
import type { ComponentEntry } from './component-index.js';
import type { RouteEntry } from './route-index.js';
import type { TemplateFileEntry, TemplateIndex } from './template-index.js';
import type { VanrotWebTypesSummary } from './web-types.js';
import type { WorkspaceIndex } from './workspace.js';

export interface VanrotEditorIntelligence {
  schemaVersion: 1;
  projectRoot: string | null;
  routes: VanrotEditorRoute[];
  components: VanrotEditorComponent[];
  templates: VanrotEditorTemplate[];
  webTypes: VanrotWebTypesSummary;
  diagnostics: VanrotEditorDiagnosticSummary[];
  generatedMetadata: VanrotEditorGeneratedMetadata[];
}

export interface VanrotEditorRoute {
  key: string;
  path: string | null;
  page: string | null;
  sourceFile: string;
}

export interface VanrotEditorComponent {
  tagName: string;
  className: string;
  componentFile: string;
}

export interface VanrotEditorTemplate {
  path: string;
  routeRefs: string[];
  tags: string[];
  bracketBindings: string[];
  dottedAttributes: string[];
}

export interface VanrotEditorDiagnosticSummary {
  code: string;
  message: string;
  sourceFile: string;
}

export interface VanrotEditorGeneratedMetadata {
  path: string;
  kind: 'web-types' | 'intelligence' | 'template-globs';
}

export function buildEditorIntelligence(index: WorkspaceIndex): VanrotEditorIntelligence {
  return {
    schemaVersion: 1,
    projectRoot: index.projectRoot,
    routes: index.routes.map(toEditorRoute),
    components: index.components.map(toEditorComponent),
    templates: toEditorTemplates(index.templates),
    webTypes: index.webTypes,
    diagnostics: [],
    generatedMetadata: [],
  };
}

function toEditorRoute(route: RouteEntry): VanrotEditorRoute {
  return {
    key: route.name,
    path: route.path ?? null,
    page: route.page ?? null,
    sourceFile: route.span.filePath,
  };
}

function toEditorComponent(component: ComponentEntry): VanrotEditorComponent {
  return {
    tagName: component.tagName,
    className: component.className,
    componentFile: component.path,
  };
}

function toEditorTemplates(index: TemplateIndex): VanrotEditorTemplate[] {
  return index.templates.map((template) => ({
    path: template.path,
    routeRefs: names(template.routeRefs),
    tags: names(template.tags),
    bracketBindings: names(template.bracketBindings),
    dottedAttributes: names(template.dottedAttributes),
  }));
}

function names(entries: readonly TemplateFileEntry['routeRefs']): string[] {
  return entries.map((entry) => entry.name);
}
```

- [ ] **Step 7: Wire templates into the workspace index**

Modify `packages/language-server/src/project/workspace.ts`:

```ts
import { buildTemplateIndex, type TemplateIndex } from './template-index.js';
```

Add to `WorkspaceIndex`:

```ts
  templates: TemplateIndex;
```

Use this empty index shape when `projectRoot === null`:

```ts
    return {
      routes: [],
      components: [],
      routesPath: null,
      projectRoot: null,
      webTypes: loadVanrotWebTypes(null),
      templates: buildTemplateIndex(null),
    };
```

Add this before return:

```ts
  const templates = buildTemplateIndex(projectRoot);
```

Return:

```ts
  return { routes, components, routesPath: existsSync(routesPath) ? routesPath : null, projectRoot, webTypes, templates };
```

Update the default `WorkspaceIndex` value in `packages/language-server/src/server.ts`:

```ts
  let index: WorkspaceIndex = {
    routes: [],
    components: [],
    routesPath: null,
    projectRoot: null,
    webTypes: { sources: [], tags: [], attributes: [] },
    templates: { templates: [] },
  };
```

- [ ] **Step 8: Export intelligence APIs**

Modify `packages/language-server/src/index.ts`:

```ts
export { buildEditorIntelligence, type VanrotEditorIntelligence } from './project/editor-intelligence.js';
export {
  buildTemplateIndex,
  type TemplateFileEntry,
  type TemplateIndex,
  type TemplateReference,
} from './project/template-index.js';
```

- [ ] **Step 9: Run template and intelligence tests**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/template-index.test.ts packages/language-server/tests/editor-intelligence.test.ts
```

Expected: PASS.

- [ ] **Step 10: Run all language server tests**

Run:

```bash
pnpm --filter @vanrot/language-server test
```

Expected: PASS.

- [ ] **Step 11: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add packages/language-server/src/project/template-index.ts packages/language-server/src/project/editor-intelligence.ts packages/language-server/src/project/workspace.ts packages/language-server/src/index.ts packages/language-server/tests/template-index.test.ts packages/language-server/tests/editor-intelligence.test.ts
git commit -m "feat(language-server): add editor intelligence index"
```

Expected: commit succeeds with only template index and intelligence files staged from this task.

### Task 4: Intelligence Export Command

**Files:**
- Create: `packages/language-server/src/project/export-intelligence.ts`
- Create: `packages/language-server/tests/export-intelligence.test.ts`
- Modify: `packages/language-server/src/bin/server.ts`
- Modify: `packages/language-server/package.json`
- Modify: `packages/language-server/scripts/bundle-intellij.mjs`

- [ ] **Step 1: Write the failing export tests**

Create `packages/language-server/tests/export-intelligence.test.ts`:

```ts
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportEditorIntelligence } from '../src/project/export-intelligence.ts';

describe('exportEditorIntelligence', () => {
  it('writes .vanrot/editor-intelligence.json with schema version 1', () => {
    const root = mkdtempSync(join(tmpdir(), 'vanrot-export-intelligence-'));

    const outputPath = exportEditorIntelligence(root);
    const parsed = JSON.parse(readFileSync(outputPath, 'utf8')) as { schemaVersion?: unknown };

    expect(outputPath).toBe(join(root, '.vanrot/editor-intelligence.json'));
    expect(existsSync(outputPath)).toBe(true);
    expect(parsed.schemaVersion).toBe(1);
  });
});
```

- [ ] **Step 2: Run export tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/export-intelligence.test.ts
```

Expected: FAIL with an import error for `../src/project/export-intelligence.ts`.

- [ ] **Step 3: Create the export helper**

Create `packages/language-server/src/project/export-intelligence.ts`:

```ts
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { buildEditorIntelligence } from './editor-intelligence.js';
import { loadWorkspaceIndex } from './workspace.js';

export const editorIntelligenceRelativePath = '.vanrot/editor-intelligence.json';

export function exportEditorIntelligence(projectRoot: string): string {
  const outputPath = join(projectRoot, editorIntelligenceRelativePath);
  const tempPath = `${outputPath}.tmp`;
  const intelligence = buildEditorIntelligence(loadWorkspaceIndex(projectRoot));

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(tempPath, `${JSON.stringify(intelligence, null, 2)}\n`);
  renameSync(tempPath, outputPath);

  return outputPath;
}
```

- [ ] **Step 4: Add guarded CLI mode**

Modify `packages/language-server/src/bin/server.ts`:

```ts
import { exportEditorIntelligence } from '../project/export-intelligence.js';
```

Add this guard before starting the stdio server:

```ts
const [, , command, projectRoot] = process.argv;

if (command === '--export-intelligence') {
  if (projectRoot === undefined) {
    console.error('Usage: vanrot-language-server --export-intelligence <projectRoot>');
    process.exitCode = 1;
  } else {
    console.log(exportEditorIntelligence(projectRoot));
  }
} else {
  startLanguageServer(createConnection(ProposedFeatures.all));
}
```

Keep the existing `--stdio` path working by treating unknown command arguments as normal LSP startup.

- [ ] **Step 5: Add the explicit bin alias**

Modify `packages/language-server/package.json`:

```json
"bin": {
  "vanrot-language-server": "./dist/bin/server.js",
  "vanrot-editor-intelligence": "./dist/bin/server.js"
}
```

- [ ] **Step 6: Bundle the export code for JetBrains**

Modify `packages/language-server/scripts/bundle-intellij.mjs` so `dist-intellij` includes the built export helper and package bin metadata. Add these assertions after copy logic:

```js
const requiredBundledFiles = [
  'bin/server.js',
  'project/export-intelligence.js',
  'project/editor-intelligence.js',
  'project/web-types.js',
  'project/template-index.js',
];

for (const file of requiredBundledFiles) {
  const path = join(distIntellijDirectory, file);

  if (!existsSync(path)) {
    throw new Error(`Missing IntelliJ language-server bundle file: ${file}`);
  }
}
```

- [ ] **Step 7: Run export and bundle tests**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/export-intelligence.test.ts packages/language-server/tests/globs-artifact.test.ts
pnpm --filter @vanrot/language-server build:intellij
```

Expected: PASS. `packages/language-server/dist-intellij/bin/server.js` exists.

- [ ] **Step 8: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add packages/language-server/src/project/export-intelligence.ts packages/language-server/src/bin/server.ts packages/language-server/package.json packages/language-server/scripts/bundle-intellij.mjs packages/language-server/tests/export-intelligence.test.ts
git commit -m "feat(language-server): export editor intelligence"
```

Expected: commit succeeds with only export-command files staged from this task.

### Task 5: Completion And Inline Docs

**Files:**
- Modify: `packages/language-server/tests/completion.test.ts`
- Modify: `packages/language-server/tests/completion-handler.test.ts`
- Modify: `packages/language-server/tests/expression-handler.test.ts`
- Modify: `packages/language-server/src/features/completion.ts`
- Modify: `packages/language-server/src/server.ts`

- [ ] **Step 1: Add failing completion tests**

Append to `packages/language-server/tests/completion.test.ts`:

```ts
it('offers web types backed tag documentation', () => {
  const items = buildCompletions(
    'tag-name',
    {
      routes: [],
      components: [],
      routesPath: null,
      projectRoot: '/repo',
      templates: { templates: [] },
      webTypes: {
        sources: [{ path: 'packages/ui/web-types.json', name: 'ui' }],
        tags: [
          {
            name: 'vr-button',
            description: 'Button primitive from Web Types.',
            sourcePath: 'packages/ui/web-types.json',
          },
        ],
        attributes: [],
      },
    },
  );

  expect(items).toContainEqual(
    expect.objectContaining({
      label: 'vr-button',
      detail: 'packages/ui/web-types.json',
      documentation: 'Button primitive from Web Types.',
    }),
  );
});

it('offers route attribute completions from indexed routes', () => {
  const items = buildCompletions(
    'attribute-name',
    {
      routes: [
        {
          name: 'settings',
          path: '/settings',
          page: './pages/settings.page',
          span: {
            filePath: '/repo/src/routes.ts',
            startLine: 1,
            startColumn: 1,
            endLine: 1,
            endColumn: 9,
            startOffset: 0,
            endOffset: 8,
          },
        },
      ],
      components: [],
      routesPath: '/repo/src/routes.ts',
      projectRoot: '/repo',
      templates: { templates: [] },
      webTypes: { sources: [], tags: [], attributes: [] },
    },
  );

  expect(items).toContainEqual(expect.objectContaining({ label: 'route.settings', detail: '/settings' }));
});
```

- [ ] **Step 2: Run completion tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/completion.test.ts
```

Expected: FAIL because `buildCompletions` does not yet use Web Types detail/documentation in the expected shape.

- [ ] **Step 3: Enrich completion items**

Modify `packages/language-server/src/features/completion.ts` so `buildCompletions` includes:

```ts
function webTypesTagItems(index: WorkspaceIndex): CompletionItem[] {
  return index.webTypes.tags.map((tag) => ({
    label: tag.name,
    kind: CompletionItemKind.Class,
    detail: tag.sourcePath,
    documentation: tag.description ?? undefined,
  }));
}

function routeAttributeItems(index: WorkspaceIndex): CompletionItem[] {
  return index.routes.map((route) => ({
    label: `route.${route.name}`,
    kind: CompletionItemKind.Field,
    detail: route.path ?? route.page ?? undefined,
  }));
}
```

Use the helpers in the existing tag-name and attribute-name branches:

```ts
if (context === 'tag-name') {
  return [...vanrotElementItems(), ...componentItems(index), ...webTypesTagItems(index)];
}

if (context === 'attribute-name') {
  return [...routeAttributeItems(index), ...webTypesAttributeItems(index)];
}
```

- [ ] **Step 4: Keep inline docs through the LSP handler**

Append to `packages/language-server/tests/completion-handler.test.ts`:

```ts
it('returns inline docs for Web Types-backed completions', async () => {
  const result = await completeInWorkspace({
    rootFiles: {
      'web-types.json': JSON.stringify({
        contributions: {
          html: {
            tags: [{ name: 'vr-shell', description: 'Shell docs from Web Types.' }],
          },
        },
      }),
      'src/pages/home.page.html': '<',
    },
    uri: 'src/pages/home.page.html',
    position: { line: 0, character: 1 },
  });

  expect(result).toContainEqual(
    expect.objectContaining({
      label: 'vr-shell',
      documentation: 'Shell docs from Web Types.',
    }),
  );
});
```

Use the existing completion-handler helper style in the file. If the helper has a different name, keep the same body and call the local helper that initializes the test connection.

- [ ] **Step 5: Run completion handler tests**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/completion.test.ts packages/language-server/tests/completion-handler.test.ts packages/language-server/tests/expression-handler.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add packages/language-server/src/features/completion.ts packages/language-server/src/server.ts packages/language-server/tests/completion.test.ts packages/language-server/tests/completion-handler.test.ts packages/language-server/tests/expression-handler.test.ts
git commit -m "feat(language-server): enrich editor completions"
```

Expected: commit succeeds with only completion files staged from this task.

### Task 6: Navigation, References, And Route Rename

**Files:**
- Modify: `packages/language-server/tests/definition.test.ts`
- Modify: `packages/language-server/tests/references.test.ts`
- Modify: `packages/language-server/tests/server.test.ts`
- Modify: `packages/language-server/src/features/definition.ts`
- Modify: `packages/language-server/src/features/references.ts`
- Modify: `packages/language-server/src/server.ts`

- [ ] **Step 1: Add failing definition tests**

Append to `packages/language-server/tests/definition.test.ts`:

```ts
it('points a Web Types tag at the metadata source when no component source exists', () => {
  const location = findDefinition(
    {
      kind: 'component-tag',
      name: 'docs-page',
      span: {
        filePath: '/repo/src/pages/home.page.html',
        startLine: 1,
        startColumn: 2,
        endLine: 1,
        endColumn: 11,
        startOffset: 1,
        endOffset: 10,
      },
    },
    {
      routes: [],
      components: [],
      routesPath: null,
      projectRoot: '/repo',
      templates: { templates: [] },
      webTypes: {
        sources: [{ path: 'apps/vanrot-site/web-types.json', name: 'site' }],
        tags: [
          {
            name: 'docs-page',
            description: 'Docs shell',
            sourcePath: 'apps/vanrot-site/web-types.json',
          },
        ],
        attributes: [],
      },
    },
  );

  expect(location?.uri).toContain('/repo/apps/vanrot-site/web-types.json');
});
```

- [ ] **Step 2: Add failing references tests**

Append to `packages/language-server/tests/references.test.ts`:

```ts
it('finds route references in indexed workspace templates', () => {
  const locations = findReferences(
    {
      kind: 'route-ref',
      name: 'settings',
      span: {
        filePath: '/repo/src/pages/home.page.html',
        startLine: 1,
        startColumn: 12,
        endLine: 1,
        endColumn: 20,
        startOffset: 11,
        endOffset: 19,
      },
    },
    [],
    {
      templates: [
        {
          path: '/repo/src/pages/settings.page.html',
          tags: [],
          routeRefs: [
            {
              name: 'settings',
              span: {
                filePath: '/repo/src/pages/settings.page.html',
                startLine: 1,
                startColumn: 5,
                endLine: 1,
                endColumn: 19,
                startOffset: 4,
                endOffset: 18,
              },
            },
          ],
          bracketBindings: [],
          dottedAttributes: [],
        },
      ],
    },
  );

  expect(locations.map((location) => location.uri)).toEqual([
    'file:///repo/src/pages/settings.page.html',
  ]);
});
```

- [ ] **Step 3: Run navigation tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/definition.test.ts packages/language-server/tests/references.test.ts
```

Expected: FAIL because Web Types definition and indexed template references are not wired yet.

- [ ] **Step 4: Add Web Types definition fallback**

Modify `packages/language-server/src/features/definition.ts`:

```ts
import { join } from 'node:path';
```

Inside the `component-tag` branch, after the component lookup and before `findUiPrimitiveDefinition`:

```ts
    const webTypeTag = index.webTypes.tags.find((entry) => entry.name === symbol.name);

    if (webTypeTag !== undefined && index.projectRoot !== null) {
      return fileStartLocation(join(index.projectRoot, webTypeTag.sourcePath));
    }
```

- [ ] **Step 5: Add indexed template references**

Modify `packages/language-server/src/features/references.ts`:

```ts
import { URI } from 'vscode-uri';
import type { TemplateIndex } from '../project/template-index.js';
```

Change the signature:

```ts
export function findReferences(
  symbol: TemplateSymbol,
  documents: readonly TextDocumentLike[],
  templates: TemplateIndex = { templates: [] },
): Location[] {
```

Add after open-document collection:

```ts
  for (const template of templates.templates) {
    for (const span of collectFromIndexedTemplate(template, symbol)) {
      locations.push({ uri: URI.file(template.path).toString(), range: spanToRange(span) });
    }
  }
```

Add helper:

```ts
function collectFromIndexedTemplate(
  template: TemplateIndex['templates'][number],
  symbol: TemplateSymbol,
): SourceSpan[] {
  if (symbol.kind === 'route-ref') {
    return template.routeRefs.filter((ref) => ref.name === symbol.name).map((ref) => ref.span);
  }

  if (symbol.kind === 'component-tag') {
    return template.tags.filter((tag) => tag.name === symbol.name).map((tag) => tag.span);
  }

  return [];
}
```

- [ ] **Step 6: Pass indexed templates from the server**

Modify the `connection.onReferences` handler in `packages/language-server/src/server.ts`:

```ts
    return findReferences(
      symbol,
      documents.all().map((openDocument) => ({ uri: openDocument.uri, text: openDocument.getText() })),
      index.templates,
    );
```

- [ ] **Step 7: Add route rename server test**

Append to `packages/language-server/tests/server.test.ts`:

```ts
it('renames route refs without touching expression rename', async () => {
  const edit = await renameInWorkspace({
    rootFiles: {
      'src/routes.ts': "export const route = { settings: { path: '/settings', page: './pages/settings.page' } };",
      'src/pages/home.page.html': '<vr route.settings />',
    },
    uri: 'src/pages/home.page.html',
    position: { line: 0, character: 11 },
    newName: 'accountSettings',
  });

  expect(edit?.changes).toMatchObject({
    'file:///src/pages/home.page.html': [
      {
        newText: 'route.accountSettings',
      },
    ],
  });
});
```

Use the existing rename helper style in the file. If the test suite uses absolute temporary URIs, preserve that local URI construction and assert on `newText`.

- [ ] **Step 8: Implement route rename in the server**

Modify `packages/language-server/src/server.ts` before the expression rename guard:

```ts
    const symbol = resolveSymbolAt(source, offset);

    if (symbol?.kind === 'route-ref') {
      const edits = findReferences(
        symbol,
        documents.all().map((openDocument) => ({ uri: openDocument.uri, text: openDocument.getText() })),
        index.templates,
      ).map((location) => ({
        location,
        newText: `route.${params.newName}`,
      }));

      return {
        changes: Object.fromEntries(
          edits.map((edit) => [edit.location.uri, [{ range: edit.location.range, newText: edit.newText }]]),
        ),
      };
    }

    if (!isExpressionOffset(source, offset)) {
      return null;
    }
```

- [ ] **Step 9: Run navigation tests**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/definition.test.ts packages/language-server/tests/references.test.ts packages/language-server/tests/server.test.ts
```

Expected: PASS.

- [ ] **Step 10: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add packages/language-server/src/features/definition.ts packages/language-server/src/features/references.ts packages/language-server/src/server.ts packages/language-server/tests/definition.test.ts packages/language-server/tests/references.test.ts packages/language-server/tests/server.test.ts
git commit -m "feat(language-server): add template navigation and route rename"
```

Expected: commit succeeds with only navigation files staged from this task.

### Task 7: Diagnostics And Code Actions

**Files:**
- Create: `packages/language-server/src/features/code-actions.ts`
- Create: `packages/language-server/tests/code-actions.test.ts`
- Modify: `packages/language-server/tests/diagnostics-compile.test.ts`
- Modify: `packages/language-server/tests/diagnostics-handler.test.ts`
- Modify: `packages/language-server/tests/lsp-handshake.test.ts`
- Modify: `packages/language-server/src/features/diagnostics.ts`
- Modify: `packages/language-server/src/server.ts`

- [ ] **Step 1: Add failing diagnostics tests**

Append to `packages/language-server/tests/diagnostics-compile.test.ts`:

```ts
it('does not flag valid bracket bindings or dotted no-value attributes', async () => {
  const diagnostics = await compileTemplateDiagnostics(
    '/repo/src/pages/home.page.html',
    '<docs-page [article]="article"><vr-button behavior.tooltip /></docs-page>',
  );

  expect(diagnostics).toEqual([]);
});
```

- [ ] **Step 2: Write failing code action tests**

Create `packages/language-server/tests/code-actions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildCodeActions } from '../src/features/code-actions.ts';

describe('buildCodeActions', () => {
  it('suggests the closest route ref for a route typo', () => {
    const actions = buildCodeActions({
      documentUri: 'file:///repo/src/pages/home.page.html',
      diagnostics: [
        {
          code: 'VREDITOR001',
          message: 'Unknown route ref route.settngs.',
          source: 'vanrot',
          range: {
            start: { line: 0, character: 4 },
            end: { line: 0, character: 17 },
          },
        },
      ],
      routes: [{ name: 'settings', path: '/settings' }],
      webTypesSources: ['packages/router/web-types.json'],
    });

    expect(actions).toContainEqual(
      expect.objectContaining({
        title: 'Replace with route.settings',
      }),
    );
  });

  it('points missing metadata fixes at the Web Types source file', () => {
    const actions = buildCodeActions({
      documentUri: 'file:///repo/src/pages/home.page.html',
      diagnostics: [
        {
          code: 'VREDITOR003',
          message: 'Missing Web Types metadata for vr-panel.',
          source: 'vanrot',
          range: {
            start: { line: 0, character: 1 },
            end: { line: 0, character: 9 },
          },
        },
      ],
      routes: [],
      webTypesSources: ['packages/ui/web-types.json'],
    });

    expect(actions[0]?.command?.arguments).toEqual(['packages/ui/web-types.json']);
  });
});
```

- [ ] **Step 3: Run diagnostics and code action tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/diagnostics-compile.test.ts packages/language-server/tests/code-actions.test.ts packages/language-server/tests/lsp-handshake.test.ts
```

Expected: FAIL because `code-actions.ts` does not exist and initialize does not advertise code actions.

- [ ] **Step 4: Create code actions**

Create `packages/language-server/src/features/code-actions.ts`:

```ts
import { type CodeAction, CodeActionKind, type Diagnostic } from 'vscode-languageserver';

export interface BuildCodeActionsInput {
  documentUri: string;
  diagnostics: readonly Diagnostic[];
  routes: Array<{ name: string; path: string | null }>;
  webTypesSources: string[];
}

export function buildCodeActions(input: BuildCodeActionsInput): CodeAction[] {
  return input.diagnostics.flatMap((diagnostic) => {
    if (diagnostic.code === 'VREDITOR001') {
      return routeTypoActions(input.documentUri, diagnostic, input.routes);
    }

    if (diagnostic.code === 'VREDITOR003') {
      return metadataActions(diagnostic, input.webTypesSources);
    }

    return [];
  });
}

function routeTypoActions(
  documentUri: string,
  diagnostic: Diagnostic,
  routes: BuildCodeActionsInput['routes'],
): CodeAction[] {
  const typo = routeNameFromMessage(diagnostic.message);
  const closest = closestRoute(typo, routes.map((route) => route.name));

  if (closest === null) {
    return [];
  }

  return [
    {
      title: `Replace with route.${closest}`,
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      edit: {
        changes: {
          [documentUri]: [{ range: diagnostic.range, newText: `route.${closest}` }],
        },
      },
    },
  ];
}

function metadataActions(diagnostic: Diagnostic, sources: readonly string[]): CodeAction[] {
  const source = sources[0];

  if (source === undefined) {
    return [];
  }

  return [
    {
      title: `Open ${source}`,
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      command: {
        title: `Open ${source}`,
        command: 'vanrot.openWebTypesSource',
        arguments: [source],
      },
    },
  ];
}

function routeNameFromMessage(message: string): string {
  const match = message.match(/route\.([A-Za-z0-9_-]+)/);
  return match?.[1] ?? '';
}

function closestRoute(value: string, candidates: readonly string[]): string | null {
  let best: { value: string; distance: number } | null = null;

  for (const candidate of candidates) {
    const distance = levenshtein(value, candidate);

    if (best === null || distance < best.distance) {
      best = { value: candidate, distance };
    }
  }

  return best?.distance !== undefined && best.distance <= 3 ? best.value : null;
}

function levenshtein(left: string, right: string): number {
  const rows = Array.from({ length: left.length + 1 }, (_, index) => [index]);

  for (let column = 1; column <= right.length; column += 1) {
    rows[0]![column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      rows[row]![column] = Math.min(
        rows[row - 1]![column]! + 1,
        rows[row]![column - 1]! + 1,
        rows[row - 1]![column - 1]! + cost,
      );
    }
  }

  return rows[left.length]![right.length]!;
}
```

- [ ] **Step 5: Advertise code actions**

Modify `packages/language-server/src/server.ts`:

```ts
import { buildCodeActions } from './features/code-actions.js';
```

Add to `buildInitializeResult` capabilities:

```ts
      codeActionProvider: true,
```

Add handler:

```ts
  connection.onCodeAction((params) =>
    buildCodeActions({
      documentUri: params.textDocument.uri,
      diagnostics: params.context.diagnostics,
      routes: index.routes.map((route) => ({ name: route.name, path: route.path ?? null })),
      webTypesSources: index.webTypes.sources.map((source) => source.path),
    }),
  );
```

- [ ] **Step 6: Add editor diagnostics without breaking compiler diagnostics**

Modify `packages/language-server/src/features/diagnostics.ts`:

```ts
import type { WorkspaceIndex } from '../project/workspace.js';
```

Add:

```ts
export function editorTemplateDiagnostics(templatePath: string, index: WorkspaceIndex): Diagnostic[] {
  const template = index.templates.templates.find((entry) => entry.path === templatePath);

  if (template === undefined) {
    return [];
  }

  const diagnostics: Diagnostic[] = [];
  const routeNames = new Set(index.routes.map((route) => route.name));
  const tagNames = new Set([
    ...index.components.map((component) => component.tagName),
    ...index.webTypes.tags.map((tag) => tag.name),
    'vr',
  ]);

  for (const route of template.routeRefs) {
    if (routeNames.has(route.name)) {
      continue;
    }

    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      code: 'VREDITOR001',
      source: 'vanrot',
      message: `Unknown route ref route.${route.name}.`,
      range: {
        start: { line: route.span.startLine - 1, character: route.span.startColumn - 1 },
        end: { line: route.span.endLine - 1, character: route.span.endColumn - 1 },
      },
    });
  }

  for (const tag of template.tags) {
    if (isNativeHtmlTag(tag.name) || tagNames.has(tag.name)) {
      continue;
    }

    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      code: 'VREDITOR003',
      source: 'vanrot',
      message: `Missing Web Types metadata for ${tag.name}.`,
      range: {
        start: { line: tag.span.startLine - 1, character: tag.span.startColumn - 1 },
        end: { line: tag.span.endLine - 1, character: tag.span.endColumn - 1 },
      },
    });
  }

  return diagnostics;
}

function isNativeHtmlTag(tagName: string): boolean {
  return ['a', 'article', 'button', 'div', 'form', 'h1', 'h2', 'h3', 'input', 'label', 'li', 'main', 'nav', 'p', 'section', 'span', 'ul'].includes(tagName);
}
```

Modify `runDiagnostics` in `packages/language-server/src/server.ts`:

```ts
      const editorResult = editorTemplateDiagnostics(fsPath, index);
      connection.sendDiagnostics({ uri, diagnostics: [...diagnostics, ...expressionResult, ...editorResult] });
```

- [ ] **Step 7: Run diagnostics and code action tests**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/diagnostics-compile.test.ts packages/language-server/tests/diagnostics-handler.test.ts packages/language-server/tests/code-actions.test.ts packages/language-server/tests/lsp-handshake.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add packages/language-server/src/features/code-actions.ts packages/language-server/src/features/diagnostics.ts packages/language-server/src/server.ts packages/language-server/tests/code-actions.test.ts packages/language-server/tests/diagnostics-compile.test.ts packages/language-server/tests/diagnostics-handler.test.ts packages/language-server/tests/lsp-handshake.test.ts
git commit -m "feat(language-server): add editor diagnostics and code actions"
```

Expected: commit succeeds with only diagnostics and code-action files staged from this task.

### Task 8: JetBrains Thin Plugin Packaging

**Files:**
- Modify: `editors/intellij/build.gradle.kts`
- Modify: `editors/intellij/src/main/resources/META-INF/plugin.xml`
- Modify: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotBundledServer.kt`
- Modify: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotLspServerDescriptor.kt`
- Modify: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFiles.kt`
- Modify: `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFilesTest.kt`
- Create: `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotBundledServerTest.kt`
- Create: `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotLspServerDescriptorTest.kt`

- [ ] **Step 1: Add bundled server tests**

Create `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotBundledServerTest.kt`:

```kotlin
package com.vankode.vanrot.intellij

import org.junit.Assert.assertTrue
import org.junit.Test

class VanrotBundledServerTest {
  @Test
  fun bundledServerPathPointsAtServerScript() {
    val path = VanrotBundledServer.serverScript().toString()

    assertTrue(path.endsWith("server/bin/server.js") || path.endsWith("server\\bin\\server.js"))
  }
}
```

- [ ] **Step 2: Add descriptor test**

Create `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotLspServerDescriptorTest.kt`:

```kotlin
package com.vankode.vanrot.intellij

import org.junit.Assert.assertTrue
import org.junit.Test

class VanrotLspServerDescriptorTest {
  @Test
  fun templateSupportCoversVanrotRoleTemplates() {
    assertTrue(VanrotTemplateFiles.isTemplate("home.page.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("profile.dialog.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("filters.widget.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("signup.form.html"))
  }
}
```

- [ ] **Step 3: Extend template file tests**

Add to `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFilesTest.kt`:

```kotlin
  @Test
  fun rejectsNonVanrotTemplates() {
    assertFalse(VanrotTemplateFiles.isTemplate("index.html"))
    assertFalse(VanrotTemplateFiles.isTemplate("readme.md"))
  }
```

- [ ] **Step 4: Run JetBrains tests and confirm failure if role globs are missing**

Run:

```bash
cd editors/intellij && ./gradlew test
```

Expected: FAIL if `.dialog.html`, `.widget.html`, or `.form.html` are not supported; PASS if current generated globs already cover them.

- [ ] **Step 5: Keep Kotlin support thin**

Modify `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFiles.kt` to mirror generated language-server globs:

```kotlin
private val templateFilePattern =
  Regex(""".*\.(component|page|layout|dialog|widget|form|button)\.html$""")

object VanrotTemplateFiles {
  fun isTemplate(name: String): Boolean = templateFilePattern.matches(name)
}
```

Do not add Kotlin-side completion, navigation, diagnostics, or code actions.

- [ ] **Step 6: Update plugin description**

Modify `editors/intellij/src/main/resources/META-INF/plugin.xml` description:

```xml
  <description><![CDATA[
    Vanrot editor tooling for WebStorm and IntelliJ IDEA Ultimate.
    Starts the bundled Vanrot language server, enables template-file support,
    and suppresses the known empty-tag warning for valid self-closing Vanrot tags.
  ]]></description>
```

- [ ] **Step 7: Add plugin ZIP inspection task**

Modify `editors/intellij/build.gradle.kts`:

```kotlin
val verifyVanrotPluginPackage by tasks.registering {
  dependsOn("buildPlugin")

  doLast {
    val pluginArchives = layout.buildDirectory.dir("distributions").get().asFile
      .listFiles { file -> file.extension == "zip" }
      ?.toList()
      ?: emptyList()

    require(pluginArchives.isNotEmpty()) {
      "No JetBrains plugin ZIP found under build/distributions."
    }

    val zip = pluginArchives.maxBy { it.lastModified() }
    val names = zipTree(zip).files.map { it.path.replace('\\', '/') }

    require(names.any { it.endsWith("META-INF/plugin.xml") }) {
      "Plugin ZIP is missing META-INF/plugin.xml."
    }
    require(names.any { it.endsWith("server/bin/server.js") }) {
      "Plugin ZIP is missing the bundled Vanrot language server."
    }
    require(names.any { it.endsWith("server/package.json") }) {
      "Plugin ZIP is missing bundled server package metadata."
    }
  }
}
```

- [ ] **Step 8: Run JetBrains build and package checks**

Run:

```bash
cd editors/intellij && ./gradlew test buildPlugin verifyVanrotPluginPackage
```

Expected: PASS.

- [ ] **Step 9: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add editors/intellij/build.gradle.kts editors/intellij/src/main/resources/META-INF/plugin.xml editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotBundledServer.kt editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotLspServerDescriptor.kt editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFiles.kt editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFilesTest.kt editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotBundledServerTest.kt editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotLspServerDescriptorTest.kt
git commit -m "feat(intellij): verify thin Vanrot plugin packaging"
```

Expected: commit succeeds with only JetBrains files staged from this task.

### Task 9: Web Types Metadata Coverage

**Files:**
- Modify: `web-types.json`
- Modify: `apps/vanrot-site/web-types.json`
- Modify: `packages/ui/web-types.json`
- Modify: `packages/router/web-types.json`
- Modify: `scripts/verify-web-types-coverage.test.mjs`

- [ ] **Step 1: Add failing coverage assertions**

Modify `scripts/verify-web-types-coverage.test.mjs` by adding required editor tooling symbols:

```js
const requiredEditorToolingTags = [
  'vr',
  'vr-button',
  'docs-page',
  'docs-section',
  'docs-code-block',
];

const requiredEditorToolingAttributes = [
  'route.home',
  'route.docs',
  'behavior.tooltip',
];

for (const tagName of requiredEditorToolingTags) {
  expect(allWebTypesTags).toContain(tagName);
}

for (const attributeName of requiredEditorToolingAttributes) {
  expect(allWebTypesAttributes).toContain(attributeName);
}
```

Use the existing arrays or helper names in the verifier. If the file currently uses different names, create `allWebTypesTags` and `allWebTypesAttributes` from parsed Web Types contributions in that test.

- [ ] **Step 2: Run Web Types coverage and confirm failure**

Run:

```bash
pnpm exec vitest run scripts/verify-web-types-coverage.test.mjs
```

Expected: FAIL for any missing required tag or attribute.

- [ ] **Step 3: Update root Web Types**

Modify `web-types.json` to include root recognition for route shorthand:

```json
{
  "name": "vanrot-root",
  "contributions": {
    "html": {
      "tags": [
        {
          "name": "vr",
          "description": "Vanrot route object shorthand element."
        }
      ],
      "attributes": [
        {
          "name": "route.home",
          "description": "Named route reference for the home route."
        },
        {
          "name": "route.docs",
          "description": "Named route reference for the docs route."
        }
      ]
    }
  }
}
```

Keep existing Web Types fields and merge these entries rather than replacing unrelated metadata.

- [ ] **Step 4: Update docs-site Web Types**

Modify `apps/vanrot-site/web-types.json` with docs shared components:

```json
{
  "name": "vanrot-site",
  "contributions": {
    "html": {
      "tags": [
        {
          "name": "docs-page",
          "description": "Shared Vanrot docs page shell."
        },
        {
          "name": "docs-section",
          "description": "Shared Vanrot docs article section."
        },
        {
          "name": "docs-code-block",
          "description": "Shared Vanrot docs code block."
        }
      ]
    }
  }
}
```

Keep existing entries and merge these tags.

- [ ] **Step 5: Update UI and router Web Types**

Modify `packages/ui/web-types.json` to include `vr-button` if absent:

```json
{
  "name": "vr-button",
  "description": "Vanrot UI button primitive."
}
```

Modify `packages/router/web-types.json` to include `behavior.tooltip` and route shorthand metadata if absent:

```json
{
  "name": "behavior.tooltip",
  "description": "No-value Vanrot behavior attribute for tooltip behavior."
}
```

Merge entries into the existing Web Types shape.

- [ ] **Step 6: Run Web Types coverage**

Run:

```bash
pnpm exec vitest run scripts/verify-web-types-coverage.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Run language-server Web Types tests**

Run:

```bash
pnpm --filter @vanrot/language-server exec vitest run packages/language-server/tests/web-types.test.ts packages/language-server/tests/completion.test.ts packages/language-server/tests/definition.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add web-types.json apps/vanrot-site/web-types.json packages/ui/web-types.json packages/router/web-types.json scripts/verify-web-types-coverage.test.mjs
git commit -m "feat(editor-tooling): align web types metadata"
```

Expected: commit succeeds with only Web Types metadata files staged from this task.

### Task 10: Editor Tooling Docs IA

**Files:**
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/editor-tooling.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/editor-tooling.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/editor-tooling.page.css`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/web-types/web-types.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/web-types/web-types.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/web-types/web-types.page.css`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/navigation/navigation.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/navigation/navigation.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/navigation/navigation.page.css`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.css`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.css`
- Modify: `apps/vanrot-site/src/docs/docs-page-tree.ts`
- Modify: `apps/vanrot-site/tests/docs-page-tree.test.ts`

- [ ] **Step 1: Add failing docs tree assertions**

Modify `apps/vanrot-site/tests/docs-page-tree.test.ts`:

```ts
const requiredEditorToolingPaths = [
  '/docs/editor-tooling',
  '/docs/editor-tooling/web-types',
  '/docs/editor-tooling/navigation',
  '/docs/editor-tooling/diagnostics',
  '/docs/editor-tooling/jetbrains',
] as const;
```

Add these paths to the required real docs path assertion:

```ts
expect(paths).toEqual(expect.arrayContaining([...requiredRealDocsPaths, ...requiredEditorToolingPaths]));
```

Add:

```ts
it('models editor tooling as real parent and child pages', () => {
  const pages = flattenDocsPageTree(docsPageTree);
  const parent = pages.find((page) => page.path === '/docs/editor-tooling');
  const childPaths = parent?.children.map((child) => child.path);

  expect(parent).toMatchObject({
    key: 'editor-tooling',
    label: 'Editor Tooling',
    section: docsPageSection.framework,
  });
  expect(parent?.componentName).toBe('EditorToolingPage');
  expect(childPaths).toEqual([
    '/docs/editor-tooling/web-types',
    '/docs/editor-tooling/navigation',
    '/docs/editor-tooling/diagnostics',
    '/docs/editor-tooling/jetbrains',
  ]);

  for (const path of requiredEditorToolingPaths) {
    const page = pages.find((item) => item.path === path);
    expect(page?.sourceFiles.ts).toMatch(/editor-tooling/);
    expect(page?.sourceFiles.html).toMatch(/editor-tooling/);
    expect(page?.sourceFiles.css).toMatch(/editor-tooling/);
  }
});
```

- [ ] **Step 2: Run docs tree test and confirm failure**

Run:

```bash
pnpm exec vitest run apps/vanrot-site/tests/docs-page-tree.test.ts
```

Expected: FAIL because editor tooling routes are not registered.

- [ ] **Step 3: Create parent page component**

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/editor-tooling.page.ts`:

```ts
import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const editorToolingArticle = {
  key: 'editor-tooling',
  section: 'framework',
  path: '/docs/editor-tooling',
  label: 'Editor Tooling',
  title: 'Editor Tooling',
  summary: 'Vanrot editor tooling gives JetBrains IDEs route, component, template, Web Types, diagnostics, code action, and package metadata support through the language server.',
  status: 'available-now',
  sections: [
    {
      id: 'release-boundary',
      title: 'Release boundary',
      body: 'Phase 31 ships editor tooling as one release. Web Types, project intelligence, navigation, diagnostics, code actions, and JetBrains packaging are workstreams inside the same editor tooling surface.',
      points: [
        'The language server owns editor behavior.',
        'The JetBrains plugin stays a thin bridge.',
        'Web Types remain the first line of IDE recognition.',
      ],
    },
    {
      id: 'child-guides',
      title: 'Child guides',
      body: 'Use the child pages for the concrete editor tooling contracts.',
      points: [
        'Web Types explains recognition metadata.',
        'Navigation explains definitions, references, and rename.',
        'Diagnostics explains valid syntax, warnings, and code actions.',
        'JetBrains explains plugin packaging and smoke checks.',
      ],
    },
  ],
  childLinks: [
    { label: 'Web Types', href: '/docs/editor-tooling/web-types' },
    { label: 'Navigation', href: '/docs/editor-tooling/navigation' },
    { label: 'Diagnostics', href: '/docs/editor-tooling/diagnostics' },
    { label: 'JetBrains', href: '/docs/editor-tooling/jetbrains' },
  ] satisfies DocsSectionLink[],
};

export class EditorToolingPage {
  article = editorToolingArticle;
}
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/editor-tooling.page.html`:

```html
<docs-article [article]="article" />
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/editor-tooling.page.css`:

```css
@import '../../../shared/docs.css';
```

- [ ] **Step 4: Create Web Types child page**

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/web-types/web-types.page.ts`:

```ts
export const editorToolingWebTypesArticle = {
  key: 'editor-tooling-web-types',
  section: 'framework',
  path: '/docs/editor-tooling/web-types',
  label: 'Web Types',
  title: 'Editor Web Types',
  summary: 'Web Types metadata teaches IntelliJ and WebStorm which Vanrot tags and attributes are valid before language-server behavior runs.',
  status: 'available-now',
  sections: [
    {
      id: 'sources',
      title: 'Sources',
      body: 'Vanrot reads root, docs-site, UI, and router Web Types files into one editor metadata summary.',
      points: [
        'web-types.json owns root project recognition.',
        'apps/vanrot-site/web-types.json owns docs-site shared tags.',
        'packages/ui/web-types.json owns UI primitive tags.',
        'packages/router/web-types.json owns route shorthand metadata.',
      ],
    },
  ],
};

export class EditorToolingWebTypesPage {
  article = editorToolingWebTypesArticle;
}
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/web-types/web-types.page.html`:

```html
<docs-article [article]="article" />
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/web-types/web-types.page.css`:

```css
@import '../../../../shared/docs.css';
```

- [ ] **Step 5: Create Navigation child page**

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/navigation/navigation.page.ts`:

```ts
export const editorToolingNavigationArticle = {
  key: 'editor-tooling-navigation',
  section: 'framework',
  path: '/docs/editor-tooling/navigation',
  label: 'Navigation',
  title: 'Editor Navigation',
  summary: 'Vanrot navigation covers definitions, references, and rename for route refs, component tags, docs tags, and Web Types-backed UI tags.',
  status: 'available-now',
  sections: [
    {
      id: 'language-server-owned',
      title: 'Language server owned',
      body: 'The language server resolves symbols from project indexes and workspace templates. JetBrains starts the server but does not duplicate navigation logic in Kotlin.',
      points: [
        'route.name definitions point to the route table.',
        'component tags point to component role files.',
        'route rename edits route refs in indexed templates.',
      ],
    },
  ],
};

export class EditorToolingNavigationPage {
  article = editorToolingNavigationArticle;
}
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/navigation/navigation.page.html`:

```html
<docs-article [article]="article" />
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/navigation/navigation.page.css`:

```css
@import '../../../../shared/docs.css';
```

- [ ] **Step 6: Create Diagnostics child page**

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.ts`:

```ts
export const editorToolingDiagnosticsArticle = {
  key: 'editor-tooling-diagnostics',
  section: 'framework',
  path: '/docs/editor-tooling/diagnostics',
  label: 'Diagnostics',
  title: 'Editor Diagnostics',
  summary: 'Vanrot editor diagnostics flag unknown route refs, unknown metadata, and stale intelligence without treating valid bracket bindings or docs bindings as bugs.',
  status: 'available-now',
  sections: [
    {
      id: 'non-issues',
      title: 'Known non-issues',
      body: 'Valid Vanrot syntax must stay quiet in editors.',
      points: [
        'Bracket bindings such as [article] are valid.',
        'Dotted no-value attributes such as behavior.tooltip are valid.',
        'Docs shared tags declared in Web Types are valid.',
      ],
    },
  ],
};

export class EditorToolingDiagnosticsPage {
  article = editorToolingDiagnosticsArticle;
}
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.html`:

```html
<docs-article [article]="article" />
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.css`:

```css
@import '../../../../shared/docs.css';
```

- [ ] **Step 7: Create JetBrains child page**

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.ts`:

```ts
export const editorToolingJetBrainsArticle = {
  key: 'editor-tooling-jetbrains',
  section: 'framework',
  path: '/docs/editor-tooling/jetbrains',
  label: 'JetBrains',
  title: 'JetBrains Plugin',
  summary: 'The JetBrains plugin packages the Vanrot language server and keeps editor behavior in TypeScript.',
  status: 'available-now',
  sections: [
    {
      id: 'thin-plugin',
      title: 'Thin plugin',
      body: 'The plugin locates Node, starts the bundled language server, passes the project root, registers Vanrot template files, and suppresses only the known empty-tag warning.',
      points: [
        'No completion logic belongs in Kotlin.',
        'No navigation logic belongs in Kotlin.',
        'No diagnostics or code-action logic belongs in Kotlin.',
      ],
    },
  ],
};

export class EditorToolingJetBrainsPage {
  article = editorToolingJetBrainsArticle;
}
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.html`:

```html
<docs-article [article]="article" />
```

Create `apps/vanrot-site/src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.css`:

```css
@import '../../../../shared/docs.css';
```

- [ ] **Step 8: Register docs page tree imports and nodes**

Modify `apps/vanrot-site/src/docs/docs-page-tree.ts` imports:

```ts
import { EditorToolingPage as editorToolingPageComponent, editorToolingArticle } from '../pages/docs/framework/editor-tooling/editor-tooling.page.ts';
import { EditorToolingWebTypesPage as editorToolingWebTypesPageComponent, editorToolingWebTypesArticle } from '../pages/docs/framework/editor-tooling/web-types/web-types.page.ts';
import { EditorToolingNavigationPage as editorToolingNavigationPageComponent, editorToolingNavigationArticle } from '../pages/docs/framework/editor-tooling/navigation/navigation.page.ts';
import { EditorToolingDiagnosticsPage as editorToolingDiagnosticsPageComponent, editorToolingDiagnosticsArticle } from '../pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.ts';
import { EditorToolingJetBrainsPage as editorToolingJetBrainsPageComponent, editorToolingJetBrainsArticle } from '../pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.ts';
```

Add under the framework docs page section:

```ts
docsPage({
  article: editorToolingArticle,
  component: editorToolingPageComponent,
  children: [
    docsPage({ article: editorToolingWebTypesArticle, component: editorToolingWebTypesPageComponent }),
    docsPage({ article: editorToolingNavigationArticle, component: editorToolingNavigationPageComponent }),
    docsPage({ article: editorToolingDiagnosticsArticle, component: editorToolingDiagnosticsPageComponent }),
    docsPage({ article: editorToolingJetBrainsArticle, component: editorToolingJetBrainsPageComponent }),
  ],
}),
```

Use the existing helper shape in `docs-page-tree.ts`; if the helper parameter names differ, preserve the exact local call style and keep the same article/component/children values.

- [ ] **Step 9: Run docs verification**

Run:

```bash
pnpm exec vitest run apps/vanrot-site/tests/docs-page-tree.test.ts
pnpm verify:site-docs
pnpm verify:ai-docs
```

Expected: PASS.

- [ ] **Step 10: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add apps/vanrot-site/src/pages/docs/framework/editor-tooling apps/vanrot-site/src/docs/docs-page-tree.ts apps/vanrot-site/tests/docs-page-tree.test.ts
git commit -m "docs(site): add editor tooling docs pages"
```

Expected: commit succeeds with only editor tooling docs files staged from this task.

### Task 11: Release Verification And Tracker Closeout

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/future-pipeline.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify when requirements changed: `docs/superpowers/specs/Phase-31.md`
- Modify while executing: `docs/superpowers/plans/Phase-31.md`

- [ ] **Step 1: Mark plan tasks complete as they pass**

Modify this file by replacing each completed task checkbox from:

```md
- [ ] **Step N:
```

to:

```md
- [x] **Step N:
```

Only mark a step after the command or file edit in that step is complete.

- [ ] **Step 2: Update feature maturity**

Modify `docs/superpowers/feature-maturity.md` Phase 31 row to production-ready after all Phase 31 gates pass:

```md
| ✅ | Phase 31 | Editor tooling release | Production-Ready | One-shot JetBrains editor tooling release with Web Types, language-server intelligence, navigation, diagnostics, code actions, docs IA, and plugin packaging verified. |
```

Keep existing table columns if the current file has a different column order.

- [ ] **Step 3: Update future pipeline**

Modify the `Editor Tooling` section in `docs/superpowers/future-pipeline.md`:

```md
## Editor Tooling

Status: shipped in Phase 31.

Phase 31 delivered the one-shot editor tooling release: richer Web Types, project intelligence export, template navigation, rename-safe route refs, diagnostics, code actions, completion and inline docs, docs IA, and JetBrains packaging smoke checks.
```

Preserve older notes only if they are still useful as release history.

- [ ] **Step 4: Update final TDD inventory**

Add rows to `docs/superpowers/final-tdd-inventory.md`:

```md
| Phase 31 | Editor Web Types metadata | `scripts/verify-web-types-coverage.test.mjs`; `packages/language-server/tests/web-types.test.ts` | Ensures root, docs-site, UI, and router Web Types stay visible to IntelliJ/WebStorm and the language server. |
| Phase 31 | Editor intelligence export | `packages/language-server/tests/editor-intelligence.test.ts`; `packages/language-server/tests/export-intelligence.test.ts` | Locks `.vanrot/editor-intelligence.json` schema version 1 and export behavior. |
| Phase 31 | Template navigation and route rename | `packages/language-server/tests/definition.test.ts`; `packages/language-server/tests/references.test.ts`; `packages/language-server/tests/server.test.ts` | Proves route refs, component tags, Web Types tags, indexed references, and route rename work. |
| Phase 31 | Editor diagnostics and code actions | `packages/language-server/tests/diagnostics-compile.test.ts`; `packages/language-server/tests/diagnostics-handler.test.ts`; `packages/language-server/tests/code-actions.test.ts` | Proves valid syntax stays quiet and deterministic quick fixes exist. |
| Phase 31 | Editor docs IA | `apps/vanrot-site/tests/docs-page-tree.test.ts`; `pnpm verify:site-docs`; `pnpm verify:ai-docs` | Proves editor tooling parent and child docs are real routes and AI docs include them. |
| Phase 31 | JetBrains packaging | `cd editors/intellij && ./gradlew test buildPlugin verifyVanrotPluginPackage` | Proves the plugin remains thin and bundles server files, plugin XML, and template globs. |
```

Keep existing inventory table columns if the current file has a different column order.

- [ ] **Step 5: Run full Phase 31 verification**

Run:

```bash
pnpm --filter @vanrot/language-server test
pnpm --filter @vanrot/language-server typecheck
pnpm --filter @vanrot/language-server build:intellij
pnpm exec vitest run scripts/verify-web-types-coverage.test.mjs
pnpm exec vitest run scripts/verify-component-cascade.test.mjs
pnpm exec vitest run apps/vanrot-site/tests/docs-page-tree.test.ts
pnpm verify:site-docs
pnpm verify:ai-docs
cd editors/intellij && ./gradlew test buildPlugin verifyVanrotPluginPackage
cd ../..
pnpm verify
```

Expected: every command PASS.

- [ ] **Step 6: Inspect built plugin ZIP**

Run:

```bash
python - <<'PY'
from pathlib import Path
from zipfile import ZipFile

dist = Path("editors/intellij/build/distributions")
zip_path = max(dist.glob("*.zip"), key=lambda path: path.stat().st_mtime)
names = ZipFile(zip_path).namelist()
required = [
    "META-INF/plugin.xml",
    "server/bin/server.js",
    "server/package.json",
]
missing = [item for item in required if not any(name.endswith(item) for name in names)]
if missing:
    raise SystemExit(f"Missing from plugin ZIP: {missing}")
print(zip_path)
print("plugin.xml ok")
print("server/bin/server.js ok")
print("server/package.json ok")
PY
```

Expected: output prints the plugin ZIP path and all three `ok` lines.

- [ ] **Step 7: Restart the docs site server**

Run:

```bash
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected: Vite starts on `http://127.0.0.1:1964`.

- [ ] **Step 8: Verify editor tooling docs route responds**

Run in a separate terminal while the dev server is running:

```bash
curl -sS -I http://127.0.0.1:1964/docs/editor-tooling | head -n 1
```

Expected:

```text
HTTP/1.1 200 OK
```

- [ ] **Step 9: Commit checkpoint**

Run only if the user explicitly approved commits:

```bash
git add docs/superpowers/feature-maturity.md docs/superpowers/future-pipeline.md docs/superpowers/final-tdd-inventory.md docs/superpowers/specs/Phase-31.md docs/superpowers/plans/Phase-31.md
git commit -m "docs: close phase 31 editor tooling"
```

Expected: commit succeeds with tracker and requirement docs staged from this task.

---

## Final Verification Checklist

- [ ] `pnpm --filter @vanrot/language-server test`
- [ ] `pnpm --filter @vanrot/language-server typecheck`
- [ ] `pnpm --filter @vanrot/language-server build:intellij`
- [ ] `pnpm exec vitest run scripts/verify-web-types-coverage.test.mjs`
- [ ] `pnpm exec vitest run scripts/verify-component-cascade.test.mjs`
- [ ] `pnpm exec vitest run apps/vanrot-site/tests/docs-page-tree.test.ts`
- [ ] `pnpm verify:site-docs`
- [ ] `pnpm verify:ai-docs`
- [ ] `cd editors/intellij && ./gradlew test buildPlugin verifyVanrotPluginPackage`
- [ ] Plugin ZIP contains `META-INF/plugin.xml`, `server/bin/server.js`, and `server/package.json`.
- [ ] `pnpm verify`
- [ ] Docs site restarted on port `1964`.
- [ ] `http://127.0.0.1:1964/docs/editor-tooling` responds `200`.

## Self-Review

### Spec Coverage

- One-shot release: covered by the release boundary and all tasks inside one Phase 31 plan.
- Rich Web Types: covered by Tasks 2 and 9.
- Project intelligence export: covered by Tasks 3 and 4.
- Template navigation: covered by Tasks 3 and 6.
- Rename-safe route refs: covered by Task 6.
- Diagnostics and code actions: covered by Task 7.
- Completion and inline docs: covered by Task 5.
- JetBrains thin plugin and packaging smoke checks: covered by Task 8 and final ZIP inspection.
- Docs IA with real parent and child routes: covered by Task 10.
- Tracker closeout and `pnpm verify`: covered by Task 11.

### Placeholder Scan

No placeholder markers remain in executable task steps. Each task lists concrete files, commands, and expected outcomes.

### Type Consistency

- `WorkspaceIndex.webTypes` uses `VanrotWebTypesSummary`.
- `WorkspaceIndex.templates` uses `TemplateIndex`.
- `buildEditorIntelligence(index: WorkspaceIndex)` consumes the same `WorkspaceIndex` shape introduced in Tasks 2 and 3.
- `findReferences(symbol, documents, templates)` accepts the `TemplateIndex` created in Task 3 and passed from `server.ts` in Task 6.
- `buildCodeActions` uses route names and Web Types source paths from the same workspace index fields.
