import type { SeoSitemapChangeFrequency } from './types.js';

export interface SeoSitemapRoute {
  path: string;
  lastModified?: string | Date;
  changeFrequency?: SeoSitemapChangeFrequency;
  priority?: number;
}

export type SeoSitemapRouteProvider<Context = unknown> = (
  context: Context,
) => SeoSitemapRoute[] | Promise<SeoSitemapRoute[]>;

export interface SeoDynamicSitemapRoutes<Context = unknown> {
  resolve: SeoSitemapRouteProvider<Context>;
}

export interface SeoSitemapXmlInput {
  siteUrl: string;
  routes: SeoSitemapRoute[];
}

export function defineSitemapRoute(route: SeoSitemapRoute): Readonly<SeoSitemapRoute> {
  return Object.freeze({ ...route });
}

export function defineDynamicSitemapRoutes<Context>(
  resolve: SeoSitemapRouteProvider<Context>,
): SeoDynamicSitemapRoutes<Context> {
  return Object.freeze({ resolve });
}

export async function resolveSitemapRoutes<Context = unknown>(
  entries: Array<SeoSitemapRoute | SeoDynamicSitemapRoutes<Context>>,
  context?: Context,
): Promise<SeoSitemapRoute[]> {
  const routes: SeoSitemapRoute[] = [];

  for (const entry of entries) {
    if (isDynamicSitemapRoutes(entry)) {
      routes.push(...(await entry.resolve(context as Context)));
      continue;
    }

    routes.push(entry);
  }

  return routes;
}

export function generateSitemapXml(input: SeoSitemapXmlInput): string {
  const urls = input.routes.map((route) => renderSitemapRoute(input.siteUrl, route)).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
  ].join('\n');
}

function renderSitemapRoute(siteUrl: string, route: SeoSitemapRoute): string {
  const lines = [`  <loc>${escapeXml(resolveRouteUrl(siteUrl, route.path))}</loc>`];

  if (route.lastModified) {
    lines.push(`  <lastmod>${escapeXml(formatLastModified(route.lastModified))}</lastmod>`);
  }

  if (route.changeFrequency) {
    lines.push(`  <changefreq>${escapeXml(route.changeFrequency)}</changefreq>`);
  }

  if (route.priority !== undefined) {
    lines.push(`  <priority>${route.priority}</priority>`);
  }

  return ['<url>', ...lines, '</url>'].join('\n');
}

function resolveRouteUrl(siteUrl: string, path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return new URL(path, siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`).toString();
}

function formatLastModified(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function isDynamicSitemapRoutes<Context>(
  value: SeoSitemapRoute | SeoDynamicSitemapRoutes<Context>,
): value is SeoDynamicSitemapRoutes<Context> {
  return 'resolve' in value && typeof value.resolve === 'function';
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
