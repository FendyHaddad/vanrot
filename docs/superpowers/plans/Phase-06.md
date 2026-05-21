# Vanrot Counter Demo Milestone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first real Vanrot example app and prove the runtime, compiler, Vite plugin, and CLI work together through a counter demo.

**Architecture:** `examples/counter` is a pnpm workspace package that imports `@vanrot/runtime`, uses `@vanrot/vite-plugin`, and routes build and doctor workflows through `vr`. Component files live in role-owned directories, and the existing CLI starter/generator output is aligned with the same directory convention so the framework demonstrates its own rules.

**Tech Stack:** TypeScript 5, Vitest 4, Vite 8, pnpm workspaces, Vanrot runtime signals, Vanrot compiler component conventions, Vanrot Vite plugin, and the Phase 5 `vr` CLI.

**Spec:** `docs/superpowers/specs/Phase-06.md`

---

## Prerequisites

Implementation happens on `main`; do not create a worktree or feature branch.

Before starting, verify the workspace state:

```bash
git status --short --branch
```

Expected before Phase 6 implementation:

```txt
## main...origin/main
 M AGENTS.md
```

Do not stage or modify the existing `AGENTS.md` change unless the user explicitly asks.

The Phase 6 spec and implementation plan are committed on `origin/main` before implementation begins:

```bash
git log --oneline --decorate -3
```

Expected output includes the implementation plan commit and the earlier spec commit:

```txt
Plan Phase 6 implementation
Plan Phase 6 counter demo
```

---

## File Structure

Target files and responsibilities:

```txt
examples/
  .gitkeep                                    - remove when real example package exists
  counter/
    package.json                             - workspace package scripts and dependencies
    index.html                               - Vite HTML entry
    tsconfig.json                            - strict TS config for app and tests
    vite.config.ts                           - Vanrot Vite plugin setup
    src/
      main.ts                                - DOM mount target lookup and mount call
      counter/
        counter.component.ts                 - signal state and event methods
        counter.component.html               - template with interpolation and events
        counter.component.css                - scoped styles for the demo
    tests/
      counter-build.test.ts                  - Vite build integration test

packages/cli/
  src/
    create/
      app-template.ts                        - move starter component files into src/app/
    generate/
      write-role-files.ts                    - create component/page files in role-owned dirs
  tests/
    create.test.ts                           - expected starter paths
    generate.test.ts                         - expected generated paths

docs/
  brainstorm.md                              - tick Phase 6 after verification
  vanrot-presentation.html                   - Phase 6 complete, Phase 7 active
  superpowers/
    feature-maturity.md                      - move counter demo app row to Demo-Capable
    specs/Phase-06.md                        - keep spec aligned with the convention support task
    plans/Phase-06.md                        - update checkboxes as implementation completes

pnpm-lock.yaml                               - add examples/counter workspace importer
```

Generated outputs are not committed:

```txt
examples/counter/dist/
examples/counter/node_modules/
packages/*/dist/tsconfig.tsbuildinfo
```

---

## Stage 1 - Example Package Harness

### Task 1: Add the counter example package and failing build test

**Files:**

- Delete: `examples/.gitkeep`
- Create: `examples/counter/package.json`
- Create: `examples/counter/index.html`
- Create: `examples/counter/tsconfig.json`
- Create: `examples/counter/vite.config.ts`
- Create: `examples/counter/tests/counter-build.test.ts`
- Modify: `pnpm-lock.yaml`

- [x] **Step 1: Remove the empty examples marker**

Delete `examples/.gitkeep` once `examples/counter` exists.

- [x] **Step 2: Create the example package manifest**

Create `examples/counter/package.json`:

```json
{
  "name": "@vanrot/example-counter",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.1.3",
  "scripts": {
    "dev": "vr dev",
    "build": "vr build",
    "test": "vitest run",
    "doctor": "vr doctor",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  },
  "dependencies": {
    "@vanrot/runtime": "workspace:*"
  },
  "devDependencies": {
    "@vanrot/cli": "workspace:*",
    "@vanrot/vite-plugin": "workspace:*",
    "typescript": "^5.9.3",
    "vite": "^8.0.10",
    "vitest": "^4.0.14"
  }
}
```

