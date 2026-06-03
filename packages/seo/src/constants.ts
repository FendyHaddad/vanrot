export const seoPackageName = '@vanrot/seo' as const;

export const seoRobotsDirective = {
  index: 'index',
  noindex: 'noindex',
  follow: 'follow',
  nofollow: 'nofollow',
  noarchive: 'noarchive',
  nosnippet: 'nosnippet',
  noimageindex: 'noimageindex',
} as const;

export const seoOpenGraphType = {
  website: 'website',
  article: 'article',
  profile: 'profile',
  product: 'product',
} as const;

export const seoTwitterCard = {
  summary: 'summary',
  summaryLargeImage: 'summary_large_image',
  app: 'app',
  player: 'player',
} as const;

export const seoSchemaType = {
  webSite: 'WebSite',
  webPage: 'WebPage',
  article: 'Article',
  blogPosting: 'BlogPosting',
  organization: 'Organization',
  person: 'Person',
  product: 'Product',
  breadcrumbList: 'BreadcrumbList',
} as const;

export const seoCanonicalPolicy = {
  siteUrlRequired: 'site-url-required',
  pathOnlyAllowed: 'path-only-allowed',
  absoluteAllowed: 'absolute-allowed',
} as const;

export const seoSitemapChangeFrequency = {
  always: 'always',
  hourly: 'hourly',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
  never: 'never',
} as const;

export const seoDiagnosticCode = {
  missingTitle: 'VRSEO001',
  missingDescription: 'VRSEO002',
  missingSiteUrl: 'VRSEO003',
  invalidSiteUrl: 'VRSEO004',
  missingCanonical: 'VRSEO005',
  invalidCanonical: 'VRSEO006',
  invalidSocialImage: 'VRSEO007',
  duplicateTitle: 'VRSEO008',
  duplicateDescription: 'VRSEO009',
  accidentalNoindex: 'VRSEO010',
  invalidSchema: 'VRSEO011',
  strictWarningEscalated: 'VRSEO012',
} as const;
