import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const behaviorCommandMenuArticle = {
  "key": "behaviorCommandMenu",
  "section": "framework",
  "path": "/docs/behavior/command-menu",
  "label": "Command Menu",
  "title": "Command Menu Behavior",
  "summary": "createCommandMenuController drives a keyboard-navigable command palette with an active item and selection callback.",
  "status": "production-ready-through-phase-16h",
  "sections": [
    {
      "id": "navigation",
      "title": "Active-item navigation",
      "body": "createCommandMenuController gives a command palette or searchable action list a keyboard model. The controller tracks an activeValue signal across registered items. registerInput binds ArrowUp, ArrowDown, Home, and End to move the active item among enabled entries, skipping disabled nodes so unavailable actions never receive active state.",
      "points": [
        "registerItem(value, element) adds a selectable entry and returns a disposer.",
        "selectActive() invokes onSelect for the currently active, enabled item.",
        "Disabled items are skipped during navigation and ignored on select."
      ]
    },
    {
      "id": "selection",
      "title": "Selection callback",
      "body": "Provide onSelect(value, element) to react when the user activates an item with Enter or when application code calls selectActive(). The value should be a stable command id, not a visible label, so labels can change without breaking command handling. The element argument lets app code read metadata or move focus after the selected command opens a panel.",
      "code": {
        "title": "Wire a palette",
        "code": "import { createCommandMenuController } from '@vanrot/behavior/command-menu';\n\nconst menu = createCommandMenuController({\n  onSelect: (value) => run(value),\n});\nmenu.registerInput(input);\nmenu.registerItem('open-settings', settingsItem);"
      }
    },
    {
      "id": "aria-and-lifecycle",
      "title": "ARIA and lifecycle",
      "body": "registerInput sets combobox-style attributes and keeps aria-activedescendant synchronized with the active item id. registerItem sets role=\"option\" and creates a fallback id when the element does not already have one. Escape clears activeValue without selecting anything, and dispose removes input listeners plus registered items when the palette unmounts.",
      "points": [
        "Filter the visible item list in application state, then register the elements that remain visible.",
        "Give important items explicit ids when tests or analytics need stable selectors.",
        "Use an overlay controller separately when the command menu also needs open and close behavior."
      ]
    }
  ]
} as const;

const sectionLinks = behaviorCommandMenuArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class CommandMenuPage {
  title(): string {
    return behaviorCommandMenuArticle.title;
  }

  summary(): string {
    return behaviorCommandMenuArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = behaviorCommandMenuArticle.sections[0].body;
  section1Body = behaviorCommandMenuArticle.sections[1].body;
  section2Body = behaviorCommandMenuArticle.sections[2].body;
  section0Points = behaviorCommandMenuArticle.sections[0].points ?? [];
  section2Points = behaviorCommandMenuArticle.sections[2].points ?? [];
  section1Code = behaviorCommandMenuArticle.sections[1].code?.code ?? '';
}
