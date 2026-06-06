# Phase 30 Docs Page Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not use subagents in this repository; `AGENTS.md` requires inline execution with review checkpoints.

**Goal:** Move Vanrot docs authoring from centralized docs data into real `.page.ts`, `.page.html`, and `.page.css` components while preserving the current UI design.

**Architecture:** Build a typed docs page tree that owns route metadata, navigation structure, and page component references. Generate the initial page component files once from the current `site-data.json`, then make page components the human-owned source while AI/search exports and compatibility registries derive from the tree and page files. Shared docs components and one shared docs stylesheet preserve the current article, code block, note, list, changelog, reference, and matrix class system.

**Tech Stack:** TypeScript, Vanrot runtime/compiler/router, Vanrot slots, Vitest, Node migration scripts, Vite-powered `@vanrot/vanrot-site`, `pnpm verify:site-docs`, AI docs build tooling.

---

## Source Spec

- `docs/superpowers/specs/Phase-30.md`

## Scope Check

The spec is one coherent subsystem: docs authoring architecture for `apps/vanrot-site`. It touches shared docs UI, docs page components, route/navigation metadata, generated AI/search output, and verification. These pieces are coupled because each docs route must have a real page file, a route, a sidebar entry, generated documentation export coverage, and visual parity.

This plan keeps the work in one phase but slices it into independently testable modules:

- **30A Red Tests And Inventory:** prove the current JSON-first architecture violates the new contract.
- **30B Shared Docs Component Kit:** extract reusable article, section, code, note, points, and changelog pieces.
- **30C Page Migration Script:** generate the initial real page triplets from current article data.
- **30D Page Tree, Routes, And Navigation:** make routes and sidebar derive from the page tree.
- **30E Data Export And Drift Checks:** keep AI/search/reference outputs without using JSON as the authoring source.
- **30F Hooks And Skills:** update durable project rules, local hooks, and local docs skills for the new authoring model.
- **30G Visual Parity And Closeout:** verify no UI design change and update phase trackers.

## Acceptance Criteria

- Every human-authored docs route has a real `.page.ts`, `.page.html`, and `.page.css` file.
- Framework parent routes and child routes are both real pages.
- Changelog is a real page component under `apps/vanrot-site/src/pages/docs/changelog/`.
- Current docs UI classes and visual layout remain unchanged.
- Common docs CSS lives in `apps/vanrot-site/src/pages/docs/shared/docs.css`.
- Page CSS files contain only page-specific exceptions.
- Route and navigation metadata derive from `apps/vanrot-site/src/docs/docs-page-tree.ts`.
- `site-data.json` is no longer the hand-authored source for narrative guide content.
- AI/search/docs export coverage still includes public docs pages.
- `pnpm --filter @vanrot/vanrot-site test` passes.
- `pnpm verify:site-docs` passes.
- `pnpm verify` passes.
- Local docs server is restarted and relevant routes respond on `http://localhost:1964`.

## Non-Goals

- Do not redesign docs UI.
- Do not change public docs URLs unless an existing URL is objectively wrong.
- Do not move docs behavior into `@vanrot/runtime`.
- Do not replace the Vanrot site with another docs engine.
- Do not remove AI/search/reference outputs.
- Do not use subagents, git worktrees, `git add`, commits, or pushes unless the user explicitly asks.

## Planned File Structure

### New Shared Docs UI

