import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const compilerArticle = {
  "key": "compiler",
  "section": "framework",
  "path": "/docs/compiler",
  "label": "Compiler",
  "title": "Compiler",
  "summary": "@vanrot/compiler turns role files, HTML templates, and scoped CSS into generated JavaScript, generated CSS, diagnostics, source maps, child component metadata, and readable feature metadata.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "compiler-boundary",
      "title": "Compiler boundary",
      "body": "The compiler is the build-time half of Vanrot. It reads role files such as .component.ts, .page.ts, and .layout.ts, pairs them with sibling HTML and CSS files, validates the source, and emits the JavaScript and CSS that the runtime mounts in the browser.",
      "points": [
        "It owns parsing, metadata extraction, template binding analysis, expression rewriting, scoped CSS, generated output, diagnostics, and source mappings.",
        "It does not own live signal state, router history, CLI prompting, or application business logic; those belong to the runtime, router, CLI, and user source files.",
        "Every public helper exported by @vanrot/compiler is meant for tooling, integration tests, docs generation, or the Vite plugin pipeline."
      ],
      "code": {
        "title": "Compiler entry point",
        "code": "import { compileComponent } from '@vanrot/compiler';\n\nconst result = compileComponent({\n  componentPath: 'src/app/counter.page.ts',\n  componentSource: 'export class CounterPage {}',\n  templatePath: 'src/app/counter.page.html',\n  templateSource: '<button (click)=\"increment\">{{ count() }}</button>',\n  stylePath: 'src/app/counter.page.css',\n  styleSource: 'button { color: currentColor; }',\n});\n\nif (result.diagnostics.length > 0) {\n  console.error(result.diagnostics);\n}"
      }
    },
    {
      "id": "compile-pipeline",
      "title": "Compile pipeline",
      "body": "A component compile is not one parser pass. Vanrot first resolves the role-file convention, then reads the component class, parses the template, extracts bindings, validates router and child component usage, scopes CSS, generates DOM instructions, and merges diagnostics from every phase.",
      "points": [
        "createComponentFileSet() and resolveComponentFiles() enforce sibling source ownership before code generation starts.",
        "readComponentMetadata(), readComponentInputs(), parseTemplate(), extractTemplateBindings(), scopeCss(), and generateComponent() are exposed so tools can inspect individual pipeline stages.",
        "The final CompileResult returns js, css, diagnostics, metadata.features, componentDependencies, and source mappings in one stable object."
      ]
    },
    {
      "id": "child-guides",
      "title": "Child guides",
      "body": "The compiler children are split by responsibility so a developer can find the exact rule that failed. File conventions explain where sources live, component class explains TypeScript shape, template syntax explains markup, expressions explain what can run in HTML, and source maps explain how generated output points back to source.",
      "points": [
        "Use File conventions and Component class when a role file is not being discovered or a component class is rejected.",
        "Use Template syntax, Expressions, Event binding, Child components, Slots, Inputs, @if / @else, and @for when a template diagnostic names a source-level rule.",
        "Use Scoped CSS, Source maps, and Compilation API when you are integrating the compiler into tooling or debugging emitted files."
      ]
    },
    {
      "id": "diagnostics-map",
      "title": "Diagnostics map",
      "body": "Compiler diagnostics are designed to be actionable. A diagnostic contains a stable code, severity, source location, source text, code frame, suggestion, and docsPath. That docsPath points into these compiler child guides whenever the problem belongs to @vanrot/compiler.",
      "points": [
        "VR001 through VR008 explain file ownership, component class shape, template syntax, expression rules, event handlers, and scoped CSS.",
        "VR011 through VR018 cover loops, child inputs, slots, component class ambiguity, constructor restrictions, source maps, and input metadata.",
        "Router and UI diagnostics intentionally point to router or UI docs when the compiler is only enforcing another package's contract."
      ]
    },
    {
      "id": "production-use",
      "title": "Production use",
      "body": "Most application authors should meet the compiler through the Vite plugin, CLI commands, and docs diagnostics. Direct @vanrot/compiler imports are for framework tooling, tests, custom inspection, and integrations that need to compile or inspect source without running the full site.",
      "points": [
        "Keep UI markup in .html files, styles in scoped .css files, and application logic in role TypeScript files before compiling.",
        "Treat diagnostics as build blockers when severity is error; they include docs paths so teams can fix source instead of reverse-engineering generated JavaScript.",
        "Snapshot generated output only for compiler-level tests; application tests should assert behavior through runtime, DOM, or route-level surfaces."
      ]
    }
  ]
} as const;

const sectionLinks = compilerArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class CompilerPage {
  title(): string {
    return compilerArticle.title;
  }

  summary(): string {
    return compilerArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerArticle.sections[0].body;
  section1Body = compilerArticle.sections[1].body;
  section2Body = compilerArticle.sections[2].body;
  section3Body = compilerArticle.sections[3].body;
  section4Body = compilerArticle.sections[4].body;
  section0Points = compilerArticle.sections[0].points ?? [];
  section1Points = compilerArticle.sections[1].points ?? [];
  section2Points = compilerArticle.sections[2].points ?? [];
  section3Points = compilerArticle.sections[3].points ?? [];
  section4Points = compilerArticle.sections[4].points ?? [];
  section0Code = compilerArticle.sections[0].code?.code ?? '';
}
