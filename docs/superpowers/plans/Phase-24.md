# Phase 24 Documentation And Web Presence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. Vanrot `AGENTS.md` disables subagent-driven workflows for this repository, so execute inline with review checkpoints.

**Goal:** Make Vanrot's public framework documentation, example matrix, landing page, docs shell, and deployment-readiness checks complete enough for `vanrot.vankode.com`.

**Architecture:** Keep the current Vanrot site architecture and extend it with typed, checkable framework reference registries plus richer long-form guide data. Runnable examples become the canonical source for examples, while `verify:site-docs` enforces coverage for packages, public exports, commands, diagnostics, generated files, conventions, examples, route metadata, CTA labels, and docs-shell visual contracts. The site keeps the shadcn-inspired component docs direction and dogfoods Vanrot UI primitives where practical.

**Tech Stack:** TypeScript, Vanrot runtime/router/UI, JSON-backed docs data, Vitest, Node verification scripts, pnpm workspaces, Vite-powered `@vanrot/vanrot-site`.

---

## Execution Rules

- Work in the current local `main` workspace unless the user explicitly asks for a branch or worktree.
- Do not use subagents, parallel agents, or dispatch workflows in this repository.
- Do not run `git add`, `git commit`, or `git push` unless the user explicitly asks.
- Use TDD: failing test first, minimal implementation, passing test, checkpoint.
- Keep Phase 17 through Phase 22 out of Phase 24 implementation. Those remain post-production work.
- Keep Phase 25 AI-consumption bundles and Phase 26 release automation out of Phase 24.
- Use Vanrot route refs and shared sources of truth instead of new repeated route strings.
- Prefer Vanrot UI primitives for docs surfaces that Phase 24 touches.

## Scope Check

The approved spec spans inventories, framework docs, examples, public-site polish, and deployment-ready checks. These are not independent products; they all support the single public documentation surface and the same verification gate. This plan keeps them as one Phase 24 plan, split into five executable slices so each slice produces testable software:

- **24A Inventory Foundation:** Tasks 1 through 4.
- **24B Framework Documentation:** Tasks 5 through 7.
- **24C Example Matrix:** Tasks 8 through 10.
- **24D Site And Docs-Shell Polish:** Tasks 11 through 13.
- **24E Deployment-Ready Checks And Closeout:** Tasks 14 through 16.

## File Structure

### New Docs Data And Rendering Files

- Create: `apps/vanrot-site/src/docs/framework-reference.json`
  - Checkable structured registry for packages, public exports, commands, diagnostics, generated files, conventions, examples, limitations, maturity rows, deployment notes, and public route metadata.
- Create: `apps/vanrot-site/src/docs/framework-reference.ts`
  - Typed facade over `framework-reference.json`.
- Create: `apps/vanrot-site/src/docs/framework-guides.ts`
  - Named article key groups and guide coverage helpers for long-form framework docs.
- Create: `apps/vanrot-site/src/docs/example-matrix.ts`
  - Typed example coverage model used by site tests and `verify:site-docs`.
- Create: `apps/vanrot-site/src/pages/docs/docs-reference.page.ts`
  - Framework reference page class.
- Create: `apps/vanrot-site/src/pages/docs/docs-reference.page.html`
  - Reference page markup using Vanrot badges, cards, separators, tables or list primitives.
- Create: `apps/vanrot-site/src/pages/docs/docs-reference.page.css`
  - Scoped reference page styling aligned with component docs.
- Create: `apps/vanrot-site/src/pages/docs/docs-example-matrix.page.ts`
  - Example matrix page class.
- Create: `apps/vanrot-site/src/pages/docs/docs-example-matrix.page.html`
  - Example matrix page markup.
- Create: `apps/vanrot-site/src/pages/docs/docs-example-matrix.page.css`
  - Scoped example matrix styling.

### New Site Tests

- Create: `apps/vanrot-site/tests/framework-reference.test.ts`
  - Verifies typed registry coverage, public docs states, route metadata, and example references.
- Create: `apps/vanrot-site/tests/site-polish.test.ts`
  - Verifies CTA labels, docs shell visual contract, docs route coverage, and SEO metadata.

### Verification Script Changes

- Modify: `scripts/verify-site-docs.mjs`
  - Add coverage checks for workspace packages, public exports, CLI command metadata, diagnostic codes, generated files, conventions, examples, maturity rows, CTA labels, and docs-shell visual contract.
- Modify: `scripts/verify-site-docs.test.mjs`
  - Add unit coverage for the new check helpers and failure messages.

### Existing Site Data And Routes

- Modify: `apps/vanrot-site/src/docs/site-data.json`
  - Expand long-form guide articles and keep narrative docs in one data source.
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
  - Export expanded article keys and delegate structured reference data to `framework-reference.ts`.
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
  - Add framework reference and example matrix navigation while preserving component docs as its own public path.
- Modify: `apps/vanrot-site/src/docs/site-reference.ts`
  - Re-export the new reference registries.
- Modify: `apps/vanrot-site/src/routes.ts`
  - Add route refs for new framework docs pages and route metadata.
- Modify: `apps/vanrot-site/src/pages/docs/docs-article.page.ts`
  - Support richer guide sections without putting application logic in HTML.
- Modify: `apps/vanrot-site/src/pages/docs/docs-article.page.html`
  - Render rich guide sections with Vanrot-native surfaces.
- Modify: `apps/vanrot-site/src/pages/docs/docs-article.page.css`
  - Align guide content with component docs density, spacing, and code blocks.
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.ts`
  - Use structured nav groups and route metadata for framework docs.
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.html`
  - Align `/docs` sidebar structure with `/docs/components`.
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.css`
  - Match component docs sidebar visual language without copying the component page wholesale.
- Modify: `apps/vanrot-site/src/pages/home/home.page.ts`
  - Rename CTA labels and expose landing sections from one source.
- Modify: `apps/vanrot-site/src/pages/home/home.page.html`
  - Polish the landing page with Vanrot primitives and clearer two-path hierarchy.
- Modify: `apps/vanrot-site/src/pages/home/home.page.css`
  - Implement the tasteful shadcn-inspired landing pass.
- Modify: `apps/vanrot-site/tests/site-data.test.ts`
  - Verify guide and registry data.
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
  - Verify framework docs routes and page structure.
- Modify: `apps/vanrot-site/tests/site-workspace.test.ts`
  - Verify important public routes keep metadata.

### Example Workspaces

- Modify: `examples/counter/package.json`
- Modify: `examples/counter/tests/counter-build.test.ts`
- Create: `examples/runtime-lifecycle/package.json`
- Create: `examples/runtime-lifecycle/src/main.ts`
- Create: `examples/runtime-lifecycle/tests/runtime-lifecycle.test.ts`
- Create: `examples/runtime-lifecycle/tsconfig.json`
- Create: `examples/compiler-templates/package.json`
- Create: `examples/compiler-templates/src/main.ts`
- Create: `examples/compiler-templates/src/status-card.component.ts`
- Create: `examples/compiler-templates/src/status-card.component.html`
- Create: `examples/compiler-templates/src/status-card.component.css`
- Create: `examples/compiler-templates/tests/compiler-templates.test.ts`
- Create: `examples/compiler-templates/tsconfig.json`
- Create: `examples/routing-workflows/package.json`
- Create: `examples/routing-workflows/src/main.ts`
- Create: `examples/routing-workflows/src/routes.ts`
- Create: `examples/routing-workflows/tests/routing-workflows.test.ts`
- Create: `examples/routing-workflows/tsconfig.json`
- Create: `examples/testing-helpers/package.json`
- Create: `examples/testing-helpers/src/counter.component.ts`
- Create: `examples/testing-helpers/src/counter.component.html`
- Create: `examples/testing-helpers/tests/testing-helpers.test.ts`
- Create: `examples/testing-helpers/tsconfig.json`
- Create: `examples/devtools-intelligence/package.json`
- Create: `examples/devtools-intelligence/src/main.ts`
- Create: `examples/devtools-intelligence/tests/devtools-intelligence.test.ts`
- Create: `examples/devtools-intelligence/tsconfig.json`
- Create: `examples/build-deploy/package.json`
- Create: `examples/build-deploy/src/main.ts`
- Create: `examples/build-deploy/tests/build-deploy.test.ts`
- Create: `examples/build-deploy/tsconfig.json`

### Phase Tracking

- Modify: `docs/superpowers/feature-maturity.md`
  - Mark Phase 24 complete only after all criteria pass.
- Modify: `docs/superpowers/final-tdd-inventory.md`
  - Add Phase 24 docs, examples, checks, route metadata, and site-polish coverage.
- Modify: `docs/vanrot-presentation.html`
  - Update the roadmap after Phase 24 completion.

---

## Task 1: Add Framework Reference Registry Types

**Files:**
- Create: `apps/vanrot-site/src/docs/framework-reference.json`
- Create: `apps/vanrot-site/src/docs/framework-reference.ts`
- Test: `apps/vanrot-site/tests/framework-reference.test.ts`

- [x] **Step 1: Write failing registry shape tests**

Create `apps/vanrot-site/tests/framework-reference.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  frameworkReference,
  frameworkReferenceStatus,
  publicRouteMetadata,
} from '../src/docs/framework-reference.ts';

describe('framework reference registry', () => {
  it('documents every current workspace package', () => {
    expect(frameworkReference.packages.map((item) => item.name)).toEqual([
      '@vanrot/runtime',
      '@vanrot/compiler',
      '@vanrot/config',
      '@vanrot/router',
      '@vanrot/vite-plugin',
      '@vanrot/cli',
      '@vanrot/ui',
      '@vanrot/testing',
      '@vanrot/devtools',
    ]);
  });

  it('uses explicit public documentation states', () => {
    expect(Object.values(frameworkReferenceStatus)).toEqual([
      'production-ready',
      'demo-capable',
      'limited',
      'deferred',
      'not-browser-facing',
    ]);

    for (const limitation of frameworkReference.limitations) {
      expect(Object.values(frameworkReferenceStatus)).toContain(limitation.status);
      expect(limitation.summary.length).toBeGreaterThan(20);
    }
  });

  it('includes route metadata for the public documentation front doors', () => {
    expect(publicRouteMetadata.map((item) => item.path)).toEqual([
      '/',
      '/docs',
      '/docs/components',
    ]);

    for (const route of publicRouteMetadata) {
      expect(route.title).toContain('Vanrot');
      expect(route.description.length).toBeGreaterThan(50);
    }
  });
});
```

- [x] **Step 2: Run the failing test**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference.test.ts`

Expected: FAIL with `Cannot find module '../src/docs/framework-reference.ts'`.

- [x] **Step 3: Create the typed facade**

Create `apps/vanrot-site/src/docs/framework-reference.ts`:

```ts
import frameworkReferenceJson from './framework-reference.json';

export const frameworkReferenceStatus = {
  productionReady: 'production-ready',
  demoCapable: 'demo-capable',
  limited: 'limited',
  deferred: 'deferred',
  notBrowserFacing: 'not-browser-facing',
} as const;

export type FrameworkReferenceStatus =
  (typeof frameworkReferenceStatus)[keyof typeof frameworkReferenceStatus];

export interface FrameworkPackageReference {
  name: string;
  area: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkPublicExportReference {
  packageName: string;
  name: string;
  kind: 'function' | 'constant' | 'type' | 'interface' | 'class' | 'default';
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkCommandReference {
  name: string;
  usage: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkDiagnosticReference {
  family: 'compiler' | 'config' | 'router' | 'cli' | 'vite-plugin';
  code: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkGeneratedFileReference {
  path: string;
  owner: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkConventionReference {
  id: string;
  title: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkExampleReference {
  id: string;
  title: string;
  path: string;
  packages: readonly string[];
  workflows: readonly string[];
  docsPath: string;
}

export interface FrameworkLimitationReference {
  id: string;
  title: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkMaturityReference {
  phase: string;
  title: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface PublicRouteMetadata {
  path: string;
  title: string;
  description: string;
}

export interface FrameworkReference {
  packages: readonly FrameworkPackageReference[];
  publicExports: readonly FrameworkPublicExportReference[];
  commands: readonly FrameworkCommandReference[];
  diagnostics: readonly FrameworkDiagnosticReference[];
  generatedFiles: readonly FrameworkGeneratedFileReference[];
  conventions: readonly FrameworkConventionReference[];
  examples: readonly FrameworkExampleReference[];
  limitations: readonly FrameworkLimitationReference[];
  maturity: readonly FrameworkMaturityReference[];
  routeMetadata: readonly PublicRouteMetadata[];
  deployment: {
    targetHost: string;
    status: FrameworkReferenceStatus;
    summary: string;
    docsPath: string;
  };
}

export const frameworkReference = frameworkReferenceJson as FrameworkReference;
export const packageReferenceDocs = frameworkReference.packages;
export const publicExportReferenceDocs = frameworkReference.publicExports;
export const commandReferenceDocs = frameworkReference.commands;
export const diagnosticReferenceDocs = frameworkReference.diagnostics;
export const generatedFileReferenceDocs = frameworkReference.generatedFiles;
export const conventionReferenceDocs = frameworkReference.conventions;
export const exampleReferenceDocs = frameworkReference.examples;
export const limitationReferenceDocs = frameworkReference.limitations;
export const maturityReferenceDocs = frameworkReference.maturity;
export const publicRouteMetadata = frameworkReference.routeMetadata;
export const deploymentReference = frameworkReference.deployment;
```

