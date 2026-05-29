#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { access, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { discoverPublicPackages } from './release-dry-run/metadata.mjs';

const execFileAsync = promisify(execFile);
const packagesDirectoryName = 'packages';
const bumpTypes = new Set(['patch', 'minor', 'major']);
const dependencyGroups = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
  'devDependencies',
];

export function parseOptions(argv) {
  const options = {
    bumpType: 'patch',
    dryRun: false,
    base: 'HEAD',
    packageSelectors: [],
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--type' || arg === '--bump') {
      options.bumpType = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith('--type=')) {
      options.bumpType = arg.slice('--type='.length);
      continue;
    }

    if (arg.startsWith('--bump=')) {
      options.bumpType = arg.slice('--bump='.length);
      continue;
    }

    if (arg === '--base') {
      options.base = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith('--base=')) {
      options.base = arg.slice('--base='.length);
      continue;
    }

    if (arg === '--package') {
      options.packageSelectors.push(readOptionValue(argv, index, arg));
      index += 1;
      continue;
    }

    if (arg.startsWith('--package=')) {
      options.packageSelectors.push(arg.slice('--package='.length));
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (!bumpTypes.has(options.bumpType)) {
    throw new Error(`Invalid bump type: ${options.bumpType}. Use patch, minor, or major.`);
  }

  return options;
}

export function bumpVersion(version, bumpType = 'patch') {
  const match = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)$/.exec(
    version,
  );

  if (match?.groups === undefined) {
    throw new Error(`Cannot bump non-standard version: ${version}`);
  }

  const major = Number(match.groups.major);
  const minor = Number(match.groups.minor);
  const patch = Number(match.groups.patch);

  if (bumpType === 'major') {
    return `${major + 1}.0.0`;
  }

  if (bumpType === 'minor') {
    return `${major}.${minor + 1}.0`;
  }

  return `${major}.${minor}.${patch + 1}`;
}

export function selectChangedPackageNames({ packages, changedFiles }) {
  const directoryToName = new Map(
    packages.map((releasePackage) => [releasePackage.directoryName, releasePackage.name]),
  );
  const changedPackageNames = new Set();

  for (const file of changedFiles) {
    const parts = file.split(/[\\/]+/);

    if (parts[0] !== packagesDirectoryName || parts[1] === undefined) {
      continue;
    }

    const packageName = directoryToName.get(parts[1]);

    if (packageName !== undefined) {
      changedPackageNames.add(packageName);
    }
  }

  return changedPackageNames;
}

export function createBumpPlan({ packages, changedPackageNames, bumpType }) {
  const packageNames = new Set(packages.map((releasePackage) => releasePackage.name));
  const bumpPackageNames = collectDependentPackageNames({
    packages,
    packageNames,
    changedPackageNames,
  });
  const bumpedPackages = sortPackagesByInternalDependencies({
    packages,
    bumpedPackageNames: bumpPackageNames,
  });
  const nextVersions = new Map(
    bumpedPackages.map((releasePackage) => [
      releasePackage.name,
      bumpVersion(releasePackage.manifest.version, bumpType),
    ]),
  );

  return {
    bumpedPackages,
    changedPackageNames,
    nextVersions,
  };
}

export async function applyBumpPlan({ plan, dryRun }) {
  if (dryRun) {
    return [];
  }

  const changedFiles = [];

  for (const releasePackage of plan.bumpedPackages) {
    const nextVersion = plan.nextVersions.get(releasePackage.name);

    if (nextVersion === undefined) {
      throw new Error(`Missing next version for ${releasePackage.name}.`);
    }

    const manifestPath = releasePackage.manifestPath ?? join(releasePackage.directory, 'package.json');
    const manifest = await readJson(manifestPath);
    manifest.version = nextVersion;
    await writeJson(manifestPath, manifest);
    changedFiles.push(manifestPath);

    const webTypesPath = await findPackageWebTypesPath({
      directory: releasePackage.directory,
      manifest,
    });

    if (webTypesPath === undefined) {
      continue;
    }

    const webTypes = await readJson(webTypesPath);

    if (webTypes.name !== manifest.name) {
      continue;
    }

    webTypes.version = nextVersion;
    await writeJson(webTypesPath, webTypes);
    changedFiles.push(webTypesPath);
  }

  return changedFiles;
}

export async function discoverChangedFiles({ repositoryRoot, base }) {
  const trackedFiles = await runGitLines({
    repositoryRoot,
    args: ['diff', '--name-only', '--diff-filter=ACMRTUXB', base, '--', packagesDirectoryName],
  });
  const untrackedFiles = await runGitLines({
    repositoryRoot,
    args: ['ls-files', '--others', '--exclude-standard', packagesDirectoryName],
  });

  return [...new Set([...trackedFiles, ...untrackedFiles])];
}

