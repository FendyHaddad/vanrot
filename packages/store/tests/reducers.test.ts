import { describe, expect, it } from "vitest";

import {
  actionSet,
  defineActions,
  defineReducer,
  defineState,
  type StoreError,
} from "../src/index.ts";

type ClaimsState = {
  claimsByAccount: Record<string, string[]>;
  loadingByAccount: Record<string, boolean>;
  errorsByAccount: Record<string, StoreError | undefined>;
};

const claimsInitialState: ClaimsState = {
  claimsByAccount: {},
  loadingByAccount: {},
  errorsByAccount: {},
};

const claimsState = defineState(claimsInitialState);

const claimsActions = defineActions("claims", {
  loadClaims: actionSet()
    .start<{ accountId: string }>()
    .success<{ accountId: string; claims: string[] }>()
    .error<{ accountId: string; error: StoreError }>(),
  clearClaims: actionSet()
    .start()
    .success()
    .error<{ error: StoreError }>(),
});

describe("reducers", () => {
  it("patches nested state without spread syntax at call sites", () => {
    const reducer = defineReducer(claimsState)
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
      }));

    const loading = reducer.reduce(
      claimsInitialState,
      claimsActions.loadClaims.start({ accountId: "account-1" }),
    );

    expect(loading.loadingByAccount["account-1"]).toBe(true);

    const loaded = reducer.reduce(
      loading,
      claimsActions.loadClaims.success({
        accountId: "account-1",
        claims: ["claim-1"],
      }),
    );

    expect(loaded).toEqual({
      claimsByAccount: {
        "account-1": ["claim-1"],
      },
      loadingByAccount: {
        "account-1": false,
      },
      errorsByAccount: {},
    });
  });

  it("sets full state for reset-like changes", () => {
    const reducer = defineReducer(claimsState)
      .on(claimsActions.clearClaims.start)
      .set(() => claimsInitialState);

    expect(
      reducer.reduce(
        {
          claimsByAccount: { "account-1": ["claim-1"] },
          loadingByAccount: { "account-1": true },
          errorsByAccount: {},
        },
        claimsActions.clearClaims.start(),
      ),
    ).toEqual(claimsInitialState);
  });
});
