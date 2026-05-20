# Vanrot Framework Vision

Vanrot is a compiler-first UI framework built around clean file separation, tiny runtime output, strict conventions, and
AI-friendly architecture.

The goal is not to rebuild Angular.

The goal is:

```txt
Angular-style separation
+
Svelte-style compiler output
+
tiny runtime
+
signals-first architecture
+
AI-friendly development experience
+
first-party tooling
```

---

# 1. Core Identity

Vanrot should feel like:

```txt
Clean
Predictable
Lightweight
Compiler-first
Structured
AI-friendly
Strict but not bloated
```

Main philosophy:

```txt
Write components like Angular.
Ship output like Svelte.
Guide users like a serious framework.
Stay lightweight like a library.
```

Vanrot is not just a frontend library.

Vanrot is:

```txt
compiler
+
runtime
+
router
+
build plugin
+
CLI
+
optional UI ecosystem
+
developer diagnostics
```

---

# 2. Mandatory Core Principles

These are not optional features.

These are Vanrot framework laws.

```txt
guard-clause-first code
separate files by default
signals-first state
CSS scoped by default
i18n-ready text patterns
keyboard accessibility helpers
SSR-safe APIs later
role-based file naming
AI-friendly project structure
readable generated code
```

Vanrot should avoid:

```txt
magic
hidden behavior
deep nesting
unpredictable patterns
large runtime weight
JSX-style UI mixing
single-file component clutter
```

---

# 3. What Makes Vanrot Different

Vanrot uses separate files by default:

```txt
user-card.component.ts
user-card.component.html
user-card.component.css
```

But without:

```txt
Angular modules
heavy dependency injection
Zone.js
large runtime
virtual DOM
JSX clutter
single-file component overload
```

The short identity:

```txt
Angular-style structure.
Svelte-style output.
Tiny runtime.
AI-friendly tooling.
```

---

# 4. Why Existing Frameworks Are Not Enough

## Angular

Pros:

```txt
excellent separation of concerns
enterprise structure
scalable architecture
```

Cons:

```txt
heavy framework machinery
complex dependency injection
large runtime
Zone.js complexity
RxJS-heavy patterns
stuffy developer experience
```

## React

Pros:

```txt
flexible
huge ecosystem
easy to start
```

Cons:

```txt
JSX mixes logic and UI
no strong architecture by default
many competing patterns
projects can become messy
```

## Svelte

Pros:

```txt
excellent compiler output
tiny runtime
fast
simple mental model
```

Cons:

```txt
single-file component style
template/script/style can become visually crowded
less strict separation of concern
```

Vanrot’s niche:

```txt
For developers who like Angular's structure,
but want Svelte-like lightness and modern AI-friendly tooling.
```

---

# 5. The `vr` CLI

The CLI package is:

```txt
@vanrot/cli
```

The command users type is:

```bash
vr
```

The command should be short because users will type it constantly.

Examples:

```bash
vr create my-app
vr dev
vr build
vr test
vr doctor
vr explain
vr add button
vr add dialog
vr generate component user-card
vr generate page dashboard
vr generate dialog confirm-delete
```

---

# 6. Important CLI Decision

`vr` should not become a package manager at the beginning.

It should not try to rebuild:

```txt
dependency resolution
package registry logic
lockfiles
package downloading
```

Instead, `vr` should wrap existing tooling.

Possible internal strategy:

```txt
vr
  ↓
uses npm, pnpm, or Bun internally
```

The public user experience is still:

```bash
vr create my-app
vr dev
vr build
```

But Vanrot can use proven package infrastructure underneath.

---

# 7. One Root Project, Multiple Packages

Vanrot should live in one root repository.

Do not create a separate project for each package.

Use a monorepo:

```txt
vanrot/
  packages/
    runtime/
    compiler/
    vite-plugin/
    cli/
    ui/
    router/

  apps/
    playground/
    docs/

  examples/
    basic/
    dashboard/

  package.json
  tsconfig.base.json
  vanrot.config.ts
```

This keeps maintenance simple while still allowing each package to be published separately.

The root project should be private:

```json
{
  "name": "vanrot",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*",
    "examples/*"
  ]
}
```

Each package has its own `package.json`:

```txt
packages/runtime/package.json
packages/compiler/package.json
packages/vite-plugin/package.json
packages/cli/package.json
packages/ui/package.json
packages/router/package.json
```

This is for maintainers and publishing.

Users should not have to think about every internal package.

---

