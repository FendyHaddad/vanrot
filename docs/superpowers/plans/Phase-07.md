# Vanrot Project Intelligence Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add demo-capable provider-neutral project intelligence through `vr map`, `.vanrot/project-map.json`, `vr init-ai`, and `.vanrot/ai-rules.md`.

**Architecture:** Phase 7 stays inside `@vanrot/cli`. Intelligence helpers scan `src/`, classify role-based Vanrot files, build a stable project map object, and write files under `.vanrot/`; command handlers only parse arguments, call helpers, and report calm output. Strict diagnostics, i18n validation, accessibility audits, compiler-aware graphing, and AI provider integrations remain deferred production work in the maturity ledger.

**Tech Stack:** TypeScript 5, Node `fs/promises`, Vitest 4, pnpm workspaces, existing Vanrot CLI dispatcher and reporter, `.vanrot/` project metadata files.

**Spec:** `docs/superpowers/specs/Phase-07.md`

---

## Prerequisites

Implementation happens on `main`; do not create a branch or worktree.

The user owns commits and pushes. Do not run:

```bash
git add
git commit
git push
```

Before starting, verify the workspace state:

```bash
git status --short --branch
```

Expected current planning state:

```txt
## main...origin/main
 M AGENTS.md
 M docs/superpowers/feature-maturity.md
?? docs/superpowers/plans/Phase-07.md
?? docs/superpowers/specs/Phase-07.md
```

Leave unrelated `AGENTS.md` changes untouched.

Plan checkpoints replace commit steps. At each checkpoint, run the listed verification command and leave files unstaged for user review.

---

## File Structure

Target files and responsibilities:

```txt
packages/cli/
  vite.config.ts                              - Vitest alias so new tests can import source through `@/`
  tests/
    tsconfig.json                            - IDE/type context for test imports using `@/`
    intelligence/
      role-files.test.ts                     - role-file discovery tests
      project-map.test.ts                    - project map shape and i18n tests
      ai-rules.test.ts                       - AI rules content tests
    intelligence-commands.test.ts            - `vr map` and `vr init-ai` command tests
    cli.test.ts                              - root help and command help expectations
  src/
    cli.ts                                   - dispatch `map` and `init-ai`
    commands/
      map.ts                                 - `vr map` command handler
      init-ai.ts                             - `vr init-ai` command handler
    intelligence/
      role-files.ts                          - scan `src/` and classify role files
      project-map.ts                         - validate project and build JSON shape
      ai-rules.ts                            - canonical `.vanrot/ai-rules.md` content
      write-vanrot-file.ts                   - create `.vanrot/` and write files

docs/
  brainstorm.md                              - tick Phase 7 only after implementation verification
  vanrot-presentation.html                   - Phase 7 done and Phase 8 active after verification
  superpowers/
    feature-maturity.md                      - move Phase 7 rows to Demo-Capable after verification
    plans/Phase-07.md                        - mark completed tasks during implementation
```

Do not commit generated command output from manual checks unless the user explicitly asks:

```txt
.vanrot/project-map.json
.vanrot/ai-rules.md
examples/counter/.vanrot/project-map.json
examples/counter/.vanrot/ai-rules.md
```

---

## Stage 1 - Test Import Alias

### Task 1: Add CLI test alias support

**Files:**
- Create: `packages/cli/vite.config.ts`
- Create: `packages/cli/tests/tsconfig.json`

- [x] **Step 1: Create the failing alias import test**

Before adding alias config, temporarily update `packages/cli/tests/cli.test.ts` so the first import uses `@/`:

```ts
import { runCli } from '@/index.js';
import { describe, expect, it } from 'vitest';
import { createMemoryReporter } from '../src/reporter/reporter.js';
```

- [x] **Step 2: Run the CLI test to verify the alias is missing**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/cli.test.ts
```

Expected:

```txt
FAIL packages/cli/tests/cli.test.ts
Cannot find package '@/index.js'
```

- [x] **Step 3: Add the Vitest alias config**

Create `packages/cli/vite.config.ts`:

```ts
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

- [x] **Step 4: Add test TypeScript path context**

Create `packages/cli/tests/tsconfig.json`:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "..",
    "noEmit": true,
    "rootDir": "..",
    "types": ["node", "vitest/globals"],
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["../src/**/*.ts", "./**/*.ts"]
}
```

- [x] **Step 5: Keep CLI tests on the alias**

Update the rest of `packages/cli/tests/cli.test.ts` imports to:

```ts
import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { describe, expect, it } from 'vitest';
```

- [x] **Step 6: Run the CLI test again**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/cli.test.ts
```

