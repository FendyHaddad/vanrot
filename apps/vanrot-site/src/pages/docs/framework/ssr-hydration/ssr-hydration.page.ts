import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const ssrHydrationArticle = {
  "key": "ssrHydration",
  "section": "framework",
  "path": "/docs/ssr-hydration",
  "label": "SSR and Hydration",
  "title": "SSR And Hydration",
  "summary": "Use @vanrot/ssr for deterministic server markup, shell output, escaped hydration state, route-aware rendering, and explicit hydration diagnostics.",
  "status": "production-ready",
  "sections": [
    {
      "id": "package-boundary",
      "title": "Package Boundary",
      "body": "SSR ships as @vanrot/ssr so server rendering, shell generation, serialized state, and mismatch diagnostics stay out of the tiny browser runtime while still using compiler-owned page output.",
      "points": [
        "Keep @vanrot/runtime browser-first and below the gzip cap.",
        "Use renderToString for component modules that expose renderToHtml.",
        "Use renderDocument for head, assets, body markup, and hydration state."
      ]
    },
    {
      "id": "hydration-contract",
      "title": "Hydration Contract",
      "body": "hydrate attaches client behavior to existing server markup when a module exposes hydrateComponent. It compares expected HTML first and returns deterministic diagnostics instead of repairing silently.",
      "points": [
        "onMount work remains client-only.",
        "Event replay is explicitly deferred in the first SSR release.",
        "Mismatches cover text, attributes, node order, missing nodes, extra nodes, state, and route divergence."
      ],
      "code": {
        "title": "Attach behavior after server markup exists",
        "code": "const result = hydrate(ProfilePage, host, {\\n  expectedHtml: host.innerHTML,\\n  source: 'profile.page.html',\\n});\\n\\nif (result.diagnostics.length > 0) {\\n  console.warn(result.diagnostics);\\n}"
      }
    },
    {
      "id": "router-ssr",
      "title": "Router SSR",
      "body": "resolveSsrRoute reuses the route table and route refs so params, query values, redirects, guards, and lazy page boundaries behave like router-owned navigation instead of string literal routing.",
      "points": [
        "Resolve the same route refs used by the client router.",
        "Report redirect and guard outcomes before rendering a body.",
        "Carry route divergence diagnostics into hydration checks."
      ],
      "code": {
        "title": "Render a route",
        "code": "const body = await renderRouteToString(routes, '/account/42');\\nconst html = renderDocument({\\n  title: 'Account',\\n  body,\\n  state: { route: '/account/42' },\\n  assets: { scripts: ['main.js'] },\\n});"
      }
    },
    {
      "id": "deferred-streaming",
      "title": "Deferred Streaming",
      "body": "Streaming, event replay, partial hydration, islands, and resumability are deliberately deferred until the non-streaming render, hydration, diagnostics, router integration, shell, and serialized-state contracts stay stable.",
      "points": [
        "Ship deterministic static render and hydration before streaming.",
        "Keep event replay out until listener timing is diagnosable.",
        "Treat islands and resumability as separate future pipeline work."
      ]
    }
  ]
} as const;

const sectionLinks = ssrHydrationArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class SsrHydrationPage {
  title(): string {
    return ssrHydrationArticle.title;
  }

  summary(): string {
    return ssrHydrationArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = ssrHydrationArticle.sections[0].body;
  section1Body = ssrHydrationArticle.sections[1].body;
  section2Body = ssrHydrationArticle.sections[2].body;
  section3Body = ssrHydrationArticle.sections[3].body;
  section0Points = ssrHydrationArticle.sections[0].points ?? [];
  section1Points = ssrHydrationArticle.sections[1].points ?? [];
  section2Points = ssrHydrationArticle.sections[2].points ?? [];
  section3Points = ssrHydrationArticle.sections[3].points ?? [];
  section1Code = ssrHydrationArticle.sections[1].code?.code ?? '';
  section2Code = ssrHydrationArticle.sections[2].code?.code ?? '';
}
