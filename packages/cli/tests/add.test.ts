// @vitest-environment node

import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { uiPrimitiveOrder } from '@vanrot/ui';
import { describe, expect, it } from 'vitest';
import { toPascalCase } from '../src/generate/names.js';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'vanrot-cli-add-'));
}

function toPrimitiveFileName(primitive: string): string {
  return primitive.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
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
      '.vr-button-secondary',
    );
    await expect(readFile(join(appRoot, 'src', 'styles', 'vanrot-ui.css'), 'utf8')).resolves.toContain(
      "@import '../ui/button/ui.button.css';",
    );
    await expect(readFile(join(appRoot, 'src', 'styles', 'vanrotstyles.css'), 'utf8')).resolves.toContain(
      '@layer vanrotstyles',
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "import './styles/vanrot-ui.css';",
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "import './styles/vanrotstyles.css';",
    );
    await expect(readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.html'), 'utf8')).resolves.toContain(
      '<vr-button variant.default type="button">',
    );
    await expect(readFile(join(appRoot, 'vanrot.config.ts'), 'utf8')).resolves.toContain(
      "ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' },",
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
    await expect(readFile(join(cwd, 'src', 'styles', 'vanrotstyles.css'), 'utf8')).resolves.toContain(
      '@layer vanrotstyles',
    );
    await expect(readFile(join(cwd, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "import './styles/vanrotstyles.css';",
    );
    await expect(readFile(join(cwd, 'src', 'styles', 'vanrot-ui.css'), 'utf8')).resolves.toContain(
      "@import '../ui/button/primary.button.css';",
    );
    await expect(readFile(join(cwd, 'src', 'ui', 'button', 'primary.button.test.ts'), 'utf8')).rejects.toThrow();
  });

  it('adds a Phase 16B card primitive', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'card'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'src', 'ui', 'card', 'ui.card.ts'), 'utf8')).resolves.toContain(
      'export class UiCard',
    );
    await expect(readFile(join(cwd, 'src', 'ui', 'card', 'ui.card.html'), 'utf8')).resolves.toContain(
      '<vr-card>',
    );
    await expect(readFile(join(cwd, 'src', 'ui', 'card', 'ui.card.css'), 'utf8')).resolves.toContain(
      '.vr-card',
    );
    await expect(readFile(join(cwd, 'src', 'styles', 'vanrot-ui.css'), 'utf8')).resolves.toContain(
      "@import '../ui/card/ui.card.css';",
    );
  });

  it.each(uiPrimitiveOrder)('adds the supported %s primitive', async (primitive) => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();
    const className = `Ui${toPascalCase(primitive)}`;
    const primitiveFileName = toPrimitiveFileName(primitive);
    const directory = join(cwd, 'src', 'ui', primitiveFileName);

    const result = await runCli(['add', primitive], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    await expect(
      readFile(join(directory, `ui.${primitiveFileName}.ts`), 'utf8'),
    ).resolves.toContain(`export class ${className}`);
    await expect(
      readFile(join(directory, `ui.${primitiveFileName}.html`), 'utf8'),
    ).resolves.toContain(`<vr-${primitiveFileName}`);
  });

  it('adds Phase 16F interaction primitives from registry-backed assets', async () => {
    for (const primitive of ['dialog', 'drawer', 'dropdown', 'tabs', 'toast'] as const) {
      const cwd = await tempRoot();
      const reporter = createMemoryReporter();

      const result = await runCli(['add', primitive], { cwd, reporter });

      expect(result.exitCode).toBe(0);
      await expect(
        readFile(join(cwd, 'src', 'ui', primitive, `ui.${primitive}.html`), 'utf8'),
      ).resolves.toContain(`<vr-${primitive}`);
      expect(reporter.output()).toContain(`Added ${primitive}`);
    }
  });

  it('adds Phase 16G final primitives from registry-backed assets', async () => {
    for (const primitive of ['popover', 'tooltip', 'commandMenu'] as const) {
      const cwd = await tempRoot();
      const reporter = createMemoryReporter();
      const primitiveFileName = toPrimitiveFileName(primitive);

      const result = await runCli(['add', primitive], { cwd, reporter });

      expect(result.exitCode).toBe(0);
      await expect(
        readFile(join(cwd, 'src', 'ui', primitiveFileName, `ui.${primitiveFileName}.html`), 'utf8'),
      ).resolves.toContain(`<vr-${primitiveFileName}`);
      expect(reporter.output()).toContain(`Added ${primitive}`);
    }
  });

  it('adds a locally prefixed Phase 16B primitive', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'profile', 'avatar'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'src', 'ui', 'avatar', 'profile.avatar.ts'), 'utf8')).resolves.toContain(
      'export class ProfileAvatar',
    );
    await expect(readFile(join(cwd, 'src', 'styles', 'vanrot-ui.css'), 'utf8')).resolves.toContain(
      "@import '../ui/avatar/profile.avatar.css';",
    );
  });

  it('adds an opt-in custom-prefixed button test', async () => {
    const cwd = await tempRoot();
    await writeFile(
      join(cwd, 'package.json'),
      `${JSON.stringify(
        {
          name: 'demo',
          private: true,
          devDependencies: {
            '@vanrot/cli': 'workspace:*',
          },
        },
        null,
        2,
      )}\n`,
    );
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'primary', 'button', '--test'], { cwd, reporter });
    const buttonTest = await readFile(join(cwd, 'src', 'ui', 'button', 'primary.button.test.ts'), 'utf8');
    const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as {
      devDependencies?: Record<string, string>;
    };

    expect(result.exitCode).toBe(0);
    expect(packageJson.devDependencies?.['@vanrot/testing']).toBe('workspace:*');
    expect(packageJson.devDependencies?.jsdom).toBe('^29.1.1');
    expect(buttonTest).toContain('@vitest-environment jsdom');
    expect(buttonTest).toContain("import { testComponent } from '@vanrot/testing';");
    expect(buttonTest).toContain("import { PrimaryButton } from './primary.button.ts';");
    expect(buttonTest).not.toContain('@ts-expect-error');
    expect(buttonTest).toContain('testComponent(PrimaryButton).can');
    expect(buttonTest).toContain('function (screen)');
    expect(buttonTest).toContain("label: 'Button'");
    expect(buttonTest).toContain('screen.expect.text(buttonCopy.label);');
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

  it('does not add vanrotstyles when project config selects Tailwind', async () => {
    const cwd = await tempRoot();
    const createReporter = createMemoryReporter();
    await runCli(['create', 'tailwind-app', '--workspace'], { cwd, reporter: createReporter });
    const appRoot = join(cwd, 'tailwind-app');
    const mainPath = join(appRoot, 'src', 'main.ts');
    const starterMain = await readFile(mainPath, 'utf8');
    await writeFile(mainPath, starterMain.replace("import './styles/vanrotstyles.css';\n", ''));
    await writeFile(
      join(appRoot, 'vanrot.config.ts'),
      [
        "import { defineVanrotConfig } from '@vanrot/config';",
        '',
        'export default defineVanrotConfig({',
        '  schemaVersion: 1,',
        "  source: { root: 'src' },",
        '  devServer: { port: 1964 },',
        "  ui: { flavor: 'october', styles: 'tailwind', prefix: 'ui' },",
        '});',
        '',
      ].join('\n'),
    );
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd: appRoot, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(appRoot, 'src', 'styles', 'vanrotstyles.css'), 'utf8')).resolves.toContain(
      '@layer vanrotstyles',
    );
    const main = await readFile(join(appRoot, 'src', 'main.ts'), 'utf8');
    expect(main).not.toContain("import './styles/vanrotstyles.css';");
    expect(main).toContain("import './styles/vanrot-tokens.css';");
  });

  it('does not add vanrotstyles when project config selects no utility layer', async () => {
    const cwd = await tempRoot();
    const createReporter = createMemoryReporter();
    await runCli(['create', 'plain-app', '--workspace'], { cwd, reporter: createReporter });
    const appRoot = join(cwd, 'plain-app');
    const mainPath = join(appRoot, 'src', 'main.ts');
    const starterMain = await readFile(mainPath, 'utf8');
    await writeFile(mainPath, starterMain.replace("import './styles/vanrotstyles.css';\n", ''));
    await writeFile(
      join(appRoot, 'vanrot.config.ts'),
      [
        "import { defineVanrotConfig } from '@vanrot/config';",
        '',
        'export default defineVanrotConfig({',
        '  schemaVersion: 1,',
        "  source: { root: 'src' },",
        '  devServer: { port: 1964 },',
        "  ui: { flavor: 'october', styles: 'none', prefix: 'ui' },",
        '});',
        '',
      ].join('\n'),
    );
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd: appRoot, reporter });

    expect(result.exitCode).toBe(0);
    const main = await readFile(join(appRoot, 'src', 'main.ts'), 'utf8');
    expect(main).not.toContain("import './styles/vanrotstyles.css';");
    expect(main).toContain("import './styles/vanrot-tokens.css';");
  });

  it('rejects unsupported primitives', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'combobox'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Unsupported UI primitive: combobox');
    expect(reporter.output()).toContain(`Supported UI primitives: ${uiPrimitiveOrder.join(', ')}`);
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

  it('does not overwrite an existing primitive test file', async () => {
    const cwd = await tempRoot();
    await mkdir(join(cwd, 'src', 'ui', 'button'), { recursive: true });
    await writeFile(join(cwd, 'src', 'ui', 'button', 'primary.button.test.ts'), 'keep test');
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'primary', 'button', '--test'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('File already exists: src/ui/button/primary.button.test.ts');
    await expect(readFile(join(cwd, 'src', 'ui', 'button', 'primary.button.test.ts'), 'utf8')).resolves.toBe(
      'keep test',
    );
    await expect(readFile(join(cwd, 'src', 'ui', 'button', 'primary.button.ts'), 'utf8')).rejects.toThrow();
  });
});
