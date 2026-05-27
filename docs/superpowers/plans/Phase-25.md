# Phase 25 AI Consumption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Vanrot `AGENTS.md` disables subagent-driven workflows for this repository, so execute inline with review checkpoints.

**Goal:** Build one official AI knowledge bundle for Vanrot and expose it through MCP, Skill.sh, and first-party `vr ai` commands.

**Architecture:** Add a focused `@vanrot/ai` package that owns the bundle schema, source readers, deterministic generator, verifier, MCP server, and Skill.sh package generator. The CLI stays thin: `vr ai build`, `vr ai verify`, `vr ai doctor`, and `vr ai mcp` call `@vanrot/ai` APIs and use the existing reporter style. Root verification gains `verify:ai-docs`, which fails when framework-facing source data changes without a refreshed bundle.

**Tech Stack:** TypeScript, Vitest, Node.js `fs/promises`, Node.js `crypto`, existing Vanrot CLI reporter/result helpers, `@modelcontextprotocol/sdk@^1.29.0`, `zod@^4.0.0`, generated JSON and Markdown under `docs/ai`.

---

## Execution Rules

- Execute in the current workspace. Do not create a branch or worktree unless the user asks.
- Do not use subagents. This repo explicitly disables them.
- Do not run `git add`, `git commit`, or `git push` unless the user asks.
- Keep every generated bundle file deterministic except explicit `generatedAt`; tests should pass a fixed clock.
- Keep `vr ai context`, `vr ai prompt`, `vr ai record`, and `vr ai summarize` working. Phase 25 extends the command group; it does not remove the existing project-context doorway.
- Use guard clauses, readable English-like APIs, role-based suffixes, scoped files, and shared constants for repeated command names and bundle paths.

## Scope Check

The spec has two slices, but they are coupled:

- 25A creates the bundle contract and freshness guard.
- 25B exposes MCP, Skill.sh, and CLI consumers over that same contract.

Do not split this into separate implementation plans. The consumers are only correct if they prove that they load the same generated manifest and index.

## File Structure

### New AI Package

- Create: `packages/ai/package.json`
  - Declares `@vanrot/ai`, exports package API, and exposes a `vanrot-mcp` bin.
- Create: `packages/ai/tsconfig.json`
  - Composite TypeScript config.
- Create: `packages/ai/src/index.ts`
  - Public exports for bundle generation, verification, MCP server creation, and Skill.sh package creation.
- Create: `packages/ai/src/bundle/schema.ts`
  - Bundle constants, TypeScript interfaces, and pure schema guards.
- Create: `packages/ai/src/bundle/paths.ts`
  - Shared path constants such as `docs/ai`, `manifest.json`, `index.json`, `rules.md`, and `knowledge`.
- Create: `packages/ai/src/bundle/source.ts`
  - Reads Phase 24 docs/reference sources and computes source fingerprints.
- Create: `packages/ai/src/bundle/generator.ts`
  - Builds deterministic manifest, index, knowledge documents, and rules content.
- Create: `packages/ai/src/bundle/writer.ts`
  - Writes bundle files to disk.
- Create: `packages/ai/src/bundle/verify.ts`
  - Verifies schema, source freshness, coverage, and consumer-ready files.
- Create: `packages/ai/src/mcp/server.ts`
  - Creates a local-first MCP server over a loaded bundle.
- Create: `packages/ai/src/mcp/bin.ts`
  - Runs the MCP server on stdio for the `vanrot-mcp` bin.
- Create: `packages/ai/src/skill/generator.ts`
  - Creates the Skill.sh package files from the same bundle.
- Create: `packages/ai/tests/bundle.test.ts`
  - Unit tests for schema, source reader, generator, writer, and verifier.
- Create: `packages/ai/tests/mcp.test.ts`
  - Unit tests proving MCP resources/tools read the bundle.
- Create: `packages/ai/tests/skill.test.ts`
  - Unit tests proving Skill.sh files point to the bundle manifest.

### CLI Integration

- Modify: `packages/cli/package.json`
  - Add `@vanrot/ai` dependency.
- Modify: `packages/cli/tsconfig.json`
  - Add a project reference to `../ai`.
- Modify: `packages/cli/src/ai/paths.ts`
  - Add AI bundle paths to the existing `.vanrot/ai` path model.
- Modify: `packages/cli/src/commands/ai.ts`
  - Add `build`, `verify`, `doctor`, and `mcp` actions while preserving existing actions.
- Modify: `packages/cli/src/commands/metadata.ts`
  - Update `ai <action>` help.
- Modify: `packages/cli/tests/ai-doorway.test.ts`
  - Add CLI tests for new `vr ai` actions.
- Modify: `packages/cli/tests/cli.test.ts`
  - Update root help expectations if wording changes.

### Root Verification And Generated Bundle

- Create: `scripts/verify-ai-docs.mjs`
  - Runs the built `@vanrot/ai` verifier against `docs/ai`.
- Create: `scripts/verify-ai-docs.test.mjs`
  - Tests focused error messages for missing and stale bundles.
- Modify: `package.json`
  - Add `verify:ai-docs`, include its tests in `test:phase-docs`, and wire it into `verify`.
- Modify: `tsconfig.json`
  - Add `./packages/ai` reference.
- Create: `docs/ai/manifest.json`
  - Generated bundle manifest.
- Create: `docs/ai/index.json`
  - Generated machine-readable index.
- Create: `docs/ai/rules.md`
  - Generated provider-neutral AI rules.
- Create: `docs/ai/knowledge/*.md`
  - Generated compact knowledge documents.
- Create: `docs/ai/skill/SKILL.md`
  - Generated Skill.sh package entrypoint.
- Create: `docs/ai/skill/skill.json`
  - Generated Skill.sh package metadata.

### Phase Tracking

- Modify: `docs/superpowers/feature-maturity.md`
  - Mark Phase 25 complete only after all plan tasks and verification pass.
- Modify: `docs/superpowers/final-tdd-inventory.md`
  - Add AI bundle, MCP, Skill.sh, CLI, and `verify:ai-docs` coverage.
- Modify: `docs/vanrot-presentation.html`
  - Move roadmap state from Phase 25 active to Phase 26 next after closeout.
- Modify: `docs/superpowers/plans/Phase-25.md`
  - Tick tasks as they pass.

## Task 1: Add `@vanrot/ai` Package Shell And Bundle Schema

**Files:**
- Create: `packages/ai/package.json`
- Create: `packages/ai/tsconfig.json`
- Create: `packages/ai/src/index.ts`
- Create: `packages/ai/src/bundle/schema.ts`
- Create: `packages/ai/src/bundle/paths.ts`
- Create: `packages/ai/tests/bundle.test.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Write failing schema tests**

Add this first section to `packages/ai/tests/bundle.test.ts`:

```ts
import {
  aiBundleSchemaVersion,
  createAiBundleManifest,
  defaultAiBundlePaths,
  isAiBundleManifest,
} from '../src/index.js';
import { describe, expect, it } from 'vitest';

