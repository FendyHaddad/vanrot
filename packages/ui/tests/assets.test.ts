// @vitest-environment node

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { uiAssetUrl } from '../src/index.js';

describe('@vanrot/ui assets', () => {
  it('keeps October dark and light tokens in CSS instead of TypeScript strings', async () => {
    const tokens = await readFile(fileURLToPath(uiAssetUrl.tokens), 'utf8');

    expect(tokens).toContain(':root');
    expect(tokens).toContain('[data-theme="dark"]');
    expect(tokens).toContain('[data-theme="light"]');
    expect(tokens).toContain('--vr-color-canvas');
    expect(tokens).toContain('--vr-surface-card');
    expect(tokens).toContain('--vr-font-sans');
    expect(tokens).toContain('Geist');
    expect(tokens).toContain('--vr-font-number');
    expect(tokens).toContain('JetBrains Mono');
    expect(tokens).toContain('--vr-font-feature-numeric');
    expect(tokens).toContain('"tnum" 1');
    expect(tokens).toContain('--vr-radius-md');
    expect(tokens).toContain('--vr-shadow-2');
    expect(tokens).toContain('--vr-z-modal');
    expect(tokens).toContain('--vr-motion-fast');
  });

  it('ships vanrotstyles utilities without vr-prefixed utility names', async () => {
    const styles = await readFile(fileURLToPath(uiAssetUrl.vanrotstyles), 'utf8');

    expect(styles).toContain('@layer vanrotstyles');
    expect(styles).toContain('.flex');
    expect(styles).toContain('.grid');
    expect(styles).toContain('.gap-2');
    expect(styles).toContain('.p-4');
    expect(styles).toContain('.radius-md');
    expect(styles).toContain('.shadow-2');
    expect(styles).toContain('.surface-card');
    expect(styles).toContain('.tabular-nums');
    expect(styles).toContain('.sr-only');
    expect(styles).not.toContain('.vr-flex');
    expect(styles).not.toContain('.vr-grid');
  });

  it('ships package inventory as a documentation asset', async () => {
    const inventory = await readFile(fileURLToPath(uiAssetUrl.docs.packageInventory), 'utf8');

    expect(inventory).toContain('@vanrot/ui Package Inventory');
    expect(inventory).toContain('vanrotstyles.css');
    expect(inventory).toContain('developer-owned');
  });

  it('ships UI ownership and styling guidelines', async () => {
    const guidelines = await readFile(fileURLToPath(uiAssetUrl.docs.guidelines), 'utf8');

    expect(guidelines).toContain('Vanrot UI is developer-owned');
    expect(guidelines).toContain("ui.styles: 'tailwind'");
    expect(guidelines).toContain("ui.styles: 'none'");
    expect(guidelines).toContain('Geist');
    expect(guidelines).toContain('JetBrains Mono');
  });

  it('keeps button markup in HTML files instead of TypeScript strings', async () => {
    const buttonTemplate = await readFile(fileURLToPath(uiAssetUrl.button.html), 'utf8');
    const homeUsage = await readFile(fileURLToPath(uiAssetUrl.button.homeUsage), 'utf8');

    expect(buttonTemplate).toContain('<vr-button type="button">');
    expect(homeUsage).toContain('<vr-button class="vr-button-primary" type="button">');
    expect(homeUsage).toContain("{{ t('home.cta') }}");
  });

  it('keeps button styles in CSS files', async () => {
    const buttonCss = await readFile(fileURLToPath(uiAssetUrl.button.css), 'utf8');

    expect(buttonCss).toContain('.vr-button');
    expect(buttonCss).toContain('.vr-button-primary');
  });

  it('keeps button tests in test files instead of TypeScript command strings', async () => {
    const buttonTest = await readFile(fileURLToPath(uiAssetUrl.button.test), 'utf8');

    expect(buttonTest).toContain('@vitest-environment jsdom');
    expect(buttonTest).toContain("import { testComponent } from '@vanrot/testing';");
    expect(buttonTest).toContain("import { UiButton } from './ui.button.ts';");
    expect(buttonTest).toContain('function (screen)');
    expect(buttonTest).toContain('buttonCopy.label');
  });
});
