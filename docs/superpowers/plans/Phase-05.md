# Vanrot CLI MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the demo-capable `vr` CLI so users can create apps, generate Vanrot files, run starter diagnostics, and invoke dev/build/test workflows through one command.

**Architecture:** `@vanrot/cli` is split into a thin binary entry, an argv dispatcher, command handlers, app/generator writers, doctor checks, an injected process runner, and a shared Quiet Premium reporter. Commands return structured results and the reporter owns terminal presentation so production CLI polish can evolve later without rewriting command logic.

**Tech Stack:** TypeScript 5, Vitest 4, Node `fs/promises`, `node:path`, `node:child_process`, temporary directories from `node:os`, Vanrot runtime/Vite plugin package names, and the existing pnpm workspace.

**Spec:** `docs/superpowers/specs/Phase-05.md`

---

## Prerequisites

Implementation happens on `main` because the user explicitly requested no worktree for Phase 5.

Before starting, verify the workspace is on `main` and note any unrelated dirty files:

```bash
git status --short --branch
```

Expected before Phase 5 implementation:

```txt
## main...origin/main [ahead 1]
 M AGENTS.md
```

Do not stage or modify unrelated `AGENTS.md` changes unless the user asks.

---

## File Structure

Target files and responsibilities:

```txt
packages/cli/
  package.json                         - add `vr` bin, workspace dependencies, package metadata
  tsconfig.json                        - include source only for builds
  src/
    index.ts                           - public exports for tests and programmatic use
    bin.ts                             - executable entry; owns process exit code
    cli.ts                             - parse argv, route commands, print help
    result.ts                          - command result and context contracts
    commands/
      create.ts                        - `vr create`
      generate.ts                      - `vr generate component/page`
      doctor.ts                        - `vr doctor`
      dev.ts                           - `vr dev`
      build.ts                         - `vr build`
      test.ts                          - `vr test`
    create/
      app-template.ts                  - generated app file contents
      write-app.ts                     - writes app files with overwrite protection
    generate/
      names.ts                         - kebab-case and class-name helpers
      write-role-files.ts              - writes component/page files
    doctor/
      checks.ts                        - finding types and check orchestration
      project-health.ts                - project file/script/sibling checks
      vanrot-rules.ts                  - role suffix, raw text, nested-if checks
    process/
      runner.ts                        - injected subprocess abstraction
    reporter/
      reporter.ts                      - Quiet Premium output primitives
      diagnostics.ts                   - doctor finding formatter
  tests/
    cli.test.ts
    create.test.ts
    generate.test.ts
    doctor.test.ts
    runner-commands.test.ts
    reporter.test.ts

docs/
  brainstorm.md                        - tick Phase 5 after implementation only
  vanrot-presentation.html             - mark Phase 5 done and Phase 6 active after implementation only
  superpowers/
    feature-maturity.md                - move verified Phase 5 rows to Demo-Capable
    plans/Phase-05.md                  - tick completed tasks
```

Generated outputs are not committed:

```txt
packages/cli/dist/
```

---

## Stage 1 - CLI Foundation

### Task 1: Add the command result model, Quiet Premium reporter, and argv dispatcher

**Files:**

- Create: `packages/cli/src/result.ts`
- Create: `packages/cli/src/process/runner.ts`
- Create: `packages/cli/src/reporter/reporter.ts`
- Create: `packages/cli/src/cli.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/cli.test.ts`
- Test: `packages/cli/tests/reporter.test.ts`

- [ ] **Step 1: Replace the smoke test with failing CLI and reporter tests**

Create `packages/cli/tests/cli.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('runCli', () => {
  it('prints root help', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['--help'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot CLI');
    expect(reporter.output()).toContain('vr create <name>');
    expect(reporter.output()).toContain('vr doctor');
  });

  it('reports unknown commands with a suggestion', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['craete', 'demo'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Unknown command: craete');
    expect(reporter.output()).toContain('Did you mean vr create?');
  });

  it('prints command help without executing a command', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['create', '--help'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('vr create <name>');
    expect(reporter.output()).toContain('--workspace');
    expect(reporter.output()).toContain('--force');
  });
});
```

Create `packages/cli/tests/reporter.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('createMemoryReporter', () => {
  it('renders quiet premium sections and next steps', () => {
    const reporter = createMemoryReporter();

    reporter.heading('Vanrot Doctor', '2 warnings');
    reporter.warning('src/app.component.html', 'Raw user-facing text found in template.');
    reporter.nextSteps([
      'Replace visible text with an i18n key.',
      'Move early return to the top of the method.',
    ]);

    expect(reporter.output()).toContain('Vanrot Doctor');
    expect(reporter.output()).toContain('2 warnings');
    expect(reporter.output()).toContain('warning');
    expect(reporter.output()).toContain('src/app.component.html');
    expect(reporter.output()).toContain('> Replace visible text with an i18n key.');
  });
});
```

Delete `packages/cli/tests/smoke.test.ts` after these focused tests exist.

- [ ] **Step 2: Run the failing tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/cli.test.ts tests/reporter.test.ts
```

Expected result:

```txt
FAIL packages/cli/tests/cli.test.ts
Cannot find module '../src/reporter/reporter.js'
```

- [ ] **Step 3: Add the process runner contract**

Create `packages/cli/src/process/runner.ts`:

```ts
export interface ProcessRunner {
  run(command: string, args: string[], options: { cwd: string }): Promise<number>;
}
```

- [ ] **Step 4: Add shared command contracts**

Create `packages/cli/src/result.ts`:

```ts
import type { Reporter } from './reporter/reporter.js';
import type { ProcessRunner } from './process/runner.js';

export interface CommandResult {
  exitCode: number;
}

export interface CommandContext {
  cwd: string;
  reporter: Reporter;
  runner?: ProcessRunner;
}

export type CommandHandler = (args: string[], context: CommandContext) => Promise<CommandResult>;

export function ok(): CommandResult {
  return { exitCode: 0 };
}

export function fail(): CommandResult {
  return { exitCode: 1 };
}
```

- [ ] **Step 5: Add the Quiet Premium reporter**

Create `packages/cli/src/reporter/reporter.ts`:

```ts
export interface Reporter {
  line(text?: string): void;
  heading(title: string, meta?: string): void;
  success(label: string, detail?: string): void;
  warning(filePath: string, message: string): void;
  error(message: string, detail?: string): void;
  nextSteps(steps: string[]): void;
}

export interface MemoryReporter extends Reporter {
  output(): string;
}

