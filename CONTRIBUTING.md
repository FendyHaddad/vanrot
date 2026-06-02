# Contributing

Thanks for helping make Vanrot better.

Vanrot is a TypeScript frontend framework with a small core runtime, compiler-backed component conventions, typed routing, optional behavior helpers, UI primitives, SSR, testing utilities, devtools, AI-readable docs, and CLI workflows.

## Before You Start

Read the project overview in `README.md`.

For larger work, check:

- `docs/superpowers/feature-maturity.md` for production-readiness status.
- `docs/superpowers/final-tdd-inventory.md` for release test coverage memory.
- `docs/superpowers/future-pipeline.md` for deferred and future candidates.
- Matching specs and plans under `docs/superpowers/specs/` and `docs/superpowers/plans/` when work belongs to a numbered phase.

If you are not sure where a change belongs, open an issue first.

## Local Setup

Vanrot requires Node.js `>=22.14.0` and `pnpm@11.1.3`.

```sh
pnpm install
pnpm build
pnpm test
```

For the full repository gate:

```sh
pnpm verify
```

For documentation site work:

```sh
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Then open:

```text
http://localhost:1964
```

## Framework Rules

Vanrot code, examples, generated output, specs, and plans should follow the framework rules expected of users:

- Use guard clauses instead of nested control flow.
- Use signals for state.
- Never put UI markup in TypeScript.
- Never put application logic in HTML.
- Use role-based file suffixes such as `.component.ts`, `.page.ts`, `.dialog.ts`, `.layout.ts`, `.widget.ts`, and `.form.ts`.
- Use scoped CSS for component styling.
- Avoid reused string literals. Shared strings such as route names, paths, labels, command names, diagnostic codes, file suffixes, and generated copy should live in one named source of truth.
- Prefer readable, English-like APIs over clever shorthand.

If existing code violates a rule, avoid spreading the pattern. Fix only the part touched by your current change unless the broader cleanup is part of the issue or plan.

## Runtime Size Budget

`@vanrot/runtime` is the core browser runtime. It must stay under `1.98 KB` gzipped for `dist/index.js` plus `dist/internal.js`.

Headless UI and application behavior belongs in `@vanrot/behavior`, not `@vanrot/runtime`.

Run:

```sh
pnpm verify:size
```

If the size budget fails, include the exact size, the feature that caused it, and why the code belongs in the core runtime.

## Pull Requests

Good pull requests are focused and evidence-backed.

Include:

- A short summary of the change.
- The package, example, docs page, or workflow affected.
- Tests or verification commands run.
- Screenshots for visible site or UI changes.
- Any docs, specs, plans, or inventory files updated.

Do not mix unrelated refactors with feature or bug-fix work.

## Testing

Use the narrowest useful command first:

```sh
pnpm --filter <package-name> test
pnpm --filter <package-name> typecheck
```

Then run broader gates when the change touches shared behavior:

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm verify
```

Docs and release guardrails are part of the repository contract:

```sh
pnpm verify:phase-docs
pnpm verify:site-docs
pnpm verify:site-format
pnpm verify:ai-docs
pnpm verify:component-cascade
pnpm verify:security-leaks
pnpm verify:release-dry-run
pnpm verify:final-tdd-inventory
```

## Documentation Changes

Documentation should explain what a feature is, why it exists, when to use it, when not to use it, and how to verify it.

When changing docs, keep related source-of-truth files synchronized:

- `README.md` for the public repository overview.
- `docs/ai/knowledge/*` for AI-readable knowledge.
- `docs/superpowers/feature-maturity.md` for production status.
- `docs/superpowers/final-tdd-inventory.md` for release test inventory.
- `docs/superpowers/future-pipeline.md` for deferred or superseded future work.
- `docs/vanrot-presentation.html` when roadmap presentation state changes.

## Security

Do not include secrets, access tokens, private keys, or credentials in issues, pull requests, logs, fixtures, docs, or generated files.

For vulnerabilities, follow `SECURITY.md`.
