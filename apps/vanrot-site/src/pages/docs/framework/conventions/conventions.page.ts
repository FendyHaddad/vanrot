import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const conventionsArticle = {
  "key": "conventions",
  "section": "framework",
  "path": "/docs/conventions",
  "label": "Conventions",
  "title": "Conventions",
  "summary": "Vanrot conventions keep role files, templates, styles, state, routing, generated strings, and AI-readable project structure consistent across the framework.",
  "status": "available-now",
  "sections": [
    {
      "id": "convention-boundary",
      "title": "Convention boundary",
      "body": "Conventions are part of the framework contract. The compiler, router, CLI, Vite plugin, devtools, testing helpers, docs, and AI project map all work better when projects follow predictable role files, source roots, templates, styles, and named constants.",
      "points": [
        "Use role suffixes for Vanrot-owned source files.",
        "Keep UI markup in HTML and application logic in TypeScript.",
        "Keep route names, labels, diagnostic codes, and generated strings in named sources of truth."
      ],
      "code": {
        "title": "Role file names",
        "code": "src/pages/settings.page.ts\\nsrc/pages/settings.page.html\\nsrc/pages/settings.page.css\\nsrc/widgets/date-range.widget.ts\\nsrc/forms/profile.form.ts"
      }
    },
    {
      "id": "readability-model",
      "title": "Readability model",
      "body": "Vanrot favors readable, English-like APIs over clever shorthand. A project should make its structure obvious to a developer opening it for the first time and to tooling that scans it for routes, components, docs, and graph metadata.",
      "points": [
        "Use guard clauses instead of deeply nested control flow.",
        "Use signals for state so dependencies are visible.",
        "Use explicit file roles so tooling can understand intent without heuristics."
      ]
    },
    {
      "id": "tooling-impact",
      "title": "Tooling impact",
      "body": "Conventions are not aesthetic only. The CLI generator, Vite plugin include patterns, compiler role-file transforms, router documentation, devtools project map, and AI bundle freshness checks all depend on consistent project shape.",
      "points": [
        "Follow role suffixes so discovery can group files correctly.",
        "Follow string source-of-truth rules so generated docs and routes do not drift.",
        "Follow scoped CSS rules so UI examples stay portable."
      ]
    },
    {
      "id": "child-guides",
      "title": "Child guides",
      "body": "The child pages explain the conventions developers touch most: role files, templates and styles, state and logic, routing and shared strings, scoped CSS, and AI-readable project structure.",
      "points": [
        "Start with Role Files when creating source files by hand.",
        "Use State and Logic when deciding where behavior belongs.",
        "Use AI-readable Projects when generated maps or AI bundles miss project structure."
      ]
    }
  ]
} as const;

const sectionLinks = conventionsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ConventionsPage {
  title(): string {
    return conventionsArticle.title;
  }

  summary(): string {
    return conventionsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = conventionsArticle.sections[0].body;
  section1Body = conventionsArticle.sections[1].body;
  section2Body = conventionsArticle.sections[2].body;
  section3Body = conventionsArticle.sections[3].body;
  section0Points = conventionsArticle.sections[0].points ?? [];
  section1Points = conventionsArticle.sections[1].points ?? [];
  section2Points = conventionsArticle.sections[2].points ?? [];
  section3Points = conventionsArticle.sections[3].points ?? [];
  section0Code = conventionsArticle.sections[0].code?.code ?? '';
}
