import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const behaviorTabsArticle = {
  "key": "behaviorTabs",
  "section": "framework",
  "path": "/docs/behavior/tabs",
  "label": "Tabs",
  "title": "Tabs Behavior",
  "summary": "createTabsController manages a selected tab value with roving-focus arrow navigation and tab/tabpanel ARIA roles.",
  "status": "production-ready-through-phase-16h",
  "sections": [
    {
      "id": "selection",
      "title": "Selection",
      "body": "createTabsController manages the selected value for a tablist while the application keeps the actual triggers and panels in HTML. The controller takes a defaultValue and exposes a writable value signal plus select(value) and isSelected(value). registerTrigger and registerPanel connect each tab and panel by the same value key, then synchronize selection attributes and hidden panel state.",
      "points": [
        "Selected trigger gets aria-selected=\"true\" and tabIndex 0; others go to -1.",
        "Unselected panels are hidden so only the active panel renders.",
        "Arrow keys move focus and selection across triggers, wrapping at the ends."
      ]
    },
    {
      "id": "keyboard",
      "title": "Keyboard model",
      "body": "ArrowRight and ArrowDown advance, ArrowLeft and ArrowUp go back, and the moved-to trigger receives focus. This is a roving-focus model: only the selected trigger sits in the natural tab order, while arrow keys move within the tab set. The controller wraps at the ends so the keyboard model stays predictable in both horizontal and compact layouts.",
      "code": {
        "title": "Connect tabs",
        "code": "import { createTabsController } from '@vanrot/behavior/tabs';\n\nconst tabs = createTabsController({ defaultValue: 'overview' });\ntabs.registerTrigger('overview', overviewTab);\ntabs.registerPanel('overview', overviewPanel);\ntabs.registerTrigger('billing', billingTab);\ntabs.registerPanel('billing', billingPanel);\n\ntabs.select('billing');"
      }
    },
    {
      "id": "page-state",
      "title": "Page state",
      "body": "Tabs can be local UI state or app state. For purely local surfaces, let value stay inside the controller and render panel visibility from tabs.isSelected(value). For route-aware or persisted tabs, subscribe to value changes through application code and call select() when the route or stored preference changes. Dispose removes click and keydown listeners and clears registered triggers and panels.",
      "points": [
        "Use stable value strings such as overview, billing, or activity.",
        "Do not derive tab identity from visible labels that may be translated.",
        "Keep panel logic in TypeScript and panel markup in the matching HTML file."
      ]
    }
  ]
} as const;

const sectionLinks = behaviorTabsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TabsPage {
  title(): string {
    return behaviorTabsArticle.title;
  }

  summary(): string {
    return behaviorTabsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = behaviorTabsArticle.sections[0].body;
  section1Body = behaviorTabsArticle.sections[1].body;
  section2Body = behaviorTabsArticle.sections[2].body;
  section0Points = behaviorTabsArticle.sections[0].points ?? [];
  section2Points = behaviorTabsArticle.sections[2].points ?? [];
  section1Code = behaviorTabsArticle.sections[1].code?.code ?? '';
}
