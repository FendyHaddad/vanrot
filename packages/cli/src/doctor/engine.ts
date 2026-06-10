import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadVanrotProjectConfig, vanrotEngine } from '@vanrot/config';
import type { DoctorFinding } from './checks.js';

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const engineDependency = {
  forge: '@vanrot/forge',
  vite: 'vite',
  vitePlugin: '@vanrot/vite-plugin',
} as const;

const viteConfigFileName = 'vite.config.ts';

export async function checkEngineUsage(cwd: string): Promise<DoctorFinding[]> {
  const loaded = await loadVanrotProjectConfig(cwd);
  const packageJson = await readJson(join(cwd, 'package.json'));
  const hasViteConfig = await exists(join(cwd, viteConfigFileName));

  if (loaded.config.engine === vanrotEngine.vite) {
    return checkViteEngine(packageJson, hasViteConfig);
  }

  return checkForgeEngine(packageJson, hasViteConfig);
}

function checkForgeEngine(
  packageJson: PackageJsonLike,
  hasViteConfig: boolean,
): DoctorFinding[] {
  const findings: DoctorFinding[] = [];

  if (!hasDependency(packageJson, engineDependency.forge)) {
    findings.push(
      error(
        'VRTF001',
        'package.json',
        'Forge engine selected but @vanrot/forge is not installed',
        'Install @vanrot/forge or switch engine to vite.',
      ),
    );
  }

  if (hasViteConfig) {
    findings.push(
      warning(
        'VRTF002',
        viteConfigFileName,
        'Forge project includes a Vite config surface',
        'Remove vite.config.ts or switch engine to vite.',
      ),
    );
  }

  if (hasDependency(packageJson, engineDependency.vitePlugin)) {
    findings.push(
      warning(
        'VRTF003',
        'package.json',
        'Forge project includes @vanrot/vite-plugin',
        'Remove @vanrot/vite-plugin or switch engine to vite.',
      ),
    );
  }

  return findings;
}

function checkViteEngine(
  packageJson: PackageJsonLike,
  hasViteConfig: boolean,
): DoctorFinding[] {
  const findings: DoctorFinding[] = [];

  if (!hasDependency(packageJson, engineDependency.vite)) {
    findings.push(
      error(
        'VRTV001',
        'package.json',
        'Vite engine selected but vite is not installed',
        'Install vite or switch engine to forge.',
      ),
    );
  }

  if (!hasDependency(packageJson, engineDependency.vitePlugin)) {
    findings.push(
      error(
        'VRTV002',
        'package.json',
        'Vite engine selected but @vanrot/vite-plugin is not installed',
        'Install @vanrot/vite-plugin or switch engine to forge.',
      ),
    );
  }

  if (!hasViteConfig) {
    findings.push(
      error(
        'VRTV003',
        viteConfigFileName,
        'Vite engine selected but vite.config.ts is missing',
        'Create vite.config.ts or switch engine to forge.',
      ),
    );
  }

  if (hasDependency(packageJson, engineDependency.forge)) {
    findings.push(
      warning(
        'VRTV004',
        'package.json',
        'Vite project includes @vanrot/forge',
        'Remove @vanrot/forge or switch engine to forge.',
      ),
    );
  }

  return findings;
}

function error(code: string, filePath: string, message: string, nextStep: string): DoctorFinding {
  return { severity: 'error', code, filePath, message: `${code} ${message}`, nextStep };
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

function hasDependency(packageJson: PackageJsonLike, name: string): boolean {
  return packageJson.dependencies?.[name] !== undefined || packageJson.devDependencies?.[name] !== undefined;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
