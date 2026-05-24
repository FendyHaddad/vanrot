import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  loadVanrotProjectConfig,
  upsertVanrotConfigDomain,
  vanrotConfigFileName,
  vanrotUiStyleMode,
} from '@vanrot/config';
import { defaultUiPrefix, uiAppFile, uiPrimitiveOrder, type UiPrimitiveType } from '@vanrot/ui';
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
  primitiveStyleImport,
  readPrimitiveHomeUsage,
  readTokenCss,
  readVanrotStylesCss,
  renderUiPrimitiveFiles,
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
      'Usage: vr add <primitive> [--test]',
      [
        'Or use: vr add <local-prefix> <primitive> [--test]',
        `Supported UI primitives: ${supportedUiPrimitiveList()}`,
      ].join('\n'),
    );
    return fail();
  }

  const primitive = request.primitive;

  if (!isSupportedUiPrimitive(primitive)) {
    context.reporter.error(
      `Unsupported UI primitive: ${primitive}`,
      `Supported UI primitives: ${supportedUiPrimitiveList()}`,
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
    const files = await renderUiPrimitiveFiles(primitive, request.prefix, {
      includeTest: request.includeTest,
    });
    const tokens = await readTokenCss();
    const vanrotstyles = await readVanrotStylesCss();
    const styleMode = await readUiStyleMode(context.cwd);
    const usage = await readPrimitiveHomeUsage(primitive);

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

    if (styleMode === vanrotUiStyleMode.vanrotstyles) {
      await writeFileIfMissing(context.cwd, uiAppFile.vanrotstyles, vanrotstyles);
      await ensureMainImport(context.cwd, uiAppFile.vanrotstylesImport);
    }

    for (const file of files) {
      await writeNewFile(context.cwd, file.path, file.content);
    }

    await ensureLineInFile(context.cwd, uiAppFile.styleEntry, primitiveStyleImport(primitive, request.prefix));
    await ensureMainImport(context.cwd, uiAppFile.styleEntryImport);
    await ensureUiDomainInConfig(context.cwd);

    const homePatch = await patchStarterHome(context.cwd, usage);
    context.reporter.success(`Added ${primitive}`, files.map((file) => file.path).join('\n'));

    if (!homePatch.patched) {
      context.reporter.nextSteps([
        `Add the <vr-${primitive}> snippet to the page where this primitive should appear.`,
      ]);
    }

    return ok();
  } catch (error) {
    context.reporter.error(error instanceof Error ? error.message : 'Failed to add UI primitive.');
    return fail();
  }
}

function isSupportedUiPrimitive(primitive: string): primitive is UiPrimitiveType {
  return uiPrimitiveOrder.some((candidate) => candidate === primitive);
}

function supportedUiPrimitiveList(): string {
  return uiPrimitiveOrder.join(', ');
}

async function readUiStyleMode(cwd: string): Promise<string> {
  const loaded = await loadVanrotProjectConfig(cwd);
  return loaded.config.ui.styles;
}

async function ensureUiDomainInConfig(cwd: string): Promise<void> {
  const configPath = join(cwd, vanrotConfigFileName);

  if (!(await fileExists(configPath))) {
    return;
  }

  const currentConfig = await readFile(configPath, 'utf8');
  const nextConfig = upsertVanrotConfigDomain(
    currentConfig,
    'ui',
    "{ flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' }",
  );

  if (nextConfig === currentConfig) {
    return;
  }

  await writeFile(configPath, nextConfig);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
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
