import { spawn } from 'node:child_process';
import { delimiter, join } from 'node:path';

export interface ProcessRunner {
  run(command: string, args: string[], options: { cwd: string }): Promise<number>;
}

export function createNodeProcessRunner(): ProcessRunner {
  return {
    run(command, args, options) {
      return new Promise((resolve) => {
        const child = spawn(command, args, {
          cwd: options.cwd,
          env: createCommandEnvironment(options.cwd),
          shell: process.platform === 'win32',
          stdio: 'inherit',
        });

        child.on('error', () => resolve(1));
        child.on('exit', (code) => resolve(code ?? 1));
      });
    },
  };
}

function createCommandEnvironment(cwd: string): NodeJS.ProcessEnv {
  const env = { ...process.env };
  const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
  const currentPath = env[pathKey] ?? env.PATH ?? '';
  env[pathKey] = [join(cwd, 'node_modules', '.bin'), currentPath].filter(Boolean).join(delimiter);

  if (process.platform === 'win32') {
    env.PATH = env[pathKey];
  }

  return env;
}
