import { vanrotEngine, type VanrotEngine } from '@vanrot/config';
import {
  parseEngineFlags,
  type EngineFlagDiagnostic,
} from '../engine/engine-flags.js';

export interface CreateEngineSelection {
  engine: VanrotEngine;
  remainingArgs: string[];
  diagnostic?: EngineFlagDiagnostic;
}

export function resolveCreateEngineSelection(args: string[]): CreateEngineSelection {
  const parsed = parseEngineFlags(args);
  const selection: CreateEngineSelection = {
    engine: parsed.engineOverride ?? vanrotEngine.forge,
    remainingArgs: parsed.remainingArgs,
  };

  if (parsed.diagnostic !== undefined) {
    selection.diagnostic = parsed.diagnostic;
  }

  return selection;
}
