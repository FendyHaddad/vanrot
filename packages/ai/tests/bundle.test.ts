import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  aiBundleSchemaVersion,
  buildAiKnowledgeBundle,
  createAiBundleManifest,
  defaultAiBundlePaths,
  isAiBundleManifest,
  readAiKnowledgeSource,
  readJsonFile,
  verifyAiKnowledgeBundle,
  writeAiKnowledgeBundle,
} from '../src/index.js';
import { describe, expect, it } from 'vitest';

describe('AI bundle schema', () => {
  it('creates a versioned manifest with deterministic counts', () => {
    const manifest = createAiBundleManifest({
      vanrotVersion: '0.0.0',
      generatedAt: '2026-05-27T00:00:00.000Z',
      sourceFingerprint: 'sha256-demo',
      sources: [
        {
          id: 'framework-reference',
          path: 'apps/vanrot-site/src/docs/framework-reference.json',
          fingerprint: 'one',
        },
      ],
      counts: {
        packages: 1,
        publicExports: 2,
        commands: 3,
        diagnostics: 4,
        generatedFiles: 5,
        conventions: 6,
        examples: 7,
        components: 8,
        routes: 9,
        limitations: 10,
        deployment: 11,
        docs: 12,
      },
    });

    expect(aiBundleSchemaVersion).toBe(1);
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.coverageStatus).toBe('complete');
    expect(manifest.counts.commands).toBe(3);
    expect(manifest.counts.components).toBe(8);
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

describe('AI bundle source reader', () => {
  it('reads reference docs and fingerprints the source files', async () => {
    const root = await createSourceFixture();
    const source = await readAiKnowledgeSource(root);

    expect(source.vanrotVersion).toBe('0.0.0');
    expect(source.frameworkReference.commands).toHaveLength(1);
    expect(source.siteData.articles).toHaveLength(1);
    expect(source.sourceFingerprint).toMatch(/^sha256-/);
    expect(source.sources.map((entry) => entry.id)).toEqual(
      expect.arrayContaining([
        'package-json',
        'framework-reference',
        'site-data',
        'cli-command-metadata',
        'feature-maturity',
        'final-tdd-inventory',
      ]),
    );
    expect(source.sources.every((entry) => entry.fingerprint.startsWith('sha256-'))).toBe(true);
  });

  it('reads json with a guided missing-file failure', async () => {
    await expect(readJsonFile('/missing/vanrot.json')).rejects.toThrow(
      'Unable to read JSON file /missing/vanrot.json',
    );
  });
});

describe('AI knowledge bundle generator', () => {
  it('builds manifest, index, knowledge docs, and rules from source data', async () => {
    const root = await createSourceFixture();

    const bundle = await buildAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });

    expect(bundle.manifest.generatedAt).toBe('2026-05-27T00:00:00.000Z');
    expect(bundle.manifest.counts.packages).toBe(1);
    expect(bundle.manifest.counts.commands).toBe(1);
    expect(bundle.manifest.counts.components).toBe(1);
    expect(bundle.manifest.counts.routes).toBe(1);
    expect(bundle.manifest.counts.limitations).toBe(1);
    expect(bundle.manifest.counts.deployment).toBe(1);
    expect(bundle.index.commands[0]).toEqual(
      expect.objectContaining({ id: 'command:create', title: 'vr create <name>' }),
    );
    expect(bundle.index.components[0]).toEqual(
      expect.objectContaining({ id: 'component:button', title: 'Button' }),
    );
    expect(bundle.index.routes[0]).toEqual(expect.objectContaining({ id: 'route:/docs' }));
    expect(bundle.documents.map((doc) => doc.path)).toContain('knowledge/commands.md');
    expect(bundle.documents.map((doc) => doc.path)).toContain('knowledge/components.md');
    expect(bundle.documents.map((doc) => doc.path)).toContain('knowledge/routes.md');
    expect(bundle.documents.map((doc) => doc.path)).toContain('knowledge/limitations.md');
    expect(bundle.documents.map((doc) => doc.path)).toContain('knowledge/docs.md');
    expect(bundle.documents.find((doc) => doc.path === 'knowledge/commands.md')?.content).toContain(
      'vr create <name>',
    );
    expect(bundle.rules).toContain('Use signals for state.');
    expect(bundle.rules).toContain('search_vanrot_knowledge');
    expect(bundle.rules).toContain('Do not put API keys');
  });
});

describe('AI bundle writer and verifier', () => {
  it('writes manifest, index, rules, and knowledge documents', async () => {
    const root = await createSourceFixture();

    await writeAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });

    const manifest = JSON.parse(await readFile(join(root, 'docs/ai/manifest.json'), 'utf8'));
    const index = JSON.parse(await readFile(join(root, 'docs/ai/index.json'), 'utf8'));
    const commands = await readFile(join(root, 'docs/ai/knowledge/commands.md'), 'utf8');
    const rules = await readFile(join(root, 'docs/ai/rules.md'), 'utf8');

    expect(manifest.sourceFingerprint).toMatch(/^sha256-/);
    expect(index.commands[0].title).toBe('vr create <name>');
    expect(index.components[0].title).toBe('Button');
    expect(commands).toContain('Create an app.');
    expect(rules).toContain('Use guard clauses');
    expect(rules).toContain('Security And Privacy');
  });

  it('verifies generated bundle freshness', async () => {
    const root = await createSourceFixture();
    await writeAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });

    await expect(verifyAiKnowledgeBundle(root)).resolves.toEqual({ ok: true, failures: [] });

    await writeFile(join(root, 'docs/ai/knowledge/commands.md'), 'changed');
    const result = await verifyAiKnowledgeBundle(root);

    expect(result.ok).toBe(false);
    expect(result.failures).toContain('docs/ai/knowledge/commands.md is stale.');
  });
});

