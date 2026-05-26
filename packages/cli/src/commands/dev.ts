import { formatConfigDiagnostic, loadVanrotProjectConfig } from '@vanrot/config';
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function devCommand(
  _args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  context.reporter.heading('Starting Vanrot dev server');
  const loaded = await loadVanrotProjectConfig(context.cwd);
  for (const diagnostic of loaded.diagnostics) {
    const message = formatConfigDiagnostic(diagnostic);
    if (diagnostic.severity === 'error') {
      context.reporter.error(message);
      return { exitCode: 1 };
    }

    context.reporter.warning('Config', message);
  }

  const exitCode = await (context.runner ?? createNodeProcessRunner()).run(
    'vite',
    ['--host', '127.0.0.1', '--port', String(loaded.config.devServer.port)],
    {
      cwd: context.cwd,
    },
  );

  if (exitCode !== 0) {
    context.reporter.error('Dev server failed');
  }

  return { exitCode };
}
