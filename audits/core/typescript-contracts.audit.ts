import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { auditCase, auditSlice } from './audit-slices.js';

const appAuthorFacingFiles = [
  'examples/counter/src/main.ts',
  'packages/vite-plugin/tests/fixtures/basic-app/src/main.ts',
  'packages/vite-plugin/tests/fixtures/basic-app/src/routes.ts',
  'packages/ui/src/primitives/button/ui.button.test.ts',
  'packages/cli/src/create/app-template.ts',
] as const;

describe(auditSlice.typescriptContracts, function () {
  test(
    auditCase(
      auditSlice.typescriptContracts,
      'Vanrot-authored app and generated-template imports do not need @ts-expect-error',
    ),
    async function () {
      const offenders: string[] = [];

      for (const filePath of appAuthorFacingFiles) {
        const source = await readFile(filePath, 'utf8');

        if (!source.includes('@ts-expect-error')) {
          continue;
        }

        offenders.push(filePath);
      }

      expect(offenders).toEqual([]);
    },
  );
});
