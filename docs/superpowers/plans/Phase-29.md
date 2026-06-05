# Phase 29 Formatters And Template Pipes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. Do not use subagents in this repository; `AGENTS.md` requires inline execution with review checkpoints.

**Goal:** Build compiler-native Vanrot template pipes with a full formatter suite, `.pipe.ts` role files, custom presets, custom pipes, enum pipes, formatting context, diagnostics, docs, examples, and release coverage.

**Architecture:** Pipe syntax is owned by `@vanrot/compiler`; generated browser and server output call tree-shakeable helpers from a new `@vanrot/formatters` package. Vite discovers `.pipe.ts` files and feeds pipe registry metadata into compiler options so templates can fail fast with source-located diagnostics while `@vanrot/runtime` stays unchanged.

**Tech Stack:** TypeScript 6, Vitest, parse5-backed Vanrot template parser, Vanrot compiler/codegen, `@vanrot/config`, `@vanrot/vite-plugin`, `@vanrot/forms`, Vanrot docs site, release dry-run tooling.

---

## Source Spec

- `docs/superpowers/specs/Phase-29.md`

## Scope Check

This phase touches a package, compiler, Vite, config, docs, examples, and release metadata. It remains one plan because the user requested the full suite in one go and the parts are tightly coupled: template syntax cannot be useful without a registry, registry diagnostics need Vite discovery, and generated output needs stable formatter helpers.

## Acceptance Criteria

- Templates support `{{ value | pipeName }}`, `{{ value | pipeName(arg) }}`, `{{ value | namespace.variant }}`, `{{ value | namespace.variant(arg) }}`, and left-to-right pipe chains.
- Built-in pipes cover text, date/time, number/money, lists/counts, generic masks, and forms messages.
- `.pipe.ts` files define app-global custom presets and custom pipes.
- `definePipe(...)`, `enumPipe(...)`, `datePattern(...)`, `numberPattern(...)`, and `maskPattern(...)` are public and tested.
- Formatting context supports `locale`, `timezone`, and `currency` from Vanrot config.
- Unknown pipes, unknown variants, duplicate names, invalid helper usage, async pipes, and knowable invalid arguments are fatal diagnostics with file, line, column, code frame, suggestion, and docs path.
- Vite reports `.pipe.ts` and template pipe diagnostics during startup and rebuild.
- Docs, examples, AI docs, release dry-run, runtime size verification, and phase trackers are updated before completion.

## Non-Goals

- Do not add async pipes.
- Do not add API-calling or state-mutating pipes.
- Do not add country-specific mask presets as built-ins.
- Do not put formatter code into `@vanrot/runtime`.
- Do not support Angular colon-argument syntax in this phase.
- Do not use subagents, git worktrees, staging, commits, or pushes unless the user explicitly asks.

## Planned File Structure

### New Package

- Create `packages/formatters/package.json` for `@vanrot/formatters`.
- Create `packages/formatters/tsconfig.json` for composite build output.
- Create `packages/formatters/src/constants.ts` for package name, namespaces, diagnostic docs paths, and default context values.
- Create `packages/formatters/src/types.ts` for `PipeContext`, `PipeDefinition`, `PipeRegistry`, preset metadata, and helper types.
- Create `packages/formatters/src/context.ts` for normalized formatting context.
- Create `packages/formatters/src/presets.ts` for `datePattern(...)`, `numberPattern(...)`, and `maskPattern(...)`.
- Create `packages/formatters/src/custom.ts` for `definePipe(...)` and `enumPipe(...)`.
- Create `packages/formatters/src/text.ts` for text pipe implementations.
- Create `packages/formatters/src/date-time.ts` for date/time pipe implementations.
- Create `packages/formatters/src/number.ts` for number, percent, compact, currency, and filesize pipes.
- Create `packages/formatters/src/list.ts` for `join`, `count`, and `plural`.
- Create `packages/formatters/src/mask.ts` for generic `mask(pattern)`.
- Create `packages/formatters/src/forms.ts` for message and messages pipes.
- Create `packages/formatters/src/registry.ts` for built-in registry lookup and chain application.
- Create `packages/formatters/src/metadata.ts` for serializable pipe metadata.
- Create `packages/formatters/src/diagnostics.ts` for package-level diagnostic helpers.
- Create `packages/formatters/src/testing.ts` for formatter test helpers.
- Create `packages/formatters/src/index.ts` for public exports.
- Create tests under `packages/formatters/tests/`.

### Compiler

- Create `packages/compiler/src/template/pipes.ts` for parsing pipe chains from interpolation expressions.
- Create `packages/compiler/src/template/pipe-diagnostics.ts` for source-located pipe diagnostics.
- Create `packages/compiler/src/template/pipe-registry.ts` for compiler-facing registry validation types.
- Modify `packages/compiler/src/template/bindings.ts` to attach parsed pipe chains to interpolation bindings.
- Modify `packages/compiler/src/api/types.ts` to add pipe compile options, pipe metadata, and `template-pipe` feature support.
- Modify `packages/compiler/src/api/compile-component.ts` to pass pipe options and metadata into codegen.
- Modify `packages/compiler/src/codegen/generate-component.ts` and `packages/compiler/src/codegen/server-component.ts` to lower pipe chains.
- Modify `packages/compiler/src/index.ts` to export pipe parser and metadata types.
- Add tests under `packages/compiler/tests/template/`, `packages/compiler/tests/codegen/`, and `packages/compiler/tests/api/`.

### Config

- Modify `packages/config/src/types.ts` to add `formatting` config.
- Modify `packages/config/src/defaults.ts` to normalize default formatting context.
- Modify `packages/config/src/validate.ts` to validate locale, timezone, and currency strings.
- Modify `packages/config/src/render.ts` or current canonical rendering file to preserve formatting config.
- Modify `packages/config/src/index.ts` exports if new config types are added.
- Add or update config tests.

### Vite Plugin

- Create `packages/vite-plugin/src/pipes/pipes-metadata.ts` for `.pipe.ts` discovery and registry metadata.
- Create `packages/vite-plugin/src/pipes/pipes-diagnostics.ts` for terminal diagnostics and duplicate detection.
- Modify `packages/vite-plugin/src/plugin.ts` to collect pipe metadata during config resolution and rebuild.
- Modify compile-for-Vite paths to pass pipe registry and formatting context into compiler options.
- Add `packages/vite-plugin/tests/pipes-metadata.test.ts` and `packages/vite-plugin/tests/pipes-diagnostics.test.ts`.
- Add fixture `.pipe.ts` files under Vite fixture apps.

### Docs, Examples, Release, And Trackers

- Create `examples/formatters-pipes/`.
- Modify `apps/vanrot-site/src/docs/site-data.json` to add `/docs/formatters`.
- Modify `apps/vanrot-site/src/docs/site-data.ts`, `framework-guides.ts`, and `framework-reference.json`.
- Modify site tests for the new guide/reference entries.
- Modify AI docs data through `node packages/cli/dist/bin.js ai build`.
- Modify `docs/superpowers/feature-maturity.md`, `docs/superpowers/final-tdd-inventory.md`, and `docs/superpowers/future-pipeline.md` at closeout.
- Modify root `tsconfig.json`, `publish.sh`, package manifests, and lockfile for `@vanrot/formatters`.

---

## Module 29A: `@vanrot/formatters` Package Foundation

**Files:**
- Create: `packages/formatters/package.json`
- Create: `packages/formatters/tsconfig.json`
- Create: `packages/formatters/src/constants.ts`
- Create: `packages/formatters/src/types.ts`
- Create: `packages/formatters/src/context.ts`
- Create: `packages/formatters/src/index.ts`
- Create: `packages/formatters/tests/context.test.ts`
- Modify: `tsconfig.json`

- [x] **Step 1: Write package context tests**

Create `packages/formatters/tests/context.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createPipeContext, DEFAULT_PIPE_CONTEXT } from '../src/index.js';

describe('createPipeContext', () => {
  it('uses stable defaults when no app formatting config is provided', () => {
    expect(createPipeContext()).toEqual(DEFAULT_PIPE_CONTEXT);
  });

  it('normalizes locale, timezone, and currency overrides', () => {
    expect(
      createPipeContext({
        locale: 'ms-MY',
        timezone: 'Asia/Kuala_Lumpur',
        currency: 'MYR',
      }),
    ).toEqual({
      locale: 'ms-MY',
      timezone: 'Asia/Kuala_Lumpur',
      currency: 'MYR',
    });
  });
});
```

- [x] **Step 2: Run the package test and verify it fails**

Run: `pnpm --filter @vanrot/formatters test`

Expected: fails because `@vanrot/formatters` does not exist.

- [x] **Step 3: Create the package manifest**

Create `packages/formatters/package.json`:

```json
{
  "name": "@vanrot/formatters",
  "version": "0.1.0",
  "type": "module",
  "engines": {
    "node": ">=22.14.0"
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
  "devDependencies": {
    "vitest": "^4.0.14"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

- [x] **Step 4: Create package tsconfig**

Create `packages/formatters/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"
  },
  "include": ["src/**/*.ts"]
}
```

- [x] **Step 5: Add root project reference**

Modify root `tsconfig.json` so references include:

```json
{ "path": "./packages/formatters" }
```

Place it after `./packages/forms` once `packages/forms` is already present in the current file, otherwise place it after `./packages/runtime`.

- [x] **Step 6: Create context source**

Create `packages/formatters/src/constants.ts`:

```ts
export const FORMATTERS_PACKAGE_NAME = '@vanrot/formatters';

export const FORMATTERS_DOCS_PATH = '/docs/formatters';

export const PIPE_NAMESPACES = {
  date: 'date',
  time: 'time',
  datetime: 'datetime',
  number: 'number',
  currency: 'currency',
  mask: 'mask',
} as const;
```

Create `packages/formatters/src/types.ts`:

```ts
export interface PipeContext {
  locale: string;
  timezone: string;
  currency: string;
}

export type PipeValue = unknown;

export type PipeHandler<TValue = PipeValue, TResult = string> = (
  value: TValue,
  context: Readonly<PipeContext>,
  ...args: readonly PipeValue[]
) => TResult;

export interface PipeDefinition<TValue = PipeValue, TResult = string> {
  kind: 'pipe';
  name: string;
  handler: PipeHandler<TValue, TResult>;
}

export type PipePresetKind = 'date-pattern' | 'number-pattern' | 'mask-pattern';

export interface PipePreset {
  kind: PipePresetKind;
  namespace: string;
  pattern: string;
}
```

Create `packages/formatters/src/context.ts`:

```ts
import type { PipeContext } from './types.js';

export const DEFAULT_PIPE_CONTEXT: PipeContext = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

export type PipeContextInput = Partial<PipeContext>;

export function createPipeContext(input: PipeContextInput = {}): PipeContext {
  return {
    locale: normalizeContextValue(input.locale, DEFAULT_PIPE_CONTEXT.locale),
    timezone: normalizeContextValue(input.timezone, DEFAULT_PIPE_CONTEXT.timezone),
    currency: normalizeContextValue(input.currency, DEFAULT_PIPE_CONTEXT.currency),
  };
}

function normalizeContextValue(value: string | undefined, fallback: string): string {
  if (value === undefined) {
    return fallback;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return fallback;
  }

  return trimmed;
}
```

Create `packages/formatters/src/index.ts`:

```ts
export * from './constants.js';
export * from './context.js';
export * from './types.js';
```

- [x] **Step 7: Run package tests and typecheck**

Run:

```sh
pnpm --filter @vanrot/formatters test
pnpm --filter @vanrot/formatters typecheck
```

Expected: both pass.

- [x] **Step 8: Checkpoint**

Run: `git status --short`

Expected: new `packages/formatters/` files and root `tsconfig.json` change are visible. Do not stage or commit unless the user asked.

## Module 29B: Built-In Formatter Helpers

**Files:**
- Create: `packages/formatters/src/text.ts`
- Create: `packages/formatters/src/date-time.ts`
- Create: `packages/formatters/src/number.ts`
- Create: `packages/formatters/src/list.ts`
- Create: `packages/formatters/src/mask.ts`
- Create: `packages/formatters/src/forms.ts`
- Modify: `packages/formatters/src/index.ts`
- Create: `packages/formatters/tests/text.test.ts`
- Create: `packages/formatters/tests/date-time.test.ts`
- Create: `packages/formatters/tests/number.test.ts`
- Create: `packages/formatters/tests/list.test.ts`
- Create: `packages/formatters/tests/mask.test.ts`
- Create: `packages/formatters/tests/forms.test.ts`

- [x] **Step 1: Write failing text pipe tests**

Create `packages/formatters/tests/text.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  fallbackPipe,
  initialsPipe,
  lowercasePipe,
  sentencecasePipe,
  titlecasePipe,
  truncatePipe,
  uppercasePipe,
} from '../src/index.js';

describe('text pipes', () => {
  it('formats common casing helpers', () => {
    expect(uppercasePipe('vanrot')).toBe('VANROT');
    expect(lowercasePipe('Vanrot')).toBe('vanrot');
    expect(titlecasePipe('claims portal')).toBe('Claims Portal');
    expect(sentencecasePipe('CLAIMS PORTAL')).toBe('Claims portal');
  });

  it('truncates and falls back predictably', () => {
    expect(truncatePipe('Long customer description', 9)).toBe('Long cust...');
    expect(fallbackPipe('', 'N/A')).toBe('N/A');
    expect(fallbackPipe('Ready', 'N/A')).toBe('Ready');
  });

  it('creates initials from words', () => {
    expect(initialsPipe('Vankode Malaysia Berhad')).toBe('VMB');
  });
});
```

- [x] **Step 2: Write failing date/time tests**

Create `packages/formatters/tests/date-time.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { datePipe, datetimePipe, durationPipe, relativeTimePipe, timePipe } from '../src/index.js';

const context = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

describe('date and time pipes', () => {
  it('supports named and custom date patterns', () => {
    const value = new Date('2026-06-05T10:30:00.000Z');

    expect(datePipe(value, context, 'monthDayYear')).toBe('06/05/2026');
    expect(datePipe(value, context, 'dayMonthYear')).toBe('05/06/2026');
    expect(datePipe(value, context, 'monthYear')).toBe('06/2026');
    expect(datePipe(value, context, 'MM/yy')).toBe('06/26');
  });

  it('formats time, datetime, relative time, and duration', () => {
    const value = new Date('2026-06-05T10:30:00.000Z');

    expect(timePipe(value, context, 'HH:mm')).toBe('10:30');
    expect(datetimePipe(value, context, 'dd/MM/yyyy HH:mm')).toBe('05/06/2026 10:30');
    expect(relativeTimePipe(Date.now() - 60_000, context)).toMatch(/minute/);
    expect(durationPipe(3_660_000)).toBe('1h 1m');
  });
});
```

- [x] **Step 3: Write failing number, list, mask, and forms tests**

Create `packages/formatters/tests/number.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { compactPipe, currencyPipe, filesizePipe, numberPipe, percentPipe } from '../src/index.js';

const context = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

describe('number pipes', () => {
  it('formats numbers, currency, percent, compact values, and file sizes', () => {
    expect(numberPipe(1234.5, context, 'thousands')).toBe('1,234.5');
    expect(numberPipe(1234.5, context, 'cents')).toBe('1,234.50');
    expect(numberPipe(1234.5, context, '0,0.00')).toBe('1,234.50');
    expect(currencyPipe(1234.5, context)).toBe('$1,234.50');
    expect(currencyPipe(1234.5, context, 'MYR')).toBe('MYR 1,234.50');
    expect(percentPipe(0.25, context)).toBe('25%');
    expect(compactPipe(12500, context)).toBe('12.5K');
    expect(filesizePipe(1536)).toBe('1.5 KB');
  });
});
```

Create `packages/formatters/tests/list.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { countPipe, joinPipe, pluralPipe } from '../src/index.js';

describe('list pipes', () => {
  it('formats arrays and counts', () => {
    expect(joinPipe(['alpha', 'beta'], ', ')).toBe('alpha, beta');
    expect(countPipe(['alpha', 'beta'])).toBe(2);
    expect(pluralPipe(1, 'item', 'items')).toBe('1 item');
    expect(pluralPipe(3, 'item', 'items')).toBe('3 items');
  });
});
```

Create `packages/formatters/tests/mask.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { maskPipe } from '../src/index.js';

describe('maskPipe', () => {
  it('applies # placeholders and leaves literal pattern characters intact', () => {
    expect(maskPipe('0123456789', '###-#######')).toBe('012-3456789');
    expect(maskPipe('1234', '**** ####')).toBe('**** 1234');
  });
});
```

Create `packages/formatters/tests/forms.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { messagePipe, messagesPipe } from '../src/index.js';

describe('forms message pipes', () => {
  it('reads messages from a form-like field object', () => {
    const field = {
      messages: () => ['Email is required', 'Email must be valid'],
    };

    expect(messagePipe(field)).toBe('Email is required');
    expect(messagesPipe(field)).toEqual(['Email is required', 'Email must be valid']);
  });
});
```

- [x] **Step 4: Run tests and verify they fail**

Run: `pnpm --filter @vanrot/formatters test`

Expected: fails because pipe functions are not exported yet.

- [x] **Step 5: Implement text helpers**

Create `packages/formatters/src/text.ts`:

```ts
export function uppercasePipe(value: unknown): string {
  return toDisplayString(value).toUpperCase();
}