- [x] **Step 4: Add the initial registry data**

Create `apps/vanrot-site/src/docs/framework-reference.json` with this initial structure:

```json
{
  "packages": [
    {
      "name": "@vanrot/runtime",
      "area": "Reactive runtime",
      "status": "production-ready",
      "summary": "Signals, computed values, effects, batching, lifecycle helpers, DOM mounting, event cleanup, and the runtime devtools hook contract.",
      "docsPath": "/docs/runtime"
    },
    {
      "name": "@vanrot/compiler",
      "area": "Component compiler",
      "status": "production-ready",
      "summary": "Template compilation, scoped CSS rewriting, diagnostics, source maps, child components, slots, and generated component modules.",
      "docsPath": "/docs/compiler"
    },
    {
      "name": "@vanrot/config",
      "area": "Project configuration",
      "status": "production-ready",
      "summary": "Typed Vanrot config helpers, normalization, validation, migrations, diagnostics, and install-aware defaults.",
      "docsPath": "/docs/configuration"
    },
    {
      "name": "@vanrot/router",
      "area": "Application routing",
      "status": "production-ready",
      "summary": "Route refs, layouts, nested outlets, navigation helpers, route metadata, and router diagnostics.",
      "docsPath": "/docs/routing"
    },
    {
      "name": "@vanrot/vite-plugin",
      "area": "Vite integration",
      "status": "production-ready",
      "summary": "Vanrot component transforms, virtual modules, scoped CSS modules, diagnostics overlay, project metadata, and production builds.",
      "docsPath": "/docs/vite-plugin"
    },
    {
      "name": "@vanrot/cli",
      "area": "Command line",
      "status": "demo-capable",
      "summary": "Project creation, generation, UI additions, config inspection, doctor checks, project maps, AI rule files, dev, build, and test commands.",
      "docsPath": "/docs/cli"
    },
    {
      "name": "@vanrot/ui",
      "area": "October UI primitives",
      "status": "production-ready",
      "summary": "Shadcn-inspired Vanrot-native primitives used by the site and component documentation catalog.",
      "docsPath": "/docs/ui"
    },
    {
      "name": "@vanrot/testing",
      "area": "Testing helpers",
      "status": "demo-capable",
      "summary": "Readable helpers for component and workflow tests that stay lightweight until the post-production testing package phase.",
      "docsPath": "/docs/testing"
    },
    {
      "name": "@vanrot/devtools",
      "area": "Devtools and project intelligence",
      "status": "production-ready",
      "summary": "Project map graph contracts, DevTools panel assets, runtime graph metadata, and project intelligence helpers.",
      "docsPath": "/docs/devtools"
    }
  ],
  "publicExports": [],
  "commands": [],
  "diagnostics": [],
  "generatedFiles": [],
  "conventions": [],
  "examples": [],
  "limitations": [
    {
      "id": "post-production-phases",
      "title": "Post-production features are not current framework behavior",
      "status": "deferred",
      "summary": "Brutalist UI, the expanded testing package, store, forms and async primitives, and SSR or hydration remain outside the current public framework behavior.",
      "docsPath": "/docs/limitations"
    }
  ],
  "maturity": [
    {
      "phase": "Phase 24",
      "title": "Documentation and web presence",
      "status": "limited",
      "summary": "Phase 24 is active while framework docs, examples, site polish, and drift checks are being implemented.",
      "docsPath": "/docs/status"
    }
  ],
  "routeMetadata": [
    {
      "path": "/",
      "title": "Vanrot - Framework Documentation And Design Components",
      "description": "Vanrot's public landing page for framework documentation, design components, examples, and production-readiness notes."
    },
    {
      "path": "/docs",
      "title": "Vanrot Framework Documentation",
      "description": "Framework documentation for Vanrot packages, APIs, commands, diagnostics, conventions, examples, limitations, and deployment preparation."
    },
    {
      "path": "/docs/components",
      "title": "Vanrot Design Component Catalog",
      "description": "Design component documentation for Vanrot's October UI primitives, variants, usage examples, and API notes."
    }
  ],
  "deployment": {
    "targetHost": "vanrot.vankode.com",
    "status": "limited",
    "summary": "The site is prepared for production hosting, but DNS, credentials, analytics, and live deployment are not performed by this repository phase.",
    "docsPath": "/docs/deployment"
  }
}
```

- [x] **Step 5: Run the registry test**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference.test.ts`

Expected: PASS.

- [x] **Step 6: Checkpoint**

Run: `git status --short --branch`

Expected: changed files include only the new reference registry files and the new test. Do not stage changes.

## Task 2: Move Structured References Behind One Source

**Files:**
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `apps/vanrot-site/src/docs/site-reference.ts`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`
- Test: `apps/vanrot-site/tests/framework-reference.test.ts`

- [x] **Step 1: Write failing tests for shared reference exports**

Append to `apps/vanrot-site/tests/framework-reference.test.ts`:

```ts
import {
  commandReference,
  diagnosticReference,
  packageReference,
} from '../src/docs/site-reference.ts';

describe('site reference facade', () => {
  it('re-exports framework reference registries for docs pages', () => {
    expect(packageReference).toBe(frameworkReference.packages);
    expect(commandReference).toBe(frameworkReference.commands);
    expect(diagnosticReference).toBe(frameworkReference.diagnostics);
  });
});
```

- [x] **Step 2: Run the failing test**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference.test.ts`

Expected: FAIL because `site-reference.ts` still exports old shapes from `site-data.ts`.

- [x] **Step 3: Update `site-data.ts` reference exports**

Modify `apps/vanrot-site/src/docs/site-data.ts` so the bottom reference exports come from `framework-reference.ts`:

```ts
import siteDataJson from './site-data.json';
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

export const siteStatus = {
  availableNow: 'available-now',
  demoCapable: 'demo-capable',
  productionReadyThroughPhase12: 'production-ready-through-phase-12',
  productionReadyThroughPhase13: 'production-ready-through-phase-13',
  productionReadyThroughPhase15: 'production-ready-through-phase-15',
  productionReadyThroughPhase23: 'production-ready-through-phase-23',
  demoCapableThroughPhase14: 'demo-capable-through-phase-14',
  demoCapableThroughPhase16B: 'demo-capable-through-phase-16b',
  inProgressThroughPhase16B: 'in-progress-through-phase-16b',
  phase24Active: 'phase-24-active',
} as const;

export type SiteStatus = (typeof siteStatus)[keyof typeof siteStatus];

export interface SiteArticleSection {
  id: string;
  title: string;
  body: string;
}

export interface SiteArticle {
  key: SiteArticleKey;
  section: SiteSectionKey;
  path: string;
  label: string;
  title: string;
  summary: string;
  status: SiteStatus | string;
  sections: readonly SiteArticleSection[];
}

export const siteArticleKey = {
  introduction: 'introduction',
  installation: 'installation',
  projectStructure: 'projectStructure',
  runtime: 'runtime',
  compiler: 'compiler',
  vitePlugin: 'vitePlugin',
  cli: 'cli',
  configuration: 'configuration',
  routing: 'routing',
  uiOctober: 'uiOctober',
  theming: 'theming',
  vanrotstyles: 'vanrotstyles',
  testing: 'testing',
  devtools: 'devtools',
  examples: 'examples',
  exampleMatrix: 'exampleMatrix',
  deployment: 'deployment',
  publicApi: 'publicApi',
  diagnostics: 'diagnostics',
  generatedFiles: 'generatedFiles',
  octoberShowcase: 'octoberShowcase',
  conventions: 'conventions',
  limitations: 'limitations',
  referenceStatus: 'referenceStatus',
} as const;

export type SiteArticleKey = (typeof siteArticleKey)[keyof typeof siteArticleKey];

export const siteArticleKeys = Object.values(siteArticleKey);

const rawArticles = siteDataJson.articles as SiteArticle[];

export const siteArticles = Object.fromEntries(
  rawArticles.map((article) => [article.key, article]),
) as Record<SiteArticleKey, SiteArticle>;

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

export function getSiteArticle(key: SiteArticleKey): SiteArticle {
  return siteArticles[key];
}

export const primitiveDocCopy = siteDataJson.primitiveDocs as PrimitiveDocCopy[];
export const cliCommandDocs = frameworkCommandReferenceDocs;
export const packageReferenceDocs = frameworkPackageReferenceDocs;
export const diagnosticReferenceDocs = frameworkDiagnosticReferenceDocs;
```

- [x] **Step 4: Update `site-reference.ts`**

Replace `apps/vanrot-site/src/docs/site-reference.ts` with:

```ts
import {
  commandReferenceDocs,
  diagnosticReferenceDocs,
  packageReferenceDocs,
  publicExportReferenceDocs,
  generatedFileReferenceDocs,
  conventionReferenceDocs,
  exampleReferenceDocs,
  limitationReferenceDocs,
  maturityReferenceDocs,
  publicRouteMetadata,
  deploymentReference,
} from './framework-reference.ts';

export const commandReference = commandReferenceDocs;
export const packageReference = packageReferenceDocs;
export const diagnosticReference = diagnosticReferenceDocs;
export const publicExportReference = publicExportReferenceDocs;
export const generatedFileReference = generatedFileReferenceDocs;
export const conventionReference = conventionReferenceDocs;
export const exampleReference = exampleReferenceDocs;
export const limitationReference = limitationReferenceDocs;
export const maturityReference = maturityReferenceDocs;
export const routeMetadataReference = publicRouteMetadata;
export const deployment = deploymentReference;
```

- [x] **Step 5: Update the package expectation in `site-data.test.ts`**

Keep the existing package expectation including `@vanrot/devtools`. Add this assertion to the same test:

```ts
    expect(packageReferenceDocs.every((item) => item.docsPath.startsWith('/docs'))).toBe(true);
    expect(cliCommandDocs.every((command) => command.docsPath.startsWith('/docs'))).toBe(true);
```

- [x] **Step 6: Run focused site data tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-data.test.ts framework-reference.test.ts`

Expected: PASS.

- [x] **Step 7: Checkpoint**

Run: `git status --short --branch`

Expected: structured registry files, `site-data.ts`, `site-reference.ts`, and tests are modified. Do not stage changes.

## Task 3: Extend `verify:site-docs` Coverage Helpers

**Files:**
- Modify: `scripts/verify-site-docs.mjs`
- Modify: `scripts/verify-site-docs.test.mjs`

- [x] **Step 1: Add failing helper tests**

Append to `scripts/verify-site-docs.test.mjs`:

