import { addUiPrimitive } from '../add/add-ui.js';
import { addSeoCommand } from '../seo/add-seo.js';
import { seoCliCommandName } from '../seo/constants.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function addCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  if (args[0] === seoCliCommandName) {
    return addSeoCommand(args.slice(1), context);
  }

  return addUiPrimitive(args, context);
}
