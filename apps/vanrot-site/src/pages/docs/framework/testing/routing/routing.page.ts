import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const testingRoutingArticle = {
  "key": "testingRouting",
  "section": "framework",
  "path": "/docs/testing/routing",
  "label": "Routing Tests",
  "title": "Testing Routing",
  "summary": "Routing tests verify route refs, paths, params, query values, redirects, guards, lazy pages, active state, preloading, and cleanup at the router boundary.",
  "status": "production-ready",
  "sections": [
    {
      "id": "route-table-tests",
      "title": "Route table tests",
      "body": "Route table tests should assert stable route refs and paths directly. Use setupRouterTest when the route behavior also needs navigation, params, query values, redirects, guards, lazy pages, or cleanup.",
      "points": [
        "Assert route.path for public docs and app routes.",
        "Assert route keys when the sidebar or navigation depends on them.",
        "Keep route tests near the route source of truth."
      ],
      "code": {
        "title": "Route path assertion",
        "code": "const router = await setupRouterTest(route, {\\n  initialRoute: route.profile,\\n  params: { id: '42' },\\n});\\n\\nrouter.expect.currentRoute(route.profile);\\nrouter.expect.params({ id: '42' });"
      }
    },
    {
      "id": "guard-tests",
      "title": "Guard tests",
      "body": "Guard tests should assert allow, deny, or redirect behavior through route refs. A guard is easier to trust when setupRouterTest proves the redirected current route and query values without relying on repeated route strings.",
      "points": [
        "Test authenticated and unauthenticated paths.",
        "Test missing params when guards depend on route data.",
        "Test redirect targets to avoid loops."
      ]
    },
    {
      "id": "navigation-tests",
      "title": "Navigation tests",
      "body": "Navigation tests cover current route state, active links, breadcrumbs, preloading, lazy pages, and keepAlive diagnostics. Keep these tests close to the helper that owns the behavior rather than hiding them in broad page snapshots.",
      "points": [
        "Use router cleanup between tests.",
        "Use route preload diagnostics when testing preload policy.",
        "Assert breadcrumbs from route metadata, not duplicated strings."
      ]
    }
  ]
} as const;

const sectionLinks = testingRoutingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RoutingPage {
  title(): string {
    return testingRoutingArticle.title;
  }

  summary(): string {
    return testingRoutingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = testingRoutingArticle.sections[0].body;
  section1Body = testingRoutingArticle.sections[1].body;
  section2Body = testingRoutingArticle.sections[2].body;
  section0Points = testingRoutingArticle.sections[0].points ?? [];
  section1Points = testingRoutingArticle.sections[1].points ?? [];
  section2Points = testingRoutingArticle.sections[2].points ?? [];
  section0Code = testingRoutingArticle.sections[0].code?.code ?? '';
}
