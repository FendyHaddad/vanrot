import { describe, expect, it } from 'vitest';
import { parseHtmlFragment, parseTemplate } from '../../src/template/parse-template.js';

describe('parseTemplate', () => {
  it('parses elements, text, nested children, and static attributes', () => {
    expect(
      parseTemplate(
        '<section class="counter"><p>Ready</p><input value="A" /></section>',
        'counter.component.html',
      ),
    ).toMatchObject({
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
    expect(parseTemplate('<!-- comment --><p>Ready</p>', 'counter.component.html')).toMatchObject({
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
    ).toMatchObject({
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

  it('preserves source spans for elements, attributes, and text nodes', () => {
    const result = parseTemplate('<button (click)="save()">Save</button>', 'counter.component.html');
    const button = result.nodes[0];

    expect(button).toMatchObject({
      kind: 'element',
      tagName: 'button',
      span: {
        filePath: 'counter.component.html',
        line: 1,
        column: 1,
        endLine: 1,
        endColumn: 39,
      },
    });

    if (button?.kind !== 'element') {
      throw new Error('Expected element node');
    }

    expect(button.attributes[0]).toMatchObject({
      name: '(click)',
      value: 'save()',
      span: {
        line: 1,
        column: 9,
        endLine: 1,
        endColumn: 25,
      },
    });
    expect(button.children[0]).toMatchObject({
      kind: 'text',
      value: 'Save',
      span: {
        line: 1,
        column: 26,
        endLine: 1,
        endColumn: 30,
      },
    });
  });

  it('maps parsed fragment spans to the original source with nonzero offsets', () => {
    const source = '<host>\n  <button [disabled]="saving()">Save</button>\n</host>';
    const fragment = '<button [disabled]="saving()">Save</button>';
    const result = parseHtmlFragment(fragment, 'counter.component.html', source.indexOf(fragment), source);
    const button = result.nodes[0];

    expect(button).toMatchObject({
      kind: 'element',
      span: {
        filePath: 'counter.component.html',
        line: 2,
        column: 3,
        endLine: 2,
        endColumn: 46,
        startOffset: 9,
        endOffset: 52,
      },
    });

    if (button?.kind !== 'element') {
      throw new Error('Expected element node');
    }

    expect(button.attributes[0]).toMatchObject({
      name: '[disabled]',
      span: {
        line: 2,
        column: 11,
        endLine: 2,
        endColumn: 32,
        startOffset: 17,
        endOffset: 38,
      },
      valueSpan: {
        line: 2,
        column: 23,
        endLine: 2,
        endColumn: 31,
        startOffset: 29,
        endOffset: 37,
      },
    });
    expect(button.children[0]).toMatchObject({
      kind: 'text',
      span: {
        line: 2,
        column: 33,
        endLine: 2,
        endColumn: 37,
        startOffset: 39,
        endOffset: 43,
      },
    });
  });

  it('preserves raw value spans for entity-encoded attributes', () => {
    const result = parseTemplate('<button title="\'A &amp; B\'">Save</button>', 'counter.component.html');
    const button = result.nodes[0];

    if (button?.kind !== 'element') {
      throw new Error('Expected button element node');
    }

    expect(button.attributes[0]).toMatchObject({
      name: 'title',
      value: "'A & B'",
      valueSpan: {
        line: 1,
        column: 16,
        endLine: 1,
        endColumn: 27,
        startOffset: 15,
        endOffset: 26,
      },
    });
  });

  it('preserves source positions for self-closing route primitives after normalization', () => {
    const result = parseTemplate('<nav><vr route.home /></nav>', 'app.component.html');
    const nav = result.nodes[0];

    if (nav?.kind !== 'element') {
      throw new Error('Expected nav element node');
    }

    const route = nav.children[0];

    expect(route).toMatchObject({
      kind: 'element',
      tagName: 'vr',
      span: {
        line: 1,
        column: 6,
        endLine: 1,
        endColumn: 23,
        startOffset: 5,
        endOffset: 22,
      },
    });

    if (route?.kind !== 'element') {
      throw new Error('Expected route element node');
    }

    expect(route.attributes[0]).toMatchObject({
      name: 'route.home',
      span: {
        line: 1,
        column: 10,
        endLine: 1,
        endColumn: 20,
        startOffset: 9,
        endOffset: 19,
      },
    });
  });

  it('parses named slot receivers and parent slot attributes', () => {
    const result = parseTemplate(
      '<profile-card><h2 slot.title>Owner</h2></profile-card><slot.actions><button>Edit</button></slot.actions>',
      'profile-card.component.html',
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.nodes).toMatchObject([
      {
        kind: 'element',
        tagName: 'profile-card',
        children: [
          {
            kind: 'element',
            tagName: 'h2',
            attributes: [{ name: 'slot.title' }],
          },
        ],
      },
      {
        kind: 'slot-outlet',
        name: 'actions',
        fallback: [
          {
            kind: 'element',
            tagName: 'button',
            children: [{ kind: 'text', value: 'Edit' }],
          },
        ],
      },
    ]);
  });
});
