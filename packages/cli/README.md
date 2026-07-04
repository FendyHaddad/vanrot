# @vanrot/cli

Vanrot command-line interface: dev server, build, doctor, and scaffolding. Exposed as `vr`.

Part of the [Vanrot](https://github.com/FendyHaddad/vanrot) framework.

## Installation

```sh
pnpm add -D @vanrot/cli
```

Or run it directly:

```sh
pnpm dlx @vanrot/cli create my-app
```

## Start Your Journey

```sh
vr create my-app          # 1. Scaffold a fresh Vanrot app
cd my-app && npm install  # 2. Step in and install dependencies
vr dev                    # 3. Start the dev server with instant HMR
vr generate page about    # 4. Grow with pages and components
vr add button             # 5. Pull in accessible UI primitives
vr doctor                 # 6. Check project health and intelligence
vr build                  # 7. Ship a production build
```

Run `vr` with no arguments for the full guided intro.

## Commands

### Scaffold

| Command                  | Purpose                                          |
|--------------------------|--------------------------------------------------|
| `vr create <name>`       | Create a new Vanrot project                      |
| `vr generate <role> <name>` | Generate a component or page                  |
| `vr add <primitive>`     | Add a UI primitive to the project                |
| `vr remove behavior <name>` | Remove an optional behavior helper            |
| `vr ui <component>`      | Inspect UI component APIs and tokens             |

### Development

| Command    | Purpose                            |
|------------|------------------------------------|
| `vr dev`   | Start dev server with HMR          |
| `vr build` | Compile and bundle for production  |
| `vr test`  | Run the test suite                 |

### Maintenance

| Command             | Purpose                                              |
|---------------------|------------------------------------------------------|
| `vr doctor`         | Check project health, config, and project intelligence |
| `vr cache <action>` | Clean Vanrot-owned local caches                      |
| `vr config <action>`| Validate, migrate, or recover config                 |
| `vr update <target>`| Sync generated Vanrot project files                  |
| `vr upgrade [version]` | Upgrade Vanrot package versions                   |
| `vr map`            | Print the project structure map                      |
| `vr init-ai`        | Set up AI context rules for this project             |
| `vr ai <action>`    | Build and inspect AI-readable Vanrot knowledge       |

Run `vr <command> --help` for flags and examples. `vr --version` prints the CLI version.

## Documentation

- [Docs](https://vanrot.vankode.com/docs)
- [Components](https://vanrot.vankode.com/components)

## License

MIT © Fendy Haddad
