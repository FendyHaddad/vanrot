import { describe, expect, it } from "vitest";

import { actionSet, defineActions, type StoreError } from "../src/index.ts";

type Claim = {
  id: string;
};

type ClaimFilters = {
  status: "pending" | "approved";
};

describe("fluent action sets", () => {
  it("generates typed start, success, and error action creators", () => {
    const claimsActions = defineActions("claims", {
      loadClaims: actionSet()
        .start<{ accountId: string; filters: ClaimFilters }>()
        .success<{ accountId: string; claims: Claim[] }>()
        .error<{ accountId: string; error: StoreError }>(),
    });

    expect(
      claimsActions.loadClaims.start({
        accountId: "account-1",
        filters: { status: "pending" },
      }),
    ).toEqual({
      type: "claims/loadClaims/start",
      accountId: "account-1",
      filters: { status: "pending" },
    });

    expect(
      claimsActions.loadClaims.success({
        accountId: "account-1",
        claims: [{ id: "claim-1" }],
      }),
    ).toEqual({
      type: "claims/loadClaims/success",
      accountId: "account-1",
      claims: [{ id: "claim-1" }],
    });

    expect(claimsActions.loadClaims.start.type).toBe("claims/loadClaims/start");
    expect(claimsActions.loadClaims.success.type).toBe("claims/loadClaims/success");
    expect(claimsActions.loadClaims.error.type).toBe("claims/loadClaims/error");
  });

  it("supports no-payload action phases", () => {
    const claimsActions = defineActions("claims", {
      clearClaims: actionSet()
        .start()
        .success()
        .error<{ error: StoreError }>(),
    });

    expect(claimsActions.clearClaims.start()).toEqual({
      type: "claims/clearClaims/start",
    });
  });
});
