import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const octoberShowcaseArticle = {
  "key": "octoberShowcase",
  "section": "examples",
  "path": "/docs/examples/october-showcase",
  "label": "October Showcase",
  "title": "October Showcase",
  "summary": "A broad Phase 16G composition surface for admin, dashboard, and mobile patterns.",
  "status": "demo-capable",
  "sections": [
    {
      "id": "admin",
      "title": "Admin",
      "body": "Admin examples compose layout, sidebar, nav, popover actions, tooltips, dialogs, dropdowns, and command-menu search without adding new admin-specific primitives."
    },
    {
      "id": "dashboard",
      "title": "Dashboard",
      "body": "Dashboard examples use cards, stats, tables, tabs, toasts, and compact popovers to prove production-density surfaces remain readable."
    },
    {
      "id": "mobile",
      "title": "Mobile",
      "body": "Mobile examples keep actions reachable with drawers, tooltips on compact controls, and responsive command-menu navigation."
    }
  ]
} as const;

const sectionLinks = octoberShowcaseArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class OctoberShowcasePage {
  title(): string {
    return octoberShowcaseArticle.title;
  }

  summary(): string {
    return octoberShowcaseArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = octoberShowcaseArticle.sections[0].body;
  section1Body = octoberShowcaseArticle.sections[1].body;
  section2Body = octoberShowcaseArticle.sections[2].body;
}
