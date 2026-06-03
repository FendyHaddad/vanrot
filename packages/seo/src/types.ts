import type {
  seoCanonicalPolicy,
  seoDiagnosticCode,
  seoOpenGraphType,
  seoRobotsDirective,
  seoSchemaType,
  seoSitemapChangeFrequency,
  seoTwitterCard,
} from './constants.js';

export type SeoRobotsDirective = (typeof seoRobotsDirective)[keyof typeof seoRobotsDirective];
export type SeoOpenGraphType = (typeof seoOpenGraphType)[keyof typeof seoOpenGraphType];
export type SeoTwitterCard = (typeof seoTwitterCard)[keyof typeof seoTwitterCard];
export type SeoSchemaType = (typeof seoSchemaType)[keyof typeof seoSchemaType];
export type SeoCanonicalPolicy = (typeof seoCanonicalPolicy)[keyof typeof seoCanonicalPolicy];
export type SeoSitemapChangeFrequency =
  (typeof seoSitemapChangeFrequency)[keyof typeof seoSitemapChangeFrequency];
export type SeoDiagnosticCode = (typeof seoDiagnosticCode)[keyof typeof seoDiagnosticCode];

export interface SeoImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
}

export interface SeoRobots {
  directives?: SeoRobotsDirective[];
  index?: boolean;
  follow?: boolean;
}

export interface SeoOpenGraph {
  type?: SeoOpenGraphType;
  title?: string;
  description?: string;
  url?: string;
  siteName?: string;
  images?: SeoImage[];
}

export interface SeoTwitter {
  card?: SeoTwitterCard;
  title?: string;
  description?: string;
  site?: string;
  creator?: string;
  images?: SeoImage[];
}

export interface SeoStructuredData {
  type: SeoSchemaType | string;
  data: Record<string, unknown>;
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: SeoRobots;
  openGraph?: SeoOpenGraph;
  twitter?: SeoTwitter;
  images?: SeoImage[];
  structuredData?: SeoStructuredData[];
}

export type SeoDynamicContext = Record<string, unknown>;

export type SeoDynamicResolver<Context extends SeoDynamicContext = SeoDynamicContext> = (
  context: Context,
) => SeoMetadata | Promise<SeoMetadata>;

export interface SeoDynamicMetadata<Context extends SeoDynamicContext = SeoDynamicContext> {
  resolve: SeoDynamicResolver<Context>;
}

export interface SeoDiagnosticsOptions {
  mode?: 'warn' | 'strict';
  siteUrl?: string;
}

export interface SeoDiagnostic {
  code: SeoDiagnosticCode;
  message: string;
  severity: 'warning' | 'error';
  path?: string;
}
