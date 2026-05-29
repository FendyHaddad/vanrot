import { describe, expect, it } from 'vitest';
import { expressionCompletion } from '../src/features/expression-completion.js';

const component = `export class XComponent { user = { name: 'a' }; }\n`;

describe('expressionCompletion', () => {
  it('offers members after a dot', () => {
    const template = '<p>{{ user. }}</p>';
    const offset = template.indexOf('user.') + 'user.'.length;
    const items = expressionCompletion(template, component, 'XComponent', offset);

    expect(items.some((item) => item.label === 'name')).toBe(true);
  });
});
