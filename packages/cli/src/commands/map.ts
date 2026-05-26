import { loadVanrotProjectConfig } from '@vanrot/config';
import { buildProjectMap } from '../intelligence/project-map.js';
import { writeVanrotFile } from '../intelligence/write-vanrot-file.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { commandInvocation, commandName } from './metadata.js';

export async function mapCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  if (args.length > 0) {
    context.reporter.error(
      `Unknown option for ${commandInvocation(commandName.map)}`,
      `Unexpected argument: ${args[0]}`,
    );
    return fail();
  }

  try {
    const loaded = await loadVanrotProjectConfig(context.cwd);
    const map = await buildProjectMap(context.cwd, {
      ai: loaded.config.ai,
      configSource: loaded.exists ? 'vanrot.config.ts' : null,
    });
    const writtenPath = await writeVanrotFile(
      context.cwd,
      'project-map.json',
      `${JSON.stringify(map, null, 2)}\n`,
    );

    context.reporter.heading('Vanrot Project Map');
    context.reporter.success('wrote project map', writtenPath);
    context.reporter.success(
      'graph manifest ready',
      `${map.graph.nodes.length} nodes, ${map.graph.edges.length} edges`,
    );
    for (const reason of map.stale.reasons) {
      context.reporter.warning('graph manifest stale', reason);
    }
    return ok();
  } catch (error) {
    context.reporter.error('Could not write project map', messageFrom(error));
    return fail();
  }
}

function messageFrom(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
