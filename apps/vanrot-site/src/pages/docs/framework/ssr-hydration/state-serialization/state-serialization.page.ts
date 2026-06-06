import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const ssrStateSerializationArticle = {
  "key": "ssrStateSerialization",
  "section": "framework",
  "path": "/docs/ssr-hydration/state-serialization",
  "label": "State serialization",
  "title": "State Serialization",
  "summary": "Hydration state is serialized and escaped by @vanrot/ssr so the client can resume with safe route, data, and diagnostic context.",
  "status": "production-ready",
  "sections": [
    {
      "id": "safe-state",
      "title": "Safe state",
      "body": "serializeHydrationState writes JSON that can live inside a script tag without creating an injection path. Values are encoded before they reach the document shell.",
      "points": [
        "Escape HTML-sensitive characters.",
        "Keep state JSON deterministic for tests.",
        "Reject functions, symbols, and unsupported values."
      ],
      "code": {
        "title": "Serialize state",
        "code": "const state = serializeHydrationState({\\n  route: '/claims/42',\\n  claim: { id: '42', status: 'PENDING_REVIEW' },\\n});\\n\\nconst html = renderDocument({ title: 'Claim', body, state });"
      }
    },
    {
      "id": "escaping",
      "title": "Escaping",
      "body": "escapeHtml and escapeAttribute cover normal document output, while state serialization covers script-safe payloads. The API names make the escaping boundary explicit.",
      "points": [
        "Use escapeHtml for text nodes.",
        "Use escapeAttribute for attributes.",
        "Use serializeHydrationState for script payloads."
      ]
    },
    {
      "id": "state-policy",
      "title": "State policy",
      "body": "Only data needed to hydrate should enter the payload. Sensitive fields, one-time secrets, and large server caches should stay on the server and reload through app-owned resources.",
      "points": [
        "Prefer narrow route and resource snapshots.",
        "Do not serialize secrets or access tokens.",
        "Keep payload size visible in SSR diagnostics."
      ]
    }
  ]
} as const;

const sectionLinks = ssrStateSerializationArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class StateSerializationPage {
  title(): string {
    return ssrStateSerializationArticle.title;
  }

  summary(): string {
    return ssrStateSerializationArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = ssrStateSerializationArticle.sections[0].body;
  section1Body = ssrStateSerializationArticle.sections[1].body;
  section2Body = ssrStateSerializationArticle.sections[2].body;
  section0Points = ssrStateSerializationArticle.sections[0].points ?? [];
  section1Points = ssrStateSerializationArticle.sections[1].points ?? [];
  section2Points = ssrStateSerializationArticle.sections[2].points ?? [];
  section0Code = ssrStateSerializationArticle.sections[0].code?.code ?? '';
}