describe('AI bundle schema', () => {
  it('creates a versioned manifest with deterministic counts', () => {
    const manifest = createAiBundleManifest({
      vanrotVersion: '0.0.0',
      generatedAt: '2026-05-27T00:00:00.000Z',
      sourceFingerprint: 'sha256-demo',
      sources: [
        { id: 'framework-reference', path: 'apps/vanrot-site/src/docs/framework-reference.json', fingerprint: 'one' },
      ],
      counts: {
        packages: 1,
        publicExports: 2,
        commands: 3,
        diagnostics: 4,
        generatedFiles: 5,
        conventions: 6,
        examples: 7,
        docs: 8,
      },
    });

    expect(aiBundleSchemaVersion).toBe(1);
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.coverageStatus).toBe('complete');
    expect(manifest.counts.commands).toBe(3);
    expect(isAiBundleManifest(manifest)).toBe(true);
  });

  it('defines stable default output paths', () => {
    expect(defaultAiBundlePaths.root).toBe('docs/ai');
    expect(defaultAiBundlePaths.manifest).toBe('docs/ai/manifest.json');
    expect(defaultAiBundlePaths.index).toBe('docs/ai/index.json');
    expect(defaultAiBundlePaths.rules).toBe('docs/ai/rules.md');
    expect(defaultAiBundlePaths.knowledge).toBe('docs/ai/knowledge');
    expect(defaultAiBundlePaths.skill).toBe('docs/ai/skill');
  });
});
```

- [ ] **Step 2: Run the failing package test**

Run:

```sh
pnpm --filter @vanrot/ai test
```

Expected: FAIL because `@vanrot/ai` package and exports do not exist.

- [ ] **Step 3: Create package manifest**

Create `packages/ai/package.json`:

```json
{
  "name": "@vanrot/ai",
  "version": "0.0.0",
  "type": "module",
  "bin": {
    "vanrot-mcp": "./dist/mcp/bin.js"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./mcp": {
      "types": "./dist/mcp/server.d.ts",
      "import": "./dist/mcp/server.js"
    }
  },
  "files": [
    "dist"
  ],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0",
    "zod": "^4.0.0"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

- [ ] **Step 4: Create package tsconfig**

Create `packages/ai/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo",
    "resolveJsonModule": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 5: Add root project reference**

Modify `tsconfig.json` so `./packages/ai` is included before `./packages/cli`:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/runtime" },
    { "path": "./packages/ui" },
    { "path": "./packages/router" },
    { "path": "./packages/compiler" },
    { "path": "./packages/config" },
    { "path": "./packages/vite-plugin" },
    { "path": "./packages/ai" },
    { "path": "./packages/cli" }
  ]
}
```

- [ ] **Step 6: Implement path constants**

Create `packages/ai/src/bundle/paths.ts`:

```ts
export const aiBundleRoot = 'docs/ai';
export const aiBundleKnowledgeDirectory = `${aiBundleRoot}/knowledge`;
export const aiBundleSkillDirectory = `${aiBundleRoot}/skill`;

export const defaultAiBundlePaths = {
  root: aiBundleRoot,
  manifest: `${aiBundleRoot}/manifest.json`,
  index: `${aiBundleRoot}/index.json`,
  rules: `${aiBundleRoot}/rules.md`,
  knowledge: aiBundleKnowledgeDirectory,
  skill: aiBundleSkillDirectory,
} as const;
```

- [ ] **Step 7: Implement schema types and guards**

Create `packages/ai/src/bundle/schema.ts`:

```ts
export const aiBundleSchemaVersion = 1;

export type AiBundleCoverageStatus = 'complete' | 'incomplete';

export interface AiBundleSourceFingerprint {
  id: string;
  path: string;
  fingerprint: string;
}

export interface AiBundleCounts {
  packages: number;
  publicExports: number;
  commands: number;
  diagnostics: number;
  generatedFiles: number;
  conventions: number;
  examples: number;
  docs: number;
}

export interface AiBundleManifest {
  schemaVersion: typeof aiBundleSchemaVersion;
  vanrotVersion: string;
  generatedAt: string;
  sourceFingerprint: string;
  sources: AiBundleSourceFingerprint[];
  counts: AiBundleCounts;
  coverageStatus: AiBundleCoverageStatus;
}

export interface CreateAiBundleManifestOptions {
  vanrotVersion: string;
  generatedAt: string;
  sourceFingerprint: string;
  sources: AiBundleSourceFingerprint[];
  counts: AiBundleCounts;
}

export function createAiBundleManifest(options: CreateAiBundleManifestOptions): AiBundleManifest {
  return {
    schemaVersion: aiBundleSchemaVersion,
    vanrotVersion: options.vanrotVersion,
    generatedAt: options.generatedAt,
    sourceFingerprint: options.sourceFingerprint,
    sources: options.sources,
    counts: options.counts,
    coverageStatus: 'complete',
  };
}

export function isAiBundleManifest(value: unknown): value is AiBundleManifest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const manifest = value as Partial<AiBundleManifest>;
  return (
    manifest.schemaVersion === aiBundleSchemaVersion &&
    typeof manifest.vanrotVersion === 'string' &&
    typeof manifest.generatedAt === 'string' &&
    typeof manifest.sourceFingerprint === 'string' &&
    Array.isArray(manifest.sources) &&
    typeof manifest.counts === 'object' &&
    manifest.counts !== null &&
    (manifest.coverageStatus === 'complete' || manifest.coverageStatus === 'incomplete')
  );
}
```

- [ ] **Step 8: Export public API**

Create `packages/ai/src/index.ts`:

```ts
export {
  aiBundleKnowledgeDirectory,
  aiBundleRoot,
  aiBundleSkillDirectory,
  defaultAiBundlePaths,
} from './bundle/paths.js';
export {
  aiBundleSchemaVersion,
  createAiBundleManifest,
  isAiBundleManifest,
  type AiBundleCounts,
  type AiBundleCoverageStatus,
  type AiBundleManifest,
  type AiBundleSourceFingerprint,
  type CreateAiBundleManifestOptions,
} from './bundle/schema.js';
```

- [ ] **Step 9: Run package test**

Run:

```sh
pnpm --filter @vanrot/ai test
```

Expected: PASS.

- [ ] **Step 10: Checkpoint**

Report changed files and whether `pnpm --filter @vanrot/ai test` passed.

## Task 2: Read Source Inventories And Compute Fingerprints

**Files:**
- Modify: `packages/ai/src/index.ts`
- Create: `packages/ai/src/bundle/source.ts`
- Modify: `packages/ai/tests/bundle.test.ts`

- [ ] **Step 1: Add failing source reader tests**

Append to `packages/ai/tests/bundle.test.ts`:

```ts
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  readAiKnowledgeSource,
  readJsonFile,
} from '../src/index.js';

async function createFrameworkReferenceFixture() {
  const root = await mkdtemp(join(tmpdir(), 'vanrot-ai-source-'));
  const docsRoot = join(root, 'apps', 'vanrot-site', 'src', 'docs');
  await mkdir(docsRoot, { recursive: true });
  await writeFile(join(root, 'package.json'), JSON.stringify({ version: '0.0.0' }));
  await writeFile(
    join(docsRoot, 'framework-reference.json'),
    JSON.stringify(
      {
        packages: [{ name: '@vanrot/runtime', status: 'production-ready', summary: 'Runtime package.' }],
        publicExports: [{ packageName: '@vanrot/runtime', name: 'signal', kind: 'function', status: 'production-ready', summary: 'Signal helper.', docsPath: '/docs/public-api' }],
        commands: [{ name: 'create', usage: 'vr create <name>', status: 'production-ready', summary: 'Create app.', docsPath: '/docs/cli' }],
        diagnostics: [{ family: 'compiler', code: 'VR001', status: 'production-ready', summary: 'Compiler diagnostic.', docsPath: '/docs/diagnostics' }],
        generatedFiles: [{ path: 'src/app.component.ts', status: 'production-ready', summary: 'Component class.', docsPath: '/docs/generated-files' }],
        conventions: [{ id: 'signals-for-state', status: 'production-ready', summary: 'Use signals for state.', docsPath: '/docs/conventions' }],
        examples: [{ path: 'examples/counter', title: 'Counter', packages: ['@vanrot/runtime'], workflows: ['runtime'], status: 'production-ready', docsPath: '/docs/examples' }],
        limitations: [],
        maturity: [],
        routeMetadata: [],
        deployment: { status: 'production-ready', summary: 'Deployment ready.' }
      },
      null,
      2,
    ),
  );
  await writeFile(
    join(docsRoot, 'site-data.json'),
    JSON.stringify({ articles: [{ key: 'install', title: 'Install', sections: [] }] }, null, 2),
  );
  return root;
}

describe('AI knowledge source reader', () => {
  it('reads framework reference and site data from a repo root', async () => {
    const root = await createFrameworkReferenceFixture();

    const source = await readAiKnowledgeSource(root);

    expect(source.vanrotVersion).toBe('0.0.0');
    expect(source.frameworkReference.packages).toHaveLength(1);
    expect(source.frameworkReference.commands[0]?.name).toBe('create');
    expect(source.siteData.articles[0]?.key).toBe('install');
    expect(source.sources.map((item) => item.id)).toEqual([
      'package-json',
      'framework-reference',
      'site-data',
    ]);
    expect(source.sourceFingerprint).toMatch(/^sha256-/);
  });

  it('reads json with a guided missing-file failure', async () => {
    await expect(readJsonFile('/missing/vanrot.json')).rejects.toThrow(
      'Could not read JSON source: /missing/vanrot.json',
    );
  });
});
```

