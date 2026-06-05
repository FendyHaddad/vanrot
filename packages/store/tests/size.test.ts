import path from "node:path";
import zlib from "node:zlib";
import { build } from "esbuild";
import { describe, expect, it } from "vitest";

import { storeSizeBudget } from "../src/index.ts";

const repoRoot = path.resolve(__dirname, "../../..");

async function runtimeAndStoreBundleGzipSize(): Promise<number> {
  const result = await build({
    stdin: {
      contents: [
        "export * from './packages/runtime/dist/index.js';",
        "export * from './packages/runtime/dist/internal.js';",
        "export * from './packages/store/dist/index.js';",
      ].join("\n"),
      resolveDir: repoRoot,
      sourcefile: "vanrot-store-size-entry.js",
    },
    bundle: true,
    format: "esm",
    minify: true,
    platform: "browser",
    treeShaking: true,
    write: false,
  });

  return zlib.gzipSync(result.outputFiles[0].contents).length;
}

describe("store size budget", () => {
  it("keeps runtime and store combined under the Phase 19 quality budget", async () => {
    const combinedGzipBytes = await runtimeAndStoreBundleGzipSize();

    if (combinedGzipBytes > storeSizeBudget.combinedRuntimeAndStoreGzipBytes) {
      throw new Error(
        `Runtime plus Store bundle gzip size ${combinedGzipBytes} bytes exceeds ${storeSizeBudget.combinedRuntimeAndStoreGzipBytes} bytes.`,
      );
    }

    expect(combinedGzipBytes).toBeLessThanOrEqual(
      storeSizeBudget.combinedRuntimeAndStoreGzipBytes,
    );
  });
});
