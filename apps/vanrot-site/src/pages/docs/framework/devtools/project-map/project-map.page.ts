import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const devtoolsProjectMapArticle = {
  "key": "devtoolsProjectMap",
  "section": "framework",
  "path": "/docs/devtools/project-map",
  "label": "Project Map",
  "title": "Devtools Project Map",
  "summary": "The project map manifest describes Vanrot role files, graph nodes, graph edges, routes, compiler metadata, AI metadata, and stale state.",
  "status": "production-ready-through-phase-23",
  "sections": [
    {
      "id": "manifest-shape",
      "title": "Manifest shape",
      "body": "The project map manifest is a generated description of the application. It includes schemaVersion, generatedAt, root, stale state, grouped roles, i18n metadata, graph nodes, graph edges, route entries, compiler metadata, and AI rules metadata.",
      "points": [
        "Use projectMapGraphSchemaVersion to identify the manifest shape.",
        "Use roles to show source role files by type.",
        "Use graph nodes and edges to inspect relationships between framework objects."
      ],
      "code": {
        "title": "Manifest fields",
        "code": "import { projectMapGraphSchemaVersion, type ProjectGraphManifest } from '@vanrot/devtools';\\n\\nconst manifest: ProjectGraphManifest = {\\n  schemaVersion: projectMapGraphSchemaVersion,\\n  generatedAt: new Date().toISOString(),\\n  root: process.cwd(),\\n  stale: { isStale: false, reasons: [] },\\n  roles: { components: [], pages: [], dialogs: [], layouts: [], widgets: [], forms: [] },\\n  i18n: { locales: [] },\\n  graph: { nodes: [], edges: [] },\\n  routes: [],\\n  compiler: { files: [] },\\n  ai: { rules: [] },\\n};"
      }
    },
    {
      "id": "role-groups",
      "title": "Role groups",
      "body": "Role groups let devtools explain the project in Vanrot language: components, pages, dialogs, layouts, widgets, and forms. This is more useful than showing a raw file tree when debugging framework structure.",
      "points": [
        "Use role groups for sidebar or inventory views.",
        "Use graph edges for dependencies between files.",
        "Use route entries for navigation-specific inspection."
      ]
    },
    {
      "id": "map-debugging",
      "title": "Map debugging",
      "body": "If the project map is wrong, rerun the map command before changing devtools. The panel can only render what the generated manifest says, and stale state should point back to the producer.",
      "points": [
        "Check stale reasons before trusting graph gaps.",
        "Check role suffixes when files are missing from groups.",
        "Check route discovery when route entries are empty."
      ]
    }
  ]
} as const;

const sectionLinks = devtoolsProjectMapArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ProjectMapPage {
  title(): string {
    return devtoolsProjectMapArticle.title;
  }

  summary(): string {
    return devtoolsProjectMapArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = devtoolsProjectMapArticle.sections[0].body;
  section1Body = devtoolsProjectMapArticle.sections[1].body;
  section2Body = devtoolsProjectMapArticle.sections[2].body;
  section0Points = devtoolsProjectMapArticle.sections[0].points ?? [];
  section1Points = devtoolsProjectMapArticle.sections[1].points ?? [];
  section2Points = devtoolsProjectMapArticle.sections[2].points ?? [];
  section0Code = devtoolsProjectMapArticle.sections[0].code?.code ?? '';
}
