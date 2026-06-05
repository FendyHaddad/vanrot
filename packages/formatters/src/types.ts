export interface PipeContext {
  locale: string;
  timezone: string;
  currency: string;
}

export type PipeValue = unknown;

export type PipeHandler<TValue = PipeValue, TResult = PipeValue> = (
  value: TValue,
  context: Readonly<PipeContext>,
  ...args: readonly PipeValue[]
) => TResult;

export interface PipeDefinition<TValue = PipeValue, TResult = PipeValue> {
  kind: 'pipe';
  name: string;
  handler: PipeHandler<TValue, TResult>;
}

export type PipePresetKind = 'date-pattern' | 'number-pattern' | 'mask-pattern';

export interface PipePreset {
  kind: PipePresetKind;
  namespace: string;
  pattern: string;
}