- Create: `apps/vanrot-site/src/pages/docs/shared/docs.css`
  - Common docs class system moved out of page-local CSS.
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-content.ts`
  - Shared docs UI types for section links and points.
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-code-tokenizer.ts`
  - Tokenizes code examples for line-number rendering.
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-article-shell.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-article-shell.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-article-shell.component.css`
  - Preserves `docs-article-layout`, `docs-article`, `docs-summary`, `docs-section-grid`, and bookmarks.
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-section.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-section.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-section.component.css`
  - Preserves `docs-section`.
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-code-block.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-code-block.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-code-block.component.css`
  - Preserves `code-snippet`, `docs-code-title`, `code-block`, `code-line`, `code-line-number`, and `code-line-content`.
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-note.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-note.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-note.component.css`
  - Preserves `docs-note`.
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-points-list.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-points-list.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-points-list.component.css`
  - Renders repeated docs bullet lists.

### New Docs Page Tree And Export Helpers

- Create: `apps/vanrot-site/src/docs/docs-page-tree.ts`
  - Source of truth for docs page keys, labels, paths, sections, components, parent/child tree, and local page file paths.
- Create: `apps/vanrot-site/src/docs/docs-page-export.ts`
  - Reads the page tree and page files to produce compatibility/export article records for AI/search/site-doc checks.
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
  - Derive navigation groups from `docs-page-tree.ts`.
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
  - Keep framework reference, primitive, command, package, and diagnostic exports; make narrative article exports come from `docs-page-export.ts`.
- Modify: `apps/vanrot-site/src/routes.ts`
  - Replace `articlePage(siteArticleKey...)` route declarations with tree-derived docs routes.

### New Migration Script

- Create: `scripts/migrate-docs-to-page-components.mjs`
  - One-time migration tool that reads `apps/vanrot-site/src/docs/site-data.json`, writes page triplets, and writes an initial `docs-page-tree.ts`.

### New And Modified Tests

- Create: `apps/vanrot-site/tests/docs-page-tree.test.ts`
  - Verifies real parent and child routes, changelog page placement, uniqueness, and tree/navigation parity.
- Create: `apps/vanrot-site/tests/docs-page-files.test.ts`
  - Verifies each page tree entry has `.page.ts`, `.page.html`, `.page.css`, no inline TS templates, shared CSS class ownership, and minimal page CSS.
- Modify: `AGENTS.md`
  - Adds the durable docs page component authoring protocol.
- Modify: `.git/hooks/pre-commit`
  - Runs the site-docs guard when staged docs-site authoring files change.
- Modify: `/Users/user/.codex/skills/vanrot-doc-component/SKILL.md`
  - Keeps Vanrot component docs skill aligned with the Phase 30 page component convention.
- Modify: `/Users/user/.codex/skills/framework-documentation/SKILL.md`
  - Replaces JSON-first docs guidance with page-tree and page-component authoring guidance.
- Modify: `apps/vanrot-site/tests/site-data.test.ts`
  - Keep existing article coverage but assert narrative docs are exported from page components.
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
  - Assert converted docs routes render with current article shell classes and no renderer fallback.
- Modify: `apps/vanrot-site/tests/changelog-page.test.ts`
  - Point to `src/pages/docs/changelog/changelog.page.html` and assert `changelog-entry` component usage.
- Modify: `scripts/verify-site-docs.mjs`
  - Check docs-page-tree coverage, generated export coverage, and shared docs CSS class ownership.
- Modify: `scripts/verify-site-docs.test.mjs`
  - Add helper coverage for the new checks.

### New Page Component Triplets

The migration script creates page triplets under:

- `apps/vanrot-site/src/pages/docs/get-started/**`
- `apps/vanrot-site/src/pages/docs/framework/**`
- `apps/vanrot-site/src/pages/docs/ui/**`
- `apps/vanrot-site/src/pages/docs/examples/**`
- `apps/vanrot-site/src/pages/docs/reference/**`
- `apps/vanrot-site/src/pages/docs/changelog/**`

The current route list that must migrate is:

```text
introduction=/docs
installation=/docs/installation
projectStructure=/docs/project-structure
runtime=/docs/runtime
runtimeSignals=/docs/runtime/signals
runtimeInputs=/docs/runtime/inputs
runtimeForms=/docs/runtime/forms
runtimeControllers=/docs/runtime/controllers
runtimeDevtoolsGraph=/docs/runtime/devtools-graph
runtimeLifecycle=/docs/runtime/lifecycle
runtimeMounting=/docs/runtime/mounting
behavior=/docs/behavior
behaviorForm=/docs/behavior/form
behaviorOverlay=/docs/behavior/overlay
behaviorTooltip=/docs/behavior/tooltip
behaviorTabs=/docs/behavior/tabs
behaviorTable=/docs/behavior/table
behaviorToast=/docs/behavior/toast
behaviorCommandMenu=/docs/behavior/command-menu
behaviorPositionedLayer=/docs/behavior/positioned-layer
seo=/docs/seo
seoPackageBoundary=/docs/seo/package-boundary
seoMetadataLadder=/docs/seo/metadata-ladder
seoConfigControlPlane=/docs/seo/config-control-plane
seoCreateAndAddFlows=/docs/seo/create-and-add-flows
seoDoctorAndBuildOutput=/docs/seo/doctor-and-build-output
seoSocialImages=/docs/seo/social-images
compiler=/docs/compiler
compilerFileConventions=/docs/compiler/file-conventions
compilerComponentClass=/docs/compiler/component-class
compilerTemplateSyntax=/docs/compiler/template-syntax
compilerExpressions=/docs/compiler/expressions
compilerEventBinding=/docs/compiler/event-binding
compilerScopedCss=/docs/compiler/scoped-css
compilerChildComponents=/docs/compiler/child-components
compilerSlots=/docs/compiler/slots
compilerFor=/docs/compiler/for
compilerIfElse=/docs/compiler/if-else
compilerInputs=/docs/compiler/inputs
compilerSourceMaps=/docs/compiler/source-maps
compilerCompilationApi=/docs/compiler/compilation-api
vitePlugin=/docs/vite-plugin
vitePluginSetup=/docs/vite-plugin/setup
vitePluginOptions=/docs/vite-plugin/options
vitePluginTransform=/docs/vite-plugin/role-file-transform
vitePluginHotReload=/docs/vite-plugin/hot-reload
vitePluginVirtualModules=/docs/vite-plugin/virtual-modules
vitePluginDiagnostics=/docs/vite-plugin/diagnostics
vitePluginSourceMaps=/docs/vite-plugin/source-maps
vitePluginDevtoolsMetadata=/docs/vite-plugin/devtools-metadata
cli=/docs/cli
cliCommandSurface=/docs/cli/commands
cliProjectCreation=/docs/cli/project-creation
cliRoleGeneration=/docs/cli/role-generation
cliUiPrimitiveAdd=/docs/cli/ui-primitives
cliConfigMaintenance=/docs/cli/config-maintenance
cliProjectIntelligence=/docs/cli/project-intelligence
cliTaskRunners=/docs/cli/task-runners
cliDevServer=/docs/cli/dev
cliBuild=/docs/cli/build
cliTest=/docs/cli/test
configuration=/docs/configuration
configurationFile=/docs/configuration/file
configurationDefaults=/docs/configuration/defaults
configurationUi=/docs/configuration/ui
configurationRouter=/docs/configuration/router
configurationAi=/docs/configuration/ai
configurationMaintenance=/docs/configuration/maintenance
routing=/docs/routing
routingRouteTable=/docs/routing/route-table
routingParamsQuery=/docs/routing/params-query
routingLayoutsRedirects=/docs/routing/layouts-redirects
routingGuards=/docs/routing/guards
routingNavigation=/docs/routing/navigation
routingPreloadingKeepAlive=/docs/routing/preloading-keep-alive
ssrHydration=/docs/ssr-hydration
ssrPackageBoundary=/docs/ssr-hydration/package-boundary
ssrRenderDocument=/docs/ssr-hydration/render-document
ssrHydrationContract=/docs/ssr-hydration/hydration-contract
ssrStateSerialization=/docs/ssr-hydration/state-serialization
ssrRouter=/docs/ssr-hydration/router-ssr
ssrDeferredStreaming=/docs/ssr-hydration/deferred-streaming
uiOctober=/docs/ui
theming=/docs/theming
vanrotstyles=/docs/vanrotstyles
testing=/docs/testing
testingComponent=/docs/testing/component-tests
testingScreen=/docs/testing/screen
testingRouting=/docs/testing/routing
testingStrategy=/docs/testing/strategy
forms=/docs/forms
formsBoundary=/docs/forms/package-boundary
formsFieldRefs=/docs/forms/field-refs
formsValidationLifecycle=/docs/forms/validation-lifecycle
formsAsyncResources=/docs/forms/async-resources
formsArraysWizardsErrors=/docs/forms/arrays-wizards-server-errors
formsDraftPersistence=/docs/forms/draft-persistence
formsToolingTests=/docs/forms/tooling-tests
store=/docs/store
storeActions=/docs/store/actions
storeSelectors=/docs/store/selectors
storeReducers=/docs/store/reducers
storeEffects=/docs/store/effects
storePageUsage=/docs/store/page-usage
storeInspection=/docs/store/inspection
storeReplay=/docs/store/replay
formatters=/docs/formatters
formattersCompilerOwned=/docs/formatters/compiler-owned-formatting
formattersTemplatePipes=/docs/formatters/template-pipes
formattersBuiltInSuite=/docs/formatters/built-in-suite
formattersBuiltInArguments=/docs/formatters/built-in-arguments
formattersPipeRoleFiles=/docs/formatters/pipe-role-files
formattersNamedPresets=/docs/formatters/named-presets
formattersEnumPipes=/docs/formatters/enum-pipes
formattersContext=/docs/formatters/context
formattersCompilerDiagnostics=/docs/formatters/compiler-diagnostics
formattersViteTooling=/docs/formatters/vite-tooling
formattersTesting=/docs/formatters/testing
devtools=/docs/devtools
devtoolsProjectMap=/docs/devtools/project-map
devtoolsRuntimeGraph=/docs/devtools/runtime-graph
devtoolsViteMetadata=/docs/devtools/vite-metadata
devtoolsPanelState=/docs/devtools/panel-state
devtoolsStaleState=/docs/devtools/stale-state
examples=/docs/examples
exampleMatrix=/docs/example-matrix
webglThreejs=/docs/examples/webgl-threejs
deployment=/docs/deployment
publicApi=/docs/public-api
diagnostics=/docs/diagnostics
generatedFiles=/docs/generated-files
changelog=/docs/changelog
octoberShowcase=/docs/examples/october-showcase
conventions=/docs/conventions
conventionsRoleFiles=/docs/conventions/role-files
conventionsTemplatesStyles=/docs/conventions/templates-and-styles
conventionsStateLogic=/docs/conventions/state-and-logic
conventionsRoutingStrings=/docs/conventions/routing-and-strings
conventionsScopedCss=/docs/conventions/scoped-css
conventionsAiReadable=/docs/conventions/ai-readable-projects
limitations=/docs/limitations
referenceStatus=/docs/status
```

## Task 1: Add Docs Page Tree And Page File Red Tests

**Files:**

- Create: `apps/vanrot-site/tests/docs-page-tree.test.ts`
- Create: `apps/vanrot-site/tests/docs-page-files.test.ts`

- [x] **Step 1: Write the docs page tree failing test**

Create `apps/vanrot-site/tests/docs-page-tree.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  docsPageSection,
  docsPageTree,
  flattenDocsPageTree,
} from '../src/docs/docs-page-tree.ts';
import { siteNavigationGroups } from '../src/docs/site-navigation.ts';
import { route } from '../src/routes.ts';

const requiredRealDocsPaths = [
  '/docs',
  '/docs/runtime',
  '/docs/runtime/signals',
  '/docs/compiler',
  '/docs/compiler/inputs',
  '/docs/cli',
  '/docs/cli/project-intelligence',
  '/docs/forms',
  '/docs/forms/arrays-wizards-server-errors',
  '/docs/formatters',
  '/docs/formatters/enum-pipes',
  '/docs/changelog',
] as const;

describe('docs page tree', () => {
  it('models docs as real parent and child pages', () => {
    const pages = flattenDocsPageTree(docsPageTree);
    const paths = pages.map((page) => page.path);

    expect(paths).toEqual(expect.arrayContaining([...requiredRealDocsPaths]));
    expect(new Set(paths).size).toBe(paths.length);

    const runtime = pages.find((page) => page.path === '/docs/runtime');
    const runtimeSignals = pages.find((page) => page.path === '/docs/runtime/signals');

    expect(runtime?.children.map((child) => child.path)).toContain('/docs/runtime/signals');
    expect(runtimeSignals?.children).toEqual([]);
    expect(runtime?.component.name).toBe('DocsRuntimePage');
    expect(runtimeSignals?.component.name).toBe('DocsRuntimeSignalsPage');
  });

  it('keeps changelog as a real docs page component', () => {
    const pages = flattenDocsPageTree(docsPageTree);
    const changelog = pages.find((page) => page.path === '/docs/changelog');

    expect(changelog).toMatchObject({
      key: 'changelog',
      label: 'Changelog',
      path: '/docs/changelog',
      section: docsPageSection.reference,
    });
    expect(changelog?.component.name).toBe('ChangelogPage');
    expect(changelog?.sourceFiles.html).toBe(
      'src/pages/docs/changelog/changelog.page.html',
    );
  });

  it('derives framework navigation from the same page tree', () => {
    const frameworkPages = flattenDocsPageTree(docsPageTree)
      .filter((page) => page.section === docsPageSection.framework)
      .map((page) => page.path);
    const frameworkNavigation = siteNavigationGroups.find(
      (group) => group.section === docsPageSection.framework,
    );
    const navigationPaths = frameworkNavigation?.items.flatMap((item) => [
      item.href,
      ...item.children.map((child) => child.href),
    ]);

    expect(navigationPaths).toEqual(expect.arrayContaining(frameworkPages));
  });

  it('registers each docs page path in routes', () => {
    for (const path of requiredRealDocsPaths) {
      const routeForPath = Object.values(route).find((routeRef) => routeRef.path === path);

      expect(routeForPath?.path).toBe(path);
      expect(routeForPath?.page.name).not.toBe('DocsArticlePage');
    }
  });
});
```

- [x] **Step 2: Write the docs page file failing test**

Create `apps/vanrot-site/tests/docs-page-files.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docsPageTree, flattenDocsPageTree } from '../src/docs/docs-page-tree.ts';

const appRoot = process.cwd();

const sharedDocsClasses = [
  'docs-article-layout',
  'docs-article',
  'docs-summary',
  'docs-section-grid',
  'docs-section',
  'code-snippet',
  'docs-code-title',
  'code-block',
  'code-line',
  'code-line-number',
  'code-line-content',
  'docs-note',
  'docs-article-bookmarks',
] as const;

function readSiteFile(path: string): string {
  return readFileSync(join(appRoot, path), 'utf8');
}

describe('docs page component files', () => {
  it('gives every docs page a page ts, html, and css file', () => {
    for (const page of flattenDocsPageTree(docsPageTree)) {
      expect(existsSync(join(appRoot, page.sourceFiles.ts))).toBe(true);
      expect(existsSync(join(appRoot, page.sourceFiles.html))).toBe(true);
      expect(existsSync(join(appRoot, page.sourceFiles.css))).toBe(true);
    }
  });

  it('keeps UI markup out of docs page TypeScript files', () => {
    for (const page of flattenDocsPageTree(docsPageTree)) {
      const source = readSiteFile(page.sourceFiles.ts);

      expect(source).not.toContain('template:');
      expect(source).not.toContain('<article');
      expect(source).not.toContain('<section');
      expect(source).not.toContain('innerHTML');
    }
  });

  it('owns common docs classes in the shared docs stylesheet', () => {
    const sharedCss = readSiteFile('src/pages/docs/shared/docs.css');

    for (const className of sharedDocsClasses) {
      expect(sharedCss).toContain(`.${className}`);
    }
  });

  it('keeps common docs classes out of page-specific css files', () => {
    const commonClassSelectors = sharedDocsClasses.map((className) => `.${className}`);

    for (const page of flattenDocsPageTree(docsPageTree)) {
      const css = readSiteFile(page.sourceFiles.css);

      for (const selector of commonClassSelectors) {
        expect(css).not.toContain(selector);
      }
    }
  });
});
```

- [x] **Step 3: Run tests to verify they fail**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- docs-page-tree.test.ts docs-page-files.test.ts
```

Expected:

```text
FAIL apps/vanrot-site/tests/docs-page-tree.test.ts
Cannot find module '../src/docs/docs-page-tree.ts'

FAIL apps/vanrot-site/tests/docs-page-files.test.ts
Cannot find module '../src/docs/docs-page-tree.ts'
```

- [x] **Step 4: Review checkpoint**

Confirm the tests fail only because the page tree and real page files do not exist yet. Do not stage or commit.

## Task 2: Build Shared Docs Component Kit

**Files:**

- Create: `apps/vanrot-site/src/pages/docs/shared/docs.css`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-content.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-code-tokenizer.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-article-shell.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-article-shell.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-article-shell.component.css`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-section.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-section.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-section.component.css`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-code-block.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-code-block.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-code-block.component.css`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-note.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-note.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-note.component.css`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-points-list.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-points-list.component.html`
- Create: `apps/vanrot-site/src/pages/docs/shared/docs-points-list.component.css`
- Modify: `apps/vanrot-site/src/styles/site.css`

- [x] **Step 1: Add shared docs content types**

Create `apps/vanrot-site/src/pages/docs/shared/docs-content.ts`:

```ts
export interface DocsSectionLink {
  id: string;
  title: string;
}

export interface DocsCodeLine {
  number: number;
  tokens: readonly DocsCodeToken[];
}

export interface DocsCodeToken {
  id: string;
  kind: DocsCodeTokenKind;
  text: string;
}

export type DocsCodeTokenKind =
  | 'comment'
  | 'function'
  | 'keyword'
  | 'number'
  | 'operator'
  | 'property'
  | 'punctuation'
  | 'string'
  | 'text';
```

- [x] **Step 2: Move code tokenization into a shared helper**

Create `apps/vanrot-site/src/pages/docs/shared/docs-code-tokenizer.ts`:

```ts
import type { DocsCodeLine, DocsCodeToken, DocsCodeTokenKind } from './docs-content.ts';

const codeKeywords = new Set([
  'as',
  'const',
  'else',
  'export',
  'false',
  'from',
  'function',
  'if',
  'import',
  'interface',
  'let',
  'new',
  'readonly',
  'return',
  'true',
  'type',
]);

const punctuationCharacters = new Set(['(', ')', '{', '}', '[', ']', ',', ';']);
const operatorCharacters = new Set(['=', '+', '-', '*', '/', '%', '<', '>', '!', '&', '|', '?', ':', '.']);
const pairedOperators = new Set(['=>', '===', '!==', '>=', '<=', '&&', '||', '??', '+=', '-=', '*=', '/=']);

export function tokenizeDocsCode(code: string): readonly DocsCodeLine[] {
  return code.split('\n').map((line, index) => ({
    number: index + 1,
    tokens: tokenizeLine(line, index + 1),
  }));
}

function tokenizeLine(line: string, lineNumber: number): readonly DocsCodeToken[] {
  const tokens: DocsCodeToken[] = [];
  let cursor = 0;

  while (cursor < line.length) {
    const rest = line.slice(cursor);
    const match = matchNextToken(rest);

    tokens.push({
      id: `${lineNumber}-${cursor}-${tokens.length}`,
      kind: match.kind,
      text: match.text,
    });
    cursor += match.text.length;
  }

  if (tokens.length === 0) {
    return [{ id: `${lineNumber}-empty`, kind: 'text', text: '' }];
  }

  return tokens;
}

function matchNextToken(input: string): { kind: DocsCodeTokenKind; text: string } {
  if (input.startsWith('//')) {
    return { kind: 'comment', text: input };
  }

  if (input[0] === '"' || input[0] === "'") {
    return matchString(input);
  }

  const pairedOperator = [...pairedOperators].find((operator) => input.startsWith(operator));

  if (pairedOperator !== undefined) {
    return { kind: 'operator', text: pairedOperator };
  }

  const first = input[0];

  if (punctuationCharacters.has(first)) {
    return { kind: 'punctuation', text: first };
  }

  if (operatorCharacters.has(first)) {
    return { kind: 'operator', text: first };
  }

  const word = input.match(/^[A-Za-z_$][A-Za-z0-9_$]*/)?.[0];

  if (word !== undefined) {
    if (codeKeywords.has(word)) {
      return { kind: 'keyword', text: word };
    }

    if (input.slice(word.length).startsWith('(')) {
      return { kind: 'function', text: word };
    }

    return { kind: 'property', text: word };
  }

  const number = input.match(/^\d+(?:\.\d+)?/)?.[0];

  if (number !== undefined) {
    return { kind: 'number', text: number };
  }

  const whitespace = input.match(/^\s+/)?.[0];

  if (whitespace !== undefined) {
    return { kind: 'text', text: whitespace };
  }

  return { kind: 'text', text: first };
}

