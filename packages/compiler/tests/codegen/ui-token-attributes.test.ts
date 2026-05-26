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
          <vr-grid cols.3 gap.4>Content</vr-grid>
        </vr-section>
      </vr-container>
    `);

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("div0.setAttribute('class', 'vr-container vr-container-lg');");
    expect(result.js).toContain("section0.setAttribute('class', 'vr-section vr-section-md');");
    expect(result.js).toContain(
      "div1.setAttribute('class', 'vr-grid vr-grid-cols-3 vr-grid-gap-4');",
    );
    expect(result.js).not.toContain('size.lg');
    expect(result.js).not.toContain('spacing.md');
    expect(result.js).not.toContain('cols.3');
    expect(result.js).not.toContain('gap.4');
  });

  it('lowers Phase 16E form and data tokens into static classes and native defaults', () => {
    const result = compileTemplate(`
      <vr-input type.email size.lg tone.danger name="email"></vr-input>
      <vr-table density.compact tone.muted sortable>
        <vr-table-body><vr-table-row><vr-table-cell>Paid</vr-table-cell></vr-table-row></vr-table-body>
      </vr-table>
      <vr-pagination size.sm variant.numbers></vr-pagination>
      <vr-list marker.check density.dense></vr-list>
      <vr-stat tone.success align.right></vr-stat>
    `);

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain(
      "input0.setAttribute('class', 'vr-input vr-input-type-email vr-input-size-lg vr-input-tone-danger');",
    );
    expect(result.js).toContain("input0.setAttribute('type', 'email');");
    expect(result.js).toContain(
      "table0.setAttribute('class', 'vr-table vr-table-density-compact vr-table-tone-muted');",
    );
    expect(result.js).toContain(
      "nav0.setAttribute('class', 'vr-pagination vr-pagination-size-sm vr-pagination-numbers');",
    );
    expect(result.js).toContain(
      "ul0.setAttribute('class', 'vr-list vr-list-marker-check vr-list-density-dense');",
    );
    expect(result.js).toContain(
      "section0.setAttribute('class', 'vr-stat vr-stat-tone-success vr-stat-align-right');",
    );
    expect(result.js).not.toContain('type.email');
    expect(result.js).not.toContain('density.compact');
    expect(result.features).toEqual(
      expect.arrayContaining(['ui-input', 'ui-table', 'ui-pagination', 'ui-list', 'ui-stat']),
    );
  });

  it('keeps user classes after Phase 16E generated classes', () => {
    const result = compileTemplate('<vr-input class="invoice-input" size.sm></vr-input>');

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain(
      "input0.setAttribute('class', 'vr-input vr-input-size-sm invoice-input');",
    );
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

  it('diagnoses unknown Phase 16E dotted token values', () => {
    const result = compileTemplate('<vr-table density.nano>Content</vr-table>');

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'VR021',
        severity: 'error',
        message:
          'Unknown token "density.nano" for <vr-table>. Supported tokens: density.comfortable, density.compact, density.dense, tone.default, tone.muted.',
      }),
    ]);
  });

  it('accepts Phase 16F dotted token attributes', () => {
    const result = compileTemplate('<vr-drawer side.right size.lg></vr-drawer>');

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain(
      "div0.setAttribute('class', 'vr-drawer vr-drawer-side-right vr-drawer-size-lg');",
    );
  });

  it('accepts Phase 16G dotted token attributes', () => {
    const result = compileTemplate(
      '<vr-popover side.bottom align.end></vr-popover><vr-command-menu density.compact></vr-command-menu>',
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain(
      "div0.setAttribute('class', 'vr-popover vr-popover-side-bottom vr-popover-align-end vr-popover-size-md vr-popover-motion-subtle');",
    );
    expect(result.js).toContain(
      "div1.setAttribute('class', 'vr-command-menu vr-command-menu-density-compact vr-command-menu-size-md vr-command-menu-tone-default');",
    );
  });

  it('diagnoses duplicate Phase 16G dotted token groups', () => {
    const result = compileTemplate('<vr-tooltip side.top side.bottom>Copy</vr-tooltip>');

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'VR020',
        severity: 'error',
        message:
          'Duplicate side token for <vr-tooltip>. Use only one of: side.top, side.right, side.bottom, side.left.',
      }),
    ]);
  });

  it('diagnoses duplicate Phase 16F dotted token groups', () => {
    const result = compileTemplate(
      '<vr-toast placement.topright placement.bottomright></vr-toast>',
    );

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'VR020',
        severity: 'error',
        message:
          'Duplicate placement token for <vr-toast>. Use only one of: placement.topright, placement.topleft, placement.bottomright, placement.bottomleft.',
      }),
    ]);
  });
});