export async function runBumpChangedPackages({
  repositoryRoot = process.cwd(),
  argv = process.argv.slice(2),
  stdout = console.log,
} = {}) {
  const options = parseOptions(argv);

  if (options.help) {
    stdout(helpText());
    return 0;
  }

  const packages = await discoverPublicPackages(repositoryRoot);
  const changedPackageNames =
    options.packageSelectors.length > 0
      ? resolvePackageSelectors({ packages, selectors: options.packageSelectors })
      : selectChangedPackageNames({
          packages,
          changedFiles: await discoverChangedFiles({ repositoryRoot, base: options.base }),
        });
  const plan = createBumpPlan({
    packages,
    changedPackageNames,
    bumpType: options.bumpType,
  });

  if (plan.bumpedPackages.length === 0) {
    stdout('No changed public packages found.');
    return 0;
  }

  for (const releasePackage of plan.bumpedPackages) {
    const nextVersion = plan.nextVersions.get(releasePackage.name);
    stdout(`${options.dryRun ? 'would bump' : 'bumping'} ${releasePackage.name} ${releasePackage.manifest.version} -> ${nextVersion}`);
  }

  await applyBumpPlan({ plan, dryRun: options.dryRun });
  return 0;
}

function collectDependentPackageNames({ packages, packageNames, changedPackageNames }) {
  const reverseDependencies = createReverseDependencies(packages, packageNames);
  const bumpPackageNames = new Set(changedPackageNames);
  const queue = [...changedPackageNames];

  while (queue.length > 0) {
    const packageName = queue.shift();

    for (const dependentName of reverseDependencies.get(packageName) ?? []) {
      if (bumpPackageNames.has(dependentName)) {
        continue;
      }

      bumpPackageNames.add(dependentName);
      queue.push(dependentName);
    }
  }

  return bumpPackageNames;
}

function createReverseDependencies(packages, packageNames) {
  const reverseDependencies = new Map();

  for (const releasePackage of packages) {
    for (const dependencyName of internalDependencyNames(releasePackage, packageNames)) {
      const dependents = reverseDependencies.get(dependencyName) ?? [];
      dependents.push(releasePackage.name);
      reverseDependencies.set(dependencyName, dependents);
    }
  }

  return reverseDependencies;
}

function sortPackagesByInternalDependencies({ packages, bumpedPackageNames }) {
  const packageByName = new Map(packages.map((releasePackage) => [releasePackage.name, releasePackage]));
  const visited = new Set();
  const sorted = [];

  function visit(releasePackage) {
    if (visited.has(releasePackage.name)) {
      return;
    }

    visited.add(releasePackage.name);

    for (const dependencyName of internalDependencyNames(releasePackage, bumpedPackageNames)) {
      const dependencyPackage = packageByName.get(dependencyName);

      if (dependencyPackage !== undefined) {
        visit(dependencyPackage);
      }
    }

    sorted.push(releasePackage);
  }

  for (const releasePackage of packages) {
    if (bumpedPackageNames.has(releasePackage.name)) {
      visit(releasePackage);
    }
  }

  return sorted;
}

function internalDependencyNames(releasePackage, packageNames) {
  return dependencyGroups.flatMap((groupName) =>
    Object.keys(releasePackage.manifest[groupName] ?? {}).filter((dependencyName) =>
      packageNames.has(dependencyName),
    ),
  );
}

function resolvePackageSelectors({ packages, selectors }) {
  const selected = new Set();

  for (const selector of selectors) {
    const releasePackage = packages.find(
      (candidate) => candidate.name === selector || candidate.directoryName === selector,
    );

    if (releasePackage === undefined) {
      throw new Error(`Unknown package selector: ${selector}`);
    }

    selected.add(releasePackage.name);
  }

  return selected;
}

async function findPackageWebTypesPath({ directory, manifest }) {
  const webTypesSpecifier = manifest['web-types'];

  if (typeof webTypesSpecifier !== 'string') {
    return undefined;
  }

  const webTypesPath = join(directory, webTypesSpecifier);

  try {
    await access(webTypesPath);
    return webTypesPath;
  } catch {
    return undefined;
  }
}

async function runGitLines({ repositoryRoot, args }) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });

  return stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function readOptionValue(argv, index, optionName) {
  const value = argv[index + 1];

  if (value === undefined || value.startsWith('--')) {
    throw new Error(`Missing value for ${optionName}.`);
  }

  return value;
}

function helpText() {
  return [
    'Usage: pnpm release:bump [--type patch|minor|major] [--base REF] [--package NAME] [--dry-run]',
    '',
    'Defaults to a patch bump for changed public packages and their transitive dependents.',
    'Use --package @vanrot/ui or --package ui to bump a package manually.',
  ].join('\n');
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runBumpChangedPackages().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
