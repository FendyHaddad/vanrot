<p align="center">
  <img src=".github/assets/vanrot-logo.svg" alt="Vanrot logo" width="96">
</p>

# Vanrot

Vanrot is a TypeScript frontend framework for small runtime primitives, file-based component conventions, typed routing, local-first tooling, and AI-readable project metadata.

<p align="center">
  <a href="https://vanrot.vankode.com">Documentation</a> &middot;
  <a href="https://github.com/FendyHaddad/vanrot/issues">Submit an Issue</a> &middot;
  <a href="CONTRIBUTING.md">Contributing</a> &middot;
  <a href="SECURITY.md">Security</a> &middot;
  <a href="https://www.npmjs.com/package/@vanrot/cli">CLI Package</a> &middot;
  <a href="docs/ai/knowledge/packages.md">Package Guide</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@vanrot/cli">
    <img src="https://img.shields.io/npm/v/@vanrot/cli?label=%40vanrot%2Fcli" alt="@vanrot/cli npm version">
  </a>
</p>

---

The repository contains the framework packages, CLI, documentation site, examples, verification scripts, and production-readiness plans used to ship Vanrot as a cohesive framework instead of a loose collection of utilities.

## Why Vanrot

Vanrot is designed for applications that need predictable frontend structure without a heavy browser runtime. The core
runtime stays small, while compiler work, route tooling, UI primitives, optional behavior helpers, SSR, testing,
devtools, and AI-consumption support live in separate packages.

The framework rules are intentionally direct:

- Use signals for state.
- Keep UI markup in HTML files.
- Keep application logic in TypeScript files.
- Keep styles scoped to the component.
- Prefer readable APIs over shorthand.
- Keep optional headless behavior outside the core runtime.

## Packages

| Package                   | Purpose                                                                                                                                                       |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@vanrot/runtime`         | Core browser runtime: signals, computed values, effects, batching, lifecycle hooks, inputs, mounting, and runtime graph sessions.                             |
| `@vanrot/compiler`        | Component file conventions, template parsing, expression rewriting, CSS scoping, metadata extraction, code generation, and diagnostics.                       |
| `@vanrot/router`          | Typed route definitions, route references, URL building, query parsing, path matching, route guards, and page resolution.                                     |
| `@vanrot/ui`              | Framework UI primitives and component API metadata.                                                                                                           |
| `@vanrot/behavior`        | Optional headless behavior controllers for overlays, command menus, positioned layers, tabs, tooltips, toasts, forms, and tables.                             |
| `@vanrot/cli`             | The `vr` command for creating projects, generating files, running dev/build/test flows, managing config, AI context, UI primitives, updates, and diagnostics. |
| `@vanrot/config`          | `vanrot.config.ts` definition, loading, validation, migration, recovery, and editor helpers.                                                                  |
| `@vanrot/vite-plugin`     | Vite integration for compiling Vanrot components.                                                                                                             |
| `@vanrot/ssr`             | Server rendering, route rendering, hydration state, event replay policy, and hydration helpers.                                                               |
| `@vanrot/testing`         | Component, page, router, accessibility, DOM, and interaction testing helpers.                                                                                 |
| `@vanrot/devtools`        | Runtime and project intelligence tools for development workflows.                                                                                             |
| `@vanrot/ai`              | AI-readable knowledge, MCP support, skills, diagnostics, and project context generation.                                                                      |
| `@vanrot/language-server` | Editor language server support and generated glob metadata.                                                                                                   |

## Quick Start

Use the CLI to create a project:

```sh
pnpm dlx @vanrot/cli create my-app
cd my-app
pnpm install
pnpm dev
```

Inside this repository, use the workspace scripts:

```sh
pnpm install
pnpm build
pnpm test
pnpm verify
```

Vanrot requires Node.js `>=22.14.0` and uses `pnpm@11.1.3`.

## Component Model

A Vanrot component keeps state, markup, and styles in role-specific files:

```ts
// counter.component.ts
import {signal} from '@vanrot/runtime';

const copy: Record<string, string> = {
    'counter.increment': 'Increase',
    'counter.reset': 'Reset',
};

export class CounterComponent {
    count = signal(0);

    increment(): void {
        this.count.set(this.count() + 1);
    }

    reset(): void {
        this.count.set(0);
    }

    t(key: string): string {
        return copy[key] ?? key;
    }
}
```

```html
<!-- counter.component.html -->
<section class="counter-panel">
    <output aria-live="polite">{{ count() }}</output>

    <button type="button" (click)="increment()">
        {{ t('counter.increment') }}
    </button>

    <button type="button" (click)="reset()">
        {{ t('counter.reset') }}
    </button>
