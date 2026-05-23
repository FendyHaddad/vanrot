import { writeAiContext } from '../ai/context.js';
import { writeAiDoctor } from '../ai/doctor.js';
import { writeAiPrompt } from '../ai/prompt.js';
import { createAiRules } from '../intelligence/ai-rules.js';
import { writeVanrotFile } from '../intelligence/write-vanrot-file.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { gitignoreAiDirectory } from './ai.js';
import { commandInvocation, commandName } from './metadata.js';

export async function initAiCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  if (args.length > 0) {
    context.reporter.error(
      `Unknown option for ${commandInvocation(commandName.initAi)}`,
      `Unexpected argument: ${args[0]}`,
    );
    return fail();
  }

  try {
    const rulesPath = await writeVanrotFile(context.cwd, 'ai-rules.md', createAiRules());
    const contextPath = await writeAiContext(context.cwd);
    const promptPath = await writeAiPrompt(context.cwd);
    const doctorPath = await writeAiDoctor(context.cwd);
    await gitignoreAiDirectory(context.cwd);

    context.reporter.heading('Vanrot AI Rules');
    context.reporter.success('wrote AI rules', rulesPath);
    context.reporter.success('wrote AI context', contextPath);
    context.reporter.success('wrote AI prompt', promptPath);
    context.reporter.success('wrote AI doctor report', doctorPath);
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