Expected:

```txt
PASS packages/cli/tests/cli.test.ts
```

- [x] **Step 7: Checkpoint**

Run:

```bash
git status --short --branch
```

Expected: new `packages/cli/vite.config.ts` and `packages/cli/tests/tsconfig.json` are unstaged.

---

## Stage 2 - Role File Discovery

### Task 2: Add role-file discovery helpers

**Files:**
- Create: `packages/cli/tests/intelligence/role-files.test.ts`
- Create: `packages/cli/src/intelligence/role-files.ts`

- [x] **Step 1: Write the failing role discovery tests**

Create `packages/cli/tests/intelligence/role-files.test.ts`:

```ts
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { discoverRoleFiles } from '@/intelligence/role-files.js';

async function tempProject(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-role-files-'));
  await mkdir(join(cwd, 'src', 'counter'), { recursive: true });
  await mkdir(join(cwd, 'src', 'pages', 'settings'), { recursive: true });
  await mkdir(join(cwd, 'src', 'forms', 'login'), { recursive: true });
  return cwd;
}

describe('discoverRoleFiles', () => {
  it('discovers role files with sibling template and style paths', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.ts'), 'export class CounterComponent {}\n');
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.html'), '<button>{{ count() }}</button>\n');
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.css'), '.counter { display: block; }\n');
    await writeFile(join(cwd, 'src', 'pages', 'settings', 'settings.page.ts'), 'export class SettingsPage {}\n');
    await writeFile(join(cwd, 'src', 'pages', 'settings', 'settings.page.html'), '<main>{{ title() }}</main>\n');
    await writeFile(join(cwd, 'src', 'pages', 'settings', 'settings.page.css'), '.settings { display: block; }\n');
    await writeFile(join(cwd, 'src', 'ignored.ts'), 'export const ignored = true;\n');

    const roles = await discoverRoleFiles(cwd);

    expect(roles).toEqual([
      {
        name: 'counter',
        role: 'component',
        path: 'src/counter/counter.component.ts',
        templatePath: 'src/counter/counter.component.html',
        stylePath: 'src/counter/counter.component.css',
      },
      {
        name: 'settings',
        role: 'page',
        path: 'src/pages/settings/settings.page.ts',
        templatePath: 'src/pages/settings/settings.page.html',
        stylePath: 'src/pages/settings/settings.page.css',
      },
    ]);
  });

  it('represents missing sibling files as null', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'forms', 'login', 'login.form.ts'), 'export class LoginForm {}\n');

    const roles = await discoverRoleFiles(cwd);

    expect(roles).toEqual([
      {
        name: 'login',
        role: 'form',
        path: 'src/forms/login/login.form.ts',
        templatePath: null,
        stylePath: null,
      },
    ]);
  });

  it('returns role files in deterministic path order', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'zeta.widget.ts'), 'export class ZetaWidget {}\n');
    await writeFile(join(cwd, 'src', 'alpha.dialog.ts'), 'export class AlphaDialog {}\n');

    const roles = await discoverRoleFiles(cwd);

    expect(roles.map((role) => role.path)).toEqual(['src/alpha.dialog.ts', 'src/zeta.widget.ts']);
  });
});
```

- [x] **Step 2: Run the tests and verify they fail**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence/role-files.test.ts
```

Expected:

```txt
FAIL packages/cli/tests/intelligence/role-files.test.ts
Failed to resolve import "@/intelligence/role-files.js"
```

- [x] **Step 3: Implement role-file discovery**

Create `packages/cli/src/intelligence/role-files.ts`:

```ts
import { access, readdir } from 'node:fs/promises';
import { basename, join, relative, sep } from 'node:path';

const roleNames = ['component', 'page', 'dialog', 'layout', 'widget', 'form'] as const;

export type ProjectRole = (typeof roleNames)[number];

export interface RoleFile {
  name: string;
  role: ProjectRole;
  path: string;
  templatePath: string | null;
  stylePath: string | null;
}

export interface DiscoverRoleFilesOptions {
  sourceRoot?: string;
  exists?: (filePath: string) => Promise<boolean>;
}