# 8. MVP Package Set

The MVP packages are:

```txt
@vanrot/runtime
@vanrot/compiler
@vanrot/vite-plugin
@vanrot/cli
@vanrot/router
@vanrot/ui
```

No duplicate packages.

`@vanrot/ui` is first-party, but optional.

---

# 9. Package Responsibilities

## @vanrot/runtime

Tiny runtime layer.

Responsible for:

```txt
signals
effects
DOM helpers
mounting
cleanup
lifecycle helpers
```

Should stay very small.

---

## @vanrot/compiler

Compiler layer.

Responsible for:

```txt
reading .ts/.html/.css files
parsing templates
detecting bindings
detecting events
generating render functions
scoping CSS
creating readable generated code
```

This is mostly used internally by the build plugin and CLI.

Most users should not import this directly.

---

## @vanrot/vite-plugin

Build integration layer.

Responsible for:

```txt
connecting Vanrot compiler to Vite
loading related HTML and CSS files
transforming Vanrot files during dev/build
watching files during development
supporting future HMR
```

The Vite plugin depends on the compiler.

---

## @vanrot/cli

Developer tooling layer.

Responsible for:

```txt
vr create
vr dev
vr build
vr test
vr doctor
vr explain
vr add
vr generate
```

The CLI gives users one simple command interface.

---

## @vanrot/router

First-party router.

Responsible for:

```txt
routes
pages
layouts
route params
query params
navigation helpers
lazy loading later
route guards later
```

For MVP, keep routing simple and explicit.

Example:

```ts
export const routes = [
    {
        path: '/',
        page: HomePage
    },
    {
        path: '/dashboard',
        page: DashboardPage
    }
];
```

---

## @vanrot/ui

First-party UI ecosystem.

This should be optional.

The UI system should be similar to shadcn in spirit:

```txt
copyable
editable
themeable
accessible
AI-readable
Vanrot-native
```

Example:

```bash
vr add button
vr add dialog
vr add card
vr add input
```

This should copy component source into the user project instead of forcing a black-box component library.

Example output:

```txt
src/shared/ui/button/
  button.component.ts
  button.component.html
  button.component.css
```

The user owns the component after adding it.

---

# 10. User-Facing Install Story

Internal packages are separate for maintainers.

But the user experience must feel unified.

Users should not have to run:

```bash
npm install @vanrot/runtime @vanrot/compiler @vanrot/vite-plugin @vanrot/cli @vanrot/router
```

That looks messy.

Instead, docs should start with:

```bash
npm create vanrot@latest my-app
```

or:

```bash
npx @vanrot/cli create my-app
```

Then:

```bash
cd my-app
vr dev
```

The generated app should include the needed packages automatically.

Example generated `package.json`:

```json
{
  "name": "my-app",
  "scripts": {
    "dev": "vr dev",
    "build": "vr build",
    "test": "vr test",
    "doctor": "vr doctor"
  },
  "dependencies": {
    "@vanrot/runtime": "^0.1.0",
    "@vanrot/router": "^0.1.0"
  },
  "devDependencies": {
    "@vanrot/cli": "^0.1.0",
    "@vanrot/vite-plugin": "^0.1.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0"
  }
}
```

Notice:

```txt
@vanrot/compiler
```

does not need to appear directly in the user app.

It can be an internal dependency of:

```txt
@vanrot/vite-plugin
@vanrot/cli
```

So the relationship is:

```txt
User app
  depends on:
    @vanrot/runtime
    @vanrot/router

  dev depends on:
    @vanrot/cli
    @vanrot/vite-plugin

@vanrot/vite-plugin
  depends on:
    @vanrot/compiler

@vanrot/cli
  depends on:
    @vanrot/compiler
    @vanrot/vite-plugin
```

The rule:

```txt
Packages are separate for maintainers.
Vanrot feels unified for users.
```

---

# 11. Role-Based File Naming

The file suffix must describe the UI role.

This helps:

```txt
developers
AI models
project readability
architecture clarity
```

## Components

Reusable UI pieces:

```txt
user-card.component.ts
user-card.component.html
user-card.component.css
user-card.component.spec.ts
user-card.i18n.ts
```

## Pages

Route-level screens:

```txt
dashboard.page.ts
dashboard.page.html
dashboard.page.css
dashboard.page.spec.ts
dashboard.i18n.ts
```

## Dialogs

Modal or popup UI:

```txt
confirm-delete.dialog.ts
confirm-delete.dialog.html
confirm-delete.dialog.css
confirm-delete.dialog.spec.ts
confirm-delete.i18n.ts
```

## Layouts

Page shells:

```txt
main.layout.ts
main.layout.html
main.layout.css
main.layout.spec.ts
main.i18n.ts
```

## Widgets

Dashboard-style blocks or self-contained display modules:

```txt
stats-card.widget.ts
stats-card.widget.html
stats-card.widget.css
stats-card.widget.spec.ts
stats-card.i18n.ts
```

## Forms

Form-specific UI and state:

```txt
login.form.ts
login.form.html
login.form.css
login.form.spec.ts
login.i18n.ts
```

Rule:

```txt
A file name should tell you what the file is before you open it.
```

---

# 12. Suggested App Structure

A generated Vanrot app should be predictable:

```txt
src/
  app/
    app.ts
    app.html
    app.css
    routes.ts

  features/
    users/
      users.page.ts
      users.page.html
      users.page.css
      users.i18n.ts

      components/
        user-card.component.ts
        user-card.component.html
        user-card.component.css

      dialogs/
        confirm-delete.dialog.ts
        confirm-delete.dialog.html
        confirm-delete.dialog.css

      forms/
        user.form.ts
        user.form.html
        user.form.css

  shared/
    ui/
    components/
    dialogs/
    forms/
    utils/

  layouts/
    main.layout.ts
    main.layout.html
    main.layout.css

  theme/
    tokens.css

  i18n/
    en.json
```

Important rule:

```txt
Features own their own files.
Shared is only for reusable things.
```

---

# 13. AI-First Philosophy

Vanrot must be designed so AI models can:

```txt
understand quickly
generate reliably
refactor safely
debug predictably
```

The goal:

```txt
Built for humans.
Predictable for AI.
Compiled for performance.
```

AI should instantly understand:

```txt
where logic lives
where UI lives
where styles live
where tests live
where translations live
what each file represents
```

---

# 14. Vanrot Must Work Without AI

Vanrot should be AI-friendly, but it must not require AI.

No user should need:

```txt
a local LLM
an OpenAI API key
a Claude API key
an Ollama setup
```

to use the framework.

The rule:

```txt
Vanrot works fully without AI.
AI features are optional upgrades.
```

---

# 15. Level 1: Non-AI Diagnostics

These require no LLM.

Command:

```bash
vr doctor
```

Checks:

```txt
nested if statements
missing i18n keys
raw user-facing text
SSR-unsafe browser API usage
missing keyboard support
missing aria labels
unscoped CSS
bad file names
bad folder structure
deep relative imports
unused signals
unused CSS classes
unused components
large component warnings
missing tests
missing destroy cleanup
```

Example output:

```txt
[warning] confirm-delete.dialog.html

Button uses click behavior but has no accessible keyboard fallback.

Suggested fix:
Use a Vanrot UI button or add keyboard handling.
```

This is one of Vanrot’s strongest differentiators.

---

# 16. Level 2: Optional AI Commands

Optional AI-powered commands:

```bash
vr explain
vr refactor
vr fix --ai
```

Possible providers:

```txt
OpenAI API
Claude API
Ollama
user-hosted models
```

Vanrot should not force a specific AI provider.

Provider config could live in:

```txt
.vanrot/ai.config.json
```

Example:

```json
{
  "provider": "openai",
  "model": "gpt-5.5-pro"
}
```

But this must be optional.

---

# 17. AI Manifest

Vanrot should generate an AI rules file.

Command:

```bash
vr init-ai
```

Creates:

```txt
.vanrot/ai-rules.md
```

Example content:

```md
# Vanrot AI Rules

- Use guard clauses.
- Use signals for state.
- Never put UI markup in TypeScript.
- Never put business logic in HTML.
- Use role-based file suffixes.
- Use scoped CSS.
- Use i18n keys for user-facing text.
- Use accessible UI primitives.
- Prefer explicit imports.
- Do not create deep relative imports.
```

The idea:

```txt
AI should not guess Vanrot conventions.
Vanrot should explain itself.
```

---

# 18. Project Map

Vanrot should be able to generate a project map.

Command:

```bash
vr map
```

Output:

```txt
.vanrot/project-map.json
```

Example:

```json
{
  "pages": [
    "dashboard.page",
    "settings.page"
  ],
  "dialogs": [
    "confirm-delete.dialog"
  ],
  "components": [
    "user-card.component"
  ],
  "forms": [
    "login.form"
  ],
  "routes": [
    "/dashboard",
    "/settings"
  ],
  "i18n": [
    "en"
  ],
  "ui": [
    "button",
    "dialog",
    "card"
  ]
}
```

This helps:

```txt
AI models
debugging
documentation
code generation
testing
dependency graphs
```

Future command:

```bash
vr graph
```

Shows which pages use which components.

---

# 19. Feature-First Generation

Vanrot should generate full features, not only isolated components.

Command:

```bash
vr generate feature users
```

Creates:

```txt
src/features/users/
  users.page.ts
  users.page.html
  users.page.css
  users.i18n.ts

  components/
    user-card.component.ts
    user-card.component.html
    user-card.component.css

  dialogs/
    confirm-delete.dialog.ts
    confirm-delete.dialog.html
    confirm-delete.dialog.css

  forms/
    user.form.ts
    user.form.html
    user.form.css
```

This gives users a correct architecture from the start.

---

# 20. Signals-First State

Example:

```ts
import {signal} from '@vanrot/runtime';

export class CounterComponent {
    count = signal(0);

    increment() {
        this.count.set(this.count() + 1);
    }
}
```

Template:

```html
<p>{{ count() }}</p>

<button (click)="increment()">
    {{ t('counter.increase') }}
</button>
```

Expected compiler behavior:

```txt
only the affected text node updates
no virtual DOM
no unnecessary rerender
small runtime helpers only
```

---

# 21. CSS Scoping By Default

Component CSS should not leak globally.

Input:

```css
button {
    color: red;
}
```

Compiler generates a scope id:

```txt
data-vr-a1b2c3
```

HTML:

```html

<button data-vr-a1b2c3>
```

CSS:

```css
button[data-vr-a1b2c3] {
    color: red;
}
```

Global CSS should be explicit, not accidental.

---

# 22. i18n-Ready Text

Vanrot should discourage raw user-facing text.

Instead of:

```html

<button>Save</button>
```

Prefer:

```html

<button>{{ t('common.save') }}</button>
```

Command:

```bash
vr i18n extract
```

Should scan templates and generate/update:

```txt
src/i18n/en.json
```

Example:

```json
{
  "common.save": "Save"
}
```

This makes Vanrot serious for real apps.

---

# 23. Accessibility Helpers

Accessibility should be built into the framework culture.

Vanrot UI components should handle:

```txt
keyboard navigation
focus trap
aria attributes
screen reader labels
disabled state
focus restoration
escape key behavior
```

Especially for:

```txt
dialog
dropdown
menu
tabs
tooltip
select
combobox
toast
```

`vr doctor` should warn when common accessibility rules are violated.

---

# 24. First-Party UI Ecosystem

Vanrot should include official UI components, but not force them into the core runtime.

Package:

```txt
@vanrot/ui
```

Command examples:

```bash
vr add button
vr add dialog
vr add card
vr add input
vr add table
vr add dropdown
vr add tabs
vr add toast
```

The UI philosophy:

```txt
copyable
editable
themeable
accessible
AI-readable
Vanrot-native
```

Vanrot UI should not be a black box.

It should copy source into the user project so the user owns the component.

---

# 25. Design Tokens

Vanrot UI should use design tokens.

Example:

```txt
src/theme/tokens.css
```

Example tokens:

```css
:root {
    --vr-color-bg: #ffffff;
    --vr-color-text: #111111;
    --vr-radius-md: 8px;
    --vr-space-md: 16px;
}
```

Commands:

```bash
vr theme init
vr theme add dark
```

This makes Vanrot UI themeable without becoming heavy.

---

# 26. Build and Deployment Philosophy

Vanrot should compile into:

```txt
plain HTML
plain CSS
plain JS
```

Build command:

```bash
vr build
```

Output:

```txt
dist/
  index.html
  assets/
    app-[hash].js
    app-[hash].css
```

Deploy anywhere:

```txt
Cloudflare Pages
Vercel
Netlify
GitHub Pages
Nginx
Apache
S3/R2
```

Deployment rule:

```txt
If static files can deploy there, Vanrot can deploy there.
```

SSR and SSG can come later.

---

# 27. Build Reports and Performance Budgets

Vanrot should reinforce its lightweight identity.

Command:

```bash
vr build
```

Could output:

```txt
Vanrot Build Report

Runtime: 3.2kb
App JS: 42kb
CSS: 8kb
Largest page: dashboard.page
Unused CSS: 12 classes
```

