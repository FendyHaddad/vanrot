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

  it('rejects missing exports and wrong names', () => {
    const cases = ['class CounterComponent {}', 'export class WrongName {}'];

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

  it('distinguishes default exports from missing named component exports', () => {
    const result = readComponentMetadata(
      {
        componentPath: 'profile-card.component.ts',
        templatePath: 'profile-card.component.html',
        stylePath: 'profile-card.component.css',
        componentBaseName: 'profile-card',
        expectedClassName: 'ProfileCardComponent',
      },
      'export default class ProfileCardComponent {}',
    );

    expect(result.diagnostics).toMatchObject([{ code: 'VR014' }]);
  });

  it('distinguishes multiple plausible component class exports', () => {
    const result = readComponentMetadata(
      {
        componentPath: 'profile-card.component.ts',
        templatePath: 'profile-card.component.html',
        stylePath: 'profile-card.component.css',
        componentBaseName: 'profile-card',
        expectedClassName: 'ProfileCardComponent',
      },
      ['export class ProfileCardComponent {}', 'export class ProfileCardPage {}'].join('\n'),
    );

    expect(result.diagnostics).toMatchObject([{ code: 'VR015' }]);
  });

  it('distinguishes required constructor arguments', () => {
    const result = readComponentMetadata(
      {
        componentPath: 'profile-card.component.ts',
        templatePath: 'profile-card.component.html',
        stylePath: 'profile-card.component.css',
        componentBaseName: 'profile-card',
        expectedClassName: 'ProfileCardComponent',
      },
      'export class ProfileCardComponent { constructor(service: unknown) {} }',
    );

    expect(result.diagnostics).toMatchObject([{ code: 'VR016' }]);
  });
});
