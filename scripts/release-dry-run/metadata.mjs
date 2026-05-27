import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const packageScope = '@vanrot/';
const packagesDirectoryName = 'packages';

export async function discoverPublicPackages(repositoryRoot) {
  const packagesRoot = join(repositoryRoot, packagesDirectoryName);
  const directoryEntries = await readdir(packagesRoot, { withFileTypes: true });
  const packages = [];

  for (const entry of directoryEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const directory = join(packagesRoot, entry.name);
    const manifestPath = join(directory, 'package.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

    if (manifest.private === true) {
      continue;
    }

    packages.push({
      name: manifest.name,
      directoryName: entry.name,
      directory,
      manifestPath,
      manifest,
    });
  }

  return packages.sort((left, right) => left.name.localeCompare(right.name));
}

export function validatePackageMetadata(packages, options = {}) {
  const packageNames = new Set(packages.map((releasePackage) => releasePackage.name));
  const failures = [];

  for (const releasePackage of packages) {
    failures.push(...validateSinglePackage(releasePackage, packageNames, options));
  }

  return failures;
}

export function createReleaseManifest(releasePackage, packageNames) {
  const manifest = structuredClone(releasePackage.manifest);

  manifest.dependencies = rewriteDependencyGroup(manifest.dependencies, packageNames);
  manifest.peerDependencies = rewriteDependencyGroup(manifest.peerDependencies, packageNames);

  if (manifest.dependencies === undefined) {
    delete manifest.dependencies;
  }

  if (manifest.peerDependencies === undefined) {
    delete manifest.peerDependencies;
  }

  return manifest;
}

function validateSinglePackage(releasePackage, packageNames, options) {
  const failures = [];
  const manifest = releasePackage.manifest;
  const label = releasePackage.name ?? releasePackage.directory;

  if (!isNonEmptyString(manifest.name) || !manifest.name.startsWith(packageScope)) {
    failures.push(`${label} must use the ${packageScope} package scope.`);
  }

  if (!isNonEmptyString(manifest.version)) {
    failures.push(`${label} is missing version.`);
  }

  if (manifest.type !== 'module') {
    failures.push(`${label} must declare type module.`);
  }

  if (manifest.exports === undefined) {
    failures.push(`${label} is missing exports.`);
  }

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    failures.push(`${label} is missing files.`);
  }

  if (!manifest.files?.includes('dist')) {
    failures.push(`${label} files must include dist.`);
  }

  if (!isNonEmptyString(manifest.engines?.node)) {
    failures.push(`${label} is missing engines.node.`);
  }

  if (manifest.bin !== undefined) {
    failures.push(...validateBins(label, manifest.bin));
  }

  failures.push(
    ...validateDependencyGroup(label, 'dependency', manifest.dependencies, packageNames, options),
  );
  failures.push(
    ...validateDependencyGroup(
      label,
      'peer dependency',
      manifest.peerDependencies,
      packageNames,
      options,
    ),
  );

  return failures;
}

function validateBins(label, bin) {
  if (typeof bin !== 'object' || bin === null || Array.isArray(bin)) {
    return [`${label} bin must be an object.`];
  }

  return Object.entries(bin).flatMap(([name, value]) => {
    if (!isNonEmptyString(name) || !isNonEmptyString(value)) {
      return [`${label} bin entries must have names and paths.`];
    }

    if (!value.startsWith('./dist/')) {
      return [`${label} bin ${name} must point at ./dist.`];
    }

    return [];
  });
}

function validateDependencyGroup(label, groupLabel, dependencies = {}, packageNames, options) {
  return Object.entries(dependencies).flatMap(([name, specifier]) => {
    if (!isNonEmptyString(specifier)) {
      return [`${label} ${groupLabel} ${name} must use a non-empty version specifier.`];
    }

    if (
      options.allowLocalInternalSpecifiers === true &&
      packageNames.has(name) &&
      isLocalSpecifier(specifier)
    ) {
      return [];
    }

    if (specifier.startsWith('workspace:') || specifier.startsWith('file:')) {
      return [
        `${label} ${groupLabel} ${name} must not use ${specifier} for release packaging.`,
      ];
    }

    if (packageNames.has(name) && specifier !== '0.0.0') {
      return [`${label} ${groupLabel} ${name} must match the local release version 0.0.0.`];
    }

    return [];
  });
}

function rewriteDependencyGroup(dependencies = undefined, packageNames) {
  if (dependencies === undefined) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(dependencies).map(([name, specifier]) => [
      name,
      packageNames.has(name) && isLocalSpecifier(specifier) ? '0.0.0' : specifier,
    ]),
  );
}

function isLocalSpecifier(specifier) {
  return specifier.startsWith('workspace:') || specifier.startsWith('file:');
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
