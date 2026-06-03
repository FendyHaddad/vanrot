import { describe, expect, it } from 'vitest';
import {
  defineDynamicSeo,
  defineSeo,
  isDynamicSeo,
  resolveSeoInput,
} from '../src/index.js';

describe('@vanrot/seo metadata contracts', () => {
  it('keeps static metadata readable and immutable', () => {
    const metadata = defineSeo({
      title: 'Vanrot',
      description: 'Tiny framework, serious defaults.',
    });

    expect(metadata.title).toBe('Vanrot');
    expect(Object.isFrozen(metadata)).toBe(true);
  });

  it('supports async metadata without forcing runtime imports', async () => {
    const metadata = defineDynamicSeo(async ({ slug }: { slug: string }) => ({
      title: `Post ${slug}`,
      description: 'Dynamic page',
    }));

    expect(isDynamicSeo(metadata)).toBe(true);
    await expect(resolveSeoInput(metadata, { slug: 'seo' })).resolves.toMatchObject({
      title: 'Post seo',
    });
  });
});
