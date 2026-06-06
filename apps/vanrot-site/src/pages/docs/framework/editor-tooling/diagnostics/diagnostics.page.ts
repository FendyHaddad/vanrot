import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const editorToolingDiagnosticsArticle = {
  key: 'editorToolingDiagnostics',
  section: 'framework',
  path: '/docs/editor-tooling/diagnostics',
  label: 'Diagnostics',
  title: 'Editor Diagnostics',
  summary:
    'Vanrot editor diagnostics flag unknown route refs, unknown metadata, and stale intelligence without treating valid bracket bindings or docs bindings as bugs.',
  status: 'available-now',
  sections: [
    {
      id: 'warnings',
      title: 'Warnings',
      body:
        'Editor diagnostics are deterministic and tied to source-owned route, component, and Web Types metadata.',
      points: [
        'VREDITOR001 flags unknown route refs.',
        'VREDITOR003 points missing tag metadata at Web Types.',
        'Code actions suggest small source-safe fixes.',
      ],
      code: {
        title: 'Editor diagnostics',
        code: 'VREDITOR001 unknown route ref\nVREDITOR003 missing Web Types metadata\nvanrot.openWebTypesSource',
      },
    },
    {
      id: 'non-issues',
      title: 'Known non-issues',
      body: 'Valid Vanrot syntax must stay quiet in editors.',
      points: [
        'Bracket bindings such as [article] are valid.',
        'Dotted no-value attributes such as behavior.tooltip are valid.',
        'Docs shared tags declared in Web Types are valid.',
      ],
    },
  ],
} as const;

const sectionLinks = editorToolingDiagnosticsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DiagnosticsPage {
  title(): string {
    return editorToolingDiagnosticsArticle.title;
  }

  summary(): string {
    return editorToolingDiagnosticsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = editorToolingDiagnosticsArticle.sections[0].body;
  section0Points = editorToolingDiagnosticsArticle.sections[0].points ?? [];
  section0Code = editorToolingDiagnosticsArticle.sections[0].code?.code ?? '';
  section1Body = editorToolingDiagnosticsArticle.sections[1].body;
  section1Points = editorToolingDiagnosticsArticle.sections[1].points ?? [];
}
