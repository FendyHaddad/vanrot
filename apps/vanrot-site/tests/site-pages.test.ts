import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

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
    expect(gallery).toContain('<vr-loader class="loader dots"');
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
      '.spinner {',
      '.skeleton {',
      '.separator-horizontal {',
    ]) {
      expect(galleryCss).toContain(requiredCss);
    }

    const expectedCss = prototypeCss
      ?.replace(':root {', ':global(:root) {')
      .replace('body {', ':global(body) {')
      .replace(
        '      }\n\n      .app {',
        [
          '      }',
          '',
          '      :global(body:has(.component-gallery-app)),',
          '      :global(.site-shell:has(.component-gallery-app)) {',
          '        background: var(--bg);',
          '        color: var(--text);',
          '        font-family: var(--font-sans);',
          '        font-size: 14px;',
          '        line-height: 1.5;',
          '        letter-spacing: 0;',
          '      }',
          '',
          '      .app {',
        ].join('\n'),
      )
      .replace('        background: var(--bg);\n      }\n\n      .card-demo.muted', '        background: var(--bg);\n        color: var(--text);\n      }\n\n      .card-demo.muted')
      .replace('        background: var(--bg);\n        display: flex;', '        background: var(--bg);\n        color: var(--text);\n        display: flex;');

    expect(galleryCss.trim()).toBe(expectedCss);
  });
});
