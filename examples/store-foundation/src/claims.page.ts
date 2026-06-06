import { signal } from "@vanrot/runtime";
import { inspectStore, useStore } from "@vanrot/store";

import type { ClaimFilters } from "./models/claim-filters.model";
import { claimsStore } from "./store/claims.store";

const claimsInspectionHistoryLimit = 24;

export const claimsPageCopy = {
  loadClaims: "Load claims",
  inspectionCheckpoint: "Claims review checkpoint",
} as const;

export class ClaimsPage {
  private store = useStore(claimsStore);
  private inspector = inspectStore(this.store, {
    historyLimit: claimsInspectionHistoryLimit,
  });

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

  captureInspectionSnapshot() {
    return this.inspector.snapshot(this.copy.inspectionCheckpoint);
  }

  inspectionEvents() {
    return this.inspector.history();
  }

  inspectionTimelineLabels() {
    return this.inspectionEvents().map((event) => event.kind);
  }

  replayInspectionFrom(snapshotId: string) {
    return this.inspector.replayFrom(snapshotId);
  }
}
