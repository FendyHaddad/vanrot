import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { UiStat } from './ui.stat.ts';

describe('UiStat', () => {
  it('exports the stat primitive class', () => {
    expect(UiStat).toBeTypeOf('function');
  });

  it('keeps dashboard stat density aligned with the homepage mockup', async () => {
    const css = await readFile(new URL('./ui.stat.css', import.meta.url), 'utf8');

    expect(css).toContain('border-radius: 10px;');
    expect(css).toContain('padding: 13px 14px;');
    expect(css).toContain('gap: 8px;');
  });
});
