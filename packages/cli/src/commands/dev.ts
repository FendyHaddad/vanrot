import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function devCommand(
  _args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  context.reporter.heading('Starting Vanrot dev server');
  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vite', [], {
    cwd: context.cwd,
  });

  if (exitCode !== 0) {
    context.reporter.error('Dev server failed');
  }

  return { exitCode };
}
