import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerIfElseArticle = {
  "key": "compilerIfElse",
  "section": "framework",
  "path": "/docs/compiler/if-else",
  "label": "@if / @else",
  "title": "Compiler @if and @else",
  "summary": "@if and @else compile conditional template branches into cleanup-safe DOM updates driven by a component expression.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "conditional-rendering",
      "title": "Conditional rendering",
      "body": "@if is Vanrot's compiler-owned conditional rendering block. The block header contains a component expression, the consequent body contains the DOM to render when that expression is truthy, and the compiler records the feature as control-flow-if when code generation succeeds.",
      "points": [
        "Use @if (condition()) { ... } when markup should exist only while a signal or computed expression is true.",
        "Keep the condition as a read expression; assignments and statement-like logic still belong in the component TypeScript file.",
        "The parser stores the condition on an IfBlockNode.expression and parses the branch body as normal Vanrot template nodes."
      ],
      "code": {
        "title": "Parse an @if block",
        "code": "import { parseTemplate } from '@vanrot/compiler';\n\nconst parsed = parseTemplate(\n  '@if (loggedIn()) { <p>Welcome back</p> }',\n  'home.page.html',\n);\n\nconsole.log(parsed.nodes[0]);"
      }
    },
    {
      "id": "else-branch",
      "title": "@else branch",
      "body": "@else is optional and must be written as its own braced block after the @if body. The compiler does not treat @else as a runtime directive; it parses both branches up front and generates one effect that swaps the active branch when the condition changes.",
      "points": [
        "Use } @else { when the false case should render different DOM instead of rendering nothing.",
        "Do not write @else if; use a nested @if inside the @else block when a second condition is needed.",
        "Both branches can contain ordinary elements, child components, slots, UI primitives, and nested control-flow blocks."
      ],
      "code": {
        "title": "Parse @if with @else",
        "code": "import { parseTemplate } from '@vanrot/compiler';\n\nconst parsed = parseTemplate(\n  '@if (loggedIn()) { <profile-card></profile-card> } @else { <a>Sign in</a> }',\n  'home.page.html',\n);\n\nconsole.log(parsed.diagnostics);"
      }
    },
    {
      "id": "generated-updates",
      "title": "Generated updates",
      "body": "Generated @if output creates a comment marker, opens a cleanup scope for the active branch, renders the selected branch into a document fragment, inserts it after the marker, and disposes the old branch before replacing it on the next effect pass.",
      "points": [
        "Branch replacement is tied to cleanup scopes so listeners, child components, and nested effects inside the inactive branch are disposed.",
        "The condition expression is rewritten against the component instance the same way interpolation and property binding expressions are rewritten.",
        "Use @if for real DOM presence changes; use CSS classes when the element should remain mounted and only change presentation."
      ],
      "code": {
        "title": "Compile a conditional block",
        "code": "import { compileComponent } from '@vanrot/compiler';\n\nconst result = compileComponent({\n  componentPath: 'src/app/home.page.ts',\n  componentSource: 'export class HomePage { loggedIn() { return true; } }',\n  templatePath: 'src/app/home.page.html',\n  templateSource: '@if (loggedIn()) { <p>Welcome</p> } @else { <a>Sign in</a> }',\n  stylePath: 'src/app/home.page.css',\n  styleSource: ':host { display: block; }',\n});\n\nconsole.log(result.metadata.features.includes('control-flow-if'));"
      }
    },
    {
      "id": "common-mistakes",
      "title": "Common mistakes",
      "body": "Conditional rendering mistakes usually come from treating @if like a general JavaScript statement. The compiler expects a braced template block and a supported expression, because the generated branch effect must know exactly which DOM nodes and cleanup scope belong to each branch.",
      "points": [
        "Move condition preparation into a computed value when the template expression becomes hard to read.",
        "Use @for for lists instead of nesting several @if blocks to fake iteration.",
        "Keep form submission, routing, and mutation logic in TypeScript methods rather than inside the @if header."
      ]
    }
  ]
} as const;

const sectionLinks = compilerIfElseArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class IfElsePage {
  title(): string {
    return compilerIfElseArticle.title;
  }

  summary(): string {
    return compilerIfElseArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerIfElseArticle.sections[0].body;
  section1Body = compilerIfElseArticle.sections[1].body;
  section2Body = compilerIfElseArticle.sections[2].body;
  section3Body = compilerIfElseArticle.sections[3].body;
  section0Points = compilerIfElseArticle.sections[0].points ?? [];
  section1Points = compilerIfElseArticle.sections[1].points ?? [];
  section2Points = compilerIfElseArticle.sections[2].points ?? [];
  section3Points = compilerIfElseArticle.sections[3].points ?? [];
  section0Code = compilerIfElseArticle.sections[0].code?.code ?? '';
  section1Code = compilerIfElseArticle.sections[1].code?.code ?? '';
  section2Code = compilerIfElseArticle.sections[2].code?.code ?? '';
}
