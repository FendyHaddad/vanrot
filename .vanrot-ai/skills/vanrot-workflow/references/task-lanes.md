# Vanrot Task Lanes

Classify the lane before editing.

## Page/Site UI

Use for `apps/vanrot-site/src/pages/**`, page templates, page CSS, route-visible UI, and visual components.

- Inspect the `.page.html`, `.page.ts`, `.page.css`, nearby child components, and page tests.
- Static copy belongs in HTML.
- Visual chunks and large SVGs belong in child component templates.
- Publish-ready when the public site output changes.

## Docs/IA

Use for docs pages, docs routing, sidebar/tree data, article metadata, AI docs, and shared docs components.

- Real docs content lives in real page components.
- Route/sidebar/article metadata derives from `apps/vanrot-site/src/docs/docs-page-tree.ts`.
- Custom tags require root and app web-types coverage.
- Publish-ready when public docs output changes.

## Runtime/Compiler

Use for `packages/runtime`, `packages/compiler`, diagnostics, generated output, and framework semantics.

- Prefer focused package tests first.
- Runtime changes require size-budget awareness.
- Publish-ready when package output, exports, runtime behavior, or compiler behavior changes.

## Package/API

Use for package exports, CLI commands, config, generated files, and package metadata.

- Verify the package surface and source-import rules.
- Publish-ready when npm package contents or public CLI behavior changes.

## Workflow Cleanup

Use for `AGENTS.md`, `CLAUDE.md`, `.vanrot-ai/**`, hooks, diagnostics, old specs/plans, and AI workflow rules.

- Prefer read-only diagnostics first.
- Remove files only when the current task authorizes removal and candidates are proven.
- No publish-readiness checks unless built output changes.

## Release/Publish

Use when the user asks whether a change is safe to commit, publish, or deploy.

- Commit-ready means the working tree change is coherent and relevant verification passed.
- Publish-ready means public site/package/docs/release output is safe for users.
- Do not run publish gates for internal-only cleanup unless the cleanup affects published artifacts.
