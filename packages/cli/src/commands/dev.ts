import { formatConfigDiagnostic, loadVanrotProjectConfig } from '@vanrot/config';
import { parseEngineFlags } from '../engine/engine-flags.js';
import { runEngineCommand } from '../engine/run-engine-command.js';
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function devCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  context.reporter.heading('Starting Vanrot dev server');
  const engineFlags = parseEngineFlags(args);
  if (engineFlags.diagnostic !== undefined) {
    context.reporter.error(engineFlags.diagnostic.message, engineFlags.diagnostic.suggestion);
    return { exitCode: 1 };
  }

  const loaded = await loadVanrotProjectConfig(context.cwd);
  for (const diagnostic of loaded.diagnostics) {
    const message = formatConfigDiagnostic(diagnostic);
    if (diagnostic.severity === 'error') {
      context.reporter.error(message);
      return { exitCode: 1 };
    }

    context.reporter.warning('Config', message);
  }

  const exitCode = await runEngineCommand({
    command: 'dev',
    engine: engineFlags.engineOverride ?? loaded.config.engine,
    cwd: context.cwd,
    port: loaded.config.devServer.port,
    runner: context.runner ?? createNodeProcessRunner(),
  });

  if (exitCode !== 0) {
    context.reporter.error('Dev server failed');
  }

  return { exitCode };
}
