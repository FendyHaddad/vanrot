import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  deploymentReference,
  packageReferenceDocs,
  publicRouteMetadata,
} from '../src/docs/framework-reference.ts';

const appRoot = process.cwd();

async function readSiteFile(path: string): Promise<string> {
  return readFile(join(appRoot, path), 'utf8');
}

describe('site polish', () => {
  it('uses approved landing CTA labels', async () => {
    const source = await readSiteFile('src/pages/home/home.page.ts');

    expect(source).toContain("primaryCta: 'Read the docs'");
    expect(source).toContain("installCta: '$ npm i @vanrot/runtime'");
    expect(source).toContain("eyebrow: 'AI-first · Signal-based · Secure by design'");
    expect(source).toContain(
      "typedLine: 'The only framework you need. Reactivity without the fluff.'",
    );
    expect(source).not.toContain("primaryCta: 'Framework Documentation'");
    expect(source).not.toContain('Reactivity without the magic.');
  });

  it('keeps the landing page focused on framework docs and design components', async () => {
    const html = await readSiteFile('src/pages/home/home.page.html');
    const css = await readSiteFile('src/pages/home/home.page.css');

    expect(html).toContain('href="/docs"');
    expect(html).toContain('href="/docs/components"');
    expect(html).toContain('<vr-badge');
    expect(html).toContain('data-vr-home-hero');
    expect(html).toContain('data-vr-reveal-section');
    expect(html).toContain('<vr-table');
    // Component-system section appears before the AI section.
    expect(html.indexOf('{{ copy.componentsHeading }}')).toBeLessThan(
      html.indexOf('{{ copy.aiHeading }}'),
    );
    expect(css).not.toContain('min-height: calc(100vh');
  });

  it('keeps the landing visual samples compact and stable', async () => {
    const html = await readSiteFile('src/pages/home/home.page.html');
    const css = await readSiteFile('src/pages/home/home.page.css');
    const source = await readSiteFile('src/pages/home/home.page.ts');
    const widget = await readSiteFile('src/pages/home/home-interactions.widget.ts');

    expect(html).toContain('<span class="cc">// no magic, no diffing</span><br>');
    expect(html).toContain('<span class="db-stat-detail">{{ stat.detail }}</span>');
    expect(source).toContain("detail: 'gzipped'");
    expect(source).toContain("const runtimeSize = '1.8kb';");
    expect(source).toContain("'@vanrot/runtime': { version: '0.1.0', size: runtimeSize }");
    expect(source).toContain("'@vanrot/behavior': { version: '0.1.0', size: '4.1kb' }");
    expect(source).toContain("name: '@vanrot/behavior/all'");
    expect(source).toContain("size: '4.1kb'");
    expect(source).toContain("'@vanrot/ui': { version: '0.1.0', size: '9.4kb' }");
    expect(source).not.toContain('4.1kb all');
    expect(source).not.toContain("const runtimeSize = '5.68kb';");
    expect(packageReferenceDocs.map(pkg => pkg.name)).toContain('@vanrot/behavior');
    expect(source).toContain("title: 'Zero runtime deps'");
    expect(source).toContain(
      "body: 'Vite powers dev/build. The browser runtime ships dependency-free.'",
    );
    expect(source).not.toContain("title: 'Zero deps'");
    expect(source).toContain('packageSummary');
    expect(source).toContain('const runtimeDashboardPackageNames = new Set([');
    expect(source).toContain("'@vanrot/runtime'");
    expect(source).toContain("'@vanrot/behavior'");
    expect(source).toContain("'@vanrot/router'");
    expect(source).toContain("'@vanrot/ui'");
    expect(source).toContain('runtimePackages');
    expect(source).toContain('runtime entries');
    expect(source).not.toContain("runtimeDashboardPackageNames = new Set(['@vanrot/compiler'");
    expect(html).toContain('<div class="db-panel-head"><h3>Runtime packages</h3>');
    expect(html).toContain('@for (item of dashboardPackages; track item.name)');
    expect(html).toContain('@for (item of packages; track item.name)');
    expect(html).toContain('<vr-table-head class="num">Version</vr-table-head>');
    expect(html).toContain('<vr-table-head class="num">Size</vr-table-head>');
    expect(html).toContain('<vr-table-cell class="m num">{{ item.version }}</vr-table-cell>');
    expect(html).toContain('<vr-table-cell class="m num">{{ item.size }}</vr-table-cell>');
    expect(css).toContain('.home-page .db-stat {');
    expect(css).not.toContain('.db-table .vr-table-row {');
    expect(css).toContain('.db-table .num {');
    expect(css).toContain('padding: 11px 18px;');
    expect(widget).toContain('const asciiChurnRate = 2;');
    expect(widget).toContain('const twinkleRate = 0.9;');
    expect(widget).toContain('const logoYOffset = width < 640 ? -96 : -160;');
    expect(widget).toContain('seed * dense.length + step * 0.5');
    expect(widget).toContain('hash(x * 0.7, y * 1.3)');
    expect(css).toContain('bottom: 28px;');
    expect(css).toContain('height: 560px;');
    expect(widget).not.toContain('const step = Math.floor(time * churn)');
  });

  it('aligns the framework docs shell with the component docs sidebar language', async () => {
    const html = await readSiteFile('src/layouts/docs/docs.layout.html');
    const css = await readSiteFile('src/layouts/docs/docs.layout.css');
    const source = await readSiteFile('src/layouts/docs/docs.layout.ts');

    expect(html).toContain('class="docs-search"');
    expect(html).toContain('class="docs-search-icon"');
    expect(html).toContain('<kbd>⌘K</kbd>');
    expect(html).toContain('class="docs-nav-title"');
    expect(html).toContain('class="docs-nav-link"');
    expect(html).toContain(
      '<vr-sidebar class="docs-sidebar" placement.left aria-label="Documentation">',
    );
    expect(html).not.toContain('class="docs-brand"');
    expect(html).not.toContain('class="docs-topbar-nav"');
    expect(html).not.toContain('class="docs-page-actions"');
    expect(html).not.toContain('item of componentItems');
    expect(source).not.toContain('componentItems = siteNavigationBySection.components;');
    expect(css).toContain('grid-template-columns: 240px minmax(0, 1fr)');
    expect(css).toContain('border-right: 1px solid');
    expect(css).toContain('--docs-sidebar-muted: #a1a1aa');
    expect(css).toContain('--docs-sidebar-faint: #71717a');
    expect(css).toContain('font-family: var(--font-sans, var(--vr-font-sans))');
    expect(css).toContain('border-radius: 6px');
    expect(css).toContain('font-size: 13px');
    expect(css).toContain('.docs-nav-title:first-child');
    expect(css).toContain('height: 32px');
    expect(css).toContain('top: 56px');
    expect(css).toContain('height: calc(100vh - 56px)');
  });

  it('keeps design component docs on the same fixed shell rhythm', async () => {
    const appCss = await readSiteFile('src/app/app.layout.css');
    const siteCss = await readSiteFile('src/styles/site.css');
    const galleryHtml = await readSiteFile('src/pages/components/component-gallery.page.html');
    const buttonHtml = await readSiteFile('src/pages/components/component-button.page.html');
    const checkboxHtml = await readSiteFile('src/pages/components/component-checkbox.page.html');

    expect(appCss).not.toContain('.site-shell:has(.component-gallery-app) .site-header');
    expect(appCss).toContain('background: #000;');
    expect(appCss).not.toContain(
      'background: color-mix(in srgb, var(--vr-color-canvas) 88%, transparent);',
    );
    expect(siteCss).toContain('.component-gallery-app .topbar');
    expect(siteCss).toContain('top: var(--vr-site-header-height) !important');
    expect(siteCss).toContain('height: calc(100vh - var(--vr-site-header-height)) !important');
    expect(siteCss).toContain('body:has(.component-gallery-app),');
    expect(siteCss).toContain('.site-shell:has(.component-gallery-app) {');
    expect(siteCss).toContain('background: #000 !important;');
    expect(siteCss).toContain('background: color-mix(in srgb, #000 88%, transparent) !important');
    expect(galleryHtml).toContain('<span>Design Components</span>');
    expect(buttonHtml).toContain('<span>Design Components</span>');
    expect(checkboxHtml).toContain('<span>Design Components</span>');
    expect(galleryHtml).not.toContain('Vanrot UI');
    expect(buttonHtml).not.toContain('topbar-right');
    expect(buttonHtml).not.toContain('Blocks');
    expect(buttonHtml).not.toContain('Registry');
  });

  it('has public route metadata for the front doors', () => {
    expect(publicRouteMetadata.map((item) => item.path)).toEqual([
      '/',
      '/docs',
      '/docs/forms',
      '/docs/components',
      '/changelog',
    ]);
  });

  it('documents deployment target without claiming live deployment', () => {
    expect(deploymentReference.targetHost).toBe('vanrot.vankode.com');
    expect(deploymentReference.summary).toContain('DNS');
    expect(deploymentReference.summary).toContain('live deployment');
  });

  it('keeps SEO metadata for public routes substantial', () => {
    for (const routeMetadata of publicRouteMetadata) {
      expect(routeMetadata.title.length).toBeGreaterThan(10);
      expect(routeMetadata.description.length).toBeGreaterThan(50);
    }
  });
});
