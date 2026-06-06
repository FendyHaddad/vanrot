import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersViteToolingArticle = {
  "key": "formattersViteTooling",
  "section": "framework",
  "path": "/docs/formatters/vite-tooling",
  "label": "Vite tooling",
  "title": "Vite Discovery And Rebuilds",
  "summary": "The Vite plugin discovers .pipe.ts files, rebuilds the formatter registry, reports terminal diagnostics, and invalidates affected templates.",
  "status": "production-ready",
  "sections": [
    {
      "id": "vite-tooling",
      "title": "Registry discovery",
      "body": "Formatter tooling belongs in the compiler/Vite pipeline because templates need compile-time knowledge of pipes. The Vite plugin watches pipe files, rebuilds the registry, reports errors, and invalidates only affected templates where possible.",
      "points": [
        "Discover .pipe.ts role files from the project source graph.",
        "Build a typed registry for compiler validation and generated imports.",
        "Invalidate affected templates when a pipe changes.",
        "Keep diagnostics in the terminal and in any future Forge/Vite overlay."
      ],
      "code": {
        "title": "Role file discovery",
        "code": "src/claims/claims.pipe.ts -> registry.claimStatus\\nsrc/billing/money.pipe.ts -> registry.money"
      }
    }
  ]
} as const;

const sectionLinks = formattersViteToolingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ViteToolingPage {
  title(): string {
    return formattersViteToolingArticle.title;
  }

  summary(): string {
    return formattersViteToolingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersViteToolingArticle.sections[0].body;
  section0Points = formattersViteToolingArticle.sections[0].points ?? [];
  section0Code = formattersViteToolingArticle.sections[0].code?.code ?? '';
}