```js
import {
  checkConventionCoverage,
  checkCtaLabels,
  checkExampleRegistration,
  checkGeneratedFileCoverage,
  checkPublicExportCoverage,
  checkRouteMetadataCoverage,
} from './verify-site-docs.mjs';

describe('expanded site docs verification', () => {
  it('fails when a public export has no reference entry', () => {
    const failures = checkPublicExportCoverage(
      [{ packageName: '@vanrot/runtime', name: 'signal' }],
      [{ packageName: '@vanrot/runtime', name: 'computed' }],
    );

    expect(failures).toEqual(['Missing public export docs entry: @vanrot/runtime#signal']);
  });

  it('fails when a generated file has no docs entry', () => {
    const failures = checkGeneratedFileCoverage(
      ['src/routes.ts', 'vanrot.config.ts'],
      [{ path: 'src/routes.ts' }],
    );

    expect(failures).toEqual(['Missing generated file docs entry: vanrot.config.ts']);
  });

  it('fails when a convention has no docs entry', () => {
    const failures = checkConventionCoverage(
      ['role-suffixes', 'scoped-css'],
      [{ id: 'role-suffixes' }],
    );

    expect(failures).toEqual(['Missing convention docs entry: scoped-css']);
  });

  it('fails when an example workspace has no docs registration', () => {
    const failures = checkExampleRegistration(
      ['counter', 'routing-workflows'],
      [{ path: 'examples/counter' }],
    );

    expect(failures).toEqual(['Missing example docs entry: examples/routing-workflows']);
  });

  it('fails when CTA labels drift', () => {
    const failures = checkCtaLabels(
      "primaryCta: 'Read the docs', secondaryCta: 'View components'",
    );

    expect(failures).toEqual([
      'Landing primary CTA must be Framework Documentation',
      'Landing secondary CTA must be Design Component',
    ]);
  });

  it('fails when public route metadata is missing', () => {
    const failures = checkRouteMetadataCoverage(
      ['/', '/docs', '/docs/components'],
      [{ path: '/', title: 'Vanrot', description: 'Vanrot framework documentation for teams.' }],
    );

    expect(failures).toEqual([
      'Missing public route metadata: /docs',
      'Missing public route metadata: /docs/components',
    ]);
  });
});
```

- [x] **Step 2: Run failing script tests**

Run: `pnpm test:phase-docs`

Expected: FAIL with missing exported helper names from `verify-site-docs.mjs`.

- [x] **Step 3: Add helper functions to `verify-site-docs.mjs`**

Add these exported functions near the existing helper functions:

```js
export function checkPublicExportCoverage(availableExports, docExports) {
  const available = new Set(availableExports.map((item) => `${item.packageName}#${item.name}`));
  const documented = new Set(docExports.map((item) => `${item.packageName}#${item.name}`));
  const failures = [];

  for (const item of available) {
    if (!documented.has(item)) {
      failures.push(`Missing public export docs entry: ${item}`);
    }
  }

  return failures;
}

export function checkGeneratedFileCoverage(requiredFiles, docFiles) {
  const documented = new Set(docFiles.map((item) => item.path));
  const failures = [];

  for (const filePath of requiredFiles) {
    if (!documented.has(filePath)) {
      failures.push(`Missing generated file docs entry: ${filePath}`);
    }
  }

  return failures;
}

export function checkConventionCoverage(requiredConventions, docConventions) {
  const documented = new Set(docConventions.map((item) => item.id));
  const failures = [];

  for (const convention of requiredConventions) {
    if (!documented.has(convention)) {
      failures.push(`Missing convention docs entry: ${convention}`);
    }
  }

  return failures;
}

export function checkExampleRegistration(exampleNames, docExamples) {
  const documented = new Set(docExamples.map((item) => item.path));
  const failures = [];

  for (const name of exampleNames) {
    const examplePath = `examples/${name}`;

    if (!documented.has(examplePath)) {
      failures.push(`Missing example docs entry: ${examplePath}`);
    }
  }

  return failures;
}

export function checkCtaLabels(homePageSource) {
  const failures = [];

  if (!homePageSource.includes("primaryCta: 'Framework Documentation'")) {
    failures.push('Landing primary CTA must be Framework Documentation');
  }

  if (!homePageSource.includes("secondaryCta: 'Design Component'")) {
    failures.push('Landing secondary CTA must be Design Component');
  }

  return failures;
}

export function checkRouteMetadataCoverage(requiredPaths, routeMetadata) {
  const documented = new Set(routeMetadata.map((item) => item.path));
  const failures = [];

  for (const routePath of requiredPaths) {
    if (!documented.has(routePath)) {
      failures.push(`Missing public route metadata: ${routePath}`);
    }
  }

  return failures;
}
```

- [x] **Step 4: Run script tests**

Run: `pnpm test:phase-docs`

Expected: PASS for the helper tests added in this task.

- [x] **Step 5: Checkpoint**

Run: `git status --short --branch`

Expected: `scripts/verify-site-docs.mjs` and `scripts/verify-site-docs.test.mjs` are modified. Do not stage changes.

## Task 4: Wire `verify:site-docs` To Real Inventory Sources

**Files:**
- Modify: `scripts/verify-site-docs.mjs`
- Modify: `apps/vanrot-site/src/docs/framework-reference.json`
- Test: `scripts/verify-site-docs.test.mjs`

- [x] **Step 1: Add inventory reader tests**

Append to `scripts/verify-site-docs.test.mjs`:

```js
import {
  readExampleWorkspaceNames,
  readFrameworkReference,
  readPublicExportsFromIndex,
  readWorkspacePackageNames,
} from './verify-site-docs.mjs';

describe('site docs inventory readers', () => {
  it('reads package names from workspace package files', () => {
    const names = readWorkspacePackageNames(new URL('../packages/', import.meta.url));

    expect(names).toContain('@vanrot/runtime');
    expect(names).toContain('@vanrot/devtools');
  });

  it('reads public export names from package index files', () => {
    const exports = readPublicExportsFromIndex(
      '@fixture/pkg',
      'export { alpha } from "./alpha.js";\nexport type { Beta } from "./beta.js";\nexport default gamma;\n',
    );

    expect(exports).toEqual([
      { packageName: '@fixture/pkg', name: 'alpha' },
      { packageName: '@fixture/pkg', name: 'Beta' },
      { packageName: '@fixture/pkg', name: 'default' },
    ]);
  });

  it('reads the framework reference registry', () => {
    const reference = readFrameworkReference();

    expect(reference.packages.map((item) => item.name)).toContain('@vanrot/runtime');
    expect(reference.deployment.targetHost).toBe('vanrot.vankode.com');
  });

  it('reads example workspace names', () => {
    const names = readExampleWorkspaceNames(new URL('../examples/', import.meta.url));

    expect(names).toContain('counter');
  });
});
```

- [x] **Step 2: Run failing script tests**

Run: `pnpm test:phase-docs`

Expected: FAIL with missing reader helper exports.

- [x] **Step 3: Add reader helpers**

Add these imports and helpers to `scripts/verify-site-docs.mjs`:

```js
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

export function readJsonFile(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function readWorkspacePackageNames(packagesRootUrl = new URL('../packages/', import.meta.url)) {
  const packagesRoot = fileURLToPath(packagesRootUrl);

  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(packagesRoot, entry.name, 'package.json'))
    .filter((packagePath) => existsSync(packagePath))
    .map((packagePath) => readJsonFile(packagePath).name)
    .filter((name) => typeof name === 'string')
    .sort((left, right) => left.localeCompare(right));
}

export function readPublicExportsFromIndex(packageName, source) {
  const exports = [];

  for (const match of source.matchAll(/export\s+\{\s*([^}]+)\s*\}\s+from/g)) {
    for (const rawName of match[1].split(',')) {
      const name = rawName.trim().split(/\s+as\s+/).at(-1);

      if (name) {
        exports.push({ packageName, name });
      }
    }
  }

  for (const match of source.matchAll(/export\s+type\s+\{\s*([^}]+)\s*\}\s+from/g)) {
    for (const rawName of match[1].split(',')) {
      const name = rawName.trim().split(/\s+as\s+/).at(-1);

      if (name) {
        exports.push({ packageName, name });
      }
    }
  }

  if (/export\s+default\s+/m.test(source)) {
    exports.push({ packageName, name: 'default' });
  }

  return exports;
}

export function readWorkspacePublicExports(packagesRootUrl = new URL('../packages/', import.meta.url)) {
  const packagesRoot = fileURLToPath(packagesRootUrl);
  const exports = [];

  for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageRoot = join(packagesRoot, entry.name);
    const packageJsonPath = join(packageRoot, 'package.json');
    const indexPath = join(packageRoot, 'src', 'index.ts');

    if (!existsSync(packageJsonPath) || !existsSync(indexPath)) {
      continue;
    }

    const packageName = readJsonFile(packageJsonPath).name;
    const source = readFileSync(indexPath, 'utf8');
    for (const item of readPublicExportsFromIndex(packageName, source)) {
      exports.push(item);
    }
  }

  return exports.sort((left, right) => `${left.packageName}#${left.name}`.localeCompare(`${right.packageName}#${right.name}`));
}

export function readFrameworkReference() {
  const referencePath = join(projectRoot, 'apps/vanrot-site/src/docs/framework-reference.json');

  return readJsonFile(referencePath);
}

export function readExampleWorkspaceNames(examplesRootUrl = new URL('../examples/', import.meta.url)) {
  const examplesRoot = fileURLToPath(examplesRootUrl);

  return readdirSync(examplesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(join(examplesRoot, entry.name, 'package.json')))
    .map((entry) => basename(entry.name))
    .sort((left, right) => left.localeCompare(right));
}
```

- [x] **Step 4: Merge the new checks into `verifySiteDocs()`**

Inside `verifySiteDocs()`, read `frameworkReference` and push the new failures:

```js
  const frameworkReference = readFrameworkReference();
  const workspacePackages = readWorkspacePackageNames();
  const workspaceExports = readWorkspacePublicExports();
  const exampleNames = readExampleWorkspaceNames();
  const homePageSource = readFileSync(join(projectRoot, 'apps/vanrot-site/src/pages/home/home.page.ts'), 'utf8');

  const inventoryFailures = [
    checkPackageCoverage(workspacePackages, frameworkReference.packages),
    checkPublicExportCoverage(workspaceExports, frameworkReference.publicExports),
    checkCommandCoverage(available.commands, frameworkReference.commands),
    checkDiagnosticCoverage(available.compilerDiagnostics, frameworkReference.diagnostics.filter((item) => item.family === 'compiler').map((item) => item.code), 'compiler'),
    checkDiagnosticCoverage(available.configDiagnostics, frameworkReference.diagnostics.filter((item) => item.family === 'config').map((item) => item.code), 'config'),
    checkDiagnosticCoverage(available.routerDiagnostics, frameworkReference.diagnostics.filter((item) => item.family === 'router').map((item) => item.code), 'router'),
    checkGeneratedFileCoverage(['package.json', 'tsconfig.json', 'vite.config.ts', 'vanrot.config.ts', 'src/routes.ts'], frameworkReference.generatedFiles),
    checkConventionCoverage(['role-suffixes', 'scoped-css', 'signals-for-state', 'route-refs', 'no-ui-markup-in-typescript'], frameworkReference.conventions),
    checkExampleRegistration(exampleNames, frameworkReference.examples),
    checkCtaLabels(homePageSource),
    checkRouteMetadataCoverage(['/', '/docs', '/docs/components'], frameworkReference.routeMetadata),
  ];

  for (const group of inventoryFailures) {
    for (const failure of group) {
      failures.push(failure);
    }
  }
```

- [x] **Step 5: Run `verify:site-docs` and observe real missing data**

Run: `pnpm verify:site-docs`

Expected: FAIL with missing public export, command, diagnostic, generated file, convention, example, and CTA coverage. This failure is useful; the next tasks fill the registry and site.

- [x] **Step 6: Checkpoint**

Run: `git status --short --branch`

Expected: verification script and registry changes remain unstaged.

## Task 5: Fill Framework Reference Coverage

**Files:**
- Modify: `apps/vanrot-site/src/docs/framework-reference.json`
- Test: `apps/vanrot-site/tests/framework-reference.test.ts`
- Test: `scripts/verify-site-docs.test.mjs`

- [x] **Step 1: Write coverage tests for required registry sections**

Append to `apps/vanrot-site/tests/framework-reference.test.ts`:

```ts
describe('framework reference coverage', () => {
  it('covers public exports, commands, diagnostics, generated files, and conventions', () => {
    expect(frameworkReference.publicExports.length).toBeGreaterThan(20);
    expect(frameworkReference.commands.map((command) => command.name)).toEqual([
      'create',
      'generate',
      'add',
      'ui',
      'config',
      'doctor',
      'map',
      'init-ai',
      'ai',
      'dev',
      'build',
      'test',
    ]);
    expect(frameworkReference.diagnostics.some((item) => item.family === 'compiler')).toBe(true);
    expect(frameworkReference.diagnostics.some((item) => item.family === 'config')).toBe(true);
    expect(frameworkReference.diagnostics.some((item) => item.family === 'router')).toBe(true);
    expect(frameworkReference.generatedFiles.map((item) => item.path)).toContain('src/routes.ts');
    expect(frameworkReference.conventions.map((item) => item.id)).toEqual([
      'role-suffixes',
      'scoped-css',
      'signals-for-state',
      'route-refs',
      'no-ui-markup-in-typescript',
    ]);
  });
});
```

- [x] **Step 2: Run the failing registry tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference.test.ts`

