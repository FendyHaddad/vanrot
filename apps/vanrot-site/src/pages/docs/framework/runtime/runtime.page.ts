import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const runtimeArticle = {
  "key": "runtime",
  "section": "framework",
  "path": "/docs/runtime",
  "label": "Runtime",
  "title": "Runtime",
  "summary": "@vanrot/runtime is the browser runtime boundary for reactivity, inputs, lifecycle cleanup, compiled-component mounting, and runtime graph contracts.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "runtime-boundary",
      "title": "Runtime boundary",
      "body": "The runtime is the smallest package that a compiled Vanrot app needs in the browser. It does not own parsing, routing rules, design tokens, CLI setup, or documentation metadata. It owns the live objects that generated components use after the compiler has produced JavaScript.",
      "points": [
        "Reactive primitives live here because generated components read and write them at runtime.",
        "Lifecycle hooks live here because cleanup scopes must be shared by effects, DOM listeners, and mounted component trees.",
        "Mounting lives here because the app entry point needs one stable API that works with compiled modules and class-style components."
      ],
      "code": {
        "title": "Runtime import surface",
        "code": "import { mount, signal, computed, effect, onMount, onDestroy } from '@vanrot/runtime';\n\nconst count = signal(0);\nconst doubled = computed(() => count() * 2);\n\nconst dispose = effect(() => {\n  document.title = `Count ${doubled()}`;\n});\n\nconst app = mount(App, document.getElementById('app')!);\ndispose();\napp.destroy();"
      }
    },
    {
      "id": "signals",
      "title": "Writable and derived state",
      "body": "Signals are function reads with explicit writes. Calling a signal reads the current value and lets the reactive graph track the consumer. Writing through set() or update() only notifies dependents when Object.is sees a real value change, keeping repeated assignments cheap.",
      "points": [
        "Use signal(initialValue) for local writable state.",
        "Use computed(() => value) for lazily evaluated derived state that should cache until a dependency changes.",
        "Keep template-facing state in signals so generated components have one predictable read model."
      ],
      "code": {
        "title": "Signal and computed state",
        "code": "import { computed, signal } from '@vanrot/runtime';\n\nconst quantity = signal(1);\nconst unitPrice = signal(29);\nconst total = computed(() => quantity() * unitPrice());\n\nquantity.update((value) => value + 1);\nconsole.log(total());"
      }
    },
    {
      "id": "effects",
      "title": "Effects, batch, and untrack",
      "body": "Effects are for work that must run because reactive state changed, such as synchronizing document state or an imperative browser API. They run once immediately, rerun when tracked dependencies change, and may return cleanup that executes before the next run and when the scope is destroyed.",
      "points": [
        "Return a cleanup function from effect() when the effect opens a subscription or touches an imperative API.",
        "Use batch() when several writes should flush dependents once after the group finishes.",
        "Use untrack() for incidental reads that should not become dependencies of the current effect or computed value."
      ],
      "code": {
        "title": "Controlled side effects",
        "code": "import { batch, effect, signal, untrack } from '@vanrot/runtime';\n\nconst open = signal(false);\nconst label = signal('Menu');\n\nconst stop = effect(() => {\n  document.body.dataset.menu = open() ? 'open' : 'closed';\n  console.debug('Current label', untrack(() => label()));\n});\n\nbatch(() => {\n  label.set('Command menu');\n  open.set(true);\n});\n\nstop();"
      }
    },
    {
      "id": "inputs",
      "title": "Component inputs",
      "body": "Inputs are signal-shaped values generated components can read like any other runtime state. Required inputs report missing reads, while default inputs start with a known value. That makes component contracts visible in TypeScript without inventing a second template-only state model.",
      "points": [
        "Use input.required<T>() when a parent must provide the value before the component reads it.",
        "Use input.default(value) for optional values that should still behave like writable signals.",
        "Treat inputs as component-edge state, not a replacement for local signal() state inside the component."
      ],
      "code": {
        "title": "Input signals",
        "code": "import { computed, input } from '@vanrot/runtime';\n\nconst userName = input.required<string>();\nconst disabled = input.default(false);\n\nconst buttonLabel = computed(() => {\n  if (disabled()) {\n    return 'Unavailable';\n  }\n\n  return `Invite ${userName()}`;\n});"
      }
    },
    {
      "id": "lifecycle",
      "title": "Lifecycle and mount cleanup",
      "body": "mount() creates the root cleanup scope for a Vanrot app. onMount() callbacks run after the component is created, and onDestroy() callbacks attach cleanup to the active scope. Effects registered inside the same scope are also disposed when the app handle is destroyed.",
      "points": [
        "Use onMount() for DOM APIs that require mounted nodes or browser-only setup.",
        "Use onDestroy() for cleanup that does not naturally fit inside an effect return value.",
        "Call app.destroy() in tests, previews, or embed shells that need deterministic teardown."
      ],
      "code": {
        "title": "Mounted cleanup scope",
        "code": "import { mount, onDestroy, onMount } from '@vanrot/runtime';\n\nfunction handleResize() {\n  console.log(window.innerWidth);\n}\n\nonMount(() => {\n  const controller = new AbortController();\n  window.addEventListener('resize', handleResize, { signal: controller.signal });\n\n  return () => controller.abort();\n});\n\nonDestroy(() => console.log('flush analytics'));\n\nconst app = mount(App, document.getElementById('app')!);\napp.destroy();"
      }
    },
    {
      "id": "controllers",
      "title": "Behavior package boundary",
      "body": "Runtime no longer exports headless behavior controllers. Forms, overlays, command menus, tabs, tooltips, toasts, tables, and positioned layers live in @vanrot/behavior so apps install only the behavior helpers they choose.",
      "points": [
        "Use @vanrot/behavior subpaths when behavior needs state, cleanup, keyboard handling, or positioning outside a single template binding.",
        "Keep component pages focused on public markup while behavior docs explain the imperative edge.",
        "Use createRuntimeGraphSession() when devtools needs to record runtime nodes and edges without changing app code."
      ],
      "code": {
        "title": "Runtime graph stays in runtime",
        "code": "import { createRuntimeGraphSession } from '@vanrot/runtime';\n\nconst graph = createRuntimeGraphSession({ label: 'checkout' });\ngraph.recordNode({ id: 'cart-total', kind: 'computed' });\ngraph.dispose();"
      }
    },
    {
      "id": "signals-guide",
      "title": "Should signals be separate?",
      "body": "Signals appear on this page because they are exported by @vanrot/runtime and they are the state primitive generated components depend on. That is package ownership, not ideal learning architecture. Runtime should explain the package boundary; a dedicated guide should teach the signal mental model in depth.",
      "points": [
        "Keep this page as the package-level overview for runtime exports and cleanup behavior.",
        "Split a future Signals page when the docs can cover writable signals, computed dependencies, effects, batch, untrack, inputs, and anti-patterns without crowding runtime.",
        "Link that guide from Runtime, Components, and Conventions so state guidance is not hidden under one package page."
      ],
      "note": "Recommendation: yes, create a separate Signals guide after this runtime page is no longer lazy. Do not move the route in this pass; use this page as the richer source of truth first."
    }
  ]
} as const;

