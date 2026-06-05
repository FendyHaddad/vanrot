import { describe, expect, it } from 'vitest';
import type { PipeMetadata, PipeUsageMetadata } from '../src/index.js';

describe('pipe metadata types', () => {
  it('describes pipe definitions and template usages', () => {
    const definition: PipeMetadata = {
      kind: 'custom',
      name: 'claimStatus',
      namespace: '',
      sourcePath: 'src/claims.pipe.ts',
    };
    const usage: PipeUsageMetadata = {
      column: 18,
      line: 3,
      name: 'claimStatus',
      templatePath: 'src/claims.page.html',
    };

    expect(definition.name).toBe('claimStatus');
    expect(usage.templatePath).toBe('src/claims.page.html');
  });
});