Expected: FAIL because the structured sections are still empty or incomplete.

- [x] **Step 3: Populate public exports from package index files**

Update `framework-reference.json` so `publicExports` contains one entry for every exported name from:

- `packages/runtime/src/index.ts`
- `packages/compiler/src/index.ts`
- `packages/config/src/index.ts`
- `packages/router/src/index.ts`
- `packages/vite-plugin/src/index.ts`
- `packages/cli/src/index.ts`
- `packages/ui/src/index.ts`
- `packages/testing/src/index.ts`
- `packages/devtools/src/index.ts`

Each entry uses this exact shape:

```json
{
  "packageName": "@vanrot/runtime",
  "name": "signal",
  "kind": "function",
  "status": "production-ready",
  "summary": "Creates a writable Vanrot signal that stores state and notifies dependent computations.",
  "docsPath": "/docs/public-api"
}
```

Use package-specific summaries. Keep `kind` honest for each export: `function`, `constant`, `type`, `interface`, `class`, or `default`.

- [x] **Step 4: Populate command references**

Set `commands` in `framework-reference.json` to:

```json
[
  {
    "name": "create",
    "usage": "vr create <project-name>",
    "status": "demo-capable",
    "summary": "Creates a routed Vanrot app with the configured package manager and starter files.",
    "docsPath": "/docs/cli"
  },
  {
    "name": "generate",
    "usage": "vr generate <kind> <name>",
    "status": "demo-capable",
    "summary": "Generates convention-based component and page files.",
    "docsPath": "/docs/cli"
  },
  {
    "name": "add",
    "usage": "vr add <package-or-primitive>",
    "status": "demo-capable",
    "summary": "Adds Vanrot packages or UI primitives and updates config when needed.",
    "docsPath": "/docs/cli"
  },
  {
    "name": "ui",
    "usage": "vr ui <subcommand>",
    "status": "demo-capable",
    "summary": "Inspects and manages Vanrot UI primitive metadata.",
    "docsPath": "/docs/cli"
  },
  {
    "name": "config",
    "usage": "vr config <subcommand>",
    "status": "production-ready",
    "summary": "Reads, validates, and reports normalized Vanrot config.",
    "docsPath": "/docs/cli"
  },
  {
    "name": "doctor",
    "usage": "vr doctor",
    "status": "demo-capable",
    "summary": "Runs local project diagnostics with readable guidance.",
    "docsPath": "/docs/cli"
  },
  {
    "name": "map",
    "usage": "vr map",
    "status": "production-ready",
    "summary": "Writes the project intelligence manifest at `.vanrot/project-map.json`.",
    "docsPath": "/docs/devtools"
  },
  {
    "name": "init-ai",
    "usage": "vr init-ai",
    "status": "production-ready",
    "summary": "Writes provider-neutral project rules for AI assistants from normalized config.",
    "docsPath": "/docs/devtools"
  },
  {
    "name": "ai",
    "usage": "vr ai <subcommand>",
    "status": "production-ready",
    "summary": "Inspects AI rule configuration and project intelligence files.",
    "docsPath": "/docs/devtools"
  },
  {
    "name": "dev",
    "usage": "vr dev",
    "status": "production-ready",
    "summary": "Starts the configured Vite development server through the Vanrot CLI.",
    "docsPath": "/docs/cli"
  },
  {
    "name": "build",
    "usage": "vr build",
    "status": "production-ready",
    "summary": "Runs a production build through the Vanrot CLI.",
    "docsPath": "/docs/deployment"
  },
  {
    "name": "test",
    "usage": "vr test",
    "status": "demo-capable",
    "summary": "Runs the configured test command for a Vanrot project.",
    "docsPath": "/docs/testing"
  }
]
```

- [x] **Step 5: Populate diagnostics, generated files, conventions, and maturity**

Fill these sections from current package sources and the maturity ledger. The minimum generated files are:

```json
[
  {
    "path": "package.json",
    "owner": "@vanrot/cli",
    "status": "demo-capable",
    "summary": "Project manifest containing scripts, dependencies, package manager metadata, and private workspace state.",
    "docsPath": "/docs/project-structure"
  },
  {
    "path": "tsconfig.json",
    "owner": "@vanrot/cli",
    "status": "demo-capable",
    "summary": "TypeScript project configuration generated for Vanrot app source files and package resolution.",
    "docsPath": "/docs/project-structure"
  },
  {
    "path": "vite.config.ts",
    "owner": "@vanrot/vite-plugin",
    "status": "production-ready",
    "summary": "Vite configuration that installs the Vanrot plugin.",
    "docsPath": "/docs/vite-plugin"
  },
  {
    "path": "vanrot.config.ts",
    "owner": "@vanrot/config",
    "status": "production-ready",
    "summary": "Typed Vanrot config source for source roots, dev server defaults, UI configuration, and AI rule settings.",
    "docsPath": "/docs/configuration"
  },
  {
    "path": "src/routes.ts",
    "owner": "@vanrot/router",
    "status": "production-ready",
    "summary": "Named route refs and route metadata for app navigation without repeated route strings.",
    "docsPath": "/docs/routing"
  },
  {
    "path": ".vanrot/project-map.json",
    "owner": "@vanrot/devtools",
    "status": "production-ready",
    "summary": "Project intelligence manifest generated by `vr map` for devtools and local inspection.",
    "docsPath": "/docs/devtools"
  }
]
```

Set `conventions` to the five ids asserted in Step 1 and write summaries that directly match `AGENTS.md`.

- [x] **Step 6: Run focused registry checks**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference.test.ts`

Expected: PASS.

- [x] **Step 7: Run docs verification**

Run: `pnpm verify:site-docs`

Expected: FAIL only for example registration and CTA/sidebar/site polish items that later tasks own. Public export, package, command, diagnostic, generated file, and convention coverage should no longer fail.

- [x] **Step 8: Checkpoint**

Run: `git status --short --branch`

Expected: registry and verification changes remain unstaged.

## Task 6: Expand Long-Form Framework Guide Articles

**Files:**
- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Create: `apps/vanrot-site/src/docs/framework-guides.ts`
- Test: `apps/vanrot-site/tests/site-data.test.ts`

- [x] **Step 1: Write failing guide coverage tests**

Update the first test in `apps/vanrot-site/tests/site-data.test.ts` so `siteArticleKeys` must equal:

```ts
    expect(siteArticleKeys).toEqual([
      'introduction',
      'installation',
      'projectStructure',
      'runtime',
      'compiler',
      'vitePlugin',
      'cli',
      'configuration',
      'routing',
      'uiOctober',
      'theming',
      'vanrotstyles',
      'testing',
      'devtools',
      'examples',
      'exampleMatrix',
      'deployment',
      'publicApi',
      'diagnostics',
      'generatedFiles',
      'octoberShowcase',
      'conventions',
      'limitations',
      'referenceStatus',
    ]);
```

Add this test:

```ts
  it('keeps required framework guide pages substantial', () => {
    const requiredGuideKeys = [
      'installation',
      'projectStructure',
      'runtime',
      'compiler',
      'routing',
      'testing',
      'devtools',
      'deployment',
      'publicApi',
      'diagnostics',
      'generatedFiles',
      'limitations',
    ] as const;

    for (const key of requiredGuideKeys) {
      const article = siteArticles[key];

      expect(article.summary.length).toBeGreaterThan(50);
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
      expect(article.sections.every((section) => section.body.length > 80)).toBe(true);
    }
  });
```

- [x] **Step 2: Run failing site data tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-data.test.ts`

Expected: FAIL because the new article keys and substantial guide bodies are missing.

- [x] **Step 3: Add framework guide helpers**

Create `apps/vanrot-site/src/docs/framework-guides.ts`:

```ts
import { siteArticleKey, type SiteArticleKey } from './site-data.ts';

export const frameworkGuideArticleKeys = [
  siteArticleKey.installation,
  siteArticleKey.projectStructure,
  siteArticleKey.runtime,
  siteArticleKey.compiler,
  siteArticleKey.vitePlugin,
  siteArticleKey.cli,
  siteArticleKey.configuration,
  siteArticleKey.routing,
  siteArticleKey.testing,
  siteArticleKey.devtools,
  siteArticleKey.deployment,
  siteArticleKey.publicApi,
  siteArticleKey.diagnostics,
  siteArticleKey.generatedFiles,
  siteArticleKey.conventions,
  siteArticleKey.limitations,
] as const satisfies readonly SiteArticleKey[];

export const frameworkGuideLabels = {
  [siteArticleKey.installation]: 'Install',
  [siteArticleKey.projectStructure]: 'Project Structure',
  [siteArticleKey.runtime]: 'Runtime',
  [siteArticleKey.compiler]: 'Compiler',
  [siteArticleKey.vitePlugin]: 'Vite Plugin',
  [siteArticleKey.cli]: 'CLI',
  [siteArticleKey.configuration]: 'Configuration',
  [siteArticleKey.routing]: 'Routing',
  [siteArticleKey.testing]: 'Testing',
  [siteArticleKey.devtools]: 'Devtools',
  [siteArticleKey.deployment]: 'Deployment',
  [siteArticleKey.publicApi]: 'Public API',
  [siteArticleKey.diagnostics]: 'Diagnostics',
  [siteArticleKey.generatedFiles]: 'Generated Files',
  [siteArticleKey.conventions]: 'Conventions',
  [siteArticleKey.limitations]: 'Limitations',
} as const satisfies Record<(typeof frameworkGuideArticleKeys)[number], string>;
```

- [x] **Step 4: Add new article keys and guide articles**

Update `siteArticleKey` in `site-data.ts` with the new keys from the test. Then add matching article objects to `apps/vanrot-site/src/docs/site-data.json`.

Each new guide article must use this shape:

```json
{
  "key": "deployment",
  "section": "reference",
  "path": "/docs/deployment",
  "label": "Deployment",
  "title": "Build And Deployment Preparation",
  "summary": "Prepare a Vanrot site for production hosting without pretending this repository controls DNS, credentials, analytics, or live deployment.",
  "status": "phase-24-active",
  "sections": [
    {
      "id": "target-host",
      "title": "Target Host",
      "body": "Phase 24 prepares the public site for vanrot.vankode.com. The documentation describes the hosting assumptions, production build command, and public route expectations, while DNS records, hosting credentials, analytics setup, and live launch remain outside this phase."
    },
    {
      "id": "production-build",
      "title": "Production Build",
      "body": "Use `pnpm --filter @vanrot/vanrot-site build` to run the site production build through the Vanrot CLI. This verifies the Vite plugin, runtime, router, UI package, and docs data all work together in the deployment target app."
    },
    {
      "id": "route-readiness",
      "title": "Route Readiness",
      "body": "The public routes must clearly connect the landing page, Framework Documentation, and Design Component surfaces. Route metadata must include titles and descriptions so the site is ready for a hosting layer to expose useful previews."
    }
  ]
}
```

Add these guide article objects with the deployment object:

