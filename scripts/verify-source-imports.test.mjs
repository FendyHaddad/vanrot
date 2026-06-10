import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  formatSourceImportFailures,
  verifySourceImports,
  verifySourceImportsForFiles,
} from './verify-source-imports.mjs';

describe('verify-source-imports', () => {
  it('reports relative .js imports with no matching source file', async () => {
    const root = await createTempRoot();
    const indexPath = join(root, 'packages', 'forge', 'src', 'index.ts');
    await writeSourceFile(indexPath, "export { runForgeBuild } from './build/build.js';\n");

    const failures = verifySourceImportsForFiles({
      root,
      sourceFiles: [indexPath],
      isIgnored: () => false,
    });

    expect(failures).toEqual([
      {
        file: 'packages/forge/src/index.ts',
        line: 1,
        specifier: './build/build.js',
        resolvedImport: null,
        reason: 'missing',
      },
    ]);
  });

  it('reports matching source files that are ignored by Git', async () => {
    const root = await createTempRoot();
    const indexPath = join(root, 'packages', 'forge', 'src', 'index.ts');
    const buildPath = join(root, 'packages', 'forge', 'src', 'build', 'build.ts');
    await writeSourceFile(indexPath, "export { runForgeBuild } from './build/build.js';\n");
    await writeSourceFile(buildPath, 'export function runForgeBuild() {}\n');

    const failures = verifySourceImportsForFiles({
      root,
      sourceFiles: [indexPath],
      isIgnored: () => true,
    });

    expect(failures).toEqual([
      {
        file: 'packages/forge/src/index.ts',
        line: 1,
        specifier: './build/build.js',
        resolvedImport: 'packages/forge/src/build/build.ts',
        reason: 'ignored',
      },
    ]);
  });

  it('passes when the matching source file is visible to Git', async () => {
    const root = await createTempRoot();
    const indexPath = join(root, 'packages', 'forge', 'src', 'index.ts');
    const buildPath = join(root, 'packages', 'forge', 'src', 'build', 'build.ts');
    await writeSourceFile(indexPath, "export { runForgeBuild } from './build/build.js';\n");
    await writeSourceFile(buildPath, 'export function runForgeBuild() {}\n');

    expect(
      verifySourceImportsForFiles({
        root,
        sourceFiles: [indexPath],
        isIgnored: () => false,
      }),
    ).toEqual([]);
  });

  it('checks app source imports by default', async () => {
    const root = await createTempRoot();
    const treePath = join(root, 'apps', 'vanrot-site', 'src', 'docs', 'docs-page-tree.ts');
    const buildPath = join(
      root,
      'apps',
      'vanrot-site',
      'src',
      'pages',
      'docs',
      'framework',
      'forge',
      'build',
      'build.page.ts',
    );
    await writeSourceFile(
      treePath,
      "import { BuildPage } from '../pages/docs/framework/forge/build/build.page.ts';\n",
    );
    await writeSourceFile(buildPath, 'export class BuildPage {}\n');

    const failures = verifySourceImports({
      root,
      isIgnored: (filePath) => filePath === buildPath,
    });

    expect(failures).toEqual([
      {
        file: 'apps/vanrot-site/src/docs/docs-page-tree.ts',
        line: 1,
        specifier: '../pages/docs/framework/forge/build/build.page.ts',
        resolvedImport: 'apps/vanrot-site/src/pages/docs/framework/forge/build/build.page.ts',
        reason: 'ignored',
      },
    ]);
  });

  it('formats readable failures', () => {
    expect(
      formatSourceImportFailures([
        {
          file: 'packages/forge/src/index.ts',
          line: 3,
          specifier: './build/build.js',
          resolvedImport: 'packages/forge/src/build/build.ts',
          reason: 'ignored',
        },
      ]),
    ).toBe(
      [
        'Source import verification failed.',
        '- packages/forge/src/index.ts:3 imports ./build/build.js, but packages/forge/src/build/build.ts is ignored by Git.',
        'Track missing source files or fix relative .js imports before CI sees a missing module.',
      ].join('\n'),
    );
  });
});

async function createTempRoot() {
  return mkdtemp(join(tmpdir(), 'vanrot-source-imports-'));
}

async function writeSourceFile(filePath, source) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, source);
}
