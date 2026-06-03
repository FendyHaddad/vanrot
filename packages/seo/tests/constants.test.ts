import { describe, expect, it } from 'vitest';
import {
  seoCanonicalPolicy,
  seoDiagnosticCode,
  seoOpenGraphType,
  seoPackageName,
  seoRobotsDirective,
  seoSchemaType,
  seoSitemapChangeFrequency,
  seoTwitterCard,
} from '../src/index.js';

describe('@vanrot/seo constants', () => {
  it('exports stable literal owners for generated SEO code', () => {
    expect(seoPackageName).toBe('@vanrot/seo');
    expect(seoRobotsDirective.noindex).toBe('noindex');
    expect(seoOpenGraphType.website).toBe('website');
    expect(seoTwitterCard.summaryLargeImage).toBe('summary_large_image');
    expect(seoSchemaType.webSite).toBe('WebSite');
    expect(seoCanonicalPolicy.siteUrlRequired).toBe('site-url-required');
    expect(seoSitemapChangeFrequency.weekly).toBe('weekly');
    expect(seoDiagnosticCode.missingTitle).toBe('VRSEO001');
  });
});
