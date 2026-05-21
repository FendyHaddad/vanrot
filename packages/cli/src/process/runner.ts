import { spawn } from 'node:child_process';

export interface ProcessRunner {
  run(command: string, args: string[], options: { cwd: string }): Promise<number>;
}

export function createNodeProcessRunner(): ProcessRunner {
  return {
    run(command, args, options) {
      return new Promise((resolve) => {
        const child = spawn(command, args, {
          cwd: options.cwd,
          shell: process.platform === 'win32',
          stdio: 'inherit',
        });

        child.on('error', () => resolve(1));
        child.on('exit', (code) => resolve(code ?? 1));
      });
    },
  };
}
