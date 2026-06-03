import type { SeoMetadata } from './types.js';

const descriptionName = 'description';
const canonicalRel = 'canonical';

export function renderSeoTags(metadata: SeoMetadata): string[] {
  const tags: string[] = [];

  if (metadata.title) {
    tags.push(`<title>${escapeHtml(metadata.title)}</title>`);
  }

  if (metadata.description) {
    tags.push(renderNamedMeta(descriptionName, metadata.description));
  }

  if (metadata.canonical) {
    tags.push(`<link rel="${canonicalRel}" href="${escapeAttribute(metadata.canonical)}">`);
  }

  if (metadata.robots?.directives?.length) {
    tags.push(renderNamedMeta('robots', metadata.robots.directives.join(', ')));
  }

  if (metadata.openGraph) {
    tags.push(...renderOpenGraphTags(metadata.openGraph));
  }

  if (metadata.twitter) {
    tags.push(...renderTwitterTags(metadata.twitter));
  }

  for (const schema of metadata.structuredData ?? []) {
    tags.push(
      `<script type="application/ld+json">${escapeJsonScript(JSON.stringify(schema.data))}</script>`,
    );
  }

  return tags;
}

export function renderSeoToString(metadata: SeoMetadata): string {
  return renderSeoTags(metadata).join('\n');
}

function renderOpenGraphTags(openGraph: NonNullable<SeoMetadata['openGraph']>): string[] {
  const tags: string[] = [];
  const values: Array<[string, string | undefined]> = [
    ['og:type', openGraph.type],
    ['og:title', openGraph.title],
    ['og:description', openGraph.description],
    ['og:url', openGraph.url],
    ['og:site_name', openGraph.siteName],
  ];

  for (const [property, value] of values) {
    if (value) {
      tags.push(renderPropertyMeta(property, value));
    }
  }

  for (const image of openGraph.images ?? []) {
    tags.push(renderPropertyMeta('og:image', image.url));
    tags.push(renderPropertyMeta('og:image:alt', image.alt));
  }

  return tags;
}

function renderTwitterTags(twitter: NonNullable<SeoMetadata['twitter']>): string[] {
  const tags: string[] = [];
  const values: Array<[string, string | undefined]> = [
    ['twitter:card', twitter.card],
    ['twitter:title', twitter.title],
    ['twitter:description', twitter.description],
    ['twitter:site', twitter.site],
    ['twitter:creator', twitter.creator],
  ];

  for (const [name, value] of values) {
    if (value) {
      tags.push(renderNamedMeta(name, value));
    }
  }

  for (const image of twitter.images ?? []) {
    tags.push(renderNamedMeta('twitter:image', image.url));
    tags.push(renderNamedMeta('twitter:image:alt', image.alt));
  }

  return tags;
}

function renderNamedMeta(name: string, content: string): string {
  return `<meta name="${escapeAttribute(name)}" content="${escapeAttribute(content)}">`;
}

function renderPropertyMeta(property: string, content: string): string {
  return `<meta property="${escapeAttribute(property)}" content="${escapeAttribute(content)}">`;
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value: unknown): string {
  return escapeHtml(value);
}

function escapeJsonScript(value: string): string {
  return value.replaceAll('</', '<\\/');
}
