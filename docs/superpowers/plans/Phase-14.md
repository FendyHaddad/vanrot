# Phase 14 CLI Product Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Vanrot AGENTS.md disables subagent and parallel-agent workflows in this repository.

**Goal:** Turn `@vanrot/cli` into a coherent product surface with grouped help, aligned guided output, structured modes, stable diagnostics, and a local AI doorway.

**Architecture:** Keep the CLI lightweight: plain TypeScript modules, explicit command metadata, a shared reporter/renderer boundary, and small AI helper files under `packages/cli/src/ai/`. Build in slices so each step starts with a failing Vitest assertion, lands the smallest implementation, and verifies the package before moving on.

**Tech Stack:** TypeScript, Vitest, Node.js filesystem APIs, existing `@vanrot/config` loader, existing `@vanrot/cli` command handlers, pnpm workspace scripts.

---

## Project Rules For This Plan

- Execute inline in the current session; do not dispatch subagents.
- Do not run `git add`, `git commit`, or `git push` unless the user explicitly asks during execution.
- Treat the commit steps below as user-owned checkpoints. They document intended slices and staging sets.
- Keep generated and app-facing strings centralized in metadata/catalog files.
- Use guard clauses and plain functions. Do not add decorators, dependency injection, or a framework-style registry.
- Run focused tests after each slice and `pnpm verify` before marking Phase 14 done.

## File Structure

### Command Metadata And Root Help

- Modify `packages/cli/src/commands/metadata.ts`
  - Own command names, one-line descriptions, help text, and command groups.
- Modify `packages/cli/src/cli.ts`
  - Parse global output flags before command dispatch.
  - Render grouped root help through metadata.
  - Register the new `ai` command.
- Modify `packages/cli/tests/cli.test.ts`
  - Assert grouped root help, examples, global options, and unsupported structured-mode failures.

### Reporter And Output Modes

- Modify `packages/cli/src/reporter/reporter.ts`
  - Keep `MemoryReporter` plain and deterministic.
  - Use aligned labels for success/info/warning/error/next.
  - Add console color only in `createConsoleReporter`.
- Create `packages/cli/src/reporter/modes.ts`
  - Own global output flag parsing and mode decisions.
- Create `packages/cli/src/reporter/events.ts`
  - Own structured event types used by JSON and JSONL output.
- Modify `packages/cli/src/reporter/diagnostics.ts`
  - Render doctor findings with one finding per line and a single next section.
- Modify `packages/cli/tests/reporter.test.ts`
  - Assert spacing, plain output, quiet/verbose helpers, JSON/JSONL event rendering, and no-color behavior.
- Modify `packages/cli/tests/doctor.test.ts`
  - Assert doctor output shape and single next section.

### Diagnostics

- Create `packages/cli/src/diagnostics/catalog.ts`
  - Own stable CLI diagnostic codes and messages.
- Create `packages/cli/tests/diagnostics.test.ts`
  - Assert catalog stability and no duplicate codes.

### AI Doorway

- Create `packages/cli/src/ai/paths.ts`
  - Own `.vanrot/ai` paths and project-relative path helpers.
- Create `packages/cli/src/ai/context.ts`
  - Build `context.json` from project map/config/package state.
- Create `packages/cli/src/ai/doctor.ts`
  - Build `doctor.json` from doctor findings.
- Create `packages/cli/src/ai/prompt.ts`
  - Build paste-ready `prompt.md`.
- Create `packages/cli/src/ai/history.ts`
  - Append error records, manual notes, and resolved records to `history.jsonl`.
- Create `packages/cli/src/ai/summarize.ts`
  - Produce deterministic offline `summary.md`.
- Create `packages/cli/src/commands/ai.ts`
  - Parse `vr ai context`, `doctor`, `prompt`, `record`, and `summarize`.
- Modify `packages/cli/src/commands/init-ai.ts`
  - Initialize `.vanrot/ai`, write context/prompt/doctor files, and add `.vanrot/ai/` to `.gitignore`.
- Modify `packages/cli/tests/intelligence-commands.test.ts`
  - Extend AI command coverage.
- Create `packages/cli/tests/ai-doorway.test.ts`
  - Cover gitignore insertion, disabled config behavior, error-only history, resolved lifecycle, and deterministic summary.

### Phase Documentation

- Modify `docs/superpowers/feature-maturity.md`
  - When execution completes, tick Phase 14 and update affected CLI rows to `Production-Ready`.
- Modify `docs/superpowers/final-tdd-inventory.md`
  - Record Phase 14 CLI renderer, diagnostics, AI doorway, and structured-mode coverage.
- Modify `docs/vanrot-presentation.html`
  - Mark Phase 14 done and Phase 15 active only after verification passes.

---

### Task 1: Command Metadata And Groups

**Files:**
- Modify: `packages/cli/src/commands/metadata.ts`
- Modify: `packages/cli/tests/cli.test.ts`

- [x] **Step 1: Add failing metadata tests**

Append these tests inside `describe('runCli', ...)` in `packages/cli/tests/cli.test.ts`:

```typescript
it('prints grouped root help with descriptions and examples', async () => {
  const reporter = createMemoryReporter();
  const result = await runCli(['--help'], {
    cwd: process.cwd(),
    reporter,
  });

  const out = reporter.output();

  expect(result.exitCode).toBe(0);
  expect(out).toContain('VANROT');
  expect(out).toContain('Usage   vr <command> [options]');
  expect(out).toContain('SCAFFOLD');
  expect(out).toContain('create <name>              Create a new Vanrot project');
  expect(out).toContain('generate <role> <name>     Generate a component or page');
  expect(out).toContain('add <primitive>            Add a UI primitive to the project');
  expect(out).toContain('DEVELOPMENT');
  expect(out).toContain('dev                        Start dev server with HMR');
  expect(out).toContain('build                      Compile and bundle for production');
  expect(out).toContain('test                       Run the test suite');
  expect(out).toContain('MAINTENANCE');
  expect(out).toContain('doctor                     Check project health and config');
  expect(out).toContain('config <action>            Validate, migrate, or recover config');
  expect(out).toContain('map                        Print the project structure map');
  expect(out).toContain('init-ai                    Set up AI context rules for this project');
  expect(out).toContain('e.g.  vr create my-app  ·  vr generate component header  ·  vr add button');
  expect(out).toContain('Run vr <command> --help for flags and examples.');
});
```

