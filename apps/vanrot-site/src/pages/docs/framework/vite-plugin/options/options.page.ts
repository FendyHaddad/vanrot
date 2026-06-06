import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const vitePluginOptionsArticle = {
  "key": "vitePluginOptions",
  "section": "framework",
  "path": "/docs/vite-plugin/options",
  "label": "Options",
  "title": "Vite Plugin Options",
  "summary": "VanrotPluginOptions control source matching, project root resolution, and source-root defaults for @vanrot/vite-plugin.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "options-shape",
      "title": "Options shape",
      "body": "The public options surface is intentionally small. include and exclude decide which module ids are transformed, root decides where Vanrot project configuration is loaded from, and sourceRoot adjusts the default include pattern when your application source lives somewhere other than src.",
      "points": [
        "include accepts one RegExp or an array of RegExp values.",
        "exclude accepts one RegExp or an array of RegExp values.",
        "root and sourceRoot are strings because they model project layout, not per-file behavior."
      ],
      "code": {
        "title": "Typed plugin options",
        "code": "import vanrot, { type VanrotPluginOptions } from '@vanrot/vite-plugin';\n\nconst pluginOptions: VanrotPluginOptions = {\n  sourceRoot: 'client',\n  include: [/component\\.ts$/, /page\\.ts$/, /layout\\.ts$/, /button\\.ts$/],\n  exclude: [/\\.spec\\.ts$/],\n};\n\nexport default {\n  plugins: [vanrot(pluginOptions)],\n};"
      }
    },
    {
      "id": "default-include",
      "title": "Default include",
      "body": "Without custom include patterns, the plugin compiles role files under the configured source root. The default suffix list covers component, page, layout, and button role files, which matches Vanrot file conventions and keeps plain helper modules out of the compiler pipeline.",
      "points": [
        "src/app.component.ts matches the default pattern.",
        "src/pages/home.page.ts matches the default pattern.",
        "src/app.ts does not match because it is not a Vanrot role file."
      ]
    },
    {
      "id": "root-and-source-root",
      "title": "Root and source root",
      "body": "Use root when Vite is executing from a different directory than the Vanrot project. Use sourceRoot when the application source folder is renamed. These two options solve different problems: root locates config and graph data, while sourceRoot narrows role-file matching.",
      "points": [
        "Prefer project config for long-lived sourceRoot choices.",
        "Use the plugin root option only when the Vite process root cannot be changed.",
        "Keep include patterns aligned with sourceRoot so role files are not compiled twice."
      ],
      "code": {
        "title": "Custom project layout",
        "code": "import { defineConfig } from 'vite';\nimport vanrot from '@vanrot/vite-plugin';\n\nexport default defineConfig({\n  root: process.cwd(),\n  plugins: [\n    vanrot({\n      root: process.cwd(),\n      sourceRoot: 'client',\n    }),\n  ],\n});"
      }
    }
  ]
} as const;

const sectionLinks = vitePluginOptionsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class OptionsPage {
  title(): string {
    return vitePluginOptionsArticle.title;
  }

  summary(): string {
    return vitePluginOptionsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = vitePluginOptionsArticle.sections[0].body;
  section1Body = vitePluginOptionsArticle.sections[1].body;
  section2Body = vitePluginOptionsArticle.sections[2].body;
  section0Points = vitePluginOptionsArticle.sections[0].points ?? [];
  section1Points = vitePluginOptionsArticle.sections[1].points ?? [];
  section2Points = vitePluginOptionsArticle.sections[2].points ?? [];
  section0Code = vitePluginOptionsArticle.sections[0].code?.code ?? '';
  section2Code = vitePluginOptionsArticle.sections[2].code?.code ?? '';
}
