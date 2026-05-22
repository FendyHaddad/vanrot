import type { SourceMapping } from '@vanrot/compiler';

export interface ViteSourceMap {
  version: 3;
  file: string;
  sources: string[];
  sourcesContent?: (string | null | undefined)[];
  names: string[];
  mappings: string;
}

interface CreateViteSourceMapOptions {
  file: string;
  source: SourceMapping['generatedFile'];
  generatedCode: string;
  mappings: SourceMapping[];
}

interface SourceIndexState {
  indexes: Map<string, number>;
  sources: string[];
}

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function createViteSourceMap(options: CreateViteSourceMapOptions): ViteSourceMap {
  const sourceState: SourceIndexState = {
    indexes: new Map<string, number>(),
    sources: [],
  };
  const relevantMappings = options.mappings
    .filter((mapping) => mapping.generatedFile === options.source)
    .sort(compareMappings);
  const mappings = encodeMappings(options.generatedCode, relevantMappings, sourceState);

  return {
    version: 3,
    file: options.file,
    sources: sourceState.sources,
    names: [],
    mappings,
  };
}

function compareMappings(left: SourceMapping, right: SourceMapping): number {
  if (left.generatedLine !== right.generatedLine) {
    return left.generatedLine - right.generatedLine;
  }

  return left.generatedColumn - right.generatedColumn;
}

function encodeMappings(
  generatedCode: string,
  mappings: SourceMapping[],
  sourceState: SourceIndexState,
): string {
  if (mappings.length === 0) {
    return '';
  }

  const lineCount = countGeneratedLines(generatedCode);
  const segmentsByLine = new Map<number, string[]>();
  const previousGeneratedColumnByLine = new Map<number, number>();
  let previousSourceIndex = 0;
  let previousSourceLine = 0;
  let previousSourceColumn = 0;

  for (const mapping of mappings) {
    const generatedLineIndex = Math.max(0, mapping.generatedLine - 1);
    const generatedColumn = Math.max(0, mapping.generatedColumn);
    const previousGeneratedColumn = previousGeneratedColumnByLine.get(generatedLineIndex) ?? 0;
    const sourceIndex = getSourceIndex(sourceState, mapping.sourceFilePath);
    const sourceLineIndex = Math.max(0, mapping.sourceLine - 1);
    const sourceColumn = Math.max(0, mapping.sourceColumn);
    const segment = [
      encodeVlq(generatedColumn - previousGeneratedColumn),
      encodeVlq(sourceIndex - previousSourceIndex),
      encodeVlq(sourceLineIndex - previousSourceLine),
      encodeVlq(sourceColumn - previousSourceColumn),
    ].join('');

    const lineSegments = segmentsByLine.get(generatedLineIndex) ?? [];
    lineSegments.push(segment);
    segmentsByLine.set(generatedLineIndex, lineSegments);
    previousGeneratedColumnByLine.set(generatedLineIndex, generatedColumn);

    previousSourceIndex = sourceIndex;
    previousSourceLine = sourceLineIndex;
    previousSourceColumn = sourceColumn;
  }

  return Array.from({ length: lineCount }, (_, lineIndex) => {
    const segments = segmentsByLine.get(lineIndex);
    return segments?.join(',') ?? '';
  }).join(';');
}

function countGeneratedLines(generatedCode: string): number {
  return generatedCode.split('\n').length;
}

function getSourceIndex(state: SourceIndexState, sourceFilePath: string): number {
  const existingIndex = state.indexes.get(sourceFilePath);

  if (existingIndex !== undefined) {
    return existingIndex;
  }

  const nextIndex = state.sources.length;
  state.indexes.set(sourceFilePath, nextIndex);
  state.sources.push(sourceFilePath);
  return nextIndex;
}

function encodeVlq(value: number): string {
  let vlq = value < 0 ? ((-value) << 1) + 1 : value << 1;
  let encoded = '';

  do {
    let digit = vlq & 31;
    vlq >>>= 5;

    if (vlq > 0) {
      digit |= 32;
    }

    encoded += base64Chars[digit] ?? '';
  } while (vlq > 0);

  return encoded;
}
