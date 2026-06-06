import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const routingLayoutsRedirectsArticle = {
  "key": "routingLayoutsRedirects",
  "section": "framework",
  "path": "/docs/routing/layouts-redirects",
  "label": "Layouts and Redirects",
  "title": "Routing Layouts and Redirects",
  "summary": "Layouts and redirects describe nested route structure and canonical navigation targets without putting routing policy in templates.",
  "status": "production-ready-through-phase-15",
  "sections": [
    {
      "id": "layout-routes",
      "title": "Layout routes",
      "body": "Layout routes own shared shell around child pages. Use them when multiple routes share navigation, sidebars, headers, or route outlet behavior instead of duplicating that chrome on every page.",
      "points": [
        "Keep a layout role file focused on shell markup and route outlet placement.",
        "Keep child page state inside the child page when it does not belong to the shell.",
        "Use route chains to understand which layout and page are currently active."
      ],
      "code": {
        "title": "Layout definition",
        "code": "const route = defineRoutes({\\n  docs: routes.layout({ path: 'docs', label: 'Docs', layout: DocsLayout }),\\n  docsRuntime: routes.page({ path: 'docs/runtime', label: 'Runtime', page: DocsArticlePage }),\\n});"
      }
    },
    {
      "id": "redirect-routes",
      "title": "Redirect routes",
      "body": "Redirects are route definitions, not imperative fixes sprinkled through page code. Define redirects when old URLs, aliases, or index paths should move users to one canonical destination.",
      "points": [
        "Keep redirect targets named by route refs where possible.",
        "Avoid redirect loops by testing both source and target paths.",
        "Use diagnostics when redirect configuration cannot resolve a target."
      ]
    },
    {
      "id": "resolve-pages",
      "title": "Resolve pages",
      "body": "Page resolution should flow through router helpers. resolveRoutePage and matchRouteChain keep page loading connected to the route table, which makes nested layouts and redirects easier to reason about.",
      "points": [
        "Use matchRouteChain when layouts and pages need to be resolved together.",
        "Use resolveRoutePage at the boundary that turns a route match into a page module.",
        "Keep route-level page loading separate from component business logic."
      ]
    }
  ]
} as const;

const sectionLinks = routingLayoutsRedirectsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class LayoutsRedirectsPage {
  title(): string {
    return routingLayoutsRedirectsArticle.title;
  }

  summary(): string {
    return routingLayoutsRedirectsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = routingLayoutsRedirectsArticle.sections[0].body;
  section1Body = routingLayoutsRedirectsArticle.sections[1].body;
  section2Body = routingLayoutsRedirectsArticle.sections[2].body;
  section0Points = routingLayoutsRedirectsArticle.sections[0].points ?? [];
  section1Points = routingLayoutsRedirectsArticle.sections[1].points ?? [];
  section2Points = routingLayoutsRedirectsArticle.sections[2].points ?? [];
  section0Code = routingLayoutsRedirectsArticle.sections[0].code?.code ?? '';
}
