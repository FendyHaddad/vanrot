import { writeApp } from '../create/write-app.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function createCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const appName = args.find((arg) => !arg.startsWith('-'));
  const workspace = args.includes('--workspace');
  const force = args.includes('--force');

  if (appName === undefined) {
    context.reporter.error('Missing app name.', 'Run vr create <name>.');
    return fail();
  }

  try {
    const result = await writeApp({
      cwd: context.cwd,
      appName,
      workspace,
      force,
    });

    context.reporter.heading(`Created ${appName}`, `${result.files.length} files`);
    context.reporter.nextSteps([
      `cd ${appName}`,
      workspace ? 'pnpm install' : 'npm install',
      'vr dev',
    ]);
    return ok();
  } catch (error) {
    context.reporter.error(
      'Target directory is not empty.',
      error instanceof Error ? error.message : undefined,
    );
    return fail();
  }
}