export async function discoverRoleFiles(
  cwd: string,
  options: DiscoverRoleFilesOptions = {},
): Promise<RoleFile[]> {
  const sourceRoot = options.sourceRoot ?? 'src';
  const srcDir = join(cwd, sourceRoot);
  const exists = options.exists ?? pathExists;
  const files = await walkFiles(srcDir);
  const roles: RoleFile[] = [];

  for (const file of files) {
    const role = readProjectRole(file);

    if (role === null) {
      continue;
    }

    const withoutExtension = file.slice(0, -'.ts'.length);
    const templateFile = `${withoutExtension}.html`;
    const styleFile = `${withoutExtension}.css`;

    roles.push({
      name: readRoleName(file, role),
      role,
      path: toProjectPath(cwd, file),
      templatePath: (await exists(templateFile)) ? toProjectPath(cwd, templateFile) : null,
      stylePath: (await exists(styleFile)) ? toProjectPath(cwd, styleFile) : null,
    });
  }

  return roles.sort((left, right) => left.path.localeCompare(right.path));
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(path)));
      continue;
    }

    if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

function readProjectRole(filePath: string): ProjectRole | null {
  const match = filePath.match(/\.([a-z]+)\.ts$/);
  const role = match?.[1];

  if (role === undefined) {
    return null;
  }

  if (!isProjectRole(role)) {
    return null;
  }

  return role;
}

function isProjectRole(role: string): role is ProjectRole {
  return roleNames.includes(role as ProjectRole);
}