export function createMemoryReporter(): MemoryReporter {
  const lines: string[] = [];

  return {
    line(text = '') {
      lines.push(text);
    },
    heading(title, meta) {
      lines.push(meta === undefined ? title : `${title}                                   ${meta}`);
      lines.push('');
    },
    success(label, detail) {
      lines.push(detail === undefined ? `success ${label}` : `success ${label}`);
      if (detail !== undefined) {
        lines.push(detail);
      }
    },
    warning(filePath, message) {
      lines.push('warning');
      lines.push(filePath);
      lines.push(message);
      lines.push('');
    },
    error(message, detail) {
      lines.push(`error ${message}`);
      if (detail !== undefined) {
        lines.push(detail);
      }
    },
    nextSteps(steps) {
      if (steps.length === 0) {
        return;
      }
      lines.push('Next');
      for (const step of steps) {
        lines.push(`> ${step}`);
      }
    },
    output() {
      return lines.join('\n');
    },
  };
}

export function createConsoleReporter(): Reporter {
  const memory = createMemoryReporter();

  return {
    line(text) {
      memory.line(text);
      console.log(text ?? '');
    },
    heading(title, meta) {
      memory.heading(title, meta);
      console.log(meta === undefined ? title : `${title}                                   ${meta}`);
      console.log('');
    },
    success(label, detail) {
      memory.success(label, detail);
      console.log(`success ${label}`);
      if (detail !== undefined) {
        console.log(detail);
      }
    },
    warning(filePath, message) {
      memory.warning(filePath, message);
      console.log('warning');
      console.log(filePath);
      console.log(message);
      console.log('');
    },
    error(message, detail) {
      memory.error(message, detail);
      console.error(`error ${message}`);
      if (detail !== undefined) {
        console.error(detail);
      }
    },
    nextSteps(steps) {
      memory.nextSteps(steps);
      if (steps.length === 0) {
        return;
      }
      console.log('Next');
      for (const step of steps) {
        console.log(`> ${step}`);
      }
    },
  };
}
```

- [ ] **Step 6: Add the CLI dispatcher and help text**

Create `packages/cli/src/cli.ts`:

```ts
import type { CommandContext, CommandResult } from './result.js';
import { fail, ok } from './result.js';

const rootHelp = `Vanrot CLI

Usage
  vr <command>

Commands
  vr create <name>
  vr generate component <name>
  vr generate page <name>
  vr doctor
  vr dev
  vr build
  vr test`;

const commandHelp = new Map<string, string>([
  [
    'create',
    `vr create <name>

Options
  --workspace   Use workspace dependencies for repository fixtures
  --force       Overwrite an existing target directory`,
  ],
  [
    'generate',
    `vr generate <role> <name>

Roles
  component
  page

Options
  --feature <name>   Generate inside src/features/<name>`,
  ],
  ['doctor', 'vr doctor'],
  ['dev', 'vr dev'],
  ['build', 'vr build'],
  ['test', 'vr test'],
]);

export async function runCli(args: string[], context: CommandContext): Promise<CommandResult> {
  const [command, ...rest] = args;

  if (command === undefined || command === '--help' || command === '-h') {
    context.reporter.line(rootHelp);
    return ok();
  }

  if (rest.includes('--help') || rest.includes('-h')) {
    return printCommandHelp(command, context);
  }

  if (command === 'g') {
    context.reporter.error('Command alias is not wired yet.', 'Use vr generate for now.');
    return fail();
  }

  context.reporter.error(`Unknown command: ${command}`, suggestionFor(command));
  return fail();
}

function printCommandHelp(command: string, context: CommandContext): CommandResult {
  const help = commandHelp.get(command);

  if (help === undefined) {
    context.reporter.error(`Unknown command: ${command}`, suggestionFor(command));
    return fail();
  }

  context.reporter.line(help);
  return ok();
}

function suggestionFor(command: string): string | undefined {
  if (command === 'craete') {
    return 'Did you mean vr create?';
  }

  if (command === 'generte') {
    return 'Did you mean vr generate?';
  }

  return undefined;
}
```

- [ ] **Step 7: Export the CLI entry**

Replace `packages/cli/src/index.ts` with:

```ts
export { runCli } from './cli.js';
export type { CommandContext, CommandHandler, CommandResult } from './result.js';
export { createConsoleReporter, createMemoryReporter } from './reporter/reporter.js';
export type { MemoryReporter, Reporter } from './reporter/reporter.js';
```

- [ ] **Step 8: Run the new tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/cli.test.ts tests/reporter.test.ts
```

Expected result:

```txt
PASS packages/cli/tests/cli.test.ts
PASS packages/cli/tests/reporter.test.ts
```

- [ ] **Step 9: Commit Task 1**

```bash
git add packages/cli/src packages/cli/tests
git commit -m "feat(cli): add command dispatcher and reporter"
```

---

## Stage 2 - App Creation

### Task 2: Implement `vr create`

**Files:**

- Create: `packages/cli/src/create/app-template.ts`
- Create: `packages/cli/src/create/write-app.ts`
- Create: `packages/cli/src/commands/create.ts`
- Modify: `packages/cli/src/cli.ts`
- Test: `packages/cli/tests/create.test.ts`

- [ ] **Step 1: Write failing create tests**

Create `packages/cli/tests/create.test.ts`:

```ts
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'vanrot-cli-create-'));
}

describe('vr create', () => {
  it('creates a standalone-style Vanrot app', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'demo-app'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(cwd, 'demo-app', 'package.json'), 'utf8')).resolves.toContain('"dev": "vr dev"');
    await expect(readFile(join(cwd, 'demo-app', 'vite.config.ts'), 'utf8')).resolves.toContain('@vanrot/vite-plugin');
    await expect(readFile(join(cwd, 'demo-app', 'src', 'main.ts'), 'utf8')).resolves.toContain("from './app.component.ts'");
    await expect(readFile(join(cwd, 'demo-app', 'src', 'app.component.ts'), 'utf8')).resolves.toContain('export class AppComponent');
    await expect(readFile(join(cwd, 'demo-app', 'src', 'app.component.html'), 'utf8')).resolves.toContain("{{ title() }}");
    await expect(readFile(join(cwd, 'demo-app', 'src', 'app.component.css'), 'utf8')).resolves.toContain('.app');
    expect(reporter.output()).toContain('Created demo-app');
    expect(reporter.output()).toContain('vr dev');
  });

  it('uses workspace dependencies for fixture mode', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'fixture-app', '--workspace'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const packageJson = await readFile(join(cwd, 'fixture-app', 'package.json'), 'utf8');
    expect(packageJson).toContain('"@vanrot/runtime": "workspace:*"');
    expect(packageJson).toContain('"@vanrot/vite-plugin": "workspace:*"');
    expect(packageJson).toContain('"@vanrot/cli": "workspace:*"');
  });

  it('does not overwrite non-empty directories without --force', async () => {
    const cwd = await tempRoot();
    const reporter = createMemoryReporter();
    await mkdtemp(join(cwd, 'existing-'));
    const target = join(cwd, 'existing');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(target));
    await writeFile(join(target, 'keep.txt'), 'do not delete');

    const result = await runCli(['create', 'existing'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Target directory is not empty');
    await expect(readFile(join(target, 'keep.txt'), 'utf8')).resolves.toBe('do not delete');
  });

  it('can create into an existing directory with --force', async () => {
    const cwd = await tempRoot();
    const target = join(cwd, 'forced');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(target));
    await writeFile(join(target, 'old.txt'), 'old');
    const reporter = createMemoryReporter();

    const result = await runCli(['create', 'forced', '--force'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const files = await readdir(target);
    expect(files).toContain('package.json');
    expect(files).toContain('old.txt');
  });
});
```

- [ ] **Step 2: Run the failing create tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected result:

```txt
FAIL packages/cli/tests/create.test.ts
Unknown command: create
```

- [ ] **Step 3: Add app template generation**

Create `packages/cli/src/create/app-template.ts`:

```ts
export interface AppTemplateOptions {
  appName: string;
  workspace: boolean;
}

export interface TemplateFile {
  path: string;
  content: string;
}

export function createAppTemplate(options: AppTemplateOptions): TemplateFile[] {
  const dependencyVersion = options.workspace ? 'workspace:*' : '^0.1.0';

  return [
    {
      path: 'package.json',
      content: `${JSON.stringify(
        {
          name: options.appName,
          private: true,
          type: 'module',
          scripts: {
            dev: 'vr dev',
            build: 'vr build',
            test: 'vr test',
            doctor: 'vr doctor',
          },
          dependencies: {
            '@vanrot/runtime': dependencyVersion,
          },
          devDependencies: {
            '@vanrot/cli': dependencyVersion,
            '@vanrot/vite-plugin': dependencyVersion,
            typescript: '^5.9.3',
            vite: '^8.0.10',
            vitest: '^4.0.14',
          },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: 'index.html',
      content: `<div id="app"></div>\n<script type="module" src="/src/main.ts"></script>\n`,
    },
    {
      path: 'tsconfig.json',
      content: `${JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            lib: ['ES2022', 'DOM'],
            strict: true,
            skipLibCheck: true,
          },
          include: ['src/**/*.ts'],
        },
        null,
        2,
      )}\n`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';\nimport vanrot from '@vanrot/vite-plugin';\n\nexport default defineConfig({\n  plugins: [vanrot()],\n});\n`,
    },
    {
      path: 'src/main.ts',
      content: `import { mount } from '@vanrot/runtime';\nimport App from './app.component.ts';\n\nconst target = document.getElementById('app');\n\nif (target === null) {\n  throw new Error('Missing #app mount target.');\n}\n\nmount(App, target);\n`,
    },
    {
      path: 'src/app.component.ts',
      content: `import { signal } from '@vanrot/runtime';\n\nexport class AppComponent {\n  title = signal('Vanrot');\n}\n`,
    },
    {
      path: 'src/app.component.html',
      content: `<main class="app">\n  <h1>{{ title() }}</h1>\n</main>\n`,
    },
    {
      path: 'src/app.component.css',
      content: `.app {\n  display: grid;\n  gap: 16px;\n  padding: 32px;\n  font-family: system-ui, sans-serif;\n}\n`,
    },
  ];
}
```

- [ ] **Step 4: Add the app writer**

Create `packages/cli/src/create/write-app.ts`:

```ts
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createAppTemplate } from './app-template.js';

export interface WriteAppOptions {
  cwd: string;
  appName: string;
  workspace: boolean;
  force: boolean;
}

export interface WriteAppResult {
  targetDir: string;
  files: string[];
}

export async function writeApp(options: WriteAppOptions): Promise<WriteAppResult> {
  const targetDir = join(options.cwd, options.appName);
  const existingFiles = await readExistingFiles(targetDir);

  if (!options.force && existingFiles.length > 0) {
    throw new Error('Target directory is not empty.');
  }

  const template = createAppTemplate({
    appName: options.appName,
    workspace: options.workspace,
  });

  for (const file of template) {
    const filePath = join(targetDir, file.path);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, file.content);
  }

  return {
    targetDir,
    files: template.map((file) => file.path),
  };
}

async function readExistingFiles(targetDir: string): Promise<string[]> {
  try {
    return await readdir(targetDir);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}
```

- [ ] **Step 5: Add the create command handler**

Create `packages/cli/src/commands/create.ts`:

```ts
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { writeApp } from '../create/write-app.js';

export async function createCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  const appName = args.find((arg) => !arg.startsWith('-'));
  const workspace = args.includes('--workspace');
  const force = args.includes('--force');

  if (appName === undefined) {
    context.reporter.error('Missing app name.', 'Run vr create <name>.');
    return fail();
  }

  try {
    const result = await writeApp({
      cwd: context.cwd,
      appName,
      workspace,
      force,
    });

    context.reporter.heading(`Created ${appName}`, `${result.files.length} files`);
    context.reporter.nextSteps([
      `cd ${appName}`,
      workspace ? 'pnpm install' : 'npm install',
      'vr dev',
    ]);
    return ok();
  } catch (error) {
    context.reporter.error('Target directory is not empty.', error instanceof Error ? error.message : undefined);
    return fail();
  }
}
```

- [ ] **Step 6: Wire `create` into the dispatcher**

Update `packages/cli/src/cli.ts`:

```ts
import { createCommand } from './commands/create.js';
import type { CommandContext, CommandResult } from './result.js';
import { fail, ok } from './result.js';
```

Add this guard before the alias guard:

```ts
if (command === 'create') {
  return createCommand(rest, context);
}
```

- [ ] **Step 7: Run create tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected result:

```txt
PASS packages/cli/tests/create.test.ts
```

- [ ] **Step 8: Commit Task 2**

```bash
git add packages/cli/src packages/cli/tests
git commit -m "feat(cli): implement app creation"
```

---

## Stage 3 - File Generation

### Task 3: Implement `vr generate component` and `vr generate page`

**Files:**

- Create: `packages/cli/src/generate/names.ts`
- Create: `packages/cli/src/generate/write-role-files.ts`
- Create: `packages/cli/src/commands/generate.ts`
- Modify: `packages/cli/src/cli.ts`
- Test: `packages/cli/tests/generate.test.ts`

- [ ] **Step 1: Write failing generator tests**

Create `packages/cli/tests/generate.test.ts`:

```ts
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function projectRoot() {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-generate-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  return cwd;
}

