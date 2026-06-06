import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const limitationsArticle = {
  "key": "limitations",
  "section": "reference",
  "path": "/docs/limitations",
  "label": "Limitations",
  "title": "Limitations And Deferred Work",
  "summary": "Read honest status notes for demo-capable, limited, deferred, and not-browser-facing areas before using Vanrot in production contexts.",
  "status": "phase-24-active",
  "sections": [
    {
      "id": "post-production",
      "title": "Post-Production Work",
      "body": "Phase 17 through Phase 22 remain post-production implementation ideas. The docs must not present brutalist UI, expanded testing, store, forms, async resources, SSR, or hydration as current behavior."
    },
    {
      "id": "deployment",
      "title": "Deployment Limits",
      "body": "Phase 24 prepares docs and site output for deployment readiness. It does not perform DNS changes, manage credentials, configure analytics vendors, or launch the live site."
    },
    {
      "id": "small-fixes",
      "title": "Small Fixes",
      "body": "If documentation reveals a small broken contract that blocks truthful docs, fix it inside the owning package with tests. Do not add new framework features under the cover of documentation."
    }
  ]
} as const;

const sectionLinks = limitationsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class LimitationsPage {
  title(): string {
    return limitationsArticle.title;
  }

  summary(): string {
    return limitationsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = limitationsArticle.sections[0].body;
  section1Body = limitationsArticle.sections[1].body;
  section2Body = limitationsArticle.sections[2].body;
}
