import { describe, expect, it } from 'vitest';
import { route } from '../src/routes.ts';

describe('routing workflows example', () => {
  it('exports named route refs with metadata', () => {
    expect(route.home.path).toBe('/');
    expect(route.docs.path).toBe('/docs');
    expect(route.docs.title).toBe('Docs');
  });
});
