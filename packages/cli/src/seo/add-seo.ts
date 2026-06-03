import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { upsertVanrotConfigDomain } from '@vanrot/config';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import {
  generatedSeoUtilitySource,
  seoCliConfigDomain,
  seoCliPackageName,
  seoCliUtilityPath,
} from './constants.js';

interface PackageJsonLike {
  dependencies?: Record<string, string>;
}

const requirePackage = createRequire(import.meta.url);
const cliPackage = requirePackage('../../package.json') as { version?: unknown };

export async function addSeoCommand(
  args: readonly string[],
  context: CommandContext,
): Promise<CommandResult> {
  const siteUrl = valueAfter(args, '--site-url');

  try {
    await upsertSeoDependency(context.cwd);
    await upsertSeoConfig(context.cwd, siteUrl);
    await writeSeoUtility(context.cwd);
    context.reporter.heading('Added SEO support', seoCliPackageName);
    context.reporter.nextSteps(['Run vr doctor', 'Review src/app/seo.ts']);
    return ok();
  } catch (error) {
    context.reporter.error(error instanceof Error ? error.message : 'Could not add SEO support.');
    return fail();
  }
}

async function upsertSeoDependency(cwd: string): Promise<void> {
  const packagePath = join(cwd, 'package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as PackageJsonLike;
  const dependencies = packageJson.dependencies ?? {};
  dependencies[seoCliPackageName] = createRegistryDependencyVersion();
  packageJson.dependencies = dependencies;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

async function upsertSeoConfig(cwd: string, siteUrl: string | undefined): Promise<void> {
  const configPath = join(cwd, 'vanrot.config.ts');
  const source = await readFile(configPath, 'utf8');
  const nextSource = upsertVanrotConfigDomain(
    source,
    seoCliConfigDomain,
    renderSeoConfigSource(siteUrl),
  );
  await writeFile(configPath, nextSource);
}

async function writeSeoUtility(cwd: string): Promise<void> {
  const filePath = join(cwd, seoCliUtilityPath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, generatedSeoUtilitySource);
}

export function renderSeoConfigSource(siteUrl: string | undefined): string {
  const siteUrlLine =
    siteUrl === undefined || siteUrl.trim() === '' ? '' : `    siteUrl: '${siteUrl.trim()}',\n`;

  return `{
${siteUrlLine}    defaults: {},
    social: {},
    robots: { directives: [] },
    sitemap: { enabled: true, routes: [] },
    structuredData: {},
    diagnostics: { mode: 'warn' },
  }`;
}

function createRegistryDependencyVersion(): string {
  if (typeof cliPackage.version !== 'string' || cliPackage.version.trim() === '') {
    throw new Error('Missing @vanrot/cli package version.');
  }

  return `^${cliPackage.version}`;
}

function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}
