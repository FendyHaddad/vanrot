import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileTemplateDiagnostics } from '../src/features/diagnostics.js';

function fixture(templateText: string) {
  const dir = mkdtempSync(join(tmpdir(), 'vr-diag-'));
  writeFileSync(join(dir, 'x.component.ts'), 'export class XComponent {}\n');
  writeFileSync(join(dir, 'x.component.css'), '');
  writeFileSync(join(dir, 'x.component.html'), templateText);
  return join(dir, 'x.component.html');
}

describe('compileTemplateDiagnostics', () => {
  it('returns no diagnostics for a valid template', async () => {
    const path = fixture('<p>hello</p>\n');
    const diagnostics = await compileTemplateDiagnostics(path, '<p>hello</p>\n');
    expect(diagnostics).toHaveLength(0);
  });

  it('flags an unsupported expression with a VR code', async () => {
    const path = fixture('<p>{{ a = 1 }}</p>\n');
    const diagnostics = await compileTemplateDiagnostics(path, '<p>{{ a = 1 }}</p>\n');
    expect(diagnostics.some((diagnostic) => typeof diagnostic.code === 'string')).toBe(true);
  });
});
