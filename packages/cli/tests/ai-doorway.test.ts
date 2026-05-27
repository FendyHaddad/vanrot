import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { describe, expect, it } from 'vitest';

async function tempProject() {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-ai-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  await mkdir(join(cwd, 'apps/vanrot-site/src/docs'), { recursive: true });
  await mkdir(join(cwd, 'packages/cli/src/commands'), { recursive: true });
  await mkdir(join(cwd, 'docs/superpowers'), { recursive: true });
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify({ name: 'demo', version: '0.0.0', private: true }),
  );
  await writeFile(
    join(cwd, 'vanrot.config.ts'),
    "export default { schemaVersion: 1, source: { root: 'src' }, devServer: { port: 1964 }, ai: { enabled: true, directory: '.vanrot/ai', history: true } };\n",
  );
  await writeFile(join(cwd, 'src', 'home.page.ts'), 'export class HomePage {}\n');
  await writeFile(join(cwd, 'src', 'home.page.html'), '<main>{{ title() }}</main>\n');
  await writeFile(join(cwd, 'src', 'home.page.css'), 'main { display: block; }\n');
  await writeFile(join(cwd, 'packages/cli/src/commands/metadata.ts'), 'export const commands = [];\n');
  await writeFile(join(cwd, 'docs/superpowers/feature-maturity.md'), '| [ ] | Phase 25 |\n');
  await writeFile(join(cwd, 'docs/superpowers/final-tdd-inventory.md'), '| ai | bundle |\n');
  await writeFile(
    join(cwd, 'apps/vanrot-site/src/docs/framework-reference.json'),
    JSON.stringify(createFrameworkReferenceFixture()),
  );
  await writeFile(
    join(cwd, 'apps/vanrot-site/src/docs/site-data.json'),
    JSON.stringify(createSiteDataFixture()),
  );
  return cwd;
}

describe('AI doorway', () => {
  it('initializes .vanrot/ai and gitignores it', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['init-ai'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(await readFile(join(cwd, '.gitignore'), 'utf8')).toContain('.vanrot/ai/');
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'context.json'), 'utf8')).toContain(
      '"schemaVersion": 1',
    );
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'prompt.md'), 'utf8')).toContain(
      'Vanrot project context',
    );
  });

  it('writes deterministic context, doctor, and prompt files', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    expect((await runCli(['ai', 'context'], { cwd, reporter })).exitCode).toBe(0);
    expect((await runCli(['ai', 'doctor'], { cwd, reporter })).exitCode).toBe(0);
    expect((await runCli(['ai', 'prompt'], { cwd, reporter })).exitCode).toBe(0);

    expect(await readFile(join(cwd, '.vanrot', 'ai', 'context.json'), 'utf8')).toContain(
      '"sourceRoot": "src"',
    );
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'doctor.json'), 'utf8')).toContain(
      '"findings"',
    );
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'prompt.md'), 'utf8')).toContain(
      'Run `vr doctor` before changing files.',
    );
  });

  it('records manual history and summarizes unresolved entries first', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    expect(
      (
        await runCli(
          [
            'ai',
            'record',
            '--code',
            'VR_BUILD_FAILED',
            '--file',
            'src/home.page.ts',
            '--message',
            'build failed',
          ],
          { cwd, reporter },
        )
      ).exitCode,
    ).toBe(0);
    expect((await runCli(['ai', 'summarize'], { cwd, reporter })).exitCode).toBe(0);

    const summary = await readFile(join(cwd, '.vanrot', 'ai', 'summary.md'), 'utf8');
    expect(summary).toContain('# Vanrot AI Summary');
    expect(summary).toContain('## Unresolved');
    expect(summary).toContain('VR_BUILD_FAILED');
    expect(summary).toContain('src/home.page.ts');
  });

  it('fails when AI is disabled in config', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'vanrot.config.ts'), 'export default { ai: { enabled: false } };\n');
    const reporter = createMemoryReporter();

    const result = await runCli(['ai', 'context'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('error     Vanrot AI doorway is disabled');
    expect(reporter.output()).toContain('next      Enable ai.enabled in vanrot.config.ts.');
  });

  it('builds and verifies the AI knowledge bundle', async () => {
    const cwd = await tempProject();
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
    const cwd = await tempProject();
    await runCli(['ai', 'build'], { cwd, reporter: createMemoryReporter() });
    const reporter = createMemoryReporter();
    const result = await runCli(['ai', 'doctor'], { cwd, reporter });

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

function createFrameworkReferenceFixture() {
  return {
    packages: [{ name: '@vanrot/runtime', summary: 'Signals and mounting.' }],
    publicExports: [{ packageName: '@vanrot/runtime', name: 'signal', summary: 'Reactive state.' }],
    commands: [{ name: 'create', usage: 'vr create <name>', summary: 'Create an app.' }],
    diagnostics: [{ code: 'VR001', summary: 'Compiler diagnostic.' }],
    generatedFiles: [{ path: 'src/app.page.ts', summary: 'Page role file.' }],
    conventions: [{ id: 'signals', title: 'Signals for state', summary: 'Use signals for state.' }],
    examples: [{ title: 'Counter', summary: 'Minimal counter app.' }],
    limitations: [{ title: 'No SSR yet' }],
    maturity: [{ phase: '25' }],
    routeMetadata: [{ path: '/docs' }],
    deployment: [{ title: 'Static docs' }],
  };
}

function createSiteDataFixture() {
  return {
    articles: [{ key: 'introduction', title: 'Vanrot', summary: 'Small UI framework.' }],
    primitiveDocs: [{ primitive: 'button' }],
    commands: [{ name: 'create' }],
    packages: [{ name: '@vanrot/runtime' }],
    diagnostics: { compiler: [{ code: 'VR001' }] },
  };
}
