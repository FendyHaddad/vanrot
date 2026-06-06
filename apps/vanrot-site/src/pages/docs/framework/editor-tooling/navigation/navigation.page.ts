import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const editorToolingNavigationArticle = {
  key: 'editorToolingNavigation',
  section: 'framework',
  path: '/docs/editor-tooling/navigation',
  label: 'Navigation',
  title: 'Editor Navigation',
  summary:
    'Vanrot navigation covers definitions, references, and rename for route refs, component tags, docs tags, and Web Types-backed UI tags.',
  status: 'available-now',
  sections: [
    {
      id: 'language-server-owned',
      title: 'Language server owned',
      body:
        'The language server resolves symbols from project indexes and workspace templates. JetBrains starts the server but does not duplicate navigation logic in Kotlin.',
      points: [
        'route.name definitions point to the route table.',
        'Component tags point to component role files.',
        'Route rename edits route refs in indexed templates.',
      ],
      code: {
        title: 'Navigation ownership',
        code: 'packages/language-server/src/features/definition.ts\npackages/language-server/src/features/references.ts\npackages/language-server/src/server.ts',
      },
    },
    {
      id: 'rename',
      title: 'Route rename',
      body:
        'Route rename is scoped to template route refs so editor fixes do not silently rewrite application logic.',
      points: ['Route refs are discovered from open documents.', 'Indexed templates add closed-file references.'],
    },
  ],
} as const;

const sectionLinks = editorToolingNavigationArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class NavigationPage {
  title(): string {
    return editorToolingNavigationArticle.title;
  }

  summary(): string {
    return editorToolingNavigationArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = editorToolingNavigationArticle.sections[0].body;
  section0Points = editorToolingNavigationArticle.sections[0].points ?? [];
  section0Code = editorToolingNavigationArticle.sections[0].code?.code ?? '';
  section1Body = editorToolingNavigationArticle.sections[1].body;
  section1Points = editorToolingNavigationArticle.sections[1].points ?? [];
}
