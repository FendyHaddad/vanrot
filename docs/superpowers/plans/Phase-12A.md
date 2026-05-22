# Vanrot Phase 12A Core Production Audit And Red Test Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an isolated production audit lane with real red tests for core framework gaps, and keep the final TDD inventory growing toward Phase 26 release testing.

**Architecture:** Phase 12A creates audit-only tests outside the normal package test globs so `pnpm verify` stays green while `pnpm audit:core` exposes known production gaps. Each audit test names its owning production slice, and docs/rules/hooks make `docs/superpowers/final-tdd-inventory.md` the durable final-release testing memory.

**Tech Stack:** TypeScript, Vitest, pnpm scripts, Markdown, POSIX shell, Vanrot runtime/compiler/Vite plugin source modules.

**Execution Rule:** Work in the current `main` workspace only. Do not run `git add`, `git commit`, `git push`, create a branch, or create a worktree unless the user explicitly asks.

---

## File Structure

```txt
package.json
  Adds the root-only `audit:core` script. This script is intentionally separate from `pnpm verify`.

audits/core/README.md
  Explains that the core audit lane is expected to fail until 12B-12E burn down the red tests.

audits/core/audit-slices.ts
  Single source of truth for audit owner slice labels used by all Phase 12A audit tests.

audits/core/runtime.audit.ts
  Red audit test for 12B runtime ownership and nested cleanup-scope production behavior.

audits/core/compiler.audit.ts
  Red audit test for 12C compiler production diagnostics and source-location metadata.

audits/core/vite-plugin.audit.ts
  Red audit test for 12D Vite HMR behavior, proving the current full-reload fallback is not production HMR.

audits/core/typescript-contracts.audit.ts
  Red audit test for 12E TypeScript import-boundary suppressions in generated/user-facing code.

docs/superpowers/final-tdd-inventory.md
  Pre-populated final release testing inventory. This file grows after each production phase.

AGENTS.md
  Durable rulebook update requiring future phases to update the final TDD inventory.

.git/hooks/pre-commit
  Local phase-completion guard requiring the inventory file whenever a phase completion is staged.

docs/superpowers/feature-maturity.md
  Keeps Phase 12 sliced into 12A-12E and records Phase 12A audit infrastructure without marking core features production-ready.

docs/vanrot-presentation.html
  Shows Phase 12A as the active production audit slice.
```

## Task 1: Add The Isolated Core Audit Lane

**Files:**
- Modify: `package.json`
- Create: `vitest.audit.config.ts`
- Create: `audits/core/README.md`
- Create: `audits/core/audit-slices.ts`

- [x] **Step 1: Add the root audit script**

In `package.json`, add `audit:core` to the `scripts` object:

```json
{
  "scripts": {
    "build": "pnpm -r --if-present run build",
    "typecheck": "pnpm -r --if-present run typecheck",
    "test": "pnpm -r --if-present run test && pnpm test:phase-docs",
    "audit:core": "vitest run --config vitest.audit.config.ts",
    "test:phase-docs": "vitest run scripts/verify-phase-docs.test.mjs",
    "lint": "pnpm -r --if-present run lint",
    "clean": "pnpm -r --if-present run clean",
    "verify:phase-docs": "node scripts/verify-phase-docs.mjs",
    "verify:size": "pnpm --filter @vanrot/runtime size",
    "verify": "pnpm typecheck && pnpm test && pnpm build && pnpm verify:size && pnpm verify:phase-docs"
  }
}
```

Create `vitest.audit.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['audits/core/**/*.audit.ts'],
  },
});
```

- [x] **Step 2: Create the audit README**

Create `audits/core/README.md`:

```markdown
# Vanrot Core Production Audit

`pnpm audit:core` runs production-hardening tests for Phase 12A.

These tests are intentionally red until their owning slices make them pass:

- `12B runtime production hardening`
- `12C compiler diagnostics and source locations`
- `12D Vite dev/build/HMR hardening`
- `12E TypeScript contracts and maturity gates`

The normal development gate remains `pnpm verify`. Do not add these audit files to package-level test globs until the owning slice turns a red audit into passing production coverage.
```

