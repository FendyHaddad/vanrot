import { formatConfigDiagnostic, loadVanrotProjectConfig } from '@vanrot/config';
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function buildCommand(
  _args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  context.reporter.heading('Building Vanrot app');
  const loaded = await loadVanrotProjectConfig(context.cwd);
  for (const diagnostic of loaded.diagnostics) {
    const message = formatConfigDiagnostic(diagnostic);
    if (diagnostic.severity === 'error') {
      context.reporter.error(message);
      return { exitCode: 1 };
    }

    context.reporter.warning('Config', message);
  }

  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vite', ['build'], {
    cwd: context.cwd,
  });

  if (exitCode !== 0) {
    context.reporter.error('Build failed');
  }

  return { exitCode };
}
