import { describe, expect, it } from "vitest";

import { defineSelectors, defineState } from "../src/index.ts";

type ClaimsState = {
  claimType: { id: string; label: string } | undefined;
  claimsByAccount: Record<string, { id: string }[]>;
  loadingByAccount: Record<string, boolean>;
};

const initialState: ClaimsState = {
  claimType: undefined,
  claimsByAccount: {
    "account-1": [{ id: "claim-1" }],
  },
  loadingByAccount: {
    "account-1": true,
  },
};

describe("state and selectors", () => {
  it("creates signal-backed state with reset", () => {
    const state = defineState(initialState);

    expect(state.current()).toEqual(initialState);

    state.patch({
      claimType: { id: "medical", label: "Medical" },
    });

    expect(state.current().claimType?.label).toBe("Medical");

    state.reset();

    expect(state.current()).toEqual(initialState);
  });

  it("builds string-free fluent selectors", () => {
    const state = defineState(initialState);

    const selectors = defineSelectors(state)
      .claimType((value) => value.claimType)
      .claimsForAccount((value, accountId: string) =>
        value.claimsByAccount[accountId] ?? []
      )
      .isAccountLoading((value, accountId: string) =>
        value.loadingByAccount[accountId] ?? false
      );

    expect(selectors.claimType.read(state.current())).toBeUndefined();
    expect(selectors.claimsForAccount.read(state.current(), "account-1")).toEqual([
      { id: "claim-1" },
    ]);
    expect(selectors.isAccountLoading.read(state.current(), "account-1")).toBe(true);
  });
});
