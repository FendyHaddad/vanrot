import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createRegistryDependencyVersion } from '../src/create/package-versions.js';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'vanrot-cli-create-'));
}

describe('vr create', () => {
  it('creates a router-enabled Vanrot app', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'demo-app'], { cwd, reporter });
    const appRoot = join(cwd, 'demo-app');

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(appRoot, 'package.json'), 'utf8')).resolves.toContain(
      `"@vanrot/router": "${createRegistryDependencyVersion('@vanrot/router')}"`,
    );
    await expect(readFile(join(appRoot, 'package.json'), 'utf8')).resolves.toContain('"dev": "vr dev"');
    await expect(readFile(join(appRoot, 'package.json'), 'utf8')).resolves.toContain(
      `"@vanrot/forge": "${createRegistryDependencyVersion('@vanrot/forge')}"`,
    );
    await expect(readFile(join(appRoot, 'vanrot.config.ts'), 'utf8')).resolves.toContain(
      "engine: 'forge'",
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "import { provideRouter } from '@vanrot/router';",
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "import { AppLayout } from './app/app.layout.ts';",
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      'mount(AppLayout, target);',
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.not.toContain(
      '@ts-expect-error',
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      'provideRouter(appRoute);',
    );
    await expect(readFile(join(appRoot, 'tsconfig.json'), 'utf8')).resolves.toContain(
      '"allowImportingTsExtensions": true',
    );
    await expect(readFile(join(appRoot, 'src', 'routes.ts'), 'utf8')).resolves.toContain(
      'defineRoutes',
    );
    await expect(readFile(join(appRoot, 'src', 'routes.ts'), 'utf8')).resolves.toContain(
      "import { HomePage } from './pages/home/home.page.ts';",
    );
    await expect(readFile(join(appRoot, 'src', 'routes.ts'), 'utf8')).resolves.not.toContain(
      '@ts-expect-error',
    );
    await expect(
      readFile(join(appRoot, 'src', 'app', 'app.layout.ts'), 'utf8'),
    ).resolves.toContain('route = appRoute;');
    await expect(
      readFile(join(appRoot, 'src', 'app', 'app.layout.html'), 'utf8'),
    ).resolves.toContain('<vr-router></vr-router>');
    await expect(
      readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.ts'), 'utf8'),
    ).resolves.toContain('export class HomePage');
    await expect(
      readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.ts'), 'utf8'),
    ).resolves.toContain("appName = 'demo-app';");
    await expect(
      readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.ts'), 'utf8'),
    ).resolves.toContain('https://vanrot.vankode.com/docs');
    await expect(
      readFile(join(appRoot, 'src', 'pages', 'shop', 'shop.page.ts'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(join(appRoot, 'src', 'pages', 'cart', 'cart.page.ts'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(join(appRoot, 'src', 'layouts', 'shop', 'shop.layout.ts'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(readFile(join(appRoot, 'src', 'app', 'app.layout.css'), 'utf8')).resolves.toContain(
      '.app',
    );
    expect(reporter.output()).toContain('Created demo-app');
    expect(reporter.output()).toContain('vr dev');
  });

  it('scaffolds behavior config and dependency when behavior helpers are selected', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(
      ['create', 'behavior-app', '--behavior', 'tooltip,toast,collapsible,selection,calendar'],
      {
        cwd,
        reporter,
      },
    );

    const appRoot = join(cwd, 'behavior-app');
    const packageJson = JSON.parse(await readFile(join(appRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const configSource = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(packageJson.dependencies).toMatchObject({
      '@vanrot/behavior': expect.stringMatching(/^\^\d+\.\d+\.\d+/),
    });
    expect(configSource).toContain('behavior: {');
    expect(configSource).toContain(
      "enabled: ['tooltip', 'toast', 'collapsible', 'selection', 'calendar']",
    );
  });

  it('does not install behavior when behavior helpers are declined', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'lean-app', '--no-behavior'], { cwd, reporter });

    const appRoot = join(cwd, 'lean-app');
    const packageJson = JSON.parse(await readFile(join(appRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const configSource = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(packageJson.dependencies?.['@vanrot/behavior']).toBeUndefined();
    expect(configSource).not.toContain('behavior:');
  });

  it('rejects unknown behavior helper names during create', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'bad-behavior-app', '--behavior', 'ghost-helper'], {
      cwd,
      reporter,
    });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Unknown behavior helper');
  });

  it('uses each published package version for registry dependencies', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'registry-app'], { cwd, reporter });
    const packageJson = JSON.parse(
      await readFile(join(cwd, 'registry-app', 'package.json'), 'utf8'),
    ) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(result.exitCode).toBe(0);
    expect(packageJson.dependencies).toMatchObject({
      '@vanrot/config': createRegistryDependencyVersion('@vanrot/config'),
      '@vanrot/runtime': createRegistryDependencyVersion('@vanrot/runtime'),
      '@vanrot/router': createRegistryDependencyVersion('@vanrot/router'),
      '@vanrot/ui': createRegistryDependencyVersion('@vanrot/ui'),
    });
    expect(packageJson.devDependencies).toMatchObject({
      '@vanrot/cli': createRegistryDependencyVersion('@vanrot/cli'),
      '@vanrot/forge': createRegistryDependencyVersion('@vanrot/forge'),
    });
  });

  it('creates Forge apps by default', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'forge-app'], { cwd, reporter });
    const appRoot = join(cwd, 'forge-app');
    const packageJson = JSON.parse(await readFile(join(appRoot, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    const configSource = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(configSource).toContain("engine: 'forge'");
    expect(packageJson.devDependencies).toMatchObject({
      '@vanrot/forge': createRegistryDependencyVersion('@vanrot/forge'),
    });
    expect(packageJson.scripts).toMatchObject({
      dev: 'vr dev',
      build: 'vr build',
    });
  });

  it('creates Vite apps when requested', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'vite-app', '--engine', 'vite'], { cwd, reporter });
    const appRoot = join(cwd, 'vite-app');
    const packageJson = JSON.parse(await readFile(join(appRoot, 'package.json'), 'utf8')) as {
      devDependencies: Record<string, string>;
    };
    const configSource = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(configSource).toContain("engine: 'vite'");
    expect(packageJson.devDependencies).toMatchObject({
      '@vanrot/vite-plugin': createRegistryDependencyVersion('@vanrot/vite-plugin'),
      vite: '^8.0.10',
    });
  });

  it('keeps route paths and labels in src/routes.ts', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'route-source-app'], { cwd, reporter });
    const appRoot = join(cwd, 'route-source-app');

    expect(result.exitCode).toBe(0);
    const routes = await readFile(join(appRoot, 'src', 'routes.ts'), 'utf8');
    const appTemplate = await readFile(join(appRoot, 'src', 'app', 'app.layout.html'), 'utf8');

    expect(routes).toContain("path: '/'");
    expect(routes).toContain("label: 'Home'");
    expect(routes).not.toContain("path: '/shop'");
    expect(routes).not.toContain("label: 'Cart'");
    expect(appTemplate).toContain('<vr-router></vr-router>');
    expect(appTemplate).not.toContain('href="/');
    expect(appTemplate).not.toContain('>Shop<');
    expect(appTemplate).not.toContain('>Cart<');
  });

  it('scaffolds a single welcome route without shop or cart literals', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'welcome-route-app'], { cwd, reporter });
    const appRoot = join(cwd, 'welcome-route-app');
    const routesSource = await readFile(join(appRoot, 'src', 'routes.ts'), 'utf8');
    const appLayout = await readFile(join(appRoot, 'src', 'app', 'app.layout.html'), 'utf8');
    const homePage = await readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.html'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(routesSource).toContain('const routes = createRoutes();');
    expect(routesSource).toContain('const home = routes.page({');
    expect(routesSource).toContain('nav: routes.nav.primary(),');
    expect(routesSource).not.toContain('routes.layout');
    expect(routesSource).not.toContain('shop');
    expect(routesSource).not.toContain('cart');
    expect(appLayout).toContain('<vr-router></vr-router>');
    expect(appLayout).not.toContain('<nav');
    expect(homePage).toContain('{{ appName }}');
    expect(homePage).not.toContain('Shop');
    expect(homePage).not.toContain('Cart');
    await expect(
      readFile(join(appRoot, 'src', 'layouts', 'shop', 'shop.layout.html'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(join(appRoot, 'src', 'pages', 'shop', 'shop.page.html'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(join(appRoot, 'src', 'pages', 'cart', 'cart.page.html'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('uses workspace dependencies for fixture mode', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'fixture-app', '--workspace'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const packageJson = await readFile(join(cwd, 'fixture-app', 'package.json'), 'utf8');
    expect(packageJson).toContain('"@vanrot/runtime": "workspace:*"');
    expect(packageJson).toContain('"@vanrot/router": "workspace:*"');
    expect(packageJson).toContain('"@vanrot/forge": "workspace:*"');
    expect(packageJson).toContain('"@vanrot/cli": "workspace:*"');
  });

  it('includes Vanrot UI tokens without adding button files by default', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'ui-ready-app', '--workspace'], { cwd, reporter });
    const appRoot = join(cwd, 'ui-ready-app');

    expect(result.exitCode).toBe(0);

    const packageJson = await readFile(join(appRoot, 'package.json'), 'utf8');
    const main = await readFile(join(appRoot, 'src', 'main.ts'), 'utf8');
    const tokens = await readFile(join(appRoot, 'src', 'styles', 'vanrot-tokens.css'), 'utf8');
    const vanrotstyles = await readFile(join(appRoot, 'src', 'styles', 'vanrotstyles.css'), 'utf8');
    const homePageTs = await readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.ts'), 'utf8');
    const homePageHtml = await readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.html'), 'utf8');

    expect(packageJson).toContain('"@vanrot/ui": "workspace:*"');
    expect(main).toContain("import './styles/vanrot-tokens.css';");
    expect(main).toContain("import './styles/vanrotstyles.css';");
    expect(tokens).toContain('--vr-color-surface');
    expect(tokens).toContain('--vr-radius-md');
    expect(vanrotstyles).toContain('@layer vanrotstyles');
    expect(homePageTs).toContain("appName = 'ui-ready-app';");
    expect(homePageHtml).toContain('{{ appName }}');
    expect(homePageHtml).toContain("{{ t('home.summary') }}");

    await expect(readFile(join(appRoot, 'src', 'ui', 'button', 'ui.button.ts'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  it('does not overwrite non-empty directories without --force', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();
    const target = join(cwd, 'existing');
    await mkdir(target);
    await writeFile(join(target, 'keep.txt'), 'do not delete');

    const result = await runCli(['create', 'existing'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Target directory is not empty');
    await expect(readFile(join(target, 'keep.txt'), 'utf8')).resolves.toBe('do not delete');
  });

  it('creates vanrot.config.ts with canonical defaults', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'config-app'], { cwd, reporter });
    const appRoot = join(cwd, 'config-app');

    expect(result.exitCode).toBe(0);
    const source = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');
    expect(source).toContain("import { defineVanrotConfig } from '@vanrot/config';");
    expect(source).toContain('export default defineVanrotConfig({');
    expect(source).toContain('schemaVersion: 1');
    expect(source).toContain("engine: 'forge'");
    expect(source).toContain("root: 'src'");
    expect(source).toContain('port: 1964');
    expect(source).toContain("ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' },");
  });

  it('can create into an existing directory with --force', async () => {
    const cwd = await tempRoot();
    const target = join(cwd, 'forced');
    await mkdir(target);
    await writeFile(join(target, 'old.txt'), 'old');
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'forced', '--force'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const files = await readdir(target);
    expect(files).toContain('package.json');
    expect(files).toContain('old.txt');
  });
});
