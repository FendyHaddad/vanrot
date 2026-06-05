import type { PipePreset } from './types.js';

export function datePattern(pattern: string): PipePreset {
  return {
    kind: 'date-pattern',
    namespace: 'date',
    pattern,
  };
}

export function numberPattern(pattern: string): PipePreset {
  return {
    kind: 'number-pattern',
    namespace: 'number',
    pattern,
  };
}

export function maskPattern(pattern: string): PipePreset {
  return {
    kind: 'mask-pattern',
    namespace: 'mask',
    pattern,
  };
}
