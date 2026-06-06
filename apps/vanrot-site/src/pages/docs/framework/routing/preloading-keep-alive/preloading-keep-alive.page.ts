import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const routingPreloadingKeepAliveArticle = {
  "key": "routingPreloadingKeepAlive",
  "section": "framework",
  "path": "/docs/routing/preloading-keep-alive",
  "label": "Preloading and KeepAlive",
  "title": "Routing Preloading and KeepAlive",
  "summary": "Preloading and keepAlive improve navigation responsiveness and state restoration when a route really benefits from retained work.",
  "status": "production-ready-through-phase-15",
  "sections": [
    {
      "id": "preload-policy",
      "title": "Preload policy",
      "body": "Preload policy decides when route code should be prepared before the user navigates. Use it for high-confidence next screens, not as a blanket replacement for thoughtful route splitting.",
      "points": [
        "Use intent preloading for likely next clicks.",
        "Avoid eager preloading every route in a large app.",
        "Inspect preload diagnostics in tests when policies do not fire."
      ],
      "code": {
        "title": "Preload policy",
        "code": "const route = defineRoutes({\\n  reports: routes.page({\\n    path: 'reports',\\n    label: 'Reports',\\n    page: ReportsPage,\\n    preload: { kind: 'intent' },\\n  }),\\n});"
      }
    },
    {
      "id": "keep-alive",
      "title": "KeepAlive",
      "body": "keepAlive preserves a route view so returning to it can restore local state. Use it for expensive or stateful screens, and avoid it for pages where fresh data and cleanup are more important than restoration.",
      "points": [
        "Use createKeepAliveRouteIdentity when storing retained route views.",
        "Clear keepAlive state in tests so cases do not leak into each other.",
        "Watch diagnostics for blocked restores."
      ]
    },
    {
      "id": "performance-debugging",
      "title": "Performance debugging",
      "body": "If routing feels slow, separate loading time from rendering time and retained-state bugs. Preload policy, page module resolution, guard work, and keepAlive restoration each fail in different ways.",
      "points": [
        "Check whether the page module was preloaded before navigation.",
        "Check whether a guard is delaying navigation.",
        "Check whether keepAlive is retaining too many route views."
      ]
    }
  ]
} as const;

const sectionLinks = routingPreloadingKeepAliveArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class PreloadingKeepAlivePage {
  title(): string {
    return routingPreloadingKeepAliveArticle.title;
  }

  summary(): string {
    return routingPreloadingKeepAliveArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = routingPreloadingKeepAliveArticle.sections[0].body;
  section1Body = routingPreloadingKeepAliveArticle.sections[1].body;
  section2Body = routingPreloadingKeepAliveArticle.sections[2].body;
  section0Points = routingPreloadingKeepAliveArticle.sections[0].points ?? [];
  section1Points = routingPreloadingKeepAliveArticle.sections[1].points ?? [];
  section2Points = routingPreloadingKeepAliveArticle.sections[2].points ?? [];
  section0Code = routingPreloadingKeepAliveArticle.sections[0].code?.code ?? '';
}
