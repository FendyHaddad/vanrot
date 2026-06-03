import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { applySeoToHead } from '../src/index.js';

describe('@vanrot/seo client head updates', () => {
  it('updates document head through an explicit opt-in API', () => {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');

    applySeoToHead(
      {
        title: 'Vanrot SEO',
        description: 'Client update',
        canonical: 'https://vanrot.vankode.com',
      },
      { document: dom.window.document },
    );

    expect(dom.window.document.title).toBe('Vanrot SEO');
    expect(dom.window.document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Client update',
    );
    expect(dom.window.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://vanrot.vankode.com',
    );
  });
});