- [x] **Step 3: Create the Vite HTML entry**

Create `examples/counter/index.html`:

```html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

- [x] **Step 4: Create the example TypeScript config**

Create `examples/counter/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "types": ["node", "vite/client", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "vite.config.ts"]
}
```

- [x] **Step 5: Create the Vite config**

Create `examples/counter/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import vanrot from '@vanrot/vite-plugin';

export default defineConfig({
  plugins: [vanrot()],
});
```

- [x] **Step 6: Write the failing build integration test**

Create `examples/counter/tests/counter-build.test.ts`:

```ts
import { readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

const appRoot = resolve(import.meta.dirname, '..');
const outDir = resolve(appRoot, 'dist');

describe('counter example build', () => {
  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  it('builds JavaScript and scoped CSS assets through Vite', async () => {
    await build({
      root: appRoot,
      logLevel: 'silent',
      build: {
        outDir,
        emptyOutDir: true,
      },
    });

    const assets = await readdir(resolve(outDir, 'assets'));

    expect(assets).toEqual(
      expect.arrayContaining([expect.stringMatching(/\.js$/), expect.stringMatching(/\.css$/)]),
    );
  });
});
```

- [x] **Step 7: Update workspace links and lockfile**

Run:

```bash
pnpm install
```

Expected:

```txt
Done
```

`pnpm-lock.yaml` should now contain an `examples/counter` importer.

- [x] **Step 8: Run the test and verify it fails for the missing app source**

Run:

```bash
pnpm --filter @vanrot/example-counter test -- tests/counter-build.test.ts
```

Expected:

```txt
FAIL examples/counter/tests/counter-build.test.ts
Could not resolve "/src/main.ts"
```

Do not commit this failing state yet. The next task adds the app source and commits the complete example.

---

## Stage 2 - Counter App

### Task 2: Add the counter component directory and make the example pass

**Files:**

- Create: `examples/counter/src/main.ts`
- Create: `examples/counter/src/counter/counter.component.ts`
- Create: `examples/counter/src/counter/counter.component.html`
- Create: `examples/counter/src/counter/counter.component.css`
- Test: `examples/counter/tests/counter-build.test.ts`

- [x] **Step 1: Add the mount entry**

Create `examples/counter/src/main.ts`:

```ts
import { mount } from '@vanrot/runtime';
// @ts-expect-error Vanrot's Vite plugin compiles component modules to default exports.
import Counter from './counter/counter.component.ts';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

mount(Counter, target);
```

- [x] **Step 2: Add the signal-first counter class**

Create `examples/counter/src/counter/counter.component.ts`:

```ts
import { signal } from '@vanrot/runtime';

const copy: Record<string, string> = {
  'counter.eyebrow': 'Vanrot demo',
  'counter.title': 'Counter',
  'counter.summary': 'Signals update only the affected DOM text.',
  'counter.decrement': 'Decrease',
  'counter.increment': 'Increase',
  'counter.reset': 'Reset',
};

export class CounterComponent {
  count = signal(0);

  increment(): void {
    this.count.set(this.count() + 1);
  }

  decrement(): void {
    if (this.count() === 0) {
      return;
    }

    this.count.set(this.count() - 1);
  }

  reset(): void {
    this.count.set(0);
  }

  t(key: string): string {
    return copy[key] ?? key;
  }
}
```

- [x] **Step 3: Add the template using only supported Phase 3 syntax**

Create `examples/counter/src/counter/counter.component.html`:

```html
<main class="counter-shell" aria-label="Counter demo">
  <section class="counter-panel">
    <p class="counter-eyebrow">{{ t('counter.eyebrow') }}</p>
    <h1 class="counter-title">{{ t('counter.title') }}</h1>
    <p class="counter-summary">{{ t('counter.summary') }}</p>

    <output class="counter-value" aria-live="polite">{{ count() }}</output>

    <div class="counter-actions">
      <button class="counter-button" type="button" (click)="decrement()">
        {{ t('counter.decrement') }}
      </button>
      <button class="counter-button counter-button-primary" type="button" (click)="increment()">
        {{ t('counter.increment') }}
      </button>
      <button class="counter-button" type="button" (click)="reset()">
        {{ t('counter.reset') }}
      </button>
    </div>
  </section>
</main>
```

- [x] **Step 4: Add scoped CSS for the demo**

Create `examples/counter/src/counter/counter.component.css`:

```css
.counter-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  color: #f4f7fb;
  background: #11161f;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.counter-panel {
  width: min(100%, 480px);
  display: grid;
  gap: 18px;
  padding: 28px;
  border: 1px solid rgba(244, 247, 251, 0.14);
  border-radius: 8px;
  background: #161d29;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.counter-eyebrow {
  margin: 0;
  color: #8fd5ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.counter-title {
  margin: 0;
  font-size: 36px;
  line-height: 1.05;
}

