import { compileComponentFromFiles } from '@vanrot/compiler';
import { describe, expect, it } from 'vitest';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

describe('formatters-pipes example', () => {
  it('compiles a page that uses built-in pipes, presets, enum pipes, and chained pipes', async () => {
    const pipeSourcePath = join(root, 'src/business.pipe.ts');
    const result = await compileComponentFromFiles(join(root, 'src/summary.page.ts'), {
      pipeRegistry: {
        pipes: [{ name: 'claimStatus', sourcePath: pipeSourcePath }],
        presets: [
          { namespace: 'date', name: 'invoice', pattern: 'dd/MM/yyyy', sourcePath: pipeSourcePath },
          { namespace: 'mask', name: 'malaysiaPhone', pattern: '###-#######', sourcePath: pipeSourcePath },
        ],
      },
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.metadata.features).toContain('template-pipe');
    expect(result.js).toContain('applyVanrotPipeChain');
  });
});