</section>
```

```css
/* counter.component.css */
.counter-panel {
    display: grid;
    gap: 12px;
}
```

Mount the component from an entrypoint:

```ts
import {mount} from '@vanrot/runtime';
import {CounterComponent} from './counter/counter.component.ts';

const target = document.getElementById('app');

if (target === null) {
    throw new Error('Missing #app mount target.');
}

mount(CounterComponent, target);
```

## CLI

The CLI is exposed as `vr` by `@vanrot/cli`. Run `vr` with no arguments for the full guided intro.

Start your journey:

```sh
vr create my-app          # 1. Scaffold a fresh Vanrot app
cd my-app && npm install  # 2. Step in and install dependencies
vr dev                    # 3. Start the dev server with instant HMR
vr generate page about    # 4. Grow with pages and components
vr add button             # 5. Pull in accessible UI primitives
vr doctor                 # 6. Check project health and intelligence
vr build                  # 7. Ship a production build
```

Command groups:

```sh
# Scaffold
vr create my-app
vr generate component header --test
vr generate page dashboard
vr add button
vr remove behavior tooltip --package
vr ui list

# Development
vr dev
vr build
vr test

# Maintenance
vr doctor
vr cache clean
vr config migrate
vr config recover
vr update
vr upgrade --latest
vr map
vr init-ai
vr ai context
```

Run command help for flags and examples:

```sh
vr <command> --help
vr --version
```

## Examples

The `examples/` workspace contains focused fixtures for framework behavior:

| Example                          | What it covers                                                                |
|----------------------------------|-------------------------------------------------------------------------------|
| `examples/counter`               | Basic component structure, signals, HTML templates, scoped CSS, and mounting. |
| `examples/routing-workflows`     | Route tables, route matching, URL building, and page workflow patterns.       |
| `examples/runtime-lifecycle`     | Runtime lifecycle behavior and cleanup patterns.                              |
| `examples/compiler-templates`    | Template parsing, bindings, and compiler conventions.                         |
| `examples/ui-framework-usage`    | UI primitive usage in framework-shaped components.                            |
| `examples/behavior-helpers`      | Optional `@vanrot/behavior` helpers outside the core runtime.                 |
| `examples/testing-helpers`       | Component, page, router, and accessibility test helpers.                      |
| `examples/ssr-hydration`         | SSR rendering and hydration workflows.                                        |
| `examples/build-deploy`          | Build and deploy command flow.                                                |
| `examples/devtools-intelligence` | Devtools and project intelligence surfaces.                                   |
| `examples/webgl-threejs`         | Three.js/WebGL integration patterns.                                          |

Run an example with workspace filters:

```sh
pnpm --filter @vanrot/example-counter dev
pnpm --filter @vanrot/example-counter test
```

## Documentation Site

The docs site lives in `apps/vanrot-site`.

```sh
pnpm --filter @vanrot/vanrot-site dev
pnpm --filter @vanrot/vanrot-site build
pnpm --filter @vanrot/vanrot-site test
```

The public site target used by the CLI metadata is:

[https://vanrot.vankode.com](https://vanrot.vankode.com)

For local documentation work in this repository, the standard preview target is:

```sh
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Then open:

```text
http://localhost:1964
```

## Repository Workflow

Common root scripts:

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm lint
pnpm verify:size
pnpm verify
```

`pnpm verify` is the broad gate. It runs type checks, tests, builds, runtime size checks, docs checks, AI docs checks,
component cascade checks, security leak checks, release dry-run checks, final TDD inventory checks, and phase
documentation checks.

The core runtime size budget is strict:

```text
@vanrot/runtime dist/index.js + dist/internal.js <= 1.98 KB gzip
```

Optional browser behavior belongs in `@vanrot/behavior`, not `@vanrot/runtime`.

## Project Structure

```text
apps/
  vanrot-site/        Documentation and component site
docs/
  ai/                 AI-readable knowledge, rules, skill, and manifest
  superpowers/        Specs, implementation plans, maturity ledger, and release inventory
examples/             Runnable framework examples and verification fixtures
packages/             Framework, CLI, tooling, SSR, testing, AI, and editor packages
scripts/              Verification, release, docs, and repository guardrail scripts
```

## Roadmap And Release Readiness

Vanrot tracks production readiness in `docs/superpowers/feature-maturity.md`.

The final release testing memory lives in `docs/superpowers/final-tdd-inventory.md`.

Future candidates and deferred pipeline work live in `docs/superpowers/future-pipeline.md`.

These files are part of the repository contract: when a phase, package, command, component, convention, helper, example,
or generated file changes, the relevant tracker should change with it.

## License

MIT. See `LICENSE`.
