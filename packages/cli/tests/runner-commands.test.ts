import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import type { ProcessRunner } from '../src/process/runner.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

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
  it('runs vite for vr dev', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const result = await runCli(['dev'], { cwd: '/demo', reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([{ command: 'vite', args: ['--port', '1010'], cwd: '/demo' }]);
    expect(reporter.output()).toContain('Starting Vanrot dev server');
  });

  it('runs vite build for vr build', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const result = await runCli(['build'], { cwd: '/demo', reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([{ command: 'vite', args: ['build'], cwd: '/demo' }]);
    expect(reporter.output()).toContain('Building Vanrot app');
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
