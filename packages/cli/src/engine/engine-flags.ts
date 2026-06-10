import { vanrotEngine, type VanrotEngine } from '@vanrot/config';

export interface EngineFlagDiagnostic {
  message: string;
  suggestion: string;
}

export interface EngineFlagResult {
  engineOverride?: VanrotEngine;
  remainingArgs: string[];
  diagnostic?: EngineFlagDiagnostic;
}

const engineFlag = {
  engine: '--engine',
  forge: '--forge',
  vite: '--vite',
} as const;

export function parseEngineFlags(args: string[]): EngineFlagResult {
  const remainingArgs: string[] = [];
  let engineOverride: VanrotEngine | undefined;
  let diagnostic: EngineFlagDiagnostic | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === undefined) {
      continue;
    }

    if (arg === engineFlag.forge) {
      diagnostic = diagnostic ?? assignEngineOverride(engineOverride, vanrotEngine.forge);
      engineOverride = engineOverride ?? vanrotEngine.forge;
      continue;
    }

    if (arg === engineFlag.vite) {
      diagnostic = diagnostic ?? assignEngineOverride(engineOverride, vanrotEngine.vite);
      engineOverride = engineOverride ?? vanrotEngine.vite;
      continue;
    }

    if (arg === engineFlag.engine) {
      const nextEngine = args[index + 1];
      index += 1;

      if (nextEngine === undefined || nextEngine.startsWith('-')) {
        diagnostic = diagnostic ?? {
          message: 'Missing engine value.',
          suggestion: 'Use --engine forge or --engine vite.',
        };
        continue;
      }

      if (!isVanrotEngine(nextEngine)) {
        diagnostic = diagnostic ?? {
          message: `Invalid engine: ${nextEngine}`,
          suggestion: 'Use forge or vite.',
        };
        continue;
      }

      diagnostic = diagnostic ?? assignEngineOverride(engineOverride, nextEngine);
      engineOverride = engineOverride ?? nextEngine;
      continue;
    }

    remainingArgs.push(arg);
  }

  const result: EngineFlagResult = { remainingArgs };

  if (engineOverride !== undefined) {
    result.engineOverride = engineOverride;
  }

  if (diagnostic !== undefined) {
    result.diagnostic = diagnostic;
  }

  return result;
}

function assignEngineOverride(
  currentEngine: VanrotEngine | undefined,
  nextEngine: VanrotEngine,
): EngineFlagDiagnostic | undefined {
  if (currentEngine === undefined || currentEngine === nextEngine) {
    return undefined;
  }

  return {
    message: 'Conflicting engine flags.',
    suggestion: 'Choose only one of --forge, --vite, or --engine forge|vite.',
  };
}

function isVanrotEngine(value: string): value is VanrotEngine {
  return value === vanrotEngine.forge || value === vanrotEngine.vite;
}
