# Vanrot AI Rules

Use this generated bundle as the source of truth before answering Vanrot questions or editing Vanrot apps.

- Use guard clauses instead of nested control flow.
- Use signals for state.
- Never put UI markup in TypeScript.
- Never put application logic in HTML.
- Use role-based file suffixes such as `.component.ts`, `.page.ts`, `.dialog.ts`, `.layout.ts`, `.widget.ts`, and `.form.ts`.
- Use scoped CSS for component styling.
- Avoid reused string literals by keeping shared names in one source of truth.

## Commands

- vr create <project-name>
- vr generate <kind> <name>
- vr add <package-or-primitive>
- vr remove behavior <name>
- vr ui <subcommand>
- vr config <subcommand>
- vr update <target>
- vr upgrade [version]
- vr doctor
- vr map
- vr init-ai
- vr ai <subcommand>
- vr dev
- vr build
- vr test

## MCP And Skill.sh

The local MCP server and generated Skill.sh package must consume the same manifest, index, knowledge documents, and rules.

- `vanrot://docs` for the full index.
- `vanrot://commands` for CLI command knowledge.
- `vanrot://diagnostics` for compiler, config, router, CLI, and Vite diagnostics.
- `vanrot://patterns` for provider-neutral framework rules.
- `vanrot://components` for documented UI primitive behavior.
- `vanrot://routes` for public documentation routes.
- `vanrot://limitations` for deferred or intentionally unsupported behavior.

Use `search_vanrot_knowledge` for bundle-backed search instead of guessing from older framework habits.

## Security And Privacy

- Do not put API keys, model keys, credentials, tokens, private paths, or local machine secrets in generated examples, bundle files, MCP output, or Skill.sh metadata.
- Keep provider-specific OpenAI, Claude, Ollama, or self-hosted model behavior outside the canonical knowledge source unless a future phase adds a verified provider adapter.
- Treat missing, stale, unsupported, or incomplete AI bundle states as failures. Do not silently fall back to stale built-in knowledge.
