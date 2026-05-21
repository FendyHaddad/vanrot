import { describe, expect, it } from 'vitest';
import {
  decodeVirtualModuleId,
  toPublicCssModuleId,
  toPublicSourceModuleId,
  toResolvedVirtualModuleId,
} from '../src/virtual-modules.js';

describe('virtual module IDs', () => {
  it('creates public and resolved source IDs', () => {
    const publicId = toPublicSourceModuleId('/repo/src/app.component.ts');
    const resolvedId = toResolvedVirtualModuleId(publicId);

    expect(publicId).toBe('virtual:vanrot-source:%2Frepo%2Fsrc%2Fapp.component.ts');
    expect(resolvedId).toBe('\0vanrot:source:%2Frepo%2Fsrc%2Fapp.component.ts');
    expect(decodeVirtualModuleId(resolvedId)).toEqual({
      kind: 'source',
      filePath: '/repo/src/app.component.ts',
    });
  });

  it('creates public CSS IDs', () => {
    expect(toPublicCssModuleId('/repo/src/app.component.ts')).toBe(
      'virtual:vanrot-css:%2Frepo%2Fsrc%2Fapp.component.ts',
    );
  });
});
