import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const devtoolsRuntimeGraphArticle = {
  "key": "devtoolsRuntimeGraph",
  "section": "framework",
  "path": "/docs/devtools/runtime-graph",
  "label": "Runtime Graph",
  "title": "Devtools Runtime Graph",
  "summary": "The runtime graph describes components, signals, computed values, effects, and dependency edges for development inspection.",
  "status": "production-ready-through-phase-23",
  "sections": [
    {
      "id": "runtime-contract",
      "title": "Runtime contract",
      "body": "Runtime graph metadata exists so devtools can inspect state relationships without changing the application model. Nodes represent components, signals, computed values, and effects; edges represent ownership and dependencies.",
      "points": [
        "Use runtimeGraphSchemaVersion to identify the graph shape.",
        "Use signal, computed, and effect node kinds to inspect state flow.",
        "Keep production behavior independent from devtools inspection."
      ],
      "code": {
        "title": "Runtime graph types",
        "code": "import { runtimeGraphSchemaVersion, type RuntimeGraphNode } from '@vanrot/devtools';\\n\\nconst node: RuntimeGraphNode = {\\n  id: 'count',\\n  kind: 'signal',\\n  label: 'count',\\n};\\n\\nconsole.log(runtimeGraphSchemaVersion);"
      }
    },
    {
      "id": "dependency-edges",
      "title": "Dependency edges",
      "body": "Dependency edges make signal relationships visible. A computed value should show which signals it reads, and an effect should show which dependencies cause it to rerun during development inspection.",
      "points": [
        "Use edges to explain why an effect reran.",
        "Use ownership edges to group state under a component.",
        "Avoid exposing private implementation names when a public label is clearer."
      ]
    },
    {
      "id": "runtime-debugging",
      "title": "Runtime debugging",
      "body": "When runtime graph data looks incomplete, confirm the devtools hook is enabled and that the app is running in a development inspection path. Production apps should not depend on the devtools graph being present.",
      "points": [
        "Check runtime guide pages before assuming graph data is wrong.",
        "Check stale project map data separately from live runtime graph data.",
        "Use the signals guide to interpret signal, computed, and effect nodes."
      ]
    }
  ]
} as const;

const sectionLinks = devtoolsRuntimeGraphArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RuntimeGraphPage {
  title(): string {
    return devtoolsRuntimeGraphArticle.title;
  }

  summary(): string {
    return devtoolsRuntimeGraphArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = devtoolsRuntimeGraphArticle.sections[0].body;
  section1Body = devtoolsRuntimeGraphArticle.sections[1].body;
  section2Body = devtoolsRuntimeGraphArticle.sections[2].body;
  section0Points = devtoolsRuntimeGraphArticle.sections[0].points ?? [];
  section1Points = devtoolsRuntimeGraphArticle.sections[1].points ?? [];
  section2Points = devtoolsRuntimeGraphArticle.sections[2].points ?? [];
  section0Code = devtoolsRuntimeGraphArticle.sections[0].code?.code ?? '';
}
