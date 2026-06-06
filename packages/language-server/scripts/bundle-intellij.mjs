#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(packageRoot, "dist-intellij");
const outputFile = resolve(outputRoot, "bin", "server.js");
const templateGlobsSource = resolve(packageRoot, "dist", "template-globs.json");
const templateGlobsTarget = resolve(outputRoot, "template-globs.json");

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(dirname(outputFile), { recursive: true });

await build({
  banner: {
    js: [
      'import { createRequire as __vanrotCreateRequire } from "node:module";',
      'import { fileURLToPath as __vanrotFileURLToPath } from "node:url";',
      "const require = __vanrotCreateRequire(import.meta.url);",
      "const __filename = __vanrotFileURLToPath(import.meta.url);",
      'const __dirname = __vanrotFileURLToPath(new URL(".", import.meta.url));'
    ].join("\n")
  },
  bundle: true,
  entryPoints: [resolve(packageRoot, "src", "bin", "server.ts")],
  format: "esm",
  legalComments: "none",
  logLevel: "info",
  outfile: outputFile,
  platform: "node",
  sourcemap: true,
  target: "node22.14"
});

writeFileSync(
  resolve(outputRoot, "package.json"),
  `${JSON.stringify(
    {
      private: true,
      type: "module",
      bin: {
        "vanrot-language-server": "./bin/server.js",
        "vanrot-editor-intelligence": "./bin/server.js"
      }
    },
    null,
    2
  )}\n`
);

if (!existsSync(templateGlobsSource)) {
  throw new Error("Missing built template globs before IntelliJ bundle.");
}

copyFileSync(templateGlobsSource, templateGlobsTarget);

for (const file of [outputFile, templateGlobsTarget, resolve(outputRoot, "package.json")]) {
  if (!existsSync(file)) {
    throw new Error(`Missing IntelliJ language-server bundle file: ${file}`);
  }
}