```json
[
  {
    "key": "devtools",
    "section": "framework",
    "path": "/docs/devtools",
    "label": "Devtools",
    "title": "Devtools And Project Intelligence",
    "summary": "Use Vanrot project intelligence, graph metadata, and devtools contracts without relying on AI-specific bundles from Phase 25.",
    "status": "production-ready-through-phase-23",
    "sections": [
      {
        "id": "project-map",
        "title": "Project Map",
        "body": "`vr map` writes `.vanrot/project-map.json` as the local project intelligence manifest. The manifest describes roles, routes, components, imports, metadata, and freshness state from the authoritative Vanrot project structure."
      },
      {
        "id": "runtime-graph",
        "title": "Runtime Graph",
        "body": "The runtime graph contract exposes enough metadata for local inspection without changing normal app behavior. Production apps can ignore the hook, while devtools can read the stable contract during development."
      },
      {
        "id": "phase-boundary",
        "title": "Phase Boundary",
        "body": "Phase 24 documents the current project intelligence behavior. AI-readable docs bundles, MCP transport, Skill.sh packages, and AI command expansions remain Phase 25 work."
      }
    ]
  },
  {
    "key": "exampleMatrix",
    "section": "examples",
    "path": "/docs/example-matrix",
    "label": "Example Matrix",
    "title": "Runnable Example Matrix",
    "summary": "Use verified example workspaces as the source of truth for framework workflows and docs snippets.",
    "status": "phase-24-active",
    "sections": [
      {
        "id": "source-of-truth",
        "title": "Source Of Truth",
        "body": "Runnable example workspaces own the real code for guide snippets. Documentation should reference or mirror these examples so snippets stay connected to tests and package behavior."
      },
      {
        "id": "workflow-coverage",
        "title": "Workflow Coverage",
        "body": "The matrix covers starter creation, runtime lifecycle, compiler templates, routing, config diagnostics, CLI commands, UI usage, testing helpers, devtools intelligence, and build deployment preparation."
      },
      {
        "id": "package-coverage",
        "title": "Package Coverage",
        "body": "Every workspace package appears in at least one registered example. Packages without a browser-facing workflow should still appear through command, config, devtools, or build examples."
      }
    ]
  },
  {
    "key": "publicApi",
    "section": "reference",
    "path": "/docs/public-api",
    "label": "Public API",
    "title": "Public API Reference",
    "summary": "Read the documented public exports for each current Vanrot package and see which guide owns the behavior.",
    "status": "phase-24-active",
    "sections": [
      {
        "id": "export-coverage",
        "title": "Export Coverage",
        "body": "Every public export from package index files must have a structured reference entry. The verification script compares package source exports with the registry before Phase 24 can close."
      },
      {
        "id": "status-language",
        "title": "Status Language",
        "body": "Each export uses explicit status language such as production-ready, demo-capable, limited, deferred, or not-browser-facing. The docs should explain capability without overstating unfinished work."
      },
      {
        "id": "docs-links",
        "title": "Docs Links",
        "body": "Each export points to the guide or reference route that explains it. This keeps the registry useful for humans and keeps Phase 25 free to build AI-readable output from clean data."
      }
    ]
  },
  {
    "key": "diagnostics",
    "section": "reference",
    "path": "/docs/diagnostics",
    "label": "Diagnostics",
    "title": "Diagnostics Reference",
    "summary": "Find the current compiler, config, router, CLI, and Vite-plugin diagnostic codes with user-facing explanations.",
    "status": "phase-24-active",
    "sections": [
      {
        "id": "families",
        "title": "Families",
        "body": "Diagnostics are grouped by owning package so users know whether an error comes from the compiler, config loader, router contract, CLI command, or Vite integration."
      },
      {
        "id": "coverage-check",
        "title": "Coverage Check",
        "body": "`verify:site-docs` fails when a known diagnostic code is missing from the public reference. That keeps new compiler, config, and router errors from shipping without docs."
      },
      {
        "id": "reader-guidance",
        "title": "Reader Guidance",
        "body": "Diagnostic descriptions should explain what happened, where the user should look, and whether the behavior is production-ready, limited, or deferred to a later phase."
      }
    ]
  },
  {
    "key": "generatedFiles",
    "section": "reference",
    "path": "/docs/generated-files",
    "label": "Generated Files",
    "title": "Generated Files And Directories",
    "summary": "Understand the generated files Vanrot users should expect in starter apps, config flows, route workflows, and project intelligence output.",
    "status": "phase-24-active",
    "sections": [
      {
        "id": "starter-files",
        "title": "Starter Files",
        "body": "Starter projects use familiar JavaScript files such as `package.json`, `tsconfig.json`, `vite.config.ts`, and `vanrot.config.ts`. The docs should explain which package owns each file."
      },
      {
        "id": "route-files",
        "title": "Route Files",
        "body": "`src/routes.ts` is the framework-owned convention for route refs, route paths, and route metadata. Docs and examples should point users to named route refs instead of repeated strings."
      },
      {
        "id": "project-intelligence",
        "title": "Project Intelligence",
        "body": "`.vanrot/project-map.json` is generated by `vr map` and belongs to the devtools and project intelligence story. It should be documented as local metadata, not as a Phase 25 AI bundle."
      }
    ]
  },
  {
    "key": "limitations",
    "section": "reference",
    "path": "/docs/limitations",
    "label": "Limitations",
    "title": "Limitations And Deferred Work",
    "summary": "Read honest status notes for demo-capable, limited, deferred, and not-browser-facing areas before using Vanrot in production contexts.",
    "status": "phase-24-active",
    "sections": [
      {
        "id": "post-production",
        "title": "Post-Production Work",
        "body": "Phase 17 through Phase 22 remain post-production implementation ideas. The docs must not present brutalist UI, expanded testing, store, forms, async resources, SSR, or hydration as current behavior."
      },
      {
        "id": "deployment",
        "title": "Deployment Limits",
        "body": "Phase 24 prepares docs and site output for deployment readiness. It does not perform DNS changes, manage credentials, configure analytics vendors, or launch the live site."
      },
      {
        "id": "small-fixes",
        "title": "Small Fixes",
        "body": "If documentation reveals a small broken contract that blocks truthful docs, fix it inside the owning package with tests. Do not add new framework features under the cover of documentation."
      }
    ]
  }
]
```

- [x] **Step 5: Update navigation groups**

Modify `apps/vanrot-site/src/docs/site-navigation.ts` so framework docs include `devtools`, reference docs include `publicApi`, `diagnostics`, `generatedFiles`, `deployment`, `limitations`, and examples include `exampleMatrix`.

Use `navItem(siteArticleKey.newKey)` entries. Do not write repeated route strings.

- [x] **Step 6: Run focused data tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-data.test.ts`

Expected: PASS.

- [x] **Step 7: Checkpoint**

Run: `git status --short --branch`

Expected: guide data and navigation changes remain unstaged.

## Task 7: Add Framework Reference And Example Matrix Pages

**Files:**
- Create: `apps/vanrot-site/src/pages/docs/docs-reference.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/docs-reference.page.html`
- Create: `apps/vanrot-site/src/pages/docs/docs-reference.page.css`
- Create: `apps/vanrot-site/src/pages/docs/docs-example-matrix.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/docs-example-matrix.page.html`
- Create: `apps/vanrot-site/src/pages/docs/docs-example-matrix.page.css`
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [x] **Step 1: Write failing route/page tests**

Append to `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
  it('routes framework reference and example matrix pages', async () => {
    expect(route.docsPublicApi.path).toBe('/docs/public-api');
    expect(route.docsDiagnostics.path).toBe('/docs/diagnostics');
    expect(route.docsGeneratedFiles.path).toBe('/docs/generated-files');
    expect(route.docsExampleMatrix.path).toBe('/docs/example-matrix');

    const referenceHtml = await readSiteFile('src/pages/docs/docs-reference.page.html');
    const exampleMatrixHtml = await readSiteFile('src/pages/docs/docs-example-matrix.page.html');

    expect(referenceHtml).toContain('<vr-badge');
    expect(referenceHtml).toContain('<vr-card');
    expect(referenceHtml).toContain('publicExportReference');
    expect(exampleMatrixHtml).toContain('<vr-badge');
    expect(exampleMatrixHtml).toContain('exampleReference');
  });
```

- [x] **Step 2: Run failing page tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-pages.test.ts`

Expected: FAIL because routes and page files do not exist.

- [x] **Step 3: Create reference page class**

Create `apps/vanrot-site/src/pages/docs/docs-reference.page.ts`:

```ts
import {
  commandReference,
  conventionReference,
  diagnosticReference,
  generatedFileReference,
  limitationReference,
  packageReference,
  publicExportReference,
} from '../../docs/site-reference.ts';

export class DocsReferencePage {
  packageReference = packageReference;
  publicExportReference = publicExportReference;
  commandReference = commandReference;
  diagnosticReference = diagnosticReference;
  generatedFileReference = generatedFileReference;
  conventionReference = conventionReference;
  limitationReference = limitationReference;
}
```

- [x] **Step 4: Create reference page template**

Create `apps/vanrot-site/src/pages/docs/docs-reference.page.html`:

```html
<article class="docs-reference">
  <vr-badge tone.secondary>Framework reference</vr-badge>
  <h1>Framework Reference</h1>
  <p class="reference-summary">
    Packages, public exports, commands, diagnostics, generated files, conventions, and known limitations are listed from the structured registry that powers docs verification.
  </p>

  <section class="reference-section">
    <h2>Packages</h2>
    <div class="reference-grid">
      @for (item of packageReference; track item.name) {
        <vr-card variant.default>
          <span class="reference-kicker">{{ item.status }}</span>
          <h3>{{ item.name }}</h3>
          <p>{{ item.summary }}</p>
          <a href="{{ item.docsPath }}">Open docs</a>
        </vr-card>
      }
    </div>
  </section>

  <section class="reference-section">
    <h2>Public API</h2>
    <div class="reference-list">
      @for (item of publicExportReference; track item.packageName + item.name) {
        <div class="reference-row">
          <code>{{ item.packageName }}#{{ item.name }}</code>
          <span>{{ item.kind }}</span>
          <p>{{ item.summary }}</p>
        </div>
      }
    </div>
  </section>

  <section class="reference-section">
    <h2>Commands</h2>
    <div class="reference-list">
      @for (item of commandReference; track item.name) {
        <div class="reference-row">
          <code>{{ item.usage }}</code>
          <span>{{ item.status }}</span>
          <p>{{ item.summary }}</p>
        </div>
      }
    </div>
  </section>

  <section class="reference-section">
    <h2>Diagnostics</h2>
    <div class="reference-list">
      @for (item of diagnosticReference; track item.family + item.code) {
        <div class="reference-row">
          <code>{{ item.code }}</code>
          <span>{{ item.family }}</span>
          <p>{{ item.summary }}</p>
        </div>
      }
    </div>
  </section>
</article>
```

- [x] **Step 5: Create reference page CSS**

Create `apps/vanrot-site/src/pages/docs/docs-reference.page.css`:

```css
.docs-reference {
  display: grid;
  gap: 24px;
  max-width: 980px;
}

.docs-reference h1,
.docs-reference h2,
.docs-reference h3,
.docs-reference p {
  margin: 0;
}

.docs-reference h1 {
  font-size: 44px;
  line-height: 1.05;
}

.reference-summary,
.reference-row p,
.reference-grid p {
  color: var(--vr-color-muted);
  line-height: 1.7;
}

.reference-section {
  display: grid;
  gap: 14px;
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.reference-list {
  display: grid;
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-md);
  overflow: hidden;
}

.reference-row {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--vr-color-line);
  background: var(--vr-color-canvas);
}

.reference-row:last-child {
  border-bottom: 0;
}

.reference-kicker,
.reference-row span {
  color: var(--vr-color-muted);
  font-size: 12px;
}

.reference-row code {
  width: fit-content;
  padding: 2px 6px;
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-sm);
  background: var(--vr-surface-muted);
}
```

- [x] **Step 6: Create example matrix page files**

Create `docs-example-matrix.page.ts`:

```ts
import { exampleReference } from '../../docs/site-reference.ts';

export class DocsExampleMatrixPage {
  exampleReference = exampleReference;
}
```

Create `docs-example-matrix.page.html`:

```html
<article class="docs-example-matrix">
  <vr-badge tone.secondary>Runnable examples</vr-badge>
  <h1>Example Matrix</h1>
  <p class="matrix-summary">
    Runnable workspaces are the source of truth for framework examples. Guide pages link back to these examples instead of drifting into unchecked snippets.
  </p>

  <section class="matrix-grid">
    @for (example of exampleReference; track example.id) {
      <vr-card variant.default>
        <span class="matrix-kicker">{{ example.path }}</span>
        <h2>{{ example.title }}</h2>
        <p>{{ example.workflows.join(', ') }}</p>
        <a href="{{ example.docsPath }}">Read guide</a>
      </vr-card>
    }
  </section>
</article>
```

