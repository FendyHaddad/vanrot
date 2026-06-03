import { describe, expect, it } from 'vitest';
import { buildSeoArtifacts } from '@/seo-build.js';

describe('Vite SEO build artifacts', () => {
  it('generates sitemap.xml and robots.txt from Vanrot SEO config', async () => {
    const artifacts = await buildSeoArtifacts({
      siteUrl: 'https://vanrot.vankode.com',
      sitemap: {
        enabled: true,
        routes: [{ path: '/docs', changeFrequency: 'weekly' }],
      },
      robots: {
        directives: ['index', 'follow'],
      },
    });

    expect(artifacts).toEqual([
      expect.objectContaining({
        fileName: 'sitemap.xml',
        source: expect.stringContaining('<loc>https://vanrot.vankode.com/docs</loc>'),
      }),
      expect.objectContaining({
        fileName: 'robots.txt',
        source: expect.stringContaining('Sitemap: https://vanrot.vankode.com/sitemap.xml'),
      }),
    ]);
  });

  it('skips artifacts until siteUrl is configured', async () => {
    await expect(buildSeoArtifacts({ sitemap: { enabled: true, routes: [{ path: '/' }] } })).resolves.toEqual(
      [],
    );
  });
});
