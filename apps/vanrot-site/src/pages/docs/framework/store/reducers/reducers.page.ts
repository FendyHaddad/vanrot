import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const storeReducersArticle = {
  "key": "storeReducers",
  "section": "framework",
  "path": "/docs/store/reducers",
  "label": "Reducers",
  "title": "Store Reducers",
  "summary": "Store reducers use on(action).patch(fn) for partial immutable updates and on(action).set(fn) for full state replacement.",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "id": "patch-and-set",
      "title": "Patch and set",
      "body": "Reducers stay readable when the update verb matches the shape of the change. Use patch for partial state changes such as setting loading flags or replacing a keyed collection. Use set when the whole state should become a new value, such as clearing a feature back to its initial state.",
      "points": [
        "Pass action creators to on() instead of comparing type strings manually.",
        "Return only the fields that changed from patch().",
        "Use set() for reset flows and full replacement.",
        "Keep service calls and async work out of reducers."
      ],
      "code": {
        "title": "Reducer chain",
        "code": "export const claimsReducer = defineReducer(claimsState)\\n  .on(claimsActions.loadClaims.start)\\n  .patch(({ action }) => ({\\n    loadingByAccount: { [action.accountId]: true },\\n  }))\\n  .on(claimsActions.loadClaims.success)\\n  .patch(({ action }) => ({\\n    claimsByAccount: { [action.accountId]: action.claims },\\n    loadingByAccount: { [action.accountId]: false },\\n  }))\\n  .on(claimsActions.clearClaims.start)\\n  .set(() => claimsInitialState);"
      }
    },
    {
      "id": "immutability-boundary",
      "title": "Immutable update boundary",
      "body": "The reducer API performs shallow merging for patch output. Nested keyed records should be returned as replacement objects for the changed field. For deeper collection updates, build a new object in a helper and return it from patch so the update remains explicit and testable.",
      "points": [
        "Do not mutate state inside reducer callbacks.",
        "Prefer named helpers when a nested update has more than one rule.",
        "Test start, success, error, and reset paths separately.",
        "Keep reducer output deterministic for the same state and action."
      ],
      "code": {
        "title": "Named helper",
        "code": ".patch(({ state, action }) => ({\\n  claimsByAccount: replaceAccountClaims(\\n    state.claimsByAccount,\\n    action.accountId,\\n    action.claims\\n  ),\\n}))"
      }
    }
  ]
} as const;

const sectionLinks = storeReducersArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ReducersPage {
  title(): string {
    return storeReducersArticle.title;
  }

  summary(): string {
    return storeReducersArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = storeReducersArticle.sections[0].body;
  section1Body = storeReducersArticle.sections[1].body;
  section0Points = storeReducersArticle.sections[0].points ?? [];
  section1Points = storeReducersArticle.sections[1].points ?? [];
  section0Code = storeReducersArticle.sections[0].code?.code ?? '';
  section1Code = storeReducersArticle.sections[1].code?.code ?? '';
}
