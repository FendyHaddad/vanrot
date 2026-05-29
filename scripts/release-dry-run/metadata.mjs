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
  const packageVersions = createPackageVersionMap(packages);
  const failures = [];

  for (const releasePackage of packages) {
    failures.push(...validateSinglePackage(releasePackage, packageVersions, options));
  }

  return failures;
}

export function createReleaseManifest(releasePackage, packageVersions) {
  const manifest = structuredClone(releasePackage.manifest);

  manifest.dependencies = rewriteDependencyGroup(manifest.dependencies, packageVersions);
  manifest.peerDependencies = rewriteDependencyGroup(manifest.peerDependencies, packageVersions);

  if (manifest.dependencies === undefined) {
    delete manifest.dependencies;
  }

  if (manifest.peerDependencies === undefined) {
    delete manifest.peerDependencies;
  }

  return manifest;
}

function validateSinglePackage(releasePackage, packageVersions, options) {
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
    ...validateDependencyGroup(label, 'dependency', manifest.dependencies, packageVersions, options),
  );
  failures.push(
    ...validateDependencyGroup(
      label,
      'peer dependency',
      manifest.peerDependencies,
      packageVersions,
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

function createPackageVersionMap(packages) {
  return new Map(
    packages
      .filter((releasePackage) => isNonEmptyString(releasePackage.name))
      .map((releasePackage) => [releasePackage.name, releasePackage.manifest.version]),
  );
}

function validateDependencyGroup(label, groupLabel, dependencies = {}, packageVersions, options) {
  return Object.entries(dependencies).flatMap(([name, specifier]) => {
    const packageVersion = packageVersions.get(name);

    if (!isNonEmptyString(specifier)) {
      return [`${label} ${groupLabel} ${name} must use a non-empty version specifier.`];
    }

    if (
      options.allowLocalInternalSpecifiers === true &&
      packageVersion !== undefined &&
      isLocalSpecifier(specifier)
    ) {
      return [];
    }

    if (specifier.startsWith('workspace:') || specifier.startsWith('file:')) {
      return [
        `${label} ${groupLabel} ${name} must not use ${specifier} for release packaging.`,
      ];
    }

    if (packageVersion !== undefined && specifier !== packageVersion) {
      return [
        `${label} ${groupLabel} ${name} must match the local release version ${packageVersion}.`,
      ];
    }

    return [];
  });
}

function rewriteDependencyGroup(dependencies = undefined, packageVersions) {
  if (dependencies === undefined) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(dependencies).map(([name, specifier]) => {
      const packageVersion = packageVersions.get(name);

      return [
        name,
        packageVersion !== undefined && isLocalSpecifier(specifier) ? packageVersion : specifier,
      ];
    }),
  );
}

function isLocalSpecifier(specifier) {
  return specifier.startsWith('workspace:') || specifier.startsWith('file:');
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
