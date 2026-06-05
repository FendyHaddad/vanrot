import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  actionSet,
  defineActions,
  defineEffects,
  defineReducer,
  defineSelectors,
  defineState,
  defineStore,
  effect,
  retryPolicy,
  storeError,
  traceName,
  useStore,
} from "../src/index.ts";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const repoRoot = path.resolve(packageRoot, "../..");

describe("@vanrot/store package", () => {
  it("exports the Phase 19 public API", () => {
    expect(typeof actionSet).toBe("function");
    expect(typeof defineActions).toBe("function");
    expect(typeof defineEffects).toBe("function");
    expect(typeof defineReducer).toBe("function");
    expect(typeof defineSelectors).toBe("function");
    expect(typeof defineState).toBe("function");
    expect(typeof defineStore).toBe("function");
    expect(typeof effect).toBe("function");
    expect(typeof retryPolicy).toBe("function");
    expect(typeof storeError).toBe("function");
    expect(typeof traceName).toBe("function");
    expect(typeof useStore).toBe("function");
  });

  it("declares runtime as a package dependency without moving store code into runtime", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies: Record<string, string>;
      exports: Record<string, unknown>;
    };

    expect(packageJson.dependencies["@vanrot/runtime"]).toBe("file:../runtime");
    expect(packageJson.exports["."]).toBeDefined();

    const runtimeSource = fs.readFileSync(
      path.join(repoRoot, "packages/runtime/src/index.ts"),
      "utf8",
    );

    expect(runtimeSource).not.toContain("@vanrot/store");
    expect(runtimeSource).not.toContain("defineStore");
  });

  it("keeps the package tree-shakable", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
    ) as {
      sideEffects: boolean;
      exports: Record<string, unknown>;
    };

    expect(packageJson.sideEffects).toBe(false);
    expect(packageJson.exports["."]).toEqual({
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    });
  });
});
