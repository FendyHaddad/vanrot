export const commandName = {
  create: 'create',
  generate: 'generate',
  add: 'add',
  remove: 'remove',
  ui: 'ui',
  config: 'config',
  update: 'update',
  upgrade: 'upgrade',
  doctor: 'doctor',
  map: 'map',
  initAi: 'init-ai',
  ai: 'ai',
  dev: 'dev',
  build: 'build',
  test: 'test',
} as const;

export const commandAlias = {
  generate: 'g',
} as const;

export const vanrotSiteUrl = 'https://vanrot.vankode.com';

export const vanrotSitePath = {
  docs: '/docs',
  components: '/components',
} as const;

export type CommandName = (typeof commandName)[keyof typeof commandName];

export interface CliCommandMetadata {
  name: CommandName;
  usage: string;
  rootUsage: string;
  description: string;
  secondaryUsages?: readonly string[];
  help: string;
}

export const cliCommands: readonly CliCommandMetadata[] = [
  {
    name: commandName.create,
    usage: 'vr create <name>',
    rootUsage: 'create <name>',
    description: 'Create a new Vanrot project',
    help: `vr create <name>

Options
  --workspace   Use workspace dependencies for repository fixtures
  --force       Overwrite an existing target directory`,
  },
  {
    name: commandName.generate,
    usage: 'vr generate component <name>',
    rootUsage: 'generate <role> <name>',
    description: 'Generate a component or page',
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
    rootUsage: 'add <primitive>',
    description: 'Add a UI primitive to the project',
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
    name: commandName.remove,
    usage: 'vr remove behavior <name>',
    rootUsage: 'remove behavior <name>',
    description: 'Remove an optional behavior helper from project config',
    help: `vr remove behavior <name>

Examples
  vr remove behavior tooltip
  vr remove behavior tooltip --package

Options
  --package   Remove @vanrot/behavior when no behavior helpers remain`,
  },
  {
    name: commandName.ui,
    usage: 'vr ui list',
    rootUsage: 'ui <component>',
    description: 'Inspect UI component APIs and tokens',
    secondaryUsages: ['vr ui <component> --help'],
    help: `vr ui list
vr ui <component> --help

Examples
  vr ui list
  vr ui input --help
  vr ui table --help`,
  },
  {
    name: commandName.config,
    usage: 'vr config migrate',
    rootUsage: 'config <action>',
    description: 'Validate, migrate, or recover config',
    secondaryUsages: ['vr config recover', 'vr config migrate --recover'],
    help: `vr config migrate
vr config recover
vr config migrate --recover

Options
  --force         Overwrite an existing config during recover
  --destructive   Overwrite an existing config during migrate`,
  },
  {
    name: commandName.update,
    usage: 'vr update <target>',
    rootUsage: 'update <target>',
    description: 'Sync generated Vanrot project files',
    secondaryUsages: ['vr update', 'vr update config', 'vr update ai', 'vr update map'],
    help: `vr update
vr update <target>

Targets
  all      Sync config, project map, and AI files
  config   Create missing canonical vanrot.config.ts
  map      Refresh .vanrot/project-map.json
  ai       Refresh .vanrot AI rules, context, prompt, and doctor files

Error codes
  VR_UPDATE_TARGET_INVALID
  VR_UPDATE_FAILED`,
  },
  {
    name: commandName.upgrade,
    usage: 'vr upgrade [version]',
    rootUsage: 'upgrade [version]',
    description: 'Upgrade Vanrot package versions',
    secondaryUsages: ['vr upgrade --latest', 'vr upgrade 0.2.0 --no-install'],
    help: `vr upgrade
vr upgrade [version]
vr upgrade --latest

Options
  --latest       Use the latest npm dist-tag
  --no-install  Update package.json without running install
  --no-update   Skip the project file sync after install

Error codes
  VR_UPGRADE_PACKAGE_JSON_MISSING
  VR_UPGRADE_PACKAGE_JSON_INVALID
  VR_UPGRADE_NO_PACKAGES
  VR_UPGRADE_PACKAGE_MANAGER_FAILED`,
  },
  {
    name: commandName.doctor,
    usage: commandInvocation(commandName.doctor),
    rootUsage: 'doctor',
    description: 'Check project health and config',
    help: commandInvocation(commandName.doctor),
  },
  {
    name: commandName.map,
    usage: commandInvocation(commandName.map),
    rootUsage: 'map',
    description: 'Print the project structure map',
    help: commandInvocation(commandName.map),
  },
  {
    name: commandName.initAi,
    usage: commandInvocation(commandName.initAi),
    rootUsage: 'init-ai',
    description: 'Set up AI context rules for this project',
    help: commandInvocation(commandName.initAi),
  },
  {
    name: commandName.ai,
    usage: commandInvocation(commandName.ai),
    rootUsage: 'ai <action>',
    description: 'Build and inspect AI-readable Vanrot knowledge',
    help: `vr ai context
vr ai build
vr ai verify
vr ai doctor
vr ai mcp --help
vr ai prompt
vr ai record --code <code> --message <message>
vr ai summarize`,
  },
  {
    name: commandName.dev,
    usage: commandInvocation(commandName.dev),
    rootUsage: 'dev',
    description: 'Start dev server with HMR',
    help: commandInvocation(commandName.dev),
  },
  {
    name: commandName.build,
    usage: commandInvocation(commandName.build),
    rootUsage: 'build',
    description: 'Compile and bundle for production',
    help: commandInvocation(commandName.build),
  },
  {
    name: commandName.test,
    usage: commandInvocation(commandName.test),
    rootUsage: 'test',
    description: 'Run the test suite',
    help: commandInvocation(commandName.test),
  },
] as const;

export const commandGroups = [
  {
    label: 'Scaffold',
    commands: [commandName.create, commandName.generate, commandName.add, commandName.remove, commandName.ui],
  },
  { label: 'Development', commands: [commandName.dev, commandName.build, commandName.test] },
  {
    label: 'Maintenance',
    commands: [
      commandName.doctor,
      commandName.config,
      commandName.update,
      commandName.upgrade,
      commandName.map,
      commandName.initAi,
      commandName.ai,
    ],
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
