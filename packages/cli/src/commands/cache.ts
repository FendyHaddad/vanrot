import { access, rm } from 'node:fs/promises';
import { join } from 'node:path';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { commandInvocation, commandName } from './metadata.js';

const cacheAction = {
  clean: 'clean',
} as const;

const cleanFlag = {
  dryRun: '--dry-run',
} as const;

const ownedCachePaths = ['.vanrot/cache', '.vanrot/project-map.json'] as const;

export async function cacheCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const [action, ...flags] = args;

  if (action !== cacheAction.clean) {
    context.reporter.error('Unknown cache action', 'VR_CACHE_ACTION_INVALID');
    context.reporter.nextSteps([`Run ${commandInvocation(commandName.cache)} --help.`]);
    return fail();
  }

  const unknownFlag = flags.find((flag) => flag !== cleanFlag.dryRun);

  if (unknownFlag !== undefined) {
    context.reporter.error('Unknown cache option', `Unexpected argument: ${unknownFlag}`);
    return fail();
  }

  const dryRun = flags.includes(cleanFlag.dryRun);
  const existingPaths = await existingOwnedCachePaths(context.cwd);
  context.reporter.heading('Vanrot Cache', dryRun ? 'dry run' : 'clean');

  if (existingPaths.length === 0) {
    context.reporter.success('nothing to clean', 'No Vanrot-owned cache paths found.');
    return ok();
  }

  for (const cachePath of existingPaths) {
    if (dryRun) {
      context.reporter.success('would remove', cachePath);
      continue;
    }

    await rm(join(context.cwd, cachePath), { recursive: true, force: true });
    context.reporter.success('removed', cachePath);
  }

  return ok();
}

async function existingOwnedCachePaths(cwd: string): Promise<string[]> {
  const existingPaths: string[] = [];

  for (const cachePath of ownedCachePaths) {
    if (await exists(join(cwd, cachePath))) {
      existingPaths.push(cachePath);
    }
  }

  return existingPaths;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
