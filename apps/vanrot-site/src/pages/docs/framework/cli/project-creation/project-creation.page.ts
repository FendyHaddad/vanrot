import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const cliProjectCreationArticle = {
  "key": "cliProjectCreation",
  "section": "framework",
  "path": "/docs/cli/project-creation",
  "label": "Project Creation",
  "title": "CLI Project Creation",
  "summary": "Project creation uses @vanrot/cli to start an application with Vanrot source layout, config, Vite wiring, and starter role files already aligned.",
  "status": "demo-capable-through-phase-14",
  "sections": [
    {
      "id": "create-flow",
      "title": "Create flow",
      "body": "vr create should be used when the desired result is a fresh application rather than a copied folder. It gives the CLI one place to apply source roots, package scripts, Vite plugin wiring, and starter page conventions.",
      "points": [
        "Choose a kebab-case project name because generated package and folder names should be readable.",
        "Review the created vanrot.config.ts before adding custom domains.",
        "Run the generated dev script before changing starter files so setup failures stay isolated."
      ],
      "code": {
        "title": "Create a workspace",
        "code": "vr create customer-portal\\ncd customer-portal\\npnpm install\\npnpm dev"
      }
    },
    {
      "id": "starter-files",
      "title": "Starter files",
      "body": "The starter should look like a Vanrot app from the first commit. Role files carry suffixes, UI stays in templates, state stays in signals, CSS remains scoped, and route or command strings come from named sources of truth.",
      "points": [
        "Keep app startup in a main entry file that calls mount.",
        "Keep page markup in .html files instead of TypeScript strings.",
        "Keep role names stable so future CLI and devtools scans can understand the project."
      ]
    },
    {
      "id": "after-create",
      "title": "After create",
      "body": "After creation, use CLI commands to extend the project instead of immediately hand-writing every file. This keeps generated role files, UI primitive imports, and project intelligence aligned with the conventions users will see in the docs.",
      "points": [
        "Use vr generate page for the first route-backed screen.",
        "Use vr ui add for reusable primitives instead of copying docs examples manually.",
        "Use vr map after large structural changes so devtools and AI context see the new project shape."
      ]
    }
  ]
} as const;

const sectionLinks = cliProjectCreationArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ProjectCreationPage {
  title(): string {
    return cliProjectCreationArticle.title;
  }

  summary(): string {
    return cliProjectCreationArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliProjectCreationArticle.sections[0].body;
  section1Body = cliProjectCreationArticle.sections[1].body;
  section2Body = cliProjectCreationArticle.sections[2].body;
  section0Points = cliProjectCreationArticle.sections[0].points ?? [];
  section1Points = cliProjectCreationArticle.sections[1].points ?? [];
  section2Points = cliProjectCreationArticle.sections[2].points ?? [];
  section0Code = cliProjectCreationArticle.sections[0].code?.code ?? '';
}