Possible config:

```ts
export default {
    budgets: {
        runtime: '5kb',
        page: '50kb',
        css: '20kb'
    }
};
```

If exceeded:

```txt
[warning] dashboard.page exceeded 50kb budget.
```

---

# 28. Readable Generated Code

Vanrot should not feel like a black box.

Command:

```bash
vr inspect counter.component
```

Shows generated output:

```txt
counter.component.generated.ts
```

This helps:

```txt
debugging
learning
AI analysis
compiler testing
trust
```

Philosophy:

```txt
Generated code should be understandable.
```

---

# 29. Strict Config

Vanrot config:

```txt
vanrot.config.ts
```

Example:

```ts
export default {
    strict: true,

    files: {
        roleBasedNaming: true,
        separateFiles: true
    },

    code: {
        guardClauses: true,
        noNestedIf: true,
        noDeepRelativeImports: true
    },

    css: {
        scoped: true
    },

    i18n: {
        required: true
    },

    a11y: {
        required: true
    },

    ssr: {
        safeApis: true
    }
};
```

The framework should be opinionated but understandable.

---

# 30. Import Aliases By Default

Avoid deep relative imports.

Bad:

```ts
import {Button} from '../../../../shared/ui/button';
```

Good:

```ts
import {Button} from '@shared/ui/button';
```

Default aliases:

```txt
@app
@features
@shared
@ui
@theme
@i18n
```

This helps humans and AI.

---

# 31. Testing

MVP should support:

```bash
vr test
```

Later package:

```txt
@vanrot/testing
```

Testing helpers could look like:

```ts
renderComponent(UserCardComponent);
click('button');
expectText('User saved');
```

Generated files:

```txt
user-card.component.spec.ts
dashboard.page.spec.ts
confirm-delete.dialog.spec.ts
```

Testing should not be an afterthought.

---

# 32. SSR-Safe APIs Later

SSR should come later, but the framework should prepare for it early.

Rule:

```txt
No direct window/document usage during component initialization.
Browser APIs must be inside onMount().
```

`vr doctor` should warn:

```txt
window used outside onMount()
This may break SSR.
```

Future package:

```txt
@vanrot/ssr
```

Future commands:

```bash
vr build --static
vr build --ssr
```

---

# 33. Future Packages

MVP packages:

```txt
@vanrot/runtime
@vanrot/compiler
@vanrot/vite-plugin
@vanrot/cli
@vanrot/router
@vanrot/ui
```

Future packages:

```txt
@vanrot/forms
@vanrot/i18n
@vanrot/testing
@vanrot/ssr
@vanrot/devtools
```

Do not build all future packages first.

Keep momentum.

---

# 34. MVP Build Order

Recommended order:

```txt
1. Create root monorepo
2. Create @vanrot/runtime
3. Implement signal()
4. Implement effect()
5. Implement DOM helpers
6. Create @vanrot/compiler
7. Parse simple HTML
8. Compile interpolation
9. Compile event bindings
10. Compile property bindings
11. Add CSS scoping
12. Create @vanrot/vite-plugin
13. Create playground app
14. Create @vanrot/cli
15. Implement vr dev
16. Implement vr build
17. Implement vr generate
18. Create @vanrot/router
19. Create basic explicit routing
20. Create @vanrot/ui registry
21. Implement vr add button
22. Implement vr doctor basics
23. Add build report
24. Add docs
```

---

# 35. What Not To Build First

Avoid these at the beginning:

```txt
dependency injection
complex forms engine
SSR
hydration
animations
devtools
complex HMR
full AI refactoring
custom package manager
own package registry
```

These can come later.

The first goal is proving:

```txt
separate TS + HTML + CSS
        ↓
compiler
        ↓
tiny runtime
        ↓
reactive DOM update
        ↓
clean build with vr
```

---

# 36. MVP Demo Target

This:

```ts
import {signal} from '@vanrot/runtime';

export class CounterComponent {
    count = signal(0);

    increment() {
        this.count.set(this.count() + 1);
    }
}
```

This:

```html
<p>{{ count() }}</p>

<button (click)="increment()">
    {{ t('counter.increase') }}
</button>
```

This:

```css
button {
    padding: 8px 12px;
}
```

Should compile into efficient JavaScript that:

```txt
updates only affected nodes
uses tiny runtime
avoids virtual DOM
keeps clear separation of concerns
uses scoped CSS
supports i18n-ready text
```

