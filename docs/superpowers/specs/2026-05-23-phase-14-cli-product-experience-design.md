# Phase 14 Design: CLI Product Experience

Date: 2026-05-23  
Phase: 14  
Status: Proposed (approved in brainstorming conversation, pending implementation planning)

## 1. Purpose

Phase 14 turns `@vanrot/cli` from a set of useful commands into a coherent product surface.

The command vocabulary stays conventional so Vanrot remains easy to learn. The signature experience comes from guided output, semantic color, interactive prompts, stable diagnostics, structured events, and a local AI doorway that helps humans and coding agents understand failures.

This phase must deliver:

- Conventional command names and conventional status labels.
- A unified CLI renderer shared by every command.
- Guided colored output with quiet, verbose, JSON, and JSONL modes where relevant.
- Interactive prompts with restrained choice design.
- Stable CLI diagnostic codes for errors and actionable warnings.
- Local AI doorway files under `.vanrot/ai/`, gitignored by default.
- Lightweight module boundaries without framework-style bloat.

## 2. CLI Identity

Vanrot keeps familiar commands:

```txt
vr create
vr generate
vr add
vr dev
vr build
vr test
vr doctor
vr config
vr metadata
vr map
vr init-ai
vr ai
```

Command names should favor conventional framework expectations over clever naming. The CLI should feel designed through output behavior, not unusual verbs.

## 3. Output Language

Default human output is guided, colored, and readable.

Canonical labels:

```txt
success
info
warning
error
next
```

Color semantics:

- `success`: green.
- `info`: muted blue or cyan.
- `warning`: amber.
- `error`: red or vermilion.
- `next`: green.
- Commands: accent color.
- File paths: muted readable text.

Example:

```txt
error    vanrot.config.ts not found

Vanrot needs a config file to resolve source paths, role suffixes, and generated file conventions.

next     run vr config recover
```

Output rules:

- Guided explanations are the default.
- Recoverable errors show one precise next action.
- Active tasks may use subtle animation in interactive terminals.
- Completed output is still.
- `--quiet` shows only essential output.
- `--verbose` shows diagnostic codes, timings, resolved config, and stack traces when relevant.
- Color is automatic by default.
- `--no-color` disables color.
- `NO_COLOR=1` disables color.
- `FORCE_COLOR=1` forces color.
- CI and non-TTY output disable color and animation unless explicitly forced.

## 4. Structured Output Modes

Structured output exists for commands where machines or AI tools benefit from it. It is not a universal feature.

Modes:

```txt
--json   pretty final JSON object
--jsonl  compact newline-delimited JSON events
```

Rules:

- `--json` disables color, animation, and prompts.
- `--json` writes pretty JSON.
- `--jsonl` disables color, animation, and prompts.
- `--jsonl` writes compact one-event-per-line output.
- `--json` and `--jsonl` are mutually exclusive.
- Unsupported structured flags fail strictly with a guided error.

Supported commands:

| Command | `--json` | `--jsonl` | Purpose |
| --- | --- | --- | --- |
| `vr doctor` | yes | no | Project health report. |
| `vr build` | yes | yes | Final build result and progress stream. |
| `vr test` | yes | yes | Final test result and progress stream. |
| `vr dev` | no | yes | Long-running server events. |
| `vr metadata` | yes | no | Framework metadata. |
| `vr map` | yes | no | Project structure. |
| `vr config validate` | yes | no | Config validation report. |
| `vr config migrate` | yes | no | Migration result. |
| `vr config recover` | yes | no | Recovery result. |

Unsupported by default:

```txt
vr create
vr generate
vr add
vr init-ai
```

These commands are human-facing write flows and should prioritize prompts, descriptions, and safe choices.

Unsupported flag example:

```txt
error    --json is not supported for vr generate

Vanrot generation is an interactive file-writing workflow.

next     run vr generate component home
```

## 5. Interactive Prompts

Prompts are enabled by default in interactive terminals.

