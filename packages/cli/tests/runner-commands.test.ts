import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import type { ProcessRunner } from '../src/process/runner.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function tempProject(engine: 'forge' | 'vite') {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-runner-'));
  await writeFile(join(cwd, 'package.json'), '{"name":"runner-app","private":true}');
  await writeFile(
    join(cwd, 'vanrot.config.ts'),
    [
      "import { defineVanrotConfig } from '@vanrot/config';",
      '',
      'export default defineVanrotConfig({',
      `  engine: '${engine}',`,
      '});',
      '',
    ].join('\n'),
  );

  return cwd;
}

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

describe('runner-backed commands', () => {
  it('runs Forge for vr dev when config selects Forge', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const cwd = await tempProject('forge');

    const result = await runCli(['dev'], { cwd, reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([
      {
        command: 'vanrot-forge',
        args: ['dev', '--host', '127.0.0.1', '--port', '1964'],
        cwd,
      },
    ]);
    expect(reporter.output()).toContain('Starting Vanrot dev server');
  });

  it('runs Vite for vr dev when config selects Vite', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const cwd = await tempProject('vite');

    const result = await runCli(['dev'], { cwd, reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([
      { command: 'vite', args: ['--host', '127.0.0.1', '--port', '1964'], cwd },
    ]);
    expect(reporter.output()).toContain('Starting Vanrot dev server');
  });

  it('runs Forge for vr build when config selects Forge', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const cwd = await tempProject('forge');

    const result = await runCli(['build'], { cwd, reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([{ command: 'vanrot-forge', args: ['build'], cwd }]);
    expect(reporter.output()).toContain('Building Vanrot app');
  });

  it('runs Vite for vr build when config selects Vite', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const cwd = await tempProject('vite');

    const result = await runCli(['build'], { cwd, reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([{ command: 'vite', args: ['build'], cwd }]);
    expect(reporter.output()).toContain('Building Vanrot app');
  });

  it('honors --vite and --forge one-command overrides', async () => {
    const forgeProject = await tempProject('forge');
    const viteProject = await tempProject('vite');
    const first = fakeRunner();
    const second = fakeRunner();
    const forgeConfigBefore = await readFile(join(forgeProject, 'vanrot.config.ts'), 'utf8');
    const viteConfigBefore = await readFile(join(viteProject, 'vanrot.config.ts'), 'utf8');

    const viteResult = await runCli(['dev', '--vite'], {
      cwd: forgeProject,
      reporter: createMemoryReporter(),
      runner: first.runner,
    });
    const forgeResult = await runCli(['build', '--forge'], {
      cwd: viteProject,
      reporter: createMemoryReporter(),
      runner: second.runner,
    });

    expect(viteResult.exitCode).toBe(0);
    expect(forgeResult.exitCode).toBe(0);
    expect(first.calls).toEqual([
      {
        command: 'vite',
        args: ['--host', '127.0.0.1', '--port', '1964'],
        cwd: forgeProject,
      },
    ]);
    expect(second.calls).toEqual([
      { command: 'vanrot-forge', args: ['build'], cwd: viteProject },
    ]);
    await expect(readFile(join(forgeProject, 'vanrot.config.ts'), 'utf8')).resolves.toBe(
      forgeConfigBefore,
    );
    await expect(readFile(join(viteProject, 'vanrot.config.ts'), 'utf8')).resolves.toBe(
      viteConfigBefore,
    );
  });

  it('runs vitest run for vr test', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const result = await runCli(['test'], { cwd: '/demo', reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([{ command: 'vitest', args: ['run'], cwd: '/demo' }]);
    expect(reporter.output()).toContain('Running Vanrot tests');
  });

  it('returns a failure when the wrapped command fails', async () => {
    const { runner } = fakeRunner(1);
    const reporter = createMemoryReporter();
    const result = await runCli(['build'], { cwd: '/demo', reporter, runner });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Build failed');
  });
});
