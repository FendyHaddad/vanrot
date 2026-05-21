import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'vanrot-cli-add-'));
}

describe('vr add', () => {
  it('adds the default button primitive to a generated app', async () => {
    const cwd = await tempRoot();
    const createReporter = createMemoryReporter();
    await runCli(['create', 'demo-app', '--workspace'], { cwd, reporter: createReporter });
    const appRoot = join(cwd, 'demo-app');
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd: appRoot, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(appRoot, 'src', 'ui', 'button', 'ui.button.ts'), 'utf8')).resolves.toContain(
      'export class UiButton',
    );
    await expect(readFile(join(appRoot, 'src', 'ui', 'button', 'ui.button.html'), 'utf8')).resolves.toContain(
      '<vr-button type="button">',
    );
    await expect(readFile(join(appRoot, 'src', 'ui', 'button', 'ui.button.css'), 'utf8')).resolves.toContain(
      '.vr-button-primary',
    );
    await expect(readFile(join(appRoot, 'src', 'styles', 'vanrot-ui.css'), 'utf8')).resolves.toContain(
      "@import '../ui/button/ui.button.css';",
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "import './styles/vanrot-ui.css';",
    );
    await expect(readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.html'), 'utf8')).resolves.toContain(
      '<vr-button class="vr-button-primary" type="button">',
    );
    expect(reporter.output()).toContain('Added button');
  });

  it('adds a custom-prefixed button primitive', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'primary', 'button'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'src', 'ui', 'button', 'primary.button.ts'), 'utf8')).resolves.toContain(
      'export class PrimaryButton',
    );
    await expect(readFile(join(cwd, 'src', 'ui', 'button', 'primary.button.html'), 'utf8')).resolves.toContain(
      '<vr-button type="button">',
    );
    await expect(readFile(join(cwd, 'src', 'styles', 'vanrot-ui.css'), 'utf8')).resolves.toContain(
      "@import '../ui/button/primary.button.css';",
    );
  });

  it('does not add duplicate style imports', async () => {
    const cwd = await tempRoot();
    await mkdir(join(cwd, 'src'), { recursive: true });
    await writeFile(join(cwd, 'src', 'main.ts'), "import './styles/vanrot-ui.css';\n");
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd, reporter });
    const main = await readFile(join(cwd, 'src', 'main.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(main.match(/vanrot-ui\.css/g)).toHaveLength(1);
  });

  it('rejects unsupported primitives', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'card'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Unsupported UI primitive: card');
    expect(reporter.output()).toContain('Phase 9 supports: button');
  });

  it('rejects invalid local prefixes', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'Primary', 'button'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Invalid UI primitive prefix: Primary');
    expect(reporter.output()).toContain('Use lowercase kebab-case, for example primary or marketing-primary.');
  });

  it('does not overwrite existing primitive files', async () => {
    const cwd = await tempRoot();
    await mkdir(join(cwd, 'src', 'ui', 'button'), { recursive: true });
    await writeFile(join(cwd, 'src', 'ui', 'button', 'ui.button.ts'), 'keep me');
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('File already exists: src/ui/button/ui.button.ts');
    await expect(readFile(join(cwd, 'src', 'ui', 'button', 'ui.button.ts'), 'utf8')).resolves.toBe(
      'keep me',
    );
  });
});
