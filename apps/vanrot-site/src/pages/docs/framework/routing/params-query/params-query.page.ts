import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const routingParamsQueryArticle = {
  "key": "routingParamsQuery",
  "section": "framework",
  "path": "/docs/routing/params-query",
  "label": "Params and Query",
  "title": "Routing Params and Query",
  "summary": "Params and query helpers parse, fill, match, and build URL data without hand-joining route strings.",
  "status": "production-ready-through-phase-15",
  "sections": [
    {
      "id": "path-params",
      "title": "Path params",
      "body": "Path params belong in route definitions and helper calls, not scattered string templates. extractPathParamNames, fillRoutePath, and matchRoutePath keep path parameter handling consistent across route creation and URL building.",
      "points": [
        "Name params in the path where the route is defined.",
        "Use fillRoutePath when creating a URL with params.",
        "Use matchRoutePath when a path needs to be checked against a route pattern."
      ],
      "code": {
        "title": "Path helpers",
        "code": "import { extractPathParamNames, fillRoutePath, matchRoutePath } from '@vanrot/router';\\n\\nconst names = extractPathParamNames('users/:userId');\\nconst path = fillRoutePath('users/:userId', { userId: '42' });\\nconst match = matchRoutePath('users/:userId', '/users/42');"
      }
    },
    {
      "id": "query-strings",
      "title": "Query strings",
      "body": "Query helpers treat query strings as data. parseRouteQuery returns a structured object, while buildRouteQueryString serializes values for URLs without each caller deciding its own encoding rules.",
      "points": [
        "Use arrays when a query key can appear multiple times.",
        "Keep query keys named by the route or feature that owns them.",
        "Avoid manual string concatenation for query strings."
      ],
      "code": {
        "title": "Query helpers",
        "code": "import { buildRouteQueryString, parseRouteQuery } from '@vanrot/router';\\n\\nconst query = parseRouteQuery('?tab=profile&filter=active');\\nconst search = buildRouteQueryString({ tab: 'profile', filter: ['active', 'staff'] });"
      }
    },
    {
      "id": "url-building",
      "title": "URL building",
      "body": "buildRouteUrl combines route refs, params, and query values into one path. Use it for links and navigation code so a route path change does not require hunting through templates and TypeScript files.",
      "points": [
        "Prefer buildRouteUrl over inline string templates.",
        "Pass params and query as data structures.",
        "Keep URL building close to navigation commands or link data."
      ]
    }
  ]
} as const;

const sectionLinks = routingParamsQueryArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ParamsQueryPage {
  title(): string {
    return routingParamsQueryArticle.title;
  }

  summary(): string {
    return routingParamsQueryArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = routingParamsQueryArticle.sections[0].body;
  section1Body = routingParamsQueryArticle.sections[1].body;
  section2Body = routingParamsQueryArticle.sections[2].body;
  section0Points = routingParamsQueryArticle.sections[0].points ?? [];
  section1Points = routingParamsQueryArticle.sections[1].points ?? [];
  section2Points = routingParamsQueryArticle.sections[2].points ?? [];
  section0Code = routingParamsQueryArticle.sections[0].code?.code ?? '';
  section1Code = routingParamsQueryArticle.sections[1].code?.code ?? '';
}
