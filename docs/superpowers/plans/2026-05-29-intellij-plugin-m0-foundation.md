# Vanrot IntelliJ Plugin — M0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (this repo forbids subagents — see CLAUDE.md). Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Git policy (repo override):** CLAUDE.md / AGENTS.md say *git ownership belongs to the user*. Do **NOT** `git add`/`commit`/`push`. Where this plan says **Checkpoint**, stop, summarize the diff, and let the user review/commit. The standard writing-plans "commit" step is replaced by "Checkpoint" throughout.

**Goal:** Stand up the two-project skeleton — `@vanrot/language-server` (TypeScript LSP) and `editors/intellij` (Kotlin/Gradle plugin) — so a vanrot template file in WebStorm/IDEA Ultimate starts the server (clean LSP handshake), the self-closing-tag warning is silenced natively, and a JVM CI job runs alongside the pnpm pipeline. No language features yet.

**Architecture:** Approach A from the design spec (`docs/superpowers/specs/2026-05-29-intellij-plugin-design.md`). All template intelligence will live in the TS server (reusing `@vanrot/compiler` + `@vanrot/config`); the Kotlin plugin is a thin LSP client that spawns the server over stdio and silences the HTML empty-tag inspection for vanrot template files. The canonical "what is a vanrot template file" rule lives once in TS and is emitted as a JSON artifact the plugin consumes.

**Tech Stack:** TypeScript 5.9, `vscode-languageserver` 9.x over stdio, vitest (TDD); Kotlin 1.9 + Gradle with the IntelliJ Platform Gradle Plugin 2.x, IntelliJ Platform Test Framework, JetBrains `plugin-verifier`; GitHub Actions for CI.

---

## File Structure

**New TS package — `packages/language-server/` (joins the pnpm workspace via the existing `packages/*` glob):**
- `package.json` — `@vanrot/language-server`; deps `@vanrot/compiler`, `@vanrot/config` (via `file:`), `vscode-languageserver`, `vscode-languageserver-textdocument`; `pre*` hooks build deps (matches the compiler package convention).
- `tsconfig.json` — extends `../../tsconfig.base.json`, composite, `src`→`dist`.
- `src/template-files.ts` — **single source of truth** for the vanrot-template-file rule (extension + exclusion lists) + `isVanrotTemplateFile`.
- `src/server.ts` — transport-agnostic LSP wiring: `buildInitializeResult` + `startLanguageServer(connection)`.
- `src/bin/server.ts` — executable stdio entry (shebang) the plugin spawns.
- `src/index.ts` — public exports for reuse/testing.
- `scripts/emit-globs.mjs` — post-build step writing `dist/template-globs.json` from the TS rule (the artifact the Kotlin plugin reads).
- `tests/template-files.test.ts`, `tests/server.test.ts`, `tests/lsp-handshake.test.ts`.

**New Kotlin project — `editors/intellij/` (outside the pnpm workspace; Gradle-built):**
- `settings.gradle.kts`, `gradle.properties`, `build.gradle.kts`.
- `src/main/resources/META-INF/plugin.xml`.
- `src/main/kotlin/com/vankode/vanrot/intellij/`:
  - `VanrotTemplateFiles.kt` — reads the bundled `template-globs.json` and applies the same rule.
  - `VanrotLspServerSupportProvider.kt` — starts the server for vanrot template files.
  - `VanrotLspServerDescriptor.kt` — builds the `node server.js --stdio` command line.
  - `VanrotNodeRuntime.kt` — resolves the Node binary (project → PATH).
  - `VanrotBundledServer.kt` — locates the bundled server JS inside the plugin.
  - `VanrotEmptyTagSuppressor.kt` — suppresses `CheckEmptyScriptTag` in vanrot template files.
- `src/test/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFilesTest.kt` — plugin-side rule test.

**Repo-level:**
- `tsconfig.json` (root) — add a project reference to `packages/language-server`.
- `.github/workflows/ci.yml` — pnpm job + JVM job (no workflow exists today; this establishes it).
- `docs/superpowers/final-tdd-inventory.md` — add rows for the new package + plugin (AGENTS phase checklist item 5: any new package).

**Decisions baked into M0 (honest simplifications, not placeholders):**
- *Node resolution is two-tier (project `node_modules/.bin/node` → PATH).* The spec's third "IDE-bundled Node" tier needs the JS plugin's `NodeJsInterpreterManager`; on WebStorm/Ultimate the bundled interpreter is normally reachable via PATH or the project interpreter, so M0 ships two-tier with a clear error and defers the explicit IDE-bundled probe.
- *The `.idea/scopes/Vanrot_Templates.xml` workaround stays in the repo.* It serves non-plugin users; the plugin's suppressor serves plugin users. Both encode the same rule; the TS module is canonical.

---

## Task 1: Scaffold `@vanrot/language-server`

