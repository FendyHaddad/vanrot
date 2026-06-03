import { seoCanonicalPolicy } from './constants.js';
import { resolveSeoInput, type SeoInput } from './metadata.js';
import type { SeoDynamicContext, SeoMetadata } from './types.js';

export interface SeoCanonicalResolution {
  canonical?: string;
  routePath?: string;
  siteUrl?: string;
  policy?: (typeof seoCanonicalPolicy)[keyof typeof seoCanonicalPolicy];
}

export interface SeoLadderInput<Context extends SeoDynamicContext = SeoDynamicContext> {
  global?: SeoMetadata;
  route?: SeoMetadata;
  page?: SeoMetadata;
  dynamic?: SeoInput<Context>;
  context?: Context;
  routePath?: string;
  siteUrl?: string;
}

export async function resolveSeoLadder<Context extends SeoDynamicContext = SeoDynamicContext>(
  input: SeoLadderInput<Context>,
): Promise<SeoMetadata> {
  const context = (input.context ?? {}) as Context;
  const dynamic = await resolveSeoInput(input.dynamic, context);
  const merged = mergeSeoMetadata(input.global, input.route, input.page, dynamic);
  const canonicalInput: SeoCanonicalResolution = {};

  if (merged.canonical !== undefined) {
    canonicalInput.canonical = merged.canonical;
  }

  if (input.routePath !== undefined) {
    canonicalInput.routePath = input.routePath;
  }

  if (input.siteUrl !== undefined) {
    canonicalInput.siteUrl = input.siteUrl;
  }

  const canonical = resolveCanonicalUrl(canonicalInput);

  if (!canonical) {
    return merged;
  }

  return {
    ...merged,
    canonical,
  };
}

export function mergeSeoMetadata(...layers: Array<SeoMetadata | undefined>): SeoMetadata {
  let merged: SeoMetadata = {};

  for (const layer of layers) {
    if (!layer) {
      continue;
    }

    const nextMerged: SeoMetadata = {
      ...merged,
      ...layer,
    };
    const robots = mergeNested(merged.robots, layer.robots);
    const openGraph = mergeNested(merged.openGraph, layer.openGraph);
    const twitter = mergeNested(merged.twitter, layer.twitter);
    const structuredData = mergeStructuredData(merged.structuredData, layer.structuredData);

    if (robots) {
      nextMerged.robots = robots;
    }

    if (openGraph) {
      nextMerged.openGraph = openGraph;
    }

    if (twitter) {
      nextMerged.twitter = twitter;
    }

    if (structuredData) {
      nextMerged.structuredData = structuredData;
    }

    merged = nextMerged;
  }

  return merged;
}

export function resolveCanonicalUrl(input: SeoCanonicalResolution): string | undefined {
  const canonical = input.canonical ?? input.routePath;
  const policy = input.policy ?? seoCanonicalPolicy.siteUrlRequired;

  if (!canonical) {
    return undefined;
  }

  if (isAbsoluteUrl(canonical)) {
    return canonical;
  }

  if (!canonical.startsWith('/')) {
    return canonical;
  }

  if (!input.siteUrl) {
    return policy === seoCanonicalPolicy.siteUrlRequired ? undefined : canonical;
  }

  return new URL(canonical, normalizeSiteUrl(input.siteUrl)).toString();
}

function mergeNested<T extends object>(base: T | undefined, next: T | undefined): T | undefined {
  if (!base) {
    return next;
  }

  if (!next) {
    return base;
  }

  return {
    ...base,
    ...next,
  };
}

function mergeStructuredData(
  base: SeoMetadata['structuredData'],
  next: SeoMetadata['structuredData'],
): SeoMetadata['structuredData'] {
  if (!base?.length) {
    return next;
  }

  if (!next?.length) {
    return base;
  }

  return [...base, ...next];
}

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

function isAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
