import { commandInvocation, commandName } from '../commands/metadata.js';

export function createAiRules(): string {
  return `# Vanrot AI Rules

Vanrot is a compiler-first UI framework built around clean file separation, tiny runtime output, strict conventions, and provider-neutral project intelligence.

## Core Rules

- Use guard clauses instead of nested control flow.
- Use signals for state.
- Never put UI markup in TypeScript.
- Never put application logic in HTML.
- Use role-based file suffixes such as \`.component.ts\`, \`.page.ts\`, \`.dialog.ts\`, \`.layout.ts\`, \`.widget.ts\`, and \`.form.ts\`.
- Use scoped CSS for component styling.
- Prefer i18n-ready text for user-facing strings.
- Prefer accessible UI primitives and keyboard-friendly behavior.
- Read \`.vanrot/project-map.json\` before making broad project changes.
- Do not assume an AI provider is required for Vanrot projects.

## Project Intelligence

\`.vanrot/project-map.json\` is the local source of truth for discovered Vanrot role files and i18n file hints.

Update the project map with:

\`\`\`bash
${commandInvocation(commandName.map)}
\`\`\`
`;
}