- [x] **Step 3: Create the audit slice label helper**

Create `audits/core/audit-slices.ts`:

```ts
export const auditSlice = {
  runtime: '12B runtime production hardening',
  compiler: '12C compiler diagnostics and source locations',
  vitePlugin: '12D Vite dev/build/HMR hardening',
  typescriptContracts: '12E TypeScript contracts and maturity gates',
} as const;

export type AuditSlice = (typeof auditSlice)[keyof typeof auditSlice];

export function auditCase(slice: AuditSlice, behavior: string): string {
  return `${slice}: ${behavior}`;
}
```

- [x] **Step 4: Confirm the audit files are isolated from normal tests**

Run:

```bash
pnpm verify:phase-docs
```

Expected:

```txt
Phase documentation verification passed.
```

Do not run `pnpm audit:core` yet. The audit command receives its first red test in Task 2.

## Task 2: Add The 12B Runtime Red Audit Test

**Files:**
- Create: `audits/core/runtime.audit.ts`

- [x] **Step 1: Write the failing runtime audit test**

Create `audits/core/runtime.audit.ts`:

```ts
import { describe, expect, test } from 'vitest';
import {
  createCleanupScope,
  disposeCleanupScope,
  registerCleanup,
  runWithCleanupScope,
} from '../../packages/runtime/src/internal.js';
import { auditCase, auditSlice } from './audit-slices.js';

describe(auditSlice.runtime, function () {
  test(
    auditCase(
      auditSlice.runtime,
      'disposing a parent cleanup scope also disposes nested child scopes first',
    ),
    function () {
      const cleanupEvents: string[] = [];
      const parentScope = createCleanupScope();
      const childScope = createCleanupScope();

      runWithCleanupScope(parentScope, function () {
        registerCleanup(function () {
          cleanupEvents.push('parent cleanup');
        });

        runWithCleanupScope(childScope, function () {
          registerCleanup(function () {
            cleanupEvents.push('child cleanup');
          });
        });
      });

      disposeCleanupScope(parentScope);

      expect(cleanupEvents).toEqual(['child cleanup', 'parent cleanup']);
    },
  );
});
```

- [x] **Step 2: Run the audit command and confirm it is red**

Run:

```bash
pnpm audit:core
```

Expected: command exits non-zero and includes this failing test name:

```txt
12B runtime production hardening: disposing a parent cleanup scope also disposes nested child scopes first
```

Expected failure reason:

```txt
expected [ 'parent cleanup' ] to deeply equal [ 'child cleanup', 'parent cleanup' ]
```

- [x] **Step 3: Confirm normal verification still excludes the audit**

Run:

```bash
pnpm test:phase-docs
```

Expected:

```txt
PASS  scripts/verify-phase-docs.test.mjs
```

Do not change runtime implementation in Phase 12A. This red audit belongs to Phase 12B.

## Task 3: Add The 12C Compiler Diagnostics Red Audit Test

**Files:**
- Create: `audits/core/compiler.audit.ts`

- [x] **Step 1: Write the failing compiler audit test**

