import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('vr doctor behavior checks', () => {
  it('warns when @vanrot/behavior is installed but no behavior is configured or imported', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/behavior': '^0.1.0' },
      config: 'export default { schemaVersion: 1 };\n',
      source: 'export const value = 1;\n',
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('VRTB001');
  });

  it('warns when configured behavior has no matching import', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/behavior': '^0.1.0' },
      config: `export default {
  schemaVersion: 1,
  behavior: { enabled: ['tooltip'] },
};
`,
      source: 'export const value = 1;\n',
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('VRTB002');
  });

  it('warns when behavior imports are not declared in config', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/behavior': '^0.1.0' },
      config: 'export default { schemaVersion: 1 };\n',
      source: "import { createTooltipController } from '@vanrot/behavior/tooltip';\n",
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('VRTB003');
  });

  it('warns about stale runtime behavior imports', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/runtime': '^0.1.0' },
      config: 'export default { schemaVersion: 1 };\n',
      source: "import { createTooltipController } from '@vanrot/runtime';\n",
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('VRTB004');
  });

  it('warns about root behavior imports when a subpath is cleaner', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/behavior': '^0.1.0' },
      config: `export default {
  schemaVersion: 1,
  behavior: { enabled: ['tooltip'] },
};
`,
      source: "import { createTooltipController } from '@vanrot/behavior';\n",
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('VRTB005');
  });
});

async function createDoctorProject(options: {
  dependencies: Record<string, string>;
  config: string;
  source: string;
}): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-behavior-doctor-'));
  await mkdir(join(cwd, 'src'));
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify(
      {
        name: 'doctor-fixture',
        scripts: {
          dev: 'vr dev',
          build: 'vr build',
          test: 'vr test',
          doctor: 'vr doctor',
        },
        dependencies: options.dependencies,
        devDependencies: {
          '@vanrot/vite-plugin': '^0.2.0',
          vite: '^8.0.10',
        },
      },
      null,
      2,
    ),
  );
  await writeFile(join(cwd, 'vite.config.ts'), 'export default {};\n');
  await writeFile(join(cwd, 'vanrot.config.ts'), withViteEngine(options.config));
  await writeFile(join(cwd, 'src', 'app.page.ts'), options.source);
  await writeFile(join(cwd, 'src', 'app.page.html'), '<main></main>\n');
  await writeFile(join(cwd, 'src', 'app.page.css'), ':host { display: block; }\n');
  return cwd;
}

function withViteEngine(source: string): string {
  return source.replace(/schemaVersion:\s*1,?/, "schemaVersion: 1,\n  engine: 'vite',");
}
