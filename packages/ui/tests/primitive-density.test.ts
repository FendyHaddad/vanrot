import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const packageRoot = process.cwd();

async function readPrimitiveCss(path: string): Promise<string> {
  return readFile(join(packageRoot, 'src/primitives', path), 'utf8');
}

describe('primitive density', () => {
  it('keeps stat cards aligned with dashboard mockups', async () => {
    const css = await readPrimitiveCss('stat/ui.stat.css');
    const bundledCss = await readFile(join(packageRoot, 'src/styles/vanrotstyles.css'), 'utf8');

    expect(css).toContain('border-radius: 10px;');
    expect(css).toContain('padding: 13px 14px;');
    expect(css).toContain('gap: 8px;');
    expect(bundledCss).toContain('border-radius: 10px;');
    expect(bundledCss).toContain('padding: 13px 14px;');
  });

  it('keeps table typography aligned with dashboard mockups', async () => {
    const headCss = await readPrimitiveCss('table-head/ui.table-head.css');
    const cellCss = await readPrimitiveCss('table-cell/ui.table-cell.css');
    const bundledCss = await readFile(join(packageRoot, 'src/styles/vanrotstyles.css'), 'utf8');

    expect(headCss).toContain('font-size: 10px;');
    expect(headCss).toContain('text-transform: uppercase;');
    expect(headCss).toContain('letter-spacing: 0;');
    expect(headCss).toContain('font-weight: 500;');
    expect(cellCss).toContain('padding: 11px 18px;');
    expect(cellCss).toContain('font-size: 12.5px;');
    expect(bundledCss).toContain('padding: 11px 18px;');
    expect(bundledCss).toContain('font-size: 12.5px;');
    expect(bundledCss).toContain('text-transform: uppercase;');
  });
});