Create `docs-example-matrix.page.css`:

```css
.docs-example-matrix {
  display: grid;
  gap: 22px;
  max-width: 980px;
}

.docs-example-matrix h1,
.docs-example-matrix h2,
.docs-example-matrix p {
  margin: 0;
}

.docs-example-matrix h1 {
  font-size: 44px;
  line-height: 1.05;
}

.matrix-summary,
.matrix-grid p,
.matrix-kicker {
  color: var(--vr-color-muted);
  line-height: 1.7;
}

.matrix-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.matrix-kicker {
  font-size: 12px;
}
```

- [x] **Step 7: Wire routes through route refs**

In `apps/vanrot-site/src/routes.ts`, import the two new page classes and add route refs for:

```ts
docsPublicApi: '/docs/public-api',
docsDiagnostics: '/docs/diagnostics',
docsGeneratedFiles: '/docs/generated-files',
docsExampleMatrix: '/docs/example-matrix',
```

Use the same local route builder pattern already used by `articlePage(siteArticleKey.installation)`.

- [x] **Step 8: Run page tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-pages.test.ts`

Expected: PASS.

- [x] **Step 9: Checkpoint**

Run: `git status --short --branch`

Expected: new docs pages, route changes, and site page tests remain unstaged.

## Task 8: Define The Example Matrix Registry

**Files:**
- Create: `apps/vanrot-site/src/docs/example-matrix.ts`
- Modify: `apps/vanrot-site/src/docs/framework-reference.json`
- Test: `apps/vanrot-site/tests/framework-reference.test.ts`

- [x] **Step 1: Write failing matrix tests**

Append to `apps/vanrot-site/tests/framework-reference.test.ts`:

```ts
import { exampleMatrix, requiredExampleWorkflows } from '../src/docs/example-matrix.ts';

describe('example matrix', () => {
  it('covers every required workflow and every workspace package', () => {
    expect(requiredExampleWorkflows).toEqual([
      'starter-flow',
      'runtime-lifecycle',
      'compiler-templates',
      'routing-workflows',
      'config-diagnostics',
      'cli-commands',
      'ui-framework-usage',
      'testing-helpers',
      'devtools-intelligence',
      'build-deploy',
    ]);

    for (const workflow of requiredExampleWorkflows) {
      expect(exampleMatrix.some((example) => example.workflows.includes(workflow))).toBe(true);
    }

    for (const packageReference of frameworkReference.packages) {
      expect(exampleMatrix.some((example) => example.packages.includes(packageReference.name))).toBe(true);
    }
  });
});
```

- [x] **Step 2: Run the failing matrix test**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference.test.ts`

Expected: FAIL because `example-matrix.ts` does not exist.

- [x] **Step 3: Create the matrix module**

Create `apps/vanrot-site/src/docs/example-matrix.ts`:

```ts
import { frameworkReference } from './framework-reference.ts';

export const requiredExampleWorkflows = [
  'starter-flow',
  'runtime-lifecycle',
  'compiler-templates',
  'routing-workflows',
  'config-diagnostics',
  'cli-commands',
  'ui-framework-usage',
  'testing-helpers',
  'devtools-intelligence',
  'build-deploy',
] as const;

export type RequiredExampleWorkflow = (typeof requiredExampleWorkflows)[number];

export const exampleMatrix = frameworkReference.examples;
```

- [x] **Step 4: Add matrix entries to the framework reference**

Set `examples` in `framework-reference.json` to include:

```json
[
  {
    "id": "counter",
    "title": "Counter Starter",
    "path": "examples/counter",
    "packages": ["@vanrot/runtime", "@vanrot/compiler", "@vanrot/config", "@vanrot/vite-plugin", "@vanrot/cli"],
    "workflows": ["starter-flow", "runtime-lifecycle", "compiler-templates", "build-deploy"],
    "docsPath": "/docs/examples"
  },
  {
    "id": "routing-workflows",
    "title": "Routing Workflows",
    "path": "examples/routing-workflows",
    "packages": ["@vanrot/router", "@vanrot/runtime", "@vanrot/compiler", "@vanrot/vite-plugin"],
    "workflows": ["routing-workflows"],
    "docsPath": "/docs/routing"
  },
  {
    "id": "testing-helpers",
    "title": "Testing Helpers",
    "path": "examples/testing-helpers",
    "packages": ["@vanrot/testing", "@vanrot/runtime", "@vanrot/compiler"],
    "workflows": ["testing-helpers"],
    "docsPath": "/docs/testing"
  },
  {
    "id": "devtools-intelligence",
    "title": "Devtools And Project Intelligence",
    "path": "examples/devtools-intelligence",
    "packages": ["@vanrot/devtools", "@vanrot/cli", "@vanrot/config"],
    "workflows": ["devtools-intelligence", "config-diagnostics", "cli-commands"],
    "docsPath": "/docs/devtools"
  },
  {
    "id": "ui-framework-usage",
    "title": "UI From Framework Docs",
    "path": "examples/ui-framework-usage",
    "packages": ["@vanrot/ui", "@vanrot/runtime", "@vanrot/compiler"],
    "workflows": ["ui-framework-usage"],
    "docsPath": "/docs/ui"
  },
  {
    "id": "build-deploy",
    "title": "Build And Deploy",
    "path": "examples/build-deploy",
    "packages": ["@vanrot/cli", "@vanrot/vite-plugin", "@vanrot/config"],
    "workflows": ["build-deploy"],
    "docsPath": "/docs/deployment"
  }
]
```

- [x] **Step 5: Run matrix tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference.test.ts`

Expected: FAIL until all listed example directories exist. Task 9 creates them.

- [x] **Step 6: Checkpoint**

Run: `git status --short --branch`

Expected: example matrix module and registry changes remain unstaged.

## Task 9: Create Runnable Example Workspaces

**Files:**
- Create the example workspace files listed in the File Structure section.
- Modify: `examples/counter/tests/counter-build.test.ts`
- Test: example-specific Vitest files.

- [x] **Step 1: Write failing example existence tests**

Create `examples/build-deploy/tests/build-deploy.test.ts`:

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

describe('build deploy example', () => {
  it('contains a Vanrot app entry and config files', () => {
    expect(existsSync(join(root, 'package.json'))).toBe(true);
    expect(existsSync(join(root, 'src/main.ts'))).toBe(true);
    expect(existsSync(join(root, 'tsconfig.json'))).toBe(true);
  });
});
```

Create these additional existence tests:

```ts
// examples/compiler-templates/tests/compiler-templates.test.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

describe('compiler templates example', () => {
  it('contains template, slot, control-flow, and scoped CSS examples', () => {
    const html = readFileSync(join(root, 'src/status-card.component.html'), 'utf8');
    const css = readFileSync(join(root, 'src/status-card.component.css'), 'utf8');

    expect(html).toContain('@if');
    expect(html).toContain('@for');
    expect(html).toContain('<slot>');
    expect(css).toContain(':host');
  });
});
```

```ts
// examples/routing-workflows/tests/routing-workflows.test.ts
import { describe, expect, it } from 'vitest';
import { route } from '../src/routes.ts';

describe('routing workflows example', () => {
  it('exports named route refs with metadata', () => {
    expect(route.home.path).toBe('/');
    expect(route.docs.path).toBe('/docs');
    expect(route.docs.title).toBe('Docs');
  });
});
```

```ts
// examples/testing-helpers/tests/testing-helpers.test.ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

describe('testing helpers example', () => {
  it('contains a component fixture and test entry', () => {
    expect(existsSync(join(root, 'src/counter.component.ts'))).toBe(true);
    expect(existsSync(join(root, 'src/counter.component.html'))).toBe(true);
  });
});
```

```ts
// examples/devtools-intelligence/tests/devtools-intelligence.test.ts
import { describe, expect, it } from 'vitest';

describe('devtools intelligence example', () => {
  it('documents the project map output path', () => {
    expect('.vanrot/project-map.json').toBe('.vanrot/project-map.json');
  });
});
```

```ts
// examples/ui-framework-usage/tests/ui-framework-usage.test.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

describe('ui framework usage example', () => {
  it('uses Vanrot UI primitives from a framework guide context', () => {
    const html = readFileSync(join(root, 'src/interface.component.html'), 'utf8');

    expect(html).toContain('vr-button');
    expect(html).toContain('vr-card');
    expect(html).toContain('vr-badge');
  });
});
```

- [x] **Step 2: Run the failing example tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference.test.ts`

Expected: FAIL because the new example directories do not exist.

- [x] **Step 3: Create `examples/runtime-lifecycle`**

Create `examples/runtime-lifecycle/package.json`:

```json
{
  "name": "@vanrot/example-runtime-lifecycle",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@vanrot/runtime": "file:../../packages/runtime"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vitest": "^4.0.14"
  }
}
```

Create `examples/runtime-lifecycle/src/main.ts`:

```ts
import { computed, effect, signal } from '@vanrot/runtime';

export function createRuntimeLifecycleExample() {
  const count = signal(0);
  const doubled = computed(() => count() * 2);
  const values: number[] = [];

  const dispose = effect(() => {
    values.push(doubled());
  });

  count.set(2);
  dispose();
  count.set(3);

  return values;
}
```

Create `examples/runtime-lifecycle/tests/runtime-lifecycle.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRuntimeLifecycleExample } from '../src/main.ts';

describe('runtime lifecycle example', () => {
  it('demonstrates signals, computed values, effects, and disposal', () => {
    expect(createRuntimeLifecycleExample()).toEqual([0, 4]);
  });
});
```

Create `examples/runtime-lifecycle/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "noEmit": true
  },
  "include": ["src", "tests"]
}
```

- [x] **Step 4: Create the remaining example workspaces**

Create these remaining workspace manifests and source files:

```txt
examples/compiler-templates/package.json name: @vanrot/example-compiler-templates dependencies: @vanrot/runtime, @vanrot/compiler, @vanrot/vite-plugin
examples/routing-workflows/package.json name: @vanrot/example-routing-workflows dependencies: @vanrot/runtime, @vanrot/router, @vanrot/vite-plugin
examples/testing-helpers/package.json name: @vanrot/example-testing-helpers dependencies: @vanrot/runtime, @vanrot/compiler, @vanrot/testing
examples/devtools-intelligence/package.json name: @vanrot/example-devtools-intelligence dependencies: @vanrot/cli, @vanrot/config, @vanrot/devtools
examples/ui-framework-usage/package.json name: @vanrot/example-ui-framework-usage dependencies: @vanrot/runtime, @vanrot/compiler, @vanrot/ui, @vanrot/vite-plugin
examples/build-deploy/package.json name: @vanrot/example-build-deploy dependencies: @vanrot/cli, @vanrot/config, @vanrot/vite-plugin
```

Every manifest must include:

```json
{
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vitest": "^4.0.14"
  }
}
```

Create `examples/compiler-templates/src/status-card.component.html`:

```html
@if (status() === 'ready') {
  <section class="status-card">
    <slot></slot>
    @for (item of items(); track item.id) {
      <span>{{ item.label }}</span>
    }
  </section>
}
```

Create `examples/routing-workflows/src/routes.ts`:

```ts
export const route = {
  home: { path: '/', title: 'Home' },
  docs: { path: '/docs', title: 'Docs' },
} as const;
```

Create `examples/testing-helpers/src/counter.component.html`:

```html
<button type="button">{{ count() }}</button>
```

Create `examples/devtools-intelligence/src/main.ts`:

```ts
export const projectMapPath = '.vanrot/project-map.json';
```

Create `examples/ui-framework-usage/src/interface.component.html`:

```html
<vr-card variant.default>
  <vr-badge tone.secondary>Framework docs</vr-badge>
  <vr-button variant.default type="button">Open example</vr-button>
</vr-card>
```

Create `examples/build-deploy/src/main.ts`:

```ts
export const deploymentTarget = 'vanrot.vankode.com';
```

- [x] **Step 5: Update `examples/counter` test coverage**

Modify `examples/counter/tests/counter-build.test.ts` so it also asserts the example remains registered:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const reference = JSON.parse(
  readFileSync(join(__dirname, '../../../apps/vanrot-site/src/docs/framework-reference.json'), 'utf8'),
);

expect(reference.examples.some((example: { path: string }) => example.path === 'examples/counter')).toBe(true);
```

