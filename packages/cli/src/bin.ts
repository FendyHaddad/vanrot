#!/usr/bin/env node
import { runCli } from './cli.js';
import { createNodeProcessRunner } from './process/runner.js';
import { createConsoleReporter } from './reporter/reporter.js';

try {
  const result = await runCli(process.argv.slice(2), {
    cwd: process.cwd(),
    reporter: createConsoleReporter(),
    runner: createNodeProcessRunner(),
  });

  process.exitCode = result.exitCode;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
