import { seoDiagnosticCode } from './constants.js';
import type { SeoDiagnostic, SeoImage, SeoOpenGraph, SeoTwitter } from './types.js';

const imageUrlPath = 'images.url';
const imageAltPath = 'images.alt';

export function defineOpenGraph(openGraph: SeoOpenGraph): Readonly<SeoOpenGraph> {
  return Object.freeze({ ...openGraph });
}

export function defineTwitterCard(twitter: SeoTwitter): Readonly<SeoTwitter> {
  return Object.freeze({ ...twitter });
}

export function validateSeoImages(images: SeoImage[] | undefined): SeoDiagnostic[] {
  if (!images?.length) {
    return [];
  }

  return images.flatMap((image) => {
    const diagnostics: SeoDiagnostic[] = [];

    if (!isValidImageUrl(image.url)) {
      diagnostics.push({
        code: seoDiagnosticCode.invalidSocialImage,
        message: 'SEO image URL must be absolute or root-relative.',
        severity: 'warning',
        path: imageUrlPath,
      });
    }

    if (!image.alt.trim()) {
      diagnostics.push({
        code: seoDiagnosticCode.invalidSocialImage,
        message: 'SEO image alt text is required.',
        severity: 'warning',
        path: imageAltPath,
      });
    }

    return diagnostics;
  });
}

function isValidImageUrl(value: string): boolean {
  if (value.startsWith('/')) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
