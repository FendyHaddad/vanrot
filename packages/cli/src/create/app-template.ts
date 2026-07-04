import {
  renderCanonicalVanrotConfig,
  vanrotEngine,
  type VanrotBehaviorName,
  type VanrotEngine,
} from '@vanrot/config';
import { uiAppFile } from '@vanrot/ui';
import { createStarterScripts, vanrotSitePath, vanrotSiteUrl } from '../commands/metadata.js';
import { createRegistryDependencyVersion, type CreatePackageName } from './package-versions.js';
import { generatedSeoUtilitySource, seoCliPackageName, seoCliUtilityPath } from '../seo/constants.js';
import { type CreateSeoSelection } from '../seo/create-seo.js';
import { renderSeoConfigSource } from '../seo/add-seo.js';

export interface AppTemplateOptions {
  appName: string;
  workspace: boolean;
  engine: VanrotEngine;
  behavior: VanrotBehaviorName[];
  seo: CreateSeoSelection;
}

export interface TemplateFile {
  path: string;
  content: string;
}

export function createAppTemplate(options: AppTemplateOptions): TemplateFile[] {
  const dependencyVersionFor = (name: CreatePackageName): string =>
    options.workspace ? 'workspace:*' : createRegistryDependencyVersion(name);
  const dependencies: Record<string, string> = {
    '@vanrot/config': dependencyVersionFor('@vanrot/config'),
    '@vanrot/formatters': dependencyVersionFor('@vanrot/formatters'),
    '@vanrot/runtime': dependencyVersionFor('@vanrot/runtime'),
    '@vanrot/router': dependencyVersionFor('@vanrot/router'),
    '@vanrot/ui': dependencyVersionFor('@vanrot/ui'),
  };

  if (options.behavior.length > 0) {
    dependencies['@vanrot/behavior'] = dependencyVersionFor('@vanrot/behavior');
  }

  if (options.seo.enabled) {
    dependencies[seoCliPackageName] = dependencyVersionFor(seoCliPackageName);
  }

  const template: TemplateFile[] = [
    {
      path: 'package.json',
      content: `${JSON.stringify(
        {
          name: options.appName,
          private: true,
          type: 'module',
          scripts: createStarterScripts(),
          dependencies,
          devDependencies: createStarterDevDependencies(options.engine, dependencyVersionFor),
        },
        null,
        2,
      )}\n`,
    },
    {
      path: 'index.html',
      content: `${uiAppFile.faviconLink}\n<div id="app"></div>\n<script type="module" src="/src/main.ts"></script>\n`,
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
      path: 'vanrot.config.ts',
      content: renderAppConfig(options.engine, options.behavior, options.seo),
    },
    {
      path: 'src/main.ts',
      content: `import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
import { AppLayout } from './app/app.layout.ts';
import { route as appRoute } from './routes.ts';
${uiAppFile.tokenImport}
${uiAppFile.vanrotstylesImport}

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

provideRouter(appRoute);
mount(AppLayout, target);
`,
    },
    {
      path: 'src/routes.ts',
      content: `import { createRoutes, defineRoutes } from '@vanrot/router';
import { HomePage } from './pages/home/home.page.ts';

const routes = createRoutes();

const home = routes.page({
  path: '/',
  label: 'Home',
  page: HomePage,
  nav: routes.nav.primary(),
});

export const route = defineRoutes({
  home,
});
`,
    },
    {
      path: 'src/app/app.layout.ts',
      content: `import { route as appRoute } from '../routes.ts';

export class AppLayout {
  route = appRoute;
}
`,
    },
    {
      path: 'src/app/app.layout.html',
      content: `<main class="app">
  <vr-router></vr-router>
</main>
`,
    },
    {
      path: 'src/app/app.layout.css',
      content: `.app {
  min-height: 100vh;
  font-family: var(--vr-font-sans);
}
`,
    },
    {
      path: 'src/pages/home/home.page.ts',
      content: `const homeCopy = {
  'home.badge': 'Dev server running',
  'home.greeting': 'Welcome to',
  'home.summary': 'Your signal-based app is live. Edit src/pages/home/home.page.html and save - changes appear instantly.',
  'home.editTitle': 'Edit this page',
  'home.editBody': 'The home trio lives together: home.page.ts, home.page.html, home.page.css.',
  'home.generateTitle': 'Generate a component',
  'home.generateBody': 'vr generate component card',
  'home.routeTitle': 'Add a route',
  'home.routeBody': 'Define it once in src/routes.ts.',
  'home.doctorTitle': 'Check your setup',
  'home.doctorBody': 'vr doctor validates config, routes, and conventions.',
  'home.docs': 'Documentation',
  'home.components': 'Components',
  'home.footer': 'This screen lives in src/pages/home - make it yours.',
} as const;

type HomeCopyKey = keyof typeof homeCopy;

const homeLink = {
  docs: '${vanrotSiteUrl}${vanrotSitePath.docs}',
  components: '${vanrotSiteUrl}${vanrotSitePath.components}',
} as const;

export class HomePage {
  appName = '${options.appName}';
  link = homeLink;

  t(key: HomeCopyKey): string {
    return homeCopy[key];
  }
}
`,
    },
    {
      path: 'src/pages/home/home.page.html',
      content: `<section class="welcome">
  <div class="welcome-bg" aria-hidden="true"></div>
  <div class="welcome-wash" aria-hidden="true"></div>

  <div class="welcome-inner">
    <div class="welcome-hero">
      <div class="welcome-logo">V</div>
      <div class="welcome-badge"><span class="welcome-dot"></span>{{ t('home.badge') }}</div>
      <h1 class="welcome-title">{{ t('home.greeting') }} <span class="welcome-name">{{ appName }}</span></h1>
      <p class="welcome-summary">{{ t('home.summary') }}</p>
      <div class="welcome-actions">
        <a class="welcome-action welcome-action-primary" [href]="link.docs">{{ t('home.docs') }}</a>
        <a class="welcome-action" [href]="link.components">{{ t('home.components') }}</a>
      </div>
    </div>

    <div class="welcome-grid">
      <article class="welcome-card">
        <span class="welcome-card-kicker">01</span>
        <h2>{{ t('home.editTitle') }}</h2>
        <p>{{ t('home.editBody') }}</p>
      </article>
      <article class="welcome-card">
        <span class="welcome-card-kicker">02</span>
        <h2>{{ t('home.generateTitle') }}</h2>
        <p>{{ t('home.generateBody') }}</p>
      </article>
      <article class="welcome-card">
        <span class="welcome-card-kicker">03</span>
        <h2>{{ t('home.routeTitle') }}</h2>
        <p>{{ t('home.routeBody') }}</p>
      </article>
      <article class="welcome-card welcome-card-accent">
        <span class="welcome-card-kicker">04</span>
        <h2>{{ t('home.doctorTitle') }}</h2>
        <p>{{ t('home.doctorBody') }}</p>
      </article>
    </div>
  </div>

  <footer class="welcome-footer">{{ t('home.footer') }}</footer>
</section>
`,
    },
    {
      path: 'src/pages/home/home.page.css',
      content: `.welcome {
  --welcome-black: #09090b;
  --welcome-orange: #f97316;
  position: relative;
  isolate: isolate;
  min-height: 100vh;
  overflow: hidden;
  background: var(--welcome-black);
  color: var(--vr-color-text);
  padding: var(--vr-space-8);
}

.welcome-bg,
.welcome-wash {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.welcome-bg {
  z-index: -2;
  background:
    linear-gradient(90deg, rgba(249, 115, 22, 0.14) 1px, transparent 1px),
    linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.5;
}

.welcome-wash {
  z-index: -1;
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.18), var(--welcome-black) 62%);
}

.welcome-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  gap: var(--vr-space-8);
  align-items: center;
  max-width: 1120px;
  min-height: calc(100vh - (var(--vr-space-8) * 2));
  margin: 0 auto;
}

.welcome-hero,
.welcome-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(9, 9, 11, 0.74);
  box-shadow: var(--vr-shadow-3);
}

.welcome-hero {
  display: grid;
  gap: var(--vr-space-5);
  padding: 64px;
}

.welcome-logo {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--vr-radius-md);
  background: var(--welcome-orange);
  color: var(--welcome-black);
  font-weight: 800;
}

.welcome-badge,
.welcome-actions,
.welcome-card-kicker {
  display: flex;
  align-items: center;
}

.welcome-badge {
  gap: var(--vr-space-2);
  width: fit-content;
  border: 1px solid rgba(249, 115, 22, 0.42);
  border-radius: var(--vr-radius-full);
  padding: var(--vr-space-2) var(--vr-space-4);
  color: var(--welcome-orange);
  font-size: 0.875rem;
}

.welcome-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--vr-radius-full);
  background: var(--welcome-orange);
}

.welcome-title {
  max-width: 780px;
  margin: 0;
  font-size: 5rem;
  line-height: 0.95;
}

.welcome-name {
  color: var(--welcome-orange);
}

.welcome-summary {
  max-width: 680px;
  margin: 0;
  color: var(--vr-color-muted);
  font-size: 1.125rem;
  line-height: 1.7;
}

.welcome-actions {
  flex-wrap: wrap;
  gap: var(--vr-space-3);
}

.welcome-action {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--vr-radius-md);
  padding: var(--vr-space-3) var(--vr-space-5);
  color: var(--vr-color-text);
  text-decoration: none;
}

.welcome-action-primary {
  border-color: var(--welcome-orange);
  background: var(--welcome-orange);
  color: var(--welcome-black);
  font-weight: 700;
}

.welcome-grid {
  display: grid;
  gap: var(--vr-space-4);
}

.welcome-card {
  display: grid;
  gap: var(--vr-space-2);
  padding: var(--vr-space-5);
  border-radius: var(--vr-radius-md);
}

.welcome-card-accent {
  border-color: rgba(249, 115, 22, 0.56);
}

.welcome-card-kicker {
  color: var(--welcome-orange);
  font-size: 0.875rem;
  font-weight: 700;
}

.welcome-card h2,
.welcome-card p {
  margin: 0;
}

.welcome-card h2 {
  font-size: 1.25rem;
}

.welcome-card p {
  color: var(--vr-color-muted);
  line-height: 1.6;
}

.welcome-footer {
  max-width: 1120px;
  margin: var(--vr-space-6) auto 0;
  color: var(--vr-color-muted);
  font-size: 0.875rem;
}

@media (max-width: 860px) {
  .welcome {
    padding: var(--vr-space-5);
  }

  .welcome-inner {
    grid-template-columns: 1fr;
  }

  .welcome-hero {
    padding: var(--vr-space-6);
  }

  .welcome-title {
    font-size: 3rem;
  }
}
`,
    },
  ];

  if (options.engine === vanrotEngine.vite) {
    template.push({
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import vanrot from '@vanrot/vite-plugin';

export default defineConfig({
  plugins: [vanrot()],
});
`,
    });
  }

  if (options.seo.enabled) {
    template.push({
      path: seoCliUtilityPath,
      content: generatedSeoUtilitySource,
    });
  }

  return template;
}

function createStarterDevDependencies(
  engine: VanrotEngine,
  dependencyVersionFor: (name: CreatePackageName) => string,
): Record<string, string> {
  const devDependencies: Record<string, string> = {
    '@vanrot/cli': dependencyVersionFor('@vanrot/cli'),
    typescript: '^5.9.3',
    vitest: '^4.0.14',
  };

  if (engine === vanrotEngine.vite) {
    devDependencies['@vanrot/vite-plugin'] = dependencyVersionFor('@vanrot/vite-plugin');
    devDependencies.vite = '^8.0.10';
    return devDependencies;
  }

  devDependencies['@vanrot/forge'] = dependencyVersionFor('@vanrot/forge');
  return devDependencies;
}

function renderAppConfig(
  engine: VanrotEngine,
  behavior: readonly VanrotBehaviorName[],
  seo: CreateSeoSelection,
): string {
  const canonicalSource = renderCanonicalVanrotConfig().replace(
    "engine: 'forge'",
    `engine: '${engine}'`,
  );

  if (behavior.length === 0 && !seo.enabled) {
    return canonicalSource;
  }

  return canonicalSource.replace(
    '});\n',
    `${renderBehaviorConfig(behavior)}${renderCreateSeoConfig(seo)});\n`,
  );
}

function renderBehaviorConfig(behavior: readonly VanrotBehaviorName[]): string {
  if (behavior.length === 0) {
    return '';
  }

  const enabled = behavior.map((name) => `'${name}'`).join(', ');
  return `  behavior: {
    enabled: [${enabled}],
  },
`;
}

function renderCreateSeoConfig(seo: CreateSeoSelection): string {
  if (!seo.enabled) {
    return '';
  }

  return `  seo: ${renderSeoConfigSource(seo.siteUrl)},
`;
}