Add a metadata-specific import at the top:

```typescript
import { cliCommands, commandGroups } from '@/commands/metadata.js';
```

Append this test:

```typescript
it('keeps every root command in exactly one help group with a description', () => {
  const groupedCommands = commandGroups.flatMap((group) => group.commands);
  const commandNames = cliCommands.map((command) => command.name);

  expect(groupedCommands).toEqual([
    'create',
    'generate',
    'add',
    'dev',
    'build',
    'test',
    'doctor',
    'config',
    'map',
    'init-ai',
  ]);

  expect(new Set(groupedCommands).size).toBe(groupedCommands.length);
  expect([...groupedCommands].sort()).toEqual([...commandNames].sort());

  for (const command of cliCommands) {
    expect(command.description.length).toBeGreaterThan(10);
  }
});
```

- [x] **Step 2: Run the focused test and verify red**

Run:

```bash
cd packages/cli && pnpm test -- tests/cli.test.ts --reporter=verbose
```

Expected: FAIL because `commandGroups` and `description` do not exist and root help is not grouped.

- [x] **Step 3: Add command descriptions and groups**

Update `packages/cli/src/commands/metadata.ts`:

```typescript
export interface CliCommandMetadata {
  name: CommandName;
  usage: string;
  rootUsage: string;
  description: string;
  secondaryUsages?: readonly string[];
  help: string;
}
```

Update each `cliCommands` entry with these exact `rootUsage` and `description` values:

```typescript
{
  name: commandName.create,
  usage: 'vr create <name>',
  rootUsage: 'create <name>',
  description: 'Create a new Vanrot project',
  help: `vr create <name>

Options
  --workspace   Use workspace dependencies for repository fixtures
  --force       Overwrite an existing target directory`,
},
{
  name: commandName.generate,
  usage: 'vr generate component <name>',
  rootUsage: 'generate <role> <name>',
  description: 'Generate a component or page',
  secondaryUsages: ['vr generate page <name>'],
  help: `vr generate <role> <name>

Roles
  component
  page

Options
  --feature <name>   Generate inside src/features/<name>`,
},
{
  name: commandName.add,
  usage: 'vr add button',
  rootUsage: 'add <primitive>',
  description: 'Add a UI primitive to the project',
  secondaryUsages: ['vr add <local-prefix> button'],
  help: `vr add <primitive>
vr add <local-prefix> button

Primitives
  button

Examples
  vr add button
  vr add primary button`,
},
{
  name: commandName.config,
  usage: 'vr config migrate',
  rootUsage: 'config <action>',
  description: 'Validate, migrate, or recover config',
  secondaryUsages: ['vr config recover', 'vr config migrate --recover'],
  help: `vr config migrate
vr config recover
vr config migrate --recover

Options
  --force         Overwrite an existing config during recover
  --destructive   Overwrite an existing config during migrate`,
},
{
  name: commandName.doctor,
  usage: commandInvocation(commandName.doctor),
  rootUsage: 'doctor',
  description: 'Check project health and config',
  help: commandInvocation(commandName.doctor),
},
{
  name: commandName.map,
  usage: commandInvocation(commandName.map),
  rootUsage: 'map',
  description: 'Print the project structure map',
  help: commandInvocation(commandName.map),
},
{
  name: commandName.initAi,
  usage: commandInvocation(commandName.initAi),
  rootUsage: 'init-ai',
  description: 'Set up AI context rules for this project',
  help: commandInvocation(commandName.initAi),
},
{
  name: commandName.dev,
  usage: commandInvocation(commandName.dev),
  rootUsage: 'dev',
  description: 'Start dev server with HMR',
  help: commandInvocation(commandName.dev),
},
{
  name: commandName.build,
  usage: commandInvocation(commandName.build),
  rootUsage: 'build',
  description: 'Compile and bundle for production',
  help: commandInvocation(commandName.build),
},
{
  name: commandName.test,
  usage: commandInvocation(commandName.test),
  rootUsage: 'test',
  description: 'Run the test suite',
  help: commandInvocation(commandName.test),
},
```

Add this export below `cliCommands`:

```typescript
export const commandGroups = [
  { label: 'Scaffold', commands: [commandName.create, commandName.generate, commandName.add] },
  { label: 'Development', commands: [commandName.dev, commandName.build, commandName.test] },
  {
    label: 'Maintenance',
    commands: [commandName.doctor, commandName.config, commandName.map, commandName.initAi],
  },
] as const;
```

- [x] **Step 4: Run metadata/root-help focused test**

Run:

```bash
cd packages/cli && pnpm test -- tests/cli.test.ts --reporter=verbose
```

Expected: metadata test PASS; grouped root help test still FAIL until Task 3.

- [x] **Step 5: User-owned checkpoint**

Only run if the user asks for a commit:

```bash
git add packages/cli/src/commands/metadata.ts packages/cli/tests/cli.test.ts
git commit -m "feat(cli): add command descriptions and help groups"
```

---

### Task 2: Aligned Reporter Labels

**Files:**
- Modify: `packages/cli/src/reporter/reporter.ts`
- Modify: `packages/cli/tests/reporter.test.ts`

- [x] **Step 1: Replace reporter tests with deterministic format checks**

Replace `packages/cli/tests/reporter.test.ts` with:

```typescript
import { describe, expect, it } from 'vitest';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('createMemoryReporter', () => {
  it('pads status labels to the shared content column', () => {
    const reporter = createMemoryReporter();

    reporter.success('vanrot.config.ts found');
    reporter.warning('src/app.component.html', 'Raw user-facing text found in template.');
    reporter.error('Node.js version too old', 'requires 18.0.0 or later');
    reporter.nextSteps(['upgrade Node.js to 18+']);

    expect(reporter.output()).toBe([
      'success   vanrot.config.ts found',
      'warning   src/app.component.html',
      '          Raw user-facing text found in template.',
      'error     Node.js version too old',
      '          requires 18.0.0 or later',
      'next      upgrade Node.js to 18+',
    ].join('\n'));
  });

  it('renders headings with optional metadata on one stable line', () => {
    const reporter = createMemoryReporter();

    reporter.heading('Vanrot Doctor', '2 findings');

    expect(reporter.output()).toBe('Vanrot Doctor  2 findings\n');
  });

  it('skips next output when no next steps exist', () => {
    const reporter = createMemoryReporter();

    reporter.nextSteps([]);

    expect(reporter.output()).toBe('');
  });
});
```

