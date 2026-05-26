import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

describe('ui framework usage example', () => {
  it('uses Vanrot UI primitives from a framework guide context', () => {
    const html = readFileSync(join(root, 'src/interface.component.html'), 'utf8');

    expect(html).toContain('vr-button');
    expect(html).toContain('vr-card');
    expect(html).toContain('vr-badge');
  });
});
