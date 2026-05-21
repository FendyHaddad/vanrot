import { createAiRules } from '../intelligence/ai-rules.js';
import { writeVanrotFile } from '../intelligence/write-vanrot-file.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function initAiCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  if (args.length > 0) {
    context.reporter.error('Unknown option for vr init-ai', `Unexpected argument: ${args[0]}`);
    return fail();
  }

  try {
    const writtenPath = await writeVanrotFile(context.cwd, 'ai-rules.md', createAiRules());

    context.reporter.heading('Vanrot AI Rules');
    context.reporter.success('wrote AI rules', writtenPath);
    return ok();
  } catch (error) {
    context.reporter.error('Could not write AI rules', messageFrom(error));
    return fail();
  }
}

function messageFrom(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
