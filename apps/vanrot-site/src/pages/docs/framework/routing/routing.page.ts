import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const routingArticle = {
  "key": "routing",
  "section": "framework",
  "path": "/docs/routing",
  "label": "Routing",
  "title": "Routing",
  "summary": "@vanrot/router owns route refs, nested layouts, params, query strings, redirects, guards, active links, breadcrumbs, preloading, keepAlive, route diagnostics, and current route state.",
  "status": "production-ready-through-phase-15",
  "sections": [
    {
      "id": "router-boundary",
      "title": "Router boundary",
      "body": "The router is the typed navigation layer between Vanrot application code and page rendering. It keeps paths, labels, route refs, params, query strings, guards, redirects, breadcrumbs, preload policy, and keepAlive state in explicit route definitions.",
      "points": [
        "Use createRoutes and defineRoutes as the source of truth for route tables.",
        "Use route refs instead of repeating path strings in components.",
        "Use diagnostics when route state is valid TypeScript but invalid navigation behavior."
      ],
      "code": {
        "title": "Route table",
        "code": "import { createRoutes, defineRoutes } from '@vanrot/router';\\n\\nconst routes = createRoutes();\\n\\nexport const appRoute = defineRoutes({\\n  home: routes.page({ path: '', label: 'Home', page: HomePage }),\\n  settings: routes.page({ path: 'settings', label: 'Settings', page: SettingsPage }),\\n});"
      }
    },
    {
      "id": "navigation-model",
      "title": "Navigation model",
      "body": "Vanrot routing treats navigation as data, not loose string assembly. Route refs, path params, query definitions, redirects, guards, active link policy, and breadcrumbs all come from named route definitions that tools can inspect.",
      "points": [
        "Use buildRouteUrl when code needs a URL from a route ref.",
        "Use matchRoute and matchRouteChain when resolving the current page and layout chain.",
        "Use getCurrentRouteChain for runtime surfaces that need current route context."
      ]
    },
    {
      "id": "runtime-behavior",
      "title": "Runtime behavior",
      "body": "The runtime side of routing resolves the page, enforces guards, follows redirects, restores keepAlive views, updates active links, and records diagnostics for blocked restores or invalid route states.",
      "points": [
        "Keep route guards side-effect-light so navigation remains understandable.",
        "Use keepAlive only when restoring view state is worth the retained memory.",
        "Use preload policy for intent-driven loading instead of eager-loading every page."
      ],
      "code": {
        "title": "Build a typed URL",
        "code": "import { buildRouteUrl } from '@vanrot/router';\\n\\nconst href = buildRouteUrl(appRoute.settings, {\\n  query: { tab: 'profile' },\\n});"
      }
    },
    {
      "id": "child-guides",
      "title": "Child guides",
      "body": "The child pages split the router into concrete work areas: route tables, params and query strings, layouts and redirects, guards, navigation polish, and performance features such as preloading and keepAlive.",
      "points": [
        "Start with Route Table for the core definition model.",
        "Use Params and Query when URLs carry data.",
        "Use Preloading and KeepAlive only after the route table is already correct."
      ]
    }
  ]
} as const;

const sectionLinks = routingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RoutingPage {
  title(): string {
    return routingArticle.title;
  }

  summary(): string {
    return routingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = routingArticle.sections[0].body;
  section1Body = routingArticle.sections[1].body;
  section2Body = routingArticle.sections[2].body;
  section3Body = routingArticle.sections[3].body;
  section0Points = routingArticle.sections[0].points ?? [];
  section1Points = routingArticle.sections[1].points ?? [];
  section2Points = routingArticle.sections[2].points ?? [];
  section3Points = routingArticle.sections[3].points ?? [];
  section0Code = routingArticle.sections[0].code?.code ?? '';
  section2Code = routingArticle.sections[2].code?.code ?? '';
}
