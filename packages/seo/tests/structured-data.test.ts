import { describe, expect, it } from 'vitest';
import {
  breadcrumbListSchema,
  rawSchema,
  seoSchemaType,
  webSiteSchema,
} from '../src/index.js';

describe('@vanrot/seo structured data', () => {
  it('builds typed JSON-LD models', () => {
    expect(webSiteSchema({ name: 'Vanrot', url: 'https://vanrot.vankode.com' })).toEqual({
      type: seoSchemaType.webSite,
      data: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Vanrot',
        url: 'https://vanrot.vankode.com',
      },
    });
  });

  it('supports breadcrumbs and raw schema payloads', () => {
    expect(breadcrumbListSchema([{ name: 'Docs', url: '/docs' }]).data).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [{ position: 1, name: 'Docs', item: '/docs' }],
    });
    expect(rawSchema({ '@type': 'SoftwareApplication', name: 'Vanrot' }).data).toMatchObject({
      '@type': 'SoftwareApplication',
    });
  });
});
