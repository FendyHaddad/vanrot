import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function testCommand(
  _args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  context.reporter.heading('Running Vanrot tests');
  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vitest', ['run'], {
    cwd: context.cwd,
  });

  if (exitCode !== 0) {
    context.reporter.error('Tests failed');
  }

  return { exitCode };
}
