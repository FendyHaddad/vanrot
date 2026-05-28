import type { SourceSpan } from '@vanrot/compiler';
import { describe, expect, it } from 'vitest';
import { spanToRange } from '../src/lsp/position.js';

const span: SourceSpan = {
  filePath: 'x.html',
  line: 3,
  column: 5,
  endLine: 3,
  endColumn: 9,
  startOffset: 0,
  endOffset: 0,
};

describe('spanToRange', () => {
  it('converts 1-based span to 0-based LSP range', () => {
    expect(spanToRange(span)).toEqual({
      start: { line: 2, character: 4 },
      end: { line: 2, character: 8 },
    });
  });
});