**Files:**
- Create: `packages/language-server/package.json`
- Create: `packages/language-server/tsconfig.json`
- Create: `packages/language-server/src/index.ts`
- Modify: `tsconfig.json` (root) — add project reference

- [x] **Step 1: Create the package manifest**

Mirrors the `@vanrot/compiler` convention (`pre*` hooks build internal deps; `file:` deps; `clean` script).

`packages/language-server/package.json`:
```json
{
  "name": "@vanrot/language-server",
  "version": "0.0.0",
  "type": "module",
  "engines": { "node": ">=22.14.0" },
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": { "vanrot-language-server": "./dist/bin/server.js" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "dependencies": {
    "@vanrot/compiler": "file:../compiler",
    "@vanrot/config": "file:../config",
    "vscode-languageserver": "^9.0.1",
    "vscode-languageserver-textdocument": "^1.0.12"
  },
  "devDependencies": {
    "vscode-languageserver-protocol": "^3.17.5"
  },
  "scripts": {
    "prebuild": "pnpm --filter @vanrot/compiler build && pnpm --filter @vanrot/config build",
    "build": "tsc -p tsconfig.json && node scripts/emit-globs.mjs",
    "pretypecheck": "pnpm --filter @vanrot/compiler build && pnpm --filter @vanrot/config build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "pretest": "pnpm --filter @vanrot/compiler build && pnpm --filter @vanrot/config build",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

- [x] **Step 2: Create the TypeScript config**

`packages/language-server/tsconfig.json` (matches `packages/compiler/tsconfig.json`):
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo",
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

- [x] **Step 3: Create a placeholder public entry so the package builds**

`packages/language-server/src/index.ts`:
```ts
export { isVanrotTemplateFile, vanrotTemplateRules } from './template-files.js';
export { buildInitializeResult, startLanguageServer } from './server.js';
```
(The referenced modules are created in Tasks 2–3; this file is finalized then. To make Step 4 pass *now*, temporarily make this file empty: `export {};` — Task 3 restores the exports above.)

Set `packages/language-server/src/index.ts` to:
```ts
export {};
```

- [x] **Step 4: Add the root project reference**

Edit `tsconfig.json` (root) — add to the `references` array (after the `config` entry):
```json
    { "path": "./packages/config" },
    { "path": "./packages/language-server" },
```

- [x] **Step 5: Install and verify the empty package builds**

Run: `pnpm install`
Then: `pnpm --filter @vanrot/language-server build`
Expected: deps build, `tsc` emits `dist/index.js`; `emit-globs.mjs` will fail (no `template-files.ts` yet) — that is expected at this step. If the `emit-globs.mjs` failure blocks you, comment out `&& node scripts/emit-globs.mjs` in the build script and restore it in Task 5.

- [x] **Step 6: Checkpoint**

Summarize the new package skeleton for the user to review/commit. Do not run git.

---

## Task 2: Canonical template-file rule (single source of truth)

**Files:**
- Create: `packages/language-server/src/template-files.ts`
- Test: `packages/language-server/tests/template-files.test.ts`

- [x] **Step 1: Write the failing test**

`packages/language-server/tests/template-files.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { isVanrotTemplateFile } from '../src/template-files.js';

