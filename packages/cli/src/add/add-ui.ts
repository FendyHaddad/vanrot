import { defaultUiPrefix, uiAppFile, uiPrimitiveType } from '@vanrot/ui';
import { isKebabCase } from '../generate/names.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import {
  assertFilesMissing,
  ensureLineInFile,
  ensureMainImport,
  writeFileIfMissing,
  writeNewFile,
} from './file-edits.js';
import { patchStarterHome } from './starter-home.js';
import {
  buttonStyleImport,
  readHomeButtonUsage,
  readTokenCss,
  renderButtonFiles,
} from './ui-assets.js';

interface AddUiRequest {
  prefix: string;
  primitive: string;
}

export async function addUiPrimitive(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const request = parseAddUiRequest(args);

  if (request === null) {
    context.reporter.error('Usage: vr add button', 'Or use: vr add <local-prefix> button');
    return fail();
  }

  if (request.primitive !== uiPrimitiveType.button) {
    context.reporter.error(
      `Unsupported UI primitive: ${request.primitive}`,
      `Phase 9 supports: ${uiPrimitiveType.button}`,
    );
    return fail();
  }

  if (!isKebabCase(request.prefix)) {
    context.reporter.error(
      `Invalid UI primitive prefix: ${request.prefix}`,
      'Use lowercase kebab-case, for example primary or marketing-primary.',
    );
    return fail();
  }

  try {
    const files = await renderButtonFiles(request.prefix);
    const tokens = await readTokenCss();
    const usage = await readHomeButtonUsage();

    await assertFilesMissing(context.cwd, files.map((file) => file.path));
    await writeFileIfMissing(context.cwd, uiAppFile.tokens, tokens);

    for (const file of files) {
      await writeNewFile(context.cwd, file.path, file.content);
    }

    await ensureLineInFile(context.cwd, uiAppFile.styleEntry, buttonStyleImport(request.prefix));
    await ensureMainImport(context.cwd, uiAppFile.styleEntryImport);

    const homePatch = await patchStarterHome(context.cwd, usage);
    context.reporter.success(`Added ${request.primitive}`, files.map((file) => file.path).join('\n'));

    if (!homePatch.patched) {
      context.reporter.nextSteps([
        `Add the <vr-button> snippet to the page where this button should appear.`,
      ]);
    }

    return ok();
  } catch (error) {
    context.reporter.error(error instanceof Error ? error.message : 'Failed to add UI primitive.');
    return fail();
  }
}

function parseAddUiRequest(args: readonly string[]): AddUiRequest | null {
  if (args.length === 1) {
    return {
      prefix: defaultUiPrefix,
      primitive: args[0] ?? '',
    };
  }

  if (args.length === 2) {
    return {
      prefix: args[0] ?? '',
      primitive: args[1] ?? '',
    };
  }

  return null;
}
