import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const vitePluginSetupArticle = {
  "key": "vitePluginSetup",
  "section": "framework",
  "path": "/docs/vite-plugin/setup",
  "label": "Setup",
  "title": "Vite Plugin Setup",
  "summary": "Setup connects @vanrot/vite-plugin to Vite so Vanrot role files compile during development and production builds.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "install-and-register",
      "title": "Install and register",
      "body": "A Vanrot app uses the Vite plugin from the application vite.config.ts. That is the only place the integration should be registered. Once the plugin is in the Vite plugins array, role files can stay focused on component state, templates can stay in HTML files, and scoped CSS can stay in matching CSS siblings.",
      "points": [
        "Import the default vanrot function from @vanrot/vite-plugin.",
        "Register vanrot() in the Vite plugins array.",
        "Keep the config near other build-level concerns instead of importing the plugin from application code."
      ],
      "code": {
        "title": "vite.config.ts",
        "code": "import { defineConfig } from 'vite';\nimport vanrot from '@vanrot/vite-plugin';\n\nexport default defineConfig({\n  plugins: [vanrot()],\n});"
      }
    },
    {
      "id": "project-config-handshake",
      "title": "Project config handshake",
      "body": "During config and configResolved, the plugin reads the Vanrot project configuration from the Vite root. The resolved source root becomes part of the default include pattern, and router polish config is exposed as a build-time define so runtime routing behavior can stay driven by the project config.",
      "points": [
        "The plugin uses the Vite root unless a plugin root option overrides it.",
        "The source root from project config scopes which role files compile by default.",
        "Configuration diagnostics are emitted before transforms so invalid setup fails early."
      ]
    },
    {
      "id": "application-entry",
      "title": "Application entry",
      "body": "After setup, application entry files import compiled role modules the same way they import normal TypeScript modules. The plugin intercepts matching role files, compiles them, and hands Vite a module that exports the compiled component object while still preserving the default import shape expected by Vanrot examples.",
      "points": [
        "Do not manually import generated files from application entrypoints.",
        "Use the route, runtime, and UI APIs as normal framework imports.",
        "Let Vite request the role file and let the plugin provide the compiled module."
      ],
      "code": {
        "title": "main.ts",
        "code": "import { mount } from '@vanrot/runtime';\nimport { App } from './app/app.component.ts';\n\nmount(App, document.querySelector('#app'));"
      }
    }
  ]
} as const;

const sectionLinks = vitePluginSetupArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class SetupPage {
  title(): string {
    return vitePluginSetupArticle.title;
  }

  summary(): string {
    return vitePluginSetupArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = vitePluginSetupArticle.sections[0].body;
  section1Body = vitePluginSetupArticle.sections[1].body;
  section2Body = vitePluginSetupArticle.sections[2].body;
  section0Points = vitePluginSetupArticle.sections[0].points ?? [];
  section1Points = vitePluginSetupArticle.sections[1].points ?? [];
  section2Points = vitePluginSetupArticle.sections[2].points ?? [];
  section0Code = vitePluginSetupArticle.sections[0].code?.code ?? '';
  section2Code = vitePluginSetupArticle.sections[2].code?.code ?? '';
}