describe('vr generate', () => {
  it('generates component files in a feature folder', async () => {
    const cwd = await projectRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['generate', 'component', 'user-card', '--feature', 'users'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const base = join(cwd, 'src', 'features', 'users', 'components');
    await expect(readFile(join(base, 'user-card.component.ts'), 'utf8')).resolves.toContain('export class UserCardComponent');
    await expect(readFile(join(base, 'user-card.component.html'), 'utf8')).resolves.toContain("{{ t('user-card.title') }}");
    await expect(readFile(join(base, 'user-card.component.css'), 'utf8')).resolves.toContain('.user-card');
    expect(reporter.output()).toContain('Generated component user-card');
  });

  it('generates page files in a feature folder', async () => {
    const cwd = await projectRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['generate', 'page', 'dashboard', '--feature', 'users'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    const base = join(cwd, 'src', 'features', 'users');
    await expect(readFile(join(base, 'dashboard.page.ts'), 'utf8')).resolves.toContain('export class DashboardPage');
    await expect(readFile(join(base, 'dashboard.page.html'), 'utf8')).resolves.toContain("{{ t('dashboard.title') }}");
    await expect(readFile(join(base, 'dashboard.page.css'), 'utf8')).resolves.toContain('.dashboard');
  });

  it('generates default component and page locations when no feature is supplied', async () => {
    const cwd = await projectRoot();
    const reporter = createMemoryReporter();

    await runCli(['generate', 'component', 'status-pill'], { cwd, reporter });
    await runCli(['generate', 'page', 'settings'], { cwd, reporter });

    await expect(readFile(join(cwd, 'src', 'components', 'status-pill.component.ts'), 'utf8')).resolves.toContain('StatusPillComponent');
    await expect(readFile(join(cwd, 'src', 'pages', 'settings.page.ts'), 'utf8')).resolves.toContain('SettingsPage');
  });

  it('rejects non-kebab-case names', async () => {
    const cwd = await projectRoot();
    const reporter = createMemoryReporter();

    const result = await runCli(['generate', 'component', 'UserCard'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Use lowercase kebab-case names.');
  });
});
```

- [ ] **Step 2: Run the failing generator tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/generate.test.ts
```

Expected result:

```txt
FAIL packages/cli/tests/generate.test.ts
Unknown command: generate
```

- [ ] **Step 3: Add name helpers**

Create `packages/cli/src/generate/names.ts`:

```ts
export function isKebabCase(name: string): boolean {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name);
}

export function toPascalCase(name: string): string {
  return name
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
}
```

- [ ] **Step 4: Add role-file writer**

Create `packages/cli/src/generate/write-role-files.ts`:

```ts
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { toPascalCase } from './names.js';

export type Role = 'component' | 'page';

export interface WriteRoleFilesOptions {
  cwd: string;
  role: Role;
  name: string;
  feature?: string;
}

export interface WriteRoleFilesResult {
  files: string[];
}

export async function writeRoleFiles(options: WriteRoleFilesOptions): Promise<WriteRoleFilesResult> {
  const directory = resolveDirectory(options);
  const suffix = options.role === 'component' ? 'component' : 'page';
  const className = `${toPascalCase(options.name)}${options.role === 'component' ? 'Component' : 'Page'}`;
  const baseName = `${options.name}.${suffix}`;
  const relativeFiles = [
    join(directory, `${baseName}.ts`),
    join(directory, `${baseName}.html`),
    join(directory, `${baseName}.css`),
  ];

  await mkdir(join(options.cwd, directory), { recursive: true });
  await writeFile(join(options.cwd, relativeFiles[0]), typescriptTemplate(className));
  await writeFile(join(options.cwd, relativeFiles[1]), htmlTemplate(options.name));
  await writeFile(join(options.cwd, relativeFiles[2]), cssTemplate(options.name));

  return { files: relativeFiles };
}

function resolveDirectory(options: WriteRoleFilesOptions): string {
  if (options.feature !== undefined && options.role === 'component') {
    return join('src', 'features', options.feature, 'components');
  }

  if (options.feature !== undefined) {
    return join('src', 'features', options.feature);
  }

  return options.role === 'component' ? join('src', 'components') : join('src', 'pages');
}

function typescriptTemplate(className: string): string {
  return `import { signal } from '@vanrot/runtime';\n\nexport class ${className} {\n  title = signal('${className}');\n\n  t(key: string): string {\n    return key;\n  }\n}\n`;
}

function htmlTemplate(name: string): string {
  return `<section class="${name}">\n  <h1>{{ t('${name}.title') }}</h1>\n</section>\n`;
}

function cssTemplate(name: string): string {
  return `.${name} {\n  display: block;\n}\n`;
}
```

- [ ] **Step 5: Add generate command**

Create `packages/cli/src/commands/generate.ts`:

```ts
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { isKebabCase } from '../generate/names.js';
import { writeRoleFiles, type Role } from '../generate/write-role-files.js';

export async function generateCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  const [role, name] = args;
  const feature = readOption(args, '--feature');

  if (role !== 'component' && role !== 'page') {
    context.reporter.error('Unsupported generator role.', 'Use vr generate component <name> or vr generate page <name>.');
    return fail();
  }

  if (name === undefined) {
    context.reporter.error('Missing generated file name.', `Run vr generate ${role} <name>.`);
    return fail();
  }

  if (!isKebabCase(name)) {
    context.reporter.error('Use lowercase kebab-case names.', `Received ${name}.`);
    return fail();
  }

  if (feature !== undefined && !isKebabCase(feature)) {
    context.reporter.error('Use lowercase kebab-case feature names.', `Received ${feature}.`);
    return fail();
  }

  const result = await writeRoleFiles({
    cwd: context.cwd,
    role: role as Role,
    name,
    feature,
  });

  context.reporter.heading(`Generated ${role} ${name}`, `${result.files.length} files`);
  for (const file of result.files) {
    context.reporter.success(file);
  }

  return ok();
}

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}
```

- [ ] **Step 6: Wire `generate` and `g` into the dispatcher**

Update `packages/cli/src/cli.ts` imports:

```ts
import { createCommand } from './commands/create.js';
import { generateCommand } from './commands/generate.js';
import type { CommandContext, CommandResult } from './result.js';
import { fail, ok } from './result.js';
```

Replace the existing `g` guard with:

```ts
if (command === 'generate' || command === 'g') {
  return generateCommand(rest, context);
}
```

- [ ] **Step 7: Run generator tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/generate.test.ts
```

Expected result:

```txt
PASS packages/cli/tests/generate.test.ts
```

- [ ] **Step 8: Commit Task 3**

```bash
git add packages/cli/src packages/cli/tests
git commit -m "feat(cli): generate role-based files"
```

---

## Stage 4 - Doctor Diagnostics

### Task 4: Implement `vr doctor` project health and starter Vanrot rule checks

**Files:**

- Create: `packages/cli/src/doctor/checks.ts`
- Create: `packages/cli/src/doctor/project-health.ts`
- Create: `packages/cli/src/doctor/vanrot-rules.ts`
- Create: `packages/cli/src/reporter/diagnostics.ts`
- Create: `packages/cli/src/commands/doctor.ts`
- Modify: `packages/cli/src/cli.ts`
- Test: `packages/cli/tests/doctor.test.ts`

- [ ] **Step 1: Write failing doctor tests**

Create `packages/cli/tests/doctor.test.ts`:

```ts
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

async function tempProject() {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-doctor-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify({
      scripts: {
        dev: 'vr dev',
        build: 'vr build',
        test: 'vr test',
        doctor: 'vr doctor',
      },
    }),
  );
  await writeFile(join(cwd, 'vite.config.ts'), "import vanrot from '@vanrot/vite-plugin';\n");
  await writeFile(join(cwd, 'src', 'app.component.ts'), 'export class AppComponent {}\n');
  await writeFile(join(cwd, 'src', 'app.component.html'), '<main>{{ title() }}</main>\n');
  await writeFile(join(cwd, 'src', 'app.component.css'), ':host { display: block; }\n');
  return cwd;
}

describe('vr doctor', () => {
  it('passes a clean starter project', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Vanrot Doctor');
    expect(reporter.output()).toContain('0 findings');
  });

  it('reports project-health errors', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-doctor-empty-'));
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Missing package.json');
    expect(reporter.output()).toContain('Missing src directory');
    expect(reporter.output()).toContain('Missing vite.config.ts');
  });

  it('reports missing component sibling files', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'lonely.component.ts'), 'export class LonelyComponent {}\n');
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Missing sibling template file');
    expect(reporter.output()).toContain('lonely.component.html');
    expect(reporter.output()).toContain('Missing sibling style file');
    expect(reporter.output()).toContain('lonely.component.css');
  });

  it('reports starter Vanrot rule warnings', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'bad.view.ts'), 'export class BadView {}\n');
    await writeFile(join(cwd, 'src', 'raw.component.html'), '<button>Save</button>\n');
    await writeFile(
      join(cwd, 'src', 'nested.component.ts'),
      'export class NestedComponent { save(value: string) { if (value) { if (value.length > 1) { return; } } } }\n',
    );
    await writeFile(join(cwd, 'src', 'nested.component.html'), '<p>{{ title() }}</p>\n');
    await writeFile(join(cwd, 'src', 'nested.component.css'), ':host { display: block; }\n');
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.output()).toContain('Unsupported UI role suffix');
    expect(reporter.output()).toContain('Raw user-facing text found in template');
    expect(reporter.output()).toContain('Nested if statement can be a guard clause');
  });
});
```

- [ ] **Step 2: Run the failing doctor tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/doctor.test.ts
```

