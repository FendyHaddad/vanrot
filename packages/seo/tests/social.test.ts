import { describe, expect, it } from 'vitest';
import {
  defineOpenGraph,
  defineTwitterCard,
  seoDiagnosticCode,
  seoTwitterCard,
  validateSeoImages,
} from '../src/index.js';

describe('@vanrot/seo social helpers', () => {
  it('builds Open Graph and Twitter metadata', () => {
    expect(defineOpenGraph({ title: 'Vanrot' })).toMatchObject({ title: 'Vanrot' });
    expect(defineTwitterCard({ card: seoTwitterCard.summaryLargeImage })).toMatchObject({
      card: 'summary_large_image',
    });
  });

  it('validates social images without generating them', () => {
    const diagnostics = validateSeoImages([
      { url: 'not-a-url', alt: '' },
      { url: '/preview.png', alt: 'Vanrot preview', width: 1200, height: 630 },
    ]);

    expect(diagnostics).toEqual([
      expect.objectContaining({ code: seoDiagnosticCode.invalidSocialImage }),
      expect.objectContaining({ code: seoDiagnosticCode.invalidSocialImage }),
    ]);
  });
});
