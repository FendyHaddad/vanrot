import type { PipeContext } from './types.js';

export const DEFAULT_PIPE_CONTEXT: PipeContext = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

export type PipeContextInput = Partial<PipeContext>;

export function createPipeContext(input: PipeContextInput = {}): PipeContext {
  return {
    locale: normalizeContextValue(input.locale, DEFAULT_PIPE_CONTEXT.locale),
    timezone: normalizeContextValue(input.timezone, DEFAULT_PIPE_CONTEXT.timezone),
    currency: normalizeContextValue(input.currency, DEFAULT_PIPE_CONTEXT.currency),
  };
}

function normalizeContextValue(value: string | undefined, fallback: string): string {
  if (value === undefined) {
    return fallback;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return fallback;
  }

  return trimmed;
}
