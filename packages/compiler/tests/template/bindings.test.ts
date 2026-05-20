import { describe, expect, it } from 'vitest';
import { extractTemplateBindings } from '../../src/template/bindings.js';
import type { TemplateNode } from '../../src/template/ast.js';

describe('template binding extraction', () => {
  it('extracts interpolation, event binding, property binding, and static attributes', () => {
    const nodes: TemplateNode[] = [
      {
        kind: 'element',
        tagName: 'button',
        attributes: [
          { name: 'class', value: 'primary' },
          { name: '[disabled]', value: 'saving()' },
          { name: '(click)', value: 'increment()' },
        ],
        children: [{ kind: 'text', value: 'Count: {{ count() }}' }],
      },
    ];

    expect(extractTemplateBindings(nodes, 'counter.component.html')).toEqual({
      bindings: [
        { kind: 'property', propertyName: 'disabled', expression: 'saving()' },
        { kind: 'event', eventName: 'click', handler: 'increment()' },
        { kind: 'interpolation', expression: 'count()', staticParts: ['Count: ', ''] },
      ],
      diagnostics: [],
    });
  });

  it('reports unsupported template syntax', () => {
    const nodes: TemplateNode[] = [
      {
        kind: 'element',
        tagName: 'div',
        attributes: [
          { name: '[(value)]', value: 'name' },
          { name: '*if', value: 'visible()' },
        ],
        children: [{ kind: 'text', value: '@if (visible()) { shown }' }],
      },
    ];

    expect(extractTemplateBindings(nodes, 'counter.component.html')).toMatchObject({
      bindings: [],
      diagnostics: [{ code: 'VR005' }, { code: 'VR005' }, { code: 'VR005' }],
    });
  });
});
