import { describe, expect, it } from 'vitest';
import { createViteSourceMap } from '@/source-maps.js';

describe('createViteSourceMap', () => {
  it('creates a Vite map for generated JavaScript mappings', () => {
    const map = createViteSourceMap({
      file: '/repo/src/app.component.ts',
      source: 'js',
      generatedCode: 'const value = 1;\n',
      mappings: [
        {
          generatedFile: 'js',
          generatedLine: 1,
          generatedColumn: 0,
          sourceFilePath: '/repo/src/app.component.html',
          sourceLine: 3,
          sourceColumn: 4,
        },
      ],
    });

    expect(map).toMatchObject({
      version: 3,
      file: '/repo/src/app.component.ts',
      sources: ['/repo/src/app.component.html'],
      names: [],
    });
    expect(map.sourcesContent).toBeUndefined();
    expect(map.mappings).toContain('A');
  });

  it('creates a Vite map for generated CSS mappings', () => {
    const map = createViteSourceMap({
      file: '/repo/src/app.component.css',
      source: 'css',
      generatedCode: '.app[data-vr-a] { color: red; }\n',
      mappings: [
        {
          generatedFile: 'css',
          generatedLine: 1,
          generatedColumn: 0,
          sourceFilePath: '/repo/src/app.component.css',
          sourceLine: 1,
          sourceColumn: 0,
        },
      ],
    });

    expect(map).toMatchObject({
      version: 3,
      file: '/repo/src/app.component.css',
      sources: ['/repo/src/app.component.css'],
      names: [],
    });
    expect(map.mappings).toContain('A');
  });

  it('returns an empty Vite map when no compiler mappings exist', () => {
    const map = createViteSourceMap({
      file: '/repo/src/app.component.ts',
      source: 'js',
      generatedCode: 'export default {};\n',
      mappings: [],
    });

    expect(map).toEqual({
      version: 3,
      file: '/repo/src/app.component.ts',
      sources: [],
      sourcesContent: undefined,
      names: [],
      mappings: '',
    });
  });
});