function matchString(input: string): { kind: DocsCodeTokenKind; text: string } {
  const quote = input[0];
  let cursor = 1;

  while (cursor < input.length) {
    if (input[cursor] === quote && input[cursor - 1] !== '\\') {
      return { kind: 'string', text: input.slice(0, cursor + 1) };
    }

    cursor += 1;
  }

  return { kind: 'string', text: input };
}
```

- [x] **Step 3: Add shared docs stylesheet**

Create `apps/vanrot-site/src/pages/docs/shared/docs.css` by moving the common rules from `apps/vanrot-site/src/pages/docs/docs-article.page.css` into the shared file. Preserve the declarations for these selectors:

```css
.docs-article-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 13rem;
  gap: 2rem;
  align-items: start;
}

.docs-article {
  min-width: 0;
}

.docs-article h1,
.docs-article h2,
.docs-article p,
.docs-article ul,
.docs-article pre {
  margin: 0;
}

.docs-article h1 {
  max-width: 48rem;
  font-size: clamp(2.2rem, 4vw, 4.6rem);
  line-height: 0.95;
}

.docs-summary {
  max-width: 46rem;
  margin-top: 1rem;
  color: var(--muted);
  font-size: 1.05rem;
}

.docs-section-grid {
  display: grid;
  gap: 1.25rem;
  margin-top: 2rem;
}

.docs-section {
  display: grid;
  gap: 0.85rem;
  padding-block: 1.2rem;
  border-top: 1px solid var(--line);
}

.docs-section h2 {
  font-size: 1.15rem;
}

.docs-section p,
.docs-section li {
  color: var(--muted);
  line-height: 1.7;
}

.docs-section ul {
  display: grid;
  gap: 0.55rem;
  padding-left: 1.1rem;
}

.code-snippet {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
}

.docs-code-title {
  display: block;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.78rem;
  text-transform: uppercase;
}

.code-block {
  overflow-x: auto;
  padding: 0.9rem 0;
  color: var(--foreground);
  font-family: var(--mono);
  font-size: 0.84rem;
}

.code-line {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  min-height: 1.45rem;
}

.code-line-number {
  color: var(--muted);
  text-align: right;
  user-select: none;
}

.code-line-content {
  padding-inline: 0.9rem;
  white-space: pre;
}

.docs-note {
  padding: 0.85rem 1rem;
  border-left: 2px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}

.docs-article-bookmarks {
  position: sticky;
  top: 1rem;
  display: grid;
  gap: 0.65rem;
  padding-left: 1rem;
  border-left: 1px solid var(--line);
}

.docs-article-bookmarks-title {
  color: var(--muted);
  font-size: 0.72rem;
  text-transform: uppercase;
}

.docs-article-bookmarks nav {
  display: grid;
  gap: 0.55rem;
}

.docs-article-bookmarks a {
  color: var(--muted);
  font-size: 0.84rem;
  text-decoration: none;
}

.docs-article-bookmarks a:hover {
  color: var(--foreground);
}
```

- [x] **Step 4: Import shared docs stylesheet globally**

Modify `apps/vanrot-site/src/styles/site.css`:

```css
@import '../pages/docs/shared/docs.css';
```

Place the import near the other site-level imports so docs classes are available to every docs page.

- [x] **Step 5: Add article shell component**

Create `apps/vanrot-site/src/pages/docs/shared/docs-article-shell.component.ts`:

```ts
import type { DocsSectionLink } from './docs-content.ts';

export class DocsArticleShellComponent {
  title = '';
  summary = '';
  sectionLinks: readonly DocsSectionLink[] = [];
}
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-article-shell.component.html`:

```html
<div class="docs-article-layout">
  <article class="docs-article">
    <h1>{{ title }}</h1>
    <p class="docs-summary">{{ summary }}</p>

    <vr-separator orientation.horizontal></vr-separator>

    <div class="docs-section-grid">
      <slot></slot>
    </div>
  </article>

  <aside class="docs-article-bookmarks" aria-label="Page sections">
    <span class="docs-article-bookmarks-title">On this page</span>
    <nav>
      @for (section of sectionLinks; track section.id) {
        <a data-vr-docs-article-bookmark [href]="'#' + section.id">{{ section.title }}</a>
      }
    </nav>
  </aside>
</div>
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-article-shell.component.css`:

```css
/* Common docs shell styles live in docs.css. */
```

- [x] **Step 6: Add section, note, points list, and code block components**

Create `apps/vanrot-site/src/pages/docs/shared/docs-section.component.ts`:

```ts
export class DocsSectionComponent {
  sectionId = '';
  title = '';
}
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-section.component.html`:

```html
<section class="docs-section" [id]="sectionId">
  <h2>{{ title }}</h2>
  <slot></slot>
</section>
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-section.component.css`:

```css
/* Common docs section styles live in docs.css. */
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-note.component.ts`:

```ts
export class DocsNoteComponent {}
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-note.component.html`:

```html
<p class="docs-note"><slot></slot></p>
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-note.component.css`:

```css
/* Common docs note styles live in docs.css. */
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-points-list.component.ts`:

```ts
export class DocsPointsListComponent {
  points: readonly string[] = [];
}
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-points-list.component.html`:

```html
<ul [hidden]="points.length === 0">
  @for (point of points; track point) {
    <li>{{ point }}</li>
  }
</ul>
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-points-list.component.css`:

```css
/* Common docs points-list styles live in docs.css. */
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-code-block.component.ts`:

```ts
import { tokenizeDocsCode } from './docs-code-tokenizer.ts';
import type { DocsCodeLine } from './docs-content.ts';

export class DocsCodeBlockComponent {
  title = '';
  code = '';

  codeLines(): readonly DocsCodeLine[] {
    return tokenizeDocsCode(this.code);
  }

  isEmpty(): boolean {
    return this.code.trim().length === 0;
  }
}
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-code-block.component.html`:

```html
<div class="code-snippet" [hidden]="isEmpty()">
  <span class="docs-code-title">{{ title }}</span>
  <pre class="code-block"><code>@for (line of codeLines(); track line.number) {
<span class="code-line"><span class="code-line-number">{{ line.number }}</span><span class="code-line-content">@for (token of line.tokens; track token.id) {
<span class="token keyword" [hidden]="token.kind !== 'keyword'">{{ token.text }}</span><span class="token function" [hidden]="token.kind !== 'function'">{{ token.text }}</span><span class="token string" [hidden]="token.kind !== 'string'">{{ token.text }}</span><span class="token comment" [hidden]="token.kind !== 'comment'">{{ token.text }}</span><span class="token number" [hidden]="token.kind !== 'number'">{{ token.text }}</span><span class="token operator" [hidden]="token.kind !== 'operator'">{{ token.text }}</span><span class="token property" [hidden]="token.kind !== 'property'">{{ token.text }}</span><span class="token punctuation" [hidden]="token.kind !== 'punctuation'">{{ token.text }}</span><span class="token text" [hidden]="token.kind !== 'text'">{{ token.text }}</span>
}</span></span>
}</code></pre>
</div>
```

Create `apps/vanrot-site/src/pages/docs/shared/docs-code-block.component.css`:

```css
/* Common docs code-block styles live in docs.css. */
```

- [x] **Step 7: Run shared-component verification**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- docs-page-files.test.ts
```

