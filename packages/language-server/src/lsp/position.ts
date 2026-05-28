import type { SourceSpan } from '@vanrot/compiler';
import type { Range } from 'vscode-languageserver';

export function spanToRange(span: SourceSpan): Range {
  return {
    start: { line: span.line - 1, character: span.column - 1 },
    end: { line: span.endLine - 1, character: span.endColumn - 1 },
  };
}

export function offsetAt(source: string, line: number, character: number): number {
  const lines = source.split('\n');
  let offset = 0;

  for (let index = 0; index < line; index += 1) {
    offset += (lines[index]?.length ?? 0) + 1;
  }

  return offset + character;
}
