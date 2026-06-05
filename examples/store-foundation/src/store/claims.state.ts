import { defineState, type StoreError } from "@vanrot/store";

import type { Claim } from "../models/claim.model";
import type { ClaimFilters } from "../models/claim-filters.model";
import type { ClaimType } from "../models/claim-type.model";

export type ClaimsState = {
  claimType: ClaimType | undefined;
  claimsByAccount: Record<string, Claim[]>;
  loadingByAccount: Record<string, boolean>;
  errorsByAccount: Record<string, StoreError | undefined>;
  selectedClaimId: string | undefined;
  filters: ClaimFilters;
};

export const claimsInitialState: ClaimsState = {
  claimType: undefined,
  claimsByAccount: {},
  loadingByAccount: {},
  errorsByAccount: {},
  selectedClaimId: undefined,
  filters: {
    status: "pending",
  },
};

export const claimsState = defineState(claimsInitialState);