Rules:

- Use 2-3 choices by default.
- Never show a single-choice prompt.
- Put the recommended option first.
- Each option has a short label and one-line description.
- Avoid long menus.
- Avoid vague labels.
- `--yes` accepts safe defaults.
- `--no-interactive` disables prompts.
- CI and non-TTY execution disable prompts.

Example conflict prompt:

```txt
? home.component.ts already exists.
> Keep existing     Leave the file untouched
  Overwrite file    Replace it with generated output
  Create copy       Write home-2.component.ts
```

Dangerous action pattern:

```txt
? This will overwrite 3 files.
> Show diff first   Review changes before writing
  Overwrite files   Replace existing files now
  Cancel            Leave project unchanged
```

Dangerous prompts must always offer review first, action second, and cancel third.

## 6. Help Experience

Phase 14 includes a root help redesign.

Root help should be human-first and should not read like a JSON API manual.

Shape:

```txt
Vanrot CLI

Usage
  vr <command> [options]

Common
  vr create my-app                 Create a Vanrot app
  vr dev                           Start dev server
  vr build                         Build for production
  vr doctor                        Check project health

Generate
  vr generate component home       Create component role files
  vr generate page dashboard       Create page role files
  vr add button                    Add UI assets or features

Configure
  vr config validate               Validate config
  vr config recover                Recover missing config fields

AI
  vr init-ai                       Create AI consumption files
  vr ai context                    Write AI-readable project context

Examples
  vr create my-app
  vr generate component home
  vr add button
  vr doctor
  vr build --verbose

Options
  --quiet                          Show essential output only
  --verbose                        Show diagnostic detail
  --no-color                       Disable color
  --no-interactive                 Disable prompts
```

Root help rules:

- Group by user intent.
- Show common commands first.
- Include practical examples at root level.
- Keep examples to about five.
- Keep JSON flags in command-specific help unless the command is primarily for machine output.

## 7. AI Doorway

Phase 14 adds a local AI doorway under:

```txt
.vanrot/ai/
```

The directory is gitignored by default and controlled by `vanrot.config.ts`.

Config shape:

```ts
export default defineVanrotConfig({
  ai: {
    enabled: true,
    directory: ".vanrot/ai",
    history: true,
  },
});
```

Commands:

```txt
vr init-ai
vr ai context
vr ai doctor
vr ai prompt
vr ai record
vr ai summarize
```

Files:

```txt
.vanrot/ai/context.json
.vanrot/ai/doctor.json
.vanrot/ai/prompt.md
.vanrot/ai/history.jsonl
.vanrot/ai/summary.md
```

Responsibilities:

- `context.json`: current project structure, config, package, route, component, and command snapshot.
- `doctor.json`: machine-readable health report.
- `prompt.md`: concise paste-ready prompt for Codex, Claude, or another coding agent.
- `history.jsonl`: local append-only error memory.
- `summary.md`: deterministic offline summary of errors, fix notes, and current unresolved issues.

History rules:

- Auto-record errors only.
- Do not record successful normal commands.
- Manual notes are allowed through `vr ai record`.
- Never store secrets.
- Store file paths and diagnostic codes, not full source files.
- Do not record dev-server heartbeat noise.
- When a later command proves an error is fixed, mark the prior error resolved.
- Keep the resolved record with cause, effect, fix, and verification command.

Example resolved record:

```json
{
  "id": "VR_CONFIG_NOT_FOUND-2026-05-23T10:20:00.000Z",
  "status": "resolved",
  "command": "vr build",
  "diagnostic": "VR_CONFIG_NOT_FOUND",
  "cause": "vanrot.config.ts was missing",
  "effect": "build could not resolve source paths and generated file conventions",
  "fix": "created config with vr config recover",
  "verifiedBy": "vr build",
  "resolvedAt": "2026-05-23T10:31:00.000Z"
}
```

