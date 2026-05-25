export const routerDiagnosticLevel = {
  off: 'off',
  warn: 'warn',
  error: 'error',
} as const;

export type RouterDiagnosticLevel =
  (typeof routerDiagnosticLevel)[keyof typeof routerDiagnosticLevel];

export interface RouterNavigationPolishConfig {
  navigationPolish: {
    title: boolean;
    meta: boolean;
    scroll: boolean;
    focus: boolean;
  };
  diagnostics: {
    missingTitle: RouterDiagnosticLevel;
    missingMetaDescription: RouterDiagnosticLevel;
  };
}

export const defaultRouterNavigationPolishConfig: RouterNavigationPolishConfig = {
  navigationPolish: { title: true, meta: true, scroll: true, focus: true },
  diagnostics: { missingTitle: routerDiagnosticLevel.warn, missingMetaDescription: routerDiagnosticLevel.off },
};

declare const __VANROT_ROUTER_NAVIGATION_POLISH__: RouterNavigationPolishConfig | undefined;

let testConfig: RouterNavigationPolishConfig | null = null;

export function getRouterNavigationPolishConfig(): RouterNavigationPolishConfig {
  if (testConfig !== null) {
    return testConfig;
  }

  if (typeof __VANROT_ROUTER_NAVIGATION_POLISH__ === 'undefined') {
    return defaultRouterNavigationPolishConfig;
  }

  return __VANROT_ROUTER_NAVIGATION_POLISH__;
}

export function setNavigationPolishConfigForTests(config: RouterNavigationPolishConfig): void {
  testConfig = config;
}

export function resetNavigationPolishConfigForTests(): void {
  testConfig = null;
}
