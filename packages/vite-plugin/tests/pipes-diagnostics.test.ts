import { describe, expect, it } from 'vitest';
import { diagnosePipeMetadata } from '@/pipes/pipes-diagnostics.js';

describe('diagnosePipeMetadata', () => {
  it('reports duplicate custom pipes and async pipe functions', () => {
    const diagnostics = diagnosePipeMetadata({
      registry: {
        pipes: [
          { name: 'claimStatus', sourcePath: '/repo/src/a.pipe.ts' },
          { name: 'claimStatus', sourcePath: '/repo/src/b.pipe.ts' },
          { name: 'asyncLabel', sourcePath: '/repo/src/c.pipe.ts', async: true },
        ],
        presets: [],
      },
      usages: [],
    });

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'VR_PIPE_DUPLICATE_NAME' }),
        expect.objectContaining({ code: 'VR_PIPE_ASYNC' }),
      ]),
    );
  });
});
