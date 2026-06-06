import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerCompilationApiArticle = {
  "key": "compilerCompilationApi",
  "section": "framework",
  "path": "/docs/compiler/compilation-api",
  "label": "Compilation API",
  "title": "Compiler Compilation API",
  "summary": "The @vanrot/compiler API exposes full component compilation plus lower-level parsing, metadata, style, codegen, diagnostics, and source-location helpers for tooling.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "compile-component",
      "title": "compileComponent()",
      "body": "compileComponent() is the in-memory compilation entry point. Pass the component path and source, template path and source, style path and source, and optional CompileOptions. The result contains generated js, generated css, diagnostics, and metadata.",
      "points": [
        "Use compileComponent() in unit tests, docs examples, and tools that already have source strings.",
        "Set componentImportSpecifier only when a tool needs generated imports to use a specific specifier.",
        "Always inspect diagnostics before trusting js or css output."
      ],
      "code": {
        "title": "Compile from strings",
        "code": "import { compileComponent } from '@vanrot/compiler';\n\nconst result = compileComponent({\n  componentPath: 'src/app/home.page.ts',\n  componentSource: 'export class HomePage {}',\n  templatePath: 'src/app/home.page.html',\n  templateSource: '<main>{{ title() }}</main>',\n  stylePath: 'src/app/home.page.css',\n  styleSource: 'main { display: grid; }',\n});\n\nconsole.log(result.js, result.css, result.metadata.features);"
      }
    },
    {
      "id": "compile-from-files",
      "title": "compileComponentFromFiles()",
      "body": "compileComponentFromFiles() is the disk-backed entry point. It resolves the component file family, reads the TypeScript, HTML, and CSS siblings, and then delegates to compileComponent() so the result shape stays identical.",
      "points": [
        "Use it in scripts and plugin-like tools that start from a role file path.",
        "Handle missing sibling diagnostics before trying to read emitted code.",
        "Prefer the Vite plugin for normal app builds so rebuilds, HMR, and config stay centralized."
      ],
      "code": {
        "title": "Compile from disk",
        "code": "import { compileComponentFromFiles } from '@vanrot/compiler';\n\nconst result = await compileComponentFromFiles('src/app/home.page.ts');\n\nif (result.diagnostics.length === 0) {\n  console.log(result.js, result.css);\n}"
      }
    },
    {
      "id": "lower-level-exports",
      "title": "Lower-level exports",
      "body": "The compiler also exports lower-level helpers for specialized tools: file resolution, component metadata, input metadata, template parsing, binding extraction, expression rewriting, scoped CSS, code generation, identifier allocation, and router template diagnostics.",
      "points": [
        "Use parseTemplate() and extractTemplateBindings() for editor or docs tooling that needs template structure.",
        "Use scopeCss() and createScopeAttribute() when working only with styles.",
        "Use generateComponent() only when you already have parsed nodes and validated metadata."
      ],
      "code": {
        "title": "Inspect pipeline pieces",
        "code": "import { parseTemplate, scopeCss, createScopeAttribute } from '@vanrot/compiler';\n\nconst parsed = parseTemplate('<p>{{ message() }}</p>', 'message.component.html');\nconst scopeAttribute = createScopeAttribute('message.component.ts', 'p {}');\nconst scoped = scopeCss('p { margin: 0; }', scopeAttribute, 'message.component.css');\n\nconsole.log(parsed.nodes.length, scoped.mappings.length);"
      }
    },
    {
      "id": "diagnostics-and-metadata",
      "title": "Diagnostics and metadata",
      "body": "Every diagnostic code is cataloged with a message, suggestion, and docs path. CompileResult metadata records the component name, scope attribute, feature list, child component dependencies, and mappings so tests and tooling can assert the compiler's decisions.",
      "points": [
        "Use diagnosticCatalog to render stable help text beside compiler errors.",
        "Use metadata.features to understand which compiler capabilities a component exercised.",
        "Use metadata.mappings and code-frame helpers when building inspection or editor features."
      ],
      "code": {
        "title": "Read diagnostic help",
        "code": "import { diagnosticCatalog } from '@vanrot/compiler';\n\nconst info = diagnosticCatalog.VR006;\n\nconsole.log(info.message, info.suggestion, info.docsPath);"
      }
    }
  ]
} as const;

const sectionLinks = compilerCompilationApiArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class CompilationApiPage {
  title(): string {
    return compilerCompilationApiArticle.title;
  }

  summary(): string {
    return compilerCompilationApiArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerCompilationApiArticle.sections[0].body;
  section1Body = compilerCompilationApiArticle.sections[1].body;
  section2Body = compilerCompilationApiArticle.sections[2].body;
  section3Body = compilerCompilationApiArticle.sections[3].body;
  section0Points = compilerCompilationApiArticle.sections[0].points ?? [];
  section1Points = compilerCompilationApiArticle.sections[1].points ?? [];
  section2Points = compilerCompilationApiArticle.sections[2].points ?? [];
  section3Points = compilerCompilationApiArticle.sections[3].points ?? [];
  section0Code = compilerCompilationApiArticle.sections[0].code?.code ?? '';
  section1Code = compilerCompilationApiArticle.sections[1].code?.code ?? '';
  section2Code = compilerCompilationApiArticle.sections[2].code?.code ?? '';
  section3Code = compilerCompilationApiArticle.sections[3].code?.code ?? '';
}