That is the first real milestone.

---

# 37. Final Long-Term Identity

```txt
Vanrot

A compiler-first UI framework with:
- Angular-style separation
- Svelte-like performance
- tiny runtime
- vr CLI
- role-based file naming
- signals-first state
- scoped CSS by default
- first-party router
- first-party UI ecosystem
- optional AI tooling
- strict clean-code philosophy
- human-friendly and AI-friendly architecture
```

The strongest sentence:

```txt
Vanrot helps humans write clean UI and helps AI understand it.
```

---

# 38. Phase Checklist

Use this table as the build tracker.

Status:

```txt
[ ] not started
[x] done
```

| Done | Phase | Create | Tick when |
|---|---|---|---|
| [x] | Phase 0 - Vision and first spec | Framework vision in `docs/brainstorm.md` and runtime kernel spec in `docs/superpowers/specs/2026-05-20-vanrot-runtime-kernel-design.md`. | The core identity, package split, MVP order, and runtime boundary rules are written down. |
| [x] | Phase 1 - Monorepo foundation | Root workspace, package manager config, shared TypeScript config, build scripts, test scripts, and package folders. | `packages/runtime`, `packages/compiler`, `packages/vite-plugin`, and `packages/cli` exist and can build empty packages. |
| [x] | Phase 2 - Runtime kernel | `@vanrot/runtime` with `signal`, `computed`, `effect`, cleanup scopes, `onMount`, `onDestroy`, and `mount`, following `docs/superpowers/specs/Phase-02.md` and `docs/superpowers/plans/Phase-02.md`. | Runtime tests pass, the runtime kernel plan is complete, and minified + gzip size stays within the runtime kernel budget. |
| [x] | Phase 3 - Compiler MVP | `@vanrot/compiler` that reads component TypeScript, HTML, and CSS and emits readable JavaScript/CSS output. | A simple component with text binding, event binding, property binding, and scoped CSS compiles without hand-written glue, and `docs/superpowers/feature-maturity.md` marks Phase 3 features as demo-capable. |
| [ ] | Phase 4 - Vite integration | `@vanrot/vite-plugin` that wires the compiler into dev and build flows. | A Vanrot app runs through Vite and rebuilds after component file changes. |
| [ ] | Phase 5 - CLI MVP | `@vanrot/cli` with `vr create`, `vr generate component`, `vr generate page`, `vr doctor`, `vr build`, and `vr test`. | A user can create an app, generate files, diagnose issues, build, and test through `vr`. |
| [ ] | Phase 6 - Counter demo milestone | First working demo app using separate `.ts`, `.html`, and `.css` files. | The counter demo compiles into efficient output, updates only affected DOM nodes, uses scoped CSS, and does not need virtual DOM. |
| [ ] | Phase 7 - Project intelligence | `vr map`, `.vanrot/project-map.json`, `.vanrot/ai-rules.md`, strict diagnostics, i18n checks, and accessibility checks. | The project can explain its structure to humans and AI without requiring an AI provider. |
| [ ] | Phase 8 - Router MVP | `@vanrot/router` with route config, route outlet, link helper, params, and lazy route loading. | A generated app can navigate between pages using first-party routing. |
| [ ] | Phase 9 - UI and tokens MVP | `@vanrot/ui`, `vr add`, design tokens, and first basic components. | Users can add official UI components without bloating `@vanrot/runtime`. |
| [ ] | Phase 10 - Testing and docs | `@vanrot/testing`, example tests, API docs, and guide docs. | Core packages have documented public APIs and reliable tests for normal user workflows. |
| [ ] | Phase 11 - Later platform work | SSR-safe APIs, hydration strategy, async resources, stores, forms, animation, devtools, and optional AI commands. | Deferred features have separate specs and do not leak into the tiny runtime kernel. |

---

# 39. Temporary Phase Completion Hook

A temporary local Git hook lives at:

```txt
.git/hooks/pre-commit
```

When a phase is finished, do this before committing:

```txt
1. Tick the matching phase in this checklist.
2. Update docs/vanrot-presentation.html so the deck matches the tracker.
3. If the phase changed requirements, update this brainstorm document and the matching spec or plan.
4. Stage the tracker, presentation, and any requirement docs together.
```

The hook blocks commits that look like phase-completion commits unless both `docs/brainstorm.md` and `docs/vanrot-presentation.html` are staged.

Temporary bypass:

```txt
VANROT_SKIP_PHASE_HOOK=1 git commit
```
