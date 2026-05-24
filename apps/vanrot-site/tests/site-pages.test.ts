import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { route } from '../src/routes.ts';

const appRoot = process.cwd();

const phase16ComponentDocPages = [
  {
    routeKey: 'componentBadges',
    path: '/docs/components/badges',
    fileBase: 'component-badge',
    primitive: 'badge',
    title: 'Badge',
    tagName: 'vr-badge',
    tokenGroup: 'tone',
    variants: ['default', 'secondary', 'success', 'warning', 'danger', 'outline'],
  },
  {
    routeKey: 'componentAvatars',
    path: '/docs/components/avatars',
    fileBase: 'component-avatar',
    primitive: 'avatar',
    title: 'Avatar',
    tagName: 'vr-avatar',
    tokenGroup: 'variant',
    variants: ['default', 'soft', 'outline'],
  },
  {
    routeKey: 'componentAlerts',
    path: '/docs/components/alerts',
    fileBase: 'component-alert',
    primitive: 'alert',
    title: 'Alert',
    tagName: 'vr-alert',
    tokenGroup: 'tone',
    variants: ['info', 'success', 'warning', 'danger'],
  },
  {
    routeKey: 'componentLoaders',
    path: '/docs/components/loaders',
    fileBase: 'component-loader',
    primitive: 'loader',
    title: 'Loader',
    tagName: 'vr-loader',
    tokenGroup: 'variant',
    variants: ['spinner', 'dots', 'bar'],
  },
  {
    routeKey: 'componentSkeletons',
    path: '/docs/components/skeletons',
    fileBase: 'component-skeleton',
    primitive: 'skeleton',
    title: 'Skeleton',
    tagName: 'vr-skeleton',
    tokenGroup: 'variant',
    variants: ['text', 'avatar', 'card', 'block'],
  },
  {
    routeKey: 'componentSeparators',
    path: '/docs/components/separators',
    fileBase: 'component-separator',
    primitive: 'separator',
    title: 'Separator',
    tagName: 'vr-separator',
    tokenGroup: 'orientation',
    variants: ['horizontal', 'vertical'],
  },
] as const;

const phase16LayoutNavigationMediaDocPages = [
  {
    routeKey: 'componentBreadcrumbs',
    path: '/docs/components/breadcrumbs',
    fileBase: 'component-breadcrumb',
    title: 'Breadcrumb',
    tokenSnippet: 'aria-label',
  },
  {
    routeKey: 'componentContainers',
    path: '/docs/components/containers',
    fileBase: 'component-container',
    title: 'Container',
    tokenSnippet: 'size.lg',
  },
  {
    routeKey: 'componentFooters',
    path: '/docs/components/footers',
    fileBase: 'component-footer',
    title: 'Footer',
    tokenSnippet: 'vr-footer',
  },
  {
    routeKey: 'componentGrids',
    path: '/docs/components/grids',
    fileBase: 'component-grid',
    title: 'Grid',
    tokenSnippet: 'cols.3 gap.4',
  },
  {
    routeKey: 'componentHeaders',
    path: '/docs/components/headers',
    fileBase: 'component-header',
    title: 'Header',
    tokenSnippet: 'vr-header',
  },
  {
    routeKey: 'componentImages',
    path: '/docs/components/images',
    fileBase: 'component-img',
    title: 'Image',
    tokenSnippet: 'src alt',
  },
  {
    routeKey: 'componentLayouts',
    path: '/docs/components/layouts',
    fileBase: 'component-layout',
    title: 'Layout',
    tokenSnippet: 'vr-layout',
  },
  {
    routeKey: 'componentNavigation',
    path: '/docs/components/navigation',
    fileBase: 'component-nav',
    title: 'Navigation',
    tokenSnippet: 'aria-label',
  },
  {
    routeKey: 'componentSections',
    path: '/docs/components/sections',
    fileBase: 'component-section',
    title: 'Section',
    tokenSnippet: 'spacing.md',
  },
  {
    routeKey: 'componentSidebars',
    path: '/docs/components/sidebars',
    fileBase: 'component-sidebar',
    title: 'Sidebar',
    tokenSnippet: 'placement.left',
  },
  {
    routeKey: 'componentSources',
    path: '/docs/components/sources',
    fileBase: 'component-src',
    title: 'Source',
    tokenSnippet: 'srcset type',
  },
  {
    routeKey: 'componentStacks',
    path: '/docs/components/stacks',
    fileBase: 'component-stack',
    title: 'Stack',
    tokenSnippet: 'gap.3',
  },
] as const;

