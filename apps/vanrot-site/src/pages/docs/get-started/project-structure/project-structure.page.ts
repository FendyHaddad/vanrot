import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const projectStructureArticle = {
  "key": "projectStructure",
  "section": "getStarted",
  "path": "/docs/project-structure",
  "label": "Project Structure",
  "title": "Project Structure",
  "summary": "Vanrot keeps source roles explicit with TypeScript, HTML, and CSS side by side.",
  "status": "available-now",
  "sections": [
    {
      "id": "role-files",
      "title": "Role Files",
      "body": "Components use .component.ts/html/css, pages use .page.ts/html/css, layouts use .layout.ts/html/css, and UI primitives use role suffixes such as .button.ts/html/css."
    },
    {
      "id": "source-root",
      "title": "Source Root",
      "body": "vanrot.config.ts owns the source root. The default is src."
    }
  ]
} as const;

const sectionLinks = projectStructureArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ProjectStructurePage {
  title(): string {
    return projectStructureArticle.title;
  }

  summary(): string {
    return projectStructureArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = projectStructureArticle.sections[0].body;
  section1Body = projectStructureArticle.sections[1].body;
}
