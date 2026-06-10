import { resolveCreateBehaviorSelection } from '../create/behavior-prompt.js';
import { resolveCreateEngineSelection } from '../create/engine-prompt.js';
import { writeApp } from '../create/write-app.js';
import { resolveCreateSeoSelection } from '../seo/create-seo.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { commandInvocation, commandName, commandUsage } from './metadata.js';

export async function createCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const engineSelection = resolveCreateEngineSelection(args);
  if (engineSelection.diagnostic !== undefined) {
    context.reporter.error(
      engineSelection.diagnostic.message,
      engineSelection.diagnostic.suggestion,
    );
    return fail();
  }

  const createArgs = engineSelection.remainingArgs;
  const appName = createArgs.find((arg) => !arg.startsWith('-'));
  const workspace = createArgs.includes('--workspace');
  const force = createArgs.includes('--force');
  const behaviorFlag = valueAfter(createArgs, '--behavior');
  const noBehavior = createArgs.includes('--no-behavior');
  const seoFlag = createArgs.includes('--seo');
  const noSeo = createArgs.includes('--no-seo');
  const seoSiteUrl = valueAfter(createArgs, '--seo-site-url');

  if (appName === undefined) {
    context.reporter.error('Missing app name.', `Run ${commandUsage(commandName.create)}.`);
    return fail();
  }

  if (behaviorFlag !== undefined && noBehavior) {
    context.reporter.error('Choose either --behavior or --no-behavior.');
    return fail();
  }

  if (seoFlag && noSeo) {
    context.reporter.error('Choose either --seo or --no-seo.');
    return fail();
  }

  try {
    const behavior = await resolveCreateBehaviorSelection({
      behaviorFlag,
      noBehavior,
      interactive: process.stdin.isTTY === true && process.stdout.isTTY === true,
    });
    const seo = await resolveCreateSeoSelection({
      seoFlag,
      noSeo,
      siteUrl: seoSiteUrl,
      interactive: process.stdin.isTTY === true && process.stdout.isTTY === true,
    });
    const result = await writeApp({
      cwd: context.cwd,
      appName,
      workspace,
      force,
      engine: engineSelection.engine,
      behavior,
      seo,
    });

    context.reporter.heading(`Created ${appName}`, `${result.files.length} files`);
    context.reporter.nextSteps([
      `cd ${appName}`,
      workspace ? 'pnpm install' : 'npm install',
      commandInvocation(commandName.dev),
    ]);
    return ok();
  } catch (error) {
    context.reporter.error(error instanceof Error ? error.message : 'Create failed.');
    return fail();
  }
}

function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}
