import { access, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { updateCommand } from './update.js';

const requirePackage = createRequire(import.meta.url);
const cliPackage = requirePackage('../../package.json') as { version?: unknown };

const dependencyField = {
  dependencies: 'dependencies',
  devDependencies: 'devDependencies',
  optionalDependencies: 'optionalDependencies',
  peerDependencies: 'peerDependencies',
} as const;

const dependencyFields = Object.values(dependencyField);
const packageFileName = 'package.json';
const vanrotPackageScope = '@vanrot/';

interface UpgradeOptions {
  install: boolean;
  target: string;
  update: boolean;
}

interface PackageManager {
  command: string;
  args: string[];
}

export async function upgradeCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const options = parseUpgradeOptions(args);
  const packageJsonPath = join(context.cwd, packageFileName);
  const loaded = await readPackageJson(packageJsonPath, context);

  if (loaded === undefined) {
    return fail();
  }

  const upgraded = upgradeVanrotPackages(loaded, dependencyRange(options.target));

  if (upgraded.length === 0) {
    context.reporter.error('No Vanrot packages found in package.json', 'VR_UPGRADE_NO_PACKAGES');
    context.reporter.nextSteps(['Run vr create for new apps, or add Vanrot packages before upgrading.']);
    return fail();
  }

  context.reporter.heading('Vanrot Upgrade', options.target);

  await writeFile(packageJsonPath, `${JSON.stringify(loaded, null, 2)}\n`);

  for (const item of upgraded) {
    context.reporter.success(`upgraded ${item.name}`, `${item.from} -> ${item.to}`);
  }

  if (options.install) {
    const manager = await detectPackageManager(context.cwd);
    const exitCode = await (context.runner ?? createNodeProcessRunner()).run(
      manager.command,
      manager.args,
      { cwd: context.cwd },
    );

    if (exitCode !== 0) {
      context.reporter.error('Package manager install failed', 'VR_UPGRADE_PACKAGE_MANAGER_FAILED');
      context.reporter.nextSteps(['Fix the install error, then rerun vr upgrade.']);
      return fail();
    }
  }

  if (!options.update) {
    return ok();
  }

  return updateCommand([], context);
}

function parseUpgradeOptions(args: string[]): UpgradeOptions {
  const install = !args.includes('--no-install');
  const update = !args.includes('--no-update');
  const latest = args.includes('--latest');
  const targetArg = args.find((arg) => !arg.startsWith('--'));

  return {
    install,
    target: latest ? 'latest' : targetArg ?? currentCliVersion(),
    update,
  };
}

async function readPackageJson(
  packageJsonPath: string,
  context: CommandContext,
): Promise<Record<string, unknown> | undefined> {
  let source: string;

  try {
    source = await readFile(packageJsonPath, 'utf8');
  } catch {
    context.reporter.error('Could not read package.json', 'VR_UPGRADE_PACKAGE_JSON_MISSING');
    context.reporter.nextSteps(['Run vr upgrade from a Vanrot project root.']);
    return undefined;
  }

  try {
    return JSON.parse(source) as Record<string, unknown>;
  } catch {
    context.reporter.error('Could not parse package.json', 'VR_UPGRADE_PACKAGE_JSON_INVALID');
    context.reporter.nextSteps(['Fix package.json, then rerun vr upgrade.']);
    return undefined;
  }
}

function upgradeVanrotPackages(packageJson: Record<string, unknown>, range: string) {
  const upgraded: Array<{ name: string; from: string; to: string }> = [];

  for (const field of dependencyFields) {
    const dependencies = packageJson[field];
    if (!isDependencyRecord(dependencies)) {
      continue;
    }

    for (const [name, from] of Object.entries(dependencies)) {
      if (!name.startsWith(vanrotPackageScope)) {
        continue;
      }

      dependencies[name] = range;
      upgraded.push({ name, from, to: range });
    }
  }

  return upgraded.sort((left, right) => left.name.localeCompare(right.name));
}

function isDependencyRecord(value: unknown): value is Record<string, string> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === 'string');
}

function dependencyRange(target: string): string {
  if (target === 'latest' || target.includes(':')) {
    return target;
  }

  if (/^[~^<>=]/.test(target) || /^[a-z][a-z0-9._-]*$/i.test(target)) {
    return target;
  }

  return `^${target}`;
}

function currentCliVersion(): string {
  if (typeof cliPackage.version === 'string' && cliPackage.version.trim() !== '') {
    return cliPackage.version;
  }

  return 'latest';
}

async function detectPackageManager(cwd: string): Promise<PackageManager> {
  if (await fileExists(join(cwd, 'pnpm-lock.yaml'))) {
    return { command: 'pnpm', args: ['install'] };
  }

  if (await fileExists(join(cwd, 'yarn.lock'))) {
    return { command: 'yarn', args: ['install'] };
  }

  if (await fileExists(join(cwd, 'bun.lock')) || (await fileExists(join(cwd, 'bun.lockb')))) {
    return { command: 'bun', args: ['install'] };
  }

  return { command: 'npm', args: ['install'] };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
