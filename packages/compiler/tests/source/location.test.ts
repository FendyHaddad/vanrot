import { describe, expect, it } from 'vitest';
import {
  createCodeFrame,
  createLineIndex,
  createSourceSpan,
  getSourceText,
  positionAtOffset,
} from '../../src/source/location.js';

describe('source locations', () => {
  it('converts offsets to one-based line and column positions', () => {
    const source = '<section>\n  <button (click)="count++">Save</button>\n</section>';
    const lineIndex = createLineIndex(source);

    expect(positionAtOffset(lineIndex, 12)).toEqual({ line: 2, column: 3, offset: 12 });
  });

  it('bounds offsets to the source range', () => {
    const source = 'first\nsecond';
    const lineIndex = createLineIndex(source);

    expect(positionAtOffset(lineIndex, -10)).toEqual({ line: 1, column: 1, offset: 0 });
    expect(positionAtOffset(lineIndex, 200)).toEqual({ line: 2, column: 7, offset: source.length });
  });

  it('handles empty source and trailing newline EOF positions', () => {
    expect(positionAtOffset(createLineIndex(''), 10)).toEqual({ line: 1, column: 1, offset: 0 });
    expect(positionAtOffset(createLineIndex('first\n'), 6)).toEqual({ line: 2, column: 1, offset: 6 });
  });

  it('creates spans with source text and code frames', () => {
    const source = '<button (click)="count++">Save</button>';
    const startOffset = source.indexOf('(click)');
    const endOffset = source.indexOf('>Save');
    const span = createSourceSpan(source, 'counter.component.html', startOffset, endOffset);

    expect(span).toMatchObject({
      filePath: 'counter.component.html',
      line: 1,
      column: 9,
      endLine: 1,
      endColumn: 26,
    });
    expect(getSourceText(source, span)).toBe('(click)="count++"');
    expect(createCodeFrame(source, span)).toContain('1 | <button (click)="count++">Save</button>');
    expect(createCodeFrame(source, span)).toContain('        ^^^^^^^^^^^^^^^^^');
  });

  it('normalizes reversed source span offsets after bounding them', () => {
    const source = '0123456789abcdefghij';
    const span = createSourceSpan(source, 'counter.component.html', 20, 5);

    expect(span).toMatchObject({
      startOffset: 5,
      endOffset: 20,
      line: 1,
      column: 6,
      endLine: 1,
      endColumn: 21,
    });
    expect(getSourceText(source, span)).toBe('56789abcdefghij');
  });
});