- [x] **Step 2: Run the focused test and verify red**

Run:

```bash
cd packages/cli && pnpm test -- tests/reporter.test.ts --reporter=verbose
```

Expected: FAIL because current warnings use separate unaligned lines and `nextSteps` prints `Next` plus `>`.

- [x] **Step 3: Rewrite reporter label helpers and memory reporter**

Update `packages/cli/src/reporter/reporter.ts`:

```typescript
const LABEL_WIDTH = 8;
const INDENT = ' '.repeat(LABEL_WIDTH + 2);

function labelLine(label: string, content: string): string {
  return `${label.padEnd(LABEL_WIDTH)}  ${content}`;
}

export function createMemoryReporter(): MemoryReporter {
  const lines: string[] = [];

  return {
    line(text = '') {
      lines.push(text);
    },
    heading(title, meta) {
      lines.push(meta === undefined ? title : `${title}  ${meta}`);
      lines.push('');
    },
    success(label, detail) {
      lines.push(labelLine('success', label));

      if (detail === undefined) {
        return;
      }

      lines.push(`${INDENT}${detail}`);
    },
    warning(filePath, message) {
      lines.push(labelLine('warning', filePath));
      lines.push(`${INDENT}${message}`);
    },
    error(message, detail) {
      lines.push(labelLine('error', message));

      if (detail === undefined) {
        return;
      }

      lines.push(`${INDENT}${detail}`);
    },
    nextSteps(steps) {
      if (steps.length === 0) {
        return;
      }

      for (const step of steps) {
        lines.push(labelLine('next', step));
      }
    },
    output() {
      return lines.join('\n');
    },
  };
}
```

- [x] **Step 4: Update `createConsoleReporter` to share the same spacing**

Replace `createConsoleReporter` in `packages/cli/src/reporter/reporter.ts` with:

```typescript
export function createConsoleReporter(): Reporter {
  return {
    line(text = '') {
      console.log(text);
    },
    heading(title, meta) {
      console.log(meta === undefined ? title : `${title}  ${meta}`);
      console.log('');
    },
    success(label, detail) {
      console.log(labelLine('success', label));

      if (detail === undefined) {
        return;
      }

      console.log(`${INDENT}${detail}`);
    },
    warning(filePath, message) {
      console.log(labelLine('warning', filePath));
      console.log(`${INDENT}${message}`);
    },
    error(message, detail) {
      console.error(labelLine('error', message));

      if (detail === undefined) {
        return;
      }

      console.error(`${INDENT}${detail}`);
    },
    nextSteps(steps) {
      if (steps.length === 0) {
        return;
      }

      for (const step of steps) {
        console.log(labelLine('next', step));
      }
    },
  };
}
```

- [x] **Step 5: Run focused and package tests**

Run:

```bash
cd packages/cli && pnpm test -- tests/reporter.test.ts --reporter=verbose
cd packages/cli && pnpm test
```

Expected: reporter tests PASS. If doctor tests fail on old `Next`/`>` assertions, update those assertions in Task 4, not here.

- [x] **Step 6: User-owned checkpoint**

Only run if the user asks for a commit:

```bash
git add packages/cli/src/reporter/reporter.ts packages/cli/tests/reporter.test.ts
git commit -m "fix(cli): align reporter labels"
```

---

### Task 3: Grouped Root Help

**Files:**
- Modify: `packages/cli/src/cli.ts`
- Modify: `packages/cli/tests/cli.test.ts`

- [x] **Step 1: Replace root help construction**

In `packages/cli/src/cli.ts`, update the metadata import:

```typescript
import {
  cliCommands,
  commandAlias,
  commandGroups,
  commandInvocation,
  commandName,
} from './commands/metadata.js';
```

Replace the current `rootHelp` constant with:

```typescript
const commandByName = new Map(cliCommands.map((command) => [command.name, command]));

const rootHelp = [
  'VANROT',
  '',
  'Usage   vr <command> [options]',
  '',
  ...commandGroups.flatMap((group) => renderCommandGroup(group)),
  'Run vr <command> --help for flags and examples.',
].join('\n');

function renderCommandGroup(group: (typeof commandGroups)[number]): string[] {
  const lines = [group.label.toUpperCase()];

  for (const commandNameInGroup of group.commands) {
    const metadata = commandByName.get(commandNameInGroup);

    if (metadata === undefined) {
      continue;
    }

    lines.push(`${metadata.rootUsage.padEnd(28)} ${metadata.description}`);
  }

  if (group.label === 'Scaffold') {
    lines.push('e.g.  vr create my-app  ·  vr generate component header  ·  vr add button');
  }

  lines.push('');
  return lines;
}
```

- [x] **Step 2: Run root help tests**

Run:

```bash
cd packages/cli && pnpm test -- tests/cli.test.ts --reporter=verbose
```

Expected: grouped root help tests PASS.

- [x] **Step 3: Run full CLI tests**

Run:

```bash
cd packages/cli && pnpm test
```

Expected: all CLI tests PASS.

- [x] **Step 4: User-owned checkpoint**

Only run if the user asks for a commit:

```bash
git add packages/cli/src/cli.ts packages/cli/tests/cli.test.ts
git commit -m "feat(cli): redesign root help"
```

---

### Task 4: Doctor Output Shape And Diagnostic Catalog

**Files:**
- Create: `packages/cli/src/diagnostics/catalog.ts`
- Create: `packages/cli/tests/diagnostics.test.ts`
- Modify: `packages/cli/src/reporter/diagnostics.ts`
- Modify: `packages/cli/tests/doctor.test.ts`

- [x] **Step 1: Add failing catalog test**

Create `packages/cli/tests/diagnostics.test.ts`:

