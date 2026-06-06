import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const storePageUsageArticle = {
  "key": "storePageUsage",
  "section": "framework",
  "path": "/docs/store/page-usage",
  "label": "Page usage",
  "title": "Store Page Usage",
  "summary": "Pages use useStore(store), expose selector reads and action methods from TypeScript, and keep Vanrot HTML quote-free for TS-bound attributes and method calls.",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "id": "use-store-page-api",
      "title": "useStore in page code",
      "body": "The page owns user-facing methods and fields. It creates a store instance with useStore, exposes selector reads as fields, and starts workflows from methods. This keeps HTML focused on rendering and event wiring while TypeScript owns state and application decisions.",
      "points": [
        "Create the store instance in the page class.",
        "Expose selector reads such as claimRows and isLoading as page fields.",
        "Expose user actions such as loadClaims and selectClaim as methods.",
        "Keep copy values in a named object when the same text appears in more than one place."
      ],
      "code": {
        "title": "Page class",
        "code": "export class ClaimsPage {\\n  private store = useStore(claimsStore);\\n\\n  copy = claimsPageCopy;\\n  accountId = signal('account-1');\\n  claimRows = this.store.select.claimRows();\\n  isLoading = this.store.select.isAccountLoading(this.accountId());\\n\\n  loadClaims() {\\n    this.store.action.loadClaims.start({ accountId: this.accountId() });\\n  }\\n\\n  selectClaim(claimId: string) {\\n    this.store.action.selectClaim.start({ claimId });\\n  }\\n}"
      }
    },
    {
      "id": "quote-free-html",
      "title": "Quote-free HTML bindings",
      "body": "Vanrot HTML examples should call TypeScript fields and methods without quoted TS-bound attributes. Use real strings only when the HTML is declaring literal copy or static attributes. Repeated labels should come from page copy or selectors, not hard-coded template strings.",
      "points": [
        "Use @click=loadClaims for method wiring.",
        "Use disabled={{ isLoading() }} for TS-bound boolean state.",
        "Use row.label when the selector already prepared the display text.",
        "Avoid putting selectClaim(row.id) into a quoted attribute."
      ],
      "code": {
        "title": "Template",
        "code": "<button disabled={{ isLoading() }} @click=loadClaims>\\n  {{ copy.loadClaims }}\\n</button>\\n\\n<ul>\\n  @for row of claimRows()\\n    <li @click=selectClaim(row.id)>\\n      {{ row.label }}\\n    </li>\\n  @end\\n</ul>"
      }
    }
  ]
} as const;

const sectionLinks = storePageUsageArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class PageUsagePage {
  title(): string {
    return storePageUsageArticle.title;
  }

  summary(): string {
    return storePageUsageArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = storePageUsageArticle.sections[0].body;
  section1Body = storePageUsageArticle.sections[1].body;
  section0Points = storePageUsageArticle.sections[0].points ?? [];
  section1Points = storePageUsageArticle.sections[1].points ?? [];
  section0Code = storePageUsageArticle.sections[0].code?.code ?? '';
  section1Code = storePageUsageArticle.sections[1].code?.code ?? '';
}
