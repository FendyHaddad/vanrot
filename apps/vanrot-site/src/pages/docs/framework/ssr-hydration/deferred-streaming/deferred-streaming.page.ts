import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const ssrDeferredStreamingArticle = {
  "key": "ssrDeferredStreaming",
  "section": "framework",
  "path": "/docs/ssr-hydration/deferred-streaming",
  "label": "Deferred streaming",
  "title": "Deferred Streaming",
  "summary": "Streaming, event replay, partial hydration, islands, and resumability stay future work until the base SSR and hydration contract is stable.",
  "status": "production-ready",
  "sections": [
    {
      "id": "defer-streaming",
      "title": "Defer streaming",
      "body": "The first SSR release should return complete deterministic HTML. Streaming adds timing, flushing, suspense, and resource-ordering complexity that belongs after static SSR is proven.",
      "points": [
        "Finish renderDocument and hydration diagnostics first.",
        "Keep streamed chunks out of the initial package contract.",
        "Add streaming as a future pipeline slice."
      ],
      "code": {
        "title": "Base render stays complete",
        "code": "const body = await renderRouteToString(routes, request.url);\\nreturn new Response(renderDocument({ title, body, state }), {\\n  headers: { 'Content-Type': 'text/html' },\\n});"
      }
    },
    {
      "id": "event-replay",
      "title": "Event replay",
      "body": "Event replay is valuable only when delayed hydration can be measured and diagnosed. Until that is true, clicks and input events should attach after hydration starts.",
      "points": [
        "Avoid queueing user events before the listener contract exists.",
        "Make delayed hydration visible in diagnostics first.",
        "Keep event replay separate from ordinary hydrate."
      ]
    },
    {
      "id": "future-islands",
      "title": "Future islands",
      "body": "Partial hydration, islands, and resumability are larger architecture choices. They should be planned as explicit phases with compiler output, router behavior, resources, and devtools coverage.",
      "points": [
        "Do not mix islands into the base SSR release.",
        "Require compiler and devtools support before implementation.",
        "Keep future pipeline language honest about what has shipped."
      ]
    }
  ]
} as const;

const sectionLinks = ssrDeferredStreamingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DeferredStreamingPage {
  title(): string {
    return ssrDeferredStreamingArticle.title;
  }

  summary(): string {
    return ssrDeferredStreamingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = ssrDeferredStreamingArticle.sections[0].body;
  section1Body = ssrDeferredStreamingArticle.sections[1].body;
  section2Body = ssrDeferredStreamingArticle.sections[2].body;
  section0Points = ssrDeferredStreamingArticle.sections[0].points ?? [];
  section1Points = ssrDeferredStreamingArticle.sections[1].points ?? [];
  section2Points = ssrDeferredStreamingArticle.sections[2].points ?? [];
  section0Code = ssrDeferredStreamingArticle.sections[0].code?.code ?? '';
}
