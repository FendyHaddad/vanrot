import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const installationArticle = {
  "key": "installation",
  "section": "getStarted",
  "path": "/docs/installation",
  "label": "Installation",
  "title": "Installation",
  "summary": "Create or run a Vanrot app through the CLI and workspace package graph.",
  "status": "demo-capable",
  "sections": [
    {
      "id": "create",
      "title": "Create A Project",
      "body": "Run pnpm dlx @vanrot/cli create my-app, then cd my-app and npm install. Vanrot requires Node.js 22.14 or newer, and every @vanrot dependency is pinned to its published version. Inside this monorepo, pass --workspace to use workspace links instead."
    },
    {
      "id": "scripts",
      "title": "Scripts",
      "body": "Generated apps use vr dev, vr build, vr test, and vr doctor so project commands stay conventional."
    },
    {
      "id": "journey",
      "title": "Start Your Journey",
      "body": "After install, run vr dev for the dev server with instant HMR, vr generate page <name> to grow pages and components, vr add button for accessible UI primitives, vr doctor for health checks, and vr build to ship. Run vr with no arguments for the full guided intro."
    }
  ]
} as const;

const sectionLinks = installationArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class InstallationPage {
  title(): string {
    return installationArticle.title;
  }

  summary(): string {
    return installationArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = installationArticle.sections[0].body;
  section1Body = installationArticle.sections[1].body;
  section2Body = installationArticle.sections[2].body;
}
