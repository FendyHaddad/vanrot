import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '@/index.js';
import type { ProcessRunner } from '@/process/runner.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { describe, expect, it } from 'vitest';

function fakeRunner(exitCode = 0) {
  const calls: Array<{ command: string; args: string[]; cwd: string }> = [];
  const runner: ProcessRunner = {
    async run(command, args, options) {
      calls.push({ command, args, cwd: options.cwd });
      return exitCode;
    },
  };

  return { calls, runner };
}

async function createProject(packageJson: Record<string, unknown>) {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-update-upgrade-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  await writeFile(join(cwd, 'src', 'main.ts'), 'console.log("demo");\n');
  await writeFile(join(cwd, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
  return cwd;
}

describe('update and upgrade commands', () => {
  it('syncs config, project map, and AI files with vr update', async () => {
    const cwd = await createProject({
      name: 'demo',
      private: true,
      dependencies: {
        '@vanrot/runtime': '^0.1.0',
      },
      devDependencies: {
        '@vanrot/cli': '^0.1.0',
      },
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['update'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(await readFile(join(cwd, 'vanrot.config.ts'), 'utf8')).toContain(
      'defineVanrotConfig',
    );
    expect(await readFile(join(cwd, '.vanrot', 'project-map.json'), 'utf8')).toContain(
      '"graph"',
    );
    expect(await readFile(join(cwd, '.vanrot', 'ai-rules.md'), 'utf8')).toContain(
      'Vanrot',
    );
    expect(reporter.output()).toContain('Vanrot Update');
  });

  it('rejects unknown update targets with a stable diagnostic code', async () => {
    const cwd = await createProject({ name: 'demo', private: true });
    const reporter = createMemoryReporter();

    const result = await runCli(['update', 'banana'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('VR_UPDATE_TARGET_INVALID');
    expect(reporter.output()).toContain('Run vr update --help.');
  });

  it('bumps every Vanrot dependency with vr upgrade', async () => {
    const cwd = await createProject({
      name: 'demo',
      private: true,
      dependencies: {
        '@vanrot/runtime': '^0.1.0',
        '@vanrot/router': '^0.1.0',
        vite: '^8.0.10',
      },
      devDependencies: {
        '@vanrot/cli': '^0.1.0',
        '@vanrot/vite-plugin': '^0.1.0',
      },
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['upgrade', '0.2.0', '--no-install', '--no-update'], {
      cwd,
      reporter,
    });
    const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(result.exitCode).toBe(0);
    expect(packageJson.dependencies['@vanrot/runtime']).toBe('^0.2.0');
    expect(packageJson.dependencies['@vanrot/router']).toBe('^0.2.0');
    expect(packageJson.dependencies.vite).toBe('^8.0.10');
    expect(packageJson.devDependencies['@vanrot/cli']).toBe('^0.2.0');
    expect(packageJson.devDependencies['@vanrot/vite-plugin']).toBe('^0.2.0');
    expect(reporter.output()).toContain('upgraded @vanrot/runtime');
  });

  it('runs the detected package manager and update step after upgrade', async () => {
    const cwd = await createProject({
      name: 'demo',
      private: true,
      dependencies: {
        '@vanrot/runtime': '^0.1.0',
      },
    });
    await writeFile(join(cwd, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();

    const result = await runCli(['upgrade', '0.2.0'], { cwd, reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([{ command: 'pnpm', args: ['install'], cwd }]);
    expect(await readFile(join(cwd, 'vanrot.config.ts'), 'utf8')).toContain(
      'defineVanrotConfig',
    );
  });

  it('reports projects without Vanrot packages before installing', async () => {
    const cwd = await createProject({
      name: 'demo',
      private: true,
      dependencies: {
        vite: '^8.0.10',
      },
    });
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();

    const result = await runCli(['upgrade', '0.2.0'], { cwd, reporter, runner });

    expect(result.exitCode).toBe(1);
    expect(calls).toEqual([]);
    expect(reporter.output()).toContain('VR_UPGRADE_NO_PACKAGES');
  });

  it('reports package manager failures with a stable diagnostic code', async () => {
    const cwd = await createProject({
      name: 'demo',
      private: true,
      dependencies: {
        '@vanrot/runtime': '^0.1.0',
      },
    });
    const { runner } = fakeRunner(1);
    const reporter = createMemoryReporter();

    const result = await runCli(['upgrade', '0.2.0'], { cwd, reporter, runner });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('VR_UPGRADE_PACKAGE_MANAGER_FAILED');
  });
});