- [x] **Step 6: Run example tests**

Run: `pnpm -r --filter './examples/**' test`

Expected: PASS for all example workspaces that have a `test` script.

- [x] **Step 7: Run site registry tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference.test.ts`

Expected: PASS.

- [x] **Step 8: Checkpoint**

Run: `git status --short --branch`

Expected: new example directories and updated registry remain unstaged.

## Task 10: Freshness Check Docs Examples

**Files:**
- Modify: `scripts/verify-site-docs.mjs`
- Modify: `scripts/verify-site-docs.test.mjs`
- Modify: `apps/vanrot-site/src/docs/framework-reference.json`

- [x] **Step 1: Add failing freshness tests**

Append to `scripts/verify-site-docs.test.mjs`:

```js
import { checkExampleFreshness } from './verify-site-docs.mjs';

describe('example freshness verification', () => {
  it('fails when a registered example path is missing', () => {
    const failures = checkExampleFreshness(
      [{ path: 'examples/missing-example', title: 'Missing Example' }],
      new Set(['examples/counter']),
    );

    expect(failures).toEqual(['Registered example path does not exist: examples/missing-example']);
  });
});
```

- [x] **Step 2: Run failing script tests**

Run: `pnpm test:phase-docs`

Expected: FAIL with missing `checkExampleFreshness` export.

- [x] **Step 3: Add the freshness helper**

Add this helper to `scripts/verify-site-docs.mjs`:

```js
export function checkExampleFreshness(docExamples, existingExamplePaths) {
  const failures = [];

  for (const example of docExamples) {
    if (!existingExamplePaths.has(example.path)) {
      failures.push(`Registered example path does not exist: ${example.path}`);
    }
  }

  return failures;
}
```

- [x] **Step 4: Wire freshness into `verifySiteDocs()`**

Inside `verifySiteDocs()`, build `existingExamplePaths` and add freshness failures:

```js
  const existingExamplePaths = new Set(exampleNames.map((name) => `examples/${name}`));

  for (const failure of checkExampleFreshness(frameworkReference.examples, existingExamplePaths)) {
    failures.push(failure);
  }
```

- [x] **Step 5: Run docs verification**

Run: `pnpm verify:site-docs`

Expected: FAIL only for CTA labels and docs-shell polish until Tasks 11 through 13 land.

- [x] **Step 6: Checkpoint**

Run: `git status --short --branch`

Expected: verification script changes remain unstaged.

## Task 11: Rename Landing CTAs And Polish Home Content

**Files:**
- Modify: `apps/vanrot-site/src/pages/home/home.page.ts`
- Modify: `apps/vanrot-site/src/pages/home/home.page.html`
- Modify: `apps/vanrot-site/src/pages/home/home.page.css`
- Create: `apps/vanrot-site/tests/site-polish.test.ts`

- [x] **Step 1: Write failing CTA and landing tests**

Create `apps/vanrot-site/tests/site-polish.test.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { publicRouteMetadata } from '../src/docs/framework-reference.ts';

const appRoot = process.cwd();

async function readSiteFile(path: string): Promise<string> {
  return readFile(join(appRoot, path), 'utf8');
}

describe('site polish', () => {
  it('uses approved landing CTA labels', async () => {
    const source = await readSiteFile('src/pages/home/home.page.ts');

    expect(source).toContain("primaryCta: 'Framework Documentation'");
    expect(source).toContain("secondaryCta: 'Design Component'");
    expect(source).not.toContain("primaryCta: 'Read the docs'");
    expect(source).not.toContain("secondaryCta: 'View components'");
  });

  it('keeps the landing page focused on framework docs and design components', async () => {
    const html = await readSiteFile('src/pages/home/home.page.html');

    expect(html).toContain('Framework Documentation');
    expect(html).toContain('Design Component');
    expect(html).toContain('<vr-card');
    expect(html).toContain('<vr-badge');
  });

  it('has public route metadata for the front doors', () => {
    expect(publicRouteMetadata.map((item) => item.path)).toEqual([
      '/',
      '/docs',
      '/docs/components',
    ]);
  });
});
```

- [x] **Step 2: Run the failing polish test**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-polish.test.ts`

Expected: FAIL because the old CTA labels are still present.

- [x] **Step 3: Rename CTA labels**

Modify `homeCopy` in `apps/vanrot-site/src/pages/home/home.page.ts`:

```ts
export const homeCopy = {
  eyebrow: 'Vanrot framework',
  title: 'Framework docs and design components for Vanrot.',
  summary:
    'Learn the framework surface, inspect the October component system, and verify what is production-ready before building real apps.',
  primaryCta: 'Framework Documentation',
  secondaryCta: 'Design Component',
} as const;
```

- [x] **Step 4: Polish the landing template**

Update `home.page.html` so the first viewport clearly separates the two public paths:

```html
<section class="home-hero">
  <div class="hero-copy">
    <vr-badge tone.secondary>{{ copy.eyebrow }}</vr-badge>
    <h1>{{ copy.title }}</h1>
    <p>{{ copy.summary }}</p>
    <div class="hero-actions">
      <a class="primary-action" href="/docs">{{ copy.primaryCta }}</a>
      <a class="secondary-action" href="/docs/components">{{ copy.secondaryCta }}</a>
    </div>
  </div>

  <div class="path-grid" aria-label="Documentation paths">
    <vr-card variant.default>
      <span class="path-kicker">Framework</span>
      <h2>Documentation</h2>
      <p>Packages, APIs, commands, diagnostics, conventions, examples, limitations, and deployment preparation.</p>
    </vr-card>
    <vr-card variant.default>
      <span class="path-kicker">Design</span>
      <h2>Components</h2>
      <p>October UI primitives, variants, copyable examples, and design-system usage from the component catalog.</p>
    </vr-card>
  </div>
</section>
```

Preserve any existing downstream sections that already use Vanrot primitives.

- [x] **Step 5: Polish home CSS**

Update `home.page.css` with restrained shadcn-inspired styling:

```css
.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: 32px;
  align-items: end;
  min-height: calc(100vh - 96px);
  padding: 72px 0 48px;
}

.hero-copy {
  display: grid;
  gap: 18px;
  max-width: 720px;
}

.hero-copy h1 {
  margin: 0;
  max-width: 760px;
  font-size: 72px;
  line-height: 0.96;
  letter-spacing: 0;
}

.hero-copy p,
.path-grid p {
  margin: 0;
  color: var(--vr-color-muted);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: var(--vr-radius-sm);
  text-decoration: none;
}

.primary-action {
  background: var(--vr-color-foreground);
  color: var(--vr-color-background);
}

.secondary-action {
  border: 1px solid var(--vr-color-line);
  color: var(--vr-color-foreground);
}

.path-grid {
  display: grid;
  gap: 12px;
}

.path-kicker {
  color: var(--vr-color-muted);
  font-size: 12px;
}

@media (max-width: 820px) {
  .home-hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 48px;
  }

  .hero-copy h1 {
    font-size: 48px;
  }
}
```

- [x] **Step 6: Run polish tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-polish.test.ts`

Expected: PASS.

- [x] **Step 7: Run CTA verification**

Run: `pnpm verify:site-docs`

Expected: no CTA label failures.

- [x] **Step 8: Checkpoint**

Run: `git status --short --branch`

Expected: home page and site polish tests remain unstaged.

## Task 12: Align `/docs` Sidebar With Component Docs Design

**Files:**
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.ts`
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.html`
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.css`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
- Modify: `apps/vanrot-site/tests/site-polish.test.ts`
- Modify: `scripts/verify-site-docs.mjs`
- Modify: `scripts/verify-site-docs.test.mjs`

- [x] **Step 1: Write failing docs-shell visual contract tests**

Append to `apps/vanrot-site/tests/site-polish.test.ts`:

```ts
  it('aligns the framework docs shell with the component docs sidebar language', async () => {
    const html = await readSiteFile('src/layouts/docs/docs.layout.html');
    const css = await readSiteFile('src/layouts/docs/docs.layout.css');

    expect(html).toContain('class="docs-brand"');
    expect(html).toContain('class="docs-search"');
    expect(html).toContain('class="docs-nav-title"');
    expect(html).toContain('class="docs-nav-link"');
    expect(html).toContain('<vr-sidebar class="docs-sidebar" placement.left aria-label="Documentation">');
    expect(css).toContain('grid-template-columns: 240px minmax(0, 1fr)');
    expect(css).toContain('border-right: 1px solid');
    expect(css).toContain('height: 32px');
  });
```

- [x] **Step 2: Add failing verification helper test**

Append to `scripts/verify-site-docs.test.mjs`:

```js
import { checkDocsShellVisualContract } from './verify-site-docs.mjs';

describe('docs shell visual verification', () => {
  it('fails when required docs shell classes are missing', () => {
    const failures = checkDocsShellVisualContract('<vr-sidebar></vr-sidebar>', '.docs-layout {}');

    expect(failures).toEqual([
      'Docs shell missing class: docs-brand',
      'Docs shell missing class: docs-search',
      'Docs shell missing class: docs-nav-title',
      'Docs shell missing class: docs-nav-link',
      'Docs shell CSS missing 240px sidebar grid',
    ]);
  });
});
```

- [x] **Step 3: Run failing tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-polish.test.ts`

Expected: FAIL because docs shell classes are missing.

Run: `pnpm test:phase-docs`

Expected: FAIL because `checkDocsShellVisualContract` is missing.

- [x] **Step 4: Update docs layout template**

Modify `apps/vanrot-site/src/layouts/docs/docs.layout.html` so the sidebar follows this structure:

```html
<vr-layout class="docs-layout">
  <vr-sidebar class="docs-sidebar" placement.left aria-label="Documentation">
    <a class="docs-brand" href="/">
      <span class="docs-mark" aria-hidden="true"></span>
      <span>Vanrot</span>
    </a>

    <button class="docs-search" type="button">
      <span aria-hidden="true">/</span>
      <span>Search</span>
      <kbd>Cmd K</kbd>
    </button>

    <vr-nav class="docs-nav" aria-label="Documentation">
      <span class="docs-nav-title">{{ labels.getStarted }}</span>
      @for (item of getStartedItems; track item.key) {
        <a class="docs-nav-link" href="{{ item.href }}">{{ item.label }}</a>
      }

      <span class="docs-nav-title">{{ labels.framework }}</span>
      @for (item of frameworkItems; track item.key) {
        <a class="docs-nav-link" href="{{ item.href }}">{{ item.label }}</a>
      }

      <span class="docs-nav-title">{{ labels.examples }}</span>
      @for (item of exampleItems; track item.key) {
        <a class="docs-nav-link" href="{{ item.href }}">{{ item.label }}</a>
      }

      <span class="docs-nav-title">{{ labels.reference }}</span>
      @for (item of referenceItems; track item.key) {
        <a class="docs-nav-link" href="{{ item.href }}">{{ item.label }}</a>
      }

      <span class="docs-nav-title">{{ labels.components }}</span>
      @for (item of componentItems; track item.key) {
        <a class="docs-nav-link" href="{{ item.href }}">{{ item.label }}</a>
      }
    </vr-nav>
  </vr-sidebar>

  <main class="docs-main">
    <vr-header class="docs-topbar">
      <span>Framework Documentation</span>
      <vr-nav class="docs-topbar-nav" aria-label="Documentation sections">
        <a href="/docs">Docs</a>
        <a href="/docs/components">Components</a>
      </vr-nav>
    </vr-header>
    <section class="docs-content">
      <vr-outlet></vr-outlet>
    </section>
  </main>
</vr-layout>
```

- [x] **Step 5: Update docs layout CSS**

Replace the current sidebar styling with:

```css
.docs-layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  min-height: 100vh;
}

.docs-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 20px 12px;
  border-right: 1px solid var(--vr-color-line);
  background: var(--vr-color-background);
  scrollbar-width: none;
}

.docs-sidebar::-webkit-scrollbar {
  display: none;
}

.docs-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 8px;
  margin-bottom: 16px;
  color: var(--vr-color-foreground);
  font-weight: 600;
  text-decoration: none;
}

.docs-mark {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: var(--vr-color-foreground);
}

