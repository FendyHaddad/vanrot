import { configDomain } from './constants.js';
import { configDiagnosticCode, type ConfigDiagnostic } from './diagnostics.js';
import {
  vanrotRouterDiagnosticLevel,
  vanrotUiFlavor,
  vanrotUiStyleMode,
  type VanrotConfig,
} from './types.js';

const knownTopLevelKeys = new Set<string>(['schemaVersion', ...Object.values(configDomain)]);
const knownRouterDiagnosticLevels = new Set<string>(Object.values(vanrotRouterDiagnosticLevel));
const knownUiFlavors = new Set<string>(Object.values(vanrotUiFlavor));
const knownUiStyleModes = new Set<string>(Object.values(vanrotUiStyleMode));
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

  return diagnostics;
}