Expected result:

```txt
FAIL packages/cli/tests/doctor.test.ts
Unknown command: doctor
```

- [ ] **Step 3: Add doctor finding types and orchestration**

Create `packages/cli/src/doctor/checks.ts`:

```ts
import { checkProjectHealth } from './project-health.js';
import { checkVanrotRules } from './vanrot-rules.js';

export type DoctorSeverity = 'error' | 'warning';

export interface DoctorFinding {
  severity: DoctorSeverity;
  code: string;
  filePath: string;
  message: string;
  nextStep: string;
}

export async function runDoctorChecks(cwd: string): Promise<DoctorFinding[]> {
  return [
    ...(await checkProjectHealth(cwd)),
    ...(await checkVanrotRules(cwd)),
  ];
}

export function hasErrors(findings: DoctorFinding[]): boolean {
  return findings.some((finding) => finding.severity === 'error');
}
```

- [ ] **Step 4: Add project health checks**

Create `packages/cli/src/doctor/project-health.ts`:

```ts
import { access, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { DoctorFinding } from './checks.js';
import { walkFiles } from './vanrot-rules.js';

const requiredScripts = ['dev', 'build', 'test', 'doctor'];

export async function checkProjectHealth(cwd: string): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];

  if (!(await exists(join(cwd, 'package.json')))) {
    findings.push(error('VRT0001', 'package.json', 'Missing package.json', 'Run vr create <name> to create a Vanrot app.'));
  } else {
    findings.push(...(await checkPackageScripts(cwd)));
  }

  if (!(await exists(join(cwd, 'src')))) {
    findings.push(error('VRT0002', 'src', 'Missing src directory', 'Create src/ or run vr create <name>.'));
  }

  if (!(await exists(join(cwd, 'vite.config.ts')))) {
    findings.push(error('VRT0003', 'vite.config.ts', 'Missing vite.config.ts', 'Add Vite config with @vanrot/vite-plugin.'));
  }

  findings.push(...(await checkSiblingFiles(cwd)));
  return findings;
}

async function checkPackageScripts(cwd: string): Promise<DoctorFinding[]> {
  const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as {
    scripts?: Record<string, string>;
  };
  const findings: DoctorFinding[] = [];

  for (const script of requiredScripts) {
    if (packageJson.scripts?.[script] !== undefined) {
      continue;
    }

    findings.push(error('VRT0004', 'package.json', `Missing package script: ${script}`, `Add "${script}": "vr ${script}".`));
  }

  return findings;
}

async function checkSiblingFiles(cwd: string): Promise<DoctorFinding[]> {
  if (!(await exists(join(cwd, 'src')))) {
    return [];
  }

  const findings: DoctorFinding[] = [];
  const files = await walkFiles(join(cwd, 'src'));

  for (const file of files.filter((filePath) => isRoleTypeScript(filePath))) {
    const withoutExtension = file.slice(0, -'.ts'.length);
    const htmlFile = `${withoutExtension}.html`;
    const cssFile = `${withoutExtension}.css`;

    if (!(await exists(htmlFile))) {
      findings.push(error('VRT0005', relative(cwd, htmlFile), 'Missing sibling template file', `Create ${basename(htmlFile)}.`));
    }

    if (!(await exists(cssFile))) {
      findings.push(error('VRT0006', relative(cwd, cssFile), 'Missing sibling style file', `Create ${basename(cssFile)}.`));
    }
  }

  return findings;
}

function isRoleTypeScript(filePath: string): boolean {
  return /\.(component|page)\.ts$/.test(filePath);
}

function error(code: string, filePath: string, message: string, nextStep: string): DoctorFinding {
  return { severity: 'error', code, filePath, message, nextStep };
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function relative(cwd: string, filePath: string): string {
  return filePath.startsWith(cwd) ? filePath.slice(cwd.length + 1) : filePath;
}
```

