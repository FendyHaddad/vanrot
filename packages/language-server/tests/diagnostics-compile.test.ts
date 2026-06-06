import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileTemplateDiagnostics, editorTemplateDiagnostics } from '../src/features/diagnostics.js';

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

  it('does not flag valid bracket bindings or dotted no-value attributes', () => {
    const diagnostics = editorTemplateDiagnostics('/repo/src/pages/home.page.html', {
      routes: [{ name: 'home', span: span('/repo/src/routes.ts') }],
      components: [{ tagName: 'docs-page', className: 'DocsPage', path: '/repo/src/docs.page.ts' }],
      routesPath: '/repo/src/routes.ts',
      projectRoot: '/repo',
      webTypes: {
        sources: [],
        tags: [{ name: 'vr-button', description: null, sourcePath: 'packages/ui/web-types.json' }],
        attributes: [],
      },
      templates: {
        templates: [
          {
            path: '/repo/src/pages/home.page.html',
            tags: [
              { name: 'docs-page', span: span('/repo/src/pages/home.page.html') },
              { name: 'vr-button', span: span('/repo/src/pages/home.page.html') },
            ],
            routeRefs: [{ name: 'home', span: span('/repo/src/pages/home.page.html') }],
            bracketBindings: [{ name: 'article', span: span('/repo/src/pages/home.page.html') }],
            dottedAttributes: [{ name: 'behavior.tooltip', span: span('/repo/src/pages/home.page.html') }],
          },
        ],
      },
    });

    expect(diagnostics).toEqual([]);
  });
});

function span(filePath: string) {
  return { filePath, line: 1, column: 1, endLine: 1, endColumn: 1, startOffset: 0, endOffset: 0 };
}
