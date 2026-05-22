import { formatConfigDiagnostic, loadVanrotProjectConfig } from '@vanrot/config';
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function testCommand(
  _args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  context.reporter.heading('Running Vanrot tests');
  const loaded = await loadVanrotProjectConfig(context.cwd);
  for (const diagnostic of loaded.diagnostics) {
    const message = formatConfigDiagnostic(diagnostic);
    if (diagnostic.severity === 'error') {
      context.reporter.error(message);
      return { exitCode: 1 };
    }

    context.reporter.warning('Config', message);
  }

  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vitest', ['run'], {
    cwd: context.cwd,
  });

  if (exitCode !== 0) {
    context.reporter.error('Tests failed');
  }

  return { exitCode };
}
