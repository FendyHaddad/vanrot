import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const examplesArticle = {
  "key": "examples",
  "section": "examples",
  "path": "/docs/examples",
  "label": "Examples",
  "title": "Examples",
  "summary": "Examples show practical Vanrot usage without hiding the source files.",
  "status": "demo-capable",
  "sections": [
    {
      "id": "counter",
      "title": "Counter",
      "body": "examples/counter demonstrates runtime state, compiler role files, Vite integration, and build verification."
    },
    {
      "id": "site",
      "title": "Vanrot Site",
      "body": "apps/vanrot-site becomes the framework's living documentation example."
    }
  ]
} as const;

const sectionLinks = examplesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ExamplesPage {
  title(): string {
    return examplesArticle.title;
  }

  summary(): string {
    return examplesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = examplesArticle.sections[0].body;
  section1Body = examplesArticle.sections[1].body;
}
