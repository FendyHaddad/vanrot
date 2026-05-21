import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { uiAssetUrl } from '../src/index.js';

describe('@vanrot/ui assets', () => {
  it('keeps tokens in CSS instead of TypeScript strings', async () => {
    const tokens = await readFile(fileURLToPath(uiAssetUrl.tokens), 'utf8');

    expect(tokens).toContain(':root');
    expect(tokens).toContain('--vr-color-surface');
    expect(tokens).toContain('--vr-radius-control');
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
});