export function lowercasePipe(value: unknown): string {
  return toDisplayString(value).toLowerCase();
}

export function titlecasePipe(value: unknown): string {
  return toDisplayString(value).replace(/\S+/g, (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`);
}

export function sentencecasePipe(value: unknown): string {
  const text = toDisplayString(value).toLowerCase();

  if (text.length === 0) {
    return '';
  }

  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

export function truncatePipe(value: unknown, length: number): string {
  const text = toDisplayString(value);

  if (!Number.isFinite(length) || length < 0) {
    return text;
  }

  if (text.length <= length) {
    return text;
  }

  if (length <= 3) {
    return text.slice(0, length);
  }

  return `${text.slice(0, length)}...`;
}

export function fallbackPipe(value: unknown, fallback: string): string {
  const text = toDisplayString(value);

  if (text.trim().length === 0) {
    return fallback;
  }

  return text;
}

export function initialsPipe(value: unknown): string {
  return toDisplayString(value)
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}
```

- [x] **Step 6: Implement date/time helpers**

Create `packages/formatters/src/date-time.ts` with deterministic pattern support for the accepted patterns:

```ts
import type { PipeContext } from './types.js';

const DATE_PRESETS = {
  monthDayYear: 'MM/dd/yyyy',
  dayMonthYear: 'dd/MM/yyyy',
  monthYear: 'MM/yyyy',
  short: 'MM/dd/yy',
  long: 'MMMM d, yyyy',
} as const;

export function datePipe(value: unknown, context: Readonly<PipeContext>, pattern = 'monthDayYear'): string {
  const date = toDate(value);

  if (date === null) {
    return '';
  }

  return formatDatePattern(date, DATE_PRESETS[pattern as keyof typeof DATE_PRESETS] ?? pattern, context);
}

export function timePipe(value: unknown, context: Readonly<PipeContext>, pattern = 'HH:mm'): string {
  const date = toDate(value);

  if (date === null) {
    return '';
  }

  return formatDatePattern(date, pattern, context);
}

export function datetimePipe(value: unknown, context: Readonly<PipeContext>, pattern = 'MM/dd/yyyy HH:mm'): string {
  const date = toDate(value);

  if (date === null) {
    return '';
  }

  return formatDatePattern(date, pattern, context);
}

export function relativeTimePipe(value: unknown, _context: Readonly<PipeContext>, now = Date.now()): string {
  const date = toDate(value);

  if (date === null) {
    return '';
  }

  const diffMs = now - date.getTime();
  const absMinutes = Math.max(1, Math.round(Math.abs(diffMs) / 60_000));
  const suffix = diffMs >= 0 ? 'ago' : 'from now';

  if (absMinutes < 60) {
    return `${absMinutes} minute${absMinutes === 1 ? '' : 's'} ${suffix}`;
  }

  const hours = Math.round(absMinutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ${suffix}`;
}

export function durationPipe(value: unknown): string {
  const totalMs = Number(value);

  if (!Number.isFinite(totalMs) || totalMs < 0) {
    return '';
  }

  const totalMinutes = Math.floor(totalMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatDatePattern(date: Date, pattern: string, _context: Readonly<PipeContext>): string {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  return pattern
    .replaceAll('MMMM', new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(date))
    .replaceAll('yyyy', String(year))
    .replaceAll('yy', String(year).slice(-2))
    .replaceAll('MM', pad(month))
    .replaceAll('dd', pad(day))
    .replaceAll('d', String(day))
    .replaceAll('HH', pad(hours))
    .replaceAll('mm', pad(minutes));
}

function toDate(value: unknown): Date | null {
  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
```

- [x] **Step 7: Implement number, list, mask, and forms helpers**

Create `packages/formatters/src/number.ts`, `list.ts`, `mask.ts`, and `forms.ts` using the test expectations above. Keep behavior deterministic and avoid external dependencies. Use `Intl.NumberFormat` for locale-aware defaults and simple custom handling for `0,0` and `0,0.00`.

Required exports:

```ts
export function numberPipe(value: unknown, context: Readonly<PipeContext>, pattern = ''): string;
export function currencyPipe(value: unknown, context: Readonly<PipeContext>, currency?: string): string;
export function percentPipe(value: unknown, context: Readonly<PipeContext>): string;
export function compactPipe(value: unknown, context: Readonly<PipeContext>): string;
export function filesizePipe(value: unknown): string;
export function joinPipe(value: unknown, separator?: string): string;
export function countPipe(value: unknown): number;
export function pluralPipe(value: unknown, singular: string, plural?: string): string;
export function maskPipe(value: unknown, pattern: string): string;
export function messagePipe(value: unknown): string;
export function messagesPipe(value: unknown): string[];
```

- [x] **Step 8: Export helpers**

Modify `packages/formatters/src/index.ts`:

```ts
export * from './constants.js';
export * from './context.js';
export * from './date-time.js';
export * from './forms.js';
export * from './list.js';
export * from './mask.js';
export * from './number.js';
export * from './text.js';
export * from './types.js';
```

- [x] **Step 9: Run formatter tests and typecheck**

Run:

```sh
pnpm --filter @vanrot/formatters test
pnpm --filter @vanrot/formatters typecheck
```

Expected: both pass.

## Module 29C: Presets, Custom Pipes, Enum Pipes, And Registry

**Files:**
- Create: `packages/formatters/src/presets.ts`
- Create: `packages/formatters/src/custom.ts`
- Create: `packages/formatters/src/registry.ts`
- Create: `packages/formatters/src/metadata.ts`
- Create: `packages/formatters/src/diagnostics.ts`
- Create: `packages/formatters/src/testing.ts`
- Modify: `packages/formatters/src/index.ts`
- Create: `packages/formatters/tests/presets.test.ts`
- Create: `packages/formatters/tests/custom.test.ts`
- Create: `packages/formatters/tests/registry.test.ts`
- Create: `packages/formatters/tests/metadata.test.ts`

- [x] **Step 1: Write failing tests for presets and custom pipes**

Create `packages/formatters/tests/presets.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { datePattern, maskPattern, numberPattern } from '../src/index.js';

describe('formatter presets', () => {
  it('creates namespace-aware preset metadata', () => {
    expect(datePattern('dd/MM/yyyy')).toEqual({
      kind: 'date-pattern',
      namespace: 'date',
      pattern: 'dd/MM/yyyy',
    });

    expect(numberPattern('(0,0.00)')).toEqual({
      kind: 'number-pattern',
      namespace: 'number',
      pattern: '(0,0.00)',
    });

    expect(maskPattern('###-#######')).toEqual({
      kind: 'mask-pattern',
      namespace: 'mask',
      pattern: '###-#######',
    });
  });
});
```

Create `packages/formatters/tests/custom.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { definePipe, enumPipe } from '../src/index.js';

enum ClaimStatus {
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
  PendingReview = 'PENDING_REVIEW',
}

const context = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

describe('custom pipes', () => {
  it('defines sync pipes that receive context and args', () => {
    const pipe = definePipe('moneyLabel', (value, ctx, suffix) => `${ctx.currency} ${value} ${suffix}`);

    expect(pipe.kind).toBe('pipe');
    expect(pipe.name).toBe('moneyLabel');
    expect(pipe.handler(25, context, 'paid')).toBe('USD 25 paid');
  });

  it('defines enum label pipes', () => {
    const pipe = enumPipe('claimStatus', ClaimStatus, {
      [ClaimStatus.Approved]: 'Approved',
      [ClaimStatus.Rejected]: 'Rejected',
      [ClaimStatus.PendingReview]: 'Pending review',
      fallback: 'Unknown',
    });

    expect(pipe.handler(ClaimStatus.Approved, context)).toBe('Approved');
    expect(pipe.handler('VOID', context)).toBe('Unknown');
  });
});
```

- [x] **Step 2: Write failing registry tests**

Create `packages/formatters/tests/registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createPipeContext, createPipeRegistry, definePipe } from '../src/index.js';

describe('createPipeRegistry', () => {
  it('applies built-in, custom, preset, and chained pipes', () => {
    const registry = createPipeRegistry({
      pipes: [definePipe('claimStatus', (value) => (value === 'APPROVED' ? 'Approved' : 'Unknown'))],
      presets: {
        date: {
          invoice: 'dd/MM/yyyy',
        },
        mask: {
          malaysiaPhone: '###-#######',
        },
      },
    });

    const context = createPipeContext();

    expect(registry.apply('vanrot', [{ name: 'uppercase', args: [] }], context)).toBe('VANROT');
    expect(registry.apply('APPROVED', [{ name: 'claimStatus', args: [] }], context)).toBe('Approved');
    expect(registry.apply('2026-06-05', [{ name: 'date.invoice', args: [] }], context)).toBe('05/06/2026');
    expect(registry.apply('0123456789', [{ name: 'mask.malaysiaPhone', args: [] }], context)).toBe('012-3456789');
    expect(
      registry.apply(
        '',
        [
          { name: 'fallback', args: ['unknown'] },
          { name: 'uppercase', args: [] },
        ],
        context,
      ),
    ).toBe('UNKNOWN');
  });

  it('reports duplicate custom pipe names', () => {
    const registry = createPipeRegistry({
      pipes: [
        definePipe('claimStatus', (value) => String(value)),
        definePipe('claimStatus', (value) => String(value)),
      ],
    });

    expect(registry.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'VR_PIPE_DUPLICATE_NAME',
        name: 'claimStatus',
      }),
    );
  });
});
```

- [x] **Step 3: Run registry tests and verify they fail**

Run: `pnpm --filter @vanrot/formatters test`

Expected: fails because preset, custom, and registry helpers do not exist.

- [x] **Step 4: Implement preset helpers**

Create `packages/formatters/src/presets.ts`:

```ts
import type { PipePreset } from './types.js';

export function datePattern(pattern: string): PipePreset {
  return {
    kind: 'date-pattern',
    namespace: 'date',
    pattern,
  };
}

export function numberPattern(pattern: string): PipePreset {
  return {
    kind: 'number-pattern',
    namespace: 'number',
    pattern,
  };
}

export function maskPattern(pattern: string): PipePreset {
  return {
    kind: 'mask-pattern',
    namespace: 'mask',
    pattern,
  };
}
```

- [x] **Step 5: Implement custom pipe helpers**

Create `packages/formatters/src/custom.ts`:

```ts
import type { PipeDefinition, PipeHandler, PipeValue } from './types.js';

export function definePipe<TValue = PipeValue, TResult = string>(
  name: string,
  handler: PipeHandler<TValue, TResult>,
): PipeDefinition<TValue, TResult> {
  return {
    kind: 'pipe',
    name,
    handler,
  };
}

export function enumPipe<TEnum extends Record<string, string>, TValue extends TEnum[keyof TEnum]>(
  name: string,
  _enumObject: TEnum,
  labels: Record<TValue, string> & { fallback: string },
): PipeDefinition<TValue | string, string> {
  return definePipe(name, (value) => labels[value as TValue] ?? labels.fallback);
}
```

- [x] **Step 6: Implement registry**

Create `packages/formatters/src/registry.ts` with:

```ts
import { datePipe, datetimePipe, durationPipe, relativeTimePipe, timePipe } from './date-time.js';
import { messagePipe, messagesPipe } from './forms.js';
import { countPipe, joinPipe, pluralPipe } from './list.js';
import { maskPipe } from './mask.js';
import { compactPipe, currencyPipe, filesizePipe, numberPipe, percentPipe } from './number.js';
import {
  fallbackPipe,
  initialsPipe,
  lowercasePipe,
  sentencecasePipe,
  titlecasePipe,
  truncatePipe,
  uppercasePipe,
} from './text.js';
import type { PipeContext, PipeDefinition, PipeValue } from './types.js';

export interface PipeCall {
  name: string;
  args: readonly PipeValue[];
}

export interface PipeRegistryOptions {
  pipes?: readonly PipeDefinition[];
  presets?: Record<string, Record<string, string>>;
}

export interface PipeRegistryDiagnostic {
  code: 'VR_PIPE_DUPLICATE_NAME';
  name: string;
}

export interface PipeRegistry {
  diagnostics: PipeRegistryDiagnostic[];
  apply(value: PipeValue, calls: readonly PipeCall[], context: Readonly<PipeContext>): PipeValue;
  has(name: string): boolean;
}

export function createPipeRegistry(options: PipeRegistryOptions = {}): PipeRegistry {
  const customPipes = new Map<string, PipeDefinition>();
  const diagnostics: PipeRegistryDiagnostic[] = [];

  for (const pipe of options.pipes ?? []) {
    if (customPipes.has(pipe.name)) {
      diagnostics.push({ code: 'VR_PIPE_DUPLICATE_NAME', name: pipe.name });
      continue;
    }

    customPipes.set(pipe.name, pipe);
  }

  return {
    diagnostics,
    apply(value, calls, context) {
      return calls.reduce((current, call) => applyPipeCall(current, call, context, customPipes, options.presets ?? {}), value);
    },
    has(name) {
      return resolveBuiltInPipe(name, options.presets ?? {}) !== null || customPipes.has(name);
    },
  };
}
```

Add `applyPipeCall(...)` and `resolveBuiltInPipe(...)` in the same file. Cover every built-in from the spec. Namespaced presets should resolve `date.invoice`, `number.accounting`, and `mask.malaysiaPhone` to the matching built-in with the preset pattern inserted as the first argument.

- [x] **Step 7: Add metadata, diagnostics, and testing helpers**

Create `packages/formatters/src/metadata.ts`:

```ts
export interface PipeMetadata {
  name: string;
  sourcePath: string;
  kind: 'built-in' | 'custom' | 'preset';
  namespace: string;
}

export interface PipeUsageMetadata {
  templatePath: string;
  line: number;
  column: number;
  name: string;
}
```

Create `packages/formatters/src/diagnostics.ts`:

```ts
export const PIPE_DIAGNOSTIC_CODES = {
  unknown: 'VR_PIPE_UNKNOWN',
  unknownVariant: 'VR_PIPE_UNKNOWN_VARIANT',
  duplicateName: 'VR_PIPE_DUPLICATE_NAME',
  duplicatePreset: 'VR_PIPE_DUPLICATE_PRESET',
  invalidArgument: 'VR_PIPE_INVALID_ARGUMENT',
  invalidDefinition: 'VR_PIPE_INVALID_DEFINITION',
  asyncPipe: 'VR_PIPE_ASYNC',
} as const;
```

Create `packages/formatters/src/testing.ts`:

```ts
import { createPipeContext } from './context.js';
import { createPipeRegistry, type PipeCall, type PipeRegistryOptions } from './registry.js';

export function createPipeTest(options: PipeRegistryOptions = {}) {
  const registry = createPipeRegistry(options);
  const context = createPipeContext();

  return {
    registry,
    format(value: unknown, calls: readonly PipeCall[]) {
      return registry.apply(value, calls, context);
    },
  };
}
```

- [x] **Step 8: Export new helpers**

Modify `packages/formatters/src/index.ts`:

```ts
export * from './constants.js';
export * from './context.js';
export * from './custom.js';
export * from './date-time.js';
export * from './diagnostics.js';
export * from './forms.js';
export * from './list.js';
export * from './mask.js';
export * from './metadata.js';
export * from './number.js';
export * from './presets.js';
export * from './registry.js';
export * from './testing.js';
export * from './text.js';
export * from './types.js';
```

- [x] **Step 9: Run package verification**

Run:

```sh
pnpm --filter @vanrot/formatters test
pnpm --filter @vanrot/formatters typecheck
pnpm --filter @vanrot/formatters build
```

Expected: all pass.

## Module 29D: Config Formatting Context

**Files:**
- Modify: `packages/config/src/types.ts`
- Modify: `packages/config/src/defaults.ts`
- Modify: `packages/config/src/validate.ts`
- Modify: `packages/config/src/index.ts`
- Test: relevant `packages/config/tests/*.test.ts`

- [x] **Step 1: Write failing config tests**

Add tests to the existing config test file that covers normalization and validation:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeVanrotConfig, validateVanrotConfig } from '../src/index.js';

describe('formatting config', () => {
  it('normalizes formatting defaults', () => {
    const config = normalizeVanrotConfig({
      formatting: {
        locale: 'ms-MY',
        timezone: 'Asia/Kuala_Lumpur',
        currency: 'MYR',
      },
    });

    expect(config.formatting).toEqual({
      locale: 'ms-MY',
      timezone: 'Asia/Kuala_Lumpur',
      currency: 'MYR',
    });
  });

  it('reports empty formatting values', () => {
    const diagnostics = validateVanrotConfig({
      formatting: {
        locale: '',
        timezone: '',
        currency: '',
      },
    });

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'VRCFG_FORMATTING_LOCALE_EMPTY' }),
        expect.objectContaining({ code: 'VRCFG_FORMATTING_TIMEZONE_EMPTY' }),
        expect.objectContaining({ code: 'VRCFG_FORMATTING_CURRENCY_EMPTY' }),
      ]),
    );
  });
});
```

- [x] **Step 2: Run config tests and verify they fail**

Run: `pnpm --filter @vanrot/config test`

Expected: fails because `formatting` config is not typed or normalized yet.

- [x] **Step 3: Add config types**

Modify `packages/config/src/types.ts` to add:

```ts
export interface VanrotFormattingConfig {
  locale?: string;
  timezone?: string;
  currency?: string;
}

export interface NormalizedVanrotFormattingConfig {
  locale: string;
  timezone: string;
  currency: string;
}
```

Add `formatting?: VanrotFormattingConfig` to `VanrotConfig`. Add `formatting: NormalizedVanrotFormattingConfig` to `NormalizedVanrotConfig`.

- [x] **Step 4: Add config defaults**

Modify `packages/config/src/defaults.ts` to normalize formatting values:

```ts
const defaultFormattingConfig: NormalizedVanrotFormattingConfig = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};
```

In `normalizeVanrotConfig(...)`, assign:

```ts
formatting: {
  locale: normalizeString(config.formatting?.locale, defaultFormattingConfig.locale),
  timezone: normalizeString(config.formatting?.timezone, defaultFormattingConfig.timezone),
  currency: normalizeString(config.formatting?.currency, defaultFormattingConfig.currency),
},
```

Use the existing string normalization helper if one exists in `defaults.ts`; otherwise add a local guard-clause helper with the same behavior.

- [x] **Step 5: Add config diagnostics**

Modify `packages/config/src/validate.ts` to emit:

```ts
'VRCFG_FORMATTING_LOCALE_EMPTY'
'VRCFG_FORMATTING_TIMEZONE_EMPTY'
'VRCFG_FORMATTING_CURRENCY_EMPTY'
```

Each diagnostic should include a clear message, severity `error`, and a suggestion to remove the empty field or provide a real value.

- [x] **Step 6: Export config types**

Modify `packages/config/src/index.ts` to export `VanrotFormattingConfig` and `NormalizedVanrotFormattingConfig`.

- [x] **Step 7: Run config verification**

Run:

```sh
pnpm --filter @vanrot/config test
pnpm --filter @vanrot/config typecheck
pnpm --filter @vanrot/config build
```

Expected: all pass.

## Module 29E: Pipe Parser And Source Spans

**Files:**
- Create: `packages/compiler/src/template/pipes.ts`
- Create: `packages/compiler/src/template/pipe-diagnostics.ts`
- Modify: `packages/compiler/src/template/bindings.ts`
- Modify: `packages/compiler/src/index.ts`
- Create: `packages/compiler/tests/template/pipes.test.ts`
- Modify: `packages/compiler/tests/template/bindings.test.ts`

- [x] **Step 1: Write failing pipe parser tests**

Create `packages/compiler/tests/template/pipes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parsePipeExpression } from '../../src/index.js';

describe('parsePipeExpression', () => {
  it('parses pipe chains with args and dotted variants', () => {
    expect(parsePipeExpression('name | fallback("Unknown") | uppercase')).toEqual({
      baseExpression: 'name',
      pipes: [
        {
          name: 'fallback',
          namespace: '',
          variant: '',
          args: ['"Unknown"'],
        },
        {
          name: 'uppercase',
          namespace: '',
          variant: '',
          args: [],
        },
      ],
    });

    expect(parsePipeExpression('createdAt | date.monthDayYear')).toEqual({
      baseExpression: 'createdAt',
      pipes: [
        {
          name: 'date.monthDayYear',
          namespace: 'date',
          variant: 'monthDayYear',
          args: [],
        },
      ],
    });
  });

  it('keeps pipes inside string literals out of the chain', () => {
    expect(parsePipeExpression('label("|") | uppercase')?.baseExpression).toBe('label("|")');
  });
});
```

- [x] **Step 2: Write failing interpolation binding test**

Modify `packages/compiler/tests/template/bindings.test.ts` with:

```ts
it('attaches parsed pipe chains to interpolation bindings', () => {
  const result = extractTemplateBindings(parseTemplate('{{ createdAt | date.monthDayYear }}', 'src/date.page.html').nodes, 'src/date.page.html');

  expect(result.bindings).toContainEqual(
    expect.objectContaining({
      kind: 'interpolation',
      expression: 'createdAt | date.monthDayYear',
      pipeExpression: expect.objectContaining({
        baseExpression: 'createdAt',
        pipes: [expect.objectContaining({ name: 'date.monthDayYear' })],
      }),
    }),
  );
});
```

- [x] **Step 3: Run compiler template tests and verify they fail**

Run:

```sh
pnpm --filter @vanrot/compiler exec vitest run tests/template/pipes.test.ts tests/template/bindings.test.ts
```

Expected: fails because `parsePipeExpression` and `pipeExpression` do not exist.

- [x] **Step 4: Add pipe AST types and parser**

Create `packages/compiler/src/template/pipes.ts`:

```ts
export interface ParsedPipeCall {
  name: string;
  namespace: string;
  variant: string;
  args: string[];
}

export interface ParsedPipeExpression {
  baseExpression: string;
  pipes: ParsedPipeCall[];
}

export function parsePipeExpression(expression: string): ParsedPipeExpression | null {
  const segments = splitTopLevel(expression, '|').map((segment) => segment.trim());

  if (segments.length <= 1) {
    return null;
  }

  const baseExpression = segments[0] ?? '';
  const pipes = segments.slice(1).map(parsePipeCall);

  if (baseExpression.length === 0 || pipes.some((pipe) => pipe === null)) {
    return null;
  }

  return {
    baseExpression,
    pipes: pipes.filter((pipe): pipe is ParsedPipeCall => pipe !== null),
  };
}
```

In the same file, add `splitTopLevel(...)`, `parsePipeCall(...)`, and `splitArgs(...)`. Track quotes and parentheses so `label("|") | uppercase` works. Support call syntax `truncate(20)` and dotted syntax `date.monthDayYear`.

- [x] **Step 5: Attach parsed pipes to interpolation bindings**

Modify `packages/compiler/src/template/bindings.ts`:

```ts
import type { ParsedPipeExpression } from './pipes.js';
import { parsePipeExpression } from './pipes.js';
```

Extend `InterpolationBinding`:

```ts
pipeExpression: ParsedPipeExpression | null;
```

When pushing an interpolation binding, include:

```ts
pipeExpression: parsePipeExpression(parsedInterpolation.expression),
```

- [x] **Step 6: Export parser types**

Modify `packages/compiler/src/index.ts`:

```ts
export type { ParsedPipeCall, ParsedPipeExpression } from './template/pipes.js';
export { parsePipeExpression } from './template/pipes.js';
```

- [x] **Step 7: Run template parser verification**

Run:

```sh
pnpm --filter @vanrot/compiler exec vitest run tests/template/pipes.test.ts tests/template/bindings.test.ts
pnpm --filter @vanrot/compiler typecheck
```

Expected: both pass.

## Module 29F: Compiler Pipe Registry Validation And Diagnostics

**Files:**
- Create: `packages/compiler/src/template/pipe-registry.ts`
- Modify: `packages/compiler/src/template/pipe-diagnostics.ts`
- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/api/compile-component.ts`
- Test: `packages/compiler/tests/api/compile-component.test.ts`
- Create: `packages/compiler/tests/template/pipe-diagnostics.test.ts`

- [x] **Step 1: Write failing diagnostics tests**

Create `packages/compiler/tests/template/pipe-diagnostics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { compileComponent } from '../../src/index.js';

const baseSource = {
  componentPath: 'src/orders.page.ts',
  componentSource: 'export class OrdersPage { amount = 25; createdAt = new Date(); }',
  templatePath: 'src/orders.page.html',
  stylePath: 'src/orders.page.css',
  styleSource: '',
};

describe('pipe diagnostics', () => {
  it('fails unknown pipes with source location and suggestion', () => {
    const result = compileComponent({
      ...baseSource,
      templateSource: '{{ amount | curreny }}',
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'VR_PIPE_UNKNOWN',
        filePath: 'src/orders.page.html',
        line: 1,
        column: expect.any(Number),
        suggestion: expect.stringContaining('currency'),
        docsPath: '/docs/formatters',
      }),
    );
  });

  it('fails unknown pipe variants', () => {
    const result = compileComponent({
      ...baseSource,
      templateSource: '{{ createdAt | date.monthDayyer }}',
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'VR_PIPE_UNKNOWN_VARIANT',
        message: expect.stringContaining('date.monthDayyer'),
      }),
    );
  });

  it('fails knowably invalid pipe args', () => {
    const result = compileComponent({
      ...baseSource,
      templateSource: '{{ amount | truncate("twenty") }}',
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'VR_PIPE_INVALID_ARGUMENT',
        message: expect.stringContaining('truncate'),
        codeFrame: expect.stringContaining('truncate("twenty")'),
      }),
    );
  });
});
```

- [x] **Step 2: Run diagnostics tests and verify they fail**

Run: `pnpm --filter @vanrot/compiler exec vitest run tests/template/pipe-diagnostics.test.ts`

Expected: fails because compiler does not validate pipes yet.

- [x] **Step 3: Add compile option types**

Modify `packages/compiler/src/api/types.ts`:

```ts
export interface CompilePipeRegistry {
  pipes: CompilePipeDefinition[];
  presets: CompilePipePreset[];
}

export interface CompilePipeDefinition {
  name: string;
  sourcePath: string;
}

export interface CompilePipePreset {
  namespace: string;
  name: string;
  pattern: string;
  sourcePath: string;
}

export interface CompilePipeContext {
  locale: string;
  timezone: string;
  currency: string;
}
```

Add to `CompileOptions`:

```ts
pipeRegistry?: CompilePipeRegistry;
pipeContext?: CompilePipeContext;
```

Add `'template-pipe'` to `CompileFeature`.

Add pipe diagnostic codes to `DiagnosticCode`.

- [x] **Step 4: Add compiler registry validation**

Create `packages/compiler/src/template/pipe-registry.ts`:

```ts
import type { CompilePipeRegistry } from '../api/types.js';
import type { ParsedPipeCall } from './pipes.js';

export const builtInPipeNames = [
  'uppercase',
  'lowercase',
  'titlecase',
  'sentencecase',
  'truncate',
  'fallback',
  'initials',
  'date',
  'time',
  'datetime',
  'relativeTime',
  'duration',
  'number',
  'percent',
  'currency',
  'compact',
  'filesize',
  'join',
  'count',
  'plural',
  'mask',
  'message',
  'messages',
] as const;

export function isKnownPipe(call: ParsedPipeCall, registry: CompilePipeRegistry | undefined): boolean {
  if (builtInPipeNames.includes(call.name as (typeof builtInPipeNames)[number])) {
    return true;
  }

  if (call.namespace.length > 0) {
    return isKnownPreset(call, registry);
  }

  return (registry?.pipes ?? []).some((pipe) => pipe.name === call.name);
}
```

Also add `isKnownPreset(...)`, `validatePipeArguments(...)`, and `suggestPipeName(...)`.

- [x] **Step 5: Add source-located diagnostics**

Create or modify `packages/compiler/src/template/pipe-diagnostics.ts`:

```ts
import type { CompileDiagnostic, CompilePipeRegistry } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { InterpolationBinding } from './bindings.js';
import { isKnownPipe, suggestPipeName, validatePipeArguments } from './pipe-registry.js';

export function diagnoseInterpolationPipes(
  binding: InterpolationBinding,
  templatePath: string,
  templateSource: string,
  registry: CompilePipeRegistry | undefined,
): CompileDiagnostic[] {
  if (binding.pipeExpression === null) {
    return [];
  }

  const diagnostics: CompileDiagnostic[] = [];

  for (const pipe of binding.pipeExpression.pipes) {
    if (!isKnownPipe(pipe, registry)) {
      diagnostics.push(
        createDiagnostic('VR_PIPE_UNKNOWN', 'error', `Pipe "${pipe.name}" is not registered.`, templatePath, binding.expressionSpan.line, binding.expressionSpan.column, {
          source: templateSource,
          span: binding.expressionSpan,
          suggestion: suggestPipeName(pipe.name),
          docsPath: '/docs/formatters',
        }),
      );
      continue;
    }

    diagnostics.push(...validatePipeArguments(pipe, templatePath, templateSource, binding.expressionSpan));
  }

  return diagnostics;
}
```

Adjust the exact `createDiagnostic(...)` call to match the current diagnostics helper signature.

- [x] **Step 6: Wire diagnostics into compile**

Modify `packages/compiler/src/api/compile-component.ts` after `templateBindings`:

```ts
const pipeDiagnostics = templateBindings.bindings.flatMap((binding) => {
  if (binding.kind !== 'interpolation') {
    return [];
  }

  return diagnoseInterpolationPipes(binding, source.templatePath, source.templateSource, options.pipeRegistry);
});
```

Push `...pipeDiagnostics` into `diagnostics`. Add `'template-pipe'` to features when any interpolation has `pipeExpression !== null`.

- [x] **Step 7: Run compiler diagnostics verification**

Run:

```sh
pnpm --filter @vanrot/compiler exec vitest run tests/template/pipe-diagnostics.test.ts
pnpm --filter @vanrot/compiler typecheck
```

Expected: both pass.

## Module 29G: Compiler Lowering And Generated Output

**Files:**
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/src/codegen/server-component.ts`
- Modify: `packages/compiler/src/codegen/state.ts`
- Modify: `packages/compiler/src/api/types.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`
- Test: `packages/compiler/tests/codegen/server-rendering.test.ts`
- Test: `packages/compiler/tests/api/compile-component.test.ts`

- [x] **Step 1: Write failing browser codegen tests**

Add to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
it('lowers interpolation pipe chains into formatter calls', () => {
  const result = compileComponent({
    componentPath: 'src/customer.page.ts',
    componentSource: 'export class CustomerPage { name = ""; }',
    templatePath: 'src/customer.page.html',
    templateSource: '{{ name | fallback("Unknown") | uppercase }}',
    stylePath: 'src/customer.page.css',
    styleSource: '',
  });

  expect(result.diagnostics).toEqual([]);
  expect(result.metadata.features).toContain('template-pipe');
  expect(result.js).toContain("from '@vanrot/formatters'");
  expect(result.js).toContain('applyVanrotPipeChain');
  expect(result.js).toContain('fallback');
  expect(result.js).toContain('uppercase');
});
```

- [x] **Step 2: Write failing server codegen tests**

Add to `packages/compiler/tests/codegen/server-rendering.test.ts`:

```ts
it('lowers server interpolation pipe chains into escaped formatter output', () => {
  const result = compileComponent(
    {
      componentPath: 'src/customer.page.ts',
      componentSource: 'export class CustomerPage { name = ""; }',
      templatePath: 'src/customer.page.html',
      templateSource: '{{ name | fallback("Unknown") | uppercase }}',
      stylePath: 'src/customer.page.css',
      styleSource: '',
    },
    { target: 'server' },
  );

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain("from '@vanrot/formatters'");
  expect(result.js).toContain('applyVanrotPipeChain');
});
```

- [x] **Step 3: Run codegen tests and verify they fail**

Run:

```sh
pnpm --filter @vanrot/compiler exec vitest run tests/codegen/generate-component.test.ts tests/codegen/server-rendering.test.ts
```

Expected: fails because codegen still rewrites raw interpolation expressions.

- [x] **Step 4: Add generated pipe call shape**

Use one generated helper call for browser and server:

```ts
applyVanrotPipeChain(baseValue, [
  { name: 'fallback', args: ['Unknown'] },
  { name: 'uppercase', args: [] },
], __vanrotPipeContext)
```

This helper should be exported by `@vanrot/formatters`. If Module 29C used `createPipeRegistry(...).apply(...)`, add a named `applyVanrotPipeChain(...)` wrapper in `packages/formatters/src/registry.ts`.

- [x] **Step 5: Lower browser interpolation pipes**

In `packages/compiler/src/codegen/generate-component.ts`, when `parseInterpolation(...)` returns an expression with `pipeExpression`, rewrite only the `baseExpression` through `rewriteExpression(...)`, then render a generated formatter call using parsed pipe calls.

The generated expression should follow this shape:

```ts
applyVanrotPipeChain(rewrittenBaseExpression, generatedPipeCalls, __vanrotPipeContext)
```

Keep existing behavior unchanged when `pipeExpression === null`.

- [x] **Step 6: Lower server interpolation pipes**

In `packages/compiler/src/codegen/server-component.ts`, apply the same pipe lowering before `escapeHtml(...)`:

```ts
escapeHtml(applyVanrotPipeChain(rewrittenBaseExpression, generatedPipeCalls, __vanrotPipeContext))
```

Keep existing plain interpolation behavior unchanged.

- [x] **Step 7: Add formatter imports and context**

Modify compiler import generation so generated output imports:

```ts
import { applyVanrotPipeChain, createPipeContext } from '@vanrot/formatters';
```

When pipe features are present, generated component setup should include:

```ts
const __vanrotPipeContext = createPipeContext({
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
});
```

Use `options.pipeContext` when provided.

- [x] **Step 8: Run compiler codegen verification**

Run:

```sh
pnpm --filter @vanrot/formatters build
pnpm --filter @vanrot/compiler test
pnpm --filter @vanrot/compiler typecheck
pnpm --filter @vanrot/compiler build
```

Expected: all pass.

## Module 29H: `.pipe.ts` Discovery And Vite Diagnostics

**Files:**
- Create: `packages/vite-plugin/src/pipes/pipes-metadata.ts`
- Create: `packages/vite-plugin/src/pipes/pipes-diagnostics.ts`
- Modify: `packages/vite-plugin/src/plugin.ts`
- Modify: compile helper files under `packages/vite-plugin/src/`
- Create: `packages/vite-plugin/tests/pipes-metadata.test.ts`
- Create: `packages/vite-plugin/tests/pipes-diagnostics.test.ts`
- Modify: Vite fixtures under `packages/vite-plugin/tests/fixtures/basic-app/src/`
- Modify: `packages/vite-plugin/package.json` if it needs `@vanrot/formatters` or compiler dependency ordering.

- [x] **Step 1: Write failing metadata tests**

Create `packages/vite-plugin/tests/pipes-metadata.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { collectPipeMetadata } from '../src/pipes/pipes-metadata.js';

describe('collectPipeMetadata', () => {
  it('discovers custom pipes and presets from .pipe.ts files', () => {
    const metadata = collectPipeMetadata({
      root: '/repo',
      files: [
        {
          path: '/repo/src/claims/claims.pipe.ts',
          source: `
            import { datePattern, definePipe, enumPipe, maskPattern, numberPattern } from '@vanrot/formatters';
            export const invoice = datePattern("dd/MM/yyyy");
            export const malaysiaPhone = maskPattern("###-#######");
            export const accounting = numberPattern("(0,0.00)");
            export const claimStatus = definePipe("claimStatus", (status) => String(status));
          `,
        },
      ],
    });

    expect(metadata.registry.presets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ namespace: 'date', name: 'invoice', pattern: 'dd/MM/yyyy' }),
        expect.objectContaining({ namespace: 'mask', name: 'malaysiaPhone', pattern: '###-#######' }),
        expect.objectContaining({ namespace: 'number', name: 'accounting', pattern: '(0,0.00)' }),
      ]),
    );
    expect(metadata.registry.pipes).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'claimStatus' })]),
    );
  });
});
```

- [x] **Step 2: Write failing diagnostics tests**

Create `packages/vite-plugin/tests/pipes-diagnostics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { diagnosePipeMetadata } from '../src/pipes/pipes-diagnostics.js';

describe('diagnosePipeMetadata', () => {
  it('reports duplicate custom pipes and async pipe functions', () => {
    const diagnostics = diagnosePipeMetadata({
      registry: {
        pipes: [
          { name: 'claimStatus', sourcePath: '/repo/src/a.pipe.ts' },
          { name: 'claimStatus', sourcePath: '/repo/src/b.pipe.ts' },
          { name: 'asyncLabel', sourcePath: '/repo/src/c.pipe.ts', async: true },
        ],
        presets: [],
      },
      usages: [],
    });

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'VR_PIPE_DUPLICATE_NAME' }),
        expect.objectContaining({ code: 'VR_PIPE_ASYNC' }),
      ]),
    );
  });
});
```

- [x] **Step 3: Run Vite pipe tests and verify they fail**

Run:

```sh
pnpm --filter @vanrot/vite-plugin exec vitest run tests/pipes-metadata.test.ts tests/pipes-diagnostics.test.ts
```

Expected: fails because pipe Vite modules do not exist.

- [x] **Step 4: Implement metadata discovery**

Create `packages/vite-plugin/src/pipes/pipes-metadata.ts`.

The collector should:

- find `.pipe.ts` files;
- parse exported constants with the TypeScript compiler API or the repo’s existing TypeScript AST pattern;
- identify `datePattern(...)`, `numberPattern(...)`, `maskPattern(...)`, `definePipe(...)`, and `enumPipe(...)`;
- return compiler-ready `CompilePipeRegistry`;
- keep `sourcePath` on every pipe and preset.

Use this public shape:

```ts
export interface PipeSourceFile {
  path: string;
  source: string;
}

export interface CollectPipeMetadataInput {
  root: string;
  files?: PipeSourceFile[];
}

export interface PipeMetadataResult {
  registry: CompilePipeRegistry;
  diagnostics: CompileDiagnostic[];
}

export function collectPipeMetadata(input: CollectPipeMetadataInput): PipeMetadataResult;
```

- [x] **Step 5: Implement Vite diagnostics**

Create `packages/vite-plugin/src/pipes/pipes-diagnostics.ts`.

Diagnostics should include:

```ts
'VR_PIPE_DUPLICATE_NAME'
'VR_PIPE_DUPLICATE_PRESET'
'VR_PIPE_INVALID_DEFINITION'
'VR_PIPE_ASYNC'
```

Use `formatDiagnostic(...)` from `packages/vite-plugin/src/diagnostics.ts` for terminal output compatibility.

- [x] **Step 6: Wire plugin startup and rebuild**

Modify `packages/vite-plugin/src/plugin.ts`:

- collect pipe metadata after config/root resolution;
- pass `pipeRegistry` and `pipeContext` into compiler calls;
- report pipe metadata diagnostics in terminal;
- invalidate affected modules when `.pipe.ts` files change.

Use existing forms metadata integration as the local pattern.

- [x] **Step 7: Run Vite plugin verification**

Run:

```sh
pnpm --filter @vanrot/vite-plugin exec vitest run tests/pipes-metadata.test.ts tests/pipes-diagnostics.test.ts
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/vite-plugin typecheck
pnpm --filter @vanrot/vite-plugin build
```

Expected: all pass.

## Module 29I: Example App

**Files:**
- Create: `examples/formatters-pipes/package.json`
- Create: `examples/formatters-pipes/tsconfig.json`
- Create: `examples/formatters-pipes/vanrot.config.ts`
- Create: `examples/formatters-pipes/src/claim-status.ts`
- Create: `examples/formatters-pipes/src/business.pipe.ts`
- Create: `examples/formatters-pipes/src/summary.page.ts`
- Create: `examples/formatters-pipes/src/summary.page.html`
- Create: `examples/formatters-pipes/tests/formatters-pipes.test.ts`

- [x] **Step 1: Write failing example test**

Create `examples/formatters-pipes/tests/formatters-pipes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { compileComponentFromFiles } from '@vanrot/compiler';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

describe('formatters-pipes example', () => {
  it('compiles a page that uses built-in pipes, presets, enum pipes, and chained pipes', () => {
    const result = compileComponentFromFiles(
      {
        componentPath: join(root, 'src/summary.page.ts'),
        componentSource: readFileSync(join(root, 'src/summary.page.ts'), 'utf8'),
        templatePath: join(root, 'src/summary.page.html'),
        templateSource: readFileSync(join(root, 'src/summary.page.html'), 'utf8'),
        stylePath: join(root, 'src/summary.page.css'),
        styleSource: '',
      },
      {
        pipeRegistry: {
          pipes: [{ name: 'claimStatus', sourcePath: join(root, 'src/business.pipe.ts') }],
          presets: [
            { namespace: 'date', name: 'invoice', pattern: 'dd/MM/yyyy', sourcePath: join(root, 'src/business.pipe.ts') },
            { namespace: 'mask', name: 'malaysiaPhone', pattern: '###-#######', sourcePath: join(root, 'src/business.pipe.ts') },
          ],
        },
      },
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.metadata.features).toContain('template-pipe');
  });
});
```

- [x] **Step 2: Create example package files**

Create `examples/formatters-pipes/package.json`:

```json
{
  "name": "@vanrot/example-formatters-pipes",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "pretest": "pnpm --filter @vanrot/formatters build && pnpm --filter @vanrot/compiler build",
    "test": "vitest run",
    "pretypecheck": "pnpm --filter @vanrot/formatters build && pnpm --filter @vanrot/compiler build",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@vanrot/compiler": "file:../../packages/compiler",
    "@vanrot/formatters": "file:../../packages/formatters"
  },
  "devDependencies": {
    "vitest": "^4.0.14"
  }
}
```

Create `examples/formatters-pipes/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "vanrot.config.ts"]
}
```

- [x] **Step 3: Create example sources**

Create `examples/formatters-pipes/vanrot.config.ts`:

```ts
import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  formatting: {
    locale: 'ms-MY',
    timezone: 'Asia/Kuala_Lumpur',
    currency: 'MYR',
  },
});
```

Create `examples/formatters-pipes/src/claim-status.ts`:

```ts
export enum ClaimStatus {
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
  PendingReview = 'PENDING_REVIEW',
}
```

Create `examples/formatters-pipes/src/business.pipe.ts`:

```ts
import { datePattern, enumPipe, maskPattern } from '@vanrot/formatters';
import { ClaimStatus } from './claim-status.js';

export const invoice = datePattern('dd/MM/yyyy');
export const malaysiaPhone = maskPattern('###-#######');

export const claimStatus = enumPipe('claimStatus', ClaimStatus, {
  [ClaimStatus.Approved]: 'Approved',
  [ClaimStatus.Rejected]: 'Rejected',
  [ClaimStatus.PendingReview]: 'Pending review',
  fallback: 'Unknown',
});
```

Create `examples/formatters-pipes/src/summary.page.ts`:

```ts
import { ClaimStatus } from './claim-status.js';

export class SummaryPage {
  customerName = '';
  claimStatus = ClaimStatus.PendingReview;
  createdAt = new Date('2026-06-05T10:30:00.000Z');
  amount = 1234.5;
  phone = '0123456789';
  description = 'Long enterprise claim description';
}
```

Create `examples/formatters-pipes/src/summary.page.html`:

```html
<section>
  <h1>{{ customerName | fallback("Unknown") | uppercase }}</h1>
  <p>{{ claimStatus | claimStatus }}</p>
  <p>{{ createdAt | date.invoice }}</p>
  <p>{{ amount | currency }}</p>
  <p>{{ phone | mask.malaysiaPhone }}</p>
  <p>{{ description | truncate(20) }}</p>
</section>
```

- [x] **Step 4: Run example verification**

Run:

```sh
pnpm --filter @vanrot/example-formatters-pipes test
pnpm --filter @vanrot/example-formatters-pipes typecheck
```

Expected: both pass.

## Module 29J: Docs, AI Docs, And Reference Metadata

**Files:**
- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `apps/vanrot-site/src/docs/framework-guides.ts`
- Modify: `apps/vanrot-site/src/docs/framework-reference.json`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`
- Modify: `apps/vanrot-site/tests/framework-reference.test.ts`
- Modify: `apps/vanrot-site/tests/site-polish.test.ts`
- Modify: `docs/ai/**` after AI build

- [x] **Step 1: Write failing site tests for `/docs/formatters`**

Modify `apps/vanrot-site/tests/site-data.test.ts` so the docs route list expects:

```ts
expect(articleKeys).toContain('formatters');
```

Modify `apps/vanrot-site/tests/framework-reference.test.ts` so package/reference docs expect:

```ts
expect(reference.packages.some((entry) => entry.name === '@vanrot/formatters')).toBe(true);
expect(reference.publicApis.some((entry) => entry.packageName === '@vanrot/formatters')).toBe(true);
expect(reference.diagnostics.some((entry) => entry.code === 'VR_PIPE_UNKNOWN')).toBe(true);
```

- [x] **Step 2: Run site tests and verify they fail**

Run: `pnpm --filter @vanrot/vanrot-site test`

Expected: fails because the formatter docs and reference entries do not exist.

- [x] **Step 3: Add `/docs/formatters` guide**

Modify `apps/vanrot-site/src/docs/site-data.json` with a `formatters` article that covers:

- compiler-native syntax;
- built-in text pipes;
- built-in date/time pipes;
- built-in number/money pipes;
- list/count pipes;
- `mask(pattern)` and custom mask presets;
- forms message pipes;
- `.pipe.ts` role files;
- `definePipe(...)`;
- `enumPipe(...)`;
- formatting context from config;
- diagnostics and examples.

Use code examples from `docs/superpowers/specs/Phase-29.md` and avoid adding visible text that claims unsupported country-specific masks are built in.

- [x] **Step 4: Add docs exports and guide key**

Modify `apps/vanrot-site/src/docs/site-data.ts` and `framework-guides.ts` to include the new `formatters` article key and label.

- [x] **Step 5: Add framework reference entries**

Modify `apps/vanrot-site/src/docs/framework-reference.json`:

- package row for `@vanrot/formatters`;
- public APIs for `definePipe`, `enumPipe`, `datePattern`, `numberPattern`, `maskPattern`, `createPipeContext`, and `createPipeRegistry`;
- diagnostics for pipe codes;
- generated file/metadata row for `.pipe.ts` discovery;
- example row for `examples/formatters-pipes`;
- limitation row stating async pipes are unsupported.

- [x] **Step 6: Rebuild and verify AI docs**

Run:

```sh
node packages/cli/dist/bin.js ai build
node packages/cli/dist/bin.js ai verify
pnpm verify:site-docs
pnpm verify:site-format
pnpm verify:ai-docs
pnpm --filter @vanrot/vanrot-site test
```

Expected: all pass.

## Module 29K: Release, Pipeline, And Phase Trackers

**Files:**
- Modify: `publish.sh`
- Modify: `pnpm-lock.yaml`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/future-pipeline.md`
- Modify: `docs/superpowers/plans/Phase-29.md` during execution status updates

- [x] **Step 1: Add package to publish list**

Modify `publish.sh` so `PUBLISH_PACKAGES` includes:

```sh
  formatters
```

Place it near `forms` and before compiler consumers.

- [x] **Step 2: Refresh lockfile/package workspace**

Run: `pnpm install`

Expected: `pnpm-lock.yaml` includes `@vanrot/formatters` and workspace consumers.

- [x] **Step 3: Update maturity tracker**

Modify `docs/superpowers/feature-maturity.md` to add or update a Phase 29 row:

```md
| [x]  | Phase 29 | Post-production implementation: formatters and template pipes | Compiler-native template pipes, `@vanrot/formatters`, built-in formatter suite, `.pipe.ts` role files, custom presets, enum pipes, context, diagnostics, docs, and examples | Vanrot templates can express display formatting cleanly without runtime bloat; custom enterprise formatters are discoverable and compiler-diagnosed. |
```

During implementation, keep it unchecked until all closeout verification passes. Mark it checked only after completion.

- [x] **Step 4: Update final TDD inventory**

Modify `docs/superpowers/final-tdd-inventory.md` with rows for:

- `@vanrot/formatters`;
- compiler template pipe parser;
- pipe diagnostics;
- `.pipe.ts` role files;
- Vite pipe metadata/diagnostics;
- `/docs/formatters`;
- `examples/formatters-pipes`;
- AI docs/reference output.

- [x] **Step 5: Update future pipeline**

Modify `docs/superpowers/future-pipeline.md` so `Formatters And Template Pipes` records the Phase 29 shipped work and leaves only real deferred follow-ups, such as richer editor completions or future Forge UI consumption if they are not implemented.

- [x] **Step 6: Run phase docs verification**

Run:

```sh
pnpm verify:phase-docs
pnpm verify:final-tdd-inventory
```

Expected: both pass.

## Module 29L: Final Verification And Site Preview

**Files:**
- No new feature files unless verification exposes a bug.
- Update `docs/superpowers/plans/Phase-29.md` status only after all verification passes.

- [x] **Step 1: Run focused package verification**

Run:

```sh
pnpm --filter @vanrot/formatters test
pnpm --filter @vanrot/formatters typecheck
pnpm --filter @vanrot/formatters build
pnpm --filter @vanrot/compiler test
pnpm --filter @vanrot/compiler typecheck
pnpm --filter @vanrot/compiler build
pnpm --filter @vanrot/config test
pnpm --filter @vanrot/config typecheck
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/vite-plugin typecheck
pnpm --filter @vanrot/example-formatters-pipes test
pnpm --filter @vanrot/example-formatters-pipes typecheck
pnpm --filter @vanrot/vanrot-site test
```

Expected: all pass.

- [x] **Step 2: Run full verification**

Run:

```sh
pnpm verify
pnpm verify:size
pnpm verify:release-dry-run
PUBLISH_DRY_RUN=1 ./publish.sh
```

Expected:

- `pnpm verify` exits `0`;
- runtime remains below `1.98 KB` gzipped;
- release dry-run includes `@vanrot/formatters`;
- publish dry-run includes `@vanrot/formatters` package copy and tarball.

- [x] **Step 3: Restart Vanrot site dev server**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected: dev server starts at `http://127.0.0.1:1964`.

- [x] **Step 4: Verify docs route**

Run:

```sh
curl -sS -o /tmp/vanrot-formatters.html -w '%{http_code}' http://127.0.0.1:1964/docs/formatters
```

Expected: `200`.

- [x] **Step 5: Record final plan status**

Only after all verification passes, modify `docs/superpowers/plans/Phase-29.md` status from planned to:

```md
Implemented. Phase 29 closeout verification passed.
```

- [x] **Step 6: Final git status report**

Run:

```sh
git status --short --branch
```

Expected: working tree contains Phase 29 changes. Report changed files, verification results, whether `publish.sh` dry-run passed, whether it is safe to commit, whether it is safe to publish, and any unrelated dirty files left untouched.

---

## Self-Review Checklist

- [x] Every requirement in `docs/superpowers/specs/Phase-29.md` maps to at least one module above.
- [x] There are no placeholder markers or vague handoff tasks.
- [x] The plan keeps `@vanrot/runtime` out of formatter implementation.
- [x] The plan supports full suite in one phase, not a narrow MVP.
- [x] The plan uses inline execution only and avoids subagents.
- [x] The plan avoids `git add`, commit, and push unless the user explicitly asks.
