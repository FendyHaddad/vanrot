import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const storeActionsArticle = {
  "key": "storeActions",
  "section": "framework",
  "path": "/docs/store/actions",
  "label": "Actions",
  "title": "Store Actions",
  "summary": "Store actions use fluent actionSet declarations so workflow lifecycle phases stay grouped under one action name without repeated string literals.",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "id": "fluent-action-sets",
      "title": "Fluent action sets",
      "body": "Actions are declared as lifecycle sets. A workflow such as loading claims owns start, success, and error creators under one property. The store name and action name generate stable type strings internally, so application code references action creators instead of copying type strings across files.",
      "points": [
        "Use start for user or app intent.",
        "Use success for completed work with typed result data.",
        "Use error for normalized StoreError payloads.",
        "Keep action names as properties on the object passed to defineActions."
      ],
      "code": {
        "title": "Action set",
        "code": "export const claimsActions = defineActions(claimsStoreName, {\\n  loadClaims: actionSet()\\n    .start<{ accountId: string; filters: ClaimFilters }>()\\n    .success<{ accountId: string; claims: Claim[] }>()\\n    .error<{ accountId: string; error: StoreError }>(),\\n\\n  selectClaim: actionSet()\\n    .start<{ claimId: string }>()\\n    .success<{ claimId: string }>()\\n    .error<{ claimId: string; error: StoreError }>(),\\n});"
      }
    },
    {
      "id": "generated-types",
      "title": "Generated action metadata",
      "body": "Every creator carries metadata for type, storeName, actionName, and phase. Tests and effects can compare creator.type without inventing a registry. The generated string is an implementation detail; app code should keep passing creator references into reducers and effects.",
      "points": [
        "Pass claimsActions.loadClaims.start into effect() and reducer on().",
        "Read action.accountId, action.claims, or action.error from typed payloads.",
        "Avoid dispatching raw object literals unless a test is intentionally exercising dispatch.",
        "Use a named store key constant for the store name source of truth."
      ],
      "code": {
        "title": "Dispatch through useStore",
        "code": "loadClaims() {\\n  this.store.action.loadClaims.start({\\n    accountId: this.accountId(),\\n    filters: this.filters(),\\n  });\\n}"
      }
    }
  ]
} as const;

const sectionLinks = storeActionsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ActionsPage {
  title(): string {
    return storeActionsArticle.title;
  }

  summary(): string {
    return storeActionsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = storeActionsArticle.sections[0].body;
  section1Body = storeActionsArticle.sections[1].body;
  section0Points = storeActionsArticle.sections[0].points ?? [];
  section1Points = storeActionsArticle.sections[1].points ?? [];
  section0Code = storeActionsArticle.sections[0].code?.code ?? '';
  section1Code = storeActionsArticle.sections[1].code?.code ?? '';
}
