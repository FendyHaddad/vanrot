import type {
  SeoDynamicContext,
  SeoDynamicMetadata,
  SeoDynamicResolver,
  SeoMetadata,
} from './types.js';

const dynamicSeoMarker = Symbol.for('vanrot.seo.dynamic');

type MarkedDynamicSeo<Context extends SeoDynamicContext> = SeoDynamicMetadata<Context> & {
  readonly [dynamicSeoMarker]: true;
};

export type SeoInput<Context extends SeoDynamicContext = SeoDynamicContext> =
  | SeoMetadata
  | SeoDynamicMetadata<Context>
  | SeoDynamicResolver<Context>;

export function defineSeo(metadata: SeoMetadata): Readonly<SeoMetadata> {
  return deepFreeze(cloneSeoValue(metadata)) as Readonly<SeoMetadata>;
}

export function defineDynamicSeo<Context extends SeoDynamicContext>(
  resolve: SeoDynamicResolver<Context>,
): SeoDynamicMetadata<Context> {
  return Object.freeze({
    [dynamicSeoMarker]: true,
    resolve,
  }) as MarkedDynamicSeo<Context>;
}

export function isDynamicSeo<Context extends SeoDynamicContext>(
  value: SeoInput<Context> | undefined,
): value is SeoDynamicMetadata<Context> {
  if (typeof value === 'function') {
    return true;
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'resolve' in value && typeof value.resolve === 'function';
}

export async function resolveSeoInput<Context extends SeoDynamicContext>(
  value: SeoInput<Context> | undefined,
  context: Context,
): Promise<SeoMetadata> {
  if (!value) {
    return {};
  }

  if (typeof value === 'function') {
    return value(context);
  }

  if (isDynamicSeo(value)) {
    return value.resolve(context);
  }

  return value;
}

function cloneSeoValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneSeoValue(item)) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const output: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    output[key] = cloneSeoValue(nestedValue);
  }

  return output as T;
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object') {
    return value;
  }

  Object.freeze(value);

  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue);
  }

  return value;
}
