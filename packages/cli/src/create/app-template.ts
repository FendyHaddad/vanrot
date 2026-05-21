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
          scripts: {
            dev: 'vr dev',
            build: 'vr build',
            test: 'vr test',
            doctor: 'vr doctor',
          },
          dependencies: {
            '@vanrot/runtime': dependencyVersion,
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
      content: `import { mount } from '@vanrot/runtime';\nimport App from './app/app.component.ts';\n\nconst target = document.getElementById('app');\n\nif (target === null) {\n  throw new Error('Missing #app mount target.');\n}\n\nmount(App, target);\n`,
    },
    {
      path: 'src/app/app.component.ts',
      content: `import { signal } from '@vanrot/runtime';\n\nexport class AppComponent {\n  title = signal('Vanrot');\n}\n`,
    },
    {
      path: 'src/app/app.component.html',
      content: `<main class="app">\n  <h1>{{ title() }}</h1>\n</main>\n`,
    },
    {
      path: 'src/app/app.component.css',
      content: `.app {\n  display: grid;\n  gap: 16px;\n  padding: 32px;\n  font-family: system-ui, sans-serif;\n}\n`,
    },
  ];
}
