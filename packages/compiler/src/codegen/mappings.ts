import type { SourceMapping } from '../api/types.js';
import type { SourceSpan } from '../source/location.js';

export function createGeneratedMapping(
  generatedFile: SourceMapping['generatedFile'],
  generatedLine: number,
  generatedColumn: number,
  span: SourceSpan,
): SourceMapping {
  return {
    generatedFile,
    generatedLine,
    generatedColumn,
    sourceFilePath: span.filePath,
    sourceLine: span.line,
    sourceColumn: span.column,
  };
}