const sectionLinks = runtimeArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RuntimePage {
  title(): string {
    return runtimeArticle.title;
  }

  summary(): string {
    return runtimeArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = runtimeArticle.sections[0].body;
  section1Body = runtimeArticle.sections[1].body;
  section2Body = runtimeArticle.sections[2].body;
  section3Body = runtimeArticle.sections[3].body;
  section4Body = runtimeArticle.sections[4].body;
  section5Body = runtimeArticle.sections[5].body;
  section6Body = runtimeArticle.sections[6].body;
  section0Points = runtimeArticle.sections[0].points ?? [];
  section1Points = runtimeArticle.sections[1].points ?? [];
  section2Points = runtimeArticle.sections[2].points ?? [];
  section3Points = runtimeArticle.sections[3].points ?? [];
  section4Points = runtimeArticle.sections[4].points ?? [];
  section5Points = runtimeArticle.sections[5].points ?? [];
  section6Points = runtimeArticle.sections[6].points ?? [];
  section0Code = runtimeArticle.sections[0].code?.code ?? '';
  section1Code = runtimeArticle.sections[1].code?.code ?? '';
  section2Code = runtimeArticle.sections[2].code?.code ?? '';
  section3Code = runtimeArticle.sections[3].code?.code ?? '';
  section4Code = runtimeArticle.sections[4].code?.code ?? '';
  section5Code = runtimeArticle.sections[5].code?.code ?? '';
  section6Note = runtimeArticle.sections[6].note ?? '';
}
