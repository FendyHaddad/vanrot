import { describe, expect, it } from 'vitest';
import { PositionMap } from '../src/expressions/position-map.js';

describe('PositionMap', () => {
  it('maps template offset to virtual offset within a segment', () => {
    const map = new PositionMap([{ templateStart: 5, virtualStart: 100, length: 9 }]);

    expect(map.toVirtual(5)).toBe(100);
    expect(map.toVirtual(8)).toBe(103);
    expect(map.toVirtual(14)).toBe(109);
  });

  it('maps virtual offset back to template offset', () => {
    const map = new PositionMap([{ templateStart: 5, virtualStart: 100, length: 9 }]);

    expect(map.toTemplate(103)).toBe(8);
  });

  it('returns null outside any segment', () => {
    const map = new PositionMap([{ templateStart: 5, virtualStart: 100, length: 9 }]);

    expect(map.toVirtual(2)).toBeNull();
    expect(map.toTemplate(50)).toBeNull();
  });
});
