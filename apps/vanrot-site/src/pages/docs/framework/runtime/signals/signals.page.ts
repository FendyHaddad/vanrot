import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const runtimeSignalsArticle = {
  "key": "runtimeSignals",
  "section": "framework",
  "path": "/docs/runtime/signals",
  "label": "Signals",
  "title": "Runtime Signals",
  "summary": "A signal is the @vanrot/runtime state primitive: readable state, writable updates, cached computed values, and effects all share one explicit dependency graph.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "what-is-a-signal",
      "title": "What is a signal?",
      "body": "A signal is a small reactive value exposed as a read function. Calling it returns the current value and, when a computed value or effect is running, records that read as a dependency. That is why Vanrot uses signals: state stays explicit in TypeScript, generated views can subscribe precisely, and the runtime only reruns work that actually depends on the changed value.",
      "points": [
        "Signals keep local state close to the component or module that owns it.",
        "A read is just a function call, so templates and derived values can track dependencies without decorators.",
        "A write invalidates only the graph edges that observed the previous read."
      ],
      "code": {
        "title": "Signal read model",
        "code": "import { signal } from '@vanrot/runtime';\n\nconst selectedId = signal<string | null>(null);\n\nconsole.log(selectedId());\nselectedId.set('task-42');\nconsole.log(selectedId());"
      }
    },
    {
      "id": "signal",
      "title": "signal()",
      "body": "Use signal() for writable state that changes over time: counters, selected rows, form drafts, disclosure state, async status, and any other value the UI reads directly. The signal itself is the getter. The set() method replaces the value, while update() derives the next value from the current value without hiding the transition in separate mutable variables.",
      "points": [
        "Call the signal to read the current value.",
        "Use set() when the next value is already known.",
        "Use update() when the next value depends on the current value."
      ],
      "code": {
        "title": "Writable state",
        "code": "import { signal } from '@vanrot/runtime';\n\nconst count = signal(0);\n\ncount.set(1);\ncount.update((value) => value + 1);\n\nconsole.log(count());"
      }
    },
    {
      "id": "computed",
      "title": "computed()",
      "body": "Use computed() for values that can be derived from other signals. A computed value records the signals it reads, caches its result, and recalculates only after one of those dependencies changes. That keeps templates lean: the template reads a named value, while TypeScript owns the business rule that produced it.",
      "points": [
        "Keep formatting, totals, visibility rules, and labels out of HTML.",
        "Do not call set() inside computed(); it should describe derived state, not cause side effects.",
        "Split large computed values when different parts of the page need different dependencies."
      ],
      "code": {
        "title": "Derived state",
        "code": "import { computed, signal } from '@vanrot/runtime';\n\nconst quantity = signal(2);\nconst unitPrice = signal(29);\n\nconst total = computed(() => quantity() * unitPrice());\nconst label = computed(() => `Total: $${total()}`);\n\nquantity.update((value) => value + 1);\nconsole.log(label());"
      }
    },
    {
      "id": "effect",
      "title": "effect()",
      "body": "Use effect() when reactive state must talk to something imperative: document title, localStorage, a subscription, a timer, a chart, or a browser API. Effects rerun when the signals they read change. Keep them narrow, return cleanup when they allocate resources, and avoid using them to compute data that belongs in computed().",
      "points": [
        "Read only the signals that should retrigger the effect.",
        "Return a cleanup function for listeners, subscriptions, intervals, and external widgets.",
        "Use untrack() for incidental reads such as logging that should not subscribe the effect."
      ],
      "code": {
        "title": "Side effects with cleanup",
        "code": "import { effect, signal } from '@vanrot/runtime';\n\nconst shortcutsEnabled = signal(false);\n\nconst stop = effect(() => {\n  if (!shortcutsEnabled()) {\n    return;\n  }\n\n  const onKeydown = (event: KeyboardEvent) => console.log(event.key);\n  window.addEventListener('keydown', onKeydown);\n\n  return () => {\n    window.removeEventListener('keydown', onKeydown);\n  };\n});\n\nstop();"
      },
      "note": "If a value can be calculated from other signals, prefer computed(). Reach for effect() only at the boundary where reactive state leaves Vanrot."
    },
    {
      "id": "signals-together",
      "title": "Using signal, computed, and effect together",
      "body": "Most Vanrot state flows use the three primitives together. Signals hold the writable facts, computed values describe the derived facts, and effects synchronize the final state with an external system. This keeps each layer honest: writes stay explicit, business rules stay testable, and side effects stay isolated at the edge.",
      "points": [
        "Put the smallest writable facts in signal().",
        "Put totals, labels, and validation rules in computed().",
        "Put browser or integration synchronization in effect()."
      ],
      "code": {
        "title": "Cart total flow",
        "code": "import { computed, effect, signal } from '@vanrot/runtime';\n\nconst quantity = signal(1);\nconst unitPrice = signal(49);\nconst discount = signal(0.1);\n\nconst subtotal = computed(() => quantity() * unitPrice());\nconst total = computed(() => subtotal() * (1 - discount()));\n\nconst stop = effect(() => {\n  document.title = `Cart total $${total().toFixed(2)}`;\n});\n\nquantity.update((value) => value + 1);\nstop();"
      }
    }
  ]
} as const;

const sectionLinks = runtimeSignalsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class SignalsPage {
  title(): string {
    return runtimeSignalsArticle.title;
  }

  summary(): string {
    return runtimeSignalsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = runtimeSignalsArticle.sections[0].body;
  section1Body = runtimeSignalsArticle.sections[1].body;
  section2Body = runtimeSignalsArticle.sections[2].body;
  section3Body = runtimeSignalsArticle.sections[3].body;
  section4Body = runtimeSignalsArticle.sections[4].body;
  section0Points = runtimeSignalsArticle.sections[0].points ?? [];
  section1Points = runtimeSignalsArticle.sections[1].points ?? [];
  section2Points = runtimeSignalsArticle.sections[2].points ?? [];
  section3Points = runtimeSignalsArticle.sections[3].points ?? [];
  section4Points = runtimeSignalsArticle.sections[4].points ?? [];
  section0Code = runtimeSignalsArticle.sections[0].code?.code ?? '';
  section1Code = runtimeSignalsArticle.sections[1].code?.code ?? '';
  section2Code = runtimeSignalsArticle.sections[2].code?.code ?? '';
  section3Code = runtimeSignalsArticle.sections[3].code?.code ?? '';
  section4Code = runtimeSignalsArticle.sections[4].code?.code ?? '';
  section3Note = runtimeSignalsArticle.sections[3].note ?? '';
}
