import { datePipe, datetimePipe, durationPipe, relativeTimePipe, timePipe } from './date-time.js';
import { messagePipe, messagesPipe } from './forms.js';
import { countPipe, joinPipe, pluralPipe } from './list.js';
import { maskPipe } from './mask.js';
import { compactPipe, currencyPipe, filesizePipe, numberPipe, percentPipe } from './number.js';
import {
  fallbackPipe,
  initialsPipe,
  lowercasePipe,
  sentencecasePipe,
  titlecasePipe,
  truncatePipe,
  uppercasePipe,
} from './text.js';
import type { PipeContext, PipeDefinition, PipeValue } from './types.js';

export interface PipeCall {
  name: string;
  args: readonly PipeValue[];
}

export interface PipeRegistryOptions {
  pipes?: readonly PipeDefinition[];
  presets?: Record<string, Record<string, string>>;
}

export interface PipeRegistryDiagnostic {
  code: 'VR_PIPE_DUPLICATE_NAME';
  name: string;
}

export interface PipeRegistry {
  diagnostics: PipeRegistryDiagnostic[];
  apply(value: PipeValue, calls: readonly PipeCall[], context: Readonly<PipeContext>): PipeValue;
  has(name: string): boolean;
}

export function createPipeRegistry(options: PipeRegistryOptions = {}): PipeRegistry {
  const customPipes = new Map<string, PipeDefinition>();
  const diagnostics: PipeRegistryDiagnostic[] = [];

  for (const pipe of options.pipes ?? []) {
    if (customPipes.has(pipe.name)) {
      diagnostics.push({ code: 'VR_PIPE_DUPLICATE_NAME', name: pipe.name });
      continue;
    }

    customPipes.set(pipe.name, pipe);
  }

  return {
    diagnostics,
    apply(value, calls, context) {
      const registryOptions: PipeRegistryOptions = {
        pipes: [...customPipes.values()],
      };

      if (options.presets !== undefined) {
        registryOptions.presets = options.presets;
      }

      return applyVanrotPipeChain(value, calls, context, registryOptions);
    },
    has(name) {
      return resolveBuiltInPipe(name, options.presets ?? {}) !== null || customPipes.has(name);
    },
  };
}

export function applyVanrotPipeChain(
  value: PipeValue,
  calls: readonly PipeCall[],
  context: Readonly<PipeContext>,
  options: PipeRegistryOptions = {},
): PipeValue {
  const customPipes = new Map((options.pipes ?? []).map((pipe) => [pipe.name, pipe]));
  return calls.reduce((current, call) => applyPipeCall(current, call, context, customPipes, options.presets ?? {}), value);
}

function applyPipeCall(
  value: PipeValue,
  call: PipeCall,
  context: Readonly<PipeContext>,
  customPipes: ReadonlyMap<string, PipeDefinition>,
  presets: Record<string, Record<string, string>>,
): PipeValue {
  const builtIn = resolveBuiltInPipe(call.name, presets);

  if (builtIn !== null) {
    return builtIn(value, context, call.args);
  }

  const custom = customPipes.get(call.name);

  if (custom !== undefined) {
    return custom.handler(value, context, ...call.args);
  }

  return value;
}

type BuiltInPipe = (value: PipeValue, context: Readonly<PipeContext>, args: readonly PipeValue[]) => PipeValue;

function resolveBuiltInPipe(name: string, presets: Record<string, Record<string, string>>): BuiltInPipe | null {
  const preset = resolvePreset(name, presets);

  if (preset !== null) {
    return preset;
  }

  const builtIns: Record<string, BuiltInPipe> = {
    uppercase: (value) => uppercasePipe(value),
    lowercase: (value) => lowercasePipe(value),
    titlecase: (value) => titlecasePipe(value),
    sentencecase: (value) => sentencecasePipe(value),
    truncate: (value, _context, args) => truncatePipe(value, Number(args[0] ?? 0)),
    fallback: (value, _context, args) => fallbackPipe(value, String(args[0] ?? '')),
    initials: (value) => initialsPipe(value),
    date: (value, context, args) => datePipe(value, context, String(args[0] ?? 'monthDayYear')),
    time: (value, context, args) => timePipe(value, context, String(args[0] ?? 'HH:mm')),
    datetime: (value, context, args) => datetimePipe(value, context, String(args[0] ?? 'MM/dd/yyyy HH:mm')),
    relativeTime: (value, context) => relativeTimePipe(value, context),
    duration: (value) => durationPipe(value),
    number: (value, context, args) => numberPipe(value, context, String(args[0] ?? '')),
    percent: (value, context) => percentPipe(value, context),
    currency: (value, context, args) => currencyPipe(value, context, args[0] === undefined ? undefined : String(args[0])),
    compact: (value, context) => compactPipe(value, context),
    filesize: (value) => filesizePipe(value),
    join: (value, _context, args) => joinPipe(value, args[0] === undefined ? ', ' : String(args[0])),
    count: (value) => countPipe(value),
    plural: (value, _context, args) => pluralPipe(value, String(args[0] ?? ''), args[1] === undefined ? undefined : String(args[1])),
    mask: (value, _context, args) => maskPipe(value, String(args[0] ?? '')),
    message: (value) => messagePipe(value),
    messages: (value) => messagesPipe(value),
  };

  return builtIns[name] ?? null;
}

function resolvePreset(name: string, presets: Record<string, Record<string, string>>): BuiltInPipe | null {
  const [namespace, presetName] = name.split('.');

  if (namespace === undefined || presetName === undefined) {
    return null;
  }

  const pattern = presets[namespace]?.[presetName];

  if (pattern === undefined) {
    return null;
  }

  if (namespace === 'date') {
    return (value, context) => datePipe(value, context, pattern);
  }

  if (namespace === 'time') {
    return (value, context) => timePipe(value, context, pattern);
  }

  if (namespace === 'datetime') {
    return (value, context) => datetimePipe(value, context, pattern);
  }

  if (namespace === 'number') {
    return (value, context) => numberPipe(value, context, pattern);
  }

  if (namespace === 'mask') {
    return (value) => maskPipe(value, pattern);
  }

  return null;
}
