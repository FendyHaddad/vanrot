import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const editorToolingArticle = {
  key: 'editorTooling',
  section: 'framework',
  path: '/docs/editor-tooling',
  label: 'Editor Tooling',
  title: 'Editor Tooling',
  summary:
    'Vanrot editor tooling gives JetBrains IDEs route, component, template, Web Types, diagnostics, code action, and package metadata support through the language server.',
  status: 'available-now',
  sections: [
    {
      id: 'release-boundary',
      title: 'Release boundary',
      body:
        'Phase 31 ships editor tooling as one release. Web Types, project intelligence, navigation, diagnostics, code actions, and JetBrains packaging are workstreams inside the same editor tooling surface.',
      points: [
        'The language server owns editor behavior.',
        'The JetBrains plugin stays a thin bridge.',
        'Web Types remain the first line of IDE recognition.',
      ],
      code: {
        title: 'Shared editor intelligence',
        code: '.vanrot/editor-intelligence.json\npackages/language-server/dist-intellij/bin/server.js\npackages/language-server/dist-intellij/template-globs.json',
      },
    },
    {
      id: 'child-guides',
      title: 'Child guides',
      body:
        'The child pages document the contracts an editor adapter and a Vanrot project both depend on.',
      points: [
        'Web Types explains recognition metadata.',
        'Navigation explains definitions, references, and rename.',
        'Diagnostics explains valid syntax, warnings, and code actions.',
        'JetBrains explains plugin packaging and smoke checks.',
      ],
    },
  ],
} as const;

const sectionLinks = editorToolingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class EditorToolingPage {
  title(): string {
    return editorToolingArticle.title;
  }

  summary(): string {
    return editorToolingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = editorToolingArticle.sections[0].body;
  section0Points = editorToolingArticle.sections[0].points ?? [];
  section0Code = editorToolingArticle.sections[0].code?.code ?? '';
  section1Body = editorToolingArticle.sections[1].body;
  section1Points = editorToolingArticle.sections[1].points ?? [];
}
