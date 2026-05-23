import { uiAppFile } from '@vanrot/ui';
import { createStarterScripts } from '../commands/metadata.js';

export interface AppTemplateOptions {
  appName: string;
  workspace: boolean;
}

export interface TemplateFile {
  path: string;
  content: string;
}

export function createAppTemplate(options: AppTemplateOptions): TemplateFile[] {
  const dependencyVersion = options.workspace ? 'workspace:*' : '^0.1.0';

  return [
    {
      path: 'package.json',
      content: `${JSON.stringify(
        {
          name: options.appName,
          private: true,
          type: 'module',
          scripts: createStarterScripts(),
          dependencies: {
            '@vanrot/config': dependencyVersion,
            '@vanrot/runtime': dependencyVersion,
            '@vanrot/router': dependencyVersion,
            '@vanrot/ui': dependencyVersion,
          },
          devDependencies: {
            '@vanrot/cli': dependencyVersion,
            '@vanrot/vite-plugin': dependencyVersion,
            typescript: '^5.9.3',
            vite: '^8.0.10',
            vitest: '^4.0.14',
          },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: 'index.html',
      content: `<div id="app"></div>\n<script type="module" src="/src/main.ts"></script>\n`,
    },
    {
      path: 'tsconfig.json',
      content: `${JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            lib: ['ES2022', 'DOM'],
            strict: true,
            skipLibCheck: true,
            allowImportingTsExtensions: true,
          },
          include: ['src/**/*.ts'],
        },
        null,
        2,
      )}\n`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';\nimport vanrot from '@vanrot/vite-plugin';\n\nexport default defineConfig({\n  plugins: [vanrot()],\n});\n`,
    },
    {
      path: 'vanrot.config.ts',
      content:
        `import { defineVanrotConfig } from '@vanrot/config';\n\n` +
        `export default defineVanrotConfig({\n` +
        `  schemaVersion: 1,\n` +
        `  source: { root: 'src' },\n` +
        `  devServer: { port: 1010 },\n` +
        `});\n`,
    },
    {
      path: 'src/main.ts',
      content: `import { mount } from '@vanrot/runtime';\nimport { provideRouter } from '@vanrot/router';\nimport { AppLayout } from './app/app.layout.ts';\nimport { route as appRoute } from './routes.ts';\n${uiAppFile.tokenImport}\n\nconst target = document.getElementById('app');\n\nif (target === null) {\n  throw new Error('Missing #app mount target.');\n}\n\nprovideRouter(appRoute);\nmount(AppLayout, target);\n`,
    },
    {
      path: 'src/routes.ts',
      content: `import { createRoutes, defineRoutes } from '@vanrot/router';\nimport { HomePage } from './pages/home/home.page.ts';\nimport { ShopLayout } from './layouts/shop/shop.layout.ts';\nimport { ShopPage } from './pages/shop/shop.page.ts';\nimport { CartPage } from './pages/cart/cart.page.ts';\n\nconst routes = createRoutes();\n\nconst home = routes.page({\n  path: '/',\n  label: 'Home',\n  page: HomePage,\n  nav: routes.nav.primary(),\n});\n\nconst shop = routes.layout({\n  path: '/shop',\n  label: 'Shop',\n  layout: ShopLayout,\n  nav: routes.nav.primary(),\n});\n\nconst shopIndex = shop.page({\n  path: '',\n  label: 'Shop',\n  page: ShopPage,\n  nav: routes.nav.hidden(),\n});\n\nconst cart = shop.page({\n  path: 'cart',\n  label: 'Cart',\n  page: CartPage,\n  nav: routes.nav.primary(),\n});\n\nexport const route = defineRoutes({\n  home,\n  shop,\n  shopIndex,\n  cart,\n});\n`,
    },
    {
      path: 'src/app/app.layout.ts',
      content: `import { route as appRoute } from '../routes.ts';\n\nexport class AppLayout {\n  route = appRoute;\n}\n`,
    },
    {
      path: 'src/app/app.layout.html',
      content: `<main class="app">\n  <nav class="app-nav">\n    <vr route.home />\n    <vr route.shop />\n    <vr route.cart />\n  </nav>\n\n  <vr-router></vr-router>\n</main>\n`,
    },
    {
      path: 'src/app/app.layout.css',
      content: `.app {\n  display: grid;\n  gap: 24px;\n  padding: 32px;\n  font-family: system-ui, sans-serif;\n}\n\n.app-nav {\n  display: flex;\n  gap: 12px;\n}\n`,
    },
    {
      path: 'src/pages/home/home.page.ts',
      content: `const homeCopy = {\n  'home.title': 'Build with Vanrot',\n  'home.summary': 'Start with named routes, page files, and a small runtime foundation.',\n  'home.cta': 'Start building',\n} as const;\n\ntype HomeCopyKey = keyof typeof homeCopy;\n\nexport class HomePage {\n  t(key: HomeCopyKey): string {\n    return homeCopy[key];\n  }\n}\n`,
    },
    {
      path: 'src/pages/home/home.page.html',
      content: `<section class="page">\n  <h1>{{ t('home.title') }}</h1>\n  <p>{{ t('home.summary') }}</p>\n</section>\n`,
    },
    {
      path: 'src/pages/home/home.page.css',
      content: `.page {\n  display: grid;\n  gap: 12px;\n}\n`,
    },
    {
      path: 'src/layouts/shop/shop.layout.ts',
      content: `import { route as appRoute } from '../../routes.ts';\n\nexport class ShopLayout {\n  route = appRoute;\n}\n`,
    },
    {
      path: 'src/layouts/shop/shop.layout.html',
      content: `<section class="layout">\n  <nav class="layout-nav">\n    <vr route.shopIndex />\n    <vr route.cart />\n  </nav>\n\n  <vr-outlet></vr-outlet>\n</section>\n`,
    },
    {
      path: 'src/layouts/shop/shop.layout.css',
      content: `.layout {\n  display: grid;\n  gap: 16px;\n}\n\n.layout-nav {\n  display: flex;\n  gap: 12px;\n}\n`,
    },
    {
      path: 'src/pages/shop/shop.page.ts',
      content: `const shopCopy = {\n  'shop.title': 'Browse the catalog',\n  'shop.summary': 'Use the route layout to keep related screens together.',\n} as const;\n\ntype ShopCopyKey = keyof typeof shopCopy;\n\nexport class ShopPage {\n  t(key: ShopCopyKey): string {\n    return shopCopy[key];\n  }\n}\n`,
    },
    {
      path: 'src/pages/shop/shop.page.html',
      content: `<section class="page">\n  <h1>{{ t('shop.title') }}</h1>\n  <p>{{ t('shop.summary') }}</p>\n</section>\n`,
    },
    {
      path: 'src/pages/shop/shop.page.css',
      content: `.page {\n  display: grid;\n  gap: 12px;\n}\n`,
    },
    {
      path: 'src/pages/cart/cart.page.ts',
      content: `const cartCopy = {\n  'cart.title': 'Review your basket',\n  'cart.summary': 'This leaf screen renders inside the shared layout outlet.',\n} as const;\n\ntype CartCopyKey = keyof typeof cartCopy;\n\nexport class CartPage {\n  t(key: CartCopyKey): string {\n    return cartCopy[key];\n  }\n}\n`,
    },
    {
      path: 'src/pages/cart/cart.page.html',
      content: `<section class="page">\n  <h1>{{ t('cart.title') }}</h1>\n  <p>{{ t('cart.summary') }}</p>\n</section>\n`,
    },
    {
      path: 'src/pages/cart/cart.page.css',
      content: `.page {\n  display: grid;\n  gap: 12px;\n}\n`,
    },
  ];
}
