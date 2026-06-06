import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const exampleMatrixArticle = {
  "key": "exampleMatrix",
  "section": "examples",
  "path": "/docs/example-matrix",
  "label": "Example Matrix",
  "title": "Runnable Example Matrix",
  "summary": "Use verified example workspaces as the source of truth for framework workflows and docs snippets.",
  "status": "phase-24-active",
  "sections": [
    {
      "id": "source-of-truth",
      "title": "Source Of Truth",
      "body": "Runnable example workspaces own the real code for guide snippets. Documentation should reference or mirror these examples so snippets stay connected to tests and package behavior."
    },
    {
      "id": "workflow-coverage",
      "title": "Workflow Coverage",
      "body": "The matrix covers starter creation, runtime lifecycle, compiler templates, routing, config diagnostics, CLI commands, UI usage, testing helpers, devtools intelligence, WebGL lifecycle recipes, and build deployment preparation."
    },
    {
      "id": "package-coverage",
      "title": "Package Coverage",
      "body": "Every workspace package appears in at least one registered example. Packages without a browser-facing workflow still appear through command, config, devtools, or build examples."
    }
  ]
} as const;

const sectionLinks = exampleMatrixArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ExampleMatrixPage {
  title(): string {
    return exampleMatrixArticle.title;
  }

  summary(): string {
    return exampleMatrixArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = exampleMatrixArticle.sections[0].body;
  section1Body = exampleMatrixArticle.sections[1].body;
  section2Body = exampleMatrixArticle.sections[2].body;
}
