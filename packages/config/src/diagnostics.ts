export type ConfigDiagnosticSeverity = 'error' | 'warning';

export interface ConfigDiagnostic {
  code: string;
  severity: ConfigDiagnosticSeverity;
  message: string;
  suggestion: string;
  filePath?: string;
}

export const configDiagnosticCode = {
  loadFailed: 'VRCFG001',
  unknownTopLevelKey: 'VRCFG002',
  invalidPort: 'VRCFG003',
  migrationSuggested: 'VRCFG004',
  recoverAmbiguous: 'VRCFG005',
  invalidUiFlavor: 'VRCFG006',
  invalidUiStyleMode: 'VRCFG007',
  invalidUiPrefix: 'VRCFG008',
  invalidRouterNavigationPolish: 'VRCFG009',
  invalidRouterDiagnosticLevel: 'VRCFG010',
  invalidAiRuleSection: 'VRCFG011',
  invalidAiRuleCustomSection: 'VRCFG012',
  invalidBehavior: 'VRCFG013',
  invalidSeoSiteUrl: 'VRCFG014',
  missingSeoSiteUrl: 'VRCFG015',
  invalidSeoDiagnosticsMode: 'VRCFG016',
  invalidSeoDefaultTitle: 'VRCFG017',
  invalidSeoSocialImage: 'VRCFG018',
  invalidSeoSitemapRoute: 'VRCFG019',
  invalidSeoRobotsDirective: 'VRCFG020',
  invalidEngine: 'VRCFG021',
  formattingLocaleEmpty: 'VRCFG_FORMATTING_LOCALE_EMPTY',
  formattingTimezoneEmpty: 'VRCFG_FORMATTING_TIMEZONE_EMPTY',
  formattingCurrencyEmpty: 'VRCFG_FORMATTING_CURRENCY_EMPTY',
} as const;

export function formatConfigDiagnostic(diagnostic: ConfigDiagnostic): string {
  const location = diagnostic.filePath === undefined ? '' : `${diagnostic.filePath} `;
  const suggestion = diagnostic.suggestion === '' ? '' : `\nSuggestion: ${diagnostic.suggestion}`;
  return `${location}${diagnostic.code} ${diagnostic.message}${suggestion}`;
}
