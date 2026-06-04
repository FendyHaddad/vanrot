import { configDomain } from './constants.js';
import { configDiagnosticCode, type ConfigDiagnostic } from './diagnostics.js';
import {
  vanrotBehavior,
  vanrotAiRuleSection,
  vanrotRouterDiagnosticLevel,
  vanrotSeoDiagnosticsMode,
  vanrotSeoRobotsDirective,
  vanrotSeoSitemapChangeFrequency,
  vanrotUiFlavor,
  vanrotUiStyleMode,
  type VanrotConfig,
} from './types.js';

const knownTopLevelKeys = new Set<string>(['schemaVersion', ...Object.values(configDomain)]);
const knownRouterDiagnosticLevels = new Set<string>(Object.values(vanrotRouterDiagnosticLevel));
const knownUiFlavors = new Set<string>(Object.values(vanrotUiFlavor));
const knownUiStyleModes = new Set<string>(Object.values(vanrotUiStyleMode));
const knownAiRuleSections = new Set<string>(Object.values(vanrotAiRuleSection));
const knownBehaviorNames = new Set<string>(Object.values(vanrotBehavior));
const knownSeoDiagnosticsModes = new Set<string>(Object.values(vanrotSeoDiagnosticsMode));
const knownSeoRobotsDirectives = new Set<string>(Object.values(vanrotSeoRobotsDirective));
const knownSeoSitemapChangeFrequencies = new Set<string>(
  Object.values(vanrotSeoSitemapChangeFrequency),
);
const routerPolishKeys = ['title', 'meta', 'scroll', 'focus'] as const;
const routerDiagnosticKeys = ['missingTitle', 'missingMetaDescription'] as const;
const uiPrefixPattern = /^[a-z][a-z0-9-]*$/;

export function validateVanrotConfig(config: VanrotConfig): ConfigDiagnostic[] {
  const diagnostics: ConfigDiagnostic[] = [];

  for (const key of Object.keys(config)) {
    if (knownTopLevelKeys.has(key)) {
      continue;
    }

    diagnostics.push({
      code: configDiagnosticCode.unknownTopLevelKey,
      severity: 'error',
      message: `Unknown top-level config key: ${key}`,
      suggestion: 'Remove the key or move it under a supported domain.',
    });
  }

  const port = config.devServer?.port;
  if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65_535)) {
    diagnostics.push({
      code: configDiagnosticCode.invalidPort,
      severity: 'error',
      message: `Invalid devServer.port: ${String(port)}`,
      suggestion: 'Use an integer from 1 to 65535.',
    });
  }

  const router = config.router;
  if (router !== undefined) {
    for (const key of routerPolishKeys) {
      const value = router.navigationPolish?.[key];

      if (value === undefined || typeof value === 'boolean') {
        continue;
      }

      diagnostics.push({
        code: configDiagnosticCode.invalidRouterNavigationPolish,
        severity: 'error',
        message: `Invalid router.navigationPolish.${key}: ${String(value)}`,
        suggestion: 'Use true or false.',
      });
    }

    for (const key of routerDiagnosticKeys) {
      const value = router.diagnostics?.[key];

      if (value === undefined || knownRouterDiagnosticLevels.has(String(value))) {
        continue;
      }

      diagnostics.push({
        code: configDiagnosticCode.invalidRouterDiagnosticLevel,
        severity: 'error',
        message: `Invalid router.diagnostics.${key}: ${String(value)}`,
        suggestion: 'Use off, warn, or error.',
      });
    }
  }

  const ui = config.ui;
  if (ui !== undefined) {
    if (ui.flavor !== undefined && !knownUiFlavors.has(String(ui.flavor))) {
      diagnostics.push({
        code: configDiagnosticCode.invalidUiFlavor,
        severity: 'error',
        message: `Invalid ui.flavor: ${String(ui.flavor)}`,
        suggestion: `Use ${vanrotUiFlavor.october}.`,
      });
    }

    if (ui.styles !== undefined && !knownUiStyleModes.has(String(ui.styles))) {
      diagnostics.push({
        code: configDiagnosticCode.invalidUiStyleMode,
        severity: 'error',
        message: `Invalid ui.styles: ${String(ui.styles)}`,
        suggestion: `Use ${vanrotUiStyleMode.vanrotstyles}, ${vanrotUiStyleMode.tailwind}, or ${vanrotUiStyleMode.none}.`,
      });
    }

    if (ui.prefix !== undefined && !uiPrefixPattern.test(String(ui.prefix))) {
      diagnostics.push({
        code: configDiagnosticCode.invalidUiPrefix,
        severity: 'error',
        message: `Invalid ui.prefix: ${String(ui.prefix)}`,
        suggestion: 'Use lowercase kebab-case, for example ui or marketing-primary.',
      });
    }
  }

  const behavior = config.behavior as { enabled?: unknown } | undefined;
  if (behavior?.enabled !== undefined && !Array.isArray(behavior.enabled)) {
    diagnostics.push({
      code: configDiagnosticCode.invalidBehavior,
      severity: 'error',
      message: `Invalid behavior.enabled: ${String(behavior.enabled)}`,
      suggestion: 'Use an array of behavior helper names.',
    });
  }

  if (Array.isArray(behavior?.enabled)) {
    for (const behaviorName of behavior.enabled) {
      if (knownBehaviorNames.has(String(behaviorName))) {
        continue;
      }

      diagnostics.push({
        code: configDiagnosticCode.invalidBehavior,
        severity: 'error',
        message: `Invalid behavior.enabled entry: ${String(behaviorName)}`,
        suggestion:
          'Use form, table, overlay, tabs, tooltip, toast, command-menu, positioned-layer, collapsible, selection, menu, toggle, scroll-area, portal, focus, calendar, drag-drop, or table-resize.',
      });
    }
  }

  const aiRules = config.ai?.rules;
  if (aiRules !== undefined) {
    const customSectionIds = new Set(aiRules.customSections?.map((section) => section.id) ?? []);
    for (const sectionId of aiRules.enabledSections ?? []) {
      if (knownAiRuleSections.has(sectionId) || customSectionIds.has(sectionId)) {
        continue;
      }

      diagnostics.push({
        code: configDiagnosticCode.invalidAiRuleSection,
        severity: 'error',
        message: `Unknown ai.rules.enabledSections entry: ${sectionId}`,
        suggestion:
          'Use project-rules, commands, file-conventions, or custom section ids declared in ai.rules.customSections.',
      });
    }

    for (const section of aiRules.customSections ?? []) {
      if (section.id !== '' && section.title !== '' && section.body !== '') {
        continue;
      }

      diagnostics.push({
        code: configDiagnosticCode.invalidAiRuleCustomSection,
        severity: 'error',
        message: `Invalid ai.rules.customSections entry: ${section.id}`,
        suggestion: 'Custom AI rule sections need non-empty id, title, and body fields.',
      });
    }
  }

  validateSeoConfig(config, diagnostics);

  return diagnostics;
}

