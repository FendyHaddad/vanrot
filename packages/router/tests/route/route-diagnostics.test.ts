import { describe, expect, it } from 'vitest';
import { routeDiagnosticCodes } from '../../src/route/route-diagnostic-codes.js';
import { createRouteDiagnostic } from '../../src/route/route-diagnostics.js';

describe('route diagnostics', () => {
  it('creates diagnostics with code, message, source span, suggestion, and docs hook', () => {
    const diagnostic = createRouteDiagnostic({
      code: routeDiagnosticCodes.duplicatePath,
      message: 'Route path "/shop" is already used by "shop".',
      filePath: 'src/routes.ts',
      line: 8,
      column: 5,
      suggestion: 'Give one route a different path.',
      docsPath: 'router/routes#duplicate-paths',
    });

    expect(diagnostic).toEqual({
      code: 'VR_ROUTE_DUPLICATE_PATH',
      severity: 'error',
      message: 'Route path "/shop" is already used by "shop".',
      filePath: 'src/routes.ts',
      line: 8,
      column: 5,
      suggestion: 'Give one route a different path.',
      docsPath: 'router/routes#duplicate-paths',
    });
  });

  it('keeps diagnostic codes in one named source of truth', () => {
    expect(Object.values(routeDiagnosticCodes)).toEqual([
      'VR_ROUTE_DUPLICATE_PATH',
      'VR_ROUTE_INVALID_PARENT_PATH',
      'VR_ROUTE_MISSING_RENDER_TARGET',
      'VR_ROUTE_INVALID_PARAM_NAME',
      'VR_ROUTE_MISSING_PARAM',
      'VR_ROUTE_UNKNOWN_PARAM',
      'VR_ROUTE_UNKNOWN_QUERY',
      'VR_ROUTE_QUERY_METADATA_REQUIRED',
      'VR_ROUTE_BREADCRUMB_PARENT_MISSING',
      'VR_ROUTE_BREADCRUMB_PARAM_IMPOSSIBLE',
      'VR_ROUTE_INVALID_TEMPLATE_REF',
    ]);
  });
});