describe('AI bundle coverage', () => {
  it('fails when generated index counts do not match manifest counts', async () => {
    const root = await createSourceFixture();
    await writeAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });
    await writeFile(join(root, 'docs', 'ai', 'index.json'), JSON.stringify({ commands: [] }));

    const result = await verifyAiKnowledgeBundle(root);

    expect(result.ok).toBe(false);
    expect(result.failures).toContain(
      'AI bundle index is incomplete: commands count does not match manifest.',
    );
  });

  it('fails when Skill.sh package files drift from the generated bundle metadata', async () => {
    const root = await createSourceFixture();
    await writeAiKnowledgeBundle(root, {
      now: () => new Date('2026-05-27T00:00:00.000Z'),
    });
    await writeFile(join(root, 'docs', 'ai', 'skill', 'skill.json'), '{}\n');

    const result = await verifyAiKnowledgeBundle(root);

    expect(result.ok).toBe(false);
    expect(result.failures).toContain('docs/ai/skill/skill.json is stale.');
  });
});

async function createSourceFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'vanrot-ai-source-'));
  const docsDirectory = join(root, 'apps/vanrot-site/src/docs');
  await mkdir(docsDirectory, { recursive: true });
  await mkdir(join(root, 'packages/cli/src/commands'), { recursive: true });
  await mkdir(join(root, 'docs/superpowers'), { recursive: true });
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ name: 'vanrot', version: '0.0.0' }, null, 2),
  );
  await writeFile(join(root, 'packages/cli/src/commands/metadata.ts'), 'export const commands = [];\n');
  await writeFile(join(root, 'docs/superpowers/feature-maturity.md'), '| [ ] | Phase 25 |\n');
  await writeFile(join(root, 'docs/superpowers/final-tdd-inventory.md'), '| ai | bundle |\n');
  await writeFile(
    join(docsDirectory, 'framework-reference.json'),
    JSON.stringify(createFrameworkReferenceFixture(), null, 2),
  );
  await writeFile(
    join(docsDirectory, 'site-data.json'),
    JSON.stringify(createSiteDataFixture(), null, 2),
  );

  return root;
}

function createFrameworkReferenceFixture() {
  return {
    packages: [{ name: '@vanrot/runtime', summary: 'Signals and mounting.' }],
    publicExports: [{ packageName: '@vanrot/runtime', name: 'signal', summary: 'Reactive state.' }],
    commands: [{ name: 'create', usage: 'vr create <name>', summary: 'Create an app.' }],
    diagnostics: [{ code: 'VR001', summary: 'Compiler diagnostic.' }],
    generatedFiles: [{ path: 'src/app.page.ts', summary: 'Page role file.' }],
    conventions: [{ id: 'signals', title: 'Signals for state', summary: 'Use signals for state.' }],
    examples: [{ title: 'Counter', summary: 'Minimal counter app.' }],
    limitations: [{ id: 'no-ssr', title: 'No SSR yet', summary: 'SSR is not implemented.' }],
    maturity: [{ phase: '25' }],
    routeMetadata: [{ path: '/docs', title: 'Docs', description: 'Framework documentation route.' }],
    deployment: {
      targetHost: 'vanrot.vankode.com',
      summary: 'Static docs deployment target.',
      docsPath: '/docs/deployment',
    },
  };
}

function createSiteDataFixture() {
  return {
    articles: [{ key: 'introduction' }],
    primitiveDocs: [
      {
        primitive: 'button',
        title: 'Button',
        summary: 'Button primitive.',
        usage: '<vr-button>Save</vr-button>',
        accessibility: 'Native button behavior.',
      },
    ],
    commands: [{ name: 'create' }],
    packages: [{ name: '@vanrot/runtime' }],
    diagnostics: { compiler: [{ code: 'VR001' }] },
  };
}
