import { defineReducer } from "@vanrot/store";

import { claimsActions } from "./claims.actions";
import { claimsInitialState, claimsState } from "./claims.state";

export const claimsReducer = defineReducer(claimsState)
  .on(claimsActions.loadClaims.start)
  .patch(({ action }) => ({
    loadingByAccount: {
      [action.accountId]: true,
    },
  }))
  .on(claimsActions.loadClaims.success)
  .patch(({ action }) => ({
    claimsByAccount: {
      [action.accountId]: action.claims,
    },
    loadingByAccount: {
      [action.accountId]: false,
    },
  }))
  .on(claimsActions.loadClaims.error)
  .patch(({ action }) => ({
    errorsByAccount: {
      [action.accountId]: action.error,
    },
    loadingByAccount: {
      [action.accountId]: false,
    },
  }))
  .on(claimsActions.clearClaims.start)
  .set(() => claimsInitialState);