Expected:

```text
FAIL apps/vanrot-site/tests/docs-page-files.test.ts
Cannot find module '../src/docs/docs-page-tree.ts'
```

This is correct. The shared CSS assertions should no longer be the failing reason once the tree exists.

- [x] **Step 8: Review checkpoint**

Inspect `apps/vanrot-site/src/pages/docs/shared/docs.css` and confirm it preserves the current class names. Do not stage or commit.

## Task 3: Add One-Time Docs Page Migration Script

**Files:**

- Create: `scripts/migrate-docs-to-page-components.mjs`
- Generate: `apps/vanrot-site/src/pages/docs/get-started/**`
- Generate: `apps/vanrot-site/src/pages/docs/framework/**`
- Generate: `apps/vanrot-site/src/pages/docs/ui/**`
- Generate: `apps/vanrot-site/src/pages/docs/examples/**`
- Generate: `apps/vanrot-site/src/pages/docs/reference/**`
- Generate: `apps/vanrot-site/src/pages/docs/changelog/**`
- Create: `apps/vanrot-site/src/docs/docs-page-tree.ts`

- [x] **Step 1: Write the migration script**

Create `scripts/migrate-docs-to-page-components.mjs`:

```js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, '..');
const siteRoot = join(projectRoot, 'apps/vanrot-site');
const siteDataPath = join(siteRoot, 'src/docs/site-data.json');
const docsPagesRoot = join(siteRoot, 'src/pages/docs');
const pageTreePath = join(siteRoot, 'src/docs/docs-page-tree.ts');
const siteData = JSON.parse(readFileSync(siteDataPath, 'utf8'));
const articles = siteData.articles ?? [];

const sectionFolderByKey = {
  getStarted: 'get-started',
  framework: 'framework',
  ui: 'ui',
  components: 'components',
  examples: 'examples',
  reference: 'reference',
};

const parentKeyByPath = new Map(
  articles.map((article) => [article.path, article.key]),
);

const pageEntries = articles.map(toPageEntry);
const pageEntriesByParent = groupByParent(pageEntries);

for (const entry of pageEntries) {
  writePageFiles(entry);
}

writePageTree(pageEntries, pageEntriesByParent);

function toPageEntry(article) {
  const pathSegments = article.path === '/docs'
    ? ['introduction']
    : article.path.replace(/^\/docs\/?/, '').split('/').filter(Boolean);
  const sectionFolder = sectionFolderByKey[article.section] ?? 'reference';
  const fileBase = pathSegments[pathSegments.length - 1] ?? 'introduction';
  const parentPath = parentDocsPath(article.path);
  const parentKey = parentPath === undefined ? undefined : parentKeyByPath.get(parentPath);
  const pageFolder = article.key === 'changelog'
    ? 'changelog'
    : [sectionFolder, ...pathSegments].join('/');
  const className = article.key === 'changelog'
    ? 'ChangelogPage'
    : `Docs${pascalCase(article.key)}Page`;
  const routeKey = `docs${pascalCase(article.key)}`;
  const relativeFolder = `src/pages/docs/${pageFolder}`;

  return {
    key: article.key,
    section: article.section,
    parentKey,
    routeKey,
    label: article.label,
    title: article.title,
    summary: article.summary,
    status: article.status,
    path: article.path,
    className,
    folder: join(docsPagesRoot, pageFolder),
    relativeFolder,
    tsPath: `${relativeFolder}/${fileBase}.page.ts`,
    htmlPath: `${relativeFolder}/${fileBase}.page.html`,
    cssPath: `${relativeFolder}/${fileBase}.page.css`,
    fileBase,
    sections: article.sections ?? [],
  };
}

function parentDocsPath(path) {
  if (path === '/docs') {
    return undefined;
  }

  const segments = path.split('/').filter(Boolean);

  if (segments.length <= 2) {
    return undefined;
  }

  return `/${segments.slice(0, -1).join('/')}`;
}

function groupByParent(entries) {
  const groups = new Map();

  for (const entry of entries) {
    if (entry.parentKey === undefined) {
      continue;
    }

    const siblings = groups.get(entry.parentKey) ?? [];
    siblings.push(entry);
    groups.set(entry.parentKey, siblings);
  }

  return groups;
}

function writePageFiles(entry) {
  mkdirSync(entry.folder, { recursive: true });
  writeFileSync(join(siteRoot, entry.tsPath), pageTs(entry));
  writeFileSync(join(siteRoot, entry.htmlPath), pageHtml(entry));
  writeFileSync(join(siteRoot, entry.cssPath), '/* Page-specific docs styles only. */\n');
}

function pageTs(entry) {
  const sharedContentImport = relativeTypeScriptImport(entry.relativeFolder, 'src/pages/docs/shared/docs-content.ts');
  const points = entry.sections
    .filter((section) => Array.isArray(section.points) && section.points.length > 0)
    .map((section) => `  ${propertyName(section.id)}Points = ${JSON.stringify(section.points, null, 2).replace(/\n/g, '\n  ')} as const;`)
    .join('\n');
  const codes = entry.sections
    .filter((section) => section.code?.code !== undefined)
    .map((section) => `  ${propertyName(section.id)}Code = ${JSON.stringify(section.code.code)};`)
    .join('\n');
  const links = entry.sections.map((section) => ({ id: section.id, title: section.title }));

  return `import type { DocsSectionLink } from '${sharedContentImport}';

const sectionLinks = ${JSON.stringify(links, null, 2)} as const satisfies readonly DocsSectionLink[];

export class ${entry.className} {
  title(): string {
    return ${JSON.stringify(entry.title)};
  }

  summary(): string {
    return ${JSON.stringify(entry.summary)};
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }
${points.length > 0 ? `\n${points}\n` : ''}${codes.length > 0 ? `\n${codes}\n` : ''}}
`;
}

function pageHtml(entry) {
  const sections = entry.sections.map(sectionHtml).join('\n\n');

  return `<docs-article-shell [title]="title()" [summary]="summary()" [sectionLinks]="sectionLinks()">
${sections}
</docs-article-shell>
`;
}

function relativeTypeScriptImport(fromFolder, toFile) {
  const fromAbsolute = join(siteRoot, fromFolder);
  const toAbsolute = join(siteRoot, toFile);
  const relativePath = relative(fromAbsolute, toAbsolute).replace(/\\/g, '/');

  if (relativePath.startsWith('../')) {
    return relativePath;
  }

  return `./${relativePath}`;
}

function sectionHtml(section) {
  const pointsName = propertyName(section.id);
  const codeName = propertyName(section.id);
  const body = escapeHtml(section.body);
  const points = Array.isArray(section.points) && section.points.length > 0
    ? `\n  <docs-points-list [points]="${pointsName}Points"></docs-points-list>`
    : '';
  const code = section.code?.code !== undefined
    ? `\n  <docs-code-block title="${escapeAttribute(section.code.title)}" [code]="${codeName}Code"></docs-code-block>`
    : '';
  const note = section.note !== undefined && section.note.length > 0
    ? `\n  <docs-note>${escapeHtml(section.note)}</docs-note>`
    : '';

  return `  <docs-section sectionId="${escapeAttribute(section.id)}" title="${escapeAttribute(section.title)}">
    <p>${body}</p>${points}${code}${note}
  </docs-section>`;
}

function writePageTree(entries, childrenByParent) {
  const importLines = entries
    .map((entry) => `import { ${entry.className} } from '../${entry.tsPath.replace(/^src\//, '').replace(/\.ts$/, '.ts')}';`)
    .join('\n');
  const rootEntries = entries.filter((entry) => entry.parentKey === undefined);
  const body = `${importLines}

export const docsPageSection = {
  getStarted: 'getStarted',
  framework: 'framework',
  ui: 'ui',
  components: 'components',
  examples: 'examples',
  reference: 'reference',
} as const;

export type DocsPageSection = (typeof docsPageSection)[keyof typeof docsPageSection];

export interface DocsPageTreeItem {
  key: string;
  routeKey: string;
  section: DocsPageSection;
  path: string;
  label: string;
  title: string;
  summary: string;
  status: string;
  component: new () => object;
  sourceFiles: {
    ts: string;
    html: string;
    css: string;
  };
  children: readonly DocsPageTreeItem[];
}

export const docsPageTree = [
${rootEntries.map((entry) => treeEntry(entry, childrenByParent, 1)).join(',\n')}
] as const satisfies readonly DocsPageTreeItem[];

export function flattenDocsPageTree(items: readonly DocsPageTreeItem[] = docsPageTree): readonly DocsPageTreeItem[] {
  return items.flatMap((item) => [item, ...flattenDocsPageTree(item.children)]);
}
`;

  writeFileSync(pageTreePath, body);
}

function treeEntry(entry, childrenByParent, indentLevel) {
  const indent = '  '.repeat(indentLevel);
  const children = childrenByParent.get(entry.key) ?? [];

  return `${indent}{
${indent}  key: ${JSON.stringify(entry.key)},
${indent}  routeKey: ${JSON.stringify(entry.routeKey)},
${indent}  section: docsPageSection.${entry.section},
${indent}  path: ${JSON.stringify(entry.path)},
${indent}  label: ${JSON.stringify(entry.label)},
${indent}  title: ${JSON.stringify(entry.title)},
${indent}  summary: ${JSON.stringify(entry.summary)},
${indent}  status: ${JSON.stringify(entry.status)},
${indent}  component: ${entry.className},
${indent}  sourceFiles: {
${indent}    ts: ${JSON.stringify(entry.tsPath)},
${indent}    html: ${JSON.stringify(entry.htmlPath)},
${indent}    css: ${JSON.stringify(entry.cssPath)},
${indent}  },
${indent}  children: [
${children.map((child) => treeEntry(child, childrenByParent, indentLevel + 2)).join(',\n')}
${indent}  ],
${indent}}`;
}

function propertyName(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase()).replace(/[^A-Za-z0-9_$]/g, '');
}

function pascalCase(value) {
  return value
    .replace(/(^|[-_\s])([a-zA-Z0-9])/g, (_, _separator, char) => char.toUpperCase())
    .replace(/[^A-Za-z0-9]/g, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
```

