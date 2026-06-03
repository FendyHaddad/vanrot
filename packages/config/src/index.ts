export {
  configDomain,
  configSchemaVersion,
  defaultDevServerPort,
  defaultSourceRoot,
  vanrotConfigFileName,
} from './constants.js';
export { defineVanrotConfig } from './define-config.js';
export { normalizeVanrotConfig } from './defaults.js';
export {
  generatedVanrotSeoConfigSource,
  removeGeneratedVanrotSeoConfigDomain,
  removeVanrotConfigDomainIfGenerated,
  upsertVanrotConfigDomain,
  upsertVanrotSeoConfigDomain,
} from './editor.js';
export { loadVanrotProjectConfig, type LoadedVanrotConfig } from './load.js';
export {
  migrateVanrotConfig,
  renderCanonicalVanrotConfig,
  type ConfigWriteResult,
  type MigrateOptions,
} from './migrate.js';
export { recoverVanrotConfig, type RecoverOptions, type RecoverResult } from './recover.js';
export {
  configDiagnosticCode,
  formatConfigDiagnostic,
  type ConfigDiagnostic,
  type ConfigDiagnosticSeverity,
} from './diagnostics.js';
export { validateVanrotConfig } from './validate.js';
export {
  vanrotBehavior,
  vanrotAiRuleSection,
  vanrotRouterDiagnosticLevel,
  vanrotSeoDiagnosticsMode,
  vanrotSeoRobotsDirective,
  vanrotSeoSitemapChangeFrequency,
  vanrotUiFlavor,
  vanrotUiStyleMode,
} from './types.js';
export type {
  NormalizedVanrotAiConfig,
  NormalizedVanrotAiRulesConfig,
  NormalizedVanrotBehaviorConfig,
  NormalizedVanrotConfig,
  NormalizedVanrotRouterConfig,
  NormalizedVanrotRouterDiagnosticsConfig,
  NormalizedVanrotRouterNavigationPolishConfig,
  NormalizedVanrotSeoConfig,
  NormalizedVanrotUiConfig,
  VanrotAiConfig,
  VanrotAiCustomRuleSection,
  VanrotAiRuleSection,
  VanrotAiRulesConfig,
  VanrotBehaviorConfig,
  VanrotBehaviorName,
  VanrotConfig,
  VanrotRouterConfig,
  VanrotRouterDiagnosticLevel,
  VanrotRouterDiagnosticsConfig,
  VanrotRouterNavigationPolishConfig,
  VanrotSeoConfig,
  VanrotSeoDefaultsConfig,
  VanrotSeoDiagnosticsConfig,
  VanrotSeoDiagnosticsMode,
  VanrotSeoRobotsConfig,
  VanrotSeoRobotsDirective,
  VanrotSeoSitemapChangeFrequency,
  VanrotSeoSitemapConfig,
  VanrotSeoSitemapRouteConfig,
  VanrotSeoSocialConfig,
  VanrotSeoStructuredDataConfig,
  VanrotUiConfig,
  VanrotUiFlavor,
  VanrotUiStyleMode,
} from './types.js';
