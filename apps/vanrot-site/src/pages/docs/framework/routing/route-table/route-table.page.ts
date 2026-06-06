import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const routingRouteTableArticle = {
  "key": "routingRouteTable",
  "section": "framework",
  "path": "/docs/routing/route-table",
  "label": "Route Table",
  "title": "Routing Route Table",
  "summary": "Route tables use createRoutes and defineRoutes to keep paths, labels, pages, layouts, redirects, and route refs in one named structure.",
  "status": "production-ready-through-phase-15",
  "sections": [
    {
      "id": "definition-model",
      "title": "Definition model",
      "body": "A route table is a named object of page, layout, and redirect definitions. It should be the only place where route paths and labels are introduced, because every component and docs page can then refer to route refs.",
      "points": [
        "Use page definitions for renderable screens.",
        "Use layout definitions when child routes share chrome or outlet state.",
        "Use redirect definitions for canonical navigation aliases."
      ],
      "code": {
        "title": "Define route table",
        "code": "import { createRoutes, defineRoutes } from '@vanrot/router';\\n\\nconst routes = createRoutes();\\n\\nexport const route = defineRoutes({\\n  docs: routes.layout({ path: 'docs', label: 'Docs', layout: DocsLayout }),\\n  docsIntro: routes.page({ path: 'docs/introduction', label: 'Introduction', page: DocsArticlePage }),\\n});"
      }
    },
    {
      "id": "route-refs",
      "title": "Route refs",
      "body": "Route refs are the reason the table exists. Components, links, breadcrumbs, tests, and docs should reference the route object instead of repeating a string that can drift away from the source of truth.",
      "points": [
        "Export the route table from a single module.",
        "Use route keys that describe the destination, not the current path string.",
        "Keep route refs stable when changing a URL for product reasons."
      ]
    },
    {
      "id": "table-diagnostics",
      "title": "Table diagnostics",
      "body": "Route tables should be easy to diagnose. Duplicate paths, missing pages, broken child relationships, or impossible redirects should create route diagnostics before the app reaches a confusing blank state.",
      "points": [
        "Use routeDiagnosticCodes for repeated route issues.",
        "Create diagnostics near the route helper that detects the problem.",
        "Prefer a precise route error over a later runtime crash."
      ]
    }
  ]
} as const;

const sectionLinks = routingRouteTableArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RouteTablePage {
  title(): string {
    return routingRouteTableArticle.title;
  }

  summary(): string {
    return routingRouteTableArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = routingRouteTableArticle.sections[0].body;
  section1Body = routingRouteTableArticle.sections[1].body;
  section2Body = routingRouteTableArticle.sections[2].body;
  section0Points = routingRouteTableArticle.sections[0].points ?? [];
  section1Points = routingRouteTableArticle.sections[1].points ?? [];
  section2Points = routingRouteTableArticle.sections[2].points ?? [];
  section0Code = routingRouteTableArticle.sections[0].code?.code ?? '';
}
