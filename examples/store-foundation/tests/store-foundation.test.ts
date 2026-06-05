import { describe, expect, it } from "vitest";

import { ClaimsPage } from "../src/claims.page";

describe("store foundation example", () => {
  it("uses quote-free page-facing store APIs", () => {
    const page = new ClaimsPage();

    expect(page.copy.loadClaims).toBe("Load claims");
    expect(page.claimRows()).toEqual([]);

    page.loadClaims();

    expect(page.isLoading()).toBe(true);
  });
});