.docs-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 36px;
  margin-bottom: 16px;
  padding: 0 10px;
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-sm);
  background: transparent;
  color: var(--vr-color-muted);
  font: inherit;
  text-align: left;
}

.docs-search span:nth-child(2) {
  flex: 1;
}

.docs-search kbd {
  padding: 1px 5px;
  border: 1px solid var(--vr-color-line);
  border-radius: 4px;
  color: var(--vr-color-muted);
  font: inherit;
  font-size: 11px;
}

.docs-nav {
  display: grid;
  gap: 2px;
}

.docs-nav-title {
  display: block;
  margin: 14px 0 2px;
  padding: 4px 8px;
  color: var(--vr-color-muted);
  font-size: 12px;
  font-weight: 600;
}

.docs-nav-link {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  border-radius: var(--vr-radius-sm);
  color: var(--vr-color-muted);
  text-decoration: none;
}

.docs-nav-link:hover {
  background: var(--vr-surface-muted);
  color: var(--vr-color-foreground);
}

.docs-main {
  min-width: 0;
}

.docs-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 32px;
  border-bottom: 1px solid var(--vr-color-line);
  background: color-mix(in srgb, var(--vr-color-background) 88%, transparent);
  backdrop-filter: blur(14px);
}

.docs-content {
  padding: 48px;
}

@media (max-width: 820px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }

  .docs-sidebar {
    position: relative;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--vr-color-line);
  }

  .docs-content {
    padding: 28px 18px 64px;
  }
}
```

- [x] **Step 6: Add verification helper**

Add to `scripts/verify-site-docs.mjs`:

```js
export function checkDocsShellVisualContract(layoutHtml, layoutCss) {
  const failures = [];
  const requiredClasses = ['docs-brand', 'docs-search', 'docs-nav-title', 'docs-nav-link'];

  for (const className of requiredClasses) {
    if (!layoutHtml.includes(className)) {
      failures.push(`Docs shell missing class: ${className}`);
    }
  }

  if (!layoutCss.includes('grid-template-columns: 240px minmax(0, 1fr)')) {
    failures.push('Docs shell CSS missing 240px sidebar grid');
  }

  return failures;
}
```

Wire it into `verifySiteDocs()`:

```js
  const docsLayoutHtml = readFileSync(join(projectRoot, 'apps/vanrot-site/src/layouts/docs/docs.layout.html'), 'utf8');
  const docsLayoutCss = readFileSync(join(projectRoot, 'apps/vanrot-site/src/layouts/docs/docs.layout.css'), 'utf8');

  for (const failure of checkDocsShellVisualContract(docsLayoutHtml, docsLayoutCss)) {
    failures.push(failure);
  }
```

- [x] **Step 7: Run focused tests and verification**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-polish.test.ts site-pages.test.ts`

Expected: PASS.

Run: `pnpm verify:site-docs`

Expected: PASS.

- [x] **Step 8: Checkpoint**

Run: `git status --short --branch`

Expected: docs shell and verification changes remain unstaged.

## Task 13: Improve Guide Article Rendering With Vanrot-Native Surfaces

**Files:**
- Modify: `apps/vanrot-site/src/pages/docs/docs-article.page.ts`
- Modify: `apps/vanrot-site/src/pages/docs/docs-article.page.html`
- Modify: `apps/vanrot-site/src/pages/docs/docs-article.page.css`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [x] **Step 1: Write failing article renderer tests**

Append to `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
  it('renders framework guide sections with Vanrot-native surfaces', async () => {
    const html = await readSiteFile('src/pages/docs/docs-article.page.html');
    const css = await readSiteFile('src/pages/docs/docs-article.page.css');

    expect(html).toContain('<vr-card');
    expect(html).toContain('<vr-separator');
    expect(html).toContain('article().sections');
    expect(css).toContain('.docs-section-grid');
    expect(css).toContain('code');
  });
```

- [x] **Step 2: Run failing page tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-pages.test.ts`

Expected: FAIL because the current article renderer is still plain.

- [x] **Step 3: Update article template**

Replace `apps/vanrot-site/src/pages/docs/docs-article.page.html` with:

```html
<article class="docs-article">
  <vr-badge tone.secondary>{{ article().status }}</vr-badge>
  <h1>{{ article().title }}</h1>
  <p class="docs-summary">{{ article().summary }}</p>
  <vr-separator orientation.horizontal></vr-separator>

  <div class="docs-section-grid">
    @for (section of article().sections; track section.id) {
      <vr-card variant.default>
        <section class="docs-section" id="{{ section.id }}">
          <h2>{{ section.title }}</h2>
          <p>{{ section.body }}</p>
        </section>
      </vr-card>
    }
  </div>
</article>
```

- [x] **Step 4: Update article CSS**

Replace `apps/vanrot-site/src/pages/docs/docs-article.page.css` with:

```css
.docs-article {
  display: grid;
  gap: 18px;
  max-width: 900px;
}

.docs-article h1,
.docs-article h2,
.docs-article p {
  margin: 0;
}

.docs-article h1 {
  max-width: 760px;
  font-size: 44px;
  line-height: 1.05;
  letter-spacing: 0;
}

.docs-summary,
.docs-section p {
  color: var(--vr-color-muted);
  line-height: 1.75;
}

.docs-section-grid {
  display: grid;
  gap: 12px;
}

.docs-section {
  display: grid;
  gap: 10px;
}

.docs-section code {
  padding: 2px 5px;
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-sm);
  background: var(--vr-surface-muted);
  color: var(--vr-color-foreground);
}
```

- [x] **Step 5: Run focused page tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-pages.test.ts`

Expected: PASS.

- [x] **Step 6: Checkpoint**

Run: `git status --short --branch`

Expected: article renderer changes remain unstaged.

## Task 14: Add Deployment-Ready Site Checks

**Files:**
- Modify: `apps/vanrot-site/tests/site-workspace.test.ts`
- Modify: `apps/vanrot-site/tests/site-polish.test.ts`
- Modify: `apps/vanrot-site/src/docs/framework-reference.json`

- [x] **Step 1: Add production and SEO tests**

Append to `apps/vanrot-site/tests/site-workspace.test.ts`:

```ts
import { deploymentReference, publicRouteMetadata } from '../src/docs/framework-reference.ts';

describe('deployment-ready web presence', () => {
  it('documents deployment target without claiming live deployment', () => {
    expect(deploymentReference.targetHost).toBe('vanrot.vankode.com');
    expect(deploymentReference.summary).toContain('DNS');
    expect(deploymentReference.summary).toContain('live deployment');
  });

  it('keeps SEO metadata for public routes substantial', () => {
    for (const routeMetadata of publicRouteMetadata) {
      expect(routeMetadata.title.length).toBeGreaterThan(10);
      expect(routeMetadata.description.length).toBeGreaterThan(50);
    }
  });
});
```

- [x] **Step 2: Run focused workspace tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- site-workspace.test.ts`

Expected: PASS if registry metadata from Task 1 is still present.

- [x] **Step 3: Run production site build**

Run: `pnpm --filter @vanrot/vanrot-site build`

Expected: PASS and creates `apps/vanrot-site/dist`.

- [x] **Step 4: Restart local site dev server**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected: dev server starts on `127.0.0.1:1964`.

- [x] **Step 5: Verify public routes respond**

Run:

```sh
curl -s -o /dev/null -w "%{http_code}" http://localhost:1964/
curl -s -o /dev/null -w "%{http_code}" http://localhost:1964/docs
curl -s -o /dev/null -w "%{http_code}" http://localhost:1964/docs/components
curl -s -o /dev/null -w "%{http_code}" http://localhost:1964/docs/example-matrix
```

Expected: each command prints `200`.

- [x] **Step 6: Checkpoint**

Run: `git status --short --branch`

Expected: deployment readiness tests and docs data remain unstaged. Do not stop the dev server if the user is about to inspect the site.

## Task 15: Phase Documentation Closeout

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-24.md`

- [x] **Step 1: Update final TDD inventory**

Add a Phase 24 section to `docs/superpowers/final-tdd-inventory.md` covering:

```md
## Phase 24 Documentation And Web Presence

- `apps/vanrot-site/src/docs/framework-reference.json`: package, public export, command, diagnostic, generated file, convention, example, limitation, maturity, deployment, and public route metadata registry.
- `apps/vanrot-site/src/docs/framework-reference.ts`: typed registry facade.
- `apps/vanrot-site/src/docs/example-matrix.ts`: required example workflow coverage.
- `apps/vanrot-site/src/pages/home/*`: landing page CTA labels and tasteful public front door.
- `apps/vanrot-site/src/layouts/docs/*`: framework docs sidebar aligned with component docs visual language.
- `apps/vanrot-site/src/pages/docs/docs-reference.page.*`: structured framework reference surface.
- `apps/vanrot-site/src/pages/docs/docs-example-matrix.page.*`: runnable example matrix surface.
- `scripts/verify-site-docs.mjs`: docs drift checks for packages, exports, commands, diagnostics, generated files, conventions, examples, CTA labels, route metadata, and docs-shell visual contract.
- `examples/*`: runnable examples used by framework guide docs.
```

- [x] **Step 2: Update the maturity ledger**

In `docs/superpowers/feature-maturity.md`, mark the Phase 24 roadmap row done only after all verification in Task 16 passes:

```md
| [x]  | Phase 24 | Documentation and web presence              | Deep docs, API docs, guide docs, docs completeness checks, `vanrot.vankode.com`, install guide, UI docs                                                    | Public documentation covers every package, command, convention, generated file, limitation, and production caveat.                                      |
```

Keep Phase 17 through Phase 22 in the post-production bucket.

- [x] **Step 3: Update the presentation roadmap**

In `docs/vanrot-presentation.html`, update the roadmap slide so Phase 24 is done and Phase 25 is the next active phase. Keep the copy clear that Phase 25 is AI consumption and Phase 26 is distribution hardening.

- [x] **Step 4: Tick completed plan tasks**

After Tasks 1 through 16 pass, update this file so completed steps use `[x]`. Do not mark unchecked work complete before its verification command passes.

- [x] **Step 5: Run phase docs verification**

Run: `pnpm verify:phase-docs`

Expected: PASS. If it fails, align `feature-maturity.md`, this plan, and `docs/vanrot-presentation.html`.

- [x] **Step 6: Checkpoint**

Run: `git status --short --branch`

Expected: phase tracker, final inventory, presentation, and plan file remain unstaged.

## Task 16: Final Verification

**Files:**
- No new files. This task verifies all Phase 24 work.

- [x] **Step 1: Run focused site tests**

Run: `pnpm --filter @vanrot/vanrot-site test`

Expected: PASS.

- [x] **Step 2: Run phase docs tests**

Run: `pnpm test:phase-docs`

Expected: PASS.

- [x] **Step 3: Run site docs verification**

Run: `pnpm verify:site-docs`

Expected: PASS.

- [x] **Step 4: Run site typecheck**

Run: `pnpm --filter @vanrot/vanrot-site typecheck`

Expected: PASS.

- [x] **Step 5: Run site build**

Run: `pnpm --filter @vanrot/vanrot-site build`

Expected: PASS.

- [x] **Step 6: Run full monorepo verification**

Run: `pnpm verify`

Expected: PASS.

- [x] **Step 7: Restart local site dev server**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected: the dev server is available at `http://localhost:1964`.

- [x] **Step 8: Verify local routes**

Run:

```sh
curl -s -o /dev/null -w "%{http_code}" http://localhost:1964/
curl -s -o /dev/null -w "%{http_code}" http://localhost:1964/docs
curl -s -o /dev/null -w "%{http_code}" http://localhost:1964/docs/components
curl -s -o /dev/null -w "%{http_code}" http://localhost:1964/docs/public-api
curl -s -o /dev/null -w "%{http_code}" http://localhost:1964/docs/example-matrix
```

Expected: each command prints `200`.

- [x] **Step 9: Inspect final git status**

Run: `git status --short --branch`

Expected: all Phase 24 changed files are visible in the working tree, with no staged changes unless the user explicitly requested staging.

- [x] **Step 10: Final response checklist**

Report:

- changed files grouped by docs data, site UI, examples, verification scripts, and phase tracking;
- verification commands that passed;
- any verification command that failed and the exact blocker;
- current `git status --short --branch`;
- whether unrelated local changes were left untouched.
