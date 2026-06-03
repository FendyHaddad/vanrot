import { describe, expect, it } from 'vitest';
import {
  renderSeoTags,
  renderSeoToString,
  webSiteSchema,
} from '../src/index.js';

describe('@vanrot/seo SSR rendering', () => {
  it('renders escaped title, meta, canonical, social, and JSON-LD tags', () => {
    const tags = renderSeoTags({
      title: 'Vanrot <Docs>',
      description: 'Build & ship',
      canonical: 'https://vanrot.vankode.com/docs',
      openGraph: { title: 'Vanrot Docs' },
      structuredData: [webSiteSchema({ name: 'Vanrot' })],
    });

    expect(tags).toContain('<title>Vanrot &lt;Docs&gt;</title>');
    expect(tags).toContain('<meta name="description" content="Build &amp; ship">');
    expect(tags).toContain('<link rel="canonical" href="https://vanrot.vankode.com/docs">');
    expect(tags).toContain('<meta property="og:title" content="Vanrot Docs">');
    expect(renderSeoToString({ title: 'Vanrot' })).toBe('<title>Vanrot</title>');
  });
});
