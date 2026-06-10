import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('vr doctor seo checks', () => {
  it('warns when @vanrot/seo is installed without SEO config or imports', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/seo': '^0.2.0' },
      config: 'export default { schemaVersion: 1 };\n',
      source: 'export const value = 1;\n',
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('VRTS001');
  });

  it('reports SEO config syntax through doctor even without siteUrl', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/seo': '^0.2.0' },
      config: `export default {
  schemaVersion: 1,
  seo: {
    defaults: { title: 42 },
  },
};
`,
      source: "import { defineSeo } from '@vanrot/seo';\n",
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('VRCFG017');
    expect(reporter.output()).toContain('VRCFG015');
  });
});

async function createDoctorProject(options: {
  dependencies: Record<string, string>;
  config: string;
  source: string;
}): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-seo-doctor-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify(
      {
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          test: 'vitest run',
          doctor: 'vr doctor',
        },
        dependencies: {
          '@vanrot/config': '^0.2.0',
          '@vanrot/runtime': '^0.2.0',
          '@vanrot/router': '^0.2.0',
          '@vanrot/ui': '^0.2.0',
          ...options.dependencies,
        },
        devDependencies: {
          '@vanrot/cli': '^0.2.0',
          '@vanrot/vite-plugin': '^0.2.0',
          vite: '^8.0.10',
        },
      },
      null,
      2,
    ),
  );
  await writeFile(join(cwd, 'vanrot.config.ts'), withViteEngine(options.config));
  await writeFile(join(cwd, 'vite.config.ts'), 'export default {};\n');
  await writeFile(join(cwd, 'src', 'main.ts'), options.source);

  return cwd;
}

function withViteEngine(source: string): string {
  return source.replace(/schemaVersion:\s*1,?/, "schemaVersion: 1,\n  engine: 'vite',");
}