Create `audits/core/compiler.audit.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { compileComponent } from '../../packages/compiler/src/index.js';
import type { CompileDiagnostic } from '../../packages/compiler/src/index.js';
import { auditCase, auditSlice } from './audit-slices.js';

interface ProductionDiagnosticFields {
  codeFrame: string;
  suggestion: string;
  docsPath: string;
}

describe(auditSlice.compiler, function () {
  test(
    auditCase(
      auditSlice.compiler,
      'unsupported event expressions include code frame, suggestion, and docs path',
    ),
    function () {
      const result = compileComponent({
        componentPath: '/audit/counter.component.ts',
        componentSource: 'export class CounterComponent { count = 0; }',
        templatePath: '/audit/counter.component.html',
        templateSource: '<button (click)="count++">Broken</button>',
        stylePath: '/audit/counter.component.css',
        styleSource: 'button { color: red; }',
      });

      const diagnostic = result.diagnostics.find(function (item) {
        return item.code === 'VR007';
      });

      expect(diagnostic).toBeDefined();

      const productionFields = readProductionDiagnosticFields(diagnostic);

      expect(productionFields.codeFrame).toContain('(click)="count++"');
      expect(productionFields.suggestion).toContain('Use a zero-argument component method');
      expect(productionFields.docsPath).toBe('/docs/compiler/event-binding');
    },
  );
});

function readProductionDiagnosticFields(
  diagnostic: CompileDiagnostic | undefined,
): ProductionDiagnosticFields {
  if (diagnostic === undefined) {
    return {
      codeFrame: '',
      suggestion: '',
      docsPath: '',
    };
  }

  const candidate = diagnostic as CompileDiagnostic & Partial<ProductionDiagnosticFields>;

  return {
    codeFrame: candidate.codeFrame ?? '',
    suggestion: candidate.suggestion ?? '',
    docsPath: candidate.docsPath ?? '',
  };
}
```

- [x] **Step 2: Run the audit command and confirm the compiler audit is red**

Run:

```bash
pnpm audit:core
```

Expected: command exits non-zero and includes this failing test name:

```txt
12C compiler diagnostics and source locations: unsupported event expressions include code frame, suggestion, and docs path
```

Expected failure reason:

```txt
expected '' to contain '(click)="count++"'
```

- [x] **Step 3: Confirm no compiler implementation was changed**

Run:

```bash
git diff -- packages/compiler/src
```

Expected: no output.

Do not add `codeFrame`, `suggestion`, or `docsPath` implementation in Phase 12A. This red audit belongs to Phase 12C.

## Task 4: Add The 12D Vite HMR Red Audit Test

**Files:**
- Create: `audits/core/vite-plugin.audit.ts`

- [x] **Step 1: Write the failing Vite HMR audit test**

Create `audits/core/vite-plugin.audit.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { handleVanrotHotUpdate } from '../../packages/vite-plugin/src/hot-update.js';
import { auditCase, auditSlice } from './audit-slices.js';

interface SentMessage {
  type: string;
}

interface FakeModule {
  id: string;
}

describe(auditSlice.vitePlugin, function () {
  test(
    auditCase(
      auditSlice.vitePlugin,
      'template edits return the owner module for state-preserving HMR instead of forcing a full reload',
    ),
    async function () {
      const ownerModule: FakeModule = {
        id: '/repo/src/app/app.component.ts',
      };
      const sentMessages: SentMessage[] = [];
      const invalidatedModules: FakeModule[] = [];

      const result = await handleVanrotHotUpdate({
        file: '/repo/src/app/app.component.html',
        timestamp: 123,
        server: {
          config: {
            root: '/repo',
          },
          ws: {
            send(message: SentMessage): void {
              sentMessages.push(message);
            },
          },
          moduleGraph: {
            onFileChange(): void {},
            getModulesByFile(): Set<FakeModule> {
              return new Set([ownerModule]);
            },
            getModuleById(): FakeModule {
              return ownerModule;
            },
            async getModuleByUrl(): Promise<FakeModule> {
              return ownerModule;
            },
            invalidateModule(module: FakeModule): void {
              invalidatedModules.push(module);
            },
          },
        },
      } as unknown as Parameters<typeof handleVanrotHotUpdate>[0]);

      expect(sentMessages).not.toContainEqual({ type: 'full-reload' });
      expect(result).toEqual([ownerModule]);
      expect(invalidatedModules).toEqual([ownerModule]);
    },
  );
});
```

- [x] **Step 2: Run the audit command and confirm the Vite audit is red**

Run:

```bash
pnpm audit:core
```

Expected: command exits non-zero and includes this failing test name:

```txt
12D Vite dev/build/HMR hardening: template edits return the owner module for state-preserving HMR instead of forcing a full reload
```

