export const vanrotUiFlavor = {
  october: 'october',
} as const;

export type VanrotUiFlavor = (typeof vanrotUiFlavor)[keyof typeof vanrotUiFlavor];

export const vanrotUiStyleMode = {
  vanrotstyles: 'vanrotstyles',
  tailwind: 'tailwind',
  none: 'none',
} as const;

export type VanrotUiStyleMode = (typeof vanrotUiStyleMode)[keyof typeof vanrotUiStyleMode];

export const vanrotRouterDiagnosticLevel = {
  off: 'off',
  warn: 'warn',
  error: 'error',
} as const;

export type VanrotRouterDiagnosticLevel =
  (typeof vanrotRouterDiagnosticLevel)[keyof typeof vanrotRouterDiagnosticLevel];

export const vanrotBehavior = {
  form: 'form',
  table: 'table',
  overlay: 'overlay',
  tabs: 'tabs',
  tooltip: 'tooltip',
  toast: 'toast',
  commandMenu: 'command-menu',
  positionedLayer: 'positioned-layer',
  collapsible: 'collapsible',
  selection: 'selection',
  menu: 'menu',
  toggle: 'toggle',
  scrollArea: 'scroll-area',
  portal: 'portal',
  focus: 'focus',
  calendar: 'calendar',
  dragDrop: 'drag-drop',
  tableResize: 'table-resize',
} as const;

export type VanrotBehaviorName = (typeof vanrotBehavior)[keyof typeof vanrotBehavior];

export const vanrotAiRuleSection = {
  projectRules: 'project-rules',
  commands: 'commands',
  fileConventions: 'file-conventions',
} as const;

export type VanrotAiRuleSection =
  (typeof vanrotAiRuleSection)[keyof typeof vanrotAiRuleSection];

export interface VanrotAiCustomRuleSection {
  id: string;
  title: string;
  body: string;
}

export interface VanrotAiRulesConfig {
  enabledSections?: string[];
  customSections?: VanrotAiCustomRuleSection[];
}

export interface NormalizedVanrotAiRulesConfig {
  enabledSections: string[];
  customSections: VanrotAiCustomRuleSection[];
}

export interface VanrotAiConfig {
  enabled?: boolean;
  rules?: VanrotAiRulesConfig;
}

export interface NormalizedVanrotAiConfig {
  enabled: boolean;
  rules: NormalizedVanrotAiRulesConfig;
}

export interface VanrotFormattingConfig {
  locale?: string;
  timezone?: string;
  currency?: string;
}

export interface NormalizedVanrotFormattingConfig {
  locale: string;
  timezone: string;
  currency: string;
}

export interface VanrotUiConfig {
  flavor?: VanrotUiFlavor;
  styles?: VanrotUiStyleMode;
  prefix?: string;
}

export interface NormalizedVanrotUiConfig {
  flavor: VanrotUiFlavor;
  styles: VanrotUiStyleMode;
  prefix: string;
}

export interface VanrotRouterNavigationPolishConfig {
  title?: boolean;
  meta?: boolean;
  scroll?: boolean;
  focus?: boolean;
}

export interface NormalizedVanrotRouterNavigationPolishConfig {
  title: boolean;
  meta: boolean;
  scroll: boolean;
  focus: boolean;
}

export interface VanrotRouterDiagnosticsConfig {
  missingTitle?: VanrotRouterDiagnosticLevel;
  missingMetaDescription?: VanrotRouterDiagnosticLevel;
}

export interface NormalizedVanrotRouterDiagnosticsConfig {
  missingTitle: VanrotRouterDiagnosticLevel;
  missingMetaDescription: VanrotRouterDiagnosticLevel;
}

export interface VanrotRouterConfig {
  navigationPolish?: VanrotRouterNavigationPolishConfig;
  diagnostics?: VanrotRouterDiagnosticsConfig;
}

export interface NormalizedVanrotRouterConfig {
  navigationPolish: NormalizedVanrotRouterNavigationPolishConfig;
  diagnostics: NormalizedVanrotRouterDiagnosticsConfig;
}

export interface VanrotBehaviorConfig {
  enabled?: VanrotBehaviorName[];
}