- [ ] **Step 2: Run failing source tests**

Run:

```sh
pnpm --filter @vanrot/ai test -- --runInBand
```

Expected: FAIL because `readAiKnowledgeSource` and `readJsonFile` are not exported.

- [ ] **Step 3: Implement source reader**

Create `packages/ai/src/bundle/source.ts`:

```ts
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AiBundleSourceFingerprint } from './schema.js';

export interface AiKnowledgeSource {
  root: string;
  vanrotVersion: string;
  frameworkReference: FrameworkReferenceSource;
  siteData: SiteDataSource;
  sourceFingerprint: string;
  sources: AiBundleSourceFingerprint[];
}

export interface FrameworkReferenceSource {
  packages: unknown[];
  publicExports: unknown[];
  commands: unknown[];
  diagnostics: unknown[];
  generatedFiles: unknown[];
  conventions: unknown[];
  examples: unknown[];
  limitations: unknown[];
  maturity: unknown[];
  routeMetadata: unknown[];
  deployment?: unknown;
}

export interface SiteDataSource {
  articles: Array<{ key: string; title: string; sections?: unknown[] }>;
}

export async function readAiKnowledgeSource(root: string): Promise<AiKnowledgeSource> {
  const packagePath = join(root, 'package.json');
  const frameworkReferencePath = join(
    root,
    'apps/vanrot-site/src/docs/framework-reference.json',
  );
  const siteDataPath = join(root, 'apps/vanrot-site/src/docs/site-data.json');

  const packageJson = (await readJsonFile(packagePath)) as { version?: string };
  const frameworkReference = (await readJsonFile(frameworkReferencePath)) as FrameworkReferenceSource;
  const siteData = (await readJsonFile(siteDataPath)) as SiteDataSource;
  const files = [
    { id: 'package-json', path: 'package.json', absolutePath: packagePath },
    {
      id: 'framework-reference',
      path: 'apps/vanrot-site/src/docs/framework-reference.json',
      absolutePath: frameworkReferencePath,
    },
    {
      id: 'site-data',
      path: 'apps/vanrot-site/src/docs/site-data.json',
      absolutePath: siteDataPath,
    },
  ];
  const sources = await Promise.all(
    files.map(async (file) => ({
      id: file.id,
      path: file.path,
      fingerprint: await fingerprintFile(file.absolutePath),
    })),
  );

  return {
    root,
    vanrotVersion: packageJson.version ?? '0.0.0',
    frameworkReference,
    siteData,
    sourceFingerprint: fingerprintText(sources.map((source) => source.fingerprint).join('\n')),
    sources,
  };
}

export async function readJsonFile(path: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read JSON source: ${path}. ${message}`);
  }
}

async function fingerprintFile(path: string): Promise<string> {
  return fingerprintText(await readFile(path, 'utf8'));
}

function fingerprintText(text: string): string {
  return `sha256-${createHash('sha256').update(text).digest('hex')}`;
}
```

- [ ] **Step 4: Export source reader**

Modify `packages/ai/src/index.ts`:

```ts
export {
  readAiKnowledgeSource,
  readJsonFile,
  type AiKnowledgeSource,
  type FrameworkReferenceSource,
  type SiteDataSource,
} from './bundle/source.js';
```

Keep the exports from Task 1 in the same file.

- [ ] **Step 5: Run source tests**

Run:

```sh
pnpm --filter @vanrot/ai test
```

Expected: PASS.

- [ ] **Step 6: Checkpoint**

Report that source reader tests pass and list the three source groups now fingerprinted.

## Task 3: Generate Manifest, Index, Knowledge Documents, And Rules

**Files:**
- Create: `packages/ai/src/bundle/generator.ts`
- Modify: `packages/ai/src/index.ts`
- Modify: `packages/ai/tests/bundle.test.ts`

- [ ] **Step 1: Add failing generator tests**

Append to `packages/ai/tests/bundle.test.ts`:

```ts
import { buildAiKnowledgeBundle } from '../src/index.js';

describe('AI knowledge bundle generator', () => {
  it('builds manifest, index, knowledge docs, and rules from source data', async () => {
    const root = await createFrameworkReferenceFixture();

    const bundle = await buildAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });

    expect(bundle.manifest.generatedAt).toBe('2026-05-27T00:00:00.000Z');
    expect(bundle.manifest.counts.packages).toBe(1);
    expect(bundle.manifest.counts.commands).toBe(1);
    expect(bundle.index.commands[0]).toEqual(
      expect.objectContaining({ id: 'command:create', title: 'vr create <name>' }),
    );
    expect(bundle.documents.map((doc) => doc.path)).toContain('knowledge/commands.md');
    expect(bundle.documents.find((doc) => doc.path === 'knowledge/commands.md')?.content).toContain(
      'vr create <name>',
    );
    expect(bundle.rules).toContain('Use signals for state.');
  });
});
```

- [ ] **Step 2: Run failing generator test**

Run:

```sh
pnpm --filter @vanrot/ai test
```

Expected: FAIL because `buildAiKnowledgeBundle` is missing.

- [ ] **Step 3: Implement generator**

Create `packages/ai/src/bundle/generator.ts`:

```ts
import { createAiBundleManifest, type AiBundleManifest } from './schema.js';
import { readAiKnowledgeSource, type AiKnowledgeSource } from './source.js';

export interface BuildAiKnowledgeBundleOptions {
  now?: () => Date;
}

export interface AiBundleIndexEntry {
  id: string;
  title: string;
  summary: string;
  docsPath?: string;
}

export interface AiBundleIndex {
  packages: AiBundleIndexEntry[];
  publicExports: AiBundleIndexEntry[];
  commands: AiBundleIndexEntry[];
  diagnostics: AiBundleIndexEntry[];
  generatedFiles: AiBundleIndexEntry[];
  conventions: AiBundleIndexEntry[];
  examples: AiBundleIndexEntry[];
  docs: AiBundleIndexEntry[];
}

export interface AiBundleDocument {
  path: string;
  content: string;
}

export interface AiKnowledgeBundle {
  manifest: AiBundleManifest;
  index: AiBundleIndex;
  documents: AiBundleDocument[];
  rules: string;
}

export async function buildAiKnowledgeBundle(
  root: string,
  options: BuildAiKnowledgeBundleOptions = {},
): Promise<AiKnowledgeBundle> {
  return createAiKnowledgeBundle(await readAiKnowledgeSource(root), options);
}

