import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const routingGuardsArticle = {
  "key": "routingGuards",
  "section": "framework",
  "path": "/docs/routing/guards",
  "label": "Guards",
  "title": "Routing Guards",
  "summary": "Route guards decide whether navigation may continue, redirect, or stop before a protected page renders.",
  "status": "production-ready-through-phase-15",
  "sections": [
    {
      "id": "guard-purpose",
      "title": "Guard purpose",
      "body": "Guards are the navigation boundary for authentication, permissions, feature readiness, and route-level checks. They should be explicit route policy instead of hidden checks inside every protected page.",
      "points": [
        "Use guards for navigation decisions, not for page rendering details.",
        "Return redirects when the user should land somewhere else.",
        "Keep guard inputs small so tests can cover them directly."
      ],
      "code": {
        "title": "Guard shape",
        "code": "import type { RouteGuard } from '@vanrot/router';\\n\\nconst requireSession: RouteGuard = ({ context }) => {\\n  return context.session ? true : { redirectTo: '/login' };\\n};"
      }
    },
    {
      "id": "guard-debugging",
      "title": "Guard debugging",
      "body": "When navigation stops unexpectedly, inspect guard order, guard context, and redirect targets before changing page code. A blocked route often means the guard is doing exactly what it was told to do with stale context.",
      "points": [
        "Log or test the guard input rather than the rendered page.",
        "Check redirect targets for loops.",
        "Keep async guard work cancellable or bounded."
      ]
    },
    {
      "id": "guard-production",
      "title": "Guard production",
      "body": "Production guards should be deterministic and boring. They should read stable state, return clear decisions, and let the router report diagnostics when a redirect or blocked restore cannot be resolved.",
      "points": [
        "Keep data fetching outside the guard when it belongs to the page.",
        "Use typed route refs for redirects when available.",
        "Test denied, allowed, and redirected paths."
      ]
    }
  ]
} as const;

const sectionLinks = routingGuardsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class GuardsPage {
  title(): string {
    return routingGuardsArticle.title;
  }

  summary(): string {
    return routingGuardsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = routingGuardsArticle.sections[0].body;
  section1Body = routingGuardsArticle.sections[1].body;
  section2Body = routingGuardsArticle.sections[2].body;
  section0Points = routingGuardsArticle.sections[0].points ?? [];
  section1Points = routingGuardsArticle.sections[1].points ?? [];
  section2Points = routingGuardsArticle.sections[2].points ?? [];
  section0Code = routingGuardsArticle.sections[0].code?.code ?? '';
}