function readRoleName(filePath: string, role: ProjectRole): string {
  const fileName = basename(filePath);
  const suffix = `.${role}.ts`;

  if (!fileName.endsWith(suffix)) {
    return fileName.slice(0, -'.ts'.length);
  }

  return fileName.slice(0, -suffix.length);
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toProjectPath(cwd: string, filePath: string): string {
  return relative(cwd, filePath).split(sep).join('/');
}
```

- [x] **Step 4: Run the role discovery tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence/role-files.test.ts
```

Expected:

```txt
PASS packages/cli/tests/intelligence/role-files.test.ts
```

- [x] **Step 5: Checkpoint**

Run:

```bash
pnpm --filter @vanrot/cli typecheck
```

Expected:

```txt
Done
```

---

## Stage 3 - Project Map Builder

### Task 3: Build the project map data shape

**Files:**
- Create: `packages/cli/tests/intelligence/project-map.test.ts`
- Create: `packages/cli/src/intelligence/project-map.ts`

- [x] **Step 1: Write failing project map tests**

Create `packages/cli/tests/intelligence/project-map.test.ts`:

```ts
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildProjectMap } from '@/intelligence/project-map.js';

async function tempProject(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-project-map-'));
  await mkdir(join(cwd, 'src', 'counter'), { recursive: true });
  await mkdir(join(cwd, 'src', 'i18n'), { recursive: true });
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo' }));
  return cwd;
}

describe('buildProjectMap', () => {
  it('builds a stable project map grouped by role', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.ts'), 'export class CounterComponent {}\n');
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.html'), '<button>{{ count() }}</button>\n');
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.css'), '.counter { display: block; }\n');
    await writeFile(join(cwd, 'src', 'i18n', 'en.json'), '{}\n');

    const map = await buildProjectMap(cwd, {
      now: () => new Date('2026-05-22T00:00:00.000Z'),
    });

    expect(map).toEqual({
      schemaVersion: 1,
      generatedAt: '2026-05-22T00:00:00.000Z',
      projectRoot: '.',
      sourceRoot: 'src',
      roles: {
        components: [
          {
            name: 'counter',
            role: 'component',
            path: 'src/counter/counter.component.ts',
            templatePath: 'src/counter/counter.component.html',
            stylePath: 'src/counter/counter.component.css',
          },
        ],
        pages: [],
        dialogs: [],
        layouts: [],
        widgets: [],
        forms: [],
      },
      i18n: {
        locales: ['en'],
        files: ['src/i18n/en.json'],
      },
    });
  });

  it('returns empty i18n metadata when src/i18n is missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-project-map-no-i18n-'));
    await mkdir(join(cwd, 'src'), { recursive: true });
    await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo' }));

    const map = await buildProjectMap(cwd, {
      now: () => new Date('2026-05-22T00:00:00.000Z'),
    });

    expect(map.i18n).toEqual({ locales: [], files: [] });
  });

  it('fails when package.json is missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-project-map-no-package-'));
    await mkdir(join(cwd, 'src'), { recursive: true });

    await expect(buildProjectMap(cwd)).rejects.toThrow('Missing package.json');
  });

  it('fails when src is missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-project-map-no-src-'));
    await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo' }));

    await expect(buildProjectMap(cwd)).rejects.toThrow('Missing src directory');
  });
});
```

- [x] **Step 2: Run the tests and verify they fail**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence/project-map.test.ts
```

Expected:

```txt
FAIL packages/cli/tests/intelligence/project-map.test.ts
Failed to resolve import "@/intelligence/project-map.js"
```

- [x] **Step 3: Implement project map construction**

Create `packages/cli/src/intelligence/project-map.ts`:

```ts
import { access, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { discoverRoleFiles, type RoleFile } from './role-files.js';

export interface ProjectMap {
  schemaVersion: 1;
  generatedAt: string;
  projectRoot: '.';
  sourceRoot: 'src';
  roles: ProjectMapRoles;
  i18n: ProjectMapI18n;
}

export interface ProjectMapRoles {
  components: RoleFile[];
  pages: RoleFile[];
  dialogs: RoleFile[];
  layouts: RoleFile[];
  widgets: RoleFile[];
  forms: RoleFile[];
}

export interface ProjectMapI18n {
  locales: string[];
  files: string[];
}

export interface BuildProjectMapOptions {
  now?: () => Date;
}

export async function buildProjectMap(
  cwd: string,
  options: BuildProjectMapOptions = {},
): Promise<ProjectMap> {
  await assertExists(join(cwd, 'package.json'), 'Missing package.json');
  await assertExists(join(cwd, 'src'), 'Missing src directory');

  const roles = await discoverRoleFiles(cwd);
  const i18n = await discoverI18n(cwd);
  const now = options.now ?? (() => new Date());

  return {
    schemaVersion: 1,
    generatedAt: now().toISOString(),
    projectRoot: '.',
    sourceRoot: 'src',
    roles: groupRoles(roles),
    i18n,
  };
}

function groupRoles(roles: RoleFile[]): ProjectMapRoles {
  return {
    components: roles.filter((role) => role.role === 'component'),
    pages: roles.filter((role) => role.role === 'page'),
    dialogs: roles.filter((role) => role.role === 'dialog'),
    layouts: roles.filter((role) => role.role === 'layout'),
    widgets: roles.filter((role) => role.role === 'widget'),
    forms: roles.filter((role) => role.role === 'form'),
  };
}

async function discoverI18n(cwd: string): Promise<ProjectMapI18n> {
  const i18nDir = join(cwd, 'src', 'i18n');

  if (!(await exists(i18nDir))) {
    return { locales: [], files: [] };
  }

  const entries = await readdir(i18nDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => toProjectPath(cwd, join(i18nDir, entry.name)))
    .sort((left, right) => left.localeCompare(right));
  const locales = files.map((file) => file.slice(file.lastIndexOf('/') + 1, -'.json'.length));

  return { locales, files };
}

async function assertExists(filePath: string, message: string): Promise<void> {
  if (await exists(filePath)) {
    return;
  }

  throw new Error(message);
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toProjectPath(cwd: string, filePath: string): string {
  return relative(cwd, filePath).split(sep).join('/');
}
```

- [x] **Step 4: Run project map tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence/project-map.test.ts
```

Expected:

```txt
PASS packages/cli/tests/intelligence/project-map.test.ts
```

- [x] **Step 5: Run intelligence helper tests together**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence
```

Expected:

```txt
PASS packages/cli/tests/intelligence/role-files.test.ts
PASS packages/cli/tests/intelligence/project-map.test.ts
```

---

## Stage 4 - AI Rules And `.vanrot` Writer

### Task 4: Add AI rules content and `.vanrot` file writing

**Files:**
- Create: `packages/cli/tests/intelligence/ai-rules.test.ts`
- Create: `packages/cli/src/intelligence/ai-rules.ts`
- Create: `packages/cli/src/intelligence/write-vanrot-file.ts`

- [x] **Step 1: Write failing AI rules tests**

Create `packages/cli/tests/intelligence/ai-rules.test.ts`:

```ts
import { readFile, stat } from 'node:fs/promises';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createAiRules } from '@/intelligence/ai-rules.js';
import { writeVanrotFile } from '@/intelligence/write-vanrot-file.js';

describe('createAiRules', () => {
  it('contains the required Vanrot rules', () => {
    const content = createAiRules();

    expect(content).toContain('# Vanrot AI Rules');
    expect(content).toContain('Use guard clauses instead of nested control flow.');
    expect(content).toContain('Use signals for state.');
    expect(content).toContain('Never put UI markup in TypeScript.');
    expect(content).toContain('Never put application logic in HTML.');
    expect(content).toContain('Use role-based file suffixes');
    expect(content).toContain('Use scoped CSS for component styling.');
    expect(content).toContain('Read `.vanrot/project-map.json` before making broad project changes.');
    expect(content).toContain('Do not assume an AI provider is required for Vanrot projects.');
  });
});

describe('writeVanrotFile', () => {
  it('creates .vanrot and writes a file', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-write-file-'));

    const writtenPath = await writeVanrotFile(cwd, 'ai-rules.md', '# Rules\n');

    expect(writtenPath).toBe('.vanrot/ai-rules.md');
    await expect(stat(join(cwd, '.vanrot'))).resolves.toMatchObject({ isDirectory: expect.any(Function) });
    await expect(readFile(join(cwd, '.vanrot', 'ai-rules.md'), 'utf8')).resolves.toBe('# Rules\n');
  });

  it('surfaces write failures', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-write-failure-'));

    await expect(
      writeVanrotFile(cwd, 'project-map.json', '{}\n', {
        writeTextFile: async () => {
          throw new Error('disk is read-only');
        },
      }),
    ).rejects.toThrow('disk is read-only');
  });
});
```

- [x] **Step 2: Run the tests and verify they fail**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence/ai-rules.test.ts
```

