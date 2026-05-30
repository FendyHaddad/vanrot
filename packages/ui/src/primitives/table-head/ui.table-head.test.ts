import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { UiTableHead } from './ui.table-head.ts';

describe('UiTableHead', () => {
  it('exports the table head primitive class', () => {
    expect(UiTableHead).toBeTypeOf('function');
  });

  it('keeps table head typography aligned with the homepage mockup', async () => {
    const css = await readFile(new URL('./ui.table-head.css', import.meta.url), 'utf8');

    expect(css).toContain('font-size: 10px;');
    expect(css).toContain('text-transform: uppercase;');
    expect(css).toContain('letter-spacing: 0;');
    expect(css).toContain('font-weight: 500;');
  });
});
