import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('vr add seo', () => {
  it('installs SEO support after a project opted out during create', async () => {
    const cwd = await createSeoFixture();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'seo', '--site-url', 'https://vanrot.vankode.com'], {
      cwd,
      reporter,
    });
    const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const configSource = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    const seoUtility = await readFile(join(cwd, 'src', 'app', 'seo.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(packageJson.dependencies?.['@vanrot/seo']).toMatch(/^\^\d+\.\d+\.\d+/);
    expect(configSource).toContain('seo: {');
    expect(configSource).toContain("siteUrl: 'https://vanrot.vankode.com'");
    expect(seoUtility).toContain("from '@vanrot/seo'");
    expect(reporter.output()).toContain('Run vr doctor');
  });
});

async function createSeoFixture(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-seo-add-'));
  await mkdir(join(cwd, 'src', 'app'), { recursive: true });
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify(
      {
        type: 'module',
        dependencies: {
          '@vanrot/config': '^0.2.0',
          '@vanrot/runtime': '^0.2.0',
        },
      },
      null,
      2,
    ),
  );
  await writeFile(
    join(cwd, 'vanrot.config.ts'),
    [
      "import { defineVanrotConfig } from '@vanrot/config';",
      '',
      'export default defineVanrotConfig({',
      '  schemaVersion: 1,',
      "  source: { root: 'src' },",
      '  devServer: { port: 1964 },',
      '});',
      '',
    ].join('\\n'),
  );
  await stat(join(cwd, 'vanrot.config.ts'));

  return cwd;
}
