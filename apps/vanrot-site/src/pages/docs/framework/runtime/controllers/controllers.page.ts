import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const runtimeControllersArticle = {
  "key": "runtimeControllers",
  "section": "framework",
  "path": "/docs/runtime/controllers",
  "label": "UI Controllers",
  "title": "Runtime UI Controllers",
  "summary": "UI controllers are small runtime helpers for repeated interaction patterns such as overlays, command menus, layers, tabs, tooltips, and toasts.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "controller-boundary",
      "title": "Controller boundary",
      "body": "Controllers belong in runtime because they coordinate live browser behavior that should not be duplicated in every component. They hold state, expose commands, and keep imperative details out of application templates.",
      "points": [
        "Use createOverlayController() for open and close behavior shared by overlays.",
        "Use createCommandMenuController(), createTabsController(), createTooltipController(), and createToastController() for repeated UI interaction state.",
        "Use positionLayer() when an overlay needs side, align, and measurement logic."
      ],
      "code": {
        "title": "Overlay and toast controllers",
        "code": "import { createOverlayController, createToastController } from '@vanrot/runtime';\n\nconst overlay = createOverlayController({ initialOpen: false });\nconst toasts = createToastController();\n\noverlay.openOverlay();\ntoasts.enqueue({ title: 'Saved', tone: 'success' });"
      }
    }
  ]
} as const;

const sectionLinks = runtimeControllersArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ControllersPage {
  title(): string {
    return runtimeControllersArticle.title;
  }

  summary(): string {
    return runtimeControllersArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = runtimeControllersArticle.sections[0].body;
  section0Points = runtimeControllersArticle.sections[0].points ?? [];
  section0Code = runtimeControllersArticle.sections[0].code?.code ?? '';
}