`vr ai summarize` must not require an AI model. It deterministically reads `history.jsonl`, groups entries by diagnostic code and file, keeps unresolved errors first, keeps resolved cause/effect memory, and writes `summary.md`.

## 8. Diagnostics

Every blocking CLI error and every actionable warning has a stable diagnostic ID.

Examples:

```txt
VR_CONFIG_NOT_FOUND
VR_CONFIG_INVALID
VR_CONFIG_DEFAULT_PATHS
VR_FILE_EXISTS
VR_GENERATOR_UNSUPPORTED_ROLE
VR_BUILD_FAILED
VR_TEST_FAILED
VR_AI_DISABLED
VR_JSON_UNSUPPORTED
VR_COMMAND_NON_INTERACTIVE
VR_PROMPT_CANCELLED
```

Human default output may omit the ID to stay clean.

Verbose output includes the ID:

```txt
error    vanrot.config.ts not found
code     VR_CONFIG_NOT_FOUND
```

JSON output always includes the ID.

Diagnostics should live in a lightweight shared catalog. Use plain objects and functions only.

## 9. Architecture

Phase 14 should add clear module boundaries without framework-style bloat.

Proposed structure:

```txt
packages/cli/src/renderer/
  renderer.ts
  labels.ts
  colors.ts
  prompts.ts
  animation.ts
  events.ts
  modes.ts

packages/cli/src/diagnostics/
  catalog.ts

packages/cli/src/ai/
  context.ts
  doctor.ts
  prompt.ts
  history.ts
  summarize.ts

packages/cli/src/commands/
  ai.ts
```

Rules:

- Use plain objects and functions.
- Do not add decorators.
- Do not add dependency injection.
- Do not add a generated diagnostic framework.
- Do not add a giant registry.
- Every command emits structured events.
- The renderer turns events into human output, quiet output, verbose output, JSON, or JSONL.

## 10. Testing Requirements

Phase 14 must include focused tests for:

- Renderer labels, colors, spacing, and no-color behavior.
- Quiet and verbose output modes.
- JSON and JSONL output for supported commands.
- Strict failure for unsupported JSON flags.
- Prompt choice rendering and dangerous-action ordering.
- Non-interactive and CI behavior.
- Diagnostic catalog stability.
- AI directory creation, gitignore insertion, and config disable behavior.
- Error-only history append behavior.
- Resolved-error lifecycle.
- Deterministic `vr ai summarize` output.
- Root help grouping and examples.

## 11. Presentation Language

Future presentations for this work should use the saved Vanrot presentation design language:

```txt
docs/superpowers/presentation-design-language.md
```

The visual companion mockup created during brainstorming is:

```txt
.superpowers/brainstorm/35145-1779472923/content/phase-14-cli-presentation.html
```

---

# CLI UI Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `vr --help` to a grouped, 30ch-aligned help screen and fix the reporter label/alignment system to match the canonical `success / info / warning / error / next` spec.

**Architecture:** Three coordinated changes — (1) metadata gains `description` + `commandGroups`, (2) both `MemoryReporter` and `ConsoleReporter` get proper fixed-width label alignment and chalk colors, (3) `cli.ts` builds root help from the new metadata instead of a hardcoded string.

**Tech Stack:** TypeScript, Vitest, chalk (to be installed), Node.js ESM (`"type": "module"`)

---

## File Map

| File | Change |
|------|--------|
| `packages/cli/package.json` | Add `chalk` dependency |
| `packages/cli/src/commands/metadata.ts` | Add `description` field + `commandGroups` |
| `packages/cli/src/reporter/reporter.ts` | Fix label padding, warning format, nextSteps format; add chalk colors to console reporter |
| `packages/cli/src/cli.ts` | Replace hardcoded `rootHelp` with grouped, 30ch-aligned output |
| `packages/cli/tests/reporter.test.ts` | Update assertions to match new label format |
| `packages/cli/tests/cli.test.ts` | Update root-help assertions to match new output |

---

## Task 1: Add `description` and `commandGroups` to metadata

