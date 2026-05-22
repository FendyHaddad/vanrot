import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { normalizeVanrotConfig } from './defaults.js';
import { configDiagnosticCode, type ConfigDiagnostic } from './diagnostics.js';
import type { NormalizedVanrotConfig, VanrotConfig } from './types.js';
import { validateVanrotConfig } from './validate.js';
import { vanrotConfigFileName } from './constants.js';

export interface LoadedVanrotConfig {
  config: NormalizedVanrotConfig;
  diagnostics: ConfigDiagnostic[];
  filePath: string;
  exists: boolean;
}

export async function loadVanrotProjectConfig(cwd: string): Promise<LoadedVanrotConfig> {
  const filePath = join(cwd, vanrotConfigFileName);
  const exists = await fileExists(filePath);

  if (!exists) {
    return {
      filePath,
      exists: false,
      config: normalizeVanrotConfig({}),
      diagnostics: [
        {
          code: configDiagnosticCode.migrationSuggested,
          severity: 'warning',
          message: `Missing ${vanrotConfigFileName}; using defaults.`,
          suggestion: 'Run vr config migrate to create the canonical config file.',
          filePath,
        },
      ],
    };
  }

  try {
    const source = await readFile(filePath, 'utf8');
    const raw = parseConfigModule(source);
    const diagnostics = validateVanrotConfig(raw);

    return {
      filePath,
      exists: true,
      config: normalizeVanrotConfig(raw),
      diagnostics,
    };
  } catch (error) {
    return {
      filePath,
      exists: true,
      config: normalizeVanrotConfig({}),
      diagnostics: [
        {
          code: configDiagnosticCode.loadFailed,
          severity: 'error',
          message: `Failed to load ${vanrotConfigFileName}: ${error instanceof Error ? error.message : 'unknown error'}`,
          suggestion: 'Fix the config file or run vr config recover.',
          filePath,
        },
      ],
    };
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function parseConfigModule(source: string): VanrotConfig {
  const exportToken = 'export default';
  const exportIndex = source.indexOf(exportToken);
  if (exportIndex === -1) {
    throw new Error('Missing default export in vanrot.config.ts');
  }

  let expression = source.slice(exportIndex + exportToken.length).trim();
  if (expression.endsWith(';')) {
    expression = expression.slice(0, -1).trim();
  }

  const evaluate = new Function(
    'defineVanrotConfig',
    `return (${expression});`,
  ) as (defineVanrotConfig: (config: VanrotConfig) => VanrotConfig) => VanrotConfig;

  const config = evaluate((next) => next);
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error('vanrot.config.ts default export must be an object.');
  }

  return config as VanrotConfig;
}