Expected failure reason:

```txt
expected [ { type: 'full-reload' } ] to not contain equal { type: 'full-reload' }
```

- [x] **Step 3: Confirm no Vite implementation was changed**

Run:

```bash
git diff -- packages/vite-plugin/src
```

Expected: no output.

Do not implement state-preserving HMR in Phase 12A. This red audit belongs to Phase 12D.

## Task 5: Add The 12E TypeScript Contract Red Audit Test

**Files:**
- Create: `audits/core/typescript-contracts.audit.ts`

- [x] **Step 1: Write the failing TypeScript contract audit test**

Create `audits/core/typescript-contracts.audit.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { auditCase, auditSlice } from './audit-slices.js';

const appAuthorFacingFiles = [
  'examples/counter/src/main.ts',
  'packages/vite-plugin/tests/fixtures/basic-app/src/main.ts',
  'packages/vite-plugin/tests/fixtures/basic-app/src/routes.ts',
  'packages/ui/src/primitives/button/ui.button.test.ts',
  'packages/cli/src/create/app-template.ts',
] as const;

describe(auditSlice.typescriptContracts, function () {
  test(
    auditCase(
      auditSlice.typescriptContracts,
      'Vanrot-authored app and generated-template imports do not need @ts-expect-error',
    ),
    async function () {
      const offenders: string[] = [];

      for (const filePath of appAuthorFacingFiles) {
        const source = await readFile(filePath, 'utf8');

        if (!source.includes('@ts-expect-error')) {
          continue;
        }

        offenders.push(filePath);
      }

      expect(offenders).toEqual([]);
    },
  );
});
```

- [x] **Step 2: Run the audit command and confirm the TypeScript contract audit is red**

Run:

```bash
pnpm audit:core
```

Expected: command exits non-zero and includes this failing test name:

```txt
12E TypeScript contracts and maturity gates: Vanrot-authored app and generated-template imports do not need @ts-expect-error
```

Expected failure reason includes at least:

```txt
examples/counter/src/main.ts
packages/cli/src/create/app-template.ts
```

- [x] **Step 3: Confirm no TypeScript contract implementation was changed**

Run:

```bash
git diff -- packages/vite-plugin/src packages/compiler/src packages/cli/src examples/counter/src packages/ui/src
```

Expected output may show only the newly created audit file if the shell includes it indirectly. It must not show changes to package implementation files.

Do not solve transformed component declarations in Phase 12A. This red audit belongs to Phase 12E.

## Task 6: Confirm The Final TDD Inventory Is Pre-Populated

**Files:**
- Create or modify: `docs/superpowers/final-tdd-inventory.md`

- [x] **Step 1: Confirm the inventory header and update rule**

Ensure `docs/superpowers/final-tdd-inventory.md` starts with:

```markdown
# Vanrot Final TDD Inventory

**Created:** 2026-05-22
**Purpose:** Grow a complete release-testing checklist from every completed Vanrot phase.
**Final owner:** Phase 26 - Distribution and release hardening
```

Ensure the file includes this update rule:

```markdown
When a phase adds or changes framework surface area:

1. Add or update the matching row in this file.
2. Keep the owning phase or future slice accurate.
3. Describe the final release test expectation, not only the current demo test.
4. Do not remove known gaps until a phase makes them pass through tests.
5. Use this file during Phase 26 to drive the final full-framework TDD pass.
```

- [x] **Step 2: Confirm current package sections exist**

Run:

```bash
rg -n '^## (Repo And Standards|`@vanrot/runtime`|`@vanrot/compiler`|`@vanrot/vite-plugin`|`@vanrot/cli`|`@vanrot/router`|`@vanrot/ui`|`@vanrot/testing`|Examples And Fixtures|Final Release TDD Backlog Anchors)' docs/superpowers/final-tdd-inventory.md
```

Expected: one match for every listed section.

- [x] **Step 3: Confirm Phase 12A red-test anchors exist**

Run:

