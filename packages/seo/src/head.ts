import type { SeoMetadata } from './types.js';

const seoHeadAttribute = 'data-vanrot-seo';
const descriptionName = 'description';
const canonicalRel = 'canonical';

export interface SeoHeadUpdateOptions {
  document?: Document;
}

export function applySeoToHead(metadata: SeoMetadata, options: SeoHeadUpdateOptions = {}): void {
  const targetDocument = options.document ?? globalThis.document;

  if (!targetDocument) {
    return;
  }

  if (metadata.title) {
    targetDocument.title = metadata.title;
  }

  if (metadata.description) {
    upsertMeta(targetDocument, descriptionName, metadata.description);
  }

  if (metadata.canonical) {
    upsertCanonical(targetDocument, metadata.canonical);
  }
}

function upsertMeta(targetDocument: Document, name: string, content: string): void {
  const selector = `meta[name="${name}"]`;
  const meta =
    targetDocument.head.querySelector<HTMLMetaElement>(selector) ??
    targetDocument.createElement('meta');

  meta.setAttribute('name', name);
  meta.setAttribute('content', content);
  meta.setAttribute(seoHeadAttribute, name);

  if (!meta.parentElement) {
    targetDocument.head.append(meta);
  }
}

function upsertCanonical(targetDocument: Document, href: string): void {
  const selector = `link[rel="${canonicalRel}"]`;
  const link =
    targetDocument.head.querySelector<HTMLLinkElement>(selector) ??
    targetDocument.createElement('link');

  link.setAttribute('rel', canonicalRel);
  link.setAttribute('href', href);
  link.setAttribute(seoHeadAttribute, canonicalRel);

  if (!link.parentElement) {
    targetDocument.head.append(link);
  }
}
