#!/usr/bin/env node
import { runForgeBuild } from './build/build.js';
import { runForgeDev } from './dev/server.js';

const forgeCommand = {
  build: 'build',
  dev: 'dev',
} as const;

const unknownForgeCommandDiagnostic = 'Unknown Forge command.';

const stderrReporter = {
  error(message: string): void {
    console.error(message);
  },
};

async function runForgeCommand(args: readonly string[]): Promise<number> {
  const [command, ...commandArgs] = args;

  if (command === forgeCommand.dev) {
    const result = await runForgeDev({
      ...parseDevArgs(commandArgs),
      cwd: process.cwd(),
      reporter: stderrReporter,
      stayOpen: true,
    });
    return result.exitCode;
  }

  if (command === forgeCommand.build) {
    const result = await runForgeBuild({ cwd: process.cwd(), reporter: stderrReporter });
    return result.exitCode;
  }

  stderrReporter.error(unknownForgeCommandDiagnostic);
  return 1;
}

process.exitCode = await runForgeCommand(process.argv.slice(2));

function parseDevArgs(args: readonly string[]): { host: string; port: number } {
  return {
    host: valueAfter(args, '--host') ?? '127.0.0.1',
    port: Number(valueAfter(args, '--port') ?? '1964'),
  };
}

function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}
