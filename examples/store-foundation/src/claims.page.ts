import { signal } from "@vanrot/runtime";
import { useStore } from "@vanrot/store";

import type { ClaimFilters } from "./models/claim-filters.model";
import { claimsStore } from "./store/claims.store";

export const claimsPageCopy = {
  loadClaims: "Load claims",
} as const;

export class ClaimsPage {
  private store = useStore(claimsStore);

  copy = claimsPageCopy;
  accountId = signal("account-1");
  filters = signal<ClaimFilters>({
    status: "pending",
  });

  claimRows = this.store.select.claimRows();
  isLoading = this.store.select.isAccountLoading(this.accountId());

  loadClaims() {
    this.store.action.loadClaims.start({
      accountId: this.accountId(),
      filters: this.filters(),
    });
  }

  selectClaim(claimId: string) {
    this.store.action.selectClaim.start({ claimId });
  }
}
