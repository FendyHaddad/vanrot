import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const ssrRenderDocumentArticle = {
  "key": "ssrRenderDocument",
  "section": "framework",
  "path": "/docs/ssr-hydration/render-document",
  "label": "Render document",
  "title": "Render Document",
  "summary": "renderDocument owns the final HTML shell: title, head entries, body markup, assets, base paths, and serialized hydration state.",
  "status": "production-ready",
  "sections": [
    {
      "id": "html-shell",
      "title": "HTML shell",
      "body": "renderDocument is the single place where the server builds the document shell. It keeps page markup, asset tags, head entries, and hydration data in one escaped output path.",
      "points": [
        "Set the page title at the document layer.",
        "Append style and script assets through structured options.",
        "Keep app body markup separate from shell metadata."
      ],
      "code": {
        "title": "Document shell",
        "code": "const html = renderDocument({\\n  title: 'Claims',\\n  body: await renderToString(ClaimsPage),\\n  assets: { styles: ['claims.css'], scripts: ['claims.js'] },\\n  state: { route: '/claims' },\\n});"
      }
    },
    {
      "id": "head-entries",
      "title": "Head entries",
      "body": "Head entries use structured fields instead of concatenated strings. That keeps escaping consistent and makes later SEO or adapter work easier to verify.",
      "points": [
        "Use named head entries for meta tags.",
        "Keep unsafe raw HTML out of regular document options.",
        "Prefer asset base paths over repeated URL literals."
      ]
    },
    {
      "id": "asset-output",
      "title": "Asset output",
      "body": "Document rendering should emit predictable asset URLs for Vite, Forge, or future adapters. The server entry passes the asset manifest; the document renderer formats links and modules.",
      "points": [
        "Keep script output module-aware.",
        "Allow an asset base path for deployed subpaths.",
        "Report missing entry assets before returning HTML."
      ]
    }
  ]
} as const;

const sectionLinks = ssrRenderDocumentArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RenderDocumentPage {
  title(): string {
    return ssrRenderDocumentArticle.title;
  }

  summary(): string {
    return ssrRenderDocumentArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = ssrRenderDocumentArticle.sections[0].body;
  section1Body = ssrRenderDocumentArticle.sections[1].body;
  section2Body = ssrRenderDocumentArticle.sections[2].body;
  section0Points = ssrRenderDocumentArticle.sections[0].points ?? [];
  section1Points = ssrRenderDocumentArticle.sections[1].points ?? [];
  section2Points = ssrRenderDocumentArticle.sections[2].points ?? [];
  section0Code = ssrRenderDocumentArticle.sections[0].code?.code ?? '';
}
