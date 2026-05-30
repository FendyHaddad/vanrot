import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { UiTableCell } from './ui.table-cell.ts';

describe('UiTableCell', () => {
  it('exports the table cell primitive class', () => {
    expect(UiTableCell).toBeTypeOf('function');
  });

  it('keeps table cell density aligned with the homepage mockup', async () => {
    const css = await readFile(new URL('./ui.table-cell.css', import.meta.url), 'utf8');

    expect(css).toContain('padding: 11px 18px;');
    expect(css).toContain('font-size: 12.5px;');
  });
});
