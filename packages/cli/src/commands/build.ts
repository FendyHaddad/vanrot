import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function buildCommand(
  _args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  context.reporter.heading('Building Vanrot app');
  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vite', ['build'], {
    cwd: context.cwd,
  });

  if (exitCode !== 0) {
    context.reporter.error('Build failed');
  }

  return { exitCode };
}
