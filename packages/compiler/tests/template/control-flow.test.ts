import { describe, expect, it } from 'vitest';
import { parseTemplate } from '../../src/template/parse-template.js';

describe('control-flow template parsing', () => {
  it('parses top-level if else blocks with branch elements', () => {
    const templateSource = '@if (loggedIn()) { <p>Welcome</p> } @else { <a>Sign in</a> }';

    const result = parseTemplate(templateSource, 'home.page.html');

    expect(result.diagnostics).toEqual([]);
    expect(result.nodes).toMatchObject([
      {
        kind: 'if-block',
        expression: 'loggedIn()',
        expressionSpan: {
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 16,
          startOffset: 5,
          endOffset: 15,
        },
        consequent: [
          {
            kind: 'element',
            tagName: 'p',
            children: [{ kind: 'text', value: 'Welcome' }],
          },
        ],
        alternate: [
          {
            kind: 'element',
            tagName: 'a',
            children: [{ kind: 'text', value: 'Sign in' }],
          },
        ],
        span: {
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 61,
          startOffset: 0,
          endOffset: 60,
        },
      },
    ]);
  });

  it('parses sibling if blocks after HTML void elements', () => {
    const templateSource = '<input>@if (ready()) { <p>Ready</p> } @else { <p>Waiting</p> }';

    const result = parseTemplate(templateSource, 'home.page.html');

    expect(result.diagnostics).toEqual([]);
    expect(result.nodes).toMatchObject([
      {
        kind: 'element',
        tagName: 'input',
      },
      {
        kind: 'if-block',
        expression: 'ready()',
        consequent: [{ kind: 'element', tagName: 'p' }],
        alternate: [{ kind: 'element', tagName: 'p' }],
      },
    ]);
  });

  it('parses for blocks with empty fallbacks', () => {
    const templateSource =
      '@for (user of users(); track user.id) { <p>{{ user.name }}</p> } @empty { <p>No users yet</p> }';

    const result = parseTemplate(templateSource, 'users.page.html');

    expect(result.diagnostics).toEqual([]);
    expect(result.nodes).toMatchObject([
      {
        kind: 'for-block',
        itemName: 'user',
        iterableExpression: 'users()',
        trackExpression: 'user.id',
        body: [
          {
            kind: 'element',
            tagName: 'p',
            children: [{ kind: 'text', value: '{{ user.name }}' }],
          },
        ],
        empty: [
          {
            kind: 'element',
            tagName: 'p',
            children: [{ kind: 'text', value: 'No users yet' }],
          },
        ],
      },
    ]);
  });

  it('diagnoses for blocks without track expressions', () => {
    const templateSource = '@for (user of users()) { <p>{{ user.name }}</p> }';

    const result = parseTemplate(templateSource, 'users.page.html');

    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR011',
        suggestion:
          'Use @for (item of items(); track item.id) { ... } with a required track expression.',
      },
    ]);
  });
});