async function readSiteFile(path: string): Promise<string> {
  return readFile(join(appRoot, path), 'utf8');
}

const phase16CoreComponentFiles = [
  'component-button',
  'component-card',
  ...phase16ComponentDocPages.map((page) => page.fileBase),
  ...phase16LayoutNavigationMediaDocPages.map((page) => page.fileBase),
] as const;

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

    expect(appLayout).toContain('<vr-layout class="site-shell">');
    expect(appLayout).toContain('<vr-header class="site-header">');
    expect(appLayout).toContain('<vr-nav class="site-top-nav" aria-label="Primary">');
    expect(appLayout.match(/<vr-router><\/vr-router>/g)).toHaveLength(1);
    expect(appLayout).not.toContain('<vr-outlet>');
  });

  it('uses a route outlet only in docs layout', async () => {
    const docsLayout = await readSiteFile('src/layouts/docs/docs.layout.html');

    expect(docsLayout).toContain('<vr-layout class="docs-layout">');
    expect(docsLayout).toContain('<vr-sidebar class="docs-sidebar" placement.left aria-label="Documentation">');
    expect(docsLayout).toContain('<vr-nav class="docs-nav" aria-label="Documentation">');
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
      'variant.danger',
      'variant.interactive',
      'tone.success',
      'variant.soft',
      'tone.warning',
      'variant.bar',
      'variant.block',
      'orientation.vertical',
    ]) {
      expect(gallery).toContain(variant);
    }
  });

  it('routes Button and Card gallery navigation to dedicated docs pages', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const cardPage = await readSiteFile('src/pages/components/component-card.page.html');
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;

    expect(gallery).toContain('<a class="nav-link" href="/docs/components/buttons">Button</a>');
    expect(gallery).not.toContain('<a class="nav-link active" href="#button">Button</a>');
    expect(gallery).toContain('<a class="nav-link" href="/docs/components/cards">Card</a>');
    expect(gallery).not.toContain('<a class="nav-link" href="#card">Card</a>');
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
    expect(buttonPage).toContain('<vr-sidebar class="sidebar" placement.left');
    expect(buttonPage).not.toContain('docs-sidebar');
    expect(buttonPage).toContain('<a class="nav-link active" href="/docs/components/buttons">Button</a>');
    expect(buttonPage).toContain('<a class="nav-link" href="/docs/components/cards">Card</a>');
    expect(cardPage).toContain('class="app component-gallery-app component-card-app"');
    expect(cardPage).toContain('<vr-sidebar class="sidebar" placement.left');
    expect(cardPage).not.toContain('docs-sidebar');
    expect(cardPage).toContain('<a class="nav-link" href="/docs/components/buttons">Button</a>');
    expect(cardPage).toContain('<a class="nav-link active" href="/docs/components/cards">Card</a>');
  });

  it('routes remaining Phase 16B component navigation to dedicated docs pages', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const cardPage = await readSiteFile('src/pages/components/component-card.page.html');
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;

    for (const page of phase16ComponentDocPages) {
      expect(gallery).toContain(
        `<a class="nav-link" href="${page.path}">${page.title}</a>`,
      );
      expect(gallery).not.toContain(
        `<a class="nav-link" href="#${page.primitive}">${page.title}</a>`,
      );
      expect(buttonPage).toContain(
        `<a class="nav-link" href="${page.path}">${page.title}</a>`,
      );
      expect(cardPage).toContain(
        `<a class="nav-link" href="${page.path}">${page.title}</a>`,
      );

      const routeEntry = siteRoute[page.routeKey];

      if (routeEntry === undefined) {
        throw new Error(`Expected ${page.routeKey} route to be defined.`);
      }

      expect(routeEntry).toMatchObject({
        fullPath: page.path,
        kind: 'page',
      });
      expect(routeEntry.parent).toBeUndefined();
    }
  });

  it('routes Phase 16D component navigation to dedicated docs pages', async () => {
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;
    const componentLabels = [
      ...buttonPage.matchAll(/<a class="nav-link(?: active)?" href="\/docs\/components\/[^"]+">([^<]+)<\/a>/g),
    ].map((match) => match[1] ?? '');

    expect(componentLabels).toEqual([...componentLabels].sort((left, right) => left.localeCompare(right)));

    for (const page of phase16LayoutNavigationMediaDocPages) {
      const componentPage = await readSiteFile(`src/pages/components/${page.fileBase}.page.html`);
      const routeEntry = siteRoute[page.routeKey];

      if (routeEntry === undefined) {
        throw new Error(`Expected ${page.routeKey} route to be defined.`);
      }

      expect(routeEntry).toMatchObject({
        fullPath: page.path,
        kind: 'page',
      });
      expect(routeEntry.parent).toBeUndefined();
      expect(componentPage).toContain(
        `class="app component-gallery-app component-${page.fileBase.replace('component-', '')}-app"`,
      );
      expect(componentPage).toContain('<vr-sidebar class="sidebar" placement.left');
      expect(componentPage).toContain(
        `<a class="nav-link active" href="${page.path}">${page.title}</a>`,
      );
      expect(componentPage).toContain('<h1>{{ doc().title }}</h1>');
      expect(componentPage).toContain('<div class="variant-preview">');
      expect(componentPage).toContain('<div class="code-snippet">');
      expect(componentPage).toContain(page.tokenSnippet);
    }
  });

  it('uses dotted token attributes for Vanrot-owned component docs examples', async () => {
    const tokenAttributePattern = /\b(?:variant|tone|orientation)="[^"]+"/;

    for (const fileBase of phase16CoreComponentFiles) {
      const componentPage = await readSiteFile(`src/pages/components/${fileBase}.page.html`);

      expect(componentPage).not.toMatch(tokenAttributePattern);
    }
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
    expect(buttonPage.match(/<span class="token attr"> variant\.[a-z]+<\/span>/g) ?? []).toHaveLength(6);
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
      expect(buttonPage).toContain(`variant.${variant}`);
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
    expect(cardPage.match(/<span class="token attr"> variant\.[a-z]+<\/span>/g) ?? []).toHaveLength(6);
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
      expect(cardPage).toContain(`variant.${variant}`);
    }
  });

  it.each(phase16ComponentDocPages)(
    'keeps $title overview separate from shadcn-style variant examples',
    async (page) => {
      const componentPage = await readSiteFile(
        `src/pages/components/${page.fileBase}.page.html`,
      );
      const componentCss = await readSiteFile(
        `src/pages/components/${page.fileBase}.page.css`,
      );
      const variantExpression = page.variants.join('|');
      const variantSections = [
        ...componentPage.matchAll(
          new RegExp(
            `<section class="variant-doc" id="${page.primitive}-(${variantExpression})">`,
            'g',
          ),
        ),
      ];

      expect(componentPage).toContain(
        `class="app component-gallery-app component-${page.primitive}-app"`,
      );
      expect(componentPage).toContain('<vr-sidebar class="sidebar" placement.left');
      expect(componentPage).not.toContain('docs-sidebar');
      expect(componentPage).toContain(
        `<a class="nav-link active" href="${page.path}">${page.title}</a>`,
      );
      expect(componentPage).not.toContain(
        `<a class="nav-link active" href="#${page.primitive}">${page.title}</a>`,
      );
      expect(componentPage).not.toContain(
        '<span class="eyebrow">Component documentation</span>',
      );
      expect(componentPage).toContain('<h1>{{ doc().title }}</h1>');
      expect(componentPage).not.toContain('<p class="lead">{{ doc().summary }}</p>');
      expect(componentPage).not.toContain(`<h2>${page.title}</h2>`);
      expect(componentPage).not.toContain('<p>{{ doc().usage }}</p>');
      expect(componentPage).not.toContain(
        `<span class="code-chip">&lt;${page.tagName}&gt;</span>`,
      );
      expect(componentPage).toContain(
        `<div class="preview-head"><span>Variants</span><span>${page.variants.length}</span></div>`,
      );
      expect(componentPage).not.toContain('<div class="tabs" aria-label="Preview tabs">');
      expect(componentPage).not.toContain('class="variant-tabs"');
      expect(componentPage).not.toContain('<button class="tab active">Preview</button>');
      expect(componentPage).not.toContain('<span class="panel-label">Accessibility</span>');
      expect(variantSections.map((match) => match[1])).toEqual([...page.variants]);
      expect(componentPage.match(/<div class="variant-preview">/g) ?? []).toHaveLength(
        page.variants.length,
      );
      expect(componentPage.match(/<div class="code-snippet">/g) ?? []).toHaveLength(
        page.variants.length,
      );
      expect(componentPage).not.toContain('code-snippet-toolbar');
      expect(componentPage).not.toContain('class="copy-button"');
      expect(
        componentPage.match(
          new RegExp(
            `<button class="copy-icon-button" type="button" aria-label="Copy [^"]+ ${page.primitive} code">`,
            'g',
          ),
        ) ?? [],
      ).toHaveLength(page.variants.length);
      expect(componentPage.match(/<pre class="code-block"><code>/g) ?? []).toHaveLength(
        page.variants.length,
      );
      expect(
        componentPage.match(/<span class="code-line-number">1<\/span>/g) ?? [],
      ).toHaveLength(page.variants.length);
      expect(componentPage).toContain(`<span class="token tag">&lt;${page.tagName}</span>`);
      expect(componentPage).toContain(`<span class="token attr"> ${page.tokenGroup}.`);
      expect(componentPage).not.toContain('code-space');

      for (const variant of page.variants) {
        expect(componentPage).toContain(`id="${page.primitive}-${variant}"`);
        expect(componentPage).toContain(`${page.tokenGroup}.${variant}`);
        expect(componentPage).toContain(
          `<span class="token attr"> ${page.tokenGroup}.${variant}</span>`,
        );
      }

      expect(componentCss).toContain('.code-snippet {');
      expect(componentCss).toContain('.copy-icon-button {');
      expect(componentCss).toContain('.code-line {');
      expect(componentCss).toContain('.code-line-number {');
      expect(componentCss).toContain('.code-line-content {');
      expect(componentCss).toContain('.code-indent-1 {');
      expect(componentCss).toContain('.token.tag {');
      expect(componentCss).toContain('white-space: pre;');
      expect(componentCss).toContain('min-height: 360px;');
      expect(componentCss).toContain('.variant-preview {');
      expect(componentCss).toContain(
        'background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);',
      );
      expect(componentCss).toContain('background-size: 24px 24px;');
      expect(componentCss).toContain('@media (max-width: 640px) {');
      expect(componentCss).toContain('.code-block code { font-size: 13px; }');
      expect(componentCss).toContain(
        '.variant-preview { min-height: 240px; padding: 32px 16px; }',
      );
      expect(componentCss).toContain(
        '.code-line { grid-template-columns: 48px max-content; }',
      );
    },
  );

  it('uses real loader and skeleton primitives instead of hand-built demo internals', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const galleryCss = await readSiteFile('src/pages/components/component-gallery.page.css');
    const loaderSection = gallery.match(/<section class="primitive" id="loader">[\s\S]*?<\/section>/)?.[0] ?? '';
    const loaderElements = [...loaderSection.matchAll(/<vr-loader\b[^>]*>([\s\S]*?)<\/vr-loader>/g)];

    expect(loaderSection).toContain('<vr-loader class="loader" variant.spinner aria-label="Loading spinner"></vr-loader>');
    expect(loaderSection).toContain('<vr-loader class="loader" variant.dots aria-label="Loading dots"></vr-loader>');
    expect(loaderSection).toContain('<vr-loader class="loader" variant.bar aria-label="Loading bar"></vr-loader>');
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
    expect(gallery).toContain('<vr-sidebar class="sidebar" placement.left');
    expect(gallery).toContain('<vr-header class="topbar">');
    expect(gallery).toContain('<vr-button class="btn default"');
    expect(gallery).toContain('<vr-card class="card-demo interactive"');
    expect(gallery).toContain('<vr-alert class="alert warning"');
    expect(gallery).toContain('<vr-loader class="loader" variant.dots');
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
