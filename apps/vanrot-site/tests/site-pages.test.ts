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
});
