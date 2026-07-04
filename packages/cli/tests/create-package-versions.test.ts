import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createPackageVersions } from '../src/create/package-versions.js';

const repoRoot = resolve(import.meta.dirname, '../../..');

describe('create package versions', () => {
  it('stays in sync with workspace package manifests', async () => {
    for (const [name, version] of Object.entries(createPackageVersions)) {
      const directory = name.replace('@vanrot/', '');
      const manifestPath = resolve(repoRoot, 'packages', directory, 'package.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as { version: string };

      expect(`${name}@${version}`).toBe(`${name}@${manifest.version}`);
    }
  });

  it('renders caret ranges for registry dependencies', async () => {
    const { createRegistryDependencyVersion } = await import('../src/create/package-versions.js');

    expect(createRegistryDependencyVersion('@vanrot/runtime')).toMatch(/^\^\d+\.\d+\.\d+$/);
  });
});
