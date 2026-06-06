import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const configurationRouterArticle = {
  "key": "configurationRouter",
  "section": "framework",
  "path": "/docs/configuration/router",
  "label": "Router Config",
  "title": "Router Configuration",
  "summary": "Router configuration controls diagnostics and navigation polish settings consumed by @vanrot/router and related tooling.",
  "status": "production-ready-through-phase-15",
  "sections": [
    {
      "id": "router-domain",
      "title": "Router domain",
      "body": "The router domain lets projects tune routing diagnostics and navigation polish without passing ad hoc options through every route table. The config package normalizes this domain before router helpers consume it.",
      "points": [
        "Use diagnostics settings to control how route issues are reported.",
        "Use navigation polish settings for active links, breadcrumbs, and related behavior.",
        "Keep route definitions in code and route policy in config when the setting is project-wide."
      ],
      "code": {
        "title": "Router domain",
        "code": "import { defineVanrotConfig, vanrotRouterDiagnosticLevel } from '@vanrot/config';\\n\\nexport default defineVanrotConfig({\\n  router: {\\n    diagnostics: { level: vanrotRouterDiagnosticLevel.warning },\\n  },\\n});"
      }
    },
    {
      "id": "diagnostic-policy",
      "title": "Diagnostic policy",
      "body": "Router diagnostics should be strict enough to catch broken navigation but adjustable enough for migration. A project can choose how loudly route problems should be reported while still using typed route definitions.",
      "points": [
        "Use stricter settings before release gates.",
        "Use warning-level reporting while migrating a large route table.",
        "Do not silence diagnostics just to hide missing route refs."
      ]
    },
    {
      "id": "config-router-debugging",
      "title": "Debug router config",
      "body": "When route behavior disagrees with expectations, separate route-table bugs from project-level router settings. Check config first, then inspect route definitions, then inspect runtime navigation state.",
      "points": [
        "Validate config before changing route code.",
        "Check the router guide for route refs and keepAlive behavior.",
        "Use devtools graph data when route metadata looks stale."
      ]
    }
  ]
} as const;

const sectionLinks = configurationRouterArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RouterPage {
  title(): string {
    return configurationRouterArticle.title;
  }

  summary(): string {
    return configurationRouterArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = configurationRouterArticle.sections[0].body;
  section1Body = configurationRouterArticle.sections[1].body;
  section2Body = configurationRouterArticle.sections[2].body;
  section0Points = configurationRouterArticle.sections[0].points ?? [];
  section1Points = configurationRouterArticle.sections[1].points ?? [];
  section2Points = configurationRouterArticle.sections[2].points ?? [];
  section0Code = configurationRouterArticle.sections[0].code?.code ?? '';
}
