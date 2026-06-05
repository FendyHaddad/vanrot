import { configSchemaVersion, defaultDevServerPort, defaultSourceRoot } from './constants.js';
import {
  vanrotAiRuleSection,
  vanrotRouterDiagnosticLevel,
  vanrotSeoDiagnosticsMode,
  vanrotUiFlavor,
  vanrotUiStyleMode,
  type NormalizedVanrotConfig,
  type NormalizedVanrotFormattingConfig,
  type NormalizedVanrotSeoConfig,
  type VanrotConfig,
} from './types.js';

const defaultFormattingConfig: NormalizedVanrotFormattingConfig = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

export function normalizeVanrotConfig(config: VanrotConfig = {}): NormalizedVanrotConfig {
  const { seo: _seo, formatting: _formatting, ...configWithoutSeoAndFormatting } = config;
  const normalized: NormalizedVanrotConfig = {
    ...configWithoutSeoAndFormatting,
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
    formatting: {
      locale: normalizeString(config.formatting?.locale, defaultFormattingConfig.locale),
      timezone: normalizeString(config.formatting?.timezone, defaultFormattingConfig.timezone),
      currency: normalizeString(config.formatting?.currency, defaultFormattingConfig.currency),
    },
  };

  if (config.seo !== undefined) {
    normalized.seo = normalizeSeoConfig(config);
  }

  return normalized;
}

function normalizeString(value: string | undefined, fallback: string): string {
  if (value === undefined) {
    return fallback;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return fallback;
  }

  return trimmed;
}

function normalizeSeoConfig(config: VanrotConfig): NormalizedVanrotSeoConfig {
  const seo = config.seo ?? {};
  const normalized: NormalizedVanrotSeoConfig = {
    defaults: {
      ...(seo.defaults ?? {}),
    },
    social: {
      ...(seo.social ?? {}),
    },
    robots: {
      directives: seo.robots?.directives ?? [],
    },
    sitemap: {
      enabled: seo.sitemap?.enabled ?? true,
      routes: seo.sitemap?.routes ?? [],
    },
    structuredData: {
      ...(seo.structuredData ?? {}),
    },
    diagnostics: {
      mode: seo.diagnostics?.mode ?? vanrotSeoDiagnosticsMode.warn,
    },
  };

  if (seo.siteUrl !== undefined) {
    normalized.siteUrl = seo.siteUrl;
  }

  return normalized;
}
