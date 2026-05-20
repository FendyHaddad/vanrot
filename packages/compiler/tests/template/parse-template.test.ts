import { describe, expect, it } from 'vitest';
import { parseTemplate } from '../../src/template/parse-template.js';

describe('parseTemplate', () => {
  it('parses elements, text, nested children, and static attributes', () => {
    expect(
      parseTemplate(
        '<section class="counter"><p>Ready</p><input value="A" /></section>',
        'counter.component.html',
      ),
    ).toEqual({
      nodes: [
        {
          kind: 'element',
          tagName: 'section',
          attributes: [{ name: 'class', value: 'counter' }],
          children: [
            {
              kind: 'element',
              tagName: 'p',
              attributes: [],
              children: [{ kind: 'text', value: 'Ready' }],
            },
            {
              kind: 'element',
              tagName: 'input',
              attributes: [{ name: 'value', value: 'A' }],
              children: [],
            },
          ],
        },
      ],
      diagnostics: [],
    });
  });

  it('ignores comments', () => {
    expect(parseTemplate('<!-- comment --><p>Ready</p>', 'counter.component.html')).toEqual({
      nodes: [
        {
          kind: 'element',
          tagName: 'p',
          attributes: [],
          children: [{ kind: 'text', value: 'Ready' }],
        },
      ],
      diagnostics: [],
    });
  });
});
