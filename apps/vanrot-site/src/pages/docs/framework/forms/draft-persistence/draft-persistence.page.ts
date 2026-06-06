import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formsDraftPersistenceArticle = {
  "key": "formsDraftPersistence",
  "section": "framework",
  "path": "/docs/forms/draft-persistence",
  "label": "Draft persistence",
  "title": "Draft Persistence",
  "summary": "Draft persistence saves recoverable form state while protecting sensitive fields and keeping restore behavior explicit.",
  "status": "production-ready",
  "sections": [
    {
      "id": "draft-persistence",
      "title": "Recoverable form state",
      "body": "Draft persistence belongs to the form package because it depends on form refs, dirty state, schema shape, and sensitive-field policy. Users can persist safe fields, exclude sensitive values, restore drafts after navigation, and clear drafts after a successful submit.",
      "points": [
        "Persist only fields marked safe for drafts.",
        "Exclude passwords, tokens, payment details, and other sensitive values by default.",
        "Version draft payloads so schema changes do not restore invalid shapes.",
        "Clear drafts on successful submit or explicit reset."
      ],
      "code": {
        "title": "Draft policy",
        "code": "form.persistDraft({\\n  key: 'claim-draft',\\n  include: [claimFields.claimantName, claimFields.receiptAmount],\\n});"
      }
    }
  ]
} as const;

const sectionLinks = formsDraftPersistenceArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DraftPersistencePage {
  title(): string {
    return formsDraftPersistenceArticle.title;
  }

  summary(): string {
    return formsDraftPersistenceArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formsDraftPersistenceArticle.sections[0].body;
  section0Points = formsDraftPersistenceArticle.sections[0].points ?? [];
  section0Code = formsDraftPersistenceArticle.sections[0].code?.code ?? '';
}