function validateSeoConfig(config: VanrotConfig, diagnostics: ConfigDiagnostic[]): void {
  const seo = config.seo as Record<string, unknown> | undefined;

  if (seo === undefined) {
    return;
  }

  const siteUrl = seo['siteUrl'];
  if (siteUrl === undefined) {
    diagnostics.push({
      code: configDiagnosticCode.missingSeoSiteUrl,
      severity: 'warning',
      message: 'SEO siteUrl is not configured yet.',
      suggestion:
        'Add seo.siteUrl before production so canonical URLs, sitemap.xml, and social previews resolve absolutely.',
    });
  }

  if (siteUrl !== undefined && (typeof siteUrl !== 'string' || !isHttpUrl(siteUrl))) {
    diagnostics.push({
      code: configDiagnosticCode.invalidSeoSiteUrl,
      severity: 'error',
      message: `Invalid seo.siteUrl: ${String(siteUrl)}`,
      suggestion: 'Use an absolute http(s) production URL, or omit siteUrl until the URL is known.',
    });
  }

  validateSeoDefaults(seo, diagnostics);
  validateSeoDiagnostics(seo, diagnostics);
  validateSeoRobots(seo, diagnostics);
  validateSeoSitemap(seo, diagnostics);
  validateSeoSocial(seo, diagnostics);
}

function validateSeoDefaults(seo: Record<string, unknown>, diagnostics: ConfigDiagnostic[]): void {
  const defaults = seo['defaults'] as Record<string, unknown> | undefined;

  if (defaults === undefined) {
    return;
  }

  const title = defaults['title'];
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    diagnostics.push({
      code: configDiagnosticCode.invalidSeoDefaultTitle,
      severity: 'error',
      message: `Invalid seo.defaults.title: ${String(title)}`,
      suggestion: 'Use a non-empty string title, or remove the field.',
    });
  }

  const description = defaults['description'];
  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
    diagnostics.push({
      code: configDiagnosticCode.invalidSeoDefaultTitle,
      severity: 'error',
      message: `Invalid seo.defaults.description: ${String(description)}`,
      suggestion: 'Use a non-empty string description, or remove the field.',
    });
  }
}

