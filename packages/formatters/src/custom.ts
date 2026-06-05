import type { PipeDefinition, PipeHandler, PipeValue } from './types.js';

export function definePipe<TValue = PipeValue, TResult = PipeValue>(
  name: string,
  handler: PipeHandler<TValue, TResult>,
): PipeDefinition<TValue, TResult> {
  return {
    kind: 'pipe',
    name,
    handler,
  };
}

export function enumPipe<TEnum extends Record<string, string>, TValue extends TEnum[keyof TEnum]>(
  name: string,
  _enumObject: TEnum,
  labels: Partial<Record<TValue, string>> & { fallback: string },
): PipeDefinition<TValue | string, string> {
  return definePipe(name, (value) => labels[value as TValue] ?? labels.fallback);
}
