import { addUiPrimitive } from '../add/add-ui.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function addCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  return addUiPrimitive(args, context);
}
