import { describe, expect, it } from "vitest";
import { storeInspectionEventKind } from "@vanrot/store";

import { ClaimsPage } from "../src/claims.page";

describe("store foundation example", () => {
  it("uses quote-free page-facing store APIs", () => {
    const page = new ClaimsPage();

    expect(page.copy.loadClaims).toBe("Load claims");
    expect(page.claimRows()).toEqual([]);

    page.loadClaims();

    expect(page.isLoading()).toBe(true);
  });

  it("captures headless inspection history without RxJS or Redux bridges", () => {
    const page = new ClaimsPage();
    const snapshot = page.captureInspectionSnapshot();

    page.loadClaims();

    expect(page.inspectionTimelineLabels()).toContain(
      storeInspectionEventKind.dispatchStarted
    );
    expect(page.inspectionTimelineLabels()).toContain(
      storeInspectionEventKind.stateChanged
    );

    const replay = page.replayInspectionFrom(snapshot.id);

    expect(replay.ok).toBe(true);
    expect(replay.steps).toHaveLength(1);
  });
});