Expected:

```txt
FAIL packages/cli/tests/intelligence/ai-rules.test.ts
Failed to resolve import "@/intelligence/ai-rules.js"
```

- [x] **Step 3: Implement AI rules content**

Create `packages/cli/src/intelligence/ai-rules.ts`:

```ts
export function createAiRules(): string {
  return `# Vanrot AI Rules

Vanrot is a compiler-first UI framework built around clean file separation, tiny runtime output, strict conventions, and provider-neutral project intelligence.

## Core Rules

- Use guard clauses instead of nested control flow.
- Use signals for state.
- Never put UI markup in TypeScript.
- Never put application logic in HTML.
- Use role-based file suffixes such as \`.component.ts\`, \`.page.ts\`, \`.dialog.ts\`, \`.layout.ts\`, \`.widget.ts\`, and \`.form.ts\`.
- Use scoped CSS for component styling.
- Prefer i18n-ready text for user-facing strings.
- Prefer accessible UI primitives and keyboard-friendly behavior.
- Read \`.vanrot/project-map.json\` before making broad project changes.
- Do not assume an AI provider is required for Vanrot projects.

## Project Intelligence

\`.vanrot/project-map.json\` is the local source of truth for discovered Vanrot role files and i18n file hints.

Update the project map with:

\`\`\`bash
vr map
\`\`\`
`;
}
```

- [x] **Step 4: Implement `.vanrot` file writing**

Create `packages/cli/src/intelligence/write-vanrot-file.ts`:

```ts
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface WriteVanrotFileOptions {
  makeDirectory?: (dirPath: string) => Promise<void>;
  writeTextFile?: (filePath: string, content: string) => Promise<void>;
}

export async function writeVanrotFile(
  cwd: string,
  fileName: string,
  content: string,
  options: WriteVanrotFileOptions = {},
): Promise<string> {
  const makeDirectory = options.makeDirectory ?? createDirectory;
  const writeTextFile = options.writeTextFile ?? writeFile;
  const directoryPath = join(cwd, '.vanrot');
  const filePath = join(directoryPath, fileName);

  await makeDirectory(directoryPath);
  await writeTextFile(filePath, content);

  return `.vanrot/${fileName}`;
}

async function createDirectory(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}
```

- [x] **Step 5: Run the AI rules and writer tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence/ai-rules.test.ts
```

Expected:

```txt
PASS packages/cli/tests/intelligence/ai-rules.test.ts
```

- [x] **Step 6: Run all intelligence tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence
```

Expected:

```txt
PASS packages/cli/tests/intelligence/role-files.test.ts
PASS packages/cli/tests/intelligence/project-map.test.ts
PASS packages/cli/tests/intelligence/ai-rules.test.ts
```

---

## Stage 5 - CLI Commands

### Task 5: Wire `vr map` and `vr init-ai`

**Files:**
- Create: `packages/cli/tests/intelligence-commands.test.ts`
- Create: `packages/cli/src/commands/map.ts`
- Create: `packages/cli/src/commands/init-ai.ts`
- Modify: `packages/cli/src/cli.ts`

- [x] **Step 1: Write failing command tests**

Create `packages/cli/tests/intelligence-commands.test.ts`:

```ts
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { describe, expect, it } from 'vitest';

