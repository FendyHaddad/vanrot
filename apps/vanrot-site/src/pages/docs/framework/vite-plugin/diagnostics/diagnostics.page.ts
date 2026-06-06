import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const vitePluginDiagnosticsArticle = {
  "key": "vitePluginDiagnostics",
  "section": "framework",
  "path": "/docs/vite-plugin/diagnostics",
  "label": "Diagnostics",
  "title": "Vite Plugin Diagnostics",
  "summary": "Diagnostics from project configuration and Vanrot compilation are surfaced through Vite errors and warnings so integration failures are visible during dev and build.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "config-diagnostics",
      "title": "Config diagnostics",
      "body": "The plugin loads Vanrot project configuration during config and configResolved. Configuration diagnostics are formatted before transforms start. Errors throw during config resolution, while warnings are passed to Vite's logger so setup problems are visible before a role file is compiled.",
      "points": [
        "Config errors fail plugin setup.",
        "Config warnings use Vite's logger.",
        "The normalized source root is updated only after configuration is loaded."
      ],
      "code": {
        "title": "Minimal setup path",
        "code": "import { defineConfig } from 'vite';\nimport vanrot from '@vanrot/vite-plugin';\n\nexport default defineConfig({\n  plugins: [vanrot()],\n});"
      }
    },
    {
      "id": "compile-diagnostics",
      "title": "Compile diagnostics",
      "body": "When a role file compiles, diagnostics returned by @vanrot/compiler are formatted for the Vite plugin context. Error diagnostics call this.error so Vite stops the current transform, and warning diagnostics call this.warn so the developer sees the issue without losing the rest of the build.",
      "points": [
        "Compiler errors block the transformed module.",
        "Compiler warnings remain visible in dev and build output.",
        "Diagnostics belong to the owner role file even when the source issue came from a sibling template or style file."
      ]
    },
    {
      "id": "debugging-response",
      "title": "Debugging response",
      "body": "Treat plugin diagnostics as a map back to source files, not as a generated-code problem. Check the role file, the matching HTML template, and the matching CSS file together because the plugin compiles all three through one owner module.",
      "points": [
        "Start with the first error diagnostic because Vite may stop that transform immediately.",
        "Fix warning diagnostics before production builds so generated behavior stays predictable.",
        "If diagnostics mention configuration, inspect project config before editing component code."
      ],
      "code": {
        "title": "Owner files to inspect",
        "code": "src/app/app.component.ts\nsrc/app/app.component.html\nsrc/app/app.component.css"
      }
    }
  ]
} as const;

const sectionLinks = vitePluginDiagnosticsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DiagnosticsPage {
  title(): string {
    return vitePluginDiagnosticsArticle.title;
  }

  summary(): string {
    return vitePluginDiagnosticsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = vitePluginDiagnosticsArticle.sections[0].body;
  section1Body = vitePluginDiagnosticsArticle.sections[1].body;
  section2Body = vitePluginDiagnosticsArticle.sections[2].body;
  section0Points = vitePluginDiagnosticsArticle.sections[0].points ?? [];
  section1Points = vitePluginDiagnosticsArticle.sections[1].points ?? [];
  section2Points = vitePluginDiagnosticsArticle.sections[2].points ?? [];
  section0Code = vitePluginDiagnosticsArticle.sections[0].code?.code ?? '';
  section2Code = vitePluginDiagnosticsArticle.sections[2].code?.code ?? '';
}
