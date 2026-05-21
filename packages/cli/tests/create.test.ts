import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'vanrot-cli-create-'));
}

describe('vr create', () => {
  it('creates a standalone-style Vanrot app', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'demo-app'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'demo-app', 'package.json'), 'utf8')).resolves.toContain(
      '"dev": "vr dev"',
    );
    await expect(readFile(join(cwd, 'demo-app', 'vite.config.ts'), 'utf8')).resolves.toContain(
      '@vanrot/vite-plugin',
    );
    await expect(readFile(join(cwd, 'demo-app', 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "from './app.component.ts'",
    );
    await expect(
      readFile(join(cwd, 'demo-app', 'src', 'app.component.ts'), 'utf8'),
    ).resolves.toContain('export class AppComponent');
    await expect(
      readFile(join(cwd, 'demo-app', 'src', 'app.component.html'), 'utf8'),
    ).resolves.toContain('{{ title() }}');
    await expect(
      readFile(join(cwd, 'demo-app', 'src', 'app.component.css'), 'utf8'),
    ).resolves.toContain('.app');
    expect(reporter.output()).toContain('Created demo-app');
    expect(reporter.output()).toContain('vr dev');
  });

  it('uses workspace dependencies for fixture mode', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'fixture-app', '--workspace'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const packageJson = await readFile(join(cwd, 'fixture-app', 'package.json'), 'utf8');
    expect(packageJson).toContain('"@vanrot/runtime": "workspace:*"');
    expect(packageJson).toContain('"@vanrot/vite-plugin": "workspace:*"');
    expect(packageJson).toContain('"@vanrot/cli": "workspace:*"');
  });

  it('does not overwrite non-empty directories without --force', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();
    const target = join(cwd, 'existing');
    await mkdir(target);
    await writeFile(join(target, 'keep.txt'), 'do not delete');

    const result = await runCli(['create', 'existing'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Target directory is not empty');
    await expect(readFile(join(target, 'keep.txt'), 'utf8')).resolves.toBe('do not delete');
  });

  it('can create into an existing directory with --force', async () => {
    const cwd = await tempRoot();
    const target = join(cwd, 'forced');
    await mkdir(target);
    await writeFile(join(target, 'old.txt'), 'old');
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'forced', '--force'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const files = await readdir(target);
    expect(files).toContain('package.json');
    expect(files).toContain('old.txt');
  });
});
