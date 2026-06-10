import { describe, expect, it } from 'vitest';
import {
  createForgeHookRegistry,
  forgeDiagnosticCode,
  runForgeDiagnosticsHooks,
  type ForgeHookContext,
} from '../src/index.js';

describe('Forge hook diagnostics', () => {
  it('collects diagnostics from hooks deterministically', async () => {
    const registry = createForgeHookRegistry([
      {
        name: 'first',
        diagnostics: () => [
          {
            code: forgeDiagnosticCode.routeDiscoveryFailed,
            severity: 'warning',
            message: 'Missing route metadata.',
            suggestion: 'Add route metadata.',
            docsPath: '/docs/forge/hooks',
          },
        ],
      },
      {
        name: 'second',
        diagnostics: () => [],
      },
    ]);

    await expect(runForgeDiagnosticsHooks(registry, createHookContext())).resolves.toEqual([
      {
        code: forgeDiagnosticCode.routeDiscoveryFailed,
        severity: 'warning',
        message: 'Missing route metadata.',
        suggestion: 'Add route metadata.',
        docsPath: '/docs/forge/hooks',
      },
    ]);
  });
});

function createHookContext(): ForgeHookContext {
  return {
    root: '/app',
    sourceRoot: 'src',
    mode: 'dev',
    graph: {
      root: '/app',
      sourceRoot: 'src',
      files: [],
      roleFiles: [],
      routes: { routeFiles: [], pages: [] },
      diagnostics: [],
    },
  };
}
