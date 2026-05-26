import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
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
      '"@vanrot/router": "^0.1.0"',
    );
    await expect(readFile(join(appRoot, 'package.json'), 'utf8')).resolves.toContain('"dev": "vr dev"');
    await expect(readFile(join(appRoot, 'vite.config.ts'), 'utf8')).resolves.toContain(
      '@vanrot/vite-plugin',
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
    await expect(readFile(join(appRoot, 'src', 'routes.ts'), 'utf8')).resolves.toContain(
      "import { ShopLayout } from './layouts/shop/shop.layout.ts';",
    );
    await expect(readFile(join(appRoot, 'src', 'routes.ts'), 'utf8')).resolves.not.toContain(
      '@ts-expect-error',
    );
    await expect(
      readFile(join(appRoot, 'src', 'app', 'app.layout.ts'), 'utf8'),
    ).resolves.toContain('route = appRoute;');
    await expect(
      readFile(join(appRoot, 'src', 'app', 'app.layout.html'), 'utf8'),
    ).resolves.toContain('<vr route.home />');
    await expect(
      readFile(join(appRoot, 'src', 'app', 'app.layout.html'), 'utf8'),
    ).resolves.toContain('<vr-router></vr-router>');
    await expect(
      readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.ts'), 'utf8'),
    ).resolves.toContain('export class HomePage');
    await expect(
      readFile(join(appRoot, 'src', 'pages', 'cart', 'cart.page.ts'), 'utf8'),
    ).resolves.toContain('export class CartPage');
    await expect(readFile(join(appRoot, 'src', 'app', 'app.layout.css'), 'utf8')).resolves.toContain(
      '.app',
    );
    expect(reporter.output()).toContain('Created demo-app');
    expect(reporter.output()).toContain('vr dev');
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
    expect(routes).toContain("path: '/shop'");
    expect(routes).toContain("path: 'cart'");
    expect(routes).toContain("label: 'Home'");
    expect(routes).toContain("label: 'Shop'");
    expect(routes).toContain("label: 'Cart'");
    expect(appTemplate).toContain('<vr route.home />');
    expect(appTemplate).toContain('<vr route.shop />');
    expect(appTemplate).toContain('<vr route.cart />');
    expect(appTemplate).not.toContain('href="/');
    expect(appTemplate).not.toContain('>Home<');
    expect(appTemplate).not.toContain('>Shop<');
    expect(appTemplate).not.toContain('>Cart<');
  });

  it('creates Phase 15B route layouts without route literals outside src/routes.ts', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'nested-router-app'], { cwd, reporter });
    const appRoot = join(cwd, 'nested-router-app');
    const routesSource = await readFile(join(appRoot, 'src', 'routes.ts'), 'utf8');
    const appLayout = await readFile(join(appRoot, 'src', 'app', 'app.layout.html'), 'utf8');
    const shopLayout = await readFile(
      join(appRoot, 'src', 'layouts', 'shop', 'shop.layout.html'),
      'utf8',
    );
    const homePage = await readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.html'), 'utf8');
    const cartPage = await readFile(join(appRoot, 'src', 'pages', 'cart', 'cart.page.html'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(routesSource).toContain('const routes = createRoutes();');
    expect(routesSource).toContain('const shop = routes.layout({');
    expect(routesSource).toContain('const shopIndex = shop.page({');
    expect(routesSource).toContain('const cart = shop.page({');
    expect(routesSource).toContain('nav: routes.nav.primary(),');
    expect(routesSource).toContain('nav: routes.nav.hidden(),');
    expect(appLayout).toContain('<vr-router></vr-router>');
    expect(shopLayout).toContain('<vr-outlet></vr-outlet>');
    expect(homePage).not.toContain('/shop');
    expect(homePage).not.toContain('Shop');
    expect(cartPage).not.toContain('/shop');
    expect(cartPage).not.toContain('Cart');
  });

  it('uses workspace dependencies for fixture mode', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'fixture-app', '--workspace'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const packageJson = await readFile(join(cwd, 'fixture-app', 'package.json'), 'utf8');
    expect(packageJson).toContain('"@vanrot/runtime": "workspace:*"');
    expect(packageJson).toContain('"@vanrot/router": "workspace:*"');
    expect(packageJson).toContain('"@vanrot/vite-plugin": "workspace:*"');
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
    expect(homePageTs).toContain("'home.cta': 'Start building'");
    expect(homePageHtml).toContain("{{ t('home.title') }}");
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
    expect(source).toContain("root: 'src'");
    expect(source).toContain('port: 1990');
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
