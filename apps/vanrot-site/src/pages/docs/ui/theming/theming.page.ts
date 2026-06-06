import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const themingArticle = {
  "key": "theming",
  "section": "ui",
  "path": "/docs/theming",
  "label": "Theming",
  "title": "Theming",
  "summary": "Vanrot themes use CSS custom properties for colors, surfaces, radius, shadows, typography, motion, and z-index layers.",
  "status": "available-now",
  "sections": [
    {
      "id": "dark-light",
      "title": "Dark First, Light Capable",
      "body": "October defaults to a dark-first theme and supports data-theme=\"light\" for light mode."
    },
    {
      "id": "typography",
      "title": "Typography",
      "body": "The default identity uses Geist for text and JetBrains Mono for numeric UI."
    }
  ]
} as const;

const sectionLinks = themingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ThemingPage {
  title(): string {
    return themingArticle.title;
  }

  summary(): string {
    return themingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = themingArticle.sections[0].body;
  section1Body = themingArticle.sections[1].body;
}