```typescript
import { cliDiagnosticCatalog } from '@/diagnostics/catalog.js';
import { describe, expect, it } from 'vitest';

describe('cliDiagnosticCatalog', () => {
  it('keeps stable unique CLI diagnostic codes', () => {
    const codes = cliDiagnosticCatalog.map((diagnostic) => diagnostic.code);

    expect(codes).toEqual([
      'VR_UNKNOWN_COMMAND',
      'VR_UNSUPPORTED_JSON',
      'VR_JSON_MODE_CONFLICT',
      'VR_DOCTOR_FAILED',
      'VR_BUILD_FAILED',
      'VR_TEST_FAILED',
      'VR_AI_DISABLED',
      'VR_AI_HISTORY_INVALID',
    ]);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
```

- [x] **Step 2: Add failing doctor format assertion**

Append to `packages/cli/tests/doctor.test.ts`:

```typescript
it('renders each finding on one labeled line with one next section', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-doctor-format-'));
  const reporter = createMemoryReporter();

  const result = await runCli(['doctor'], { cwd, reporter });
  const out = reporter.output();

  expect(result.exitCode).toBe(1);
  expect(out).toContain('Vanrot Doctor');
  expect(out).toContain('error     Missing package.json');
  expect(out).toContain('          package.json');
  expect(out).toContain('error     Missing src directory');
  expect(out).toContain('          src');
  expect(out).toContain('next      Run vr create <name> to scaffold a Vanrot project.');
  expect(out.match(/^next\s+/gm)).toHaveLength(1);
});
```

- [x] **Step 3: Run focused tests and verify red**

Run:

```bash
cd packages/cli && pnpm test -- tests/diagnostics.test.ts tests/doctor.test.ts --reporter=verbose
```

Expected: FAIL because catalog file does not exist and doctor output still uses old detail ordering for errors.

- [x] **Step 4: Create diagnostic catalog**

Create `packages/cli/src/diagnostics/catalog.ts`:

```typescript
export interface CliDiagnosticMetadata {
  code: string;
  message: string;
  nextStep: string;
}

export const cliDiagnosticCatalog: readonly CliDiagnosticMetadata[] = [
  {
    code: 'VR_UNKNOWN_COMMAND',
    message: 'Unknown command',
    nextStep: 'Run vr --help.',
  },
  {
    code: 'VR_UNSUPPORTED_JSON',
    message: 'Structured output is not supported for this command',
    nextStep: 'Run the command without --json or --jsonl.',
  },
  {
    code: 'VR_JSON_MODE_CONFLICT',
    message: '--json and --jsonl cannot be used together',
    nextStep: 'Choose either --json or --jsonl.',
  },
  {
    code: 'VR_DOCTOR_FAILED',
    message: 'Project health checks failed',
    nextStep: 'Run vr doctor after fixing the reported findings.',
  },
  {
    code: 'VR_BUILD_FAILED',
    message: 'Build command failed',
    nextStep: 'Run vr build --verbose for diagnostic details.',
  },
  {
    code: 'VR_TEST_FAILED',
    message: 'Test command failed',
    nextStep: 'Run vr test --verbose for diagnostic details.',
  },
  {
    code: 'VR_AI_DISABLED',
    message: 'Vanrot AI doorway is disabled',
    nextStep: 'Enable ai.enabled in vanrot.config.ts.',
  },
  {
    code: 'VR_AI_HISTORY_INVALID',
    message: 'Vanrot AI history contains invalid JSONL',
    nextStep: 'Move the invalid history file aside and rerun vr ai summarize.',
  },
] as const;
```

- [x] **Step 5: Keep doctor finding details in the continuation column**

Update `packages/cli/src/reporter/diagnostics.ts`:

```typescript
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

This preserves the existing function but relies on Task 2 reporter spacing. If `nextSteps` emits multiple unique next lines, keep that behavior; the test fixture above expects only one unique next action for missing starter files.

- [x] **Step 6: Run focused tests**

Run:

```bash
cd packages/cli && pnpm test -- tests/diagnostics.test.ts tests/doctor.test.ts --reporter=verbose
```

Expected: PASS.

- [x] **Step 7: User-owned checkpoint**

Only run if the user asks for a commit:

```bash
git add packages/cli/src/diagnostics/catalog.ts packages/cli/tests/diagnostics.test.ts packages/cli/src/reporter/diagnostics.ts packages/cli/tests/doctor.test.ts
git commit -m "feat(cli): add stable diagnostics and doctor output format"
```

---

### Task 5: Structured Output Mode Parsing

**Files:**
- Create: `packages/cli/src/reporter/modes.ts`
- Create: `packages/cli/src/reporter/events.ts`
- Modify: `packages/cli/src/result.ts`
- Modify: `packages/cli/src/cli.ts`
- Modify: `packages/cli/tests/cli.test.ts`
- Modify: `packages/cli/tests/reporter.test.ts`

- [x] **Step 1: Add failing mode parser tests**

Append to `packages/cli/tests/reporter.test.ts`:

```typescript
import { parseOutputMode, renderJsonEvent, renderJsonLineEvent } from '../src/reporter/modes.js';

describe('output modes', () => {
  it('parses quiet, verbose, color, json, jsonl, and non-interactive flags', () => {
    const parsed = parseOutputMode(['--quiet', '--verbose', '--no-color', '--json', '--no-interactive']);

    expect(parsed).toEqual({
      args: [],
      mode: {
        quiet: true,
        verbose: true,
        color: false,
        interactive: false,
        structured: 'json',
      },
      error: undefined,
    });
  });

  it('rejects json and jsonl together', () => {
    const parsed = parseOutputMode(['build', '--json', '--jsonl']);

    expect(parsed.error).toEqual({
      code: 'VR_JSON_MODE_CONFLICT',
      message: '--json and --jsonl cannot be used together',
      nextStep: 'Choose either --json or --jsonl.',
    });
  });

  it('renders final json and jsonl events deterministically', () => {
    const event = { type: 'result' as const, command: 'doctor', exitCode: 1 };

    expect(renderJsonEvent(event)).toBe('{\n  "type": "result",\n  "command": "doctor",\n  "exitCode": 1\n}');
    expect(renderJsonLineEvent(event)).toBe('{"type":"result","command":"doctor","exitCode":1}');
  });
});
```

- [x] **Step 2: Add failing CLI structured mode tests**

Append to `packages/cli/tests/cli.test.ts`:

```typescript
it('rejects structured output for unsupported human write commands', async () => {
  const reporter = createMemoryReporter();
  const result = await runCli(['generate', 'component', 'home', '--json'], {
    cwd: process.cwd(),
    reporter,
  });

  expect(result.exitCode).toBe(1);
  expect(reporter.output()).toContain('error     --json is not supported for vr generate');
  expect(reporter.output()).toContain('next      Run vr generate without --json or --jsonl.');
});

