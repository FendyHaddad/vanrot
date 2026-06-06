import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const behaviorPositionedLayerArticle = {
  "key": "behaviorPositionedLayer",
  "section": "framework",
  "path": "/docs/behavior/positioned-layer",
  "label": "Positioned Layer",
  "title": "Positioned Layer Behavior",
  "summary": "positionLayer places a floating element next to a trigger on a chosen side and alignment with a configurable offset.",
  "status": "production-ready-through-phase-16h",
  "sections": [
    {
      "id": "placement",
      "title": "Placement",
      "body": "positionLayer(trigger, content, options) is a one-shot geometry helper for floating UI. It reads both bounding rects and sets content.style.position, left, top, and transformOrigin. side is top, right, bottom, or left; align is start, center, or end; offset defaults to 4 pixels. The helper is deliberately small and deterministic so app code can call it after render, after resize, or after content changes.",
      "points": [
        "It writes data-vr-side and data-vr-align for CSS to target.",
        "transformOrigin is derived from side and align for natural open animations.",
        "It is a one-shot placement call; re-run it on resize or scroll if needed."
      ]
    },
    {
      "id": "pairing",
      "title": "Pairing with overlays",
      "body": "positionLayer is the placement primitive behind tooltips, popovers, menus, and anchored help text. Compose it with createOverlayController or createTooltipController, which own open state, event listeners, and cleanup. positionLayer owns only geometry, so it stays easy to test and does not hide layout timing behind global observers.",
      "code": {
        "title": "Place a layer",
        "code": "import { positionLayer } from '@vanrot/behavior/positioned-layer';\n\npositionLayer(trigger, content, {\n  side: 'bottom',\n  align: 'start',\n  offset: 8,\n});"
      }
    },
    {
      "id": "layout-limits",
      "title": "Layout limits",
      "body": "The helper does not flip, constrain, or observe layers. That is intentional for the current package size and predictability: call it when the layer opens, re-run it when the viewport or trigger changes, and add application-specific collision handling only where the product needs it. CSS can read data-vr-side and data-vr-align to tune shadows, arrows, and transform origins.",
      "points": [
        "Use side and align as the source of truth for arrow placement.",
        "Re-run placement after content that changes size is rendered.",
        "Keep scroll and resize listeners in the owning component so cleanup remains explicit."
      ]
    }
  ]
} as const;

const sectionLinks = behaviorPositionedLayerArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class PositionedLayerPage {
  title(): string {
    return behaviorPositionedLayerArticle.title;
  }

  summary(): string {
    return behaviorPositionedLayerArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = behaviorPositionedLayerArticle.sections[0].body;
  section1Body = behaviorPositionedLayerArticle.sections[1].body;
  section2Body = behaviorPositionedLayerArticle.sections[2].body;
  section0Points = behaviorPositionedLayerArticle.sections[0].points ?? [];
  section2Points = behaviorPositionedLayerArticle.sections[2].points ?? [];
  section1Code = behaviorPositionedLayerArticle.sections[1].code?.code ?? '';
}