```bash
rg -n "Runtime edge cases|Compiler source locations|Compiler production diagnostics|Vite true HMR|TypeScript import boundary" docs/superpowers/final-tdd-inventory.md
```

Expected: matches under `Final Release TDD Backlog Anchors`.

- [x] **Step 4: Add missing inventory rows if the checks fail**

If any section or anchor is missing, add the matching rows from the approved Phase 12A design. Use these exact maturity values:

```txt
Demo-Capable
Deferred
Audit-Needed
Production-Ready
Complete
```

Do not mark core runtime, compiler, Vite, or TypeScript contract rows `Production-Ready` in Phase 12A.

## Task 7: Update Durable Rules And The Local Hook

**Files:**
- Modify: `AGENTS.md`
- Modify: `.git/hooks/pre-commit`

- [x] **Step 1: Confirm `AGENTS.md` requires inventory updates**

Ensure the Phase Completion Protocol in `AGENTS.md` includes this rule:

```markdown
Update `docs/superpowers/final-tdd-inventory.md` whenever a phase adds or changes a package, feature, component, command, convention, helper, example, or generated file.
```

- [x] **Step 2: Confirm `AGENTS.md` explains the inventory purpose**

Ensure `AGENTS.md` includes this paragraph near the production slicing rule:

```markdown
`docs/superpowers/final-tdd-inventory.md` is the final release testing memory. It must grow with each production phase so Phase 26 can run complete failing and passing TDD coverage across every package, command, component, convention, helper, example, and generated file before distribution.
```

- [x] **Step 3: Confirm the local hook requires the inventory**

Ensure `.git/hooks/pre-commit` contains this staged-file check:

```sh
if ! has_staged_file "docs/superpowers/final-tdd-inventory.md"; then
  missing=true
fi
```

Ensure the hook message contains this bullet:

```txt
- Update docs/superpowers/final-tdd-inventory.md with any package, feature, command, convention, helper, example, or generated file changes.
```

- [x] **Step 4: Verify the hook syntax**

Run:

```bash
sh -n .git/hooks/pre-commit
```

Expected: no output and exit code `0`.

## Task 8: Update Phase 12A Roadmap State

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/vanrot-presentation.html`

- [x] **Step 1: Keep Phase 12 sliced into 12A through 12E**

In `docs/superpowers/feature-maturity.md`, confirm the Production Slicing Map row for Phase 12 says:

```txt
12A core audit and failing tests; 12B runtime production hardening; 12C compiler diagnostics and source locations; 12D Vite dev/build/HMR hardening; 12E TypeScript contracts and maturity gates.
```

- [x] **Step 2: Add Phase 12A audit infrastructure rows if absent**

If there is no `Production Audit Infrastructure` section, add this section under `## Repo` after `### Production Standards Foundation`:

```markdown
### Production Audit Infrastructure

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---------|-----------------|--------------:|-------------------|-----------------------|--------|-------|
| Core production audit lane | repo and tests | Phase 12 | `pnpm audit:core` runs isolated red tests for known production gaps | Each audit test is either converted into normal passing coverage by its owning slice or remains tracked in the final TDD inventory | Demo-Capable | Phase 12A creates the red lane without marking runtime, compiler, Vite, or TypeScript contracts production-ready. |
| Final TDD inventory growth rule | repo and docs | Phase 12 | `docs/superpowers/final-tdd-inventory.md` is pre-populated and required by durable rules | Phase 26 uses the inventory for complete release TDD across the whole framework | Demo-Capable | Every future production phase must update the inventory when framework surface area changes. |
```

- [x] **Step 3: Do not tick all of Phase 12**

Confirm the top production roadmap row still shows Phase 12 pending:

```markdown
| [ ]  | Phase 12 | Core framework hardening
```

Phase 12 remains pending until 12B, 12C, 12D, and 12E complete.

- [x] **Step 4: Update the presentation roadmap copy**

In `docs/vanrot-presentation.html`, update the roadmap card or note for Phase 12 so humans can see that Phase 12A is the active sub-slice. The visible copy should include:

