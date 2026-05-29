import { describe, expect, it } from 'vitest';
import { expressionDiagnostics } from '../src/features/expression-diagnostics.js';

const component = `export class XComponent { count = 1; }\n`;

describe('expressionDiagnostics', () => {
  it('flags an unknown member', () => {
    const template = '<p>{{ nope }}</p>';
    const diagnostics = expressionDiagnostics(template, component, 'XComponent');

    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0]?.range.start.character).toBeGreaterThanOrEqual(0);
  });

  it('passes a valid member', () => {
    const template = '<p>{{ count }}</p>';

    expect(expressionDiagnostics(template, component, 'XComponent')).toHaveLength(0);
  });
});
