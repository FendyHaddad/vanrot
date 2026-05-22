export interface SourcePosition {
  line: number;
  column: number;
  offset: number;
}

export interface SourceSpan {
  filePath: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  startOffset: number;
  endOffset: number;
}

export interface LineIndex {
  source: string;
  lineStarts: number[];
}

export function createLineIndex(source: string): LineIndex {
  const lineStarts = [0];

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] !== '\n') {
      continue;
    }

    lineStarts.push(index + 1);
  }

  return { source, lineStarts };
}

export function positionAtOffset(lineIndex: LineIndex, offset: number): SourcePosition {
  const boundedOffset = Math.max(0, Math.min(offset, lineIndex.source.length));
  let lineIndexValue = 0;

  for (let index = 0; index < lineIndex.lineStarts.length; index += 1) {
    const lineStart = lineIndex.lineStarts[index] ?? 0;

    if (lineStart > boundedOffset) {
      break;
    }

    lineIndexValue = index;
  }

  const lineStart = lineIndex.lineStarts[lineIndexValue] ?? 0;

  return {
    line: lineIndexValue + 1,
    column: boundedOffset - lineStart + 1,
    offset: boundedOffset,
  };
}

export function createSourceSpan(
  source: string,
  filePath: string,
  startOffset: number,
  endOffset: number,
): SourceSpan {
  const lineIndex = createLineIndex(source);
  const boundedStartOffset = boundOffset(source, startOffset);
  const boundedEndOffset = boundOffset(source, endOffset);
  const normalizedStartOffset = Math.min(boundedStartOffset, boundedEndOffset);
  const normalizedEndOffset = Math.max(boundedStartOffset, boundedEndOffset);
  const start = positionAtOffset(lineIndex, normalizedStartOffset);
  const end = positionAtOffset(lineIndex, normalizedEndOffset);

  return {
    filePath,
    line: start.line,
    column: start.column,
    endLine: end.line,
    endColumn: end.column,
    startOffset: start.offset,
    endOffset: end.offset,
  };
}

function boundOffset(source: string, offset: number): number {
  return Math.max(0, Math.min(offset, source.length));
}

export function getSourceText(source: string, span: SourceSpan): string {
  return source.slice(span.startOffset, span.endOffset);
}

export function createCodeFrame(source: string, span: SourceSpan): string {
  const lines = source.split('\n');
  const lineText = lines[span.line - 1] ?? '';
  const startColumn = span.column;
  const endColumn = span.line === span.endLine ? span.endColumn : lineText.length + 1;
  const markerLength = Math.max(1, endColumn - startColumn);
  const gutter = `${span.line} | `;

  return [
    `${gutter}${lineText}`,
    `${' '.repeat(gutter.length + startColumn - 1)}${'^'.repeat(markerLength)}`,
  ].join('\n');
}