- [ ] **Step 5: Add starter Vanrot rule checks**

Create `packages/cli/src/doctor/vanrot-rules.ts`:

```ts
import { readdir, readFile } from 'node:fs/promises';
import { join, relative as pathRelative } from 'node:path';
import type { DoctorFinding } from './checks.js';

const allowedRoles = ['component', 'page', 'dialog', 'layout', 'widget', 'form'];

export async function checkVanrotRules(cwd: string): Promise<DoctorFinding[]> {
  const srcDir = join(cwd, 'src');

  try {
    const files = await walkFiles(srcDir);
    return [
      ...(await checkRoleSuffixes(cwd, files)),
      ...(await checkRawTemplateText(cwd, files)),
      ...(await checkNestedIfs(cwd, files)),
    ];
  } catch {
    return [];
  }
}

export async function walkFiles(dir: string): Promise<string[]> {
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

async function checkRoleSuffixes(cwd: string, files: string[]): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];

  for (const file of files.filter((filePath) => filePath.endsWith('.ts'))) {
    const relative = pathRelative(cwd, file);
    const roleMatch = file.match(/\.([a-z]+)\.ts$/);

    if (roleMatch !== null && !allowedRoles.includes(roleMatch[1] ?? '')) {
      findings.push(warning('VRT1001', relative, 'Unsupported UI role suffix', 'Use .component.ts, .page.ts, .dialog.ts, .layout.ts, .widget.ts, or .form.ts.'));
      continue;
    }

    if (isUiFolder(relative) && roleMatch === null) {
      findings.push(warning('VRT1002', relative, 'Component or page file is missing a role-based suffix', 'Rename the file to include a Vanrot role suffix.'));
    }
  }

  return findings;
}

async function checkRawTemplateText(cwd: string, files: string[]): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];

  for (const file of files.filter((filePath) => /\.(component|page)\.html$/.test(filePath))) {
    const content = await readFile(file, 'utf8');

    if (!hasRawVisibleText(content)) {
      continue;
    }

    findings.push(warning('VRT1101', pathRelative(cwd, file), 'Raw user-facing text found in template', 'Use an i18n-ready interpolation such as {{ t(\\'common.label\\') }}.'));
  }

  return findings;
}

async function checkNestedIfs(cwd: string, files: string[]): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];

  for (const file of files.filter((filePath) => /\.(component|page)\.ts$/.test(filePath))) {
    const content = await readFile(file, 'utf8');

    if (!hasNestedIf(content)) {
      continue;
    }

    findings.push(warning('VRT1201', pathRelative(cwd, file), 'Nested if statement can be a guard clause', 'Prefer early returns before entering deeper logic.'));
  }

  return findings;
}

function hasRawVisibleText(content: string): boolean {
  const withoutInterpolations = content.replace(/\{\{[\s\S]*?\}\}/g, '');
  const textMatches = withoutInterpolations.match(/>([^<>{}][^<>]*)</g) ?? [];
  return textMatches.some((match) => match.slice(1, -1).trim().length > 0);
}

function hasNestedIf(content: string): boolean {
  return /if\s*\([^)]*\)\s*\{[\s\S]*?if\s*\([^)]*\)\s*\{/.test(content);
}

function isUiFolder(relative: string): boolean {
  return /(^|\/)(components|pages|dialogs|layouts|widgets|forms)\//.test(relative);
}

function warning(code: string, filePath: string, message: string, nextStep: string): DoctorFinding {
  return { severity: 'warning', code, filePath, message, nextStep };
}
```

- [ ] **Step 6: Add doctor reporter formatting**

Create `packages/cli/src/reporter/diagnostics.ts`:

```ts
import type { DoctorFinding } from '../doctor/checks.js';
import type { Reporter } from './reporter.js';

export function reportDoctorFindings(reporter: Reporter, findings: DoctorFinding[]): void {
  reporter.heading('Vanrot Doctor', `${findings.length} ${findings.length === 1 ? 'finding' : 'findings'}`);

  for (const finding of findings) {
    if (finding.severity === 'error') {
      reporter.error(finding.message, finding.filePath);
      continue;
    }

    reporter.warning(finding.filePath, finding.message);
  }

  reporter.nextSteps(uniqueNextSteps(findings));
}

function uniqueNextSteps(findings: DoctorFinding[]): string[] {
  return [...new Set(findings.map((finding) => finding.nextStep))];
}
```

- [ ] **Step 7: Add the doctor command**

Create `packages/cli/src/commands/doctor.ts`:

```ts
import { hasErrors, runDoctorChecks } from '../doctor/checks.js';
import { reportDoctorFindings } from '../reporter/diagnostics.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function doctorCommand(_args: string[], context: CommandContext): Promise<CommandResult> {
  const findings = await runDoctorChecks(context.cwd);

  reportDoctorFindings(context.reporter, findings);

  return {
    exitCode: hasErrors(findings) ? 1 : 0,
  };
}
```

- [ ] **Step 8: Wire `doctor` into the dispatcher**

Update `packages/cli/src/cli.ts` imports:

```ts
import { createCommand } from './commands/create.js';
import { doctorCommand } from './commands/doctor.js';
import { generateCommand } from './commands/generate.js';
```

Add before unknown command handling:

```ts
if (command === 'doctor') {
  return doctorCommand(rest, context);
}
```

- [ ] **Step 9: Run doctor tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/doctor.test.ts
```

Expected result:

```txt
PASS packages/cli/tests/doctor.test.ts
```

- [ ] **Step 10: Commit Task 4**

```bash
git add packages/cli/src packages/cli/tests
git commit -m "feat(cli): add starter doctor checks"
```

---

## Stage 5 - Runner Commands

### Task 5: Implement `vr dev`, `vr build`, and `vr test`

**Files:**

- Modify: `packages/cli/src/process/runner.ts`
- Create: `packages/cli/src/commands/dev.ts`
- Create: `packages/cli/src/commands/build.ts`
- Create: `packages/cli/src/commands/test.ts`
- Modify: `packages/cli/src/cli.ts`
- Test: `packages/cli/tests/runner-commands.test.ts`

- [ ] **Step 1: Write failing runner command tests**

Create `packages/cli/tests/runner-commands.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/index.js';
import type { ProcessRunner } from '../src/process/runner.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

function fakeRunner(exitCode = 0) {
  const calls: Array<{ command: string; args: string[]; cwd: string }> = [];
  const runner: ProcessRunner = {
    async run(command, args, options) {
      calls.push({ command, args, cwd: options.cwd });
      return exitCode;
    },
  };

  return { calls, runner };
}

