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
