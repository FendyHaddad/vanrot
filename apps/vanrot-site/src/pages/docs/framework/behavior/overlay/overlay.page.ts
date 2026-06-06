import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const behaviorOverlayArticle = {
  "key": "behaviorOverlay",
  "section": "framework",
  "path": "/docs/behavior/overlay",
  "label": "Overlay",
  "title": "Overlay Behavior",
  "summary": "createOverlayController drives dialogs, popovers, and menus with open state, focus restore, escape-to-close, and outside-pointer dismissal.",
  "status": "production-ready-through-phase-16h",
  "sections": [
    {
      "id": "open-state",
      "title": "Open state",
      "body": "createOverlayController owns the state shared by dialogs, popovers, drawers, and menu-like surfaces. The controller exposes a writable open signal plus openOverlay, closeOverlay, and toggleOverlay. Opening captures the active element, flips open to true, and moves focus into the first focusable node registered as content; closing restores focus to the element that had focus before the overlay opened.",
      "points": [
        "registerTrigger(element) opens the overlay on click and returns a disposer.",
        "registerContent(element) marks the focus-trap and outside-pointer boundary.",
        "onOpenChange fires for every state transition so the app can sync side effects."
      ]
    },
    {
      "id": "dismiss-policy",
      "title": "Dismiss policy",
      "body": "closeOnEscape and closeOnOutsidePointer default to true because most overlays should dismiss through keyboard escape and outside pointer intent. Escape closes only while the document listener sees the configured key, and outside pointer dismissal ignores targets inside every registered content element. Set either option false for confirmation flows, forced decisions, or composite widgets that need an explicit close action.",
      "points": [
        "Register every floating panel that should count as inside the overlay.",
        "Keep destructive confirmations explicit by disabling outside dismissal.",
        "Use onOpenChange for analytics, body scroll locks, or syncing a URL state flag."
      ]
    },
    {
      "id": "lifecycle",
      "title": "Lifecycle",
      "body": "Overlays add document-level keydown and pointerdown listeners, so cleanup is part of the public contract. Trigger and content registration each return a disposer for element-level cleanup, and dispose() removes the global listeners and clears all registered elements. Call it from the component/page destroy path, especially for routed pages where overlays can be mounted and unmounted many times.",
      "code": {
        "title": "Wire an overlay",
        "code": "import { createOverlayController } from '@vanrot/behavior/overlay';\n\nconst overlay = createOverlayController({ closeOnEscape: true });\nconst stopTrigger = overlay.registerTrigger(button);\nconst stopContent = overlay.registerContent(panel);\n\noverlay.toggleOverlay();\n// onDestroy\noverlay.dispose();"
      }
    },
    {
      "id": "composition",
      "title": "Composition",
      "body": "The overlay controller deliberately does not render markup, trap focus with hidden sentinels, or position floating content. Keep the dialog, popover, or menu DOM in the matching HTML file, read overlay.open() to show or hide it, and compose with positionLayer when a floating panel must be anchored to its trigger. That keeps @vanrot/runtime small while still giving applications predictable headless behavior.",
      "points": [
        "Use overlay state for dialogs, menus, popovers, and drawers that need shared dismissal rules.",
        "Use @vanrot/behavior/positioned-layer for geometry instead of putting placement logic in overlay state.",
        "Keep business actions in the application handler and let the behavior helper own interaction state only."
      ]
    }
  ]
} as const;

const sectionLinks = behaviorOverlayArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class OverlayPage {
  title(): string {
    return behaviorOverlayArticle.title;
  }

  summary(): string {
    return behaviorOverlayArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = behaviorOverlayArticle.sections[0].body;
  section1Body = behaviorOverlayArticle.sections[1].body;
  section2Body = behaviorOverlayArticle.sections[2].body;
  section3Body = behaviorOverlayArticle.sections[3].body;
  section0Points = behaviorOverlayArticle.sections[0].points ?? [];
  section1Points = behaviorOverlayArticle.sections[1].points ?? [];
  section3Points = behaviorOverlayArticle.sections[3].points ?? [];
  section2Code = behaviorOverlayArticle.sections[2].code?.code ?? '';
}
