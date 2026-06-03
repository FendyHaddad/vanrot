import { describe, expect, it } from 'vitest';
import {
  defineDynamicSitemapRoutes,
  defineSitemapRoute,
  generateSitemapXml,
  resolveSitemapRoutes,
  seoSitemapChangeFrequency,
} from '../src/index.js';

describe('@vanrot/seo sitemap output', () => {
  it('generates XML for static and dynamic sitemap routes', async () => {
    const routes = await resolveSitemapRoutes([
      defineSitemapRoute({ path: '/', priority: 1 }),
      defineDynamicSitemapRoutes(async () => [
        {
          path: '/docs',
          changeFrequency: seoSitemapChangeFrequency.weekly,
        },
      ]),
    ]);

    expect(generateSitemapXml({ siteUrl: 'https://vanrot.vankode.com', routes })).toContain(
      '<loc>https://vanrot.vankode.com/docs</loc>',
    );
  });
});
