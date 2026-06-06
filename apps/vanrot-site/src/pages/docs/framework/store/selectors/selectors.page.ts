import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const storeSelectorsArticle = {
  "key": "storeSelectors",
  "section": "framework",
  "path": "/docs/store/selectors",
  "label": "Selectors",
  "title": "Store Selectors",
  "summary": "Store selectors use property names from defineSelectors(state).selectorName(fn), which keeps selector names typed and avoids repeated string literals.",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "id": "property-named-selectors",
      "title": "Property-named selectors",
      "body": "Selectors are named by the fluent property used to define them. That makes the selector key visible in code without passing a string. No-input selectors receive state. Input selectors receive state plus one explicit input such as an account id.",
      "points": [
        "Use no-input selectors for global derived values.",
        "Use input selectors for account, id, tab, or filter-specific reads.",
        "Return page-ready rows when HTML should only render labels and ids.",
        "Keep selector formatting logic in TypeScript, not in the template."
      ],
      "code": {
        "title": "Selector definitions",
        "code": "export const claimsSelectors = defineSelectors(claimsState)\\n  .claimType((state) => state.claimType)\\n  .claimRows((state) => buildClaimRows(state))\\n  .claimsForAccount((state, accountId: string) =>\\n    state.claimsByAccount[accountId] ?? []\\n  )\\n  .isAccountLoading((state, accountId: string) =>\\n    state.loadingByAccount[accountId] ?? false\\n  );"
      }
    },
    {
      "id": "page-facing-signals",
      "title": "Page-facing signals",
      "body": "useStore turns selectors into signal-like reads for page classes. A no-input selector becomes store.select.claimRows(). An input selector becomes store.select.isAccountLoading(accountId). The returned function can be used from page code and then exposed to HTML as a page field.",
      "points": [
        "Call selectors in the page class, not inline inside complex HTML expressions.",
        "Expose row labels or flags as page fields.",
        "Keep repeated string labels in a copy object or model mapper.",
        "Use selectors to make templates boring."
      ],
      "code": {
        "title": "Page selector fields",
        "code": "claimRows = this.store.select.claimRows();\\nisLoading = this.store.select.isAccountLoading(this.accountId());"
      }
    }
  ]
} as const;

const sectionLinks = storeSelectorsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class SelectorsPage {
  title(): string {
    return storeSelectorsArticle.title;
  }

  summary(): string {
    return storeSelectorsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = storeSelectorsArticle.sections[0].body;
  section1Body = storeSelectorsArticle.sections[1].body;
  section0Points = storeSelectorsArticle.sections[0].points ?? [];
  section1Points = storeSelectorsArticle.sections[1].points ?? [];
  section0Code = storeSelectorsArticle.sections[0].code?.code ?? '';
  section1Code = storeSelectorsArticle.sections[1].code?.code ?? '';
}