function validateSeoDiagnostics(
  seo: Record<string, unknown>,
  diagnostics: ConfigDiagnostic[],
): void {
  const seoDiagnostics = seo['diagnostics'] as Record<string, unknown> | undefined;
  const mode = seoDiagnostics?.['mode'];

  if (mode === undefined || knownSeoDiagnosticsModes.has(String(mode))) {
    return;
  }

  diagnostics.push({
    code: configDiagnosticCode.invalidSeoDiagnosticsMode,
    severity: 'error',
    message: `Invalid seo.diagnostics.mode: ${String(mode)}`,
    suggestion: 'Use warn or strict.',
  });
}

function validateSeoRobots(seo: Record<string, unknown>, diagnostics: ConfigDiagnostic[]): void {
  const robots = seo['robots'] as Record<string, unknown> | undefined;
  const directives = robots?.['directives'];

  if (directives === undefined) {
    return;
  }

  if (!Array.isArray(directives)) {
    diagnostics.push({
      code: configDiagnosticCode.invalidSeoRobotsDirective,
      severity: 'error',
      message: `Invalid seo.robots.directives: ${String(directives)}`,
      suggestion: 'Use an array of supported robots directives.',
    });
    return;
  }

  for (const directive of directives) {
    if (knownSeoRobotsDirectives.has(String(directive))) {
      continue;
    }

    diagnostics.push({
      code: configDiagnosticCode.invalidSeoRobotsDirective,
      severity: 'error',
      message: `Invalid seo.robots.directives entry: ${String(directive)}`,
      suggestion: 'Use index, noindex, follow, nofollow, noarchive, nosnippet, or noimageindex.',
    });
  }
}

function validateSeoSitemap(seo: Record<string, unknown>, diagnostics: ConfigDiagnostic[]): void {
  const sitemap = seo['sitemap'] as Record<string, unknown> | undefined;
  const routes = sitemap?.['routes'];

  if (routes === undefined) {
    return;
  }

  if (!Array.isArray(routes)) {
    diagnostics.push({
      code: configDiagnosticCode.invalidSeoSitemapRoute,
      severity: 'error',
      message: `Invalid seo.sitemap.routes: ${String(routes)}`,
      suggestion: 'Use an array of sitemap route objects.',
    });
    return;
  }

  for (const route of routes) {
    if (isValidSeoSitemapRoute(route)) {
      continue;
    }

    diagnostics.push({
      code: configDiagnosticCode.invalidSeoSitemapRoute,
      severity: 'error',
      message: `Invalid seo.sitemap.routes entry: ${JSON.stringify(route)}`,
      suggestion:
        'Use route objects with a root-relative path, optional priority from 0 to 1, and valid changeFrequency.',
    });
  }
}

function validateSeoSocial(seo: Record<string, unknown>, diagnostics: ConfigDiagnostic[]): void {
  const social = seo['social'] as Record<string, unknown> | undefined;
  const defaultImage = social?.['defaultImage'];

  if (defaultImage === undefined || isValidSeoImageUrl(defaultImage)) {
    return;
  }

  diagnostics.push({
    code: configDiagnosticCode.invalidSeoSocialImage,
    severity: 'error',
    message: `Invalid seo.social.defaultImage: ${String(defaultImage)}`,
    suggestion: 'Use an absolute http(s) URL or a root-relative image path.',
  });
}

function isValidSeoSitemapRoute(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const route = value as Record<string, unknown>;
  const path = route['path'];
  const priority = route['priority'];
  const changeFrequency = route['changeFrequency'];

  if (typeof path !== 'string' || !path.startsWith('/')) {
    return false;
  }

  if (priority !== undefined && (typeof priority !== 'number' || priority < 0 || priority > 1)) {
    return false;
  }

  if (
    changeFrequency !== undefined &&
    !knownSeoSitemapChangeFrequencies.has(String(changeFrequency))
  ) {
    return false;
  }

  return true;
}

function isValidSeoImageUrl(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.startsWith('/')) {
    return true;
  }

  return isHttpUrl(value);
}

function isHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
