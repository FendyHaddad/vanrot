import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cliCommands, commandGroups } from '@/commands/metadata.js';
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
    expect(reporter.output()).toContain('VANROT');
    expect(reporter.output()).toContain('create <name>');
    expect(reporter.output()).toContain('doctor');
    expect(reporter.output()).toContain('map');
    expect(reporter.output()).toContain('init-ai');
    expect(reporter.output()).toContain('add <primitive>');
    expect(reporter.output()).toContain('ui <component>');
  });

  it('prints grouped root help with descriptions and examples', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['--help'], {
      cwd: process.cwd(),
      reporter,
    });

    const out = reporter.output();

    expect(result.exitCode).toBe(0);
    expect(out).toContain('VANROT');
    expect(out).toContain('Usage   vr <command> [options]');
    expect(out).toContain('SCAFFOLD');
    expect(out).toContain('create <name>              Create a new Vanrot project');
    expect(out).toContain('generate <role> <name>     Generate a component or page');
    expect(out).toContain('add <primitive>            Add a UI primitive to the project');
    expect(out).toContain('ui <component>             Inspect UI component APIs and tokens');
    expect(out).toContain('DEVELOPMENT');
    expect(out).toContain('dev                        Start dev server with HMR');
    expect(out).toContain('build                      Compile and bundle for production');
    expect(out).toContain('test                       Run the test suite');
    expect(out).toContain('MAINTENANCE');
    expect(out).toContain('doctor                     Check project health and config');
    expect(out).toContain('config <action>            Validate, migrate, or recover config');
    expect(out).toContain('map                        Print the project structure map');
    expect(out).toContain('init-ai                    Set up AI context rules for this project');
    expect(out).toContain('ai <action>                Write AI-readable project context');
    expect(out).toContain(
      'e.g.  vr create my-app  ·  vr generate component header  ·  vr add button',
    );
    expect(out).toContain('Run vr <command> --help for flags and examples.');
  });

  it('keeps every root command in exactly one help group with a description', () => {
    const groupedCommands = commandGroups.flatMap((group) => group.commands);
    const commandNames = cliCommands.map((command) => command.name);

    expect(groupedCommands).toEqual([
      'create',
      'generate',
      'add',
      'ui',
      'dev',
      'build',
      'test',
      'doctor',
      'config',
      'map',
      'init-ai',
      'ai',
    ]);

    expect(new Set(groupedCommands).size).toBe(groupedCommands.length);
    expect([...groupedCommands].sort()).toEqual([...commandNames].sort());

    for (const command of cliCommands) {
      expect(command.description.length).toBeGreaterThan(10);
    }
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

  it('prints ui command help without dispatching component help', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ui', '--help'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('vr ui list');
    expect(reporter.output()).toContain('vr ui <component> --help');
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
    expect(source).toContain('port: 1964');
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

  it('rejects structured output for unsupported human write commands', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['generate', 'component', 'home', '--json'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('error     --json is not supported for vr generate');
    expect(reporter.output()).toContain('next      Run vr generate without --json or --jsonl.');
  });

  it('prints final json for supported read commands', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['--json', 'doctor'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBeTypeOf('number');
    expect(reporter.output()).toContain('"type": "result"');
    expect(reporter.output()).toContain('"command": "doctor"');
    expect(reporter.output()).toContain('"exitCode"');
  });
});