it('prints final json for supported read commands', async () => {
  const reporter = createMemoryReporter();
  const result = await runCli(['--json', 'doctor'], {
    cwd: process.cwd(),
    reporter,
  });

  expect(result.exitCode).toBeTypeOf('number');
  expect(reporter.output()).toContain('"type": "result"');
  expect(reporter.output()).toContain('"command": "doctor"');
  expect(reporter.output()).toContain('"exitCode"');
});
```

- [x] **Step 3: Run focused tests and verify red**

Run:

```bash
cd packages/cli && pnpm test -- tests/reporter.test.ts tests/cli.test.ts --reporter=verbose
```

Expected: FAIL because output mode helpers do not exist and `runCli` does not parse global structured flags.

- [x] **Step 4: Add event and mode helpers**

Create `packages/cli/src/reporter/events.ts`:

```typescript
export interface ResultEvent {
  type: 'result';
  command: string;
  exitCode: number;
}

export interface DiagnosticEvent {
  type: 'diagnostic';
  code: string;
  message: string;
  nextStep?: string;
}

export type CliEvent = ResultEvent | DiagnosticEvent;
```

Create `packages/cli/src/reporter/modes.ts`:

```typescript
import type { CliDiagnosticMetadata } from '../diagnostics/catalog.js';
import type { CliEvent } from './events.js';

export interface OutputMode {
  quiet: boolean;
  verbose: boolean;
  color: boolean;
  interactive: boolean;
  structured: 'human' | 'json' | 'jsonl';
}

export interface ParsedOutputMode {
  args: string[];
  mode: OutputMode;
  error?: CliDiagnosticMetadata;
}

export function parseOutputMode(args: string[], env: NodeJS.ProcessEnv = process.env): ParsedOutputMode {
  const remaining: string[] = [];
  let quiet = false;
  let verbose = false;
  let color = env.NO_COLOR !== '1';
  let interactive = true;
  let json = false;
  let jsonl = false;

  for (const arg of args) {
    if (arg === '--quiet') {
      quiet = true;
      continue;
    }

    if (arg === '--verbose') {
      verbose = true;
      continue;
    }

    if (arg === '--no-color') {
      color = false;
      continue;
    }

    if (arg === '--no-interactive') {
      interactive = false;
      continue;
    }

    if (arg === '--json') {
      json = true;
      continue;
    }

    if (arg === '--jsonl') {
      jsonl = true;
      continue;
    }

    remaining.push(arg);
  }

  if (json && jsonl) {
    return {
      args: remaining,
      mode: { quiet, verbose, color: false, interactive: false, structured: 'human' },
      error: {
        code: 'VR_JSON_MODE_CONFLICT',
        message: '--json and --jsonl cannot be used together',
        nextStep: 'Choose either --json or --jsonl.',
      },
    };
  }

  const structured = json ? 'json' : jsonl ? 'jsonl' : 'human';

  return {
    args: remaining,
    mode: {
      quiet,
      verbose,
      color: structured === 'human' && color,
      interactive: structured === 'human' && interactive,
      structured,
    },
  };
}

export function renderJsonEvent(event: CliEvent): string {
  return JSON.stringify(event, null, 2);
}

export function renderJsonLineEvent(event: CliEvent): string {
  return JSON.stringify(event);
}
```

- [x] **Step 5: Thread output mode through command context and root CLI**

Update `packages/cli/src/result.ts`:

```typescript
import type { ProcessRunner } from './process/runner.js';
import type { OutputMode } from './reporter/modes.js';
import type { Reporter } from './reporter/reporter.js';

export interface CommandResult {
  exitCode: number;
}

export interface CommandContext {
  cwd: string;
  reporter: Reporter;
  runner?: ProcessRunner;
  outputMode?: OutputMode;
}
```

Update `packages/cli/src/cli.ts` imports:

```typescript
import { parseOutputMode, renderJsonEvent, renderJsonLineEvent } from './reporter/modes.js';
```

At the start of `runCli`, before destructuring args, add:

```typescript
const parsed = parseOutputMode(args);

if (parsed.error !== undefined) {
  context.reporter.error(parsed.error.message, parsed.error.code);
  context.reporter.nextSteps([parsed.error.nextStep]);
  return fail();
}

const outputMode = parsed.mode;
const parsedArgs = parsed.args;
const [command, ...rest] = parsedArgs;
const commandContext = { ...context, outputMode };
```

Then replace uses of `context` in command dispatch with `commandContext`. After a handler returns for supported structured commands, emit a result event:

```typescript
const structuredCommands = new Set<string>([
  commandName.doctor,
  commandName.map,
  commandName.config,
]);

function supportsStructuredOutput(command: string | undefined): boolean {
  return command !== undefined && structuredCommands.has(command);
}

