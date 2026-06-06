import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersPipeRoleFilesArticle = {
  "key": "formattersPipeRoleFiles",
  "section": "framework",
  "path": "/docs/formatters/pipe-role-files",
  "label": ".pipe.ts role files",
  "title": ".pipe.ts Role Files",
  "summary": "Custom pipes live in .pipe.ts role files so Vite discovery, compiler validation, diagnostics, and tests can all see them.",
  "status": "production-ready",
  "sections": [
    {
      "id": "pipe-role-files",
      "title": "Custom pipe files",
      "body": "Domain display rules belong in .pipe.ts files instead of scattered template code. The Vite plugin discovers these files, extracts exported pipe metadata, watches them during development, and passes the registry to the compiler.",
      "points": [
        "Export custom pipes with definePipe from a role file such as claims.pipe.ts.",
        "Keep enums and backend constants in separate files when that is cleaner, then import them into the pipe.",
        "Reject unsupported async handlers because template pipes are display-only and synchronous.",
        "Report duplicate names, invalid definitions, and missing exports in the terminal."
      ],
      "code": {
        "title": "Custom pipe",
        "code": "export const claimStatus = definePipe((status) => {\\n  switch (status) {\\n    case ClaimStatus.APPROVED:\\n      return 'Approved';\\n    case ClaimStatus.REJECTED:\\n      return 'Rejected';\\n    case ClaimStatus.PENDING_REVIEW:\\n      return 'Pending review';\\n    default:\\n      return 'Unknown';\\n  }\\n});"
      }
    }
  ]
} as const;

const sectionLinks = formattersPipeRoleFilesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class PipeRoleFilesPage {
  title(): string {
    return formattersPipeRoleFilesArticle.title;
  }

  summary(): string {
    return formattersPipeRoleFilesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersPipeRoleFilesArticle.sections[0].body;
  section0Points = formattersPipeRoleFilesArticle.sections[0].points ?? [];
  section0Code = formattersPipeRoleFilesArticle.sections[0].code?.code ?? '';
}
