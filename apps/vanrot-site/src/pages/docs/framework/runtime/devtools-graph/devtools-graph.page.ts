import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const runtimeDevtoolsGraphArticle = {
  "key": "runtimeDevtoolsGraph",
  "section": "framework",
  "path": "/docs/runtime/devtools-graph",
  "label": "Devtools Graph",
  "title": "Runtime Devtools Graph",
  "summary": "The runtime graph session records nodes, edges, and events so devtools can inspect reactive behavior without changing application code.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "graph-session",
      "title": "Graph session",
      "body": "createRuntimeGraphSession() is the bridge between runtime behavior and devtools inspection. It records graph facts as structured node, edge, and dispose events, keeping the application runtime small while still giving tooling enough metadata to explain what changed.",
      "points": [
        "Record nodes for signals, computed values, effects, and runtime-owned controllers.",
        "Record edges when one runtime object depends on another.",
        "Emit dispose events so devtools can clear a runtime session without patching application code."
      ],
      "code": {
        "title": "Runtime graph events",
        "code": "import { createRuntimeGraphSession } from '@vanrot/runtime';\n\nconst graph = createRuntimeGraphSession({\n  enabled: true,\n  emit: (event) => console.log(event),\n});\n\ngraph.recordNode({ id: 'signal:cart', kind: 'signal', label: 'Cart' });\ngraph.dispose('checkout');"
      }
    }
  ]
} as const;

const sectionLinks = runtimeDevtoolsGraphArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DevtoolsGraphPage {
  title(): string {
    return runtimeDevtoolsGraphArticle.title;
  }

  summary(): string {
    return runtimeDevtoolsGraphArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = runtimeDevtoolsGraphArticle.sections[0].body;
  section0Points = runtimeDevtoolsGraphArticle.sections[0].points ?? [];
  section0Code = runtimeDevtoolsGraphArticle.sections[0].code?.code ?? '';
}
