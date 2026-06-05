import type { CompilePipeRegistry } from '../api/types.js';
import type { SourceSpan } from '../source/location.js';
import type { ParsedPipeCall } from './pipes.js';

export const builtInPipeNames = [
  'uppercase',
  'lowercase',
  'titlecase',
  'sentencecase',
  'truncate',
  'fallback',
  'initials',
  'date',
  'time',
  'datetime',
  'relativeTime',
  'duration',
  'number',
  'percent',
  'currency',
  'compact',
  'filesize',
  'join',
  'count',
  'plural',
  'mask',
  'message',
  'messages',
] as const;

const builtInVariantNames = {
  date: ['monthDayYear', 'dayMonthYear', 'monthYear', 'short', 'long'],
  number: ['thousands', 'cents'],
} as const;

export interface PipeArgumentDiagnosticInput {
  code: 'VR_PIPE_INVALID_ARGUMENT';
  message: string;
  span: SourceSpan;
}

export function isKnownPipe(call: ParsedPipeCall, registry: CompilePipeRegistry | undefined): boolean {
  if (call.namespace.length > 0) {
    return isKnownBuiltInVariant(call) || isKnownPreset(call, registry);
  }

  if (builtInPipeNames.includes(call.name as (typeof builtInPipeNames)[number])) {
    return true;
  }

  return (registry?.pipes ?? []).some((pipe) => pipe.name === call.name);
}

export function isKnownBuiltInNamespace(namespace: string): boolean {
  return namespace in builtInVariantNames || ['date', 'time', 'datetime', 'number', 'mask'].includes(namespace);
}

export function validatePipeArguments(call: ParsedPipeCall, span: SourceSpan): PipeArgumentDiagnosticInput[] {
  if (call.name === 'truncate' && call.args[0] !== undefined && !isNumberLiteral(call.args[0])) {
    return [
      {
        code: 'VR_PIPE_INVALID_ARGUMENT',
        message: 'Pipe "truncate" expects number for argument 1.',
        span,
      },
    ];
  }

  if (call.name === 'currency' && call.args[0] !== undefined && !isStringLiteral(call.args[0]) && !isIdentifierLike(call.args[0])) {
    return [
      {
        code: 'VR_PIPE_INVALID_ARGUMENT',
        message: 'Pipe "currency" expects a currency code string or identifier for argument 1.',
        span,
      },
    ];
  }

  return [];
}

export function suggestPipeName(name: string): string {
  const candidates = [...builtInPipeNames];
  const closest = candidates
    .map((candidate) => ({ candidate, score: levenshtein(name, candidate) }))
    .sort((left, right) => left.score - right.score)[0];

  if (closest === undefined || closest.score > 3) {
    return 'Use a registered pipe from a .pipe.ts file or a built-in formatter pipe.';
  }

  return `Did you mean "${closest.candidate}"?`;
}

function isKnownBuiltInVariant(call: ParsedPipeCall): boolean {
  const variants = builtInVariantNames[call.namespace as keyof typeof builtInVariantNames];

  if (variants === undefined) {
    return false;
  }

  return (variants as readonly string[]).includes(call.variant);
}

function isKnownPreset(call: ParsedPipeCall, registry: CompilePipeRegistry | undefined): boolean {
  return (registry?.presets ?? []).some((preset) => preset.namespace === call.namespace && preset.name === call.variant);
}

function isNumberLiteral(value: string): boolean {
  return /^-?\d+(?:\.\d+)?$/.test(value);
}

function isStringLiteral(value: string): boolean {
  return /^(['"]).*\1$/.test(value);
}

function isIdentifierLike(value: string): boolean {
  return /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(value);
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_value, index) => index);

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    const current = [leftIndex + 1];

    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      const cost = left[leftIndex] === right[rightIndex] ? 0 : 1;
      current[rightIndex + 1] = Math.min(
        (current[rightIndex] ?? 0) + 1,
        (previous[rightIndex + 1] ?? 0) + 1,
        (previous[rightIndex] ?? 0) + cost,
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length] ?? 0;
}
