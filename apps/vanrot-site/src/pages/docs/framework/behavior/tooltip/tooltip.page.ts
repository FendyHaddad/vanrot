import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const behaviorTooltipArticle = {
  "key": "behaviorTooltip",
  "section": "framework",
  "path": "/docs/behavior/tooltip",
  "label": "Tooltip",
  "title": "Tooltip Behavior",
  "summary": "createTooltipController shows hover and focus tooltips with a configurable delay and correct ARIA wiring.",
  "status": "production-ready-through-phase-16h",
  "sections": [
    {
      "id": "trigger-events",
      "title": "Trigger events",
      "body": "createTooltipController gives tooltip markup a small state machine without deciding how the bubble looks. registerTrigger binds pointerenter and focusin to open and pointerleave and focusout to close, so the same tooltip is reachable by keyboard and mouse users. The optional delay is applied to pointer hover only; focus opens immediately so keyboard feedback does not feel delayed.",
      "points": [
        "open is a writable signal the template can read to render the bubble.",
        "registerContent sets role=\"tooltip\" and toggles hidden as state changes.",
        "Escape closes an open tooltip from anywhere in the document."
      ]
    },
    {
      "id": "aria-and-content",
      "title": "ARIA and content",
      "body": "Registered content receives role=\"tooltip\" and hidden state updates whenever open changes. Registered triggers receive aria-describedby when content is present, then lose that relationship when the tooltip closes or the controller is disposed. Keep tooltip copy short and descriptive; use an overlay or dialog for interactive content because tooltip behavior is intentionally read-only.",
      "points": [
        "Use tooltip content for labels, definitions, and short help text.",
        "Do not put buttons, forms, or menus inside tooltip content.",
        "Pair the controller with positionLayer when the bubble needs anchored placement."
      ]
    },
    {
      "id": "cleanup",
      "title": "Cleanup",
      "body": "Each register call returns a disposer, and dispose() clears the pending open timer, removes the document keydown listener, and clears tracked trigger/content elements. Cleanup matters because a delayed hover can otherwise fire after the owning component has left the page. Store the disposer near the element reference and run it from the page or component cleanup path.",
      "code": {
        "title": "Delayed tooltip",
        "code": "import { createTooltipController } from '@vanrot/behavior/tooltip';\n\nconst tooltip = createTooltipController({ delay: 150 });\ntooltip.registerTrigger(button);\ntooltip.registerContent(bubble);"
      }
    }
  ]
} as const;

const sectionLinks = behaviorTooltipArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TooltipPage {
  title(): string {
    return behaviorTooltipArticle.title;
  }

  summary(): string {
    return behaviorTooltipArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = behaviorTooltipArticle.sections[0].body;
  section1Body = behaviorTooltipArticle.sections[1].body;
  section2Body = behaviorTooltipArticle.sections[2].body;
  section0Points = behaviorTooltipArticle.sections[0].points ?? [];
  section1Points = behaviorTooltipArticle.sections[1].points ?? [];
  section2Code = behaviorTooltipArticle.sections[2].code?.code ?? '';
}
