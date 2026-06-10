# Commands

## vr create <project-name>

Creates a routed Vanrot app with the configured package manager, starter files, and selected app engine.

Docs: /docs/cli

## vr generate <kind> <name>

Generates convention-based component and page files, with optional colocated tests.

Docs: /docs/cli

## vr add <package-or-primitive>

Adds Vanrot packages or UI primitives and updates config when needed.

Docs: /docs/cli

## vr remove behavior <name>

Removes optional behavior helpers from project config.

Docs: /docs/cli

## vr ui <subcommand>

Inspects and manages Vanrot UI primitive metadata.

Docs: /docs/cli

## vr config <subcommand>

Reads, validates, and reports normalized Vanrot config.

Docs: /docs/cli

## vr update <target>

Syncs generated Vanrot project files without changing package versions.

Docs: /docs/cli

## vr upgrade [version]

Updates installed Vanrot package ranges, installs dependencies, then syncs generated project files.

Docs: /docs/cli

## vr doctor

Runs local project diagnostics, selected-engine package boundary checks, and optional read-only project intelligence with --inspect.

Docs: /docs/cli

## vr cache clean

Cleans Vanrot-owned local cache and generated project-map files.

Docs: /docs/cli/project-intelligence

## vr map

Writes the project intelligence manifest at `.vanrot/project-map.json`.

Docs: /docs/devtools

## vr init-ai

Writes provider-neutral project rules for AI assistants from normalized config.

Docs: /docs/devtools

## vr ai <subcommand>

Builds, verifies, and inspects AI-readable Vanrot knowledge alongside project AI doorway files.

Docs: /docs/devtools

## vr dev

Starts the configured Vanrot app engine through the CLI, using Forge or Vite based on project config or engine flags.

Docs: /docs/cli

## vr build

Runs a production build through the configured Vanrot app engine.

Docs: /docs/forge/build

## vr test

Runs the configured test command for a Vanrot project.

Docs: /docs/testing
