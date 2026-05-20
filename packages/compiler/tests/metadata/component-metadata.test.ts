import { describe, expect, it } from 'vitest';
import { readComponentMetadata } from '../../src/metadata/component-metadata.js';

describe('component metadata', () => {
  it('detects the matching named export class', () => {
    expect(
      readComponentMetadata(
        {
          componentPath: 'counter.component.ts',
          componentBaseName: 'counter',
          expectedClassName: 'CounterComponent',
          templatePath: 'counter.component.html',
          stylePath: 'counter.component.css',
        },
        'export class CounterComponent {}',
      ),
    ).toEqual({
      metadata: {
        componentName: 'CounterComponent',
        exportName: 'CounterComponent',
        importPath: 'counter.component.js',
      },
      diagnostics: [],
    });
  });

  it('rejects missing exports, wrong names, default exports, and required constructors', () => {
    const cases = [
      'class CounterComponent {}',
      'export class WrongName {}',
      'export default class CounterComponent {}',
      'export class CounterComponent { constructor(required: string) {} }',
    ];

    for (const source of cases) {
      expect(
        readComponentMetadata(
          {
            componentPath: 'counter.component.ts',
            componentBaseName: 'counter',
            expectedClassName: 'CounterComponent',
            templatePath: 'counter.component.html',
            stylePath: 'counter.component.css',
          },
          source,
        ),
      ).toMatchObject({
        metadata: null,
        diagnostics: [{ code: 'VR004' }],
      });
    }
  });
});
