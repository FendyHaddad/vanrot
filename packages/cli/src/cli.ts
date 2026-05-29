import { addCommand } from './commands/add.js';
import { aiCommand } from './commands/ai.js';
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
  commandGroups,
  commandInvocation,
  commandName,
} from './commands/metadata.js';
import { testCommand } from './commands/test.js';
import { uiCommand } from './commands/ui.js';
import { updateCommand } from './commands/update.js';
import { upgradeCommand } from './commands/upgrade.js';
import { parseOutputMode, renderJsonEvent, renderJsonLineEvent } from './reporter/modes.js';
import type { CommandContext, CommandResult } from './result.js';
import { fail, ok } from './result.js';

type CommandHandler = (args: string[], context: CommandContext) => Promise<CommandResult>;

const commandHandlers = new Map<string, CommandHandler>([
  [commandName.create, createCommand],
  [commandName.generate, generateCommand],
  [commandAlias.generate, generateCommand],
  [commandName.add, addCommand],
  [commandName.ui, uiCommand],
  [commandName.config, configCommand],
  [commandName.update, updateCommand],
  [commandName.upgrade, upgradeCommand],
  [commandName.doctor, doctorCommand],
  [commandName.map, mapCommand],
  [commandName.initAi, initAiCommand],
  [commandName.ai, aiCommand],
  [commandName.dev, devCommand],
  [commandName.build, buildCommand],
  [commandName.test, testCommand],
]);

const structuredCommands = new Set<string>([commandName.doctor, commandName.map, commandName.ai]);

const commandHelp = new Map<string, string>(
  cliCommands.map((command) => [command.name, command.help]),
);

const commandByName = new Map(cliCommands.map((command) => [command.name, command]));

const rootHelp = [
  'VANROT',
  '',
  'Usage   vr <command> [options]',
  '',
  ...commandGroups.flatMap((group) => renderCommandGroup(group)),
  'Run vr <command> --help for flags and examples.',
].join('\n');

function renderCommandGroup(group: (typeof commandGroups)[number]): string[] {
  const lines = [group.label.toUpperCase()];

  for (const commandNameInGroup of group.commands) {
    const metadata = commandByName.get(commandNameInGroup);

    if (metadata === undefined) {
      continue;
    }

    lines.push(`${metadata.rootUsage.padEnd(26)} ${metadata.description}`);
  }

  if (group.label === 'Scaffold') {
    lines.push('e.g.  vr create my-app  ·  vr generate component header  ·  vr add button');
  }

  lines.push('');
  return lines;
}

export async function runCli(args: string[], context: CommandContext): Promise<CommandResult> {
  const parsed = parseOutputMode(args);
  const outputMode = parsed.mode;
  const parsedArgs = parsed.args;
  const [command, ...rest] = parsedArgs;
  const commandContext = { ...context, outputMode };

  if (parsed.error !== undefined) {
    context.reporter.error(parsed.error.message, parsed.error.code);
    context.reporter.nextSteps([parsed.error.nextStep]);
    return fail();
  }

  if (command === undefined || command === '--help' || command === '-h') {
    context.reporter.line(rootHelp);
    return ok();
  }

  if (shouldPrintCommandHelp(command, rest)) {
    return printCommandHelp(command, context);
  }

  const handler = commandHandlers.get(command);

  if (handler !== undefined) {
    if (!supportsStructuredOutput(command, outputMode.structured)) {
      const structuredFlag = outputMode.structured === 'jsonl' ? '--jsonl' : '--json';
      context.reporter.error(
        `${structuredFlag} is not supported for vr ${command}`,
      );
      context.reporter.nextSteps([`Run vr ${command} without --json or --jsonl.`]);
      return fail();
    }

    const result = await handler(rest, commandContext);
    reportStructuredResult(commandContext, command, result);
    return result;
  }

  context.reporter.error(`Unknown command: ${command}`, suggestionFor(command));
  return fail();
}

function supportsStructuredOutput(command: string, structured: string): boolean {
  if (structured === 'human') {
    return true;
  }

  return structuredCommands.has(command);
}

function reportStructuredResult(
  context: CommandContext,
  command: string,
  result: CommandResult,
): void {
  if (context.outputMode?.structured === 'json') {
    context.reporter.line(renderJsonEvent({ type: 'result', command, exitCode: result.exitCode }));
    return;
  }

  if (context.outputMode?.structured === 'jsonl') {
    context.reporter.line(
      renderJsonLineEvent({ type: 'result', command, exitCode: result.exitCode }),
    );
  }
}

function shouldPrintCommandHelp(command: string, rest: string[]): boolean {
  if (!rest.includes('--help') && !rest.includes('-h')) {
    return false;
  }

  if (command === commandName.ui) {
    return false;
  }

  if (command === commandName.ai && rest[0] === 'mcp') {
    return false;
  }

  return true;
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
