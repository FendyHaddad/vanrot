import { migrateVanrotConfig, recoverVanrotConfig } from '@vanrot/config';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function configCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  const action = args[0];
  const force = args.includes('--force');
  const destructive = args.includes('--destructive');
  const recoverAlias = args.includes('--recover');

  if (action === 'migrate' && recoverAlias) {
    const result = await recoverVanrotConfig(context.cwd, { force: true });

    context.reporter.success(
      result.written ? 'Recovered vanrot.config.ts' : 'vanrot.config.ts already exists',
      result.filePath,
    );

    return ok();
  }

  if (action === 'migrate') {
    const result = await migrateVanrotConfig(context.cwd, { destructive });

    context.reporter.success(
      result.written ? 'Created vanrot.config.ts' : 'vanrot.config.ts already exists',
      result.filePath,
    );

    return ok();
  }

  if (action === 'recover') {
    const result = await recoverVanrotConfig(context.cwd, { force });

    for (const diagnostic of result.diagnostics) {
      context.reporter.warning(
        diagnostic.code,
        `${diagnostic.message} ${diagnostic.suggestion}`.trim(),
      );
    }

    context.reporter.success(
      result.written ? 'Recovered vanrot.config.ts' : 'vanrot.config.ts already exists',
      result.filePath,
    );

    return ok();
  }

  context.reporter.error(
    'Usage: vr config migrate [--destructive]',
    'Or run: vr config recover [--force] or vr config migrate --recover',
  );
  return fail();
}
