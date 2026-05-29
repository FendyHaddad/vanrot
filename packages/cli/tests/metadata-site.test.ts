import { describe, expect, it } from 'vitest';
import { vanrotSitePath, vanrotSiteUrl } from '../src/commands/metadata.js';

describe('vanrot site metadata', () => {
  it('exposes the canonical public site URL', () => {
    expect(vanrotSiteUrl).toBe('https://vanrot.vankode.com');
  });

  it('exposes docs and components paths', () => {
    expect(vanrotSitePath.docs).toBe('/docs');
    expect(vanrotSitePath.components).toBe('/components');
  });
});
