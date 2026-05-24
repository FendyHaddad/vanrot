// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { generateComponent } from '../../src/codegen/generate-component.js';
import type { ComponentMetadata } from '../../src/metadata/component-metadata.js';
import type { TemplateNode } from '../../src/template/ast.js';
import { parseTemplate } from '../../src/template/parse-template.js';

const metadata: ComponentMetadata = {
  componentName: 'TokenComponent',
  exportName: 'TokenComponent',
  importPath: 'token.component.js',
};

function compileTemplate(templateSource: string) {
  const templatePath = 'token.component.html';
  const parsed = parseTemplate(templateSource, templatePath);

  expect(parsed.diagnostics).toEqual([]);

  return generateComponent({
    metadata,
    nodes: parsed.nodes as TemplateNode[],
    scopeAttribute: 'data-vr-token',
    templatePath,
    templateSource,
  });
}

describe('UI dotted token attributes', () => {
  it('lowers Phase 16B finite tokens without keeping generated token attributes', () => {
    const result = compileTemplate(
      [
        '<vr-button variant.danger type="button">Delete</vr-button>',
        '<vr-badge tone.success>Live</vr-badge>',
        '<vr-alert tone.warning>Careful</vr-alert>',
        '<vr-separator orientation.vertical></vr-separator>',
      ].join(''),
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("document.createElement('button')");
    expect(result.js).toContain("button0.setAttribute('class', 'vr-button vr-button-danger');");
    expect(result.js).toContain("button0.setAttribute('type', 'button');");
    expect(result.js).toContain("span0.setAttribute('class', 'vr-badge vr-badge-success');");
    expect(result.js).toContain("section0.setAttribute('class', 'vr-alert vr-alert-warning');");
    expect(result.js).toContain("hr0.setAttribute('class', 'vr-separator vr-separator-vertical');");
    expect(result.js).toContain("hr0.setAttribute('aria-orientation', 'vertical');");
    expect(result.js).not.toContain('variant.danger');
    expect(result.js).not.toContain('tone.success');
    expect(result.js).not.toContain('tone.warning');
    expect(result.js).not.toContain('orientation.vertical');
  });

  it('lowers Phase 16D layout tokens into static classes', () => {
    const result = compileTemplate(`
      <vr-container size.lg>
        <vr-section spacing.md>
          <vr-grid cols.3 gap.4>
            <vr-stack gap.3>Content</vr-stack>
          </vr-grid>
        </vr-section>
      </vr-container>
    `);

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("div0.setAttribute('class', 'vr-container vr-container-lg');");
    expect(result.js).toContain("section0.setAttribute('class', 'vr-section vr-section-md');");
    expect(result.js).toContain(
      "div1.setAttribute('class', 'vr-grid vr-grid-cols-3 vr-grid-gap-4');",
    );
    expect(result.js).toContain("div2.setAttribute('class', 'vr-stack vr-stack-gap-3');");
    expect(result.js).not.toContain('size.lg');
    expect(result.js).not.toContain('spacing.md');
    expect(result.js).not.toContain('cols.3');
    expect(result.js).not.toContain('gap.4');
    expect(result.js).not.toContain('gap.3');
  });

  it('diagnoses duplicate dotted tokens within the same token group', () => {
    const result = compileTemplate('<vr-grid cols.3 cols.4>Content</vr-grid>');

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'VR020',
        severity: 'error',
        message:
          'Duplicate cols token for <vr-grid>. Use only one of: cols.1, cols.2, cols.3, cols.4, cols.6, cols.12.',
      }),
    ]);
  });

  it('diagnoses unknown dotted tokens for supported Vanrot UI primitives', () => {
    const result = compileTemplate('<vr-grid cols.13>Content</vr-grid>');

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'VR021',
        severity: 'error',
        message:
          'Unknown token "cols.13" for <vr-grid>. Supported tokens: cols.1, cols.2, cols.3, cols.4, cols.6, cols.12, gap.0, gap.1, gap.2, gap.3, gap.4, gap.5, gap.6, gap.8.',
      }),
    ]);
  });
});
