import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { deploymentReference, publicRouteMetadata } from '../src/docs/framework-reference.ts';

const appRoot = process.cwd();

async function readSiteFile(path: string): Promise<string> {
  return readFile(join(appRoot, path), 'utf8');
}

describe('site polish', () => {
  it('uses approved landing CTA labels', async () => {
    const source = await readSiteFile('src/pages/home/home.page.ts');

    expect(source).toContain("primaryCta: 'Framework Documentation'");
    expect(source).toContain("secondaryCta: 'Design Component'");
    expect(source).not.toContain("primaryCta: 'Read the docs'");
    expect(source).not.toContain("secondaryCta: 'View components'");
  });

  it('keeps the landing page focused on framework docs and design components', async () => {
    const html = await readSiteFile('src/pages/home/home.page.html');

    expect(html).toContain('Framework Documentation');
    expect(html).toContain('Design Component');
    expect(html).toContain('<vr-card');
    expect(html).toContain('<vr-badge');
  });

  it('aligns the framework docs shell with the component docs sidebar language', async () => {
    const html = await readSiteFile('src/layouts/docs/docs.layout.html');
    const css = await readSiteFile('src/layouts/docs/docs.layout.css');

    expect(html).toContain('class="docs-brand"');
    expect(html).toContain('class="docs-search"');
    expect(html).toContain('class="docs-nav-title"');
    expect(html).toContain('class="docs-nav-link"');
    expect(html).toContain(
      '<vr-sidebar class="docs-sidebar" placement.left aria-label="Documentation">',
    );
    expect(css).toContain('grid-template-columns: 240px minmax(0, 1fr)');
    expect(css).toContain('border-right: 1px solid');
    expect(css).toContain('height: 32px');
  });

  it('has public route metadata for the front doors', () => {
    expect(publicRouteMetadata.map((item) => item.path)).toEqual([
      '/',
      '/docs',
      '/docs/components',
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