export interface NormalizedVanrotBehaviorConfig {
  enabled: VanrotBehaviorName[];
}

export const vanrotSeoDiagnosticsMode = {
  warn: 'warn',
  strict: 'strict',
} as const;

export type VanrotSeoDiagnosticsMode =
  (typeof vanrotSeoDiagnosticsMode)[keyof typeof vanrotSeoDiagnosticsMode];

export const vanrotSeoRobotsDirective = {
  index: 'index',
  noindex: 'noindex',
  follow: 'follow',
  nofollow: 'nofollow',
  noarchive: 'noarchive',
  nosnippet: 'nosnippet',
  noimageindex: 'noimageindex',
} as const;

export type VanrotSeoRobotsDirective =
  (typeof vanrotSeoRobotsDirective)[keyof typeof vanrotSeoRobotsDirective];

export const vanrotSeoSitemapChangeFrequency = {
  always: 'always',
  hourly: 'hourly',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
  never: 'never',
} as const;

export type VanrotSeoSitemapChangeFrequency =
  (typeof vanrotSeoSitemapChangeFrequency)[keyof typeof vanrotSeoSitemapChangeFrequency];

export interface VanrotSeoDefaultsConfig {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
}

export interface VanrotSeoSocialConfig {
  siteName?: string;
  defaultImage?: string;
  twitterHandle?: string;
}

export interface VanrotSeoRobotsConfig {
  directives?: VanrotSeoRobotsDirective[];
}

export interface VanrotSeoSitemapRouteConfig {
  path: string;
  lastModified?: string;
  changeFrequency?: VanrotSeoSitemapChangeFrequency;
  priority?: number;
}

export interface VanrotSeoSitemapConfig {
  enabled?: boolean;
  routes?: VanrotSeoSitemapRouteConfig[];
}

export interface VanrotSeoStructuredDataConfig {
  organizationName?: string;
  organizationLogo?: string;
}

export interface VanrotSeoDiagnosticsConfig {
  mode?: VanrotSeoDiagnosticsMode;
}

export interface VanrotSeoConfig {
  siteUrl?: string;
  defaults?: VanrotSeoDefaultsConfig;
  social?: VanrotSeoSocialConfig;
  robots?: VanrotSeoRobotsConfig;
  sitemap?: VanrotSeoSitemapConfig;
  structuredData?: VanrotSeoStructuredDataConfig;
  diagnostics?: VanrotSeoDiagnosticsConfig;
}

export interface NormalizedVanrotSeoConfig {
  siteUrl?: string;
  defaults: VanrotSeoDefaultsConfig;
  social: VanrotSeoSocialConfig;
  robots: { directives: VanrotSeoRobotsDirective[] };
  sitemap: { enabled: boolean; routes: VanrotSeoSitemapRouteConfig[] };
  structuredData: VanrotSeoStructuredDataConfig;
  diagnostics: { mode: VanrotSeoDiagnosticsMode };
}

export interface VanrotConfig {
  schemaVersion?: number;
  project?: { name?: string };
  source?: { root?: string };
  devServer?: { port?: number };
  router?: VanrotRouterConfig;
  ui?: VanrotUiConfig;
  behavior?: VanrotBehaviorConfig;
  store?: Record<string, unknown>;
  testing?: Record<string, unknown>;
  build?: Record<string, unknown>;
  cache?: Record<string, unknown>;
  docs?: Record<string, unknown>;
  ai?: VanrotAiConfig;
  seo?: VanrotSeoConfig;
  formatting?: VanrotFormattingConfig;
  conventions?: Record<string, unknown>;
}

export interface NormalizedVanrotConfig
  extends Omit<
    VanrotConfig,
    'schemaVersion' | 'source' | 'devServer' | 'router' | 'ui' | 'behavior' | 'ai' | 'seo' | 'formatting'
  > {
  schemaVersion: number;
  source: { root: string };
  devServer: { port: number };
  router: NormalizedVanrotRouterConfig;
  ui: NormalizedVanrotUiConfig;
  behavior: NormalizedVanrotBehaviorConfig;
  ai: NormalizedVanrotAiConfig;
  formatting: NormalizedVanrotFormattingConfig;
  seo?: NormalizedVanrotSeoConfig;
}
