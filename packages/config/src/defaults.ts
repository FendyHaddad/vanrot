import { configSchemaVersion, defaultDevServerPort, defaultSourceRoot } from './constants.js';
import {
  vanrotAiRuleSection,
  vanrotRouterDiagnosticLevel,
  vanrotUiFlavor,
  vanrotUiStyleMode,
  type NormalizedVanrotConfig,
  type VanrotConfig,
} from './types.js';

export function normalizeVanrotConfig(config: VanrotConfig = {}): NormalizedVanrotConfig {
  return {
    ...config,
    schemaVersion: config.schemaVersion ?? configSchemaVersion,
    source: {
      root: config.source?.root ?? defaultSourceRoot,
    },
    devServer: {
      port: config.devServer?.port ?? defaultDevServerPort,
    },
    router: {
      navigationPolish: {
        title: config.router?.navigationPolish?.title ?? true,
        meta: config.router?.navigationPolish?.meta ?? true,
        scroll: config.router?.navigationPolish?.scroll ?? true,
        focus: config.router?.navigationPolish?.focus ?? true,
      },
      diagnostics: {
        missingTitle: config.router?.diagnostics?.missingTitle ?? vanrotRouterDiagnosticLevel.warn,
        missingMetaDescription:
          config.router?.diagnostics?.missingMetaDescription ?? vanrotRouterDiagnosticLevel.off,
      },
    },
    ui: {
      flavor: config.ui?.flavor ?? vanrotUiFlavor.october,
      styles: config.ui?.styles ?? vanrotUiStyleMode.vanrotstyles,
      prefix: config.ui?.prefix ?? 'ui',
    },
    behavior: {
      enabled: config.behavior?.enabled ?? [],
    },
    ai: {
      enabled: config.ai?.enabled ?? true,
      rules: {
        enabledSections: config.ai?.rules?.enabledSections ?? [
          vanrotAiRuleSection.projectRules,
          vanrotAiRuleSection.commands,
          vanrotAiRuleSection.fileConventions,
        ],
        customSections: config.ai?.rules?.customSections ?? [],
      },
    },
  };
}
