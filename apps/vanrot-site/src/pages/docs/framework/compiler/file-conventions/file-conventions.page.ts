import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerFileConventionsArticle = {
  "key": "compilerFileConventions",
  "section": "framework",
  "path": "/docs/compiler/file-conventions",
  "label": "File Conventions",
  "title": "Compiler File Conventions",
  "summary": "Vanrot compiler file conventions pair each role TypeScript file with sibling HTML and CSS sources before any template or style transform runs.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "role-file-family",
      "title": "Role file family",
      "body": "A Vanrot component starts from a role TypeScript file. The compiler currently accepts .component.ts, .page.ts, .layout.ts, and .button.ts owners, then expects sibling .html and .css files with the same basename so markup, behavior, and styling stay source-owned.",
      "points": [
        "Use .page.ts for routed pages, .layout.ts for route layouts, .component.ts for reusable components, and .button.ts only for the supported button role.",
        "Do not inline templates or styles in TypeScript; the compiler resolves sibling files as part of the source contract.",
        "Unsupported suffixes produce VR003 because the compiler cannot infer the expected class name and sibling file set."
      ],
      "code": {
        "title": "Resolve a role file set",
        "code": "import { createComponentFileSet } from '@vanrot/compiler';\n\nconst fileSet = createComponentFileSet('src/dashboard/stats.page.ts');\n\n// fileSet.componentPath -> src/dashboard/stats.page.ts\n// fileSet.templatePath -> src/dashboard/stats.page.html\n// fileSet.stylePath -> src/dashboard/stats.page.css\n// fileSet.expectedClassName -> StatsPage"
      }
    },
    {
      "id": "sibling-files",
      "title": "Sibling files",
      "body": "The sibling convention is strict on purpose. A missing HTML file produces VR001 and a missing CSS file produces VR002 before the compiler attempts template parsing, because generated output must always be traceable back to source files with stable ownership.",
      "points": [
        "Keep the three files beside one another rather than hiding source in generated directories.",
        "Use the exact basename so refactors are easy to review and tooling can resolve the family without project-wide guessing.",
        "Let resolveComponentFiles() perform async disk checks when tooling starts from a path instead of in-memory source strings."
      ],
      "code": {
        "title": "Check files from disk",
        "code": "import { resolveComponentFiles } from '@vanrot/compiler';\n\nconst resolved = await resolveComponentFiles('src/dashboard/stats.page.ts');\n\nif (resolved.fileSet === null) {\n  for (const diagnostic of resolved.diagnostics) {\n    console.error(diagnostic.code, diagnostic.suggestion);\n  }\n}"
      }
    },
    {
      "id": "production-pattern",
      "title": "Production pattern",
      "body": "Production components should read like small source families: TypeScript owns state and methods, HTML owns view structure, and CSS owns local styling. This keeps Vanrot inspectable and avoids the hidden framework magic that makes generated output impossible to debug.",
      "points": [
        "Move repeated strings such as route names and command labels into shared constants before referencing them from role files.",
        "Prefer plain class names that match the generated expectation, for example StatsPage for stats.page.ts.",
        "When a file convention diagnostic appears, fix the source family instead of suppressing the compiler."
      ]
    }
  ]
} as const;

const sectionLinks = compilerFileConventionsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class FileConventionsPage {
  title(): string {
    return compilerFileConventionsArticle.title;
  }

  summary(): string {
    return compilerFileConventionsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerFileConventionsArticle.sections[0].body;
  section1Body = compilerFileConventionsArticle.sections[1].body;
  section2Body = compilerFileConventionsArticle.sections[2].body;
  section0Points = compilerFileConventionsArticle.sections[0].points ?? [];
  section1Points = compilerFileConventionsArticle.sections[1].points ?? [];
  section2Points = compilerFileConventionsArticle.sections[2].points ?? [];
  section0Code = compilerFileConventionsArticle.sections[0].code?.code ?? '';
  section1Code = compilerFileConventionsArticle.sections[1].code?.code ?? '';
}
