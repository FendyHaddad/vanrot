import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { route } from '../src/routes.ts';

const appRoot = process.cwd();

async function readSiteFile(path: string): Promise<string> {
  return readFile(join(appRoot, path), 'utf8');
}

describe('vanrot site pages', () => {
  it('mounts the app through Vanrot runtime and router', async () => {
    const main = await readSiteFile('src/main.ts');

    expect(main).toContain("import { mount } from '@vanrot/runtime';");
    expect(main).toContain("import { provideRouter } from '@vanrot/router';");
    expect(main).toContain("import './styles/site.css';");
    expect(main).toContain('provideRouter(siteRoute);');
  });

  it('uses a single root vr-router in the app layout', async () => {
    const appLayout = await readSiteFile('src/app/app.layout.html');

    expect(appLayout.match(/<vr-router><\/vr-router>/g)).toHaveLength(1);
    expect(appLayout).not.toContain('<vr-outlet>');
  });

  it('uses a route outlet only in docs layout', async () => {
    const docsLayout = await readSiteFile('src/layouts/docs/docs.layout.html');

    expect(docsLayout.match(/<vr-outlet><\/vr-outlet>/g)).toHaveLength(1);
    expect(docsLayout).not.toContain('<vr-router>');
  });

  it('keeps docs sidebar rendering away from loop-local nested controls', async () => {
    const docsLayout = await readSiteFile('src/layouts/docs/docs.layout.html');
    const docsLayoutSource = await readSiteFile('src/layouts/docs/docs.layout.ts');

    expect(docsLayout).not.toContain('@if ');
    expect(docsLayout).not.toContain('group.items');
    expect(docsLayout).not.toContain('row.kind');
    expect(docsLayout).toContain('item of componentItems');
    expect(docsLayoutSource).toContain('componentItems = siteNavigationBySection.components;');
  });

  it('ships the Phase 16B primitive gallery visual baseline', async () => {
    const galleryPath = join(appRoot, 'src/pages/components/component-gallery.page.html');

    expect(existsSync(galleryPath)).toBe(true);

    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');

    expect(gallery).toContain('Phase 16B preview');
    expect(gallery).toContain('class="preview-body variant-grid"');

    for (const tagName of [
      'vr-button',
      'vr-card',
      'vr-badge',
      'vr-avatar',
      'vr-alert',
      'vr-loader',
      'vr-skeleton',
      'vr-separator',
    ]) {
      expect(gallery).toContain(`<${tagName}`);
    }

    for (const variant of [
      'danger',
      'interactive',
      'success',
      'soft',
      'warning',
      'bar',
      'block',
      'vertical',
    ]) {
      expect(gallery).toContain(`variant="${variant}"`);
    }
  });

  it('routes Button and Card gallery navigation to dedicated docs pages', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const cardPage = await readSiteFile('src/pages/components/component-card.page.html');
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;

    expect(gallery).toContain(
      '<a class="nav-link active" href="/docs/components/buttons">Button</a>',
    );
    expect(gallery).not.toContain('<a class="nav-link active" href="#button">Button</a>');
    expect(gallery).toContain('<a class="nav-link" href="/docs/components/cards">Card</a>');
    expect(gallery).not.toContain('<a class="nav-link" href="#card">Card</a>');
    expect(gallery).toContain('<a class="nav-link" href="#separator">Separator</a>');
    const componentButtonsRoute = siteRoute.componentButtons;
    const componentCardsRoute = siteRoute.componentCards;

    if (componentButtonsRoute === undefined) {
      throw new Error('Expected componentButtons route to be defined.');
    }
    if (componentCardsRoute === undefined) {
      throw new Error('Expected componentCards route to be defined.');
    }

    expect(componentButtonsRoute).toMatchObject({
      fullPath: '/docs/components/buttons',
      kind: 'page',
    });
    expect(componentCardsRoute).toMatchObject({
      fullPath: '/docs/components/cards',
      kind: 'page',
    });
    expect(componentButtonsRoute.parent).toBeUndefined();
    expect(componentCardsRoute.parent).toBeUndefined();
    expect(buttonPage).toContain('class="app component-gallery-app component-button-app"');
    expect(buttonPage).toContain('<aside class="sidebar">');
    expect(buttonPage).not.toContain('docs-sidebar');
    expect(buttonPage).toContain('<a class="nav-link active" href="/docs/components/buttons">Button</a>');
    expect(buttonPage).toContain('<a class="nav-link" href="/docs/components/cards">Card</a>');
    expect(cardPage).toContain('class="app component-gallery-app component-card-app"');
    expect(cardPage).toContain('<aside class="sidebar">');
    expect(cardPage).not.toContain('docs-sidebar');
    expect(cardPage).toContain('<a class="nav-link" href="/docs/components/buttons">Button</a>');
    expect(cardPage).toContain('<a class="nav-link active" href="/docs/components/cards">Card</a>');
  });

  it('keeps Button overview separate from shadcn-style variant examples', async () => {
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const buttonCss = await readSiteFile('src/pages/components/component-button.page.css');
    const variantSections = [
      ...buttonPage.matchAll(
        /<section class="variant-doc" id="button-(default|secondary|outline|ghost|danger|link)">/g,
      ),
    ];

    expect(buttonPage).not.toContain('<span class="eyebrow">Component documentation</span>');
    expect(buttonPage).toContain('<h1>{{ doc().title }}</h1>');
    expect(buttonPage).not.toContain('<p class="lead">{{ doc().summary }}</p>');
    expect(buttonPage).not.toContain('<h2>Button</h2>');
    expect(buttonPage).not.toContain('<p>{{ doc().usage }}</p>');
    expect(buttonPage).not.toContain('<span class="code-chip">&lt;vr-button&gt;</span>');
    expect(buttonPage).toContain('<div class="preview-head"><span>Variants</span><span>6</span></div>');
    expect(buttonPage).not.toContain('<div class="tabs" aria-label="Preview tabs">');
    expect(buttonPage).not.toContain('class="variant-tabs"');
    expect(buttonPage).not.toContain('<button class="tab active">Preview</button>');
    expect(buttonPage).not.toContain('<span class="panel-label">Accessibility</span>');
    expect(variantSections.map((match) => match[1])).toEqual([
      'default',
      'secondary',
      'outline',
      'ghost',
      'danger',
      'link',
    ]);
    expect(buttonPage.match(/<div class="variant-preview">/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<div class="code-snippet">/g) ?? []).toHaveLength(6);
    expect(buttonPage).not.toContain('code-snippet-toolbar');
    expect(buttonPage).not.toContain('class="copy-button"');
    expect(buttonPage.match(/<button class="copy-icon-button" type="button" aria-label="Copy [^"]+ button code">/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<pre class="code-block"><code>/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<span class="code-line-number">1<\/span>/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<span class="code-line-content[^"]*">/g) ?? []).toHaveLength(18);
    expect(buttonPage.match(/<span class="code-line-content code-indent-1">/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<span class="token attr"> variant<\/span>/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<span class="token attr"> type<\/span>/g) ?? []).toHaveLength(6);
    expect(buttonPage).toContain('<span class="token tag">&lt;vr-button</span>');
    expect(buttonPage).not.toContain('code-space');
    expect(buttonCss).toContain('.code-snippet {');
    expect(buttonCss).toContain('.copy-icon-button {');
    expect(buttonCss).toContain('.code-line {');
    expect(buttonCss).toContain('.code-line-number {');
    expect(buttonCss).toContain('.code-line-content {');
    expect(buttonCss).toContain('.code-indent-1 {');
    expect(buttonCss).toContain('.token.tag {');
    expect(buttonCss).toContain('white-space: pre;');
    expect(buttonCss).toContain('min-height: 360px;');
    expect(buttonCss).toContain('.variant-preview {');
    expect(buttonCss).toContain('background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);');
    expect(buttonCss).toContain('background-size: 24px 24px;');
    expect(buttonCss).toContain('@media (max-width: 640px) {');
    expect(buttonCss).toContain('.code-block code { font-size: 13px; }');
    expect(buttonCss).toContain('.variant-preview { min-height: 240px; padding: 32px 16px; }');
    expect(buttonCss).toContain('.code-line { grid-template-columns: 48px max-content; }');

    for (const variant of ['default', 'secondary', 'outline', 'ghost', 'danger', 'link']) {
      expect(buttonPage).toContain(`variant="${variant}"`);
    }
  });

  it('keeps Card overview separate from shadcn-style variant examples', async () => {
    const cardPage = await readSiteFile('src/pages/components/component-card.page.html');
    const cardCss = await readSiteFile('src/pages/components/component-card.page.css');
    const variantSections = [
      ...cardPage.matchAll(
        /<section class="variant-doc" id="card-(default|muted|interactive)">/g,
      ),
    ];

    expect(cardPage).not.toContain('<span class="eyebrow">Component documentation</span>');
    expect(cardPage).toContain('<h1>{{ doc().title }}</h1>');
    expect(cardPage).not.toContain('<p class="lead">{{ doc().summary }}</p>');
    expect(cardPage).not.toContain('<h2>Card</h2>');
    expect(cardPage).not.toContain('<p>{{ doc().usage }}</p>');
    expect(cardPage).not.toContain('<span class="code-chip">&lt;vr-card&gt;</span>');
    expect(cardPage).toContain('<div class="preview-head"><span>Variants</span><span>3</span></div>');
    expect(cardPage).not.toContain('<div class="tabs" aria-label="Preview tabs">');
    expect(cardPage).not.toContain('class="variant-tabs"');
    expect(cardPage).not.toContain('<button class="tab active">Preview</button>');
    expect(cardPage).not.toContain('<span class="panel-label">Accessibility</span>');
    expect(variantSections.map((match) => match[1])).toEqual([
      'default',
      'muted',
      'interactive',
    ]);
    expect(cardPage.match(/<div class="variant-preview">/g) ?? []).toHaveLength(3);
    expect(cardPage.match(/<div class="code-snippet">/g) ?? []).toHaveLength(3);
    expect(cardPage).not.toContain('code-snippet-toolbar');
    expect(cardPage).not.toContain('class="copy-button"');
    expect(cardPage.match(/<button class="copy-icon-button" type="button" aria-label="Copy [^"]+ card code">/g) ?? []).toHaveLength(3);
    expect(cardPage.match(/<pre class="code-block"><code>/g) ?? []).toHaveLength(3);
    expect(cardPage.match(/<span class="code-line-number">1<\/span>/g) ?? []).toHaveLength(3);
    expect(cardPage.match(/<span class="code-line-content[^"]*">/g) ?? []).toHaveLength(15);
    expect(cardPage.match(/<span class="code-line-content code-indent-1">/g) ?? []).toHaveLength(9);
    expect(cardPage.match(/<span class="token attr"> variant<\/span>/g) ?? []).toHaveLength(6);
    expect(cardPage).toContain('<span class="token tag">&lt;vr-card</span>');
    expect(cardPage).not.toContain('code-space');
    expect(cardCss).toContain('.code-snippet {');
    expect(cardCss).toContain('.copy-icon-button {');
    expect(cardCss).toContain('.code-line {');
    expect(cardCss).toContain('.code-line-number {');
    expect(cardCss).toContain('.code-line-content {');
    expect(cardCss).toContain('.code-indent-1 {');
    expect(cardCss).toContain('.token.tag {');
    expect(cardCss).toContain('white-space: pre;');
    expect(cardCss).toContain('min-height: 360px;');
    expect(cardCss).toContain('.variant-preview {');
    expect(cardCss).toContain('background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);');
    expect(cardCss).toContain('background-size: 24px 24px;');
    expect(cardCss).toContain('@media (max-width: 640px) {');
    expect(cardCss).toContain('.code-block code { font-size: 13px; }');
    expect(cardCss).toContain('.variant-preview { min-height: 240px; padding: 32px 16px; }');
    expect(cardCss).toContain('.code-line { grid-template-columns: 48px max-content; }');

    for (const variant of ['default', 'muted', 'interactive']) {
      expect(cardPage).toContain(`variant="${variant}"`);
    }
  });

  it('uses real loader and skeleton primitives instead of hand-built demo internals', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const galleryCss = await readSiteFile('src/pages/components/component-gallery.page.css');
    const loaderSection = gallery.match(/<section class="primitive" id="loader">[\s\S]*?<\/section>/)?.[0] ?? '';
    const loaderElements = [...loaderSection.matchAll(/<vr-loader\b[^>]*>([\s\S]*?)<\/vr-loader>/g)];

    expect(loaderSection).toContain('<vr-loader class="loader" variant="spinner" aria-label="Loading spinner"></vr-loader>');
    expect(loaderSection).toContain('<vr-loader class="loader" variant="dots" aria-label="Loading dots"></vr-loader>');
    expect(loaderSection).toContain('<vr-loader class="loader" variant="bar" aria-label="Loading bar"></vr-loader>');
    expect(loaderElements).toHaveLength(3);
    for (const match of loaderElements) {
      const content = match[1] ?? '';

      expect(content.trim()).toBe('');
    }
    expect(loaderSection).not.toContain('<span class="spinner"');
    expect(loaderSection).not.toContain('<span class="bar"');
    expect(galleryCss).not.toContain('.dots span');
    expect(galleryCss).not.toContain('.bar span');
  });

  it('matches the saved Phase 16B component presentation shell and CSS selectors', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const galleryCss = await readSiteFile('src/pages/components/component-gallery.page.css');
    const prototype = await readFile(
      join(appRoot, '../../.superpowers/brainstorm/75913-1779602752/content/phase-16b-core-primitives.html'),
      'utf8',
    );
    const prototypeCss = prototype.match(/<style>([\s\S]*?)<\/style>/)?.[1]?.trim();

    expect(gallery).toContain('class="app component-gallery-app"');
    expect(gallery).toContain('<aside class="sidebar">');
    expect(gallery).toContain('<header class="topbar">');
    expect(gallery).toContain('<vr-button class="btn default"');
    expect(gallery).toContain('<vr-card class="card-demo interactive"');
    expect(gallery).toContain('<vr-alert class="alert warning"');
    expect(gallery).toContain('<vr-loader class="loader" variant="dots"');
    expect(gallery).toContain('<vr-skeleton class="skeleton sk-card"');
    expect(gallery).toContain('<vr-separator class="separator-horizontal"');
    expect(gallery.match(/<vr-alert\b/g)?.length).toBe(4);
    expect(gallery.match(/<\/vr-alert>/g)?.length).toBe(4);

    for (const requiredCss of [
      '--bg: #09090b;',
      ':global(:root) {',
      ':global(body) {',
      '.sidebar {',
      '.topbar {',
      '.content {',
      '.btn.default {',
      '.card-demo.interactive {',
      '.badge.warning {',
      '.avatar.soft {',
      '.alert.warning {',
      '.loader {',
      '.skeleton {',
      '.separator-horizontal {',
    ]) {
      expect(galleryCss).toContain(requiredCss);
    }
    expect(prototypeCss).toContain('.spinner {');
    expect(galleryCss).not.toContain('.spinner {');
    expect(galleryCss).not.toContain('@keyframes shimmer');
  });
});