export function createAiKnowledgeBundle(
  source: AiKnowledgeSource,
  options: BuildAiKnowledgeBundleOptions = {},
): AiKnowledgeBundle {
  const now = options.now ?? (() => new Date());
  const index = createBundleIndex(source);
  const manifest = createAiBundleManifest({
    vanrotVersion: source.vanrotVersion,
    generatedAt: now().toISOString(),
    sourceFingerprint: source.sourceFingerprint,
    sources: source.sources,
    counts: {
      packages: index.packages.length,
      publicExports: index.publicExports.length,
      commands: index.commands.length,
      diagnostics: index.diagnostics.length,
      generatedFiles: index.generatedFiles.length,
      conventions: index.conventions.length,
      examples: index.examples.length,
      docs: index.docs.length,
    },
  });

  return {
    manifest,
    index,
    documents: createKnowledgeDocuments(index),
    rules: createProviderNeutralRules(index),
  };
}

function createBundleIndex(source: AiKnowledgeSource): AiBundleIndex {
  return {
    packages: source.frameworkReference.packages.map((item) =>
      entry(`package:${readString(item, 'name')}`, readString(item, 'name'), readString(item, 'summary')),
    ),
    publicExports: source.frameworkReference.publicExports.map((item) =>
      entry(
        `export:${readString(item, 'packageName')}:${readString(item, 'name')}`,
        `${readString(item, 'packageName')} ${readString(item, 'name')}`,
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    commands: source.frameworkReference.commands.map((item) =>
      entry(
        `command:${readString(item, 'name')}`,
        readString(item, 'usage'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    diagnostics: source.frameworkReference.diagnostics.map((item) =>
      entry(
        `diagnostic:${readString(item, 'code')}`,
        readString(item, 'code'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    generatedFiles: source.frameworkReference.generatedFiles.map((item) =>
      entry(
        `generated-file:${readString(item, 'path')}`,
        readString(item, 'path'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    conventions: source.frameworkReference.conventions.map((item) =>
      entry(
        `convention:${readString(item, 'id')}`,
        readString(item, 'id'),
        readString(item, 'summary'),
        readString(item, 'docsPath'),
      ),
    ),
    examples: source.frameworkReference.examples.map((item) =>
      entry(
        `example:${readString(item, 'path')}`,
        readString(item, 'title'),
        readString(item, 'path'),
        readString(item, 'docsPath'),
      ),
    ),
    docs: source.siteData.articles.map((article) =>
      entry(`doc:${article.key}`, article.title, article.key),
    ),
  };
}

function createKnowledgeDocuments(index: AiBundleIndex): AiBundleDocument[] {
  return [
    sectionDocument('packages', 'Packages', index.packages),
    sectionDocument('commands', 'Commands', index.commands),
    sectionDocument('diagnostics', 'Diagnostics', index.diagnostics),
    sectionDocument('generated-files', 'Generated Files', index.generatedFiles),
    sectionDocument('conventions', 'Conventions', index.conventions),
    sectionDocument('examples', 'Examples', index.examples),
    sectionDocument('public-api', 'Public API', index.publicExports),
  ];
}

function sectionDocument(
  id: string,
  title: string,
  entries: AiBundleIndexEntry[],
): AiBundleDocument {
  const lines = [`# Vanrot ${title}`, ''];

  for (const item of entries) {
    lines.push(`## ${item.title}`, '', item.summary, '');
    if (item.docsPath !== undefined && item.docsPath !== '') {
      lines.push(`Docs: ${item.docsPath}`, '');
    }
  }

  return { path: `knowledge/${id}.md`, content: `${lines.join('\n').trim()}\n` };
}

function createProviderNeutralRules(index: AiBundleIndex): string {
  const commandList = index.commands.map((command) => `- ${command.title}`).join('\n');
  return [
    '# Vanrot AI Rules',
    '',
    '- Use guard clauses instead of nested control flow.',
    '- Use signals for state.',
    '- Never put UI markup in TypeScript.',
    '- Never put application logic in HTML.',
    '- Use role-based file suffixes such as `.component.ts`, `.page.ts`, `.dialog.ts`, `.layout.ts`, `.widget.ts`, and `.form.ts`.',
    '- Use scoped CSS for component styling.',
    '- Avoid reused string literals by keeping shared names in one source of truth.',
    '',
    '## Commands',
    '',
    commandList,
    '',
  ].join('\n');
}

function entry(
  id: string,
  title: string,
  summary: string,
  docsPath?: string,
): AiBundleIndexEntry {
  return { id, title, summary, docsPath };
}

function readString(value: unknown, key: string): string {
  if (typeof value !== 'object' || value === null) {
    return '';
  }

  const record = value as Record<string, unknown>;
  const field = record[key];
  return typeof field === 'string' ? field : '';
}
```

- [ ] **Step 4: Export generator**

Modify `packages/ai/src/index.ts`:

```ts
export {
  buildAiKnowledgeBundle,
  createAiKnowledgeBundle,
  type AiBundleDocument,
  type AiBundleIndex,
  type AiBundleIndexEntry,
  type AiKnowledgeBundle,
  type BuildAiKnowledgeBundleOptions,
} from './bundle/generator.js';
```

- [ ] **Step 5: Run generator tests**

Run:

```sh
pnpm --filter @vanrot/ai test
```

Expected: PASS.

- [ ] **Step 6: Checkpoint**

Report generated sections and confirm the rules document is provider-neutral.

## Task 4: Write And Verify The Official Bundle

**Files:**
- Create: `packages/ai/src/bundle/writer.ts`
- Create: `packages/ai/src/bundle/verify.ts`
- Modify: `packages/ai/src/index.ts`
- Modify: `packages/ai/tests/bundle.test.ts`
- Create: `docs/ai/manifest.json`
- Create: `docs/ai/index.json`
- Create: `docs/ai/rules.md`
- Create: `docs/ai/knowledge/packages.md`
- Create: `docs/ai/knowledge/commands.md`
- Create: `docs/ai/knowledge/diagnostics.md`
- Create: `docs/ai/knowledge/generated-files.md`
- Create: `docs/ai/knowledge/conventions.md`
- Create: `docs/ai/knowledge/examples.md`
- Create: `docs/ai/knowledge/public-api.md`

- [ ] **Step 1: Add failing writer and verifier tests**

Append to `packages/ai/tests/bundle.test.ts`:

```ts
import { readFile } from 'node:fs/promises';
import {
  verifyAiKnowledgeBundle,
  writeAiKnowledgeBundle,
} from '../src/index.js';

describe('AI bundle writer and verifier', () => {
  it('writes manifest, index, rules, and knowledge documents', async () => {
    const root = await createFrameworkReferenceFixture();
    await writeAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });

    expect(await readFile(join(root, 'docs', 'ai', 'manifest.json'), 'utf8')).toContain(
      '"schemaVersion": 1',
    );
    expect(await readFile(join(root, 'docs', 'ai', 'index.json'), 'utf8')).toContain(
      '"command:create"',
    );
    expect(await readFile(join(root, 'docs', 'ai', 'rules.md'), 'utf8')).toContain(
      'Use signals for state.',
    );
    expect(await readFile(join(root, 'docs', 'ai', 'knowledge', 'commands.md'), 'utf8')).toContain(
      'vr create <name>',
    );
  });

  it('passes verification for a fresh bundle', async () => {
    const root = await createFrameworkReferenceFixture();
    await writeAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });

    const result = await verifyAiKnowledgeBundle(root);

    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('fails verification when the manifest fingerprint is stale', async () => {
    const root = await createFrameworkReferenceFixture();
    await writeAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });
    await writeFile(
      join(root, 'apps', 'vanrot-site', 'src', 'docs', 'framework-reference.json'),
      JSON.stringify({
        packages: [],
        publicExports: [],
        commands: [],
        diagnostics: [],
        generatedFiles: [],
        conventions: [],
        examples: [],
        limitations: [],
        maturity: [],
        routeMetadata: []
      }),
    );

    const result = await verifyAiKnowledgeBundle(root);

    expect(result.ok).toBe(false);
    expect(result.failures).toContain('AI bundle is stale: source fingerprint changed.');
  });
});
```

- [ ] **Step 2: Run failing writer tests**

Run:

```sh
pnpm --filter @vanrot/ai test
```

Expected: FAIL because writer and verifier exports are missing.

- [ ] **Step 3: Implement bundle writer**

Create `packages/ai/src/bundle/writer.ts`:

```ts
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildAiKnowledgeBundle, type BuildAiKnowledgeBundleOptions } from './generator.js';
import { defaultAiBundlePaths } from './paths.js';

export async function writeAiKnowledgeBundle(
  root: string,
  options: BuildAiKnowledgeBundleOptions = {},
): Promise<void> {
  const bundle = await buildAiKnowledgeBundle(root, options);
  const outputRoot = join(root, defaultAiBundlePaths.root);
  const knowledgeRoot = join(root, defaultAiBundlePaths.knowledge);

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(knowledgeRoot, { recursive: true });
  await writeFile(join(root, defaultAiBundlePaths.manifest), json(bundle.manifest));
  await writeFile(join(root, defaultAiBundlePaths.index), json(bundle.index));
  await writeFile(join(root, defaultAiBundlePaths.rules), bundle.rules);

  for (const document of bundle.documents) {
    await writeFile(join(outputRoot, document.path), document.content);
  }
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
```

- [ ] **Step 4: Implement bundle verifier**

Create `packages/ai/src/bundle/verify.ts`:

```ts
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildAiKnowledgeBundle } from './generator.js';
import { defaultAiBundlePaths } from './paths.js';
import { isAiBundleManifest, type AiBundleManifest } from './schema.js';

export interface AiBundleVerificationResult {
  ok: boolean;
  failures: string[];
}

export async function verifyAiKnowledgeBundle(root: string): Promise<AiBundleVerificationResult> {
  const failures: string[] = [];
  const expected = await buildAiKnowledgeBundle(root, {
    now: () => new Date('2026-05-27T00:00:00.000Z'),
  });
  const manifest = await readManifest(root, failures);

  if (manifest !== undefined && manifest.sourceFingerprint !== expected.manifest.sourceFingerprint) {
    failures.push('AI bundle is stale: source fingerprint changed.');
  }

  for (const path of requiredBundlePaths(expected.documents.map((document) => document.path))) {
    try {
      await access(join(root, defaultAiBundlePaths.root, path));
    } catch {
      failures.push(`Missing AI bundle file: ${defaultAiBundlePaths.root}/${path}`);
    }
  }

  return { ok: failures.length === 0, failures };
}

async function readManifest(
  root: string,
  failures: string[],
): Promise<AiBundleManifest | undefined> {
  try {
    const manifest = JSON.parse(
      await readFile(join(root, defaultAiBundlePaths.manifest), 'utf8'),
    ) as unknown;

    if (!isAiBundleManifest(manifest)) {
      failures.push('AI bundle manifest has unsupported schema.');
      return undefined;
    }

    return manifest;
  } catch {
    failures.push(`Missing AI bundle file: ${defaultAiBundlePaths.manifest}`);
    return undefined;
  }
}

function requiredBundlePaths(documentPaths: string[]): string[] {
  return ['manifest.json', 'index.json', 'rules.md', ...documentPaths];
}
```

- [ ] **Step 5: Export writer and verifier**

Modify `packages/ai/src/index.ts`:

```ts
export { verifyAiKnowledgeBundle, type AiBundleVerificationResult } from './bundle/verify.js';
export { writeAiKnowledgeBundle } from './bundle/writer.js';
```

- [ ] **Step 6: Run writer and verifier tests**

Run:

```sh
pnpm --filter @vanrot/ai test
```

Expected: PASS.

- [ ] **Step 7: Generate official bundle**

Run:

```sh
pnpm --filter @vanrot/ai build
node -e "import('./packages/ai/dist/index.js').then(({ writeAiKnowledgeBundle }) => writeAiKnowledgeBundle(process.cwd(), { now: () => new Date('2026-05-27T00:00:00.000Z') }))"
```

Expected: creates `docs/ai/manifest.json`, `docs/ai/index.json`, `docs/ai/rules.md`, and `docs/ai/knowledge/*.md`.

- [ ] **Step 8: Checkpoint**

Report generated file paths and verify that `docs/ai/manifest.json` has `coverageStatus: "complete"`.

## Task 5: Add `verify:ai-docs`

**Files:**
- Create: `scripts/verify-ai-docs.mjs`
- Create: `scripts/verify-ai-docs.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing verification script tests**

Create `scripts/verify-ai-docs.test.mjs`:

```js
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatAiDocsFailures } from './verify-ai-docs.mjs';

describe('verify-ai-docs', () => {
  it('formats readable failures', () => {
    expect(formatAiDocsFailures(['AI bundle is stale: source fingerprint changed.'])).toBe(
      'AI docs verification failed.\n- AI bundle is stale: source fingerprint changed.\nRun `vr ai build` and commit the refreshed docs/ai bundle.',
    );
  });
});
```

- [ ] **Step 2: Run failing script test**

Run:

```sh
vitest run scripts/verify-ai-docs.test.mjs
```

Expected: FAIL because `scripts/verify-ai-docs.mjs` does not exist.

- [ ] **Step 3: Implement verification script**

Create `scripts/verify-ai-docs.mjs`:

```js
import { verifyAiKnowledgeBundle } from '../packages/ai/dist/index.js';

export function formatAiDocsFailures(failures) {
  return [
    'AI docs verification failed.',
    ...failures.map((failure) => `- ${failure}`),
    'Run `vr ai build` and commit the refreshed docs/ai bundle.',
  ].join('\n');
}

export async function verifyAiDocs(root = process.cwd()) {
  const result = await verifyAiKnowledgeBundle(root);

  if (result.ok) {
    return { exitCode: 0, message: 'AI docs verification passed.' };
  }

  return { exitCode: 1, message: formatAiDocsFailures(result.failures) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await verifyAiDocs();
  console.log(result.message);
  process.exitCode = result.exitCode;
}
```

- [ ] **Step 4: Update root scripts**

Modify `package.json` scripts:

```json
{
  "test:phase-docs": "vitest run scripts/verify-phase-docs.test.mjs scripts/verify-site-docs.test.mjs scripts/verify-ai-docs.test.mjs",
  "verify:ai-docs": "node scripts/verify-ai-docs.mjs",
  "verify": "pnpm typecheck && pnpm test && pnpm build && pnpm verify:size && pnpm verify:site-docs && pnpm verify:ai-docs && pnpm verify:phase-docs"
}
```

Keep all existing scripts not shown here.

- [ ] **Step 5: Run focused verification**

Run:

```sh
pnpm --filter @vanrot/ai build
vitest run scripts/verify-ai-docs.test.mjs
pnpm verify:ai-docs
```

Expected: PASS and `AI docs verification passed.`

- [ ] **Step 6: Checkpoint**

Report that `verify:ai-docs` is wired into root `verify`.

## Task 6: Extend `vr ai` Commands

**Files:**
- Modify: `packages/cli/package.json`
- Modify: `packages/cli/tsconfig.json`
- Modify: `packages/cli/src/ai/paths.ts`
- Modify: `packages/cli/src/commands/ai.ts`
- Modify: `packages/cli/src/commands/metadata.ts`
- Modify: `packages/cli/tests/ai-doorway.test.ts`
- Modify: `packages/cli/tests/cli.test.ts`

- [ ] **Step 1: Add failing CLI tests**

Append to `packages/cli/tests/ai-doorway.test.ts`:

```ts
describe('AI knowledge bundle CLI', () => {
  it('builds and verifies the AI knowledge bundle', async () => {
    const cwd = process.cwd();
    const buildReporter = createMemoryReporter();
    const buildResult = await runCli(['ai', 'build'], { cwd, reporter: buildReporter });

    expect(buildResult.exitCode).toBe(0);
    expect(buildReporter.output()).toContain('AI knowledge bundle');
    expect(buildReporter.output()).toContain('docs/ai/manifest.json');

    const verifyReporter = createMemoryReporter();
    const verifyResult = await runCli(['ai', 'verify'], { cwd, reporter: verifyReporter });

    expect(verifyResult.exitCode).toBe(0);
    expect(verifyReporter.output()).toContain('AI docs verification passed');
  });

  it('explains bundle state with vr ai doctor', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ai', 'doctor'], { cwd: process.cwd(), reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('AI bundle');
    expect(reporter.output()).toContain('schema');
    expect(reporter.output()).toContain('source fingerprint');
  });

  it('prints MCP setup through vr ai mcp --help', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ai', 'mcp', '--help'], { cwd: process.cwd(), reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('vanrot-mcp');
    expect(reporter.output()).toContain('stdio');
  });
});
```

Modify `packages/cli/tests/cli.test.ts` root help expectation:

```ts
expect(out).toContain('ai <action>                Build and inspect AI-readable Vanrot knowledge');
```

- [ ] **Step 2: Run failing CLI tests**

Run:

```sh
pnpm --filter @vanrot/cli test -- ai-doorway.test.ts cli.test.ts
```

Expected: FAIL because CLI does not call the new bundle APIs and help text still uses old wording.

- [ ] **Step 3: Add CLI package dependency and reference**

Modify `packages/cli/package.json` dependencies and prebuild scripts:

```json
{
  "dependencies": {
    "@vanrot/ai": "file:../ai",
    "@vanrot/config": "file:../config",
    "@vanrot/devtools": "file:../devtools",
    "@vanrot/ui": "file:../ui",
    "typescript": "^5.9.3"
  },
  "scripts": {
    "prebuild": "pnpm --filter @vanrot/config build && pnpm --filter @vanrot/ui build && pnpm --filter @vanrot/devtools build && pnpm --filter @vanrot/ai build",
    "pretypecheck": "pnpm --filter @vanrot/config build && pnpm --filter @vanrot/ui build && pnpm --filter @vanrot/devtools build && pnpm --filter @vanrot/ai build",
    "pretest": "pnpm --filter @vanrot/config build && pnpm --filter @vanrot/ui build && pnpm --filter @vanrot/devtools build && pnpm --filter @vanrot/ai build"
  }
}
```

Keep unchanged fields from the current file.

Modify `packages/cli/tsconfig.json` references:

```json
"references": [
  { "path": "../ui" },
  { "path": "../config" },
  { "path": "../devtools" },
  { "path": "../ai" }
]
```

- [ ] **Step 4: Extend AI paths**

Modify `packages/cli/src/ai/paths.ts`:

```ts
export interface AiPaths {
  directory: string;
  context: string;
  doctor: string;
  prompt: string;
  history: string;
  summary: string;
  bundle: string;
}

// inside ensureAiDirectory return object
bundle: join(root, 'bundle'),
```

- [ ] **Step 5: Update command metadata**

Modify the `commandName.ai` metadata in `packages/cli/src/commands/metadata.ts`:

```ts
{
  name: commandName.ai,
  usage: commandInvocation(commandName.ai),
  rootUsage: 'ai <action>',
  description: 'Build and inspect AI-readable Vanrot knowledge',
  help: `vr ai build
vr ai verify
vr ai doctor
vr ai mcp --help
vr ai context
vr ai prompt
vr ai record --code <code> --message <message>
vr ai summarize`,
},
```

- [ ] **Step 6: Add CLI action handling**

Modify `packages/cli/src/commands/ai.ts`. Add imports:

```ts
import {
  defaultAiBundlePaths,
  verifyAiKnowledgeBundle,
  writeAiKnowledgeBundle,
} from '@vanrot/ai';
```

Add action branches before existing project-context actions:

```ts
if (action === 'build') {
  await writeAiKnowledgeBundle(context.cwd);
  context.reporter.success('AI knowledge bundle generated');
  context.reporter.info(defaultAiBundlePaths.manifest);
  context.reporter.nextSteps(['Run vr ai verify before committing docs/ai changes.']);
  return ok();
}

if (action === 'verify') {
  const result = await verifyAiKnowledgeBundle(context.cwd);

  if (!result.ok) {
    context.reporter.error('AI docs verification failed');
    context.reporter.nextSteps(['Run vr ai build and review docs/ai changes.']);
    for (const failure of result.failures) {
      context.reporter.info(failure);
    }
    return fail();
  }

  context.reporter.success('AI docs verification passed');
  return ok();
}

if (action === 'doctor') {
  const result = await verifyAiKnowledgeBundle(context.cwd);
  context.reporter.heading('AI bundle');
  context.reporter.info(`schema ${result.ok ? 'supported' : 'needs attention'}`);
  context.reporter.info(`source fingerprint ${result.ok ? 'fresh' : 'stale or missing'}`);

  for (const failure of result.failures) {
    context.reporter.info(failure);
  }

  return result.ok ? ok() : fail();
}

if (action === 'mcp') {
  if (args.includes('--help') || args.includes('-h')) {
    context.reporter.line([
      'vr ai mcp',
      '',
      'Runs the local Vanrot MCP server over stdio.',
      '',
      'Setup',
      '  Command: vanrot-mcp',
      '  Transport: stdio',
    ].join('\n'));
    return ok();
  }

  context.reporter.info('Run `vanrot-mcp` from the Vanrot workspace to start the MCP stdio server.');
  return ok();
}
```

Keep existing `context`, `prompt`, `record`, and `summarize` branches below these branches.

- [ ] **Step 7: Run CLI tests**

Run:

```sh
pnpm --filter @vanrot/cli test -- ai-doorway.test.ts cli.test.ts
```

Expected: PASS.

- [ ] **Step 8: Checkpoint**

Report new `vr ai` actions and confirm old AI doorway tests still pass.

## Task 7: Add MCP Server Consumer

**Files:**
- Create: `packages/ai/src/mcp/server.ts`
- Create: `packages/ai/src/mcp/bin.ts`
- Modify: `packages/ai/src/index.ts`
- Create: `packages/ai/tests/mcp.test.ts`

- [ ] **Step 1: Write failing MCP tests**

Create `packages/ai/tests/mcp.test.ts`:

```ts
import { createAiKnowledgeBundle, createVanrotMcpServer } from '../src/index.js';
import { describe, expect, it } from 'vitest';

describe('Vanrot MCP server', () => {
  it('creates bundle-backed resource handlers', () => {
    const bundle = createAiKnowledgeBundle(
      {
        root: process.cwd(),
        vanrotVersion: '0.0.0',
        sourceFingerprint: 'sha256-demo',
        sources: [],
        frameworkReference: {
          packages: [{ name: '@vanrot/runtime', summary: 'Runtime package.' }],
          publicExports: [],
          commands: [{ name: 'create', usage: 'vr create <name>', summary: 'Create app.' }],
          diagnostics: [{ code: 'VR001', summary: 'Compiler diagnostic.' }],
          generatedFiles: [],
          conventions: [{ id: 'signals-for-state', summary: 'Use signals for state.' }],
          examples: [],
          limitations: [],
          maturity: [],
          routeMetadata: [],
        },
        siteData: { articles: [] },
      },
      { now: () => new Date('2026-05-27T00:00:00.000Z') },
    );

    const server = createVanrotMcpServer(bundle);

    expect(server.name).toBe('vanrot');
    expect(server.version).toBe('0.0.0');
  });
});
```

- [ ] **Step 2: Run failing MCP tests**

Run:

```sh
pnpm --filter @vanrot/ai test -- mcp.test.ts
```

Expected: FAIL because MCP exports are missing.

- [ ] **Step 3: Implement MCP server factory**

Create `packages/ai/src/mcp/server.ts`:

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AiKnowledgeBundle } from '../bundle/generator.js';

export interface VanrotMcpServer {
  name: string;
  version: string;
  server: McpServer;
}

export function createVanrotMcpServer(bundle: AiKnowledgeBundle): VanrotMcpServer {
  const server = new McpServer({
    name: 'vanrot',
    version: bundle.manifest.vanrotVersion,
  });

  registerTextResource(server, 'vanrot-docs', 'vanrot://docs', JSON.stringify(bundle.index, null, 2));
  registerTextResource(server, 'vanrot-rules', 'vanrot://patterns', bundle.rules);
  registerTextResource(server, 'vanrot-commands', 'vanrot://commands', JSON.stringify(bundle.index.commands, null, 2));
  registerTextResource(server, 'vanrot-diagnostics', 'vanrot://diagnostics', JSON.stringify(bundle.index.diagnostics, null, 2));
  registerTextResource(server, 'vanrot-examples', 'vanrot://examples', JSON.stringify(bundle.index.examples, null, 2));

  server.registerTool(
    'search_vanrot_knowledge',
    {
      description: 'Search the official Vanrot AI knowledge bundle.',
      inputSchema: z.object({ query: z.string().min(1) }),
    },
    async ({ query }) => ({
      content: [{ type: 'text', text: searchBundle(bundle, query) }],
    }),
  );

  return { name: 'vanrot', version: bundle.manifest.vanrotVersion, server };
}

function registerTextResource(server: McpServer, name: string, uri: string, text: string): void {
  server.registerResource(
    name,
    uri,
    {
      title: name,
      description: `Official Vanrot ${name} resource.`,
      mimeType: 'text/plain',
    },
    async (resourceUri) => ({
      contents: [{ uri: resourceUri.href, text }],
    }),
  );
}

function searchBundle(bundle: AiKnowledgeBundle, query: string): string {
  const lowerQuery = query.toLowerCase();
  const matches = [
    ...bundle.index.commands,
    ...bundle.index.diagnostics,
    ...bundle.index.packages,
    ...bundle.index.conventions,
    ...bundle.index.examples,
  ].filter((entry) => `${entry.title} ${entry.summary}`.toLowerCase().includes(lowerQuery));

  if (matches.length === 0) {
    return 'No Vanrot knowledge entries matched the query.';
  }

  return matches.map((entry) => `${entry.title}: ${entry.summary}`).join('\n');
}
```

- [ ] **Step 4: Implement MCP stdio bin**

Create `packages/ai/src/mcp/bin.ts`:

```ts
#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { buildAiKnowledgeBundle } from '../bundle/generator.js';
import { createVanrotMcpServer } from './server.js';

const bundle = await buildAiKnowledgeBundle(process.cwd());
const { server } = createVanrotMcpServer(bundle);
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Vanrot MCP server running on stdio');
```

- [ ] **Step 5: Export MCP APIs**

Modify `packages/ai/src/index.ts`:

```ts
export { createVanrotMcpServer, type VanrotMcpServer } from './mcp/server.js';
```

- [ ] **Step 6: Run MCP tests**

Run:

```sh
pnpm --filter @vanrot/ai test -- mcp.test.ts
pnpm --filter @vanrot/ai typecheck
```

Expected: PASS.

- [ ] **Step 7: Checkpoint**

Report MCP resources and search tool names.

## Task 8: Add Skill.sh Package Consumer

**Files:**
- Create: `packages/ai/src/skill/generator.ts`
- Modify: `packages/ai/src/bundle/writer.ts`
- Modify: `packages/ai/src/index.ts`
- Create: `packages/ai/tests/skill.test.ts`
- Create: `docs/ai/skill/SKILL.md`
- Create: `docs/ai/skill/skill.json`

- [ ] **Step 1: Write failing Skill.sh tests**

Create `packages/ai/tests/skill.test.ts`:

```ts
import { createSkillPackageFiles } from '../src/index.js';
import { describe, expect, it } from 'vitest';

describe('Skill.sh package generator', () => {
  it('creates skill files that point to the official bundle', () => {
    const files = createSkillPackageFiles({
      vanrotVersion: '0.0.0',
      manifestPath: 'docs/ai/manifest.json',
      rulesPath: 'docs/ai/rules.md',
    });

    expect(files.find((file) => file.path === 'skill/SKILL.md')?.content).toContain(
      'Use the official Vanrot AI knowledge bundle',
    );
    expect(files.find((file) => file.path === 'skill/skill.json')?.content).toContain(
      '"name": "vanrot"',
    );
  });
});
```

- [ ] **Step 2: Run failing Skill.sh tests**

Run:

```sh
pnpm --filter @vanrot/ai test -- skill.test.ts
```

Expected: FAIL because `createSkillPackageFiles` is missing.

- [ ] **Step 3: Implement Skill.sh generator**

Create `packages/ai/src/skill/generator.ts`:

```ts
export interface CreateSkillPackageFilesOptions {
  vanrotVersion: string;
  manifestPath: string;
  rulesPath: string;
}

export interface SkillPackageFile {
  path: string;
  content: string;
}

export function createSkillPackageFiles(
  options: CreateSkillPackageFilesOptions,
): SkillPackageFile[] {
  return [
    {
      path: 'skill/SKILL.md',
      content: [
        '---',
        'name: vanrot',
        'description: Use the official Vanrot AI knowledge bundle for framework rules, commands, diagnostics, examples, and conventions.',
        '---',
        '',
        '# Vanrot',
        '',
        'Use the official Vanrot AI knowledge bundle before answering Vanrot framework questions or editing Vanrot apps.',
        '',
        `- Manifest: \`${options.manifestPath}\``,
        `- Rules: \`${options.rulesPath}\``,
        `- Version: \`${options.vanrotVersion}\``,
        '',
        'Prefer the generated bundle over source-code guessing. If the manifest is stale, ask the user to run `vr ai build`.',
        '',
      ].join('\n'),
    },
    {
      path: 'skill/skill.json',
      content: `${JSON.stringify(
        {
          name: 'vanrot',
          version: options.vanrotVersion,
          manifest: options.manifestPath,
          rules: options.rulesPath,
        },
        null,
        2,
      )}\n`,
    },
  ];
}
```

- [ ] **Step 4: Write Skill.sh files during bundle generation**

Modify `packages/ai/src/bundle/writer.ts`:

```ts
import { createSkillPackageFiles } from '../skill/generator.js';

// after writing knowledge documents
await mkdir(join(outputRoot, 'skill'), { recursive: true });
for (const file of createSkillPackageFiles({
  vanrotVersion: bundle.manifest.vanrotVersion,
  manifestPath: defaultAiBundlePaths.manifest,
  rulesPath: defaultAiBundlePaths.rules,
})) {
  await writeFile(join(outputRoot, file.path), file.content);
}
```

- [ ] **Step 5: Export Skill.sh generator**

Modify `packages/ai/src/index.ts`:

```ts
export {
  createSkillPackageFiles,
  type CreateSkillPackageFilesOptions,
  type SkillPackageFile,
} from './skill/generator.js';
```

- [ ] **Step 6: Run Skill.sh tests and regenerate bundle**

Run:

```sh
pnpm --filter @vanrot/ai test -- skill.test.ts
pnpm --filter @vanrot/ai build
node -e "import('./packages/ai/dist/index.js').then(({ writeAiKnowledgeBundle }) => writeAiKnowledgeBundle(process.cwd(), { now: () => new Date('2026-05-27T00:00:00.000Z') }))"
```

Expected: PASS and creates `docs/ai/skill/SKILL.md` plus `docs/ai/skill/skill.json`.

- [ ] **Step 7: Checkpoint**

Report Skill.sh generated files and confirm they reference `docs/ai/manifest.json`.

## Task 9: Harden Coverage And Failure Messages

**Files:**
- Modify: `packages/ai/src/bundle/verify.ts`
- Modify: `packages/ai/tests/bundle.test.ts`
- Modify: `scripts/verify-ai-docs.test.mjs`

- [ ] **Step 1: Add failing coverage tests**

Append to `packages/ai/tests/bundle.test.ts`:

```ts
describe('AI bundle coverage', () => {
  it('fails when generated index counts do not match manifest counts', async () => {
    const root = await createFrameworkReferenceFixture();
    await writeAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });
    await writeFile(join(root, 'docs', 'ai', 'index.json'), JSON.stringify({ commands: [] }));

    const result = await verifyAiKnowledgeBundle(root);

    expect(result.ok).toBe(false);
    expect(result.failures).toContain('AI bundle index is incomplete: commands count does not match manifest.');
  });

  it('fails when Skill.sh package files are missing', async () => {
    const root = await createFrameworkReferenceFixture();
    await writeAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });
    await writeFile(join(root, 'docs', 'ai', 'skill', 'SKILL.md'), '');

    const result = await verifyAiKnowledgeBundle(root);

    expect(result.ok).toBe(false);
    expect(result.failures).toContain('AI Skill.sh package is incomplete: docs/ai/skill/SKILL.md is empty.');
  });
});
```

- [ ] **Step 2: Run failing coverage tests**

Run:

```sh
pnpm --filter @vanrot/ai test -- bundle.test.ts
```

Expected: FAIL because verifier does not inspect index count or Skill.sh file content yet.

- [ ] **Step 3: Add index and Skill.sh checks**

Modify `packages/ai/src/bundle/verify.ts`:

```ts
const index = await readIndex(root, failures);
if (manifest !== undefined && index !== undefined) {
  checkIndexCount('commands', manifest.counts.commands, index.commands, failures);
  checkIndexCount('packages', manifest.counts.packages, index.packages, failures);
  checkIndexCount('diagnostics', manifest.counts.diagnostics, index.diagnostics, failures);
  checkIndexCount('examples', manifest.counts.examples, index.examples, failures);
}

await checkNonEmptyFile(root, 'docs/ai/skill/SKILL.md', failures);
await checkNonEmptyFile(root, 'docs/ai/skill/skill.json', failures);
```

Add helper functions in the same file:

```ts
async function readIndex(
  root: string,
  failures: string[],
): Promise<Record<string, unknown[]> | undefined> {
  try {
    return JSON.parse(await readFile(join(root, defaultAiBundlePaths.index), 'utf8')) as Record<
      string,
      unknown[]
    >;
  } catch {
    failures.push(`Missing AI bundle file: ${defaultAiBundlePaths.index}`);
    return undefined;
  }
}

function checkIndexCount(
  name: string,
  expected: number,
  actual: unknown[] | undefined,
  failures: string[],
): void {
  if (!Array.isArray(actual) || actual.length !== expected) {
    failures.push(`AI bundle index is incomplete: ${name} count does not match manifest.`);
  }
}

async function checkNonEmptyFile(root: string, path: string, failures: string[]): Promise<void> {
  try {
    if ((await readFile(join(root, path), 'utf8')).trim() === '') {
      failures.push(`AI Skill.sh package is incomplete: ${path} is empty.`);
    }
  } catch {
    failures.push(`Missing AI bundle file: ${path}`);
  }
}
```

- [ ] **Step 4: Run coverage tests**

Run:

```sh
pnpm --filter @vanrot/ai test -- bundle.test.ts
vitest run scripts/verify-ai-docs.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Regenerate and verify official bundle**

Run:

```sh
pnpm --filter @vanrot/ai build
node -e "import('./packages/ai/dist/index.js').then(({ writeAiKnowledgeBundle }) => writeAiKnowledgeBundle(process.cwd(), { now: () => new Date('2026-05-27T00:00:00.000Z') }))"
pnpm verify:ai-docs
```

Expected: PASS.

- [ ] **Step 6: Checkpoint**

Report the stale, missing, unsupported, and incomplete states covered by tests.

## Task 10: Update Phase Closeout Docs

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-25.md`

- [ ] **Step 1: Confirm implementation tasks are complete**

Run:

```sh
rg -n "^- \\[ \\]" docs/superpowers/plans/Phase-25.md
```

Expected before closeout: output only for Task 10 unchecked steps. Do not mark Phase 25 complete while earlier task checkboxes remain unchecked.

- [ ] **Step 2: Update feature maturity**

Modify the Phase 25 row in `docs/superpowers/feature-maturity.md`:

```md
| [x]  | Phase 25 | AI consumption                              | AI-readable docs bundle, framework knowledge manifest, MCP server, Skill.sh package, optional AI commands                                                  | Codex, Claude, and other AI tools can consume official Vanrot knowledge instead of guessing framework behavior.                                         |
```

Leave Phase 26 unchecked and next.

- [ ] **Step 3: Update final TDD inventory**

Add rows to `docs/superpowers/final-tdd-inventory.md` under the most relevant section:

```md
| ai consumption | `@vanrot/ai` package | Production-Ready | Generates, writes, verifies, and exports the official Vanrot AI knowledge bundle. | Phase 25, Phase 26 | Final release pass should verify bundle output from a clean checkout. |
| ai consumption | `docs/ai` generated bundle | Production-Ready | Manifest, index, provider-neutral rules, knowledge docs, and Skill.sh files stay fresh against source fingerprints. | Phase 25, Phase 26 | `pnpm verify:ai-docs` owns drift checks. |
| ai consumption | Vanrot MCP server | Production-Ready | Local stdio MCP server exposes bundle-backed docs, commands, diagnostics, patterns, examples, and search. | Phase 25, Phase 26 | No network access required. |
| ai consumption | `vr ai` bundle commands | Production-Ready | `vr ai build`, `verify`, `doctor`, and `mcp` use the same bundle contract as MCP and Skill.sh. | Phase 25, Phase 26 | Existing project-context AI doorway commands remain covered. |
```

- [ ] **Step 4: Update presentation roadmap**

Modify `docs/vanrot-presentation.html` so Phase 25 is visually done and Phase 26 is the next active phase. Use the same markup pattern used for Phase 23 and Phase 24 completion.

- [ ] **Step 5: Mark plan tasks complete**

Tick completed steps in `docs/superpowers/plans/Phase-25.md`. Keep any failed verification step unchecked until it passes.

- [ ] **Step 6: Run phase docs verification**

Run:

```sh
pnpm verify:phase-docs
```

Expected: PASS. If it fails, fix only the reported tracker, plan, inventory, or presentation mismatch.

- [ ] **Step 7: Checkpoint**

Report the tracker, inventory, presentation, and plan updates.

## Task 11: Full Verification

**Files:**
- No new files.

- [ ] **Step 1: Run focused package tests**

Run:

```sh
pnpm --filter @vanrot/ai test
pnpm --filter @vanrot/cli test -- ai-doorway.test.ts cli.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run focused verification scripts**

Run:

```sh
pnpm verify:site-docs
pnpm verify:ai-docs
pnpm verify:phase-docs
```

Expected: PASS.

- [ ] **Step 3: Run full verification**

Run:

```sh
pnpm verify
```

Expected: PASS.

- [ ] **Step 4: Capture git status**

Run:

```sh
git status --short --branch
```

Expected: branch remains `main...origin/main`; modified files are the Phase 25 implementation files and any pre-existing unrelated local edits remain untouched.

- [ ] **Step 5: Final checkpoint**

Report:

- changed files;
- commands that passed;
- any command that failed and exact failure summary;
- current `git status --short --branch`;
- that no commit, branch, push, or staging was performed unless the user asked.
