import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('vr create seo selection', () => {
  it('includes SEO dependency, config, and utility file when selected', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(
      ['create', 'seo-app', '--workspace', '--seo', '--seo-site-url', 'https://vanrot.vankode.com'],
      { cwd, reporter },
    );
    const appRoot = join(cwd, 'seo-app');
    const packageJson = JSON.parse(await readFile(join(appRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const configSource = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');
    const seoUtility = await readFile(join(appRoot, 'src', 'app', 'seo.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(packageJson.dependencies?.['@vanrot/seo']).toBe('workspace:*');
    expect(configSource).toContain('seo: {');
    expect(configSource).toContain("siteUrl: 'https://vanrot.vankode.com'");
    expect(seoUtility).toContain('homeSeo');
  });

  it('leaves SEO out when skipped', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'lean-seo-app', '--no-seo'], { cwd, reporter });
    const appRoot = join(cwd, 'lean-seo-app');
    const packageJson = JSON.parse(await readFile(join(appRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const configSource = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(packageJson.dependencies?.['@vanrot/seo']).toBeUndefined();
    expect(configSource).not.toContain('seo:');
    await expect(stat(join(appRoot, 'src', 'app', 'seo.ts'))).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });
});

async function tempRoot(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'vanrot-seo-create-'));
}
