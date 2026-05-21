import { buildCommand } from './commands/build.js';
import { createCommand } from './commands/create.js';
import { devCommand } from './commands/dev.js';
import { doctorCommand } from './commands/doctor.js';
import { generateCommand } from './commands/generate.js';
import { testCommand } from './commands/test.js';
import type { CommandContext, CommandResult } from './result.js';
import { fail, ok } from './result.js';

const rootHelp = `Vanrot CLI

Usage
  vr <command>

Commands
  vr create <name>
  vr generate component <name>
  vr generate page <name>
  vr doctor
  vr dev
  vr build
  vr test`;

const commandHelp = new Map<string, string>([
  [
    'create',
    `vr create <name>

Options
  --workspace   Use workspace dependencies for repository fixtures
  --force       Overwrite an existing target directory`,
  ],
  [
    'generate',
    `vr generate <role> <name>

Roles
  component
  page

Options
  --feature <name>   Generate inside src/features/<name>`,
  ],
  ['doctor', 'vr doctor'],
  ['dev', 'vr dev'],
  ['build', 'vr build'],
  ['test', 'vr test'],
]);

export async function runCli(args: string[], context: CommandContext): Promise<CommandResult> {
  const [command, ...rest] = args;

  if (command === undefined || command === '--help' || command === '-h') {
    context.reporter.line(rootHelp);
    return ok();
  }

  if (rest.includes('--help') || rest.includes('-h')) {
    return printCommandHelp(command, context);
  }

  if (command === 'create') {
    return createCommand(rest, context);
  }

  if (command === 'generate' || command === 'g') {
    return generateCommand(rest, context);
  }

  if (command === 'doctor') {
    return doctorCommand(rest, context);
  }

  if (command === 'dev') {
    return devCommand(rest, context);
  }

  if (command === 'build') {
    return buildCommand(rest, context);
  }

  if (command === 'test') {
    return testCommand(rest, context);
  }

  context.reporter.error(`Unknown command: ${command}`, suggestionFor(command));
  return fail();
}

function printCommandHelp(command: string, context: CommandContext): CommandResult {
  const help = commandHelp.get(command);

  if (help === undefined) {
    context.reporter.error(`Unknown command: ${command}`, suggestionFor(command));
    return fail();
  }

  context.reporter.line(help);
  return ok();
}

function suggestionFor(command: string): string | undefined {
  if (command === 'craete') {
    return 'Did you mean vr create?';
  }

  if (command === 'generte') {
    return 'Did you mean vr generate?';
  }

  return undefined;
}
