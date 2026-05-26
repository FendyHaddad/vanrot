// @vitest-environment node

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  phase16FormsDataPrimitiveOrder,
  phase16FinalPrimitiveOrder,
  phase16InteractionPrimitiveOrder,
  uiAssetUrl,
  uiPrimitive,
  uiPrimitiveOrder,
  uiPrimitiveType,
  uiPrimitiveVariant,
} from '../src/index.js';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const phase16CorePrimitiveOrder = [
  uiPrimitiveType.button,
  uiPrimitiveType.card,
  uiPrimitiveType.badge,
  uiPrimitiveType.avatar,
  uiPrimitiveType.alert,
  uiPrimitiveType.loader,
  uiPrimitiveType.skeleton,
  uiPrimitiveType.separator,
] as const;
const phase16LayoutNavigationMediaPrimitiveOrder = [
  uiPrimitiveType.layout,
  uiPrimitiveType.container,
  uiPrimitiveType.section,
  uiPrimitiveType.grid,
  uiPrimitiveType.header,
  uiPrimitiveType.footer,
  uiPrimitiveType.sidebar,
  uiPrimitiveType.nav,
  uiPrimitiveType.breadcrumb,
  uiPrimitiveType.img,
  uiPrimitiveType.src,
] as const;

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function toPascalCase(value: string): string {
  return value
    .split('-')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join('');
}

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
    expect(homeUsage).toContain('<vr-button variant.default type="button">');
    expect(homeUsage).toContain("{{ t('home.cta') }}");
  });

  it('uses dotted token attributes for Vanrot-owned finite UI tokens', async () => {
    const tokenAttributePattern = /\b(?:variant|tone|orientation|size|density|marker|align)="[^"]+"/;

    for (const primitive of uiPrimitiveOrder) {
      const usage = await readFile(fileURLToPath(uiAssetUrl[primitive].homeUsage), 'utf8');

      expect(usage).not.toMatch(tokenAttributePattern);
    }
  });

  it('keeps button styles in CSS files', async () => {
    const buttonCss = await readFile(fileURLToPath(uiAssetUrl.button.css), 'utf8');

    expect(buttonCss).toContain('.vr-button');
    expect(buttonCss).toContain('.vr-button-secondary');
    expect(buttonCss).toContain('.vr-button-danger');
  });

  it('keeps button tests in test files instead of TypeScript command strings', async () => {
    const buttonTest = await readFile(fileURLToPath(uiAssetUrl.button.test), 'utf8');

    expect(buttonTest).toContain('@vitest-environment jsdom');
    expect(buttonTest).toContain("import { testComponent } from '@vanrot/testing';");
    expect(buttonTest).toContain("import { UiButton } from './ui.button.ts';");
    expect(buttonTest).toContain('function (screen)');
    expect(buttonTest).toContain('buttonCopy.label');
  });

  it('ships source templates for every Phase 16B primitive', async () => {
    for (const primitive of phase16CorePrimitiveOrder) {
      const metadata = uiPrimitive[primitive];
      const directory = join(packageRoot, 'src', 'primitives', primitive);
      const className = `Ui${primitive[0].toUpperCase()}${primitive.slice(1)}`;

      await expect(readFile(join(directory, `ui.${primitive}.ts`), 'utf8')).resolves.toContain(
        `export class ${className}`,
      );
      await expect(readFile(join(directory, `ui.${primitive}.html`), 'utf8')).resolves.toContain(
        metadata.selector,
      );
      await expect(readFile(join(directory, `ui.${primitive}.css`), 'utf8')).resolves.toContain(
        metadata.baseClass,
      );
      await expect(readFile(join(directory, `ui.${primitive}.test.ts`), 'utf8')).resolves.toContain(
        className,
      );
      await expect(readFile(join(directory, 'usage.home.html'), 'utf8')).resolves.toContain(
        metadata.selector,
      );
    }
  });

  it('ships source templates for every Phase 16D layout, navigation, and media primitive', async () => {
    for (const primitive of phase16LayoutNavigationMediaPrimitiveOrder) {
      const metadata = uiPrimitive[primitive];
      const directory = join(packageRoot, 'src', 'primitives', primitive);
      const className = `Ui${primitive[0].toUpperCase()}${primitive.slice(1)}`;

      await expect(readFile(join(directory, `ui.${primitive}.ts`), 'utf8')).resolves.toContain(
        `export class ${className}`,
      );
      await expect(readFile(join(directory, `ui.${primitive}.html`), 'utf8')).resolves.toContain(
        metadata.selector,
      );
      await expect(readFile(join(directory, `ui.${primitive}.css`), 'utf8')).resolves.toContain(
        metadata.baseClass,
      );
      await expect(readFile(join(directory, `ui.${primitive}.test.ts`), 'utf8')).resolves.toContain(
        className,
      );
      await expect(readFile(join(directory, 'usage.home.html'), 'utf8')).resolves.toContain(
        metadata.selector,
      );
    }
  });

  it('ships source templates for every Phase 16E forms and data primitive', async () => {
    for (const primitive of phase16FormsDataPrimitiveOrder) {
      const metadata = uiPrimitive[primitive];
      const kebabPrimitive = toKebabCase(primitive);
      const className = `Ui${toPascalCase(kebabPrimitive)}`;

      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].typescript), 'utf8')).resolves.toContain(
        `export class ${className}`,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].html), 'utf8')).resolves.toContain(
        metadata.selector,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].css), 'utf8')).resolves.toContain(
        metadata.baseClass,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].test), 'utf8')).resolves.toContain(
        className,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].homeUsage), 'utf8')).resolves.toContain(
        metadata.selector,
      );
    }
  });

  it('ships source templates for every Phase 16G final October primitive', async () => {
    for (const primitive of phase16FinalPrimitiveOrder) {
      const metadata = uiPrimitive[primitive];
      const kebabPrimitive = toKebabCase(primitive);
      const className = `Ui${toPascalCase(kebabPrimitive)}`;

      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].typescript), 'utf8')).resolves.toContain(
        `export class ${className}`,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].html), 'utf8')).resolves.toContain(
        metadata.selector,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].css), 'utf8')).resolves.toContain(
        metadata.baseClass,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].test), 'utf8')).resolves.toContain(
        className,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].homeUsage), 'utf8')).resolves.toContain(
        metadata.selector,
      );
    }
  });

  it('ships source templates for every Phase 16F interaction primitive', async () => {
    for (const primitive of phase16InteractionPrimitiveOrder) {
      const metadata = uiPrimitive[primitive];
      const kebabPrimitive = toKebabCase(primitive);

      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].typescript), 'utf8')).resolves.toContain(
        `export class Ui${primitive[0].toUpperCase()}${primitive.slice(1)}`,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].html), 'utf8')).resolves.toContain(
        `<${metadata.selector}`,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].css), 'utf8')).resolves.toContain(
        metadata.baseClass,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].test), 'utf8')).resolves.toContain(
        metadata.selector,
      );
      await expect(readFile(fileURLToPath(uiAssetUrl[primitive].homeUsage), 'utf8')).resolves.toContain(
        `<${metadata.selector}`,
      );
      expect(kebabPrimitive).toMatch(/^[a-z-]+$/);
    }
  });

  it('ships CSS classes for every Phase 16B non-default variant', async () => {
    for (const primitive of phase16CorePrimitiveOrder) {
      const metadata = uiPrimitive[primitive];
      const css = await readFile(
        join(packageRoot, 'src', 'primitives', primitive, `ui.${primitive}.css`),
        'utf8',
      );
      const [defaultVariant] = uiPrimitiveVariant[primitive];

      for (const variant of uiPrimitiveVariant[primitive]) {
        if (variant === defaultVariant) {
          continue;
        }

        expect(css).toContain(`.${metadata.baseClass}-${variant}`);
      }
    }
  });

  it('renders loader dots as circles instead of a pill plus dots', async () => {
    const css = await readFile(join(packageRoot, 'src', 'primitives', 'loader', 'ui.loader.css'), 'utf8');
    const dotsRule = css.match(/\.vr-loader-dots::before\s*{[\s\S]*?}/)?.[0] ?? '';

    expect(dotsRule).toContain('width: 6px;');
    expect(dotsRule).toContain('height: 6px;');
    expect(dotsRule).toContain('box-shadow: 11px 0 0 var(--vr-color-muted), 22px 0 0 var(--vr-color-muted);');
    expect(dotsRule).not.toContain('width: 28px;');
    expect(css).toContain('25% {');
    expect(css).toContain('box-shadow: 11px 0 0 var(--vr-color-text), 22px 0 0 var(--vr-color-muted);');
    expect(css).toContain('50% {');
    expect(css).toContain('box-shadow: 11px 0 0 var(--vr-color-muted), 22px 0 0 var(--vr-color-text);');
  });

  it('renders loader bar as a static three-quarter fill with a moving glimmer', async () => {
    const css = await readFile(join(packageRoot, 'src', 'primitives', 'loader', 'ui.loader.css'), 'utf8');
    const trackRule = css.match(/\.vr-loader\.vr-loader-bar\s*{[\s\S]*?}/)?.[0] ?? '';
    const barRule = css.match(/\.vr-loader-bar::before\s*{[\s\S]*?}/)?.[0] ?? '';
    const glimmerRule = css.match(/\.vr-loader-bar::after\s*{[\s\S]*?}/)?.[0] ?? '';

    expect(trackRule).toContain('display: block;');
    expect(trackRule).toContain('position: relative;');
    expect(barRule).toContain('background: var(--vr-color-text);');
    expect(barRule).toContain('inset: 0 auto 0 0;');
    expect(barRule).toContain('position: absolute;');
    expect(barRule).toContain('width: 75%;');
    expect(barRule).toContain('animation: none;');
    expect(barRule).toContain('transform: none;');
    expect(glimmerRule).toContain('animation: vr-loader-shimmer 1.6s ease-in-out infinite;');
    expect(glimmerRule).toContain('inset: 0 auto 0 0;');
    expect(glimmerRule).toContain('width: 75%;');
    expect(css).toContain('transform: translateX(-100%);');
    expect(css).toContain('transform: translateX(100%);');
  });

  it('renders skeleton shimmer with an animated overlay', async () => {
    const css = await readFile(join(packageRoot, 'src', 'primitives', 'skeleton', 'ui.skeleton.css'), 'utf8');

    expect(css).toContain('.vr-skeleton::before');
    expect(css).toContain('animation: vr-skeleton-shimmer 1.4s ease-in-out infinite;');
    expect(css).toContain('@keyframes vr-skeleton-shimmer');
    expect(css).toContain('transform: translateX(100%);');
  });
});
