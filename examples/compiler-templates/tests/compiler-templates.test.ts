import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

describe('compiler templates example', () => {
  it('contains template, slot, control-flow, and scoped CSS examples', () => {
    const html = readFileSync(join(root, 'src/status-card.component.html'), 'utf8');
    const css = readFileSync(join(root, 'src/status-card.component.css'), 'utf8');

    expect(html).toContain('@if');
    expect(html).toContain('@for');
    expect(html).toContain('<slot>');
    expect(css).toContain(':host');
  });
});
