import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createComponentFileSet, resolveComponentFiles } from '../../src/conventions/component-files.js';

describe('component file conventions', () => {
  it('resolves component siblings and expected class names', async () => {
    const root = await createFixtureDirectory({
      'counter.component.ts': 'export class CounterComponent {}',
      'counter.component.html': '<p>Ready</p>',
      'counter.component.css': 'p { color: red; }',
      'user-card.component.ts': 'export class UserCardComponent {}',
      'user-card.component.html': '<p>Ready</p>',
      'user-card.component.css': 'p { color: red; }',
    });

    await expect(resolveComponentFiles(join(root, 'counter.component.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'counter',
        expectedClassName: 'CounterComponent',
        templatePath: join(root, 'counter.component.html'),
        stylePath: join(root, 'counter.component.css'),
      },
      diagnostics: [],
    });
    await expect(resolveComponentFiles(join(root, 'user-card.component.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'user-card',
        expectedClassName: 'UserCardComponent',
      },
      diagnostics: [],
    });
  });

  it('reports invalid component file suffixes', async () => {
    const root = await createFixtureDirectory({
      'counter.ts': '',
    });

    await expect(resolveComponentFiles(join(root, 'counter.ts'))).resolves.toMatchObject({
      fileSet: null,
      diagnostics: [{ code: 'VR003' }],
    });
  });

  it('resolves page siblings and expected class names', async () => {
    const root = await createFixtureDirectory({
      'settings.page.ts': 'export class SettingsPage {}',
      'settings.page.html': '<p>Ready</p>',
      'settings.page.css': 'p { color: red; }',
    });

    await expect(resolveComponentFiles(join(root, 'settings.page.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'settings',
        expectedClassName: 'SettingsPage',
        templatePath: join(root, 'settings.page.html'),
        stylePath: join(root, 'settings.page.css'),
      },
      diagnostics: [],
    });
  });

  it('resolves layout siblings and expected class names', async () => {
    const root = await createFixtureDirectory({
      'shop.layout.ts': 'export class ShopLayout {}',
      'shop.layout.html': '<vr-outlet></vr-outlet>',
      'shop.layout.css': ':host { display: block; }',
    });

    await expect(resolveComponentFiles(join(root, 'shop.layout.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'shop',
        expectedClassName: 'ShopLayout',
        templatePath: join(root, 'shop.layout.html'),
        stylePath: join(root, 'shop.layout.css'),
      },
      diagnostics: [],
    });
  });


  it('resolves button primitive siblings and expected class names', async () => {
    const root = await createFixtureDirectory({
      'ui.button.ts': 'export class UiButton {}',
      'ui.button.html': '<vr-button type="button">Button</vr-button>',
      'ui.button.css': '.vr-button { display: inline-flex; }',
      'primary.button.ts': 'export class PrimaryButton {}',
      'primary.button.html': '<vr-button type="button">Primary</vr-button>',
      'primary.button.css': '.vr-button-primary { display: inline-flex; }',
    });

    await expect(resolveComponentFiles(join(root, 'ui.button.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'ui',
        expectedClassName: 'UiButton',
        templatePath: join(root, 'ui.button.html'),
        stylePath: join(root, 'ui.button.css'),
      },
      diagnostics: [],
    });
    await expect(resolveComponentFiles(join(root, 'primary.button.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'primary',
        expectedClassName: 'PrimaryButton',
        templatePath: join(root, 'primary.button.html'),
        stylePath: join(root, 'primary.button.css'),
      },
      diagnostics: [],
    });
  });

  it('resolves prefix-first UI role files', () => {
    expect(createComponentFileSet('/src/ui/button/ui.button.ts')).toMatchObject({
      componentPath: '/src/ui/button/ui.button.ts',
      templatePath: '/src/ui/button/ui.button.html',
      stylePath: '/src/ui/button/ui.button.css',
      componentBaseName: 'ui',
      expectedClassName: 'UiButton',
    });

    expect(createComponentFileSet('/src/ui/button/primary.button.ts')).toMatchObject({
      componentPath: '/src/ui/button/primary.button.ts',
      templatePath: '/src/ui/button/primary.button.html',
      stylePath: '/src/ui/button/primary.button.css',
      componentBaseName: 'primary',
      expectedClassName: 'PrimaryButton',
    });
  });

  it('reports missing sibling files', async () => {
    const root = await createFixtureDirectory({
      'counter.component.ts': 'export class CounterComponent {}',
    });

    await expect(resolveComponentFiles(join(root, 'counter.component.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'counter',
      },
      diagnostics: [{ code: 'VR001' }, { code: 'VR002' }],
    });
  });
});

async function createFixtureDirectory(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'vanrot-component-files-'));

  await mkdir(root, { recursive: true });

  await Promise.all(
    Object.entries(files).map(([fileName, content]) => writeFile(join(root, fileName), content)),
  );

  return root;
}
