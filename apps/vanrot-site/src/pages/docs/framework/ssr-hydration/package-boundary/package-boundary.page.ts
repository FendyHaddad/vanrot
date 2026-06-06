import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const ssrPackageBoundaryArticle = {
  "key": "ssrPackageBoundary",
  "section": "framework",
  "path": "/docs/ssr-hydration/package-boundary",
  "label": "Package boundary",
  "title": "SSR Package Boundary",
  "summary": "@vanrot/ssr owns server-only rendering APIs so runtime, compiler, router, and app code keep clean browser and server responsibilities.",
  "status": "production-ready",
  "sections": [
    {
      "id": "server-package",
      "title": "Server package",
      "body": "@vanrot/ssr is the only package that should own server document rendering, hydration state serialization, and server diagnostics. Application code imports it at the server entry, not inside browser components.",
      "points": [
        "Keep render helpers out of @vanrot/runtime.",
        "Import @vanrot/ssr only from server entries or server tests.",
        "Expose server-safe helpers with explicit names."
      ],
      "code": {
        "title": "Server entry",
        "code": "import { renderDocument, renderToString } from '@vanrot/ssr';\\nimport { ProfilePage } from './profile.page';\\n\\nconst body = await renderToString(ProfilePage, { userId: '42' });\\nconst html = renderDocument({ title: 'Profile', body });"
      }
    },
    {
      "id": "runtime-boundary",
      "title": "Runtime boundary",
      "body": "The browser runtime remains responsible for signals, inputs, mounting, and client lifecycle. The SSR package may call into compiled output, but it must not add server-only branches to the runtime budget.",
      "points": [
        "onMount stays client-only.",
        "SSR diagnostics stay in the server package.",
        "The runtime size cap remains unchanged."
      ]
    },
    {
      "id": "compiler-boundary",
      "title": "Compiler boundary",
      "body": "Compiled pages expose renderable HTML and hydration hooks in a predictable shape. The compiler describes what can render on the server; @vanrot/ssr decides how the document is assembled.",
      "points": [
        "Generated render output stays deterministic.",
        "Client-only APIs receive diagnostics when used during SSR.",
        "Hydration metadata is generated from compiler-owned sources."
      ]
    }
  ]
} as const;

const sectionLinks = ssrPackageBoundaryArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class PackageBoundaryPage {
  title(): string {
    return ssrPackageBoundaryArticle.title;
  }

  summary(): string {
    return ssrPackageBoundaryArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = ssrPackageBoundaryArticle.sections[0].body;
  section1Body = ssrPackageBoundaryArticle.sections[1].body;
  section2Body = ssrPackageBoundaryArticle.sections[2].body;
  section0Points = ssrPackageBoundaryArticle.sections[0].points ?? [];
  section1Points = ssrPackageBoundaryArticle.sections[1].points ?? [];
  section2Points = ssrPackageBoundaryArticle.sections[2].points ?? [];
  section0Code = ssrPackageBoundaryArticle.sections[0].code?.code ?? '';
}