.counter-summary {
  margin: 0;
  color: #b7c1cf;
  line-height: 1.6;
}

.counter-value {
  width: 100%;
  min-height: 112px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(143, 213, 255, 0.32);
  border-radius: 8px;
  background: #0f141c;
  color: #ffffff;
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
}

.counter-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.counter-button {
  min-height: 44px;
  border: 1px solid rgba(244, 247, 251, 0.18);
  border-radius: 6px;
  background: #202a38;
  color: #f4f7fb;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.counter-button:hover {
  border-color: rgba(143, 213, 255, 0.7);
}

.counter-button-primary {
  background: #8fd5ff;
  color: #10151d;
}

@media (max-width: 520px) {
  .counter-shell {
    padding: 18px;
  }

  .counter-actions {
    grid-template-columns: 1fr;
  }
}
```

- [x] **Step 5: Run the example typecheck**

Run:

```bash
pnpm --filter @vanrot/example-counter typecheck
```

Expected:

```txt
@vanrot/example-counter typecheck: Done
```

- [x] **Step 6: Run the example build test**

Run:

```bash
pnpm --filter @vanrot/example-counter test -- tests/counter-build.test.ts
```

Expected:

```txt
PASS examples/counter/tests/counter-build.test.ts
```

- [x] **Step 7: Verify the example build script routes through `vr build`**

Run:

```bash
pnpm --filter @vanrot/example-counter build
```

Expected:

```txt
@vanrot/example-counter build: Building Vanrot app
@vanrot/example-counter build: Done
```

- [x] **Step 8: Verify doctor has no findings**

Run:

```bash
pnpm --filter @vanrot/example-counter doctor
```

Expected:

```txt
@vanrot/example-counter doctor: Vanrot Doctor                                   0 findings
@vanrot/example-counter doctor: Done
```

- [x] **Step 9: Commit the counter example**

Run:

```bash
git add examples pnpm-lock.yaml
git commit -m "feat(examples): add counter demo"
```

---

## Stage 3 - CLI Directory Convention Alignment

### Task 3: Update `vr create` to scaffold component files inside `src/app`

**Files:**

- Modify: `packages/cli/tests/create.test.ts`
- Modify: `packages/cli/src/create/app-template.ts`

- [x] **Step 1: Update the failing create test expectations**

In `packages/cli/tests/create.test.ts`, update the first test's path assertions to expect `src/app/`:

```ts
    await expect(readFile(join(cwd, 'demo-app', 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "from './app/app.component.ts'",
    );
    await expect(
      readFile(join(cwd, 'demo-app', 'src', 'app', 'app.component.ts'), 'utf8'),
    ).resolves.toContain('export class AppComponent');
    await expect(
      readFile(join(cwd, 'demo-app', 'src', 'app', 'app.component.html'), 'utf8'),
    ).resolves.toContain('{{ title() }}');
    await expect(
      readFile(join(cwd, 'demo-app', 'src', 'app', 'app.component.css'), 'utf8'),
    ).resolves.toContain('.app');
```

- [x] **Step 2: Run the create test and verify it fails**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected:

```txt
FAIL packages/cli/tests/create.test.ts
ENOENT
```

- [x] **Step 3: Update the starter template paths**

In `packages/cli/src/create/app-template.ts`, replace the existing `src/main.ts` and `src/app.component.*` template entries with these entries:

```ts
    {
      path: 'src/main.ts',
      content: `import { mount } from '@vanrot/runtime';\nimport App from './app/app.component.ts';\n\nconst target = document.getElementById('app');\n\nif (target === null) {\n  throw new Error('Missing #app mount target.');\n}\n\nmount(App, target);\n`,
    },
    {
      path: 'src/app/app.component.ts',
      content: `import { signal } from '@vanrot/runtime';\n\nexport class AppComponent {\n  title = signal('Vanrot');\n}\n`,
    },
    {
      path: 'src/app/app.component.html',
      content: `<main class="app">\n  <h1>{{ title() }}</h1>\n</main>\n`,
    },
    {
      path: 'src/app/app.component.css',
      content: `.app {\n  display: grid;\n  gap: 16px;\n  padding: 32px;\n  font-family: system-ui, sans-serif;\n}\n`,
    },
```

- [x] **Step 4: Run the create test and verify it passes**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected:

```txt
PASS packages/cli/tests/create.test.ts
```

- [x] **Step 5: Commit the create template alignment**

Run:

```bash
git add packages/cli/tests/create.test.ts packages/cli/src/create/app-template.ts
git commit -m "feat(cli): scaffold app component directories"
```

### Task 4: Update `vr generate` to create component and page directories

**Files:**

- Modify: `packages/cli/tests/generate.test.ts`
- Modify: `packages/cli/src/generate/write-role-files.ts`

- [x] **Step 1: Update the failing generate test expectations**

In `packages/cli/tests/generate.test.ts`, update the base directories:

```ts
    const base = join(cwd, 'src', 'features', 'users', 'components', 'user-card');
```

```ts
    const base = join(cwd, 'src', 'features', 'users', 'dashboard');
```

```ts
    await expect(
      readFile(join(cwd, 'src', 'components', 'status-pill', 'status-pill.component.ts'), 'utf8'),
    ).resolves.toContain('StatusPillComponent');
    await expect(
      readFile(join(cwd, 'src', 'pages', 'settings', 'settings.page.ts'), 'utf8'),
    ).resolves.toContain('SettingsPage');
```

- [x] **Step 2: Run the generate test and verify it fails**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/generate.test.ts
```

Expected:

```txt
FAIL packages/cli/tests/generate.test.ts
ENOENT
```

- [x] **Step 3: Update generated role-file directories**

In `packages/cli/src/generate/write-role-files.ts`, replace `resolveDirectory()` with:

```ts
function resolveDirectory(options: WriteRoleFilesOptions): string {
  if (options.feature !== undefined && options.role === 'component') {
    return join('src', 'features', options.feature, 'components', options.name);
  }

  if (options.feature !== undefined) {
    return join('src', 'features', options.feature, options.name);
  }

  return options.role === 'component'
    ? join('src', 'components', options.name)
    : join('src', 'pages', options.name);
}
```

- [x] **Step 4: Run the generate test and verify it passes**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/generate.test.ts
```

Expected:

```txt
PASS packages/cli/tests/generate.test.ts
```

- [x] **Step 5: Run the full CLI test suite**

Run:

```bash
pnpm --filter @vanrot/cli test
```

Expected:

```txt
Test Files  6 passed
Tests       21 passed
```

If the test count changes because additional assertions are added, all CLI test files must still pass.

- [x] **Step 6: Commit the generator alignment**

Run:

```bash
git add packages/cli/tests/generate.test.ts packages/cli/src/generate/write-role-files.ts
git commit -m "feat(cli): generate role-owned directories"
```

---

## Stage 4 - End-to-End Workflow Verification

### Task 5: Verify Phase 6 CLI workflows against the example

**Files:**

- Verify: `examples/counter/package.json`
- Verify: `examples/counter/src/counter/counter.component.ts`
- Verify: `examples/counter/src/counter/counter.component.html`
- Verify: `examples/counter/src/counter/counter.component.css`

- [x] **Step 1: Verify package scripts**

Run:

```bash
pnpm --filter @vanrot/example-counter build
pnpm --filter @vanrot/example-counter test
pnpm --filter @vanrot/example-counter doctor
```

Expected:

```txt
@vanrot/example-counter build: Done
@vanrot/example-counter test: Done
@vanrot/example-counter doctor: Done
```

- [x] **Step 2: Verify direct `vr` commands in the example package context**

Run:

```bash
pnpm --filter @vanrot/example-counter exec vr build
pnpm --filter @vanrot/example-counter exec vr test
pnpm --filter @vanrot/example-counter exec vr doctor
```

Expected:

```txt
Building Vanrot app
Running Vanrot tests
Vanrot Doctor                                   0 findings
```

- [x] **Step 3: Confirm the demo avoids unsupported compiler features**

Run:

```bash
! rg -n "@if|@for|\\[\\(|\\)\\]|ng-|v-for|v-if|jsx" examples/counter/src
```

Expected:

```txt
```

The command should print no matches.

- [x] **Step 4: Confirm component files are grouped in their own directory**

Run:

```bash
find examples/counter/src -maxdepth 3 -type f | sort
```

Expected:

```txt
examples/counter/src/counter/counter.component.css
examples/counter/src/counter/counter.component.html
examples/counter/src/counter/counter.component.ts
examples/counter/src/main.ts
```

No commit is needed for this task unless a verification failure required a code change.

---

## Stage 5 - Documentation And Trackers

### Task 6: Mark Phase 6 complete after verification

**Files:**

- Modify: `docs/brainstorm.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/plans/Phase-06.md`

- [x] **Step 1: Update the feature maturity ledger**

In `docs/superpowers/feature-maturity.md`, change the counter demo row from:

```markdown
| Counter demo app | examples | Phase 6 | Counter compiles and updates without virtual DOM | Demo documents runtime, compiler, Vite, and CLI integration boundaries | Deferred | Phase 6 owns this. |
```

to:

```markdown
| Counter demo app | examples | Phase 6 | Counter compiles and updates without virtual DOM | Demo documents runtime, compiler, Vite, and CLI integration boundaries | Demo-Capable | Phase 6 verified a workspace example app with grouped component files, signal updates, scoped CSS, Vite build output, CLI build/test/doctor workflows, and no production hardening claims. |
```

- [x] **Step 2: Tick Phase 6 in brainstorm**

In `docs/brainstorm.md`, change the Phase 6 row from:

```markdown
| [ ] | Phase 6 - Counter demo milestone | First working demo app using separate `.ts`, `.html`, and `.css` files. | The counter demo compiles into efficient output, updates only affected DOM nodes, uses scoped CSS, and does not need virtual DOM. |
```

to:

```markdown
| [x] | Phase 6 - Counter demo milestone | First working demo app using separate `.ts`, `.html`, and `.css` files grouped inside a component directory. | The counter demo compiles into efficient output, updates only affected DOM nodes, uses scoped CSS, and verifies the CLI build/test/doctor workflow. |
```

- [x] **Step 3: Update the roadmap presentation**

In `docs/vanrot-presentation.html`:

Change the Phase 6 roadmap card from:

```html
        <div class="phase-card active-phase">
          <div class="phase-num">Phase 6</div>
          <div class="phase-name">Counter Demo</div>
          <div class="phase-status">⚡ Active</div>
        </div>
```

to:

```html
        <div class="phase-card done">
          <div class="phase-num">Phase 6</div>
          <div class="phase-name">Counter Demo</div>
          <div class="phase-status">✅ Done</div>
        </div>
```

Change the Phase 7 roadmap card from:

```html
        <div class="phase-card">
          <div class="phase-num">Phase 7</div>
          <div class="phase-name">Project Intelligence</div>
        </div>
```

to:

```html
        <div class="phase-card active-phase">
          <div class="phase-num">Phase 7</div>
          <div class="phase-name">Project Intelligence</div>
          <div class="phase-status">⚡ Active</div>
        </div>
```

Update the summary text from:

```html
        <span style="color:var(--cyan);">⚡ Active: Phase 6 (Counter Demo Milestone)</span>
```

to:

```html
        <span style="color:var(--cyan);">⚡ Active: Phase 7 (Project Intelligence)</span>
```

If nearby counts still say Phase 5 or Phase 6 is queued, update them to show:

```txt
Done: Phases 0-6
Active: Phase 7
Queued: Phases 8-11
```

- [x] **Step 4: Mark completed plan steps**

In `docs/superpowers/plans/Phase-06.md`, change each completed implementation checkbox from:

```markdown
- unchecked **Step
```

to:

```markdown
- [x] **Step
```

Only mark steps complete after their commands pass.

- [x] **Step 5: Run phase documentation verification**

Run:

```bash
pnpm verify:phase-docs
```

Expected:

```txt
Phase documentation verification passed.
```

- [x] **Step 6: Commit tracker updates**

Run:

```bash
git add docs/brainstorm.md docs/vanrot-presentation.html docs/superpowers/feature-maturity.md docs/superpowers/plans/Phase-06.md
git commit -m "docs: mark Phase 6 complete"
```

---

## Stage 6 - Final Verification

### Task 7: Run the full repository verification and push

**Files:**

- Verify: repository root

- [x] **Step 1: Run focused Phase 6 checks**

Run:

```bash
pnpm --filter @vanrot/example-counter typecheck
pnpm --filter @vanrot/example-counter test
pnpm --filter @vanrot/example-counter build
pnpm --filter @vanrot/example-counter doctor
pnpm --filter @vanrot/cli test
```

Expected:

```txt
@vanrot/example-counter typecheck: Done
@vanrot/example-counter test: Done
@vanrot/example-counter build: Done
@vanrot/example-counter doctor: Done
@vanrot/cli test: Done
```

- [x] **Step 2: Run the full root verification**

Run:

```bash
pnpm verify
```

Expected:

```txt
Phase documentation verification passed.
```

The command must exit with status `0`.

- [x] **Step 3: Confirm only unrelated local changes remain**

Run:

```bash
git status --short --branch
```

Expected after all Phase 6 commits:

```txt
## main...origin/main [ahead 4]
 M AGENTS.md
```

The ahead count may differ if a fix commit was needed, but `AGENTS.md` should remain the only unstaged unrelated file.

- [x] **Step 4: Push Phase 6 implementation commits**

Run:

```bash
git push origin main
```

Expected:

```txt
main -> main
```

- [x] **Step 5: Record final memory observation**

Run:

```bash
curl -sS -X POST http://localhost:37777/api/sessions/observations \
  -H 'Content-Type: application/json' \
  -d '{"contentSessionId":"codex-2026-05-21-phase-6-planning","platformSource":"codex","tool_name":"codex","observations":["Implemented Phase 6 counter demo in examples/counter, aligned CLI create/generate output with component directories, updated docs trackers, ran focused example/CLI checks and pnpm verify, and pushed main to origin/main."]}'
```

Expected:

```json
{"status":"queued"}
```

---

## Self-Review

Spec coverage:

```txt
Goal and full framework loop: Tasks 1, 2, and 5
Component directory convention: Tasks 2, 3, and 4
Counter behavior and guard clause: Task 2
Scoped CSS: Task 2 and Task 5
CLI build/test/doctor workflows: Task 5
External verification and root verify: Task 7
Docs and maturity tracker updates: Task 6
No production hardening claims: Task 6 updates only the counter demo row
```

Completeness check:

```txt
Every new file has exact content.
Every changed behavior has a failing test or verification command before the implementation step.
Every command has an expected result.
No implementation task requires a worktree or separate branch.
```

Type and name consistency:

```txt
Example package name is @vanrot/example-counter in every pnpm filter.
Component class is CounterComponent and file path is src/counter/counter.component.ts.
Starter app component path is src/app/app.component.ts.
Generated component path includes src/components/<name>/<name>.component.ts.
Generated page path includes src/pages/<name>/<name>.page.ts.
```