async function tempProject(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-intelligence-command-'));
  await mkdir(join(cwd, 'src', 'counter'), { recursive: true });
  await mkdir(join(cwd, 'src', 'i18n'), { recursive: true });
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo' }));
  await writeFile(join(cwd, 'src', 'counter', 'counter.component.ts'), 'export class CounterComponent {}\n');
  await writeFile(join(cwd, 'src', 'counter', 'counter.component.html'), '<button>{{ count() }}</button>\n');
  await writeFile(join(cwd, 'src', 'counter', 'counter.component.css'), '.counter { display: block; }\n');
  await writeFile(join(cwd, 'src', 'i18n', 'en.json'), '{}\n');
  return cwd;
}

describe('project intelligence commands', () => {
  it('writes .vanrot/project-map.json with vr map', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['map'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot Project Map');
    expect(reporter.output()).toContain('.vanrot/project-map.json');

    const map = JSON.parse(await readFile(join(cwd, '.vanrot', 'project-map.json'), 'utf8')) as {
      roles: { components: Array<{ path: string }> };
      i18n: { locales: string[] };
    };

    expect(map.roles.components).toEqual([
      expect.objectContaining({ path: 'src/counter/counter.component.ts' }),
    ]);
    expect(map.i18n.locales).toEqual(['en']);
  });

  it('writes .vanrot/ai-rules.md with vr init-ai', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['init-ai'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot AI Rules');
    expect(reporter.output()).toContain('.vanrot/ai-rules.md');
    await expect(readFile(join(cwd, '.vanrot', 'ai-rules.md'), 'utf8')).resolves.toContain(
      'Use signals for state.',
    );
  });

  it('fails vr map when package.json is missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-intelligence-invalid-'));
    await mkdir(join(cwd, 'src'), { recursive: true });
    const reporter = createMemoryReporter();

    const result = await runCli(['map'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Could not write project map');
    expect(reporter.output()).toContain('Missing package.json');
  });
});
```

- [x] **Step 2: Run the command tests and verify they fail**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence-commands.test.ts
```

Expected:

```txt
FAIL packages/cli/tests/intelligence-commands.test.ts
Unknown command: map
```

- [x] **Step 3: Implement `vr map` command**

Create `packages/cli/src/commands/map.ts`:

```ts
import { buildProjectMap } from '../intelligence/project-map.js';
import { writeVanrotFile } from '../intelligence/write-vanrot-file.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function mapCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  if (args.length > 0) {
    context.reporter.error('Unknown option for vr map', `Unexpected argument: ${args[0]}`);
    return fail();
  }

  try {
    const map = await buildProjectMap(context.cwd);
    const writtenPath = await writeVanrotFile(
      context.cwd,
      'project-map.json',
      `${JSON.stringify(map, null, 2)}\n`,
    );

    context.reporter.heading('Vanrot Project Map');
    context.reporter.success('wrote project map', writtenPath);
    return ok();
  } catch (error) {
    context.reporter.error('Could not write project map', messageFrom(error));
    return fail();
  }
}

function messageFrom(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
```

- [x] **Step 4: Implement `vr init-ai` command**

Create `packages/cli/src/commands/init-ai.ts`:

```ts
import { createAiRules } from '../intelligence/ai-rules.js';
import { writeVanrotFile } from '../intelligence/write-vanrot-file.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function initAiCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  if (args.length > 0) {
    context.reporter.error('Unknown option for vr init-ai', `Unexpected argument: ${args[0]}`);
    return fail();
  }

  try {
    const writtenPath = await writeVanrotFile(context.cwd, 'ai-rules.md', createAiRules());

    context.reporter.heading('Vanrot AI Rules');
    context.reporter.success('wrote AI rules', writtenPath);
    return ok();
  } catch (error) {
    context.reporter.error('Could not write AI rules', messageFrom(error));
    return fail();
  }
}

function messageFrom(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
```

- [x] **Step 5: Wire commands into `runCli`**

Modify `packages/cli/src/cli.ts`.

Add imports:

```ts
import { initAiCommand } from './commands/init-ai.js';
import { mapCommand } from './commands/map.js';
```

Update `rootHelp` command list:

```txt
  vr map
  vr init-ai
```

Add help entries:

```ts
  ['map', 'vr map'],
  ['init-ai', 'vr init-ai'],
```

Add dispatch blocks before `dev`:

```ts
  if (command === 'map') {
    return mapCommand(rest, context);
  }

  if (command === 'init-ai') {
    return initAiCommand(rest, context);
  }
```

