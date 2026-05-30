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
  conventions?: Record<string, unknown>;
}

export interface NormalizedVanrotConfig
  extends Omit<
    VanrotConfig,
    'schemaVersion' | 'source' | 'devServer' | 'router' | 'ui' | 'behavior' | 'ai'
  > {
  schemaVersion: number;
  source: { root: string };
  devServer: { port: number };
  router: NormalizedVanrotRouterConfig;
  ui: NormalizedVanrotUiConfig;
  behavior: NormalizedVanrotBehaviorConfig;
  ai: NormalizedVanrotAiConfig;
}