function reportStructuredResult(command: string, result: CommandResult, context: CommandContext): void {
  if (context.outputMode?.structured === 'json') {
    context.reporter.line(renderJsonEvent({ type: 'result', command, exitCode: result.exitCode }));
    return;
  }

  if (context.outputMode?.structured === 'jsonl') {
    context.reporter.line(renderJsonLineEvent({ type: 'result', command, exitCode: result.exitCode }));
  }
}
```

Before dispatching a command, reject unsupported structured commands:

```typescript
if (outputMode.structured !== 'human' && !supportsStructuredOutput(command)) {
  context.reporter.error(`${outputMode.structured === 'json' ? '--json' : '--jsonl'} is not supported for vr ${command}`, 'VR_UNSUPPORTED_JSON');
  context.reporter.nextSteps([`Run vr ${command} without --json or --jsonl.`]);
  return fail();
}
```

After handler execution:

```typescript
if (handler !== undefined) {
  const result = await handler(rest, commandContext);
  reportStructuredResult(command, result, commandContext);
  return result;
}
```

- [x] **Step 6: Run focused tests**

Run:

```bash
cd packages/cli && pnpm test -- tests/reporter.test.ts tests/cli.test.ts --reporter=verbose
```

Expected: PASS.

- [x] **Step 7: User-owned checkpoint**

Only run if the user asks for a commit:

```bash
git add packages/cli/src/reporter/modes.ts packages/cli/src/reporter/events.ts packages/cli/src/result.ts packages/cli/src/cli.ts packages/cli/tests/cli.test.ts packages/cli/tests/reporter.test.ts
git commit -m "feat(cli): add structured output modes"
```

---

### Task 6: AI Doorway Files And Commands

**Files:**
- Create: `packages/cli/src/ai/paths.ts`
- Create: `packages/cli/src/ai/context.ts`
- Create: `packages/cli/src/ai/doctor.ts`
- Create: `packages/cli/src/ai/prompt.ts`
- Create: `packages/cli/src/ai/history.ts`
- Create: `packages/cli/src/ai/summarize.ts`
- Create: `packages/cli/src/commands/ai.ts`
- Create: `packages/cli/tests/ai-doorway.test.ts`
- Modify: `packages/cli/src/cli.ts`
- Modify: `packages/cli/src/commands/metadata.ts`
- Modify: `packages/cli/src/commands/init-ai.ts`
- Modify: `packages/cli/tests/intelligence-commands.test.ts`

- [x] **Step 1: Add failing AI doorway tests**

Create `packages/cli/tests/ai-doorway.test.ts`:

```typescript
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { describe, expect, it } from 'vitest';

async function tempProject() {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-ai-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo', private: true }));
  await writeFile(join(cwd, 'vanrot.config.ts'), "export default { schemaVersion: 1, source: { root: 'src' }, devServer: { port: 1010 }, ai: { enabled: true, directory: '.vanrot/ai', history: true } };\n");
  await writeFile(join(cwd, 'src', 'home.page.ts'), 'export class HomePage {}\n');
  await writeFile(join(cwd, 'src', 'home.page.html'), '<main>{{ title() }}</main>\n');
  await writeFile(join(cwd, 'src', 'home.page.css'), 'main { display: block; }\n');
  return cwd;
}

describe('AI doorway', () => {
  it('initializes .vanrot/ai and gitignores it', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    const result = await runCli(['init-ai'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(await readFile(join(cwd, '.gitignore'), 'utf8')).toContain('.vanrot/ai/');
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'context.json'), 'utf8')).toContain('"schemaVersion": 1');
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'prompt.md'), 'utf8')).toContain('Vanrot project context');
  });

  it('writes deterministic context, doctor, and prompt files', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    expect((await runCli(['ai', 'context'], { cwd, reporter })).exitCode).toBe(0);
    expect((await runCli(['ai', 'doctor'], { cwd, reporter })).exitCode).toBe(0);
    expect((await runCli(['ai', 'prompt'], { cwd, reporter })).exitCode).toBe(0);

    expect(await readFile(join(cwd, '.vanrot', 'ai', 'context.json'), 'utf8')).toContain('"sourceRoot": "src"');
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'doctor.json'), 'utf8')).toContain('"findings"');
    expect(await readFile(join(cwd, '.vanrot', 'ai', 'prompt.md'), 'utf8')).toContain('Run `vr doctor` before changing files.');
  });

  it('records manual history and summarizes unresolved entries first', async () => {
    const cwd = await tempProject();
    const reporter = createMemoryReporter();

    expect((await runCli(['ai', 'record', '--code', 'VR_BUILD_FAILED', '--file', 'src/home.page.ts', '--message', 'build failed'], { cwd, reporter })).exitCode).toBe(0);
    expect((await runCli(['ai', 'summarize'], { cwd, reporter })).exitCode).toBe(0);

    const summary = await readFile(join(cwd, '.vanrot', 'ai', 'summary.md'), 'utf8');
    expect(summary).toContain('# Vanrot AI Summary');
    expect(summary).toContain('## Unresolved');
    expect(summary).toContain('VR_BUILD_FAILED');
    expect(summary).toContain('src/home.page.ts');
  });

  it('fails when AI is disabled in config', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'vanrot.config.ts'), "export default { ai: { enabled: false } };\n");
    const reporter = createMemoryReporter();

    const result = await runCli(['ai', 'context'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('error     Vanrot AI doorway is disabled');
    expect(reporter.output()).toContain('next      Enable ai.enabled in vanrot.config.ts.');
  });
});
```

- [x] **Step 2: Run AI tests and verify red**

Run:

```bash
cd packages/cli && pnpm test -- tests/ai-doorway.test.ts --reporter=verbose
```

Expected: FAIL because `ai` command and helper modules do not exist.

- [x] **Step 3: Add AI path helper**

Create `packages/cli/src/ai/paths.ts`:

```typescript
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const defaultAiDirectory = '.vanrot/ai';

export interface AiPaths {
  directory: string;
  context: string;
  doctor: string;
  prompt: string;
  history: string;
  summary: string;
}

export async function ensureAiDirectory(cwd: string, directory = defaultAiDirectory): Promise<AiPaths> {
  const root = join(cwd, directory);
  await mkdir(root, { recursive: true });

  return {
    directory: root,
    context: join(root, 'context.json'),
    doctor: join(root, 'doctor.json'),
    prompt: join(root, 'prompt.md'),
    history: join(root, 'history.jsonl'),
    summary: join(root, 'summary.md'),
  };
}
```

- [x] **Step 4: Add context, doctor, prompt, history, and summary helpers**

Create `packages/cli/src/ai/context.ts`:

```typescript
import { readFile, writeFile } from 'node:fs/promises';
import { buildProjectMap } from '../intelligence/project-map.js';
import { ensureAiDirectory } from './paths.js';

export async function writeAiContext(cwd: string): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const projectMap = await buildProjectMap(cwd, { now: () => new Date('2026-05-23T00:00:00.000Z') });
  const packageJson = JSON.parse(await readFile(`${cwd}/package.json`, 'utf8')) as unknown;
  const payload = {
    schemaVersion: 1,
    generatedAt: '2026-05-23T00:00:00.000Z',
    package: packageJson,
    projectMap,
  };

  await writeFile(paths.context, `${JSON.stringify(payload, null, 2)}\n`);
  return paths.context;
}
```

Create `packages/cli/src/ai/doctor.ts`:

```typescript
import { writeFile } from 'node:fs/promises';
import { runDoctorChecks } from '../doctor/checks.js';
import { ensureAiDirectory } from './paths.js';

