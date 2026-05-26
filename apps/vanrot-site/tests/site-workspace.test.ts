import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { deploymentReference, publicRouteMetadata } from '../src/docs/framework-reference.ts';
import { route } from '../src/routes.ts';

const appRoot = join(process.cwd());

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(join(appRoot, path), 'utf8')) as T;
}

describe('vanrot site workspace', () => {
  it('is a private workspace app with Vanrot scripts and dependencies', async () => {
    const packageJson = await readJson<{
      private?: boolean;
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    }>('package.json');

    expect(packageJson.private).toBe(true);
    expect(packageJson.scripts?.dev).toBe('vr dev');
    expect(packageJson.scripts?.build).toBe('vr build');
    expect(packageJson.scripts?.test).toBe('vitest run');
    expect(packageJson.scripts?.typecheck).toBe('tsc -p tsconfig.json --noEmit');
    expect(packageJson.dependencies?.['@vanrot/runtime']).toBe('file:../../packages/runtime');
    expect(packageJson.dependencies?.['@vanrot/router']).toBe('file:../../packages/router');
    expect(packageJson.dependencies?.['@vanrot/ui']).toBe('file:../../packages/ui');
    expect(packageJson.devDependencies?.['@vanrot/vite-plugin']).toBe('file:../../packages/vite-plugin');
  });

  it('uses Vanrot plugin and Vanrot config', async () => {
    await expect(readFile(join(appRoot, 'vite.config.ts'), 'utf8')).resolves.toContain(
      "import vanrot from '@vanrot/vite-plugin';",
    );
    await expect(readFile(join(appRoot, 'vanrot.config.ts'), 'utf8')).resolves.toContain(
      'defineVanrotConfig',
    );
    await expect(readFile(join(appRoot, 'index.html'), 'utf8')).resolves.toContain(
      'src="/src/main.ts"',
    );
  });

  it('keeps route titles on every site route', () => {
    const siteRoutes = Object.values(route);
    const visibleRoutes = siteRoutes.filter((item) => item.kind !== 'redirect');

    expect(visibleRoutes.every((item) => typeof item.title === 'string' && item.title.length > 0)).toBe(
      true,
    );
  });
});

describe('deployment-ready web presence', () => {
  it('documents deployment target without claiming live deployment', () => {
    expect(deploymentReference.targetHost).toBe('vanrot.vankode.com');
    expect(deploymentReference.summary).toContain('DNS');
    expect(deploymentReference.summary).toContain('live deployment');
  });

  it('keeps SEO metadata for public routes substantial', () => {
    for (const routeMetadata of publicRouteMetadata) {
      expect(routeMetadata.title.length).toBeGreaterThan(10);
      expect(routeMetadata.description.length).toBeGreaterThan(50);
    }
  });
});
