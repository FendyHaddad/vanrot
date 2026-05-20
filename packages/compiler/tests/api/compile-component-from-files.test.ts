import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileComponentFromFiles } from '../../src/api/compile-component-from-files.js';

describe('compileComponentFromFiles', () => {
  it('loads sibling convention files and compiles the counter fixture', async () => {
    const result = await compileComponentFromFiles(
      join(import.meta.dirname, '../fixtures/counter/counter.component.ts'),
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain('const ctx = new CounterComponent();');
    expect(result.js).toContain('ctx.increment();');
    expect(result.css).toContain(`[${result.metadata.scopeAttribute}]`);
    expect(result.metadata.features).toEqual(
      expect.arrayContaining([
        'file-convention',
        'component-class',
        'text-interpolation',
        'event-binding',
        'property-binding',
        'scoped-css',
        'readable-output',
        'expression-rewriting',
      ]),
    );
  });
});
