import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const vitePluginTransformArticle = {
  "key": "vitePluginTransform",
  "section": "framework",
  "path": "/docs/vite-plugin/role-file-transform",
  "label": "Role File Transform",
  "title": "Vite Plugin Role File Transform",
  "summary": "The role-file transform compiles Vanrot component, page, layout, and button files into Vite modules with generated JavaScript, CSS, diagnostics, and source maps.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "role-file-contract",
      "title": "Role file contract",
      "body": "A role file is the TypeScript owner for a Vanrot view. When Vite asks for a matching .component.ts, .page.ts, .layout.ts, or .button.ts module, the plugin resolves the matching HTML and CSS siblings, adds those siblings to Vite's watch graph, and sends the owner file to @vanrot/compiler.",
      "points": [
        "The owner TypeScript file is the module imported by application code.",
        "The matching HTML file supplies template markup.",
        "The matching CSS file supplies scoped styles for the generated component."
      ],
      "code": {
        "title": "Owner role file",
        "code": "import { signal } from '@vanrot/runtime';\n\nexport class CounterComponent {\n  readonly count = signal(0);\n\n  increment(): void {\n    this.count.update((value) => value + 1);\n  }\n}"
      }
    },
    {
      "id": "compiled-module-shape",
      "title": "Compiled module shape",
      "body": "The compiled module imports its generated virtual CSS, includes the JavaScript returned by @vanrot/compiler, creates the component object, exports it under the compiler-provided component name, and also exports it as default. That shape lets examples, routes, and application entrypoints import role files predictably.",
      "points": [
        "The CSS import keeps scoped style delivery attached to the component module.",
        "The named export uses compiler metadata so generated names stay stable.",
        "The default export gives application code a simple component import path."
      ],
      "code": {
        "title": "Generated module shape",
        "code": "import 'virtual:vanrot-css:%2Frepo%2Fsrc%2Fcounter.component.ts';\n\nfunction createComponent() {\n  // Generated DOM creation lives here.\n}\n\nconst component = { createComponent };\nexport { component as CounterComponent };\nexport default component;"
      }
    },
    {
      "id": "transform-filtering",
      "title": "Transform filtering",
      "body": "The plugin only compiles files that pass include and exclude checks and are recognized as component entries. Virtual Vanrot module ids are ignored by the role-file filter so CSS and original-source virtual modules can be resolved and loaded through their own branch of the plugin.",
      "points": [
        "include must match the cleaned module id before compilation starts.",
        "exclude wins after include and can remove generated, test, or fixture files.",
        "virtual:vanrot-* and resolved \\0vanrot:* ids are handled separately from role-file transforms."
      ],
      "code": {
        "title": "Narrow the transform set",
        "code": "import vanrot from '@vanrot/vite-plugin';\n\nexport default {\n  plugins: [\n    vanrot({\n      include: [/\\.component\\.ts$/, /\\.page\\.ts$/],\n      exclude: [/\\.fixture\\.component\\.ts$/],\n    }),\n  ],\n};"
      }
    }
  ]
} as const;

const sectionLinks = vitePluginTransformArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RoleFileTransformPage {
  title(): string {
    return vitePluginTransformArticle.title;
  }

  summary(): string {
    return vitePluginTransformArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = vitePluginTransformArticle.sections[0].body;
  section1Body = vitePluginTransformArticle.sections[1].body;
  section2Body = vitePluginTransformArticle.sections[2].body;
  section0Points = vitePluginTransformArticle.sections[0].points ?? [];
  section1Points = vitePluginTransformArticle.sections[1].points ?? [];
  section2Points = vitePluginTransformArticle.sections[2].points ?? [];
  section0Code = vitePluginTransformArticle.sections[0].code?.code ?? '';
  section1Code = vitePluginTransformArticle.sections[1].code?.code ?? '';
  section2Code = vitePluginTransformArticle.sections[2].code?.code ?? '';
}