**Files:**
- Modify: `packages/cli/src/commands/metadata.ts`

- [ ] **Step 1: Write failing test**

Add a new test block at the bottom of `packages/cli/tests/cli.test.ts`:

```typescript
it('metadata has descriptions for all commands', () => {
  const { cliCommands } = await import('../src/commands/metadata.js');
  for (const cmd of cliCommands) {
    expect(cmd.description, `${cmd.name} missing description`).toBeTruthy();
  }
});
```

Wait — the import must be static or wrapped. Add this as a separate describe block in `packages/cli/tests/cli.test.ts`:

```typescript
import {
  cliCommands,
  commandGroups,
} from '../src/commands/metadata.js';

// inside describe('runCli', ...) or as its own describe block:
it('every command has a description', () => {
  for (const cmd of cliCommands) {
    expect(cmd.description, `${cmd.name} is missing a description`).toBeTruthy();
  }
});

it('commandGroups covers every command name', () => {
  const allGrouped = commandGroups.flatMap((g) => g.commands);
  const allNames = cliCommands.map((c) => c.name);
  for (const name of allNames) {
    expect(allGrouped).toContain(name);
  }
});
```

Add the import line at the top of `packages/cli/tests/cli.test.ts` alongside existing imports:
```typescript
import { cliCommands, commandGroups } from '../src/commands/metadata.js';
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/cli && pnpm test -- --reporter=verbose 2>&1 | grep -E "FAIL|PASS|every command|commandGroups"
```

Expected: both new tests FAIL — `description` field doesn't exist, `commandGroups` not exported.

- [ ] **Step 3: Add `description` to `CliCommandMetadata` and populate all commands**

Replace the contents of `packages/cli/src/commands/metadata.ts` entirely:

```typescript
export const commandName = {
  create: 'create',
  generate: 'generate',
  add: 'add',
  config: 'config',
  doctor: 'doctor',
  map: 'map',
  initAi: 'init-ai',
  dev: 'dev',
  build: 'build',
  test: 'test',
} as const;

export const commandAlias = {
  generate: 'g',
} as const;

export type CommandName = (typeof commandName)[keyof typeof commandName];

export interface CliCommandMetadata {
  name: CommandName;
  description: string;
  usage: string;
  secondaryUsages?: readonly string[];
  help: string;
}

export const cliCommands: readonly CliCommandMetadata[] = [
  {
    name: commandName.create,
    description: 'Create a new Vanrot project',
    usage: 'vr create <name>',
    help: `vr create <name>

