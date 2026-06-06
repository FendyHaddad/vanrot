import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const devtoolsArticle = {
  "key": "devtools",
  "section": "framework",
  "path": "/docs/devtools",
  "label": "Devtools",
  "title": "Devtools And Project Intelligence",
  "summary": "@vanrot/devtools reads project map manifests, runtime graph metadata, Vite plugin metadata, panel state, stale-state diagnostics, and AI-adjacent project intelligence without becoming the source of truth.",
  "status": "production-ready-through-phase-23",
  "sections": [
    {
      "id": "devtools-boundary",
      "title": "Devtools boundary",
      "body": "Devtools sits on top of generated project intelligence and runtime metadata. It should inspect the application graph, route graph, compiler metadata, and runtime signal graph without changing normal application behavior.",
      "points": [
        "Use @vanrot/devtools types for graph contracts shared with CLI and Vite plugin output.",
        "Use normalizeGraphManifest before rendering graph data in a panel.",
        "Treat stale graph state as a diagnostic, not as missing UI."
      ],
      "code": {
        "title": "Normalize graph data",
        "code": "import { normalizeGraphManifest } from '@vanrot/devtools';\\n\\nconst graph = normalizeGraphManifest(rawProjectMap);\\nif (graph.status === 'ready') {\\n  renderGraph(graph.manifest.graph);\\n}"
      }
    },
    {
      "id": "graph-contracts",
      "title": "Graph contracts",
      "body": "The project graph describes role files, imports, routes, compiler metadata, AI rules, and stale state. Runtime graph metadata describes components, signals, computed values, effects, and dependency edges during development.",
      "points": [
        "projectMapGraphSchemaVersion identifies project map manifest shape.",
        "runtimeGraphSchemaVersion identifies runtime graph shape.",
        "Graph node and edge kinds should be extended deliberately because devtools panels depend on them."
      ]
    },
    {
      "id": "metadata-flow",
      "title": "Metadata flow",
      "body": "Metadata flows from CLI project map generation, Vite plugin endpoints, and runtime graph hooks into the devtools panel. Each producer owns freshness and shape; devtools owns normalization and presentation.",
      "points": [
        "Use vr map to refresh project graph data.",
        "Use the Vite metadata endpoint for development server metadata.",
        "Use runtime hooks only in development inspection paths."
      ]
    },
    {
      "id": "child-guides",
      "title": "Child guides",
      "body": "The child pages explain project maps, runtime graphs, Vite metadata, panel state, and stale-state diagnostics. Together they show how devtools reads the framework without becoming another configuration system.",
      "points": [
        "Start with Project Map to understand the manifest.",
        "Use Runtime Graph when inspecting signal and effect relationships.",
        "Use Stale State when project intelligence disagrees with source files."
      ]
    }
  ]
} as const;

const sectionLinks = devtoolsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DevtoolsPage {
  title(): string {
    return devtoolsArticle.title;
  }

  summary(): string {
    return devtoolsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = devtoolsArticle.sections[0].body;
  section1Body = devtoolsArticle.sections[1].body;
  section2Body = devtoolsArticle.sections[2].body;
  section3Body = devtoolsArticle.sections[3].body;
  section0Points = devtoolsArticle.sections[0].points ?? [];
  section1Points = devtoolsArticle.sections[1].points ?? [];
  section2Points = devtoolsArticle.sections[2].points ?? [];
  section3Points = devtoolsArticle.sections[3].points ?? [];
  section0Code = devtoolsArticle.sections[0].code?.code ?? '';
}
