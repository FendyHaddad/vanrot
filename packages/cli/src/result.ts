import type { ProcessRunner } from './process/runner.js';
import type { Reporter } from './reporter/reporter.js';

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
