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
      'VR_CHILD_BEFORE_PARENT',
      'VR_DUPLICATE_INDEX_ROUTE',
      'VR_INVALID_INDEX_LAYOUT',
      'VR_LAYOUT_MISSING_COMPONENT',
      'VR_LAYOUT_WITHOUT_CHILDREN',
      'VR_PAGE_HAS_CHILDREN',
      'VR_REDIRECT_HAS_RENDER_TARGET',
      'VR_REDIRECT_HAS_CHILDREN',
      'VR_REDIRECT_TARGET_MISSING',
      'VR_REDIRECT_LOOP',
      'VR_ROUTE_INVALID_GUARD',
      'VR_ROUTE_INVALID_GUARD_RESULT',
      'VR_GUARD_REDIRECT_TARGET_MISSING',
      'VR_GUARD_REDIRECT_LOOP',
      'VR_REDIRECT_HAS_PRELOAD_POLICY',
      'VR_REDIRECT_HAS_KEEP_ALIVE_POLICY',
      'VR_PRELOAD_WITHOUT_LAZY_TARGET',
      'VR_ROUTE_PRELOAD_FAILED',
      'VR_KEEP_ALIVE_IDENTITY_MISSING',
      'VR_KEEP_ALIVE_RESTORE_BLOCKED',
    ]);
  });
});
