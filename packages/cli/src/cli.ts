import { addCommand } from './commands/add.js';
import { buildCommand } from './commands/build.js';
import { configCommand } from './commands/config.js';
import { createCommand } from './commands/create.js';
import { devCommand } from './commands/dev.js';
import { doctorCommand } from './commands/doctor.js';
import { generateCommand } from './commands/generate.js';
import { initAiCommand } from './commands/init-ai.js';
import { mapCommand } from './commands/map.js';
import {
  cliCommands,
  commandAlias,
  commandInvocation,
  commandName,
  rootCommandUsages,
} from './commands/metadata.js';
import { testCommand } from './commands/test.js';
import type { CommandContext, CommandResult } from './result.js';
import { fail, ok } from './result.js';

type CommandHandler = (args: string[], context: CommandContext) => Promise<CommandResult>;

const commandHandlers = new Map<string, CommandHandler>([
  [commandName.create, createCommand],
  [commandName.generate, generateCommand],
  [commandAlias.generate, generateCommand],
  [commandName.add, addCommand],
  [commandName.config, configCommand],
  [commandName.doctor, doctorCommand],
  [commandName.map, mapCommand],
  [commandName.initAi, initAiCommand],
  [commandName.dev, devCommand],
  [commandName.build, buildCommand],
  [commandName.test, testCommand],
]);

const commandHelp = new Map<string, string>(
  cliCommands.map((command) => [command.name, command.help]),
);

const rootHelp = `Vanrot CLI

Usage
  vr <command>

Commands
${rootCommandUsages.map((usage) => `  ${usage}`).join('\n')}`;

export async function runCli(args: string[], context: CommandContext): Promise<CommandResult> {
  const [command, ...rest] = args;

  if (command === undefined || command === '--help' || command === '-h') {
    context.reporter.line(rootHelp);
    return ok();
  }

  if (rest.includes('--help') || rest.includes('-h')) {
    return printCommandHelp(command, context);
  }

  const handler = commandHandlers.get(command);

  if (handler !== undefined) {
    return handler(rest, context);
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
    return `Did you mean ${commandInvocation(commandName.create)}?`;
  }

  if (command === 'generte') {
    return `Did you mean ${commandInvocation(commandName.generate)}?`;
  }

  return undefined;
}
