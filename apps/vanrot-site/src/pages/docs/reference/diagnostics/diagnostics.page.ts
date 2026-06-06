import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const diagnosticsArticle = {
  "key": "diagnostics",
  "section": "reference",
  "path": "/docs/diagnostics",
  "label": "Diagnostics",
  "title": "Diagnostics Reference",
  "summary": "Find the current compiler, config, router, CLI, and Vite-plugin diagnostic codes with user-facing explanations.",
  "status": "phase-24-active",
  "sections": [
    {
      "id": "families",
      "title": "Families",
      "body": "Diagnostics are grouped by owning package so users know whether an error comes from the compiler, config loader, router contract, CLI command, or Vite integration."
    },
    {
      "id": "coverage-check",
      "title": "Coverage Check",
      "body": "verify:site-docs fails when a known diagnostic code is missing from the public reference. That keeps new compiler, config, and router errors from shipping without docs."
    },
    {
      "id": "reader-guidance",
      "title": "Reader Guidance",
      "body": "Diagnostic descriptions explain what happened, where the user should look, and whether the behavior is production-ready, limited, or deferred to a later phase."
    }
  ]
} as const;

const sectionLinks = diagnosticsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DiagnosticsPage {
  title(): string {
    return diagnosticsArticle.title;
  }

  summary(): string {
    return diagnosticsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = diagnosticsArticle.sections[0].body;
  section1Body = diagnosticsArticle.sections[1].body;
  section2Body = diagnosticsArticle.sections[2].body;
}
