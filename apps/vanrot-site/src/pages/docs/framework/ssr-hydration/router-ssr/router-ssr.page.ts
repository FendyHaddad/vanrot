import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const ssrRouterArticle = {
  "key": "ssrRouter",
  "section": "framework",
  "path": "/docs/ssr-hydration/router-ssr",
  "label": "Router SSR",
  "title": "Router SSR",
  "summary": "SSR route rendering uses route refs, params, query parsing, guards, redirects, and lazy boundaries from the same router contract as client navigation.",
  "status": "production-ready",
  "sections": [
    {
      "id": "route-resolution",
      "title": "Route resolution",
      "body": "resolveSsrRoute matches a URL against the route table before rendering. The result carries params, query values, matched route metadata, redirects, and guard outcomes.",
      "points": [
        "Use route refs rather than string-only matching.",
        "Preserve params and query behavior from the client router.",
        "Return diagnostics when no SSR route matches."
      ],
      "code": {
        "title": "Resolve then render",
        "code": "const match = await resolveSsrRoute(routes, '/account/42?tab=billing');\\n\\nif (match.kind === 'page') {\\n  return renderRouteToString(match.route, match.params);\\n}"
      }
    },
    {
      "id": "guards-redirects",
      "title": "Guards and redirects",
      "body": "Server routing must respect guard and redirect results before page rendering. That keeps private routes, login redirects, and canonical URLs consistent between server and client.",
      "points": [
        "Return redirect responses before rendering a body.",
        "Expose guard diagnostics for terminal output.",
        "Keep route policy in the route table."
      ]
    },
    {
      "id": "lazy-boundaries",
      "title": "Lazy boundaries",
      "body": "Lazy route modules can load on the server, but unresolved modules should produce a clear SSR diagnostic. The first release should prefer deterministic failure over silent fallback HTML.",
      "points": [
        "Await lazy page modules before render.",
        "Report missing server exports with file context.",
        "Keep preloading behavior separate from SSR rendering."
      ]
    }
  ]
} as const;

const sectionLinks = ssrRouterArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RouterSsrPage {
  title(): string {
    return ssrRouterArticle.title;
  }

  summary(): string {
    return ssrRouterArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = ssrRouterArticle.sections[0].body;
  section1Body = ssrRouterArticle.sections[1].body;
  section2Body = ssrRouterArticle.sections[2].body;
  section0Points = ssrRouterArticle.sections[0].points ?? [];
  section1Points = ssrRouterArticle.sections[1].points ?? [];
  section2Points = ssrRouterArticle.sections[2].points ?? [];
  section0Code = ssrRouterArticle.sections[0].code?.code ?? '';
}
