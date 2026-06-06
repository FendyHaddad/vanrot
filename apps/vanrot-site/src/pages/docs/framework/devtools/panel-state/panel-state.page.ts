import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const devtoolsPanelStateArticle = {
  "key": "devtoolsPanelState",
  "section": "framework",
  "path": "/docs/devtools/panel-state",
  "label": "Panel State",
  "title": "Devtools Panel State",
  "summary": "Panel state normalizes graph manifests into renderable devtools state without changing the underlying manifest contract.",
  "status": "production-ready-through-phase-23",
  "sections": [
    {
      "id": "panel-purpose",
      "title": "Panel purpose",
      "body": "Panel state is the UI-facing projection of normalized graph data. It lets a devtools panel decide whether to show graph content, an empty state, a stale warning, or a load failure.",
      "points": [
        "Use createPanelState after manifest normalization.",
        "Keep UI selection state separate from generated graph data.",
        "Render empty and stale states intentionally instead of treating them as crashes."
      ],
      "code": {
        "title": "Create panel state",
        "code": "import { createPanelState, normalizeGraphManifest } from '@vanrot/devtools';\\n\\nconst normalized = normalizeGraphManifest(rawProjectMap);\\nconst panel = createPanelState(normalized);"
      }
    },
    {
      "id": "rendering-states",
      "title": "Rendering states",
      "body": "A good devtools panel distinguishes ready, empty, stale, and error states. Developers need to know whether the app has no graph data, the graph is old, or the producer failed to emit metadata.",
      "points": [
        "Show stale reasons when the manifest says data is stale.",
        "Show empty states when there are no nodes to inspect.",
        "Show diagnostics when normalization reports invalid input."
      ]
    },
    {
      "id": "panel-debugging",
      "title": "Panel debugging",
      "body": "When the panel renders the wrong thing, inspect normalized graph status before changing components. The UI may be correct and the producer may be serving stale or invalid metadata.",
      "points": [
        "Check normalizeGraphManifest output first.",
        "Check panel state second.",
        "Check visual components only after data state is confirmed."
      ]
    }
  ]
} as const;

const sectionLinks = devtoolsPanelStateArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class PanelStatePage {
  title(): string {
    return devtoolsPanelStateArticle.title;
  }

  summary(): string {
    return devtoolsPanelStateArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = devtoolsPanelStateArticle.sections[0].body;
  section1Body = devtoolsPanelStateArticle.sections[1].body;
  section2Body = devtoolsPanelStateArticle.sections[2].body;
  section0Points = devtoolsPanelStateArticle.sections[0].points ?? [];
  section1Points = devtoolsPanelStateArticle.sections[1].points ?? [];
  section2Points = devtoolsPanelStateArticle.sections[2].points ?? [];
  section0Code = devtoolsPanelStateArticle.sections[0].code?.code ?? '';
}
