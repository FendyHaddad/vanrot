import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const packageRoot = resolve(import.meta.dirname, '..');
const parentSrcImport = '..' + '/src/';

describe('vite-plugin repository rules', () => {
  it('typechecks tests with an explicit TypeScript project', () => {
    expect(() => {
      execFileSync('pnpm', ['exec', 'tsc', '-p', 'tests/tsconfig.json', '--noEmit'], {
        cwd: packageRoot,
        stdio: 'pipe',
      });
    }).not.toThrow();
  });

  it('uses the @ alias for tests that import package source modules', async () => {
    const fileNames = await readdir(import.meta.dirname);
    const offenders: string[] = [];

    for (const fileName of fileNames) {
      if (!fileName.endsWith('.test.ts')) {
        continue;
      }

      const filePath = resolve(import.meta.dirname, fileName);
      const contents = await readFile(filePath, 'utf8');

      if (!contents.includes(parentSrcImport)) {
        continue;
      }

      offenders.push(fileName);
    }

    expect(offenders).toEqual([]);
  });
});