Options
  --workspace   Use workspace dependencies for repository fixtures
  --force       Overwrite an existing target directory`,
  },
  {
    name: commandName.generate,
    description: 'Generate a component or page',
    usage: 'vr generate component <name>',
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
    description: 'Add a UI primitive to the project',
    usage: 'vr add button',
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
    description: 'Validate, migrate, or recover config',
    usage: 'vr config migrate',
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
    description: 'Check project health and config',
    usage: commandInvocation(commandName.doctor),
    help: commandInvocation(commandName.doctor),
  },
  {
    name: commandName.map,
    description: 'Print the project structure map',
    usage: commandInvocation(commandName.map),
    help: commandInvocation(commandName.map),
  },
  {
    name: commandName.initAi,
    description: 'Set up AI context rules for this project',
    usage: commandInvocation(commandName.initAi),
    help: commandInvocation(commandName.initAi),
  },
  {
    name: commandName.dev,
    description: 'Start dev server with HMR',
    usage: commandInvocation(commandName.dev),
    help: commandInvocation(commandName.dev),
  },
  {
    name: commandName.build,
    description: 'Compile and bundle for production',
    usage: commandInvocation(commandName.build),
    help: commandInvocation(commandName.build),
  },
  {
    name: commandName.test,
    description: 'Run the test suite',
    usage: commandInvocation(commandName.test),
    help: commandInvocation(commandName.test),
  },
] as const;

export const commandGroups = [
  {
    label: 'Scaffold',
    commands: [commandName.create, commandName.generate, commandName.add] as const,
    examples: 'vr create my-app  ·  vr generate component header  ·  vr add button',
  },
  {
    label: 'Development',
    commands: [commandName.dev, commandName.build, commandName.test] as const,
    examples: undefined,
  },
  {
    label: 'Maintenance',
    commands: [commandName.doctor, commandName.config, commandName.map, commandName.initAi] as const,
    examples: undefined,
  },
] as const;

export const starterScriptCommands = [
  commandName.dev,
  commandName.build,
  commandName.test,
  commandName.doctor,
] as const;

export const rootCommandUsages = cliCommands.flatMap((command) => [
  command.usage,
  ...(command.secondaryUsages ?? []),
]);

export function commandInvocation(command: CommandName): string {
  return `vr ${command}`;
}

export function commandUsage(command: CommandName): string {
  return commandUsages(command)[0] ?? commandInvocation(command);
}

export function commandUsages(command: CommandName): readonly string[] {
  const metadata = cliCommands.find((item) => item.name === command);

  if (metadata === undefined) {
    return [commandInvocation(command)];
  }

  return [metadata.usage, ...(metadata.secondaryUsages ?? [])];
}

export function createStarterScripts(): Record<string, string> {
  return Object.fromEntries(
    starterScriptCommands.map((command) => [command, commandInvocation(command)]),
  );
}
```

- [ ] **Step 4: Run tests to confirm new tests pass**

```bash
cd packages/cli && pnpm test -- --reporter=verbose 2>&1 | grep -E "FAIL|PASS|every command|commandGroups"
```

Expected: both new tests PASS. All existing tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/commands/metadata.ts packages/cli/tests/cli.test.ts
git commit -m "feat(cli): add description and commandGroups to command metadata"
```

---

## Task 2: Fix MemoryReporter label format and update reporter tests

**Files:**
- Modify: `packages/cli/src/reporter/reporter.ts`
- Modify: `packages/cli/tests/reporter.test.ts`

The MemoryReporter must produce consistent, aligned plain-text output (no ANSI codes). This is the format used in tests and assertions.

Label system: every label is padded to 8 characters with `padEnd(8)`, then followed by two spaces before content.

```
success   content    (s-u-c-c-e-s-s = 7 + 1 pad = 8, + 2 spaces)
info      content    (i-n-f-o = 4 + 4 pad = 8, + 2 spaces)
warning   content    (w-a-r-n-i-n-g = 7 + 1 pad = 8, + 2 spaces)
error     content    (e-r-r-o-r = 5 + 3 pad = 8, + 2 spaces)
next      content    (n-e-x-t = 4 + 4 pad = 8, + 2 spaces)
```

Body continuation (indented detail) aligns to content column (10 spaces):
```
warning   src/app.component.ts
          Raw user-facing text found in template.
