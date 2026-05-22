import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { describe, expect, it } from 'vitest';

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
    expect(reporter.output()).toContain('vr map');
    expect(reporter.output()).toContain('vr init-ai');
    expect(reporter.output()).toContain('vr add button');
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

  it('prints add command help without executing the command', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['add', '--help'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('vr add button');
    expect(reporter.output()).toContain('vr add <local-prefix> button');
  });

  it('prints config command help', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['config', '--help'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('vr config migrate');
    expect(reporter.output()).toContain('vr config recover');
  });

  it('runs config migrate and writes canonical config', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-config-migrate-'));
    await writeFile(join(cwd, 'package.json'), '{"name":"demo","private":true}');
    const reporter = createMemoryReporter();

    const result = await runCli(['config', 'migrate'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const source = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    expect(source).toContain('defineVanrotConfig');
    expect(source).toContain('port: 1010');
  });

  it('runs config recover and includes inferred optional domains', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-config-recover-'));
    await writeFile(
      join(cwd, 'package.json'),
      JSON.stringify(
        {
          name: 'demo',
          private: true,
          dependencies: {
            '@vanrot/router': '^0.1.0',
            '@vanrot/ui': '^0.1.0',
          },
        },
        null,
        2,
      ),
    );
    const reporter = createMemoryReporter();

    const result = await runCli(['config', 'recover', '--force'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const source = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    expect(source).toContain('router: { mode: "history" }');
    expect(source).toContain('ui: { prefix: "ui" }');
  });

  it('prints project intelligence command help', async () => {
    const mapReporter = createMemoryReporter();
    const mapResult = await runCli(['map', '--help'], {
      cwd: process.cwd(),
      reporter: mapReporter,
    });

    expect(mapResult.exitCode).toBe(0);
    expect(mapReporter.output()).toContain('vr map');

    const aiReporter = createMemoryReporter();
    const aiResult = await runCli(['init-ai', '--help'], {
      cwd: process.cwd(),
      reporter: aiReporter,
    });

    expect(aiResult.exitCode).toBe(0);
    expect(aiReporter.output()).toContain('vr init-ai');
  });

  it('exports the process runner factory for the binary', async () => {
    const cli = await import('../src/index.js');

    expect(cli.createConsoleReporter).toBeTypeOf('function');
    expect(cli.createNodeProcessRunner).toBeTypeOf('function');
    expect(cli.runCli).toBeTypeOf('function');
  });
});
