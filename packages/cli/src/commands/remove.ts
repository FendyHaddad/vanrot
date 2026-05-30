import { removeBehavior } from '../remove/remove-behavior.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { commandName, commandUsage } from './metadata.js';

export async function removeCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const [target, behaviorName] = args.filter((arg) => !arg.startsWith('-'));
  const removePackage = args.includes('--package');

  if (target !== 'behavior' || behaviorName === undefined) {
    context.reporter.error('Missing behavior name.', `Run ${commandUsage(commandName.remove)}.`);
    return fail();
  }

  try {
    const result = await removeBehavior({
      cwd: context.cwd,
      behaviorName,
      removePackage,
    });

    context.reporter.success('removed behavior', result.changedFiles.join(', '));
    return ok();
  } catch (error) {
    context.reporter.error(
      'Could not remove behavior.',
      error instanceof Error ? error.message : undefined,
    );
    return fail();
  }
}
