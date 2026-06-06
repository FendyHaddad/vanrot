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
      "body": "Use vr create <name> for generated apps. In this monorepo, workspace links are used until package publishing is complete."
    },
    {
      "id": "scripts",
      "title": "Scripts",
      "body": "Generated apps use vr dev, vr build, vr test, and vr doctor so project commands stay conventional."
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
}
