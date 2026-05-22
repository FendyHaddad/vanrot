import { describe, expect, test } from 'vitest';
import {
  createCleanupScope,
  disposeCleanupScope,
  registerCleanup,
  runWithCleanupScope,
} from '../../packages/runtime/src/internal.js';
import { auditCase, auditSlice } from './audit-slices.js';

describe(auditSlice.runtime, function () {
  test(
    auditCase(
      auditSlice.runtime,
      'disposing a parent cleanup scope also disposes nested child scopes first',
    ),
    function () {
      const cleanupEvents: string[] = [];
      const parentScope = createCleanupScope();
      const childScope = createCleanupScope();

      runWithCleanupScope(parentScope, function () {
        registerCleanup(function () {
          cleanupEvents.push('parent cleanup');
        });

        runWithCleanupScope(childScope, function () {
          registerCleanup(function () {
            cleanupEvents.push('child cleanup');
          });
        });
      });

      disposeCleanupScope(parentScope);

      expect(cleanupEvents).toEqual(['child cleanup', 'parent cleanup']);
    },
  );
});
