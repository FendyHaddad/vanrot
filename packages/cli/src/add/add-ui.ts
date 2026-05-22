import { defaultUiPrefix, uiAppFile, uiPrimitiveType } from '@vanrot/ui';
import { isKebabCase } from '../generate/names.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import {
  assertFilesMissing,
  ensurePackageJsonDevDependency,
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
  includeTest: boolean;
}

const addUiFlag = {
  test: '--test',
} as const;

const testingDependency = {
  name: '@vanrot/testing',
  fallbackVersion: '^0.1.0',
  versionSourceNames: ['@vanrot/cli', '@vanrot/ui', '@vanrot/runtime'],
} as const;

const testingEnvironmentDependency = {
  name: 'jsdom',
  fallbackVersion: '^29.1.1',
  versionSourceNames: ['jsdom'],
} as const;

export async function addUiPrimitive(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const request = parseAddUiRequest(args);

  if (request === null) {
    context.reporter.error(
      'Usage: vr add button [--test]',
      'Or use: vr add <local-prefix> button [--test]',
    );
    return fail();
  }

  if (request.primitive !== uiPrimitiveType.button) {
    context.reporter.error(
      `Unsupported UI primitive: ${request.primitive}`,
      `Supported UI primitives: ${uiPrimitiveType.button}`,
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
    const files = await renderButtonFiles(request.prefix, {
      includeTest: request.includeTest,
    });
    const tokens = await readTokenCss();
    const usage = await readHomeButtonUsage();

    await assertFilesMissing(context.cwd, files.map((file) => file.path));
    if (request.includeTest) {
      await ensurePackageJsonDevDependency(
        context.cwd,
        testingDependency.name,
        testingDependency.fallbackVersion,
        testingDependency.versionSourceNames,
      );
      await ensurePackageJsonDevDependency(
        context.cwd,
        testingEnvironmentDependency.name,
        testingEnvironmentDependency.fallbackVersion,
        testingEnvironmentDependency.versionSourceNames,
      );
    }
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
  const parsed = parseAddUiArgs(args);

  if (parsed === null) {
    return null;
  }

  if (parsed.values.length === 1) {
    return {
      prefix: defaultUiPrefix,
      primitive: parsed.values[0] ?? '',
      includeTest: parsed.includeTest,
    };
  }

  if (parsed.values.length === 2) {
    return {
      prefix: parsed.values[0] ?? '',
      primitive: parsed.values[1] ?? '',
      includeTest: parsed.includeTest,
    };
  }

  return null;
}

function parseAddUiArgs(args: readonly string[]): { values: string[]; includeTest: boolean } | null {
  if (!args.includes(addUiFlag.test)) {
    return {
      values: [...args],
      includeTest: false,
    };
  }

  if (args.at(-1) !== addUiFlag.test) {
    return null;
  }

  return {
    values: args.slice(0, -1),
    includeTest: true,
  };
}
