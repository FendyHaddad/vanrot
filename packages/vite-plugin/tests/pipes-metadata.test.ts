import { describe, expect, it } from 'vitest';
import { collectPipeMetadata } from '@/pipes/pipes-metadata.js';

describe('collectPipeMetadata', () => {
  it('discovers custom pipes and presets from .pipe.ts files', async () => {
    const metadata = await collectPipeMetadata({
      root: '/repo',
      files: [
        {
          path: '/repo/src/claims/claims.pipe.ts',
          source: `
            import { datePattern, definePipe, enumPipe, maskPattern, numberPattern } from '@vanrot/formatters';
            export const invoice = datePattern("dd/MM/yyyy");
            export const malaysiaPhone = maskPattern("###-#######");
            export const accounting = numberPattern("(0,0.00)");
            export const claimStatus = definePipe("claimStatus", (status) => String(status));
          `,
        },
      ],
    });

    expect(metadata.registry.presets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ namespace: 'date', name: 'invoice', pattern: 'dd/MM/yyyy' }),
        expect.objectContaining({ namespace: 'mask', name: 'malaysiaPhone', pattern: '###-#######' }),
        expect.objectContaining({ namespace: 'number', name: 'accounting', pattern: '(0,0.00)' }),
      ]),
    );
    expect(metadata.registry.pipes).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'claimStatus' })]),
    );
  });
});
