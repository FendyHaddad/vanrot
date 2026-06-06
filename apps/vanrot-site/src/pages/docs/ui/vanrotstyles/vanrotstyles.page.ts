import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const vanrotstylesArticle = {
  "key": "vanrotstyles",
  "section": "ui",
  "path": "/docs/vanrotstyles",
  "label": "vanrotstyles",
  "title": "vanrotstyles",
  "summary": "vanrotstyles.css is Vanrot's first-party utility CSS layer with unprefixed utility classes.",
  "status": "available-now",
  "sections": [
    {
      "id": "usage",
      "title": "Usage",
      "body": "Use ui.styles: 'vanrotstyles' to use the first-party utility layer. Use 'tailwind' or 'none' when the app owns another style path."
    },
    {
      "id": "utilities",
      "title": "Utilities",
      "body": "Utilities cover display, flex, grid, spacing, sizing, typography, surfaces, borders, radius, shadows, motion, overflow, z-index, and accessibility helpers."
    }
  ]
} as const;

const sectionLinks = vanrotstylesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class VanrotstylesPage {
  title(): string {
    return vanrotstylesArticle.title;
  }

  summary(): string {
    return vanrotstylesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = vanrotstylesArticle.sections[0].body;
  section1Body = vanrotstylesArticle.sections[1].body;
}