export async function writeAiDoctor(cwd: string): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const findings = await runDoctorChecks(cwd);
  await writeFile(paths.doctor, `${JSON.stringify({ schemaVersion: 1, findings }, null, 2)}\n`);
  return paths.doctor;
}
```

Create `packages/cli/src/ai/prompt.ts`:

```typescript
import { writeFile } from 'node:fs/promises';
import { ensureAiDirectory } from './paths.js';

export async function writeAiPrompt(cwd: string): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const prompt = [
    '# Vanrot project context',
    '',
    'Run `vr doctor` before changing files.',
    'Follow AGENTS.md and keep role files separated.',
    'Use guard clauses, signals for state, scoped CSS, and centralized shared strings.',
    '',
  ].join('\n');

  await writeFile(paths.prompt, prompt);
  return paths.prompt;
}
```

Create `packages/cli/src/ai/history.ts`:

```typescript
import { appendFile } from 'node:fs/promises';
import { ensureAiDirectory } from './paths.js';

export interface AiHistoryRecord {
  id: string;
  status: 'unresolved' | 'resolved' | 'note';
  diagnostic: string;
  filePath?: string;
  message: string;
  createdAt: string;
}

export async function recordAiHistory(cwd: string, record: Omit<AiHistoryRecord, 'id' | 'createdAt'>): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const createdAt = new Date('2026-05-23T00:00:00.000Z').toISOString();
  const id = `${record.diagnostic}-${createdAt}`;
  await appendFile(paths.history, `${JSON.stringify({ id, createdAt, ...record })}\n`);
  return paths.history;
}
```

Create `packages/cli/src/ai/summarize.ts`:

```typescript
import { readFile, writeFile } from 'node:fs/promises';
import { ensureAiDirectory } from './paths.js';
import type { AiHistoryRecord } from './history.js';

export async function summarizeAiHistory(cwd: string): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const source = await readHistory(paths.history);
  const records = source
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AiHistoryRecord)
    .sort((left, right) => statusRank(left.status) - statusRank(right.status));
  const lines = ['# Vanrot AI Summary', '', '## Unresolved', ''];

  for (const record of records.filter((item) => item.status === 'unresolved')) {
    lines.push(`- ${record.diagnostic}${record.filePath === undefined ? '' : ` ${record.filePath}`}: ${record.message}`);
  }

  lines.push('', '## Resolved And Notes', '');

  for (const record of records.filter((item) => item.status !== 'unresolved')) {
    lines.push(`- ${record.diagnostic}: ${record.message}`);
  }

  await writeFile(paths.summary, `${lines.join('\n')}\n`);
  return paths.summary;
}

async function readHistory(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}

function statusRank(status: AiHistoryRecord['status']): number {
  if (status === 'unresolved') {
    return 0;
  }

  if (status === 'resolved') {
    return 1;
  }

  return 2;
}
```

- [x] **Step 5: Add AI command**

Create `packages/cli/src/commands/ai.ts`:

```typescript
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadVanrotProjectConfig } from '@vanrot/config';
import { writeAiContext } from '../ai/context.js';
import { writeAiDoctor } from '../ai/doctor.js';
import { recordAiHistory } from '../ai/history.js';
import { writeAiPrompt } from '../ai/prompt.js';
import { summarizeAiHistory } from '../ai/summarize.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function aiCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  const disabled = await isAiDisabled(context.cwd);

  if (disabled) {
    context.reporter.error('Vanrot AI doorway is disabled', 'VR_AI_DISABLED');
    context.reporter.nextSteps(['Enable ai.enabled in vanrot.config.ts.']);
    return fail();
  }

  const action = args[0];

  if (action === 'context') {
    context.reporter.success('wrote AI context', await writeAiContext(context.cwd));
    return ok();
  }

  if (action === 'doctor') {
    context.reporter.success('wrote AI doctor report', await writeAiDoctor(context.cwd));
    return ok();
  }

  if (action === 'prompt') {
    context.reporter.success('wrote AI prompt', await writeAiPrompt(context.cwd));
    return ok();
  }

  if (action === 'record') {
    const code = valueAfter(args, '--code') ?? 'VR_MANUAL_NOTE';
    const filePath = valueAfter(args, '--file');
    const message = valueAfter(args, '--message') ?? 'manual note';
    context.reporter.success('wrote AI history', await recordAiHistory(context.cwd, {
      status: 'unresolved',
      diagnostic: code,
      filePath,
      message,
    }));
    return ok();
  }

  if (action === 'summarize') {
    context.reporter.success('wrote AI summary', await summarizeAiHistory(context.cwd));
    return ok();
  }

  context.reporter.error('Usage: vr ai <context|doctor|prompt|record|summarize>');
  return fail();
}

export async function gitignoreAiDirectory(cwd: string): Promise<void> {
  const gitignore = join(cwd, '.gitignore');
  const entry = '.vanrot/ai/';
  let source = '';

  try {
    source = await readFile(gitignore, 'utf8');
  } catch {
    source = '';
  }

  if (source.split('\n').includes(entry)) {
    return;
  }

  await writeFile(gitignore, `${source}${source.endsWith('\n') || source.length === 0 ? '' : '\n'}${entry}\n`);
}

async function isAiDisabled(cwd: string): Promise<boolean> {
  const loaded = await loadVanrotProjectConfig(cwd);
  const config = loaded.config as { ai?: { enabled?: boolean } };
  return config.ai?.enabled === false;
}

