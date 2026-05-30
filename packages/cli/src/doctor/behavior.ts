import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { behaviorDefinitions } from '../behavior/catalog.js';
import type { DoctorFinding } from './checks.js';
import { walkFiles } from './vanrot-rules.js';

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function checkBehaviorUsage(cwd: string): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];
  const packageJson = await readJson(join(cwd, 'package.json'));
  const configSource = await readOptional(join(cwd, 'vanrot.config.ts'));
  const sourceFiles = await readSourceFiles(cwd);
  const source = sourceFiles.map((file) => file.content).join('\n');
  const installed = hasDependency(packageJson, '@vanrot/behavior');
  const configured = configuredBehaviorNames(configSource);
  const imported = importedBehaviorNames(source);

  if (installed && configured.length === 0 && imported.length === 0) {
    findings.push(
      warning(
        'VRTB001',
        'package.json',
        '@vanrot/behavior is installed but unused',
        'Run vr remove behavior <name> --package when no behavior helpers are needed.',
      ),
    );
  }

  for (const name of configured) {
    if (!imported.includes(name)) {
      findings.push(
        warning(
          'VRTB002',
          'vanrot.config.ts',
          `Configured behavior is not imported: ${name}`,
          `Run vr remove behavior ${name}.`,
        ),
      );
    }
  }

  for (const name of imported) {
    if (!configured.includes(name)) {
      findings.push(
        warning(
          'VRTB003',
          'vanrot.config.ts',
          `Imported behavior is not listed in behavior.enabled: ${name}`,
          `Add ${name} to behavior.enabled.`,
        ),
      );
    }
  }

  for (const file of sourceFiles) {
    const usesRuntimeBehavior =
      /@vanrot\/runtime/.test(file.content) &&
      behaviorDefinitions.some((definition) =>
        definition.symbols.some((symbol) => file.content.includes(symbol)),
      );

    if (usesRuntimeBehavior) {
      findings.push(
        warning(
          'VRTB004',
          relative(cwd, file.path),
          'Behavior helper imported from @vanrot/runtime',
          'Import the helper from @vanrot/behavior/<name>.',
        ),
      );
    }

    if (/from ['"]@vanrot\/behavior['"]/.test(file.content)) {
      findings.push(
        warning(
          'VRTB005',
          relative(cwd, file.path),
          'Root @vanrot/behavior import found',
          'Prefer the behavior subpath import for the helper you use.',
        ),
      );
    }
  }

  return findings;
}

function warning(code: string, filePath: string, message: string, nextStep: string): DoctorFinding {
  return { severity: 'warning', code, filePath, message: `${code} ${message}`, nextStep };
}

async function readJson(path: string): Promise<PackageJsonLike> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as PackageJsonLike;
  } catch {
    return {};
  }
}

async function readOptional(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}

async function readSourceFiles(cwd: string): Promise<Array<{ path: string; content: string }>> {
  try {
    const srcRoot = join(cwd, 'src');
    const files = await walkFiles(srcRoot);
    const sourceFiles = files.filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));
    return Promise.all(
      sourceFiles.map(async (file) => ({
        path: file,
        content: await readFile(file, 'utf8'),
      })),
    );
  } catch {
    return [];
  }
}

function hasDependency(packageJson: PackageJsonLike, name: string): boolean {
  return packageJson.dependencies?.[name] !== undefined || packageJson.devDependencies?.[name] !== undefined;
}

function configuredBehaviorNames(configSource: string): string[] {
  const enabledMatch = configSource.match(/enabled:\s*\[([\s\S]*?)\]/);
  if (enabledMatch?.[1] === undefined) {
    return [];
  }

  return behaviorDefinitions
    .map((definition) => definition.name)
    .filter((name) => enabledMatch[1]?.includes(`'${name}'`) || enabledMatch[1]?.includes(`"${name}"`));
}

function importedBehaviorNames(source: string): string[] {
  return behaviorDefinitions
    .filter((definition) =>
      source.includes(definition.importPath) ||
      definition.symbols.some((symbol) => source.includes(symbol)),
    )
    .map((definition) => definition.name);
}
