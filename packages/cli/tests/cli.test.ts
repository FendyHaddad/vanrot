import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('runCli', () => {
  it('prints root help', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['--help'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot CLI');
    expect(reporter.output()).toContain('vr create <name>');
    expect(reporter.output()).toContain('vr doctor');
  });

  it('reports unknown commands with a suggestion', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['craete', 'demo'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Unknown command: craete');
    expect(reporter.output()).toContain('Did you mean vr create?');
  });

  it('prints command help without executing a command', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['create', '--help'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('vr create <name>');
    expect(reporter.output()).toContain('--workspace');
    expect(reporter.output()).toContain('--force');
  });
});
