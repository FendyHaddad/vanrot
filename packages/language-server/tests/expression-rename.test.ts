import { describe, expect, it } from 'vitest';
import { expressionRename } from '../src/features/expression-rename.js';

const component = `export class XComponent { count = 1; }\n`;
const template = '<p>{{ count }}</p>';

describe('expressionRename', () => {
  it('returns a template edit for the member occurrence', () => {
    const offset = template.indexOf('count');
    const edits = expressionRename(template, component, 'XComponent', offset, 'total');

    expect(edits.template.length).toBeGreaterThan(0);
    expect(edits.template[0]?.newText).toBe('total');
  });
});
