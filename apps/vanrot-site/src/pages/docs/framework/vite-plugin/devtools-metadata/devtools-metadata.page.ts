import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const vitePluginDevtoolsMetadataArticle = {
  "key": "vitePluginDevtoolsMetadata",
  "section": "framework",
  "path": "/docs/vite-plugin/devtools-metadata",
  "label": "Devtools Metadata",
  "title": "Vite Plugin Devtools Metadata",
  "summary": "The devtools metadata endpoint lets local tooling read Vanrot graph metadata from the Vite dev server.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "metadata-endpoint",
      "title": "Metadata endpoint",
      "body": "In development, the plugin registers middleware for /__vanrot/devtools/metadata. When that URL is requested, the plugin reads the project graph manifest from the Vite root, wraps it with the endpoint name, and returns JSON for devtools consumers.",
      "points": [
        "The endpoint is registered through Vite dev-server middleware.",
        "The response content type is application/json with UTF-8.",
        "Requests for other URLs continue to the next middleware."
      ],
      "code": {
        "title": "Read metadata",
        "code": "const response = await fetch('/__vanrot/devtools/metadata');\nconst graph = await response.json();\n\nconsole.log(graph.endpoint);"
      }
    },
    {
      "id": "graph-source",
      "title": "Graph source",
      "body": "The endpoint does not invent a separate Vite-only graph. It reads the normalized Vanrot project graph manifest through @vanrot/devtools/node, which keeps devtools, generated metadata, and documentation-oriented graph views aligned around the same project facts.",
      "points": [
        "The Vite root decides which project graph manifest is read.",
        "The response extends the normalized graph manifest shape.",
        "Tooling can use the endpoint without importing Node-only graph readers in browser code."
      ],
      "code": {
        "title": "Plugin registration",
        "code": "import { defineConfig } from 'vite';\nimport vanrot from '@vanrot/vite-plugin';\n\nexport default defineConfig({\n  plugins: [vanrot()],\n});"
      }
    },
    {
      "id": "devtools-use",
      "title": "Devtools use",
      "body": "Use the endpoint when a local tool needs to inspect Vanrot components, routes, diagnostics, or graph metadata through the running Vite server. Keep it as a local development integration point; production apps should rely on built assets and generated metadata rather than serving the dev endpoint.",
      "points": [
        "Fetch the endpoint from the same dev server that serves the application.",
        "Handle missing or stale graph data as a tooling state, not an application runtime failure.",
        "Use the graph response to power inspection features instead of scraping generated modules."
      ]
    }
  ]
} as const;

const sectionLinks = vitePluginDevtoolsMetadataArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DevtoolsMetadataPage {
  title(): string {
    return vitePluginDevtoolsMetadataArticle.title;
  }

  summary(): string {
    return vitePluginDevtoolsMetadataArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = vitePluginDevtoolsMetadataArticle.sections[0].body;
  section1Body = vitePluginDevtoolsMetadataArticle.sections[1].body;
  section2Body = vitePluginDevtoolsMetadataArticle.sections[2].body;
  section0Points = vitePluginDevtoolsMetadataArticle.sections[0].points ?? [];
  section1Points = vitePluginDevtoolsMetadataArticle.sections[1].points ?? [];
  section2Points = vitePluginDevtoolsMetadataArticle.sections[2].points ?? [];
  section0Code = vitePluginDevtoolsMetadataArticle.sections[0].code?.code ?? '';
  section1Code = vitePluginDevtoolsMetadataArticle.sections[1].code?.code ?? '';
}