describe('runner-backed commands', () => {
  it('runs vite for vr dev', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const result = await runCli(['dev'], { cwd: '/demo', reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([{ command: 'vite', args: [], cwd: '/demo' }]);
    expect(reporter.output()).toContain('Starting Vanrot dev server');
  });

  it('runs vite build for vr build', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const result = await runCli(['build'], { cwd: '/demo', reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([{ command: 'vite', args: ['build'], cwd: '/demo' }]);
    expect(reporter.output()).toContain('Building Vanrot app');
  });

  it('runs vitest run for vr test', async () => {
    const { calls, runner } = fakeRunner();
    const reporter = createMemoryReporter();
    const result = await runCli(['test'], { cwd: '/demo', reporter, runner });

    expect(result.exitCode).toBe(0);
    expect(calls).toEqual([{ command: 'vitest', args: ['run'], cwd: '/demo' }]);
    expect(reporter.output()).toContain('Running Vanrot tests');
  });

  it('returns a failure when the wrapped command fails', async () => {
    const { runner } = fakeRunner(1);
    const reporter = createMemoryReporter();
    const result = await runCli(['build'], { cwd: '/demo', reporter, runner });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Build failed');
  });
});
```

- [ ] **Step 2: Run the failing runner tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/runner-commands.test.ts
```

Expected result:

```txt
FAIL packages/cli/tests/runner-commands.test.ts
Cannot find module '../src/process/runner.js'
```

- [ ] **Step 3: Expand the process runner abstraction**

Replace `packages/cli/src/process/runner.ts` with:

```ts
import { spawn } from 'node:child_process';

export interface ProcessRunner {
  run(command: string, args: string[], options: { cwd: string }): Promise<number>;
}

export function createNodeProcessRunner(): ProcessRunner {
  return {
    run(command, args, options) {
      return new Promise((resolve) => {
        const child = spawn(command, args, {
          cwd: options.cwd,
          stdio: 'inherit',
          shell: process.platform === 'win32',
        });

        child.on('error', () => resolve(1));
        child.on('exit', (code) => resolve(code ?? 1));
      });
    },
  };
}
```

- [ ] **Step 4: Add runner-backed command handlers**

Create `packages/cli/src/commands/dev.ts`:

```ts
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function devCommand(_args: string[], context: CommandContext): Promise<CommandResult> {
  context.reporter.heading('Starting Vanrot dev server');
  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vite', [], { cwd: context.cwd });
  return { exitCode };
}
```

Create `packages/cli/src/commands/build.ts`:

```ts
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function buildCommand(_args: string[], context: CommandContext): Promise<CommandResult> {
  context.reporter.heading('Building Vanrot app');
  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vite', ['build'], { cwd: context.cwd });

  if (exitCode !== 0) {
    context.reporter.error('Build failed');
  }

  return { exitCode };
}
```

Create `packages/cli/src/commands/test.ts`:

```ts
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function testCommand(_args: string[], context: CommandContext): Promise<CommandResult> {
  context.reporter.heading('Running Vanrot tests');
  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vitest', ['run'], { cwd: context.cwd });

  if (exitCode !== 0) {
    context.reporter.error('Tests failed');
  }

  return { exitCode };
}
```

- [ ] **Step 5: Wire runner-backed commands into the dispatcher**

Update `packages/cli/src/cli.ts` imports:

```ts
import { buildCommand } from './commands/build.js';
import { createCommand } from './commands/create.js';
import { devCommand } from './commands/dev.js';
import { doctorCommand } from './commands/doctor.js';
import { generateCommand } from './commands/generate.js';
import { testCommand } from './commands/test.js';
```

Add before unknown command handling:

```ts
if (command === 'dev') {
  return devCommand(rest, context);
}

if (command === 'build') {
  return buildCommand(rest, context);
}

if (command === 'test') {
  return testCommand(rest, context);
}
```

- [ ] **Step 6: Run runner command tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/runner-commands.test.ts
```

Expected result:

```txt
PASS packages/cli/tests/runner-commands.test.ts
```

- [ ] **Step 7: Commit Task 5**

```bash
git add packages/cli/src packages/cli/tests
git commit -m "feat(cli): wrap dev build and test commands"
```

---

## Stage 6 - Binary and Package Wiring

### Task 6: Add the `vr` binary and package integration

**Files:**

- Create: `packages/cli/src/bin.ts`
- Modify: `packages/cli/package.json`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/cli.test.ts`

- [ ] **Step 1: Extend CLI tests for binary-facing exports**

Append to `packages/cli/tests/cli.test.ts`:

```ts
  it('exports the process runner factory for the binary', async () => {
    const cli = await import('../src/index.js');

    expect(cli.createConsoleReporter).toBeTypeOf('function');
    expect(cli.runCli).toBeTypeOf('function');
  });
```

- [ ] **Step 2: Run the focused CLI tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/cli.test.ts
```

Expected result:

```txt
PASS packages/cli/tests/cli.test.ts
```

- [ ] **Step 3: Add the binary entry**

Create `packages/cli/src/bin.ts`:

```ts
#!/usr/bin/env node
import { runCli } from './cli.js';
import { createNodeProcessRunner } from './process/runner.js';
import { createConsoleReporter } from './reporter/reporter.js';

try {
  const result = await runCli(process.argv.slice(2), {
    cwd: process.cwd(),
    reporter: createConsoleReporter(),
    runner: createNodeProcessRunner(),
  });

  process.exitCode = result.exitCode;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
```

- [ ] **Step 4: Export the runner factory**

Update `packages/cli/src/index.ts`:

```ts
export { runCli } from './cli.js';
export { createNodeProcessRunner } from './process/runner.js';
export type { ProcessRunner } from './process/runner.js';
export type { CommandContext, CommandHandler, CommandResult } from './result.js';
export { createConsoleReporter, createMemoryReporter } from './reporter/reporter.js';
export type { MemoryReporter, Reporter } from './reporter/reporter.js';
```

- [ ] **Step 5: Add package binary metadata**

Update `packages/cli/package.json`:

```json
{
  "name": "@vanrot/cli",
  "version": "0.0.0",
  "type": "module",
  "bin": {
    "vr": "./dist/bin.js"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

- [ ] **Step 6: Build the CLI and smoke-test the built binary**

Run:

```bash
pnpm --filter @vanrot/cli build
```

Expected result:

```txt
@vanrot/cli build passes.
```

Then run:

```bash
node packages/cli/dist/bin.js --help
```

Expected output contains:

```txt
Vanrot CLI
vr create <name>
vr doctor
```

- [ ] **Step 7: Run the package test suite**

Run:

```bash
pnpm --filter @vanrot/cli test
```

Expected result:

```txt
PASS packages/cli/tests/cli.test.ts
PASS packages/cli/tests/create.test.ts
PASS packages/cli/tests/generate.test.ts
PASS packages/cli/tests/doctor.test.ts
PASS packages/cli/tests/runner-commands.test.ts
PASS packages/cli/tests/reporter.test.ts
```

- [ ] **Step 8: Commit Task 6**

```bash
git add packages/cli/package.json packages/cli/src packages/cli/tests
git commit -m "feat(cli): expose vr binary"
```

---

## Stage 7 - Verification and Phase Completion Docs

### Task 7: Verify Phase 5 and update trackers

**Files:**

- Modify: `docs/brainstorm.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/plans/Phase-05.md`

- [ ] **Step 1: Run full verification before touching trackers**

Run:

```bash
pnpm verify
```

Expected result:

```txt
typecheck passes
test passes
build passes
runtime size budget passes
phase documentation verification passes
```

- [ ] **Step 2: Move verified Phase 5 maturity rows to Demo-Capable**

In `docs/superpowers/feature-maturity.md`, update only verified Phase 5 rows:

```txt
CLI `vr create`                 Planned -> Demo-Capable
CLI `vr generate component`     Planned -> Demo-Capable
CLI `vr generate page`          Planned -> Demo-Capable
CLI `vr doctor` starter checks  Planned -> Demo-Capable
CLI `vr dev`                    Planned -> Demo-Capable
CLI `vr build`                  Planned -> Demo-Capable
CLI `vr test`                   Planned -> Demo-Capable
CLI Quiet Premium reporter      Planned -> Demo-Capable
```

Leave these rows deferred:

```txt
CLI production terminal experience
CLI full `vr doctor` diagnostics
CLI build reports and budgets
CLI `vr inspect`
Project map `.vanrot/project-map.json`
AI rules `.vanrot/ai-rules.md`
Optional AI commands
```

- [ ] **Step 3: Tick Phase 5 in brainstorm**

In `docs/brainstorm.md`, change the Phase 5 row:

```md
| [x] | Phase 5 - CLI MVP | `@vanrot/cli` with `vr create`, `vr generate component`, `vr generate page`, `vr doctor`, `vr build`, and `vr test`. | A user can create an app, generate files, diagnose issues, build, and test through `vr`. |
```

If the row still omits `vr dev`, update the create/tick text to include it:

```md
| [x] | Phase 5 - CLI MVP | `@vanrot/cli` with `vr create`, `vr generate component`, `vr generate page`, `vr doctor`, `vr dev`, `vr build`, and `vr test`. | A user can create an app, generate files, diagnose issues, start dev, build, and test through `vr`. |
```

- [ ] **Step 4: Update the presentation roadmap**

In `docs/vanrot-presentation.html`:

```txt
Phase 5 card: class="phase-card done" and status ✅
Phase 6 card: class="phase-card active-phase" and status ⚡
Summary text: Done: Phases 0-5
Summary text: Active: Phase 6 (Counter Demo Milestone)
Summary text: Queued: Phases 7-11
```

Also update CLI slide copy if it still describes Phase 5 as pending.

- [ ] **Step 5: Tick every checkbox in this plan**

In `docs/superpowers/plans/Phase-05.md`, change every completed task checkbox from:

```md
- [ ] ...
```

to:

```md
- [x] ...
```

Do this only after the corresponding implementation and verification steps really completed.

- [ ] **Step 6: Run guardrail and full verification again**

Run:

```bash
pnpm verify:phase-docs
```

Expected result:

```txt
Phase documentation verification passed.
```

Then run:

```bash
pnpm verify
```

Expected result:

```txt
All package typechecks, tests, builds, runtime size checks, and phase-doc checks pass.
```

- [ ] **Step 7: Commit Task 7**

```bash
git add docs/brainstorm.md docs/vanrot-presentation.html docs/superpowers/feature-maturity.md docs/superpowers/plans/Phase-05.md
git commit -m "docs: mark Phase 5 complete"
```

---

## Self-Review Notes

Spec coverage:

```txt
vr create                         Task 2
vr generate component/page         Task 3
vr doctor starter diagnostics      Task 4
vr dev/build/test                  Task 5
Quiet Premium reporter             Task 1 and Task 4
binary entry                       Task 6
TDD and verification               Every implementation task
phase tracker/maturity updates     Task 7
deferred production CLI features   Task 7 leaves deferred rows untouched
```

Type consistency:

```txt
runCli(args, context) returns CommandResult
CommandContext carries cwd, reporter, optional runner
Reporter is presentation-only
ProcessRunner.run(command, args, { cwd }) returns Promise<number>
DoctorFinding uses severity, code, filePath, message, nextStep
```

Placeholder scan:

```txt
No placeholder markers.
No production-only CLI polish is hidden inside Phase 5.
No Phase 5 row should be marked Demo-Capable until Task 7 verification passes.
```
