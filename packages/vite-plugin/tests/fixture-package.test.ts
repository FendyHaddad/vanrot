import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface FixturePackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const fixturePackagePath = resolve(
  import.meta.dirname,
  'fixtures/basic-app/package.json',
);

describe('basic app fixture package manifest', () => {
  it('does not declare pnpm workspace protocol dependencies', async () => {
    const packageJson = JSON.parse(
      await readFile(fixturePackagePath, 'utf8'),
    ) as FixturePackageJson;
    const dependencyVersions = [
      ...Object.values(packageJson.dependencies ?? {}),
      ...Object.values(packageJson.devDependencies ?? {}),
    ];

    expect(dependencyVersions).not.toContain('workspace:*');
  });
});
