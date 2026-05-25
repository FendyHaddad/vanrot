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

export interface VanrotConfig {
  schemaVersion?: number;
  project?: { name?: string };
  source?: { root?: string };
  devServer?: { port?: number };
  router?: VanrotRouterConfig;
  ui?: VanrotUiConfig;
  store?: Record<string, unknown>;
  testing?: Record<string, unknown>;
  build?: Record<string, unknown>;
  cache?: Record<string, unknown>;
  docs?: Record<string, unknown>;
  ai?: Record<string, unknown>;
  conventions?: Record<string, unknown>;
}

export interface NormalizedVanrotConfig
  extends Omit<VanrotConfig, 'schemaVersion' | 'source' | 'devServer' | 'router' | 'ui'> {
  schemaVersion: number;
  source: { root: string };
  devServer: { port: number };
  router: NormalizedVanrotRouterConfig;
  ui: NormalizedVanrotUiConfig;
}