function valueAfter(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}
```

- [x] **Step 6: Wire `vr ai` and upgrade `init-ai`**

In `packages/cli/src/commands/metadata.ts`, add `ai: 'ai'` to `commandName`, add a metadata entry:

```typescript
{
  name: commandName.ai,
  usage: commandInvocation(commandName.ai),
  rootUsage: 'ai <action>',
  description: 'Write AI-readable project context',
  help: `vr ai context
vr ai doctor
vr ai prompt
vr ai record --code <code> --message <message>
vr ai summarize`,
},
```

Add `commandName.ai` to the Maintenance command group after `commandName.initAi`.

In `packages/cli/src/cli.ts`, import and register the command:

```typescript
import { aiCommand } from './commands/ai.js';
```

```typescript
[commandName.ai, aiCommand],
```

In `packages/cli/src/commands/init-ai.ts`, replace the success path with:

```typescript
const rulesPath = await writeVanrotFile(context.cwd, 'ai-rules.md', createAiRules());
const contextPath = await writeAiContext(context.cwd);
const promptPath = await writeAiPrompt(context.cwd);
const doctorPath = await writeAiDoctor(context.cwd);
await gitignoreAiDirectory(context.cwd);

context.reporter.heading('Vanrot AI Rules');
context.reporter.success('wrote AI rules', rulesPath);
context.reporter.success('wrote AI context', contextPath);
context.reporter.success('wrote AI prompt', promptPath);
context.reporter.success('wrote AI doctor report', doctorPath);
return ok();
```

Add imports:

```typescript
import { writeAiContext } from '../ai/context.js';
import { writeAiDoctor } from '../ai/doctor.js';
import { writeAiPrompt } from '../ai/prompt.js';
import { gitignoreAiDirectory } from './ai.js';
```

- [x] **Step 7: Run AI focused tests**

Run:

```bash
cd packages/cli && pnpm test -- tests/ai-doorway.test.ts tests/intelligence-commands.test.ts --reporter=verbose
```

Expected: PASS.

- [x] **Step 8: User-owned checkpoint**

Only run if the user asks for a commit:

```bash
git add packages/cli/src/ai packages/cli/src/commands/ai.ts packages/cli/src/commands/init-ai.ts packages/cli/src/commands/metadata.ts packages/cli/src/cli.ts packages/cli/tests/ai-doorway.test.ts packages/cli/tests/intelligence-commands.test.ts
git commit -m "feat(cli): add local AI doorway"
```

---

### Task 7: Phase 14 Documentation And Final Verification

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-14.md`

- [x] **Step 1: Run full package and repo verification before docs completion**

Run:

```bash
pnpm --filter @vanrot/cli test
pnpm verify
```

Expected: both PASS.

- [x] **Step 2: Update `feature-maturity.md`**

In `docs/superpowers/feature-maturity.md`:

- Tick Phase 14 in the Production Roadmap Checklist.
- Update CLI rows owned by Phase 14 from `Demo-Capable` or `Planned` to `Production-Ready` only for completed scope:
  - beautiful CLI UX / terminal experience
  - root help
  - reporter output modes
  - diagnostic display
  - local AI doorway
- Keep unrelated CLI rows pending if not implemented in this phase.

- [x] **Step 3: Update `final-tdd-inventory.md`**

Add or update rows under `@vanrot/cli` for:

```markdown
| renderer | aligned status labels | Production-Ready | Covers success/info/warning/error/next spacing, no-color memory output, and console color boundaries. | Phase 14 | Memory reporter stays deterministic for tests. |
| renderer | structured output modes | Production-Ready | Covers `--quiet`, `--verbose`, `--json`, `--jsonl`, conflicts, and unsupported command failures. | Phase 14 | Supported read commands emit deterministic result events. |
| diagnostics | CLI diagnostic catalog | Production-Ready | Covers stable CLI diagnostic codes, messages, and actionable next steps. | Phase 14 | Catalog starts with `VR_UNKNOWN_COMMAND`, JSON mode, doctor, build, test, and AI codes. |
| AI doorway | `.vanrot/ai` files | Production-Ready | Covers context, doctor, prompt, history, summary, gitignore insertion, disabled config, and deterministic summarize output. | Phase 14 | No external AI model required. |
```

- [x] **Step 4: Update presentation roadmap**

In `docs/vanrot-presentation.html`:

- Mark the Phase 14 roadmap card as `done`.
- Mark the Phase 15 roadmap card as the next active phase.
- Ensure the roadmap wording matches `docs/superpowers/feature-maturity.md`.

- [x] **Step 5: Mark this plan complete**

Change all checked-off implementation steps in `docs/superpowers/plans/Phase-14.md` only after the corresponding execution and verification has actually passed.

- [x] **Step 6: Run phase documentation guardrail**

Run:

```bash
pnpm verify:phase-docs
```

Expected:

```text
Phase documentation verification passed.
```

- [x] **Step 7: Run final verification**

Run:

```bash
pnpm verify
```

Expected: PASS.

- [x] **Step 8: User-owned checkpoint**

Only run if the user asks for a commit:

```bash
git add docs/superpowers/feature-maturity.md docs/superpowers/final-tdd-inventory.md docs/vanrot-presentation.html docs/superpowers/plans/Phase-14.md
git commit -m "docs: mark Phase 14 complete"
```

---

## Self-Review

- Spec coverage:
  - CLI identity and output language: Tasks 1, 2, 3, and 5.
  - Structured output modes: Task 5.
  - Interactive prompt foundations: Task 5 establishes `interactive` and `--no-interactive`; dangerous prompt ordering remains limited because current Phase 14 UI enhancement marks prompts out of scope.
  - Help experience: Tasks 1 and 3.
  - AI doorway: Task 6.
  - Diagnostics: Task 4.
  - Architecture boundaries: File Structure plus Tasks 4, 5, and 6.
  - Testing requirements: Every task starts with focused red tests and ends with focused verification; Task 7 runs repo verification.
- Placeholder scan:
  - No placeholder markers or unspecified generic test-writing steps remain.
  - Steps that change code include concrete code blocks.
- Type consistency:
  - `OutputMode`, `ParsedOutputMode`, `CliEvent`, `CliDiagnosticMetadata`, and command metadata names stay consistent across tasks.
  - `commandName.ai` is introduced before command registration.
  - AI helper names match command imports.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/Phase-14.md`. Two execution options:

1. Inline Execution - Execute tasks in this session using `superpowers:executing-plans`, with checkpoints after each task. This is the required option for Vanrot because AGENTS.md disables subagents.
2. Manual Execution - The user executes the checklist and asks for targeted help on failing steps.
