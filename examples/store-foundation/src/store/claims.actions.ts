import { actionSet, defineActions, type StoreError } from "@vanrot/store";

import type { Claim } from "../models/claim.model";
import type { ClaimFilters } from "../models/claim-filters.model";
import { claimsStoreName } from "./claims.store-keys";

export const claimsActions = defineActions(claimsStoreName, {
  loadClaims: actionSet()
    .start<{ accountId: string; filters: ClaimFilters }>()
    .success<{ accountId: string; claims: Claim[] }>()
    .error<{ accountId: string; error: StoreError }>(),

  selectClaim: actionSet()
    .start<{ claimId: string }>()
    .success<{ claimId: string }>()
    .error<{ claimId: string; error: StoreError }>(),

  closeClaims: actionSet()
    .start()
    .success()
    .error<{ error: StoreError }>(),

  clearClaims: actionSet()
    .start()
    .success()
    .error<{ error: StoreError }>(),
});