```txt
12A audit lane active
```

and:

```txt
Red tests map to 12B-12E
```

Do not mark Phase 12 as done in the presentation.

## Task 9: Verify Green Normal Lane And Red Audit Lane

**Files:**
- No source modifications.

- [x] **Step 1: Run lightweight formatting check**

Run:

```bash
git diff --check
```

Expected: no output and exit code `0`.

- [x] **Step 2: Run phase docs verification**

Run:

```bash
pnpm verify:phase-docs
```

Expected:

```txt
Phase documentation verification passed.
```

- [x] **Step 3: Run the normal verification lane**

Run:

```bash
pnpm verify
```

Expected: exit code `0`.

If this fails because the audit files were accidentally included in normal Vitest globs, fix the file naming or script boundaries so only `pnpm audit:core` runs `*.audit.ts` files.

- [x] **Step 4: Run the red audit lane**

Run:

```bash
pnpm audit:core
```

Expected: exit code is non-zero and output includes these four owner slices:

```txt
12B runtime production hardening
12C compiler diagnostics and source locations
12D Vite dev/build/HMR hardening
12E TypeScript contracts and maturity gates
```

Expected: output includes at least these four red test behaviors:

```txt
disposing a parent cleanup scope also disposes nested child scopes first
unsupported event expressions include code frame, suggestion, and docs path
template edits return the owner module for state-preserving HMR instead of forcing a full reload
Vanrot-authored app and generated-template imports do not need @ts-expect-error
```

- [x] **Step 5: Record the expected red state**

In the final implementation summary, report that:

```txt
pnpm verify passed.
pnpm audit:core failed as expected for Phase 12A red production tests.
```

Do not treat the red audit command as a failed Phase 12A implementation. It is the point of this phase.

## Task 10: Complete Phase 12A Documentation State

**Files:**
- Modify: `docs/superpowers/plans/Phase-12A.md`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/final-tdd-inventory.md`

- [x] **Step 1: Check off completed tasks in this plan**

After implementation and verification, change each completed task checkbox in `docs/superpowers/plans/Phase-12A.md` from:

```markdown
unchecked step checkbox
```

to:

```markdown
- [x] **Step
```

- [x] **Step 2: Keep the Phase 12 top-level roadmap pending**

Confirm `docs/superpowers/feature-maturity.md` still contains:

```markdown
| [ ]  | Phase 12 | Core framework hardening
```

- [x] **Step 3: Confirm no core Phase 12 production rows were over-promoted**

Run:

```bash
rg -n "Phase 12.*Production-Ready|Production-Ready.*Phase 12" docs/superpowers/feature-maturity.md
```

Expected: no output for runtime, compiler, Vite, or TypeScript contract rows.

- [x] **Step 4: Confirm the inventory knows Phase 12A exists**

Run:

```bash
rg -n "final TDD inventory|Core production audit lane|Runtime edge cases|TypeScript import boundary" docs/superpowers/final-tdd-inventory.md docs/superpowers/feature-maturity.md
```

Expected: matches in the inventory and maturity ledger.

- [x] **Step 5: Leave Git ownership with the user**

Run:

```bash
git status --short --branch
```

Expected: changed files are unstaged. Do not run `git add`, `git commit`, or `git push`.

## Self-Review Checklist

- [x] The plan creates a separate red audit lane and does not add audit files to normal package test globs.
- [x] The plan adds real failing tests for 12B, 12C, 12D, and 12E.
- [x] The plan keeps `pnpm verify` green.
- [x] The plan keeps `pnpm audit:core` red by design.
- [x] The plan updates the final TDD inventory and makes future phases maintain it.
- [x] The plan updates `AGENTS.md` and `.git/hooks/pre-commit` for inventory enforcement.
- [x] The plan does not mark runtime, compiler, Vite, or TypeScript contract features `Production-Ready`.
- [x] The plan does not include git staging, commits, pushes, branches, or worktrees.