- [x] **Step 2: Run the migration script**

Run:

```sh
node scripts/migrate-docs-to-page-components.mjs
```

Expected:

```text
```

The command should print no output and create page component folders plus `apps/vanrot-site/src/docs/docs-page-tree.ts`.

- [x] **Step 3: Fix import paths emitted by the script if typecheck exposes a relative-path issue**

Run:

```sh
pnpm --filter @vanrot/vanrot-site typecheck
```

Expected before route/nav refactor:

```text
FAIL
```

Acceptable failures are missing custom-element registration or unused old article renderer references. Import path syntax errors are not acceptable; fix the migration script and rerun it before continuing.

- [x] **Step 4: Run page file tests**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- docs-page-files.test.ts
```

Expected:

```text
PASS apps/vanrot-site/tests/docs-page-files.test.ts
```

- [x] **Step 5: Review checkpoint**

Inspect at least these generated files:

```text
apps/vanrot-site/src/pages/docs/get-started/introduction/introduction.page.html
apps/vanrot-site/src/pages/docs/framework/runtime/runtime.page.html
apps/vanrot-site/src/pages/docs/framework/runtime/signals/signals.page.html
apps/vanrot-site/src/pages/docs/changelog/changelog.page.html
apps/vanrot-site/src/docs/docs-page-tree.ts
```

Confirm they use real page files and current docs classes through shared components. Do not stage or commit.

## Task 4: Derive Routes And Navigation From Docs Page Tree

**Files:**

- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Modify: `apps/vanrot-site/tests/docs-page-tree.test.ts`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [x] **Step 1: Replace old article imports in routes**

Modify `apps/vanrot-site/src/routes.ts` imports:

```ts
import { docsPageTree, flattenDocsPageTree, type DocsPageTreeItem } from './docs/docs-page-tree.ts';
```

Remove these imports:

```ts
import { DocsArticlePage } from './pages/docs/docs-article.page.ts';
import { DocsChangelogPage } from './pages/docs/docs-changelog.page.ts';
import {
  getSiteArticle,
  siteArticleKey,
  type SiteArticleKey,
} from './docs/site-data.ts';
```

Keep imports for special non-article pages that still exist, such as `DocsExampleMatrixPage`, `DocsReferencePage`, `OctoberShowcasePage`, `HomePage`, and component pages.

- [x] **Step 2: Add tree route helper**

Add this helper near the existing route helpers in `apps/vanrot-site/src/routes.ts`:

```ts
function docsTreePage(page: DocsPageTreeItem) {
  return docs.page({
    path: docsChildPath(page.path),
    label: page.label,
    ...siteDocument(page.title, page.summary),
    page: page.component,
    breadcrumb: routes.breadcrumb.parent(docs),
  });
}
```

- [x] **Step 3: Replace `articlePage(siteArticleKey...)` constants with generated tree constants**

Replace the old `const docsRuntime = articlePage(siteArticleKey.runtime);` block with:

```ts
const docsPageRouteEntries = Object.fromEntries(
  flattenDocsPageTree(docsPageTree).map((page) => [page.routeKey, docsTreePage(page)]),
) as Record<string, ReturnType<typeof docsTreePage>>;
```

Then spread the entries into `defineRoutes`:

```ts
export const route = defineRoutes({
  home,
  components,
  docs,
  changelog,
  componentButtons,
  componentCards,
  ...docsPageRouteEntries,
  reference,
  uiButton,
  uiCard,
  uiBadge,
  uiAvatar,
  uiAlert,
  uiLoader,
  uiSkeleton,
  uiSeparator,
  uiLayout,
  uiContainer,
  uiSection,
  uiGrid,
  uiHeader,
  uiFooter,
  uiSidebar,
  uiNav,
  uiBreadcrumb,
  uiImg,
  uiSrc,
});
```

If `defineRoutes` rejects spread objects, keep the existing explicit route object and generate explicit `docs...` constants from `docsPageTree` in `docs-page-tree.ts` instead. The accepted output must still make routes derive from the page tree.

- [ ] **Step 4: Keep root changelog route using the new changelog page**

The existing `/changelog` and `/changelog/:packageSlug` routes may remain outside the docs layout. Point them at the new changelog component from the page tree:

```ts
const changelogPage = flattenDocsPageTree(docsPageTree).find((page) => page.key === 'changelog');

if (changelogPage === undefined) {
  throw new Error('Vanrot site requires the changelog docs page.');
}

