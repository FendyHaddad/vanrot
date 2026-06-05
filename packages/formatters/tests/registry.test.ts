import { describe, expect, it } from 'vitest';
import { createPipeContext, createPipeRegistry, definePipe } from '../src/index.js';

describe('createPipeRegistry', () => {
  it('applies built-in, custom, preset, and chained pipes', () => {
    const registry = createPipeRegistry({
      pipes: [definePipe('claimStatus', (value) => (value === 'APPROVED' ? 'Approved' : 'Unknown'))],
      presets: {
        date: {
          invoice: 'dd/MM/yyyy',
        },
        mask: {
          malaysiaPhone: '###-#######',
        },
      },
    });

    const context = createPipeContext();

    expect(registry.apply('vanrot', [{ name: 'uppercase', args: [] }], context)).toBe('VANROT');
    expect(registry.apply('APPROVED', [{ name: 'claimStatus', args: [] }], context)).toBe('Approved');
    expect(registry.apply('2026-06-05', [{ name: 'date.invoice', args: [] }], context)).toBe('05/06/2026');
    expect(registry.apply('0123456789', [{ name: 'mask.malaysiaPhone', args: [] }], context)).toBe('012-3456789');
    expect(
      registry.apply(
        '',
        [
          { name: 'fallback', args: ['unknown'] },
          { name: 'uppercase', args: [] },
        ],
        context,
      ),
    ).toBe('UNKNOWN');
  });

  it('reports duplicate custom pipe names', () => {
    const registry = createPipeRegistry({
      pipes: [
        definePipe('claimStatus', (value) => String(value)),
        definePipe('claimStatus', (value) => String(value)),
      ],
    });

    expect(registry.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'VR_PIPE_DUPLICATE_NAME',
        name: 'claimStatus',
      }),
    );
  });
});
