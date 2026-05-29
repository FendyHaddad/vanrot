import { describe, expect, it } from 'vitest';
import { expressionHover } from '../src/features/expression-hover.js';

const component = `export class XComponent { count = 1; }\n`;
const template = '<p>{{ count }}</p>';

describe('expressionHover', () => {
  it('returns the type of an expression member', () => {
    const offset = template.indexOf('count');
    const hover = expressionHover(template, component, 'XComponent', offset);

    expect(hover?.contents).toMatch(/number/);
  });
});
