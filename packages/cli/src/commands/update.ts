import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { configCommand } from './config.js';
import { initAiCommand } from './init-ai.js';
import { mapCommand } from './map.js';
import { commandInvocation, commandName } from './metadata.js';

const updateTarget = {
  ai: 'ai',
  all: 'all',
  config: 'config',
  map: 'map',
  project: 'project',
} as const;

type UpdateTarget = (typeof updateTarget)[keyof typeof updateTarget];

const updateTargets = new Set<string>(Object.values(updateTarget));

export async function updateCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const target = args[0] ?? updateTarget.all;

  if (!updateTargets.has(target)) {
    context.reporter.error('Unknown update target', 'VR_UPDATE_TARGET_INVALID');
    context.reporter.nextSteps([`Run ${commandInvocation(commandName.update)} --help.`]);
    return fail();
  }

  if (args.length > 1) {
    context.reporter.error('Unknown update option', 'VR_UPDATE_TARGET_INVALID');
    context.reporter.nextSteps([`Run ${commandInvocation(commandName.update)} --help.`]);
    return fail();
  }

  context.reporter.heading('Vanrot Update', target);

  try {
    return await runUpdateTarget(target as UpdateTarget, context);
  } catch (error) {
    context.reporter.error('Vanrot update failed', 'VR_UPDATE_FAILED');
    context.reporter.nextSteps([messageFrom(error)]);
    return fail();
  }
}

async function runUpdateTarget(
  target: UpdateTarget,
  context: CommandContext,
): Promise<CommandResult> {
  if (target === updateTarget.config) {
    return configCommand(['migrate'], context);
  }

  if (target === updateTarget.map) {
    return mapCommand([], context);
  }

  if (target === updateTarget.ai) {
    return initAiCommand([], context);
  }

  const configResult = await configCommand(['migrate'], context);
  if (configResult.exitCode !== 0) {
    return configResult;
  }

  const mapResult = await mapCommand([], context);
  if (mapResult.exitCode !== 0) {
    return mapResult;
  }

  const aiResult = await initAiCommand([], context);
  if (aiResult.exitCode !== 0) {
    return aiResult;
  }

  return ok();
}

function messageFrom(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
