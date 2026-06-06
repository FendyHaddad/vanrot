import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const ssrHydrationContractArticle = {
  "key": "ssrHydrationContract",
  "section": "framework",
  "path": "/docs/ssr-hydration/hydration-contract",
  "label": "Hydration contract",
  "title": "Hydration Contract",
  "summary": "Hydration attaches behavior to server markup and reports deterministic mismatches instead of silently replacing user-visible HTML.",
  "status": "production-ready",
  "sections": [
    {
      "id": "attach-client",
      "title": "Attach client behavior",
      "body": "hydrate runs on the client after server markup already exists. It attaches listeners and component state to the current DOM instead of rendering a second copy of the page.",
      "points": [
        "Client lifecycle starts after hydration begins.",
        "Server markup remains the initial source of truth.",
        "Hydration receives the expected HTML or metadata from SSR."
      ],
      "code": {
        "title": "Hydrate a page",
        "code": "const result = hydrate(ProfilePage, document.querySelector('#app'), {\\n  expectedHtml: window.__vanrot_hydration_state__.html,\\n  source: 'profile.page.html',\\n});\\n\\nfor (const diagnostic of result.diagnostics) console.warn(diagnostic);"
      }
    },
    {
      "id": "mismatch-diagnostics",
      "title": "Mismatch diagnostics",
      "body": "Mismatch diagnostics name the node, attribute, route, or serialized state that diverged. That makes SSR failures visible in terminals, test output, and future devtool surfaces.",
      "points": [
        "Report text and attribute mismatch locations.",
        "Report missing and extra nodes.",
        "Include file and route metadata when available."
      ]
    },
    {
      "id": "client-only-work",
      "title": "Client-only work",
      "body": "Client-only work such as onMount, browser storage, focus management, and measurement must wait until hydration starts. SSR should warn when those APIs run during server render.",
      "points": [
        "Keep DOM measurement out of server render.",
        "Defer subscriptions that require browser globals.",
        "Preserve terminal diagnostics for compiler-owned mistakes."
      ]
    }
  ]
} as const;

const sectionLinks = ssrHydrationContractArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class HydrationContractPage {
  title(): string {
    return ssrHydrationContractArticle.title;
  }

  summary(): string {
    return ssrHydrationContractArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = ssrHydrationContractArticle.sections[0].body;
  section1Body = ssrHydrationContractArticle.sections[1].body;
  section2Body = ssrHydrationContractArticle.sections[2].body;
  section0Points = ssrHydrationContractArticle.sections[0].points ?? [];
  section1Points = ssrHydrationContractArticle.sections[1].points ?? [];
  section2Points = ssrHydrationContractArticle.sections[2].points ?? [];
  section0Code = ssrHydrationContractArticle.sections[0].code?.code ?? '';
}
