import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { vanrotConfigFileName } from './constants.js';
import { configDiagnosticCode, type ConfigDiagnostic } from './diagnostics.js';
import { renderCanonicalVanrotConfig } from './migrate.js';

export interface RecoverOptions {
  force: boolean;
}

export interface RecoverResult {
  written: boolean;
  filePath: string;
  diagnostics: ConfigDiagnostic[];
}

export async function recoverVanrotConfig(cwd: string, options: RecoverOptions): Promise<RecoverResult> {
  const filePath = join(cwd, vanrotConfigFileName);

  if (!options.force && (await fileExists(filePath))) {
    return { written: false, filePath, diagnostics: [] };
  }

  const packageJson = await readPackageJson(cwd);
  const inferredBlocks = inferOptionalDomains(packageJson);
  const source = injectOptionalDomains(renderCanonicalVanrotConfig(), inferredBlocks);
  await writeFile(filePath, source);

  return {
    written: true,
    filePath,
    diagnostics: [
      {
        code: configDiagnosticCode.recoverAmbiguous,
        severity: 'warning',
        message: 'Recovered config from defaults and detected project shape.',
        suggestion: 'Review optional domains (router/ui/store/testing) and adjust to your project requirements.',
        filePath,
      },
    ],
  };
}

async function readPackageJson(cwd: string): Promise<Record<string, unknown>> {
  try {
    const source = await readFile(join(cwd, 'package.json'), 'utf8');
    const parsed = JSON.parse(source) as unknown;

    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // ignore parse errors and use empty fallback
  }

  return {};
}

function inferOptionalDomains(packageJson: Record<string, unknown>): string[] {
  const dependencies = toRecord(packageJson.dependencies);
  const devDependencies = toRecord(packageJson.devDependencies);
  const dependencyNames = [...Object.keys(dependencies), ...Object.keys(devDependencies)];

  const blocks: string[] = [];
  if (dependencyNames.includes('@vanrot/router')) {
    blocks.push('  router: { mode: "history" },');
  }

  if (dependencyNames.includes('@vanrot/ui')) {
    blocks.push('  ui: { prefix: "ui" },');
  }

  return blocks;
}

function injectOptionalDomains(canonicalSource: string, blocks: string[]): string {
  if (blocks.length === 0) {
    return canonicalSource;
  }

  return canonicalSource.replace('});', `${blocks.join('\n')}\n});`);
}

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await readFile(path, 'utf8');
    return true;
  } catch {
    return false;
  }
}
