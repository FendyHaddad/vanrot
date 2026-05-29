import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  applyBumpPlan,
  bumpVersion,
  createBumpPlan,
  parseOptions,
  selectChangedPackageNames,
} from './bump-changed-packages.mjs';

describe('bump-changed-packages', () => {
  it('defaults to a patch bump unless another type is requested', () => {
    expect(parseOptions([])).toMatchObject({ bumpType: 'patch', dryRun: false, base: 'HEAD' });
    expect(parseOptions(['--type', 'minor', '--dry-run'])).toMatchObject({
      bumpType: 'minor',
      dryRun: true,
    });
    expect(parseOptions(['--', '--type', 'major'])).toMatchObject({
      bumpType: 'major',
    });

    expect(bumpVersion('0.1.0', 'patch')).toBe('0.1.1');
    expect(bumpVersion('0.1.0', 'minor')).toBe('0.2.0');
    expect(bumpVersion('0.1.0', 'major')).toBe('1.0.0');
  });

  it('selects changed packages from package file paths', () => {
    const packages = [
      releasePackage({ directoryName: 'runtime', name: '@vanrot/runtime' }),
      releasePackage({ directoryName: 'router', name: '@vanrot/router' }),
    ];

    expect(
      selectChangedPackageNames({
        packages,
        changedFiles: [
          'README.md',
          'packages/runtime/src/index.ts',
          'packages/router/package.json',
        ],
      }),
    ).toEqual(new Set(['@vanrot/runtime', '@vanrot/router']));
  });

  it('bumps changed packages and transitive dependents', () => {
    const packages = [
      releasePackage({ directoryName: 'devtools', name: '@vanrot/devtools' }),
      releasePackage({
        directoryName: 'runtime',
        name: '@vanrot/runtime',
        dependencies: { '@vanrot/devtools': 'file:../devtools' },
      }),
      releasePackage({
        directoryName: 'ui',
        name: '@vanrot/ui',
        dependencies: { '@vanrot/runtime': 'file:../runtime' },
      }),
      releasePackage({
        directoryName: 'compiler',
        name: '@vanrot/compiler',
        dependencies: { '@vanrot/ui': 'file:../ui' },
      }),
    ];

    const plan = createBumpPlan({
      packages,
      changedPackageNames: new Set(['@vanrot/runtime']),
      bumpType: 'patch',
    });

    expect(plan.bumpedPackages.map((releasePackage) => releasePackage.name)).toEqual([
      '@vanrot/runtime',
      '@vanrot/ui',
      '@vanrot/compiler',
    ]);
    expect(plan.nextVersions).toEqual(
      new Map([
        ['@vanrot/runtime', '0.1.1'],
        ['@vanrot/ui', '0.1.1'],
        ['@vanrot/compiler', '0.1.1'],
      ]),
    );
  });

  it('updates package manifests and package-owned web-types files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vanrot-bump-'));

    try {
      await writeJson(join(root, 'packages/ui/package.json'), {
        name: '@vanrot/ui',
        version: '0.1.0',
        'web-types': './web-types.json',
      });
      await writeJson(join(root, 'packages/ui/web-types.json'), {
        name: '@vanrot/ui',
        version: '0.1.0',
      });
      await writeJson(join(root, 'packages/compiler/package.json'), {
        name: '@vanrot/compiler',
        version: '0.1.0',
        dependencies: {
          '@vanrot/ui': 'file:../ui',
        },
      });

      await applyBumpPlan({
        repositoryRoot: root,
        plan: {
          bumpedPackages: [
            releasePackage({
              directory: join(root, 'packages/ui'),
              directoryName: 'ui',
              name: '@vanrot/ui',
            }),
            releasePackage({
              directory: join(root, 'packages/compiler'),
              directoryName: 'compiler',
              name: '@vanrot/compiler',
            }),
          ],
          nextVersions: new Map([
            ['@vanrot/ui', '0.1.1'],
            ['@vanrot/compiler', '0.1.1'],
          ]),
        },
        dryRun: false,
      });

      expect(await readJson(join(root, 'packages/ui/package.json'))).toMatchObject({
        version: '0.1.1',
      });
      expect(await readJson(join(root, 'packages/ui/web-types.json'))).toMatchObject({
        version: '0.1.1',
      });
      expect(await readJson(join(root, 'packages/compiler/package.json'))).toMatchObject({
        version: '0.1.1',
        dependencies: {
          '@vanrot/ui': 'file:../ui',
        },
      });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('leaves files unchanged during dry runs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vanrot-bump-dry-'));

    try {
      const manifestPath = join(root, 'packages/ui/package.json');
      await writeJson(manifestPath, {
        name: '@vanrot/ui',
        version: '0.1.0',
      });

      await applyBumpPlan({
        repositoryRoot: root,
        plan: {
          bumpedPackages: [
            releasePackage({
              directory: join(root, 'packages/ui'),
              directoryName: 'ui',
              name: '@vanrot/ui',
            }),
          ],
          nextVersions: new Map([['@vanrot/ui', '0.1.1']]),
        },
        dryRun: true,
      });

      expect(await readJson(manifestPath)).toMatchObject({ version: '0.1.0' });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

function releasePackage({
  directory,
  directoryName,
  name,
  dependencies = {},
}) {
  return {
    directory: directory ?? `/repo/packages/${directoryName}`,
    directoryName,
    name,
    manifest: {
      name,
      version: '0.1.0',
      dependencies,
    },
  };
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}
