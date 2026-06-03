import { describe, expect, it } from 'vitest';
import {
  resolveCanonicalUrl,
  resolveSeoLadder,
  seoCanonicalPolicy,
} from '../src/index.js';

describe('@vanrot/seo metadata ladder', () => {
  it('resolves metadata from global, route, page, and dynamic layers', async () => {
    const resolved = await resolveSeoLadder({
      global: {
        title: 'Vanrot',
        description: 'Global description',
        openGraph: { siteName: 'Vanrot' },
      },
      route: { description: 'Route description' },
      page: { title: 'Docs', canonical: '/docs' },
      dynamic: async () => ({ title: 'Docs for SEO' }),
      siteUrl: 'https://vanrot.vankode.com',
      routePath: '/docs',
    });

    expect(resolved.title).toBe('Docs for SEO');
    expect(resolved.description).toBe('Route description');
    expect(resolved.openGraph?.siteName).toBe('Vanrot');
    expect(resolved.canonical).toBe('https://vanrot.vankode.com/docs');
  });

  it('allows relative canonical paths when the policy does not require a site URL', () => {
    expect(
      resolveCanonicalUrl({
        canonical: '/docs',
        policy: seoCanonicalPolicy.pathOnlyAllowed,
      }),
    ).toBe('/docs');
  });
});
