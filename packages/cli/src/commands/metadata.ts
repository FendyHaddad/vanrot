export const commandName = {
  create: 'create',
  generate: 'generate',
  add: 'add',
  doctor: 'doctor',
  map: 'map',
  initAi: 'init-ai',
  dev: 'dev',
  build: 'build',
  test: 'test',
} as const;

export const commandAlias = {
  generate: 'g',
} as const;

export type CommandName = (typeof commandName)[keyof typeof commandName];

export interface CliCommandMetadata {
  name: CommandName;
  usage: string;
  secondaryUsages?: readonly string[];
  help: string;
}

export const cliCommands: readonly CliCommandMetadata[] = [
  {
    name: commandName.create,
    usage: 'vr create <name>',
    help: `vr create <name>

Options
  --workspace   Use workspace dependencies for repository fixtures
  --force       Overwrite an existing target directory`,
  },
  {
    name: commandName.generate,
    usage: 'vr generate component <name>',
    secondaryUsages: ['vr generate page <name>'],
    help: `vr generate <role> <name>

Roles
  component
  page

Options
  --feature <name>   Generate inside src/features/<name>`,
  },
  {
    name: commandName.add,
    usage: 'vr add button',
    secondaryUsages: ['vr add <local-prefix> button'],
    help: `vr add <primitive>
vr add <local-prefix> button

Primitives
  button

Examples
  vr add button
  vr add primary button`,
  },
  {
    name: commandName.doctor,
    usage: commandInvocation(commandName.doctor),
    help: commandInvocation(commandName.doctor),
  },
  {
    name: commandName.map,
    usage: commandInvocation(commandName.map),
    help: commandInvocation(commandName.map),
  },
  {
    name: commandName.initAi,
    usage: commandInvocation(commandName.initAi),
    help: commandInvocation(commandName.initAi),
  },
  {
    name: commandName.dev,
    usage: commandInvocation(commandName.dev),
    help: commandInvocation(commandName.dev),
  },
  {
    name: commandName.build,
    usage: commandInvocation(commandName.build),
    help: commandInvocation(commandName.build),
  },
  {
    name: commandName.test,
    usage: commandInvocation(commandName.test),
    help: commandInvocation(commandName.test),
  },
] as const;

export const starterScriptCommands = [
  commandName.dev,
  commandName.build,
  commandName.test,
  commandName.doctor,
] as const;

export const rootCommandUsages = cliCommands.flatMap((command) => [
  command.usage,
  ...(command.secondaryUsages ?? []),
]);

export function commandInvocation(command: CommandName): string {
  return `vr ${command}`;
}

export function commandUsage(command: CommandName): string {
  return commandUsages(command)[0] ?? commandInvocation(command);
}

export function commandUsages(command: CommandName): readonly string[] {
  const metadata = cliCommands.find((item) => item.name === command);

  if (metadata === undefined) {
    return [commandInvocation(command)];
  }

  return [metadata.usage, ...(metadata.secondaryUsages ?? [])];
}

export function createStarterScripts(): Record<string, string> {
  return Object.fromEntries(
    starterScriptCommands.map((command) => [command, commandInvocation(command)]),
  );
}
