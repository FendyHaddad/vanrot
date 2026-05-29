import { cliDiagnosticCatalog } from '@/diagnostics/catalog.js';
import { describe, expect, it } from 'vitest';

describe('cliDiagnosticCatalog', () => {
  it('keeps stable unique CLI diagnostic codes', () => {
    const codes = cliDiagnosticCatalog.map((diagnostic) => diagnostic.code);

    expect(codes).toEqual([
      'VR_UNKNOWN_COMMAND',
      'VR_UNSUPPORTED_JSON',
      'VR_JSON_MODE_CONFLICT',
      'VR_DOCTOR_FAILED',
      'VR_BUILD_FAILED',
      'VR_TEST_FAILED',
      'VR_UPDATE_TARGET_INVALID',
      'VR_UPDATE_FAILED',
      'VR_UPGRADE_PACKAGE_JSON_MISSING',
      'VR_UPGRADE_PACKAGE_JSON_INVALID',
      'VR_UPGRADE_NO_PACKAGES',
      'VR_UPGRADE_PACKAGE_MANAGER_FAILED',
      'VR_AI_DISABLED',
      'VR_AI_HISTORY_INVALID',
    ]);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
