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
      path: 'src/main.ts',
      content: `import { mount } from '@vanrot/runtime';\nimport { provideRouter } from '@vanrot/router';\nimport { AppComponent } from './app/app.component.ts';\nimport { route as appRoute } from './routes.ts';\n${uiAppFile.tokenImport}\n\nconst target = document.getElementById('app');\n\nif (target === null) {\n  throw new Error('Missing #app mount target.');\n}\n\nprovideRouter(appRoute);\nmount(AppComponent, target);\n`,
    },
    {
      path: 'src/routes.ts',
      content: `import { defineRoutes } from '@vanrot/router';\nimport { HomePage } from './pages/home/home.page.ts';\n\nexport const route = defineRoutes({\n  home: {\n    path: '/',\n    label: 'Home',\n    page: HomePage,\n  },\n  about: {\n    path: '/about',\n    label: 'About',\n    loadPage: () => import('./pages/about/about.page.ts').then(({ AboutPage }) => AboutPage),\n  },\n});\n`,
    },
    {
      path: 'src/app/app.component.ts',
      content: `import { route as appRoute } from '../routes.ts';\n\nexport class AppComponent {\n  route = appRoute;\n}\n`,
    },
    {
      path: 'src/app/app.component.html',
      content: `<main class="app">\n  <nav class="app-nav">\n    <vr route.home />\n    <vr route.about />\n  </nav>\n\n  <vr-router></vr-router>\n</main>\n`,
    },
    {
      path: 'src/app/app.component.css',
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
      path: 'src/pages/about/about.page.ts',
      content: `export class AboutPage {}\n`,
    },
    {
      path: 'src/pages/about/about.page.html',
      content: `<section class="page">\n  <h1>About this app</h1>\n  <p>This page is lazy loaded through the route table.</p>\n</section>\n`,
    },
    {
      path: 'src/pages/about/about.page.css',
      content: `.page {\n  display: grid;\n  gap: 12px;\n}\n`,
    },
  ];
}
