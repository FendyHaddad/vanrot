import type { CliDiagnosticMetadata } from '../diagnostics/catalog.js';

export type StructuredOutputMode = 'human' | 'json' | 'jsonl';

export interface OutputMode {
  quiet: boolean;
  verbose: boolean;
  color: boolean;
  interactive: boolean;
  structured: StructuredOutputMode;
}

export interface ParsedOutputMode {
  args: string[];
  mode: OutputMode;
  error: CliDiagnosticMetadata | undefined;
}

export interface ResultEvent {
  type: 'result';
  command: string;
  exitCode: number;
}

export type JsonEvent = ResultEvent;

export function parseOutputMode(args: string[]): ParsedOutputMode {
  const remaining: string[] = [];
  let quiet = false;
  let verbose = false;
  let color = true;
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

  const structured = json ? 'json' : jsonl ? 'jsonl' : 'human';
  const mode = {
    quiet,
    verbose,
    color: color && structured === 'human',
    interactive: interactive && structured === 'human',
    structured,
  } satisfies OutputMode;

  if (json && jsonl) {
    return {
      args: remaining,
      mode,
      error: {
        code: 'VR_JSON_MODE_CONFLICT',
        message: '--json and --jsonl cannot be used together',
        nextStep: 'Choose either --json or --jsonl.',
      },
    };
  }

  return { args: remaining, mode, error: undefined };
}

export function renderJsonEvent(event: JsonEvent): string {
  return JSON.stringify(event, null, 2);
}

export function renderJsonLineEvent(event: JsonEvent): string {
  return JSON.stringify(event);
}
