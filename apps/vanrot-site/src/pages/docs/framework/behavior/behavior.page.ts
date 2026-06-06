import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const behaviorArticle = {
  "key": "behavior",
  "section": "framework",
  "path": "/docs/behavior",
  "label": "Behavior",
  "title": "Behavior",
  "summary": "@vanrot/behavior is optional and lets apps pick only the headless behavior helpers they use, from overlays and tables through the Phase 28 interaction suite.",
  "status": "production-ready-through-phase-28",
  "sections": [
    {
      "id": "package-boundary",
      "title": "Package boundary",
      "body": "@vanrot/runtime stays small. @vanrot/behavior owns optional headless interaction helpers and is installed only when a project selects behavior helpers. Phase 28 keeps that boundary: collapsible state, selection state, menu state, focus utilities, portals, calendars, drag/drop state, and table resizing all live outside the core browser runtime.",
      "points": [
        "Use runtime signals and lifecycle for framework fundamentals.",
        "Use behavior controllers when an app needs reusable interaction state.",
        "Use UI components or app-owned markup for visuals; behavior helpers do not render DOM."
      ]
    },
    {
      "id": "create-flow",
      "title": "Create flow",
      "body": "vr create asks whether to add behavior helpers. Non-interactive runs can use --behavior tooltip,toast,collapsible,selection,calendar or --no-behavior. The selected names are written into behavior.enabled so doctor, remove, docs, and AI-readable knowledge all see the same explicit contract."
    },
    {
      "id": "subpath-imports",
      "title": "Subpath imports",
      "body": "Import only the behavior you use, such as @vanrot/behavior/tooltip, @vanrot/behavior/collapsible, @vanrot/behavior/selection, or @vanrot/behavior/calendar. @vanrot/behavior/all remains available when an app intentionally wants every helper, but production code should prefer the narrow subpath because it documents intent and keeps optional behavior easy to audit.",
      "code": {
        "title": "Pick only the helper family you need",
        "code": "import { createAccordionController } from '@vanrot/behavior/collapsible';\nimport { createComboboxController } from '@vanrot/behavior/selection';\nimport { createDatePickerController } from '@vanrot/behavior/calendar';\n\nconst accordion = createAccordionController({ type: 'multiple' });\nconst search = createComboboxController({ options });\nconst picker = createDatePickerController({ month: new Date() });"
      }
    },
    {
      "id": "phase-28-suite",
      "title": "Phase 28 suite",
      "body": "The expanded suite covers the interaction primitives that repeatedly appear in real applications but should not become runtime kernel code. collapsible covers accordion, collapsible, and disclosure state. selection covers listbox, select, combobox, and multi-selection. menu covers menu, context menu, menubar, and navigation menu. toggle covers toggle groups and toolbars. The remaining helpers cover scroll areas, portals, focus and visually hidden utilities, calendars and date pickers, drag/drop reorder state, and table column resizing.",
      "points": [
        "collapsible, selection, menu, toggle, scroll-area, portal, focus, calendar, drag-drop, and table-resize are accepted behavior.enabled names.",
        "Each helper exposes signals for reads and commands for writes.",
        "The package owns state and accessibility props; application files own markup and styling."
      ]
    },
    {
      "id": "selection-and-menus",
      "title": "Selection and menus",
      "body": "Selection-heavy UI should not bury active item, query, disabled item, or range-selection rules inside templates. createSelectionController, createListboxController, createSelectController, createComboboxController, and createMultiSelectionController provide that state directly. Menu helpers follow the same model for active menu items, context-menu coordinates, menubar movement, and navigation-menu open state.",
      "code": {
        "title": "Combobox state",
        "code": "import { createComboboxController } from '@vanrot/behavior/selection';\n\nconst assigneeBox = createComboboxController({\n  options: [\n    { value: 'ada', label: 'Ada Lovelace' },\n    { value: 'grace', label: 'Grace Hopper' },\n  ],\n});\n\nassigneeBox.setQuery('gra');\nassigneeBox.selectActive();"
      }
    },
    {
      "id": "focus-and-portals",
      "title": "Focus and portals",
      "body": "Focus behavior is intentionally separate from visual overlays. createFocusTrap can move focus into a dialog or panel. createFocusReturnController captures the previous active element and restores it after close. createRovingFocusController supports one-tab-stop toolbars and composite widgets. mountPortal appends an element into a target and returns a disposer, while visuallyHiddenProps gives app markup an explicit accessible hiding helper.",
      "points": [
        "Focus helpers are small enough to test without rendering a full component.",
        "Portal cleanup is explicit through the returned disposer.",
        "Visually hidden copy remains real DOM content for assistive technology."
      ]
    },
    {
      "id": "calendar-drag-table",
      "title": "Calendar, drag, and table sizing",
      "body": "Calendar and date-picker helpers create month grids, selected date state, and open/close state without forcing a date input component. Drag/drop helpers track active and over ids and can reorder arrays deterministically. Table-resize helpers track column widths, min/max constraints, and active resize state so dense data grids can keep resizing logic out of HTML.",
      "code": {
        "title": "Date picker and table resize",
        "code": "import { createDatePickerController } from '@vanrot/behavior/calendar';\nimport { createTableResizeController } from '@vanrot/behavior/table-resize';\n\nconst datePicker = createDatePickerController({ month: new Date(2026, 5, 1) });\nconst columns = createTableResizeController({\n  columns: [{ id: 'name', width: 160, minWidth: 120 }],\n});"
      }
    },
    {
      "id": "cleanup",
      "title": "Cleanup",
      "body": "vr remove behavior <name> removes a selected helper from behavior.enabled. Add --package when no helper remains and the package should be removed too. Removal uses the same behavior catalog as create, so old helpers such as tooltip and toast and new helpers such as selection, focus, calendar, and table-resize share one command path."
    },
    {
      "id": "doctor",
      "title": "Doctor",
      "body": "vr doctor reports installed-but-unused behavior, configured-but-unused behavior, imports missing from config, root imports that should use subpaths, and stale @vanrot/runtime behavior imports. This matters more after Phase 28 because teams can select a narrow helper family for a screen without accidentally teaching the project that every behavior helper is required."
    }
  ]
} as const;

const sectionLinks = behaviorArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class BehaviorPage {
  title(): string {
    return behaviorArticle.title;
  }

  summary(): string {
    return behaviorArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = behaviorArticle.sections[0].body;
  section1Body = behaviorArticle.sections[1].body;
  section2Body = behaviorArticle.sections[2].body;
  section3Body = behaviorArticle.sections[3].body;
  section4Body = behaviorArticle.sections[4].body;
  section5Body = behaviorArticle.sections[5].body;
  section6Body = behaviorArticle.sections[6].body;
  section7Body = behaviorArticle.sections[7].body;
  section8Body = behaviorArticle.sections[8].body;
  section0Points = behaviorArticle.sections[0].points ?? [];
  section3Points = behaviorArticle.sections[3].points ?? [];
  section5Points = behaviorArticle.sections[5].points ?? [];
  section2Code = behaviorArticle.sections[2].code?.code ?? '';
  section4Code = behaviorArticle.sections[4].code?.code ?? '';
  section6Code = behaviorArticle.sections[6].code?.code ?? '';
}
