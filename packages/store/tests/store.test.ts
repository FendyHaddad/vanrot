import { describe, expect, it, vi } from "vitest";

import {
  actionSet,
  defineActions,
  defineEffects,
  defineReducer,
  defineSelectors,
  defineState,
  defineStore,
  effect,
  storeError,
  useStore,
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

describe("defineStore and useStore", () => {
  it("exposes page-friendly select and action namespaces", async () => {
    const claimsState = defineState(claimsInitialState);
    const listClaims = vi.fn(async () => ["claim-1"]);

    const claimsActions = defineActions("claims", {
      loadClaims: actionSet()
        .start<{ accountId: string }>()
        .success<{ accountId: string; claims: string[] }>()
        .error<{ accountId: string; error: StoreError }>(),
    });

    const claimsSelectors = defineSelectors(claimsState)
      .claimsForAccount((state, accountId: string) =>
        state.claimsByAccount[accountId] ?? []
      )
      .isAccountLoading((state, accountId: string) =>
        state.loadingByAccount[accountId] ?? false
      );

    const claimsReducer = defineReducer(claimsState)
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
      }));

    const claimsEffects = defineEffects({
      loadClaims: effect(claimsActions.loadClaims.start)
        .run(({ action }) => listClaims(action.accountId))
        .success((claims, { action }) =>
          claimsActions.loadClaims.success({
            accountId: action.accountId,
            claims: claims as string[],
          })
        )
        .error((error, { action }) =>
          claimsActions.loadClaims.error({
            accountId: action.accountId,
            error: storeError(error),
          })
        )
        .trace("claims/loadClaims"),
    });

    const claimsStore = defineStore({
      name: "claims",
      state: claimsState,
      actions: claimsActions,
      selectors: claimsSelectors,
      reducer: claimsReducer,
      effects: claimsEffects,
    });

    const store = useStore(claimsStore);

    expect(store.select.claimsForAccount("account-1")()).toEqual([]);

    store.action.loadClaims.start({ accountId: "account-1" });

    expect(store.select.isAccountLoading("account-1")()).toBe(true);

    await Promise.resolve();
    await Promise.resolve();

    expect(listClaims).toHaveBeenCalledWith("account-1");
    expect(store.select.claimsForAccount("account-1")()).toEqual(["claim-1"]);
    expect(store.select.isAccountLoading("account-1")()).toBe(false);
  });
});
