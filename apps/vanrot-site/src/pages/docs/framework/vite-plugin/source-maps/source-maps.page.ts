import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const vitePluginSourceMapsArticle = {
  "key": "vitePluginSourceMaps",
  "section": "framework",
  "path": "/docs/vite-plugin/source-maps",
  "label": "Source Maps",
  "title": "Vite Plugin Source Maps",
  "summary": "Source maps connect generated Vanrot JavaScript and CSS back to template, style, and role-file source positions.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "javascript-maps",
      "title": "JavaScript maps",
      "body": "The transform result includes a Vite-compatible source map for generated JavaScript. The plugin receives source mappings from @vanrot/compiler, filters them to JavaScript mappings, encodes VLQ segments, and returns the map next to generated component code.",
      "points": [
        "Generated JavaScript maps are returned from the transform hook.",
        "Mappings are sorted by generated line and column before encoding.",
        "The source list is built from compiler source file paths."
      ],
      "code": {
        "title": "Enable Vite sourcemaps",
        "code": "import { defineConfig } from 'vite';\nimport vanrot from '@vanrot/vite-plugin';\n\nexport default defineConfig({\n  build: { sourcemap: true },\n  plugins: [vanrot()],\n});"
      }
    },
    {
      "id": "css-maps",
      "title": "CSS maps",
      "body": "Generated CSS maps are cached beside generated CSS for each owner role file. During load, the CSS virtual module can return both CSS code and its map. During bundle generation, the plugin can also create a CSS bundle map when Vite build sourcemaps are enabled and no CSS map already exists.",
      "points": [
        "CSS virtual modules return a map from the per-component cache.",
        "generateBundle skips CSS map work when Vite build.sourcemap is disabled.",
        "A sourceMappingURL comment is appended only when a CSS map asset is emitted."
      ]
    },
    {
      "id": "debugging-with-maps",
      "title": "Debugging with maps",
      "body": "Use source maps when a browser stack trace or CSS inspection points at generated code. The plugin's maps are designed to carry you back to Vanrot source files so you can fix the role file, HTML template, or scoped CSS instead of reverse engineering generated output.",
      "points": [
        "Keep sourcemaps on for debugging production-only rendering bugs.",
        "Inspect both JavaScript and CSS maps when a visual defect crosses template and style boundaries.",
        "If a map has no sources, the plugin skips emitting a useless CSS map asset."
      ]
    }
  ]
} as const;

const sectionLinks = vitePluginSourceMapsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class SourceMapsPage {
  title(): string {
    return vitePluginSourceMapsArticle.title;
  }

  summary(): string {
    return vitePluginSourceMapsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = vitePluginSourceMapsArticle.sections[0].body;
  section1Body = vitePluginSourceMapsArticle.sections[1].body;
  section2Body = vitePluginSourceMapsArticle.sections[2].body;
  section0Points = vitePluginSourceMapsArticle.sections[0].points ?? [];
  section1Points = vitePluginSourceMapsArticle.sections[1].points ?? [];
  section2Points = vitePluginSourceMapsArticle.sections[2].points ?? [];
  section0Code = vitePluginSourceMapsArticle.sections[0].code?.code ?? '';
}
