import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const editorToolingWebTypesArticle = {
  key: 'editorToolingWebTypes',
  section: 'framework',
  path: '/docs/editor-tooling/web-types',
  label: 'Web Types',
  title: 'Editor Web Types',
  summary:
    'Web Types metadata teaches IntelliJ and WebStorm which Vanrot tags and attributes are valid before language-server behavior runs.',
  status: 'available-now',
  sections: [
    {
      id: 'sources',
      title: 'Sources',
      body:
        'Vanrot reads root, docs-site, UI, and router Web Types files into one editor metadata summary.',
      points: [
        'web-types.json owns root project recognition.',
        'apps/vanrot-site/web-types.json owns docs-site shared tags.',
        'packages/ui/web-types.json owns UI primitive tags.',
        'packages/router/web-types.json owns route shorthand metadata.',
      ],
      code: {
        title: 'Web Types sources',
        code: 'web-types.json\napps/vanrot-site/web-types.json\npackages/ui/web-types.json\npackages/router/web-types.json',
      },
    },
    {
      id: 'valid-syntax',
      title: 'Valid syntax',
      body:
        'Bracket bindings and dotted no-value attributes are recognized editor syntax, not diagnostics by themselves.',
      points: ['[article] stays valid.', 'behavior.tooltip stays valid.', 'route.home stays valid.'],
    },
  ],
} as const;

const sectionLinks = editorToolingWebTypesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class WebTypesPage {
  title(): string {
    return editorToolingWebTypesArticle.title;
  }

  summary(): string {
    return editorToolingWebTypesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = editorToolingWebTypesArticle.sections[0].body;
  section0Points = editorToolingWebTypesArticle.sections[0].points ?? [];
  section0Code = editorToolingWebTypesArticle.sections[0].code?.code ?? '';
  section1Body = editorToolingWebTypesArticle.sections[1].body;
  section1Points = editorToolingWebTypesArticle.sections[1].points ?? [];
}