const changelog = routes.page({
  path: routePath.changelog,
  label: changelogPage.label,
  ...siteDocument(changelogPage.title, changelogPage.summary),
  page: changelogPage.component,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const changelogPackage = routes.page({
  path: routePath.changelogPackage,
  label: changelogPage.label,
  ...siteDocument(changelogPage.title, changelogPage.summary),
  page: changelogPage.component,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.parent(changelog),
});
```

- [ ] **Step 5: Rewrite navigation from the page tree**

Modify `apps/vanrot-site/src/docs/site-navigation.ts` so framework/get-started/reference docs come from `docsPageTree`:

```ts
import {
  docsPageSection,
  docsPageTree,
  type DocsPageSection,
  type DocsPageTreeItem,
} from './docs-page-tree.ts';
import { componentDocs, type ComponentDoc } from './component-docs.ts';

export interface SiteNavigationItem {
  key: string;
  href: string;
  label: string;
  children: readonly SiteNavigationItem[];
}

export interface SiteNavigationGroup {
  section: DocsPageSection;
  label: string;
  items: readonly SiteNavigationItem[];
}

export const siteNavigationSectionLabel = {
  getStarted: 'Get Started',
  framework: 'Framework',
  ui: 'UI',
  components: 'Components',
  examples: 'Examples',
  reference: 'Reference',
} as const satisfies Record<DocsPageSection, string>;

function docsNavItem(page: DocsPageTreeItem): SiteNavigationItem {
  return {
    key: page.key,
    href: page.path,
    label: page.label,
    children: page.children.map(docsNavItem),
  };
}

function componentNavItem(doc: ComponentDoc): SiteNavigationItem {
  return {
    key: doc.primitive,
    href: doc.href,
    label: doc.title,
    children: [],
  };
}

function docsGroup(section: DocsPageSection): SiteNavigationGroup {
  const items = docsPageTree.filter((page) => page.section === section).map(docsNavItem);

  return {
    section,
    label: siteNavigationSectionLabel[section],
    items,
  };
}

export const siteNavigationGroups: readonly SiteNavigationGroup[] = [
  docsGroup(docsPageSection.getStarted),
  docsGroup(docsPageSection.framework),
  docsGroup(docsPageSection.ui),
  {
    section: docsPageSection.components,
    label: siteNavigationSectionLabel.components,
    items: componentDocs.map(componentNavItem),
  },
  docsGroup(docsPageSection.examples),
  docsGroup(docsPageSection.reference),
];

export function flattenNavigationItems(items: readonly SiteNavigationItem[]): readonly SiteNavigationItem[] {
  return items.flatMap((item) => [item, ...flattenNavigationItems(item.children)]);
}
```

- [x] **Step 6: Run route and navigation tests**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- docs-page-tree.test.ts site-data.test.ts site-pages.test.ts
```

Expected:

```text
PASS apps/vanrot-site/tests/docs-page-tree.test.ts
PASS apps/vanrot-site/tests/site-data.test.ts
PASS apps/vanrot-site/tests/site-pages.test.ts
```

- [ ] **Step 7: Review checkpoint**

Confirm `apps/vanrot-site/src/routes.ts` no longer imports `DocsArticlePage` or calls `articlePage(siteArticleKey...)`. Do not stage or commit.

## Task 5: Make Changelog A First-Class Docs Page Component

**Files:**

- Create: `apps/vanrot-site/src/pages/docs/changelog/changelog-entry.component.ts`
- Create: `apps/vanrot-site/src/pages/docs/changelog/changelog-entry.component.html`
- Create: `apps/vanrot-site/src/pages/docs/changelog/changelog-entry.component.css`
- Modify: `apps/vanrot-site/src/pages/docs/changelog/changelog.page.ts`
- Modify: `apps/vanrot-site/src/pages/docs/changelog/changelog.page.html`
- Modify: `apps/vanrot-site/src/pages/docs/changelog/changelog.page.css`
- Modify: `apps/vanrot-site/tests/changelog-page.test.ts`

- [ ] **Step 1: Add changelog entry component**

Create `apps/vanrot-site/src/pages/docs/changelog/changelog-entry.component.ts`:

```ts
import type { ChangelogEntry } from '../../../docs/changelog-data.ts';

export class ChangelogEntryComponent {
  entry: ChangelogEntry | undefined;
  showPackageLabels = true;

  requiredEntry(): ChangelogEntry {
    if (this.entry !== undefined) {
      return this.entry;
    }

    throw new Error('Vanrot changelog entry component requires an entry.');
  }
}
```

Create `apps/vanrot-site/src/pages/docs/changelog/changelog-entry.component.html`:

```html
<article class="docs-changelog-entry" [id]="requiredEntry().anchorId">
  <div class="docs-changelog-entry-heading">
    <h2>{{ requiredEntry().version }}</h2>
    <time>{{ requiredEntry().date }}</time>
  </div>

  <ul class="docs-changelog-list">
    @for (change of requiredEntry().changes; track change.text) {
      <li>
        <span class="docs-changelog-change-copy">{{ change.text }}</span>
        <a class="docs-changelog-link" [href]="change.docsHref">{{ change.docsLabel }}</a>
        <span class="docs-changelog-change-packages" [hidden]="!showPackageLabels">
          {{ change.packagesLabel }}
        </span>
      </li>
    }
  </ul>
</article>
```

Create `apps/vanrot-site/src/pages/docs/changelog/changelog-entry.component.css`:

```css
/* Common changelog entry styles live in ../shared/docs.css. */
```

- [ ] **Step 2: Update changelog page class**

Modify `apps/vanrot-site/src/pages/docs/changelog/changelog.page.ts`:

```ts
import { getCurrentMatch } from '@vanrot/router';
import {
  changelogAllPath,
  createChangelogEntries,
  createChangelogPackageFilters,
  createPackageChangelogEntries,
  packageNameFromChangelogSlug,
  type ChangelogEntry,
  type ChangelogPackageFilter,
} from '../../../docs/changelog-data.ts';
import { getExportedSiteArticle, siteArticleKey, type ExportedSiteArticle } from '../../../docs/docs-page-export.ts';

export class ChangelogPage {
  article(): ExportedSiteArticle {
    return getExportedSiteArticle(siteArticleKey.changelog);
  }

  changelogEntries(): readonly ChangelogEntry[] {
    return createPackageChangelogEntries(this.allChangelogEntries(), this.selectedPackageName());
  }

  allPath(): string {
    return changelogAllPath;
  }

  totalChangeCount(): number {
    return this.allChangelogEntries().reduce((total, entry) => total + entry.changes.length, 0);
  }

  packageFilters(): readonly ChangelogPackageFilter[] {
    return createChangelogPackageFilters(this.allChangelogEntries());
  }

  showPackageLabels(): boolean {
    return this.selectedPackageName() === undefined;
  }

  private allChangelogEntries(): readonly ChangelogEntry[] {
    return createChangelogEntries(this.article());
  }

  private selectedPackageName(): string | undefined {
    return packageNameFromChangelogSlug(getCurrentMatch()?.params.packageSlug);
  }
}
```

- [ ] **Step 3: Update changelog page template**

Modify `apps/vanrot-site/src/pages/docs/changelog/changelog.page.html` so repeated entries use the shared entry component:

```html
<section class="docs-changelog-shell">
  <header class="docs-changelog-header">
    <vr-badge tone.secondary>Changelog</vr-badge>
    <h1>{{ article().title }}</h1>
    <p class="docs-changelog-summary">{{ article().summary }}</p>
  </header>

  <aside class="docs-changelog-sidebar" aria-label="Changelog packages">
    <span class="docs-changelog-sidebar-title">Changelog packages</span>
    <a class="docs-changelog-package-link" [href]="allPath()">All</a>
    @for (filter of packageFilters(); track filter.packageName) {
      <a class="docs-changelog-package-link" [href]="filter.href">
        {{ filter.packageName }} · {{ filter.changeCount }}
      </a>
    }
  </aside>

  <div class="docs-changelog">
    @for (entry of changelogEntries(); track entry.version) {
      <changelog-entry [entry]="entry" [showPackageLabels]="showPackageLabels()"></changelog-entry>
    }
  </div>
</section>
```

- [ ] **Step 4: Update changelog test paths**

Modify `apps/vanrot-site/tests/changelog-page.test.ts`:

```ts
const changelogPageHtml = 'src/pages/docs/changelog/changelog.page.html';
const changelogEntryHtml = 'src/pages/docs/changelog/changelog-entry.component.html';
```

Then update the render assertion:

```ts
it('renders every changelog change with a docs hyperlink', async () => {
  const html = await readFile(join(appRoot, changelogPageHtml), 'utf8');
  const entryHtml = await readFile(join(appRoot, changelogEntryHtml), 'utf8');

  expect(html).toContain('<changelog-entry');
  expect(html).toContain('Changelog packages');
  expect(html).toContain('All');
  expect(html).toContain('[href]="allPath()"');
  expect(html).toContain('[href]="filter.href"');
  expect(html).toContain('@for (filter of packageFilters()');
  expect(entryHtml).toContain('{{ change.text }}');
  expect(entryHtml).toContain('[href]="change.docsHref"');
  expect(entryHtml).toContain('{{ change.docsLabel }}');
  expect(entryHtml).toContain('{{ change.packagesLabel }}');
  expect(entryHtml).not.toContain('<li>{{ change }}</li>');
});
```

- [ ] **Step 5: Run changelog tests**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- changelog-page.test.ts docs-page-tree.test.ts
```

Expected:

```text
PASS apps/vanrot-site/tests/changelog-page.test.ts
PASS apps/vanrot-site/tests/docs-page-tree.test.ts
```

- [ ] **Step 6: Review checkpoint**

Confirm `apps/vanrot-site/src/pages/docs/docs-changelog.page.*` is unused and can be deleted in Task 8. Do not stage or commit.

## Task 6: Export Site Data From Page Components

**Files:**

- Create: `apps/vanrot-site/src/docs/docs-page-export.ts`
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `scripts/verify-site-docs.mjs`
- Modify: `scripts/verify-site-docs.test.mjs`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`

- [ ] **Step 1: Add page export helper**

Create `apps/vanrot-site/src/docs/docs-page-export.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { docsPageTree, flattenDocsPageTree, type DocsPageTreeItem } from './docs-page-tree.ts';

export const siteArticleKey = Object.fromEntries(
  flattenDocsPageTree(docsPageTree).map((page) => [page.key, page.key]),
) as Record<string, string>;

export type SiteArticleKey = keyof typeof siteArticleKey;

export interface ExportedSiteArticleSection {
  id: string;
  title: string;
  body: string;
  points: readonly string[];
  code?: {
    title: string;
    code: string;
  };
  note?: string;
  changes?: readonly string[];
}

export interface ExportedSiteArticle {
  key: string;
  section: string;
  path: string;
  label: string;
  title: string;
  summary: string;
  status: string;
  sections: readonly ExportedSiteArticleSection[];
  sourceFiles: DocsPageTreeItem['sourceFiles'];
}

const appRoot = new URL('..', import.meta.url);

export const exportedSiteArticles = Object.fromEntries(
  flattenDocsPageTree(docsPageTree).map((page) => [page.key, toExportedArticle(page)]),
) as Record<string, ExportedSiteArticle>;

export function getExportedSiteArticle(key: string): ExportedSiteArticle {
  const article = exportedSiteArticles[key];

  if (article !== undefined) {
    return article;
  }

  throw new Error(`Missing docs page export for ${key}.`);
}

function toExportedArticle(page: DocsPageTreeItem): ExportedSiteArticle {
  const html = readSourceFile(page.sourceFiles.html);

  return {
    key: page.key,
    section: page.section,
    path: page.path,
    label: page.label,
    title: page.title,
    summary: page.summary,
    status: page.status,
    sections: extractSections(html),
    sourceFiles: page.sourceFiles,
  };
}

function readSourceFile(path: string): string {
  return readFileSync(join(appRoot.pathname, path), 'utf8');
}

function extractSections(html: string): readonly ExportedSiteArticleSection[] {
  const sections: ExportedSiteArticleSection[] = [];
  const sectionPattern = /<docs-section\\s+sectionId="([^"]+)"\\s+title="([^"]+)"[\\s\\S]*?<\\/docs-section>/g;
  let match: RegExpExecArray | null;

  while ((match = sectionPattern.exec(html)) !== null) {
    const block = match[0];
    const body = block.match(/<p>([\\s\\S]*?)<\\/p>/)?.[1] ?? '';

    sections.push({
      id: decodeHtml(match[1]),
      title: decodeHtml(match[2]),
      body: decodeHtml(stripTags(body)),
      points: [],
      code: extractCode(block),
      note: extractNote(block),
    });
  }

  return sections;
}

function extractCode(block: string): ExportedSiteArticleSection['code'] {
  const match = block.match(/<docs-code-block\\s+title="([^"]+)"/);

  if (match === null) {
    return undefined;
  }

  return { title: decodeHtml(match[1]), code: '' };
}

function extractNote(block: string): string | undefined {
  const match = block.match(/<docs-note>([\\s\\S]*?)<\\/docs-note>/);

  if (match === null) {
    return undefined;
  }

  return decodeHtml(stripTags(match[1]));
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, '').trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}
```

If browser bundling rejects `node:fs` in site code, split this into:

- browser-safe metadata exports in `apps/vanrot-site/src/docs/docs-page-tree.ts`;
- Node-only export reader in `scripts/docs-page-export.mjs`.

The accepted final state must not use `site-data.json` as the human-authored narrative source.

- [x] **Step 2: Update site-data facade**

Modify `apps/vanrot-site/src/docs/site-data.ts`:

```ts
import {
  exportedSiteArticles,
  getExportedSiteArticle,
  siteArticleKey,
  type ExportedSiteArticle as SiteArticle,
  type ExportedSiteArticleSection as SiteArticleSection,
  type SiteArticleKey,
} from './docs-page-export.ts';
import {
  commandReferenceDocs as frameworkCommandReferenceDocs,
  diagnosticReferenceDocs as frameworkDiagnosticReferenceDocs,
  packageReferenceDocs as frameworkPackageReferenceDocs,
  type FrameworkCommandReference,
  type FrameworkDiagnosticReference,
  type FrameworkPackageReference,
} from './framework-reference.ts';

export const siteSectionKey = {
  getStarted: 'getStarted',
  framework: 'framework',
  ui: 'ui',
  components: 'components',
  examples: 'examples',
  reference: 'reference',
} as const;

export type SiteSectionKey = (typeof siteSectionKey)[keyof typeof siteSectionKey];
export { getExportedSiteArticle as getSiteArticle, siteArticleKey };
export type { SiteArticle, SiteArticleKey, SiteArticleSection };

export const siteArticleKeys = Object.values(siteArticleKey);
export const siteArticles = exportedSiteArticles as Record<SiteArticleKey, SiteArticle>;

export interface PrimitiveDocCopy {
  primitive: string;
  title: string;
  summary: string;
  usage: string;
  accessibility: string;
}

export type CommandDoc = FrameworkCommandReference;
export type PackageReferenceDoc = FrameworkPackageReference;
export type DiagnosticReferenceDocs = readonly FrameworkDiagnosticReference[];

export const primitiveDocCopy: PrimitiveDocCopy[] = [];
export const cliCommandDocs = frameworkCommandReferenceDocs;
export const packageReferenceDocs = frameworkPackageReferenceDocs;
export const diagnosticReferenceDocs = frameworkDiagnosticReferenceDocs;
```

If `primitiveDocCopy` still has active consumers, keep its existing data source temporarily and add a follow-up assertion in `site-data.test.ts` to move it after docs page migration finishes.

- [x] **Step 3: Add verify-site-docs checks**

Modify `scripts/verify-site-docs.mjs` with helpers:

```js
export function checkDocsPageTreeCoverage(requiredArticleKeys, docsPageKeys) {
  const available = new Set(docsPageKeys);

  return requiredArticleKeys
    .filter((key) => !available.has(key))
    .map((key) => `Missing docs page tree entry: ${key}`);
}

export function checkDocsPageFileTriplets(pages) {
  const failures = [];

  for (const page of pages) {
    for (const extension of ['ts', 'html', 'css']) {
      if (page.sourceFiles[extension] === undefined) {
        failures.push(`Missing ${extension} source file mapping for docs page: ${page.key}`);
      }
    }
  }

  return failures;
}

export function checkSharedDocsCssOwnership(sharedCss, pageCssSources) {
  const sharedClasses = [
    'docs-article-layout',
    'docs-article',
    'docs-summary',
    'docs-section-grid',
    'docs-section',
    'code-snippet',
    'docs-code-title',
    'code-block',
    'code-line',
    'code-line-number',
    'code-line-content',
    'docs-note',
    'docs-article-bookmarks',
  ];
  const failures = [];

  for (const className of sharedClasses) {
    if (!sharedCss.includes(`.${className}`)) {
      failures.push(`Shared docs CSS is missing .${className}`);
    }
  }

  for (const [filePath, css] of pageCssSources) {
    for (const className of sharedClasses) {
      if (css.includes(`.${className}`)) {
        failures.push(`Page CSS must not own .${className}: ${filePath}`);
      }
    }
  }

  return failures;
}
```

- [x] **Step 4: Add verify-site-docs tests**

Modify `scripts/verify-site-docs.test.mjs`:

```js
import {
  checkDocsPageFileTriplets,
  checkDocsPageTreeCoverage,
  checkSharedDocsCssOwnership,
} from './verify-site-docs.mjs';

it('fails when required docs pages are missing from the page tree', () => {
  const failures = checkDocsPageTreeCoverage(['runtime', 'compiler'], ['runtime']);

  expect(failures).toEqual(['Missing docs page tree entry: compiler']);
});

it('fails when a docs page source mapping is incomplete', () => {
  const failures = checkDocsPageFileTriplets([
    { key: 'runtime', sourceFiles: { ts: 'runtime.page.ts', html: 'runtime.page.html' } },
  ]);

  expect(failures).toEqual(['Missing css source file mapping for docs page: runtime']);
});

it('fails when shared docs classes live in page css', () => {
  const failures = checkSharedDocsCssOwnership(
    '.docs-article {}',
    new Map([['runtime.page.css', '.docs-section {}']]),
  );

  expect(failures).toEqual([
    'Shared docs CSS is missing .docs-summary',
    'Shared docs CSS is missing .docs-section-grid',
    'Shared docs CSS is missing .docs-section',
    'Shared docs CSS is missing .code-snippet',
    'Shared docs CSS is missing .docs-code-title',
    'Shared docs CSS is missing .code-block',
    'Shared docs CSS is missing .code-line',
    'Shared docs CSS is missing .code-line-number',
    'Shared docs CSS is missing .code-line-content',
    'Shared docs CSS is missing .docs-note',
    'Shared docs CSS is missing .docs-article-bookmarks',
    'Page CSS must not own .docs-section: runtime.page.css',
  ]);
});
```

- [x] **Step 5: Run export and verification tests**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- site-data.test.ts
pnpm test -- scripts/verify-site-docs.test.mjs
pnpm verify:site-docs
```

Expected:

```text
PASS apps/vanrot-site/tests/site-data.test.ts
PASS scripts/verify-site-docs.test.mjs
PASS verify:site-docs
```

- [ ] **Step 6: Review checkpoint**

Confirm `apps/vanrot-site/src/docs/site-data.json` is no longer imported by browser-facing docs narrative code. Do not stage or commit.

## Task 7: Route Render And Visual Parity Checks

**Files:**

- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
- Modify: `scripts/verify-site-docs.mjs`
- Modify: `scripts/verify-site-docs.test.mjs`

- [ ] **Step 1: Add route render assertions**

Modify `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
import { docsPageTree, flattenDocsPageTree } from '../src/docs/docs-page-tree.ts';
```

Add:

```ts
it.each([
  '/docs',
  '/docs/runtime',
  '/docs/runtime/signals',
  '/docs/compiler',
  '/docs/compiler/inputs',
  '/docs/cli',
  '/docs/cli/project-intelligence',
  '/docs/changelog',
])('renders migrated docs page %s with the current docs shell', async (path) => {
  const html = await renderSiteRoute(path);

  expect(html).toContain('docs-article-layout');
  expect(html).toContain('docs-article');
  expect(html).toContain('docs-section-grid');
  expect(html).not.toContain('DocsArticlePage');
});

it('has route coverage for every docs page tree entry', () => {
  const routePaths = new Set(Object.values(route).map((routeRef) => routeRef.path));

  for (const page of flattenDocsPageTree(docsPageTree)) {
    expect(routePaths.has(page.path)).toBe(true);
  }
});
```

Adjust `renderSiteRoute` call shape to match the current helper. If the helper returns `{ status, html }`, assert `result.status` and `result.html`.

- [ ] **Step 2: Add visual contract checks for article pages**

Modify `scripts/verify-site-docs.mjs`:

```js
export function checkDocsArticleVisualContract(pageHtml) {
  const requiredSnippets = [
    '<docs-article-shell',
    '<docs-section',
    'docs-code-block',
  ];

  return requiredSnippets
    .filter((snippet) => !pageHtml.includes(snippet))
    .map((snippet) => `Docs page is missing visual contract snippet: ${snippet}`);
}
```

Modify `scripts/verify-site-docs.test.mjs`:

```js
import { checkDocsArticleVisualContract } from './verify-site-docs.mjs';

it('fails when a docs page does not use the shared article shell', () => {
  expect(checkDocsArticleVisualContract('<article></article>')).toEqual([
    'Docs page is missing visual contract snippet: <docs-article-shell',
    'Docs page is missing visual contract snippet: <docs-section',
    'Docs page is missing visual contract snippet: docs-code-block',
  ]);
});
```

- [ ] **Step 3: Run route and visual contract tests**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- site-pages.test.ts
pnpm test -- scripts/verify-site-docs.test.mjs
pnpm verify:site-docs
```

Expected:

```text
PASS apps/vanrot-site/tests/site-pages.test.ts
PASS scripts/verify-site-docs.test.mjs
PASS verify:site-docs
```

- [ ] **Step 4: Start the local docs server**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected:

```text
Local: http://127.0.0.1:1964/
```

Keep the server running for browser inspection.

- [ ] **Step 5: Verify key routes over HTTP**

Run in another terminal:

```sh
curl -sS -o /tmp/vanrot-docs-runtime.html -w "%{http_code}" http://localhost:1964/docs/runtime
curl -sS -o /tmp/vanrot-docs-runtime-signals.html -w "%{http_code}" http://localhost:1964/docs/runtime/signals
curl -sS -o /tmp/vanrot-docs-changelog.html -w "%{http_code}" http://localhost:1964/docs/changelog
```

Expected for each command:

```text
200
```

- [ ] **Step 6: Browser inspection checkpoint**

Open these routes in the in-app browser:

```text
http://localhost:1964/docs/runtime
http://localhost:1964/docs/runtime/signals
http://localhost:1964/docs/changelog
```

Expected:

- article layout visually matches the current docs page;
- code blocks keep line numbers and token colors;
- changelog keeps current sidebar and entry layout;
- no text overlaps;
- no new hero, card shell, palette, or layout redesign appears.

Do not stage or commit.

## Task 8: Remove Old JSON-First Article Renderer

**Files:**

- Delete: `apps/vanrot-site/src/pages/docs/docs-article.page.ts`
- Delete: `apps/vanrot-site/src/pages/docs/docs-article.page.html`
- Delete: `apps/vanrot-site/src/pages/docs/docs-article.page.css`
- Delete: `apps/vanrot-site/src/pages/docs/docs-changelog.page.ts`
- Delete: `apps/vanrot-site/src/pages/docs/docs-changelog.page.html`
- Delete: `apps/vanrot-site/src/pages/docs/docs-changelog.page.css`
- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`
- Modify: `scripts/verify-site-docs.mjs`

- [ ] **Step 1: Prove old renderer files are unused**

Run:

```sh
rg "DocsArticlePage|docs-article.page|DocsChangelogPage|docs-changelog.page" apps/vanrot-site/src apps/vanrot-site/tests scripts
```

Expected:

```text
```

No matches should remain before deletion. If matches remain, finish Tasks 4 through 7 before continuing.

- [ ] **Step 2: Delete old renderer files**

Delete:

```text
apps/vanrot-site/src/pages/docs/docs-article.page.ts
apps/vanrot-site/src/pages/docs/docs-article.page.html
apps/vanrot-site/src/pages/docs/docs-article.page.css
apps/vanrot-site/src/pages/docs/docs-changelog.page.ts
apps/vanrot-site/src/pages/docs/docs-changelog.page.html
apps/vanrot-site/src/pages/docs/docs-changelog.page.css
```

- [ ] **Step 3: Convert `site-data.json` to a transitional generated artifact or remove narrative articles**

If AI/search scripts still require JSON, keep `apps/vanrot-site/src/docs/site-data.json` but strip hand-authored narrative article content and mark it generated in the first property:

```json
{
  "generatedFrom": "apps/vanrot-site/src/docs/docs-page-tree.ts",
  "articles": []
}
```

If all consumers have moved to `docs-page-export.ts`, delete `apps/vanrot-site/src/docs/site-data.json`.

The accepted final state is whichever makes `pnpm verify:site-docs` and `pnpm verify:ai-docs` pass without using `site-data.json` as the hand-authored narrative source.

- [ ] **Step 4: Add a guard against reintroducing JSON-first authoring**

Modify `scripts/verify-site-docs.mjs`:

```js
export function checkNoJsonFirstDocsAuthoring(siteDataSource) {
  if (siteDataSource.includes('"sections"') && siteDataSource.includes('"code"')) {
    return ['Narrative docs must be authored in page components, not site-data.json'];
  }

  return [];
}
```

Add the helper to `scripts/verify-site-docs.test.mjs`:

```js
import { checkNoJsonFirstDocsAuthoring } from './verify-site-docs.mjs';

it('fails when site-data.json contains narrative guide sections', () => {
  const failures = checkNoJsonFirstDocsAuthoring('{"articles":[{"sections":[{"code":{}}]}]}');

  expect(failures).toEqual([
    'Narrative docs must be authored in page components, not site-data.json',
  ]);
});
```

- [ ] **Step 5: Run cleanup verification**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test
pnpm verify:site-docs
pnpm verify:ai-docs
```

Expected:

```text
PASS @vanrot/vanrot-site test
PASS verify:site-docs
PASS verify:ai-docs
```

- [ ] **Step 6: Review checkpoint**

Confirm all docs narrative pages live as `.page.ts`, `.page.html`, and `.page.css`. Do not stage or commit.

## Task 9: Update Hooks And Local Skills For Phase 30

**Files:**

- Modify: `AGENTS.md`
- Modify: `.git/hooks/pre-commit`
- Modify: `/Users/user/.codex/skills/vanrot-doc-component/SKILL.md`
- Modify: `/Users/user/.codex/skills/framework-documentation/SKILL.md`
- Modify: `scripts/verify-site-docs.mjs`
- Modify: `scripts/verify-site-docs.test.mjs`

- [x] **Step 1: Add durable docs page component protocol to AGENTS**

Add this section to `AGENTS.md` after the Vanrot Component Docs Protocol:

```markdown
## Vanrot Docs Page Component Protocol

Human-authored docs pages in `apps/vanrot-site` must use real Vanrot page components.

- Author narrative docs in `.page.ts`, `.page.html`, and `.page.css` files under `apps/vanrot-site/src/pages/docs/**`.
- Keep parent framework pages and child framework pages as real routes backed by real page components.
- Do not add new narrative guide content to `apps/vanrot-site/src/docs/site-data.json`; generated/search/AI data should derive from page metadata and source files.
- Route and sidebar metadata should flow through `apps/vanrot-site/src/docs/docs-page-tree.ts`.
- Put common docs styles in `apps/vanrot-site/src/pages/docs/shared/docs.css`.
- Keep page CSS files limited to page-specific exceptions.
- Use shared docs components for repeated article shell, section, code block, note, points list, and changelog entry UI.
- Preserve the current docs UI design and class names unless the task explicitly asks for a visual redesign.
- When docs-site authoring files change, run the site page tests, `pnpm verify:site-docs`, restart the site dev server on port `1964`, and inspect the affected route.
```

- [x] **Step 2: Update pre-commit hook for docs authoring guard**

Modify `.git/hooks/pre-commit` before the final `exit 0`:

```sh
if has_staged_match '^(apps/vanrot-site/src/pages/docs/|apps/vanrot-site/src/docs/docs-page-tree\.ts|apps/vanrot-site/src/docs/site-data\.json|apps/vanrot-site/src/docs/site-navigation\.ts|scripts/verify-site-docs\.mjs)'; then
  if ! node scripts/verify-site-docs.mjs; then
    cat <<'MSG'

Vanrot docs-site verification failed in the pre-commit hook.

Docs authoring rules:
- Narrative docs must live in real .page.ts/.page.html/.page.css files.
- Parent and child docs pages must be real routes.
- Common docs CSS belongs in apps/vanrot-site/src/pages/docs/shared/docs.css.
- Do not reintroduce JSON-first docs authoring in site-data.json.

Temporary bypass:
  VANROT_SKIP_PHASE_HOOK=1 git commit
MSG
    exit 1
  fi
fi
```

- [x] **Step 3: Update `vanrot-doc-component` skill**

Modify `/Users/user/.codex/skills/vanrot-doc-component/SKILL.md` to include:

```markdown
## Phase 30 Docs Authoring Rule

For Vanrot docs-site work, do not add narrative guide content to `apps/vanrot-site/src/docs/site-data.json`.

Component docs and framework docs should use real page/component files:

- `.page.ts`
- `.page.html`
- `.page.css`

When a docs route or sidebar item is added, update `apps/vanrot-site/src/docs/docs-page-tree.ts` and verify the route renders. Shared article/code/note/list UI should come from `apps/vanrot-site/src/pages/docs/shared/`; page CSS should contain only page-specific exceptions.
```

- [x] **Step 4: Update `framework-documentation` skill**

Modify `/Users/user/.codex/skills/framework-documentation/SKILL.md` by replacing the old JSON-first workflow lines with:

```markdown
5. Edit the canonical docs page component files and `docs-page-tree.ts`.
6. For parent/child docs, wire every child through the same complete path as the parent: real page component triplet, page tree entry, sidebar child, route object, generated docs bundle, and route/render tests. Tests should fail if children are only `#section` links.
7. Do not add new narrative docs to `apps/vanrot-site/src/docs/site-data.json`; generated/search/AI outputs should derive from real page files.
```

- [x] **Step 5: Add hook/skill guard tests**

Add a focused assertion to `scripts/verify-site-docs.test.mjs`:

```js
import { checkNoJsonFirstDocsAuthoring } from './verify-site-docs.mjs';

it('accepts generated site-data without narrative guide sections', () => {
  expect(checkNoJsonFirstDocsAuthoring('{"generatedFrom":"apps/vanrot-site/src/docs/docs-page-tree.ts","articles":[]}')).toEqual([]);
});
```

- [x] **Step 6: Run hook/skill related verification**

Run:

```sh
pnpm test -- scripts/verify-site-docs.test.mjs
pnpm verify:site-docs
```

Expected:

```text
PASS scripts/verify-site-docs.test.mjs
PASS verify:site-docs
```

- [x] **Step 7: Review checkpoint**

Confirm `AGENTS.md`, the pre-commit hook, and local docs skills now point future docs work at real page components and `docs-page-tree.ts`. Do not stage or commit.

## Task 10: Regenerate AI Docs And Update Phase Trackers

**Files:**

- Modify: `docs/ai/index.json`
- Modify: `docs/ai/knowledge/docs.md`
- Modify: `docs/ai/manifest.json`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/future-pipeline.md`
- Modify: `docs/superpowers/plans/Phase-30.md`

- [ ] **Step 1: Regenerate AI docs**

Run:

```sh
pnpm exec vr ai build
```

Expected:

```text
AI docs bundle written
```

If `pnpm exec vr ai build` is unavailable, run:

```sh
node packages/cli/dist/bin.js ai build
```

Expected:

```text
AI docs bundle written
```

- [ ] **Step 2: Update feature maturity**

Modify `docs/superpowers/feature-maturity.md` by adding or updating the Phase 30 row:

```markdown
| [x]  | Phase 30 | Docs page component authoring                    | Real docs page components, shared docs component kit, shared docs CSS, page-tree-derived navigation/routes, generated AI/search exports                             | Docs pages dogfood Vanrot `.page.ts/.page.html/.page.css` conventions without changing the visible UI.                                                                                 |
```

If Phase 30 already exists as unchecked, mark it checked only after every verification command in Task 10 passes.

- [ ] **Step 3: Update final TDD inventory**

Add this section to `docs/superpowers/final-tdd-inventory.md`:

```markdown
### Phase 30 Docs Page Components

- `apps/vanrot-site/src/docs/docs-page-tree.ts`: source of truth for docs route metadata, parent/child page structure, source file mappings, and page components.
- `apps/vanrot-site/src/pages/docs/shared/*`: shared article shell, section, code block, note, points list, changelog entry, and docs CSS class system.
- `apps/vanrot-site/src/pages/docs/**/*.page.*`: real page component authoring surface for human-authored docs routes.
- `apps/vanrot-site/tests/docs-page-tree.test.ts`: parent/child route tree, changelog page component, navigation parity, and route registration coverage.
- `apps/vanrot-site/tests/docs-page-files.test.ts`: `.page.ts/.page.html/.page.css` triplet, no inline TS markup, and shared CSS ownership coverage.
- `scripts/verify-site-docs.mjs`: guards against JSON-first docs authoring and missing page-tree coverage.
```

- [ ] **Step 4: Update future pipeline if needed**

If `docs/superpowers/future-pipeline.md` has an unfinished item for docs-site authoring, AI-doc drift from site docs, fake anchors, or JSON-first docs, mark it shipped by Phase 30:

```markdown
- [x] Docs page component authoring shipped in Phase 30. Narrative docs now live in real `.page.ts/.page.html/.page.css` components, while generated AI/search data derives from page metadata and source files.
```

If no matching item exists, leave `future-pipeline.md` unchanged.

- [ ] **Step 5: Update this plan checkboxes**

After implementation and verification, mark completed Phase 30 tasks in `docs/superpowers/plans/Phase-30.md`.

- [ ] **Step 6: Review checkpoint**

Confirm tracker updates match actual verification results. Do not stage or commit.

## Task 11: Final Verification And Local Server Restart

**Files:**

- Verify only unless a failure points to a specific file.

- [ ] **Step 1: Run site tests**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test
```

Expected:

```text
PASS @vanrot/vanrot-site test
```

- [ ] **Step 2: Run site docs verification**

Run:

```sh
pnpm verify:site-docs
```

Expected:

```text
PASS verify:site-docs
```

- [ ] **Step 3: Run full verification**

Run:

```sh
pnpm verify
```

Expected:

```text
PASS pnpm verify
```

- [ ] **Step 4: Restart Vanrot site dev server**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected:

```text
Local: http://127.0.0.1:1964/
```

- [ ] **Step 5: Verify local routes respond**

Run:

```sh
curl -sS -o /tmp/vanrot-docs.html -w "%{http_code}" http://localhost:1964/docs
curl -sS -o /tmp/vanrot-docs-runtime.html -w "%{http_code}" http://localhost:1964/docs/runtime
curl -sS -o /tmp/vanrot-docs-runtime-signals.html -w "%{http_code}" http://localhost:1964/docs/runtime/signals
curl -sS -o /tmp/vanrot-docs-changelog.html -w "%{http_code}" http://localhost:1964/docs/changelog
```

Expected for each command:

```text
200
```

- [ ] **Step 6: Check git status**

Run:

```sh
git status --short --branch
```

Expected:

```text
## main...origin/main
 M ...
```

Report all changed files and unrelated dirty files. Do not stage, commit, or push unless the user explicitly asks.

## Self-Review Checklist

- Spec coverage:
  - Real page components: Tasks 1, 3, 4, 8.
  - Parent/child framework routes: Tasks 1, 3, 4, 7.
  - Changelog page component: Task 5.
  - Shared reusable docs components: Task 2.
  - Shared docs CSS and page-specific CSS exceptions: Tasks 1, 2, 6.
  - Generated AI/search output, not JSON-first authoring: Tasks 6, 8, 9.
  - Visual parity and no UI design change: Tasks 2, 7, 10.
  - Verification gates: Tasks 7, 8, 10.
- Placeholder scan:
  - The plan does not contain unresolved placeholder instructions.
  - Every task names exact files and commands.
  - Code-changing steps include concrete code snippets or a complete migration script.
- Type consistency:
  - `DocsPageTreeItem`, `DocsPageSection`, `docsPageTree`, `flattenDocsPageTree`, and `docsPageSection` are introduced in Task 3 and reused consistently.
  - `DocsSectionLink`, `DocsCodeLine`, and token types are introduced in Task 2 and reused consistently.
  - Changelog class name is `ChangelogPage` everywhere after Task 5.
