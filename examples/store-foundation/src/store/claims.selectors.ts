import { defineSelectors, type StoreSelector } from "@vanrot/store";

import type { Claim } from "../models/claim.model";
import { claimsState, type ClaimsState } from "./claims.state";

export type ClaimRow = {
  id: string;
  label: string;
};

type ClaimsSelectors = {
  readonly claimType: StoreSelector<ClaimsState, ClaimsState["claimType"]>;
  readonly claimRows: StoreSelector<ClaimsState, ClaimRow[]>;
  readonly claimsForAccount: StoreSelector<ClaimsState, Claim[], string>;
  readonly isAccountLoading: StoreSelector<ClaimsState, boolean, string>;
};

export const claimsSelectors = defineSelectors(claimsState)
  .claimType((state: ClaimsState) => state.claimType)
  .claimRows((state: ClaimsState) => buildClaimRows(state))
  .claimsForAccount((state: ClaimsState, accountId: string) =>
    state.claimsByAccount[accountId] ?? []
  )
  .isAccountLoading((state: ClaimsState, accountId: string) =>
    state.loadingByAccount[accountId] ?? false
  ) as ClaimsSelectors;

function buildClaimRows(state: ClaimsState): ClaimRow[] {
  return Object.values(state.claimsByAccount)
    .flat()
    .map(formatClaimRow);
}

function formatClaimRow(claim: Claim): ClaimRow {
  return {
    id: claim.id,
    label: `${claim.status} - ${claim.amount}`,
  };
}