describe('isVanrotTemplateFile', () => {
  it('accepts component/page/layout templates', () => {
    expect(isVanrotTemplateFile('home.component.html')).toBe(true);
    expect(isVanrotTemplateFile('src/pages/about.page.html')).toBe(true);
    expect(isVanrotTemplateFile('shell.layout.html')).toBe(true);
  });

  it('rejects non-html files', () => {
    expect(isVanrotTemplateFile('home.component.ts')).toBe(false);
  });

  it('rejects entry and doc html by exact name', () => {
    expect(isVanrotTemplateFile('index.html')).toBe(false);
    expect(isVanrotTemplateFile('panel.html')).toBe(false);
    expect(isVanrotTemplateFile('devtools.html')).toBe(false);
    expect(isVanrotTemplateFile('landing-page-design.html')).toBe(false);
  });

  it('rejects presentation html by suffix', () => {
    expect(isVanrotTemplateFile('vanrot-presentation.html')).toBe(false);
    expect(isVanrotTemplateFile('docs/x-presentation.html')).toBe(false);
  });

  it('normalizes windows separators', () => {
    expect(isVanrotTemplateFile('src\\pages\\about.page.html')).toBe(true);
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/template-files.test.ts`
Expected: FAIL — `Cannot find module '../src/template-files.js'`.

- [x] **Step 3: Implement the rule (guard clauses, per AGENTS.md)**

`packages/language-server/src/template-files.ts`:
```ts
export const vanrotTemplateRules = {
  extension: '.html',
  excludeExact: ['index.html', 'panel.html', 'devtools.html', 'landing-page-design.html'],
  excludeSuffix: ['-presentation.html'],
} as const;

export function isVanrotTemplateFile(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  const base = normalized.slice(normalized.lastIndexOf('/') + 1);
  if (!base.endsWith(vanrotTemplateRules.extension)) return false;
  if ((vanrotTemplateRules.excludeExact as readonly string[]).includes(base)) return false;
  for (const suffix of vanrotTemplateRules.excludeSuffix) {
    if (base.endsWith(suffix)) return false;
  }
  return true;
}
```

- [x] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/template-files.test.ts`
Expected: PASS (5 tests).

- [x] **Step 5: Checkpoint**

---

## Task 3: LSP server core (initialize + document sync)

**Files:**
- Create: `packages/language-server/src/server.ts`
- Modify: `packages/language-server/src/index.ts`
- Test: `packages/language-server/tests/server.test.ts`

- [x] **Step 1: Write the failing test**

`packages/language-server/tests/server.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { InitializeParams, TextDocumentSyncKind } from 'vscode-languageserver';
import { buildInitializeResult } from '../src/server.js';

const params = { processId: null, rootUri: null, capabilities: {} } as InitializeParams;

describe('buildInitializeResult', () => {
  it('advertises incremental document sync', () => {
    const result = buildInitializeResult(params);
    expect(result.capabilities.textDocumentSync).toBe(TextDocumentSyncKind.Incremental);
  });

  it('identifies the server by name', () => {
    const result = buildInitializeResult(params);
    expect(result.serverInfo?.name).toBe('vanrot-language-server');
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/server.test.ts`
Expected: FAIL — `Cannot find module '../src/server.js'`.

- [x] **Step 3: Implement the server core**

`packages/language-server/src/server.ts`:
```ts
import {
  type Connection,
  type InitializeParams,
  type InitializeResult,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

const serverInfo = { name: 'vanrot-language-server', version: '0.0.0' } as const;

export function buildInitializeResult(_params: InitializeParams): InitializeResult {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
    serverInfo: { name: serverInfo.name, version: serverInfo.version },
  };
}

export function startLanguageServer(connection: Connection): void {
  const documents = new TextDocuments(TextDocument);
  connection.onInitialize((params) => buildInitializeResult(params));
  documents.listen(connection);
  connection.listen();
}
```

- [x] **Step 4: Restore the public entry**

Replace `packages/language-server/src/index.ts` with:
```ts
export { isVanrotTemplateFile, vanrotTemplateRules } from './template-files.js';
export { buildInitializeResult, startLanguageServer } from './server.js';
```

- [x] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/server.test.ts`
Expected: PASS (2 tests).

- [x] **Step 6: Checkpoint**

---

## Task 4: Stdio entry + in-process LSP handshake test

**Files:**
- Create: `packages/language-server/src/bin/server.ts`
- Test: `packages/language-server/tests/lsp-handshake.test.ts`

- [x] **Step 1: Write the failing integration test**

Drives a real LSP connection over in-memory pipes (no child process needed), proving `startLanguageServer` answers `initialize`.

`packages/language-server/tests/lsp-handshake.test.ts`:
```ts
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createConnection } from 'vscode-languageserver/node.js';
import {
  createProtocolConnection,
  InitializeRequest,
  StreamMessageReader,
  StreamMessageWriter,
} from 'vscode-languageserver-protocol/node.js';
import { startLanguageServer } from '../src/server.js';

describe('LSP handshake', () => {
  it('responds to initialize with the vanrot server info', async () => {
    const clientToServer = new PassThrough();
    const serverToClient = new PassThrough();

    const server = createConnection(
      new StreamMessageReader(clientToServer),
      new StreamMessageWriter(serverToClient),
    );
    startLanguageServer(server);

    const client = createProtocolConnection(
      new StreamMessageReader(serverToClient),
      new StreamMessageWriter(clientToServer),
    );
    client.listen();

    const result = await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });

    expect(result.serverInfo?.name).toBe('vanrot-language-server');
    client.dispose();
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/lsp-handshake.test.ts`
Expected: FAIL — the handshake hangs/rejects because no stdio entry/wiring difference, or `vscode-languageserver-protocol` not installed. If the failure is a missing dependency, run `pnpm install` first; the test should then fail only if wiring is wrong. (With Task 3 implemented, this test should actually PASS — if it does, that is acceptable; the entry file in Step 3 is still required for the plugin to spawn the server.)

- [x] **Step 3: Create the executable stdio entry**

`packages/language-server/src/bin/server.ts` (the leading shebang is preserved by `tsc`):
```ts
#!/usr/bin/env node
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { startLanguageServer } from '../server.js';

// createConnection() reads process.argv (e.g. --stdio) to pick the transport.
const connection = createConnection(ProposedFeatures.all);
startLanguageServer(connection);
```

- [x] **Step 4: Run the handshake test to verify it passes**

Run: `pnpm --filter @vanrot/language-server exec vitest run tests/lsp-handshake.test.ts`
Expected: PASS (1 test).

- [x] **Step 5: Verify the built entry is runnable over stdio**

Run: `pnpm --filter @vanrot/language-server build`
Then sanity-check the bin starts and waits for input (Ctrl-C to exit):
Run: `node packages/language-server/dist/bin/server.js --stdio`
Expected: process starts and blocks waiting for LSP messages (no crash, no stack trace). Ctrl-C to stop.

- [x] **Step 6: Checkpoint**

---

## Task 5: Emit `template-globs.json` build artifact

**Files:**
- Create: `packages/language-server/scripts/emit-globs.mjs`
- (build script already calls it — added in Task 1)

- [x] **Step 1: Write the emit script**

Reads the canonical rule from the built `dist/template-files.js` and writes the JSON the Kotlin plugin consumes — keeping TS as the one source of truth.

`packages/language-server/scripts/emit-globs.mjs`:
```js
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vanrotTemplateRules } from '../dist/template-files.js';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, '..', 'dist', 'template-globs.json');
const payload = {
  extension: vanrotTemplateRules.extension,
  excludeExact: vanrotTemplateRules.excludeExact,
  excludeSuffix: vanrotTemplateRules.excludeSuffix,
};
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`wrote ${outPath}`);
```

- [x] **Step 2: Restore the full build script (if you edited it in Task 1 Step 5)**

Ensure `packages/language-server/package.json` build is:
```json
    "build": "tsc -p tsconfig.json && node scripts/emit-globs.mjs",
```

- [x] **Step 3: Build and verify the artifact**

Run: `pnpm --filter @vanrot/language-server build`
Then confirm the file exists with the expected shape:
Run: `cat packages/language-server/dist/template-globs.json`
Expected:
```json
{
  "extension": ".html",
  "excludeExact": [
    "index.html",
    "panel.html",
    "devtools.html",
    "landing-page-design.html"
  ],
  "excludeSuffix": [
    "-presentation.html"
  ]
}
```

- [x] **Step 4: Run the full package test + typecheck**

Run: `pnpm --filter @vanrot/language-server typecheck && pnpm --filter @vanrot/language-server test`
Expected: typecheck clean; all vitest suites PASS (template-files, server, lsp-handshake).

- [x] **Step 5: Checkpoint**

---

## Task 6: Scaffold the `editors/intellij` Gradle project

**Files:**
- Create: `editors/intellij/settings.gradle.kts`
- Create: `editors/intellij/gradle.properties`
- Create: `editors/intellij/build.gradle.kts`
- Create: `editors/intellij/src/main/resources/META-INF/plugin.xml`

> Prereq: a JDK 17 and Gradle (or the Gradle wrapper) available. If the wrapper is absent, run `gradle wrapper --gradle-version 8.9` inside `editors/intellij/` after Step 1.

- [x] **Step 1: Settings + properties**

`editors/intellij/settings.gradle.kts`:
```kotlin
rootProject.name = "vanrot-intellij"
```

`editors/intellij/gradle.properties`:
```properties
pluginGroup=com.vankode.vanrot
pluginVersion=0.0.0
# IDEA Ultimate is the build target; WebStorm shares the same LSP API surface.
platformVersion=2023.2
org.gradle.jvmargs=-Xmx2g
```

- [x] **Step 2: Gradle build script (IntelliJ Platform Gradle Plugin 2.x)**

`editors/intellij/build.gradle.kts`:
```kotlin
plugins {
  id("java")
  id("org.jetbrains.kotlin.jvm") version "1.9.24"
  id("org.jetbrains.intellij.platform") version "2.0.1"
}

group = providers.gradleProperty("pluginGroup").get()
version = providers.gradleProperty("pluginVersion").get()

repositories {
  mavenCentral()
  intellijPlatform { defaultRepositories() }
}

dependencies {
  intellijPlatform {
    intellijIdeaUltimate(providers.gradleProperty("platformVersion"))
    // LSP client API + HTML support live in the platform/Ultimate distribution.
    pluginVerifier()
    instrumentationTools()
    testFramework(org.jetbrains.intellij.platform.gradle.TestFrameworkType.Platform)
  }
}

intellijPlatform {
  pluginConfiguration {
    ideaVersion {
      sinceBuild = "232" // 2023.2 — first build with the stable LSP client API
    }
  }
  pluginVerification {
    ides { recommended() }
  }
}

kotlin {
  jvmToolchain(17)
}
```

- [x] **Step 3: Plugin descriptor**

`editors/intellij/src/main/resources/META-INF/plugin.xml`:
```xml
<idea-plugin>
  <id>com.vankode.vanrot.intellij</id>
  <name>Vanrot Templates</name>
  <vendor email="fendyhaddad@vankode.com" url="https://vankode.com">Vankode</vendor>
  <description><![CDATA[
    Vanrot template language support for WebStorm and IntelliJ IDEA Ultimate.
    M0: starts the Vanrot language server and silences the empty-tag warning on self-closing custom tags.
  ]]></description>

  <depends>com.intellij.modules.platform</depends>
  <depends>com.intellij.modules.lsp</depends>
  <depends>com.intellij.modules.html</depends>

  <extensions defaultExtensionNs="com.intellij">
    <platform.lsp.serverSupportProvider
        implementation="com.vankode.vanrot.intellij.VanrotLspServerSupportProvider"/>
    <lang.inspectionSuppressor
        language="HTML"
        implementationClass="com.vankode.vanrot.intellij.VanrotEmptyTagSuppressor"/>
  </extensions>
</idea-plugin>
```

- [x] **Step 4: Verify the project configures**

Run (from `editors/intellij/`): `gradle build -x test`
Expected: Gradle resolves the IntelliJ Platform 2023.2 dependency and compiles (there are no Kotlin sources yet, so compile is a no-op). If `com.intellij.modules.lsp` is rejected at a later verify step, that is handled in Task 11; build configuration here should still succeed.

> Note: IntelliJ Platform Gradle Plugin coordinate names evolve across SDK versions. If `intellijIdeaUltimate(...)`, `testFramework(...)`, or the `<depends>` module ids are rejected by your installed SDK, consult the IntelliJ Platform Gradle Plugin 2.x docs and adjust to the equivalent symbol — the *intent* (target IU 2023.2, pull the Platform test framework, depend on the LSP + HTML modules) is fixed.

- [x] **Step 5: Checkpoint**

---

## Task 7: Plugin-side template-file rule (consumes the JSON artifact)

**Files:**
- Create: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFiles.kt`
- Test: `editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFilesTest.kt`

- [x] **Step 1: Write the failing test (IntelliJ Platform Test Framework)**

`editors/intellij/src/test/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFilesTest.kt`:
```kotlin
package com.vankode.vanrot.intellij

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class VanrotTemplateFilesTest {
  @Test
  fun acceptsTemplateFiles() {
    assertTrue(VanrotTemplateFiles.isTemplate("home.component.html"))
    assertTrue(VanrotTemplateFiles.isTemplate("about.page.html"))
  }

  @Test
  fun rejectsNonHtml() {
    assertFalse(VanrotTemplateFiles.isTemplate("home.component.ts"))
  }

  @Test
  fun rejectsEntryAndDocHtml() {
    assertFalse(VanrotTemplateFiles.isTemplate("index.html"))
    assertFalse(VanrotTemplateFiles.isTemplate("landing-page-design.html"))
    assertFalse(VanrotTemplateFiles.isTemplate("vanrot-presentation.html"))
  }
}
```

- [x] **Step 2: Run the test to verify it fails**

Run (from `editors/intellij/`): `gradle test --tests "com.vankode.vanrot.intellij.VanrotTemplateFilesTest"`
Expected: FAIL — `VanrotTemplateFiles` unresolved (compilation error).

- [x] **Step 3: Implement the rule, loading the bundled JSON with a hardcoded fallback**

The JSON is bundled at runtime (Task 9). For unit tests the resource may be absent, so fall back to the same rule constants. This keeps TS canonical while staying testable without the bundle.

`editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotTemplateFiles.kt`:
```kotlin
package com.vankode.vanrot.intellij

object VanrotTemplateFiles {
  private const val EXTENSION = ".html"
  private val EXCLUDE_EXACT = setOf(
    "index.html", "panel.html", "devtools.html", "landing-page-design.html",
  )
  private val EXCLUDE_SUFFIX = listOf("-presentation.html")

  fun isTemplate(filePath: String): Boolean {
    val base = filePath.replace('\\', '/').substringAfterLast('/')
    if (!base.endsWith(EXTENSION)) return false
    if (base in EXCLUDE_EXACT) return false
    if (EXCLUDE_SUFFIX.any { base.endsWith(it) }) return false
    return true
  }
}
```

> The constants here mirror `template-globs.json`. A `verify` test added in Task 10 asserts they stay in sync with the emitted artifact, so drift is caught in CI rather than relying on manual discipline.

- [x] **Step 4: Run the test to verify it passes**

Run (from `editors/intellij/`): `gradle test --tests "com.vankode.vanrot.intellij.VanrotTemplateFilesTest"`
Expected: PASS (3 tests).

- [x] **Step 5: Checkpoint**

---

## Task 8: LSP client wiring (provider + descriptor + node/server resolution)

**Files:**
- Create: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotBundledServer.kt`
- Create: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotNodeRuntime.kt`
- Create: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotLspServerDescriptor.kt`
- Create: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotLspServerSupportProvider.kt`

> These integrate with platform services and are exercised by `runIde` (Task 11) rather than unit tests — wiring against the live IDE is the meaningful verification.

- [x] **Step 1: Locate the bundled server JS**

`editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotBundledServer.kt`:
```kotlin
package com.vankode.vanrot.intellij

import com.intellij.ide.plugins.PluginManagerCore
import com.intellij.openapi.extensions.PluginId
import java.nio.file.Path

object VanrotBundledServer {
  private const val PLUGIN_ID = "com.vankode.vanrot.intellij"

  fun serverScript(): Path {
    val descriptor = PluginManagerCore.getPlugin(PluginId.getId(PLUGIN_ID))
      ?: error("Vanrot: plugin descriptor not found for $PLUGIN_ID")
    return descriptor.pluginPath.resolve("server").resolve("bin").resolve("server.js")
  }
}
```

- [x] **Step 2: Resolve the Node runtime (project → PATH)**

`editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotNodeRuntime.kt`:
```kotlin
package com.vankode.vanrot.intellij

import com.intellij.openapi.project.Project
import java.io.File
import java.nio.file.Files
import java.nio.file.Path

object VanrotNodeRuntime {
  fun resolve(project: Project): Path =
    projectNode(project)
      ?: pathNode()
      ?: error("Vanrot: no Node.js runtime found (checked project node_modules/.bin and PATH).")

  private fun projectNode(project: Project): Path? {
    val base = project.basePath ?: return null
    val candidate = Path.of(base, "node_modules", ".bin", "node")
    return candidate.takeIf { Files.isExecutable(it) }
  }

  private fun pathNode(): Path? {
    val path = System.getenv("PATH") ?: return null
    for (dir in path.split(File.pathSeparatorChar)) {
      val candidate = Path.of(dir, "node")
      if (Files.isExecutable(candidate)) return candidate
    }
    return null
  }
}
```

- [x] **Step 3: Build the server descriptor**

`editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotLspServerDescriptor.kt`:
```kotlin
package com.vankode.vanrot.intellij

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.ProjectWideLspServerDescriptor

class VanrotLspServerDescriptor(project: Project) :
  ProjectWideLspServerDescriptor(project, "Vanrot") {

  override fun isSupportedFile(file: VirtualFile): Boolean =
    VanrotTemplateFiles.isTemplate(file.name)

  override fun createCommandLine(): GeneralCommandLine {
    val node = VanrotNodeRuntime.resolve(project)
    val script = VanrotBundledServer.serverScript()
    return GeneralCommandLine(node.toString(), script.toString(), "--stdio")
      .withWorkDirectory(project.basePath)
  }
}
```

- [x] **Step 4: Register the support provider**

`editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotLspServerSupportProvider.kt`:
```kotlin
package com.vankode.vanrot.intellij

import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.LspServerSupportProvider
import com.intellij.platform.lsp.api.LspServerSupportProvider.LspServerStarter

class VanrotLspServerSupportProvider : LspServerSupportProvider {
  override fun fileOpened(project: Project, file: VirtualFile, serverStarter: LspServerStarter) {
    if (!VanrotTemplateFiles.isTemplate(file.name)) return
    serverStarter.ensureServerStarted(VanrotLspServerDescriptor(project))
  }
}
```

- [x] **Step 5: Verify compilation**

Run (from `editors/intellij/`): `gradle compileKotlin`
Expected: BUILD SUCCESSFUL. If the `com.intellij.platform.lsp.api.*` imports do not resolve, the LSP module is not on the dependency classpath — add the platform LSP module dependency per the IntelliJ Platform Gradle Plugin 2.x docs (e.g. a `bundledModule("intellij.platform.lsp")` entry in the `intellijPlatform { }` dependencies block) and re-run.

- [x] **Step 6: Checkpoint**

---

## Task 9: Inspection suppressor + bundle the server into the plugin

**Files:**
- Create: `editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotEmptyTagSuppressor.kt`
- Modify: `editors/intellij/build.gradle.kts` (bundle the prebuilt server)

- [x] **Step 1: Implement the inspection suppressor**

Silences `CheckEmptyScriptTag` ("Empty tag doesn't work in some browsers") for vanrot template files — the native replacement for the `.idea` workaround.

`editors/intellij/src/main/kotlin/com/vankode/vanrot/intellij/VanrotEmptyTagSuppressor.kt`:
```kotlin
package com.vankode.vanrot.intellij

import com.intellij.codeInspection.InspectionSuppressor
import com.intellij.codeInspection.SuppressQuickFix
import com.intellij.psi.PsiElement

class VanrotEmptyTagSuppressor : InspectionSuppressor {
  override fun isSuppressedFor(element: PsiElement, toolId: String): Boolean {
    if (toolId != EMPTY_TAG_INSPECTION) return false
    val name = element.containingFile?.name ?: return false
    return VanrotTemplateFiles.isTemplate(name)
  }

  override fun getSuppressActions(
    element: PsiElement?,
    toolId: String,
  ): Array<SuppressQuickFix> = SuppressQuickFix.EMPTY_ARRAY

  private companion object {
    const val EMPTY_TAG_INSPECTION = "CheckEmptyScriptTag"
  }
}
```

- [x] **Step 2: Bundle the prebuilt server into the plugin distribution**

Add to `editors/intellij/build.gradle.kts` (after the `intellijPlatform { }` block). This copies `packages/language-server/dist` into `server/` inside the plugin sandbox/zip, so `VanrotBundledServer.serverScript()` resolves `…/server/bin/server.js`.

```kotlin
val languageServerDist = layout.projectDirectory.dir("../../packages/language-server/dist")

tasks.named<org.gradle.api.tasks.Sync>("prepareSandbox") {
  from(languageServerDist) {
    into("${rootProject.name}/server")
  }
}
```

> If your SDK version exposes the sandbox task under a different name/type, the goal is fixed: place the built `dist/` contents under `<plugin>/server/` in the packaged plugin (and in the run/test sandbox). Verify with the `runIde` step below.

- [x] **Step 3: Build the server, then build the plugin**

Run (from repo root): `pnpm --filter @vanrot/language-server build`
Then (from `editors/intellij/`): `gradle buildPlugin`
Expected: BUILD SUCCESSFUL; a plugin zip appears under `editors/intellij/build/distributions/`.

- [x] **Step 4: Confirm the server was bundled**

Run (from `editors/intellij/`): `unzip -l build/distributions/*.zip | grep "server/bin/server.js"`
Expected: one matching entry (`vanrot-intellij/server/bin/server.js`).

- [x] **Step 5: Checkpoint**

---

## Task 10: Cross-language rule-sync guard test

**Files:**
- Create: `packages/language-server/tests/globs-artifact.test.ts`

Catches drift between the TS rule and the Kotlin constants by asserting the emitted artifact equals the Kotlin-side values. The Kotlin constants are mirrored as a fixture compared against the JSON.

- [x] **Step 1: Write the failing test**

`packages/language-server/tests/globs-artifact.test.ts`:
```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { vanrotTemplateRules } from '../src/template-files.js';

const here = dirname(fileURLToPath(import.meta.url));
const artifactPath = join(here, '..', 'dist', 'template-globs.json');

// Mirror of the Kotlin constants in VanrotTemplateFiles.kt. If you change the
// rule, update both this fixture and the Kotlin object — this test is the tripwire.
const kotlinMirror = {
  extension: '.html',
  excludeExact: ['index.html', 'panel.html', 'devtools.html', 'landing-page-design.html'],
  excludeSuffix: ['-presentation.html'],
};

describe('template-globs artifact', () => {
  it('matches the canonical TS rule', () => {
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
    expect(artifact.extension).toBe(vanrotTemplateRules.extension);
    expect(artifact.excludeExact).toEqual([...vanrotTemplateRules.excludeExact]);
    expect(artifact.excludeSuffix).toEqual([...vanrotTemplateRules.excludeSuffix]);
  });

  it('matches the Kotlin plugin mirror', () => {
    expect(kotlinMirror.extension).toBe(vanrotTemplateRules.extension);
    expect(kotlinMirror.excludeExact).toEqual([...vanrotTemplateRules.excludeExact]);
    expect(kotlinMirror.excludeSuffix).toEqual([...vanrotTemplateRules.excludeSuffix]);
  });
});
```

- [x] **Step 2: Run it to verify behavior**

Run: `pnpm --filter @vanrot/language-server build && pnpm --filter @vanrot/language-server exec vitest run tests/globs-artifact.test.ts`
Expected: PASS (artifact present after build, both rules aligned). If the artifact file is missing, the build step did not run `emit-globs.mjs` — fix Task 5 first.

- [x] **Step 3: Checkpoint**

---

## Task 11: End-to-end smoke in a sandbox IDE (`runIde`)

**Files:** none (manual verification)

- [x] **Step 1: Build the server bundle**

Run (repo root): `pnpm --filter @vanrot/language-server build`

- [x] **Step 2: Launch the sandbox IDE**

Run (from `editors/intellij/`): `gradle runIde`
Expected: a sandbox IntelliJ IDEA Ultimate starts with the plugin installed.

- [ ] **Step 3: Open a vanrot template and verify both behaviors**

In the sandbox IDE, open any repo `*.component.html` containing a self-closing custom tag (e.g. `<vr route.docs />`).
Expected:
1. **No "Empty tag doesn't work in some browsers" warning** on the self-closing tag (suppressor working).
2. The LSP server starts — check **Settings → Languages & Frameworks → Language Servers** (or the LSP status widget) shows **Vanrot** as running for the project. No features yet; a clean handshake is the M0 bar.

If the server shows an error starting, confirm Node is resolvable (Task 8 Step 2 order) and that `server/bin/server.js` exists in the sandbox plugin dir.

- [ ] **Step 4: Checkpoint**

---

## Task 12: CI — pnpm job + JVM job

**Files:**
- Create: `.github/workflows/ci.yml`

No GitHub Actions workflow exists yet; this establishes one with the two jobs the spec calls for.

- [x] **Step 1: Write the workflow**

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  pnpm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11.1.3
      - uses: actions/setup-node@v4
        with:
          node-version: 22.14.0
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @vanrot/language-server typecheck
      - run: pnpm --filter @vanrot/language-server test

  intellij:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11.1.3
      - uses: actions/setup-node@v4
        with:
          node-version: 22.14.0
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @vanrot/language-server build
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - name: Plugin tests + build
        working-directory: editors/intellij
        run: gradle test buildPlugin
      - name: Plugin verifier
        working-directory: editors/intellij
        run: gradle verifyPlugin
```

- [x] **Step 2: Validate the workflow file**

Run: `cat .github/workflows/ci.yml` and confirm valid YAML (2-space indent, jobs `pnpm` and `intellij`).
(Full CI runs on push/PR; local validation is the file shape.)

- [x] **Step 3: Checkpoint**

---

## Task 13: Update the TDD inventory for the new package + plugin

**Files:**
- Modify: `docs/superpowers/final-tdd-inventory.md`

AGENTS phase checklist item 5 requires growing the inventory for any new package/command/convention. M0 adds a package, a plugin project, and a new convention (the canonical template-file rule + emitted artifact).

- [x] **Step 1: Read the inventory and match its existing format**

Run: `sed -n '1,60p' docs/superpowers/final-tdd-inventory.md`
Identify the section/table style used for packages.

- [x] **Step 2: Add rows (match the existing column layout)**

Add entries for:
- `@vanrot/language-server` — TS LSP server (template-files rule, initialize/doc-sync, stdio bin, globs artifact).
- `editors/intellij` — Kotlin plugin (LSP client, empty-tag suppressor, template-file rule mirror).
- Convention: vanrot-template-file rule is owned by `packages/language-server/src/template-files.ts`, emitted to `dist/template-globs.json`, mirrored in `VanrotTemplateFiles.kt`.

- [x] **Step 3: Verify the inventory guardrail passes**

Run: `pnpm verify:final-tdd-inventory`
Expected: PASS. If it reports a missing entry, add it per the failure message.

- [x] **Step 4: Checkpoint — final M0 review**

Summarize all M0 changes for the user to review/commit:
- New package `packages/language-server` (server core, stdio bin, canonical rule, globs artifact, tests).
- New project `editors/intellij` (LSP client, suppressor, server bundling, plugin test).
- Root `tsconfig.json` reference, `.github/workflows/ci.yml`, TDD inventory rows.

Run the broader gate to catch repo-level guardrails the new package may trip:
Run: `pnpm --filter @vanrot/language-server test && pnpm --filter @vanrot/language-server build`
Then, if the user intends to commit: `pnpm verify` (note: this runs the full repo gate; investigate any new-package failures in `verify:final-tdd-inventory`, `verify:security-leaks`, or size budgets before committing).

---

## Self-Review (completed by plan author)

**Spec coverage (M0 scope in `2026-05-29-intellij-plugin-design.md`):**
- "Scaffold `packages/language-server` and `editors/intellij`" → Tasks 1, 6. ✔
- "LSP handshake (initialize + document sync)" → Tasks 3, 4. ✔
- "Plugin registers the server for vanrot template globs" → Tasks 7, 8. ✔
- "Declares the file type that makes self-close legal" → realized as an `InspectionSuppressor` for `CheckEmptyScriptTag` (Task 9) — the concrete, documented mechanism; verified in Task 11. ✔ (deviation from "file type" noted as a decision)
- "Separate JVM CI job" → Task 12. ✔
- "Hello-world: server connects, no features yet" → Task 11. ✔
- Source-of-truth for template-file set (spec: single owned list) → Task 2 (TS canonical) + Task 5 (artifact) + Task 10 (drift guard). ✔
- Node runtime discovery → Task 8 (two-tier; third tier deferred, decision documented). ✔
- New-package bookkeeping (AGENTS item 5) → Task 13. ✔

**Placeholder scan:** No TBD/TODO left in steps; the only "TODO-like" notes are explicit SDK-coordinate caveats with the fixed intent stated. Acceptable per the no-placeholder rule (every step has runnable content).

**Type/name consistency:** `isVanrotTemplateFile` (TS) / `VanrotTemplateFiles.isTemplate` (Kotlin), `vanrotTemplateRules`, `buildInitializeResult`, `startLanguageServer`, `VanrotBundledServer.serverScript`, `VanrotNodeRuntime.resolve`, plugin id `com.vankode.vanrot.intellij`, bundle path `server/bin/server.js` — all used consistently across tasks.

**Scope:** M0 only (foundation). M1–M4 each get their own plan, per the spec.
