import { describe, expect, it } from "vitest";

import { storeError, type StoreError } from "../src/index.ts";

describe("storeError", () => {
  it("keeps StoreError values stable", () => {
    const original: StoreError = {
      message: "Already normalized",
      code: "CLAIMS_ALREADY_NORMALIZED",
      cause: undefined,
    };

    expect(storeError(original)).toBe(original);
  });

  it("normalizes Error instances", () => {
    const source = new Error("Network failed");

    expect(storeError(source)).toEqual({
      message: "Network failed",
      code: undefined,
      cause: source,
    });
  });

  it("normalizes unknown values", () => {
    expect(storeError({ reason: "bad response" })).toEqual({
      message: "Unknown store error",
      code: undefined,
      cause: { reason: "bad response" },
    });
  });
});