- [x] **Step 6: Run command tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/intelligence-commands.test.ts
```

Expected:

```txt
PASS packages/cli/tests/intelligence-commands.test.ts
```

- [x] **Step 7: Run the CLI command suite**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/cli.test.ts tests/intelligence-commands.test.ts
```

Expected:

```txt
PASS packages/cli/tests/cli.test.ts
PASS packages/cli/tests/intelligence-commands.test.ts
```

---

## Stage 6 - CLI Help And Full CLI Verification

### Task 6: Update root and command help tests

**Files:**
- Modify: `packages/cli/tests/cli.test.ts`

- [x] **Step 1: Strengthen root help expectations**

Update `packages/cli/tests/cli.test.ts` so root help asserts the new commands:

```ts
expect(reporter.output()).toContain('vr map');
expect(reporter.output()).toContain('vr init-ai');
```

- [x] **Step 2: Add command help tests**

Add tests to `packages/cli/tests/cli.test.ts`:

```ts
  it('prints project intelligence command help', async () => {
    const mapReporter = createMemoryReporter();
    const mapResult = await runCli(['map', '--help'], {
      cwd: process.cwd(),
      reporter: mapReporter,
    });

    expect(mapResult.exitCode).toBe(0);
    expect(mapReporter.output()).toContain('vr map');

    const aiReporter = createMemoryReporter();
    const aiResult = await runCli(['init-ai', '--help'], {
      cwd: process.cwd(),
      reporter: aiReporter,
    });

    expect(aiResult.exitCode).toBe(0);
    expect(aiReporter.output()).toContain('vr init-ai');
  });
```

- [x] **Step 3: Run CLI tests**

Run:

```bash
pnpm --filter @vanrot/cli test
```

Expected:

```txt
PASS packages/cli/tests/cli.test.ts
PASS packages/cli/tests/intelligence-commands.test.ts
PASS packages/cli/tests/intelligence/role-files.test.ts
PASS packages/cli/tests/intelligence/project-map.test.ts
PASS packages/cli/tests/intelligence/ai-rules.test.ts
```

- [x] **Step 4: Run CLI typecheck**

Run:

```bash
pnpm --filter @vanrot/cli typecheck
```

Expected:

```txt
Done
```

---

## Stage 7 - Example Workflow Check

### Task 7: Verify project intelligence works in a real generated app

**Files:**
- No source file edits expected

- [x] **Step 1: Build CLI before running binary workflow checks**

Run:

```bash
pnpm --filter @vanrot/cli build
```

Expected:

```txt
Done
```

- [x] **Step 2: Create a temporary generated app**

Run:

```bash
tmpdir="$(mktemp -d)"
printf "%s" "$tmpdir" > /tmp/vanrot-phase-7-app-dir
node /Users/user/IdeaProjects/vanrot/packages/cli/dist/bin.js create "$tmpdir/phase-7-app" --workspace
```

Expected:

```txt
success created app
```

- [x] **Step 3: Run `vr map` inside the generated app**

Run:

```bash
cd "$(cat /tmp/vanrot-phase-7-app-dir)/phase-7-app" && node /Users/user/IdeaProjects/vanrot/packages/cli/dist/bin.js map
```

Expected:

```txt
Vanrot Project Map
success wrote project map
.vanrot/project-map.json
```

- [x] **Step 4: Inspect generated project map**

Run:

```bash
node -e "const map = JSON.parse(require('node:fs').readFileSync('.vanrot/project-map.json', 'utf8')); console.log(map.schemaVersion, map.roles.components.length);"
```

Expected:

```txt
1 1
```

- [x] **Step 5: Run `vr init-ai` inside the generated app**

Run:

```bash
node /Users/user/IdeaProjects/vanrot/packages/cli/dist/bin.js init-ai
```

Expected:

```txt
Vanrot AI Rules
success wrote AI rules
.vanrot/ai-rules.md
```

- [x] **Step 6: Return to the repository**

Run:

```bash
cd /Users/user/IdeaProjects/vanrot
```

Expected: shell prompt is back at the Vanrot repo.

- [x] **Step 7: Checkpoint**

Run:

```bash
git status --short --branch
```

Expected: no `.vanrot/` files from the temporary generated app appear in the repository status.

---

## Stage 8 - Phase Completion Docs

### Task 8: Update roadmap docs after verification

**Files:**
- Modify: `docs/brainstorm.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/plans/Phase-07.md`

- [x] **Step 1: Update feature maturity**

In `docs/superpowers/feature-maturity.md`, change these rows after command verification passes:

```txt
Project map `.vanrot/project-map.json`  Planned -> Demo-Capable
AI rules `.vanrot/ai-rules.md`          Planned -> Demo-Capable
```

Keep these rows `Deferred`:

```txt
CLI strict `vr doctor --strict` mode
CLI i18n diagnostics
CLI accessibility diagnostics
Project route and dependency graphing
Compiler-aware project intelligence
Optional AI commands
Vanrot MCP server *
Skill.sh package *
AI framework knowledge manifest
```

- [x] **Step 2: Tick Phase 7 in brainstorm**

In `docs/brainstorm.md`, update the Phase 7 checklist row:

```md
| [x] | Phase 7 - Project intelligence | `vr map`, `.vanrot/project-map.json`, and `.vanrot/ai-rules.md`; strict diagnostics, i18n checks, and accessibility checks stay deferred in the maturity ledger. | The project can explain its structure to humans and AI without requiring an AI provider. |
```

Add a short note below the table:

```md
Phase 7 completed the project intelligence foundation. Strict diagnostics, i18n checks, accessibility checks, route/dependency graphing, and compiler-aware intelligence remain tracked as deferred production work in `docs/superpowers/feature-maturity.md`.
```

- [x] **Step 3: Update the presentation roadmap**

In `docs/vanrot-presentation.html`, update the roadmap slide:

```html
<div class="phase-card done">
  <div class="phase-num">Phase 7</div>
  <div class="phase-title">Project Intelligence</div>
  <div class="phase-status">✅</div>
</div>
<div class="phase-card active-phase">
  <div class="phase-num">Phase 8</div>
  <div class="phase-title">Router MVP</div>
  <div class="phase-status" style="color:var(--cyan);">⚡</div>
</div>
```

Update the active label:

```html
<span style="color:var(--cyan);">⚡ Active: Phase 8 (Router MVP)</span>
```

- [x] **Step 4: Mark this plan complete**

After all implementation and verification tasks pass, change every checkbox in `docs/superpowers/plans/Phase-07.md` from:

```md
- [x]
```

to:

```md
- [x]
```

Do not mark the phase complete before verification passes.

- [x] **Step 5: Run phase docs guardrail**

Run:

```bash
pnpm verify:phase-docs
```

Expected:

```txt
Phase documentation verification passed.
```

---

## Stage 9 - Full Verification

### Task 9: Run full verification and report status

**Files:**
- No new source edits expected unless verification reveals a real issue

- [x] **Step 1: Run CLI tests**

Run:

```bash
pnpm --filter @vanrot/cli test
```

Expected:

```txt
PASS packages/cli
```

- [x] **Step 2: Run CLI typecheck**

Run:

```bash
pnpm --filter @vanrot/cli typecheck
```

Expected:

```txt
Done
```

- [x] **Step 3: Run full repo verification**

Run:

```bash
pnpm verify
```

Expected:

```txt
Phase documentation verification passed.
```

and all typecheck, test, build, and runtime size checks pass.

- [x] **Step 4: Report final workspace status**

Run:

```bash
git status --short --branch
```

Expected: changed files are visible and unstaged for user inspection. No branch, worktree, commit, or push was created.

Final report should include:

```txt
changed files
verification commands and results
git status --short --branch
unrelated local changes left untouched
```

---

## Self-Review

Spec coverage:

```txt
`vr map` command                                              Task 5, Task 7
`.vanrot/project-map.json` shape                              Task 2, Task 3, Task 5
`vr init-ai` command                                          Task 4, Task 5, Task 7
`.vanrot/ai-rules.md` content                                 Task 4, Task 5
provider-neutral, no AI provider setup                        Task 4, Task 5
role files under `src/`                                       Task 2, Task 3
i18n JSON hints under `src/i18n/`                              Task 3
deterministic ordering and forward-slash paths                 Task 2, Task 3
clear errors for missing package/src/write failure             Task 3, Task 4, Task 5
root and command help                                         Task 5, Task 6
deferred production diagnostics and graphing in maturity file  Task 8
no commits, branches, worktrees, staging, or pushes            Prerequisites, Task 9
```

Placeholder scan: no unresolved placeholder steps are allowed in this plan.

Type consistency:

```txt
RoleFile
ProjectRole
ProjectMap
ProjectMapRoles
ProjectMapI18n
buildProjectMap()
discoverRoleFiles()
createAiRules()
writeVanrotFile()
mapCommand()
initAiCommand()
```

These names are introduced before use and stay consistent across tasks.
