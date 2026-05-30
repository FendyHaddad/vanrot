import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('vr remove behavior', () => {
  it('removes a behavior name from vanrot.config.ts and keeps the package by default', async () => {
    const cwd = await createFixtureProject({
      packageJson: {
        dependencies: {
          '@vanrot/behavior': '^0.1.0',
        },
      },
      config: `import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  behavior: {
    enabled: ['tooltip', 'toast'],
  },
});
`,
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['remove', 'behavior', 'tooltip'], { cwd, reporter });

    const configSource = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };

    expect(result.exitCode).toBe(0);
    expect(configSource).not.toContain("'tooltip'");
    expect(configSource).toContain("'toast'");
    expect(packageJson.dependencies?.['@vanrot/behavior']).toBe('^0.1.0');
  });

  it('removes the behavior package with --package when no behavior remains', async () => {
    const cwd = await createFixtureProject({
      packageJson: {
        dependencies: {
          '@vanrot/behavior': '^0.1.0',
        },
      },
      config: `import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  behavior: {
    enabled: ['tooltip'],
  },
});
`,
    });

    const result = await runCli(['remove', 'behavior', 'tooltip', '--package'], {
      cwd,
      reporter: createMemoryReporter(),
    });

    const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const configSource = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(packageJson.dependencies?.['@vanrot/behavior']).toBeUndefined();
    expect(configSource).not.toContain('behavior:');
  });

  it('rejects unknown behavior names', async () => {
    const cwd = await createFixtureProject({
      packageJson: { dependencies: { '@vanrot/behavior': '^0.1.0' } },
      config: 'export default { schemaVersion: 1 };\n',
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['remove', 'behavior', 'accordion'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Unknown behavior helper');
  });
});

async function createFixtureProject(options: {
  packageJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  config: string;
}): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-behavior-remove-'));
  await mkdir(join(cwd, 'src'));
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify(
      {
        name: 'fixture-app',
        scripts: {
          dev: 'vr dev',
          build: 'vr build',
          test: 'vr test',
          doctor: 'vr doctor',
        },
        ...options.packageJson,
      },
      null,
      2,
    ),
  );
  await writeFile(join(cwd, 'vite.config.ts'), 'export default {};\n');
  await writeFile(join(cwd, 'vanrot.config.ts'), options.config);
  return cwd;
}
