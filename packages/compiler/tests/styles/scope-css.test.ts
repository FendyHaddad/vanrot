import { describe, expect, it } from 'vitest';
import { scopeCss } from '../../src/styles/scope-css.js';

describe('scopeCss', () => {
  it('scopes supported selectors', () => {
    const result = scopeCss(
      [
        'button { color: red; }',
        '.primary { color: blue; }',
        '#save { color: green; }',
        'button.primary { color: black; }',
        '.toolbar button { color: white; }',
        '.a, .b { display: block; }',
      ].join('\n'),
      'data-vr-a1b2c3',
      'counter.component.css',
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.css).toContain('button[data-vr-a1b2c3] { color: red; }');
    expect(result.css).toContain('.primary[data-vr-a1b2c3] { color: blue; }');
    expect(result.css).toContain('#save[data-vr-a1b2c3] { color: green; }');
    expect(result.css).toContain('button.primary[data-vr-a1b2c3] { color: black; }');
    expect(result.css).toContain(
      '.toolbar[data-vr-a1b2c3] button[data-vr-a1b2c3] { color: white; }',
    );
    expect(result.css).toContain(
      '.a[data-vr-a1b2c3], .b[data-vr-a1b2c3] { display: block; }',
    );
    expect(result.mappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          generatedFile: 'css',
          sourceFilePath: 'counter.component.css',
          sourceLine: 1,
          sourceColumn: 1,
        }),
      ]),
    );
  });

  it('scopes selectors inside media rules', () => {
    expect(
      scopeCss('@media (min-width: 40rem) { button { color: red; } }', 'data-vr-a1b2c3', 'x.css')
        .css,
    ).toContain('@media (min-width: 40rem) { button[data-vr-a1b2c3] { color: red; } }');
  });

  it('leaves global selectors unscoped', () => {
    const result = scopeCss(':global(body) { margin: 0; }', 'data-vr-a1b2c3', 'x.css');

    expect(result.diagnostics).toEqual([]);
    expect(result.css).toContain('body { margin: 0; }');
  });

  it('reports multi-selector global escapes instead of dropping selectors', () => {
    const globalSelector = ':global(.a, .b)';
    const result = scopeCss(`${globalSelector} { margin: 0; }`, 'data-vr-a1b2c3', 'x.css');

    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR008',
        docsPath: '/docs/compiler/scoped-css',
        sourceText: globalSelector,
      },
    ]);
  });

  it('supports :host and :global selectors', () => {
    const result = scopeCss(
      [
        ':host { display: block; }',
        ':host(.active) { color: red; }',
        ':global(body) { margin: 0; }',
        '.card:hover { color: blue; }',
      ].join('\n'),
      'data-vr-a1b2c3',
      'profile-card.component.css',
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.css).toContain('[data-vr-a1b2c3] { display: block; }');
    expect(result.css).toContain('[data-vr-a1b2c3].active { color: red; }');
    expect(result.css).toContain('body { margin: 0; }');
    expect(result.css).toContain('.card:hover[data-vr-a1b2c3] { color: blue; }');
  });

  it('reports unscopable selectors with CSS source metadata', () => {
    const hostContextSelector = ':host-context(.dark) .card';
    const result = scopeCss(`${hostContextSelector} { color: white; }`, 'data-vr-a1b2c3', 'x.css');

    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR008',
        docsPath: '/docs/compiler/scoped-css',
        filePath: 'x.css',
        line: 1,
        column: 1,
        endLine: 1,
        endColumn: 27,
        sourceText: hostContextSelector,
      },
    ]);
    expect(result.diagnostics[0]?.codeFrame).toContain('^'.repeat(hostContextSelector.length));
  });
});
