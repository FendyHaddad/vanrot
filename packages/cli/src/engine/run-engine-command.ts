import { vanrotEngine, type VanrotEngine } from '@vanrot/config';
import type { ProcessRunner } from '../process/runner.js';

export type EngineCommandName = 'dev' | 'build';

export interface RunEngineCommandOptions {
  command: EngineCommandName;
  engine: VanrotEngine;
  cwd: string;
  port: number;
  runner: ProcessRunner;
}

const viteCommandName = 'vite';
const forgeCommandName = 'vanrot-forge';
const localDevHost = '127.0.0.1';

export async function runEngineCommand(options: RunEngineCommandOptions): Promise<number> {
  if (options.engine === vanrotEngine.vite) {
    if (options.command === 'dev') {
      return options.runner.run(
        viteCommandName,
        ['--host', localDevHost, '--port', String(options.port)],
        { cwd: options.cwd },
      );
    }

    return options.runner.run(viteCommandName, ['build'], { cwd: options.cwd });
  }

  if (options.command === 'dev') {
    return options.runner.run(
      forgeCommandName,
      ['dev', '--host', localDevHost, '--port', String(options.port)],
      { cwd: options.cwd },
    );
  }

  return options.runner.run(forgeCommandName, ['build'], { cwd: options.cwd });
}