```

- [ ] **Step 1: Update reporter.test.ts to assert new format**

Replace the contents of `packages/cli/tests/reporter.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('createMemoryReporter', () => {
  it('pads all labels to 8 chars with 2-space gutter', () => {
    const reporter = createMemoryReporter();
    reporter.success('vanrot.config.ts found');
    const out = reporter.output();
    expect(out).toContain('success   vanrot.config.ts found');
  });

  it('formats warning as label + path on one line, detail indented on next', () => {
    const reporter = createMemoryReporter();
    reporter.warning('src/app.component.ts', 'Raw user-facing text found in template.');
    const out = reporter.output();
    expect(out).toContain('warning   src/app.component.ts');
    expect(out).toContain('          Raw user-facing text found in template.');
  });

  it('formats error as label + message, optional detail indented', () => {
    const reporter = createMemoryReporter();
    reporter.error('vanrot.config.ts not found', 'Run vr config recover to restore it.');
    const out = reporter.output();
    expect(out).toContain('error     vanrot.config.ts not found');
    expect(out).toContain('          Run vr config recover to restore it.');
  });

  it('formats nextSteps with next label, no header, no > prefix', () => {
    const reporter = createMemoryReporter();
    reporter.nextSteps(['Replace visible text with an i18n key.', 'Move early return up.']);
    const out = reporter.output();
    expect(out).toContain('next      Replace visible text with an i18n key.');
    expect(out).toContain('next      Move early return up.');
    expect(out).not.toContain('Next');
    expect(out).not.toContain('> Replace');
  });

  it('skips nextSteps output when steps array is empty', () => {
    const reporter = createMemoryReporter();
    reporter.nextSteps([]);
    expect(reporter.output()).toBe('');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd packages/cli && pnpm test -- tests/reporter.test.ts --reporter=verbose 2>&1 | grep -E "FAIL|PASS|✓|×"
```

Expected: all new assertions FAIL.

- [ ] **Step 3: Rewrite `createMemoryReporter` in reporter.ts**

Replace `createMemoryReporter` (lines 14–60) in `packages/cli/src/reporter/reporter.ts` with:

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
      if (detail !== undefined) {
        lines.push(`${INDENT}${detail}`);
      }
    },
    warning(filePath, message) {
      lines.push(labelLine('warning', filePath));
      lines.push(`${INDENT}${message}`);
    },
    error(message, detail) {
      lines.push(labelLine('error', message));
      if (detail !== undefined) {
        lines.push(`${INDENT}${detail}`);
      }
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

Also add the `LABEL_WIDTH` and `INDENT` constants and `labelLine` helper before `createMemoryReporter`. They will be reused by `createConsoleReporter` in Task 3.

- [ ] **Step 4: Run tests to confirm reporter tests pass**

```bash
cd packages/cli && pnpm test -- tests/reporter.test.ts --reporter=verbose 2>&1 | grep -E "FAIL|PASS|✓|×"
```

Expected: all 5 reporter tests PASS.

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
cd packages/cli && pnpm test 2>&1 | tail -20
```

Expected: all tests pass. If any test fails due to changed output format (e.g., doctor.test.ts asserting old `'> '` prefix), fix those assertions to match the new label format.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/reporter/reporter.ts packages/cli/tests/reporter.test.ts
git commit -m "fix(reporter): align labels to 8-char fixed-width column, fix warning and nextSteps format"
```

---

## Task 3: Add chalk colors to ConsoleReporter

**Files:**
- Modify: `packages/cli/package.json` (add chalk)
- Modify: `packages/cli/src/reporter/reporter.ts` (color createConsoleReporter)

Colors only apply to `createConsoleReporter`. `createMemoryReporter` stays plain text.

- [ ] **Step 1: Install chalk**

```bash
pnpm --filter @vanrot/cli add chalk
```

Verify it appears in `packages/cli/package.json` under `dependencies`.

- [ ] **Step 2: Update `createConsoleReporter` to use chalk colors**

Add the chalk import at the top of `packages/cli/src/reporter/reporter.ts`:

```typescript
import chalk from 'chalk';
```

Replace `createConsoleReporter` (lines 62–103 after Task 2 edits) with:

```typescript
export function createConsoleReporter(): Reporter {
  const success = chalk.hex('#3fb950');
  const info = chalk.hex('#58a6ff');
  const warning = chalk.hex('#d29922');
  const error = chalk.hex('#f85149');
  const next = chalk.hex('#3fb950');
  const dim = chalk.dim;

  function colorLabelLine(colorFn: chalk.Chalk, label: string, content: string): string {
    return `${colorFn(label.padEnd(LABEL_WIDTH))}  ${content}`;
  }

  return {
    line(text = '') {
      console.log(text);
    },
    heading(title, meta) {
      console.log(meta === undefined ? title : `${title}  ${meta}`);
      console.log('');
    },
    success(label, detail) {
      console.log(colorLabelLine(success, 'success', label));
      if (detail !== undefined) {
        console.log(`${INDENT}${detail}`);
      }
    },
    warning(filePath, message) {
      console.log(colorLabelLine(warning, 'warning', filePath));
      console.log(`${INDENT}${message}`);
    },
    error(message, detail) {
      console.error(colorLabelLine(error, 'error', message));
      if (detail !== undefined) {
        console.error(`${INDENT}${detail}`);
      }
    },
    nextSteps(steps) {
      if (steps.length === 0) {
        return;
      }
      for (const step of steps) {
        console.log(colorLabelLine(next, 'next', step));
      }
    },
  };
}
```

Note: `info` and `dim` are declared but not used by the current `Reporter` interface. Remove unused declarations — YAGNI.

- [ ] **Step 3: Run full test suite to confirm no regressions**

```bash
cd packages/cli && pnpm test 2>&1 | tail -20
```

Expected: all tests pass. (Tests use `createMemoryReporter`, not `createConsoleReporter`, so chalk import doesn't affect test output.)

- [ ] **Step 4: Commit**

```bash
git add packages/cli/package.json packages/cli/src/reporter/reporter.ts
git commit -m "feat(reporter): add chalk colors to console reporter (success/warning/error/next)"
```

---

## Task 4: Redesign root help in `cli.ts`

**Files:**
- Modify: `packages/cli/src/cli.ts`
- Modify: `packages/cli/tests/cli.test.ts`

The root help replaces the hardcoded string with:
1. VANROT ASCII banner (static Unicode box-drawing art)
2. Tagline
3. Usage line
4. Grouped command rows: command usage (no `vr` prefix) in 30ch column, description right of it
5. Examples line under Scaffold group
6. Footer

The command column uses `usage.replace(/^vr /, '')` to strip the `vr ` prefix — shows just `create <name>`, `generate <role> <name>`, etc.

- [ ] **Step 1: Update cli.test.ts root-help assertions to match new output**

Find the `'prints root help'` test in `packages/cli/tests/cli.test.ts` and replace its assertions:

```typescript
it('prints root help', async () => {
  const reporter = createMemoryReporter();
  const result = await runCli(['--help'], {
    cwd: process.cwd(),
    reporter,
  });

  expect(result.exitCode).toBe(0);
  const out = reporter.output();
  // ASCII banner
  expect(out).toContain('██╗   ██╗ █████╗');
  // Tagline
  expect(out).toContain('A component framework for disciplined Angular teams.');
  // Group headers
  expect(out).toContain('SCAFFOLD');
  expect(out).toContain('DEVELOPMENT');
  expect(out).toContain('MAINTENANCE');
  // Command rows (no vr prefix in column)
  expect(out).toContain('create <name>');
  expect(out).toContain('generate <role> <name>');
  expect(out).toContain('Create a new Vanrot project');
  expect(out).toContain('Generate a component or page');
  expect(out).toContain('Start dev server with HMR');
  expect(out).toContain('Check project health and config');
  // Examples
  expect(out).toContain('vr create my-app');
  // Footer
  expect(out).toContain('vr <command> --help');
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd packages/cli && pnpm test -- tests/cli.test.ts --reporter=verbose 2>&1 | grep -E "prints root help|FAIL|PASS"
```

Expected: `prints root help` FAILS — output still contains `'Vanrot CLI'` not `'SCAFFOLD'`.

- [ ] **Step 3: Replace `rootHelp` in `cli.ts` with the new builder**

Update `packages/cli/src/cli.ts`. Add new imports at the top:

```typescript
import {
  cliCommands,
  commandAlias,
  commandGroups,
  commandInvocation,
  commandName,
} from './commands/metadata.js';
```

Remove `rootCommandUsages` from the import (no longer used).

Replace the `rootHelp` constant and the `context.reporter.line(rootHelp)` call with the full updated file:

```typescript
import { addCommand } from './commands/add.js';
import { buildCommand } from './commands/build.js';
import { configCommand } from './commands/config.js';
import { createCommand } from './commands/create.js';
import { devCommand } from './commands/dev.js';
import { doctorCommand } from './commands/doctor.js';
import { generateCommand } from './commands/generate.js';
import { initAiCommand } from './commands/init-ai.js';
import { mapCommand } from './commands/map.js';
import {
  cliCommands,
  commandAlias,
  commandGroups,
  commandInvocation,
  commandName,
} from './commands/metadata.js';
import { testCommand } from './commands/test.js';
import type { CommandContext, CommandResult } from './result.js';
import { fail, ok } from './result.js';

type CommandHandler = (args: string[], context: CommandContext) => Promise<CommandResult>;

const commandHandlers = new Map<string, CommandHandler>([
  [commandName.create, createCommand],
  [commandName.generate, generateCommand],
  [commandAlias.generate, generateCommand],
  [commandName.add, addCommand],
  [commandName.config, configCommand],
  [commandName.doctor, doctorCommand],
  [commandName.map, mapCommand],
  [commandName.initAi, initAiCommand],
  [commandName.dev, devCommand],
  [commandName.build, buildCommand],
  [commandName.test, testCommand],
]);

const commandHelp = new Map<string, string>(
  cliCommands.map((command) => [command.name, command.help]),
);

const VANROT_BANNER = `\
██╗   ██╗ █████╗ ███╗   ██╗██████╗  ██████╗ ████████╗
██║   ██║██╔══██╗████╗  ██║██╔══██╗██╔═══██╗╚══██╔══╝
██║   ██║███████║██╔██╗ ██║██████╔╝██║   ██║   ██║
╚██╗ ██╔╝██╔══██║██║╚██╗██║██╔══██╗██║   ██║   ██║
 ╚████╔╝ ██║  ██║██║ ╚████║██║  ██║╚██████╔╝   ██║
  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝    ╚═╝`;

const CMD_COL = 30;

function buildRootHelp(): string {
  const lines: string[] = [];

  lines.push(VANROT_BANNER);
  lines.push('');
  lines.push('A component framework for disciplined Angular teams.');
  lines.push('');
  lines.push('Usage   vr <command> [options]');

  for (const group of commandGroups) {
    lines.push('');
    lines.push(group.label.toUpperCase());

    for (const cmdName of group.commands) {
      const meta = cliCommands.find((c) => c.name === cmdName);
      if (meta === undefined) continue;
      const col = meta.usage.replace(/^vr /, '').padEnd(CMD_COL);
      lines.push(`${col}  ${meta.description}`);
    }

    if (group.examples !== undefined) {
      lines.push(`e.g.  ${group.examples}`);
    }
  }

  lines.push('');
  lines.push('Run vr <command> --help for flags and examples.');

  return lines.join('\n');
}

const rootHelp = buildRootHelp();

export async function runCli(args: string[], context: CommandContext): Promise<CommandResult> {
  const [command, ...rest] = args;

  if (command === undefined || command === '--help' || command === '-h') {
    context.reporter.line(rootHelp);
    return ok();
  }

  if (rest.includes('--help') || rest.includes('-h')) {
    return printCommandHelp(command, context);
  }

  const handler = commandHandlers.get(command);

  if (handler !== undefined) {
    return handler(rest, context);
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
    return `Did you mean ${commandInvocation(commandName.create)}?`;
  }

  if (command === 'generte') {
    return `Did you mean ${commandInvocation(commandName.generate)}?`;
  }

  return undefined;
}
```

- [ ] **Step 4: Run the full test suite**

```bash
cd packages/cli && pnpm test 2>&1 | tail -30
```

Expected: all tests pass.

- [ ] **Step 5: Typecheck**

```bash
cd packages/cli && pnpm typecheck 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/cli.ts packages/cli/tests/cli.test.ts
git commit -m "feat(cli): redesign root help with VANROT banner, grouped commands, 30ch column"
```

