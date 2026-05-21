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

  it('treats Vanrot route primitives as self-closing route links', () => {
    expect(
      parseTemplate(
        '<nav><vr route.home /><vr route.about /></nav><vr-router></vr-router>',
        'app.component.html',
      ),
    ).toEqual({
      nodes: [
        {
          kind: 'element',
          tagName: 'nav',
          attributes: [],
          children: [
            {
              kind: 'element',
              tagName: 'vr',
              attributes: [{ name: 'route.home', value: '' }],
              children: [],
            },
            {
              kind: 'element',
              tagName: 'vr',
              attributes: [{ name: 'route.about', value: '' }],
              children: [],
            },
          ],
        },
        {
          kind: 'element',
          tagName: 'vr-router',
          attributes: [],
          children: [],
        },
      ],
      diagnostics: [],
    });
  });
});
