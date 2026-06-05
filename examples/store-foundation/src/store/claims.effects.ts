import { defineEffects, effect, storeError } from "@vanrot/store";

import { claimsActions } from "./claims.actions";
import { claimsRetry, claimsTimeouts, claimsTraces } from "./claims.effect-options";

const claimsService = {
  async list() {
    return [
      {
        id: "claim-1",
        accountId: "account-1",
        status: "pending" as const,
        amount: 120,
      },
    ];
  },
};

export const claimsEffects = defineEffects({
  loadClaims: effect(claimsActions.loadClaims.start)
    .latestBy(({ action }) => action.accountId)
    .skipWhen(({ state, action }) =>
      Boolean((state.loadingByAccount as Record<string, boolean>)[action.accountId])
    )
    .cancelWhen(claimsActions.closeClaims.start)
    .timeout(claimsTimeouts.loadClaims)
    .retry(claimsRetry.loadClaims)
    .run(() => claimsService.list())
    .success((claims, { action }) =>
      claimsActions.loadClaims.success({
        accountId: action.accountId,
        claims: claims as Awaited<ReturnType<typeof claimsService.list>>,
      })
    )
    .error((error, { action }) =>
      claimsActions.loadClaims.error({
        accountId: action.accountId,
        error: storeError(error),
      })
    )
    .trace(claimsTraces.loadClaims),
});
