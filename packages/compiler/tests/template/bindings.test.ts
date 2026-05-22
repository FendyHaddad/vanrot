import { describe, expect, it } from 'vitest';
import { extractTemplateBindings } from '../../src/template/bindings.js';
import { parseTemplate } from '../../src/template/parse-template.js';

describe('template binding extraction', () => {
  it('extracts interpolation, event binding, property binding, and static attributes', () => {
    const { nodes } = parseTemplate(
      '<button class="primary" [disabled]="saving()" (click)="increment()">Count: {{ count() }}</button>',
      'counter.component.html',
    );

    expect(extractTemplateBindings(nodes, 'counter.component.html')).toMatchObject({
      bindings: [
        {
          kind: 'property',
          propertyName: 'disabled',
          expression: 'saving()',
          span: { line: 1, column: 25, endLine: 1, endColumn: 46 },
          expressionSpan: { line: 1, column: 37, endLine: 1, endColumn: 45 },
        },
        {
          kind: 'event',
          eventName: 'click',
          handler: 'increment()',
          span: { line: 1, column: 47, endLine: 1, endColumn: 68 },
          expressionSpan: { line: 1, column: 56, endLine: 1, endColumn: 67 },
        },
        {
          kind: 'interpolation',
          expression: 'count()',
          staticParts: ['Count: ', ''],
          span: { line: 1, column: 76, endLine: 1, endColumn: 89 },
          expressionSpan: { line: 1, column: 79, endLine: 1, endColumn: 86 },
        },
      ],
      diagnostics: [],
    });
  });

  it('reports unsupported template syntax', () => {
    const { nodes } = parseTemplate(
      '<div [(value)]="name" *if="visible()" @if="visible()"></div>',
      'counter.component.html',
    );

    expect(extractTemplateBindings(nodes, 'counter.component.html')).toMatchObject({
      bindings: [],
      diagnostics: [
        { code: 'VR005', line: 1, column: 6 },
        { code: 'VR005', line: 1, column: 23 },
        { code: 'VR005', line: 1, column: 39 },
      ],
    });
  });
});
