import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const routingNavigationArticle = {
  "key": "routingNavigation",
  "section": "framework",
  "path": "/docs/routing/navigation",
  "label": "Navigation",
  "title": "Routing Navigation",
  "summary": "Navigation polish covers current route state, active links, breadcrumbs, route params signals, and route diagnostics.",
  "status": "production-ready-through-phase-15",
  "sections": [
    {
      "id": "current-route",
      "title": "Current route",
      "body": "Runtime navigation surfaces should read current route state through router helpers. getCurrentRouteChain returns the active chain so layouts, docs navigation, breadcrumbs, and devtools can react to route changes.",
      "points": [
        "Use the current route chain for navigation highlighting.",
        "Use route params signals when components need param changes.",
        "Avoid duplicating current path parsing in each component."
      ],
      "code": {
        "title": "Read current route",
        "code": "import { getCurrentRouteChain } from '@vanrot/router';\\n\\nconst current = getCurrentRouteChain();\\nconst activeLabel = current?.leaf.route.label;"
      }
    },
    {
      "id": "active-links",
      "title": "Active links",
      "body": "Active link behavior should follow router state instead of string prefix guesses. That matters when nested layouts, redirects, query strings, and aliases all point at the same conceptual section.",
      "points": [
        "Use route refs to compare destinations.",
        "Keep visual active states in CSS and route matching in TypeScript.",
        "Check configuration when navigation polish behaves differently across projects."
      ]
    },
    {
      "id": "breadcrumbs",
      "title": "Breadcrumbs",
      "body": "Breadcrumbs should be route metadata. Labels belong with the route definition, while the rendered breadcrumb trail belongs with the layout or navigation component that reads the active route chain.",
      "points": [
        "Keep breadcrumb labels in the route table.",
        "Use parent route metadata for nested trails.",
        "Do not hard-code breadcrumbs separately from the routes they represent."
      ]
    }
  ]
} as const;

const sectionLinks = routingNavigationArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class NavigationPage {
  title(): string {
    return routingNavigationArticle.title;
  }

  summary(): string {
    return routingNavigationArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = routingNavigationArticle.sections[0].body;
  section1Body = routingNavigationArticle.sections[1].body;
  section2Body = routingNavigationArticle.sections[2].body;
  section0Points = routingNavigationArticle.sections[0].points ?? [];
  section1Points = routingNavigationArticle.sections[1].points ?? [];
  section2Points = routingNavigationArticle.sections[2].points ?? [];
  section0Code = routingNavigationArticle.sections[0].code?.code ?? '';
}
