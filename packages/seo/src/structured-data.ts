import { seoSchemaType } from './constants.js';
import type { SeoSchemaType, SeoStructuredData } from './types.js';

const schemaContext = 'https://schema.org';
const schemaContextKey = '@context';
const schemaTypeKey = '@type';

export function defineSchema(
  type: SeoSchemaType | string,
  data: Record<string, unknown>,
): SeoStructuredData {
  return {
    type,
    data: {
      [schemaContextKey]: schemaContext,
      [schemaTypeKey]: type,
      ...data,
    },
  };
}

export function webSiteSchema(data: Record<string, unknown>): SeoStructuredData {
  return defineSchema(seoSchemaType.webSite, data);
}

export function webPageSchema(data: Record<string, unknown>): SeoStructuredData {
  return defineSchema(seoSchemaType.webPage, data);
}

export function organizationSchema(data: Record<string, unknown>): SeoStructuredData {
  return defineSchema(seoSchemaType.organization, data);
}

export interface BreadcrumbSchemaItem {
  name: string;
  url: string;
}

export function breadcrumbListSchema(items: BreadcrumbSchemaItem[]): SeoStructuredData {
  return defineSchema(seoSchemaType.breadcrumbList, {
    itemListElement: items.map((item, index) => ({
      [schemaTypeKey]: 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export function rawSchema(data: Record<string, unknown>): SeoStructuredData {
  const type = typeof data[schemaTypeKey] === 'string' ? data[schemaTypeKey] : 'Thing';

  return {
    type,
    data: {
      [schemaContextKey]: schemaContext,
      ...data,
    },
  };
}
