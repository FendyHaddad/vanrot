import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const conventionsRoleFilesArticle = {
  "key": "conventionsRoleFiles",
  "section": "framework",
  "path": "/docs/conventions/role-files",
  "label": "Role Files",
  "title": "Conventions Role Files",
  "summary": "Role file conventions make Vanrot source files discoverable by humans, compiler transforms, CLI generators, Vite plugin matching, devtools, and AI tools.",
  "status": "available-now",
  "sections": [
    {
      "id": "role-suffixes",
      "title": "Role suffixes",
      "body": "Use role suffixes such as .component.ts, .page.ts, .dialog.ts, .layout.ts, .widget.ts, and .form.ts for Vanrot-owned files. The suffix says what the file is for before anyone reads its contents.",
      "points": [
        "Use .page.ts for route-backed screens.",
        "Use .component.ts for reusable UI pieces.",
        "Use .layout.ts, .dialog.ts, .widget.ts, and .form.ts for their specific UI roles."
      ],
      "code": {
        "title": "Role suffix examples",
        "code": "account-summary.component.ts\\nsettings.page.ts\\ndocs.layout.ts\\nuser-editor.dialog.ts\\nfilter-bar.widget.ts\\nprofile.form.ts"
      }
    },
    {
      "id": "discovery",
      "title": "Discovery",
      "body": "Role suffixes let tools discover files without guessing. The Vite plugin can match role files, the CLI can generate the right companion files, and devtools can group source files into project map roles.",
      "points": [
        "Keep custom helper files free of role suffixes.",
        "Do not rename role suffixes per feature team.",
        "Use project map output to check whether role discovery sees a file."
      ]
    },
    {
      "id": "manual-files",
      "title": "Manual files",
      "body": "When creating files manually, copy the generator's shape: TypeScript role class, separate HTML template, separate scoped CSS, and predictable imports. Manual files should not become a second convention.",
      "points": [
        "Use the same naming pattern as vr generate.",
        "Keep companion files next to the role file unless the project has a documented layout rule.",
        "Run vr map after adding many manual role files."
      ]
    }
  ]
} as const;

const sectionLinks = conventionsRoleFilesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RoleFilesPage {
  title(): string {
    return conventionsRoleFilesArticle.title;
  }

  summary(): string {
    return conventionsRoleFilesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = conventionsRoleFilesArticle.sections[0].body;
  section1Body = conventionsRoleFilesArticle.sections[1].body;
  section2Body = conventionsRoleFilesArticle.sections[2].body;
  section0Points = conventionsRoleFilesArticle.sections[0].points ?? [];
  section1Points = conventionsRoleFilesArticle.sections[1].points ?? [];
  section2Points = conventionsRoleFilesArticle.sections[2].points ?? [];
  section0Code = conventionsRoleFilesArticle.sections[0].code?.code ?? '';
}
