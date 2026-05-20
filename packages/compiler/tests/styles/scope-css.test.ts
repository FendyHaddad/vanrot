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
  });

  it('scopes selectors inside media rules', () => {
    expect(
      scopeCss('@media (min-width: 40rem) { button { color: red; } }', 'data-vr-a1b2c3', 'x.css')
        .css,
    ).toContain('@media (min-width: 40rem) { button[data-vr-a1b2c3] { color: red; } }');
  });

  it('reports global escapes as unsupported in Phase 3', () => {
    expect(scopeCss(':global(body) { margin: 0; }', 'data-vr-a1b2c3', 'x.css')).toMatchObject({
      diagnostics: [{ code: 'VR008' }],
    });
  });
});
