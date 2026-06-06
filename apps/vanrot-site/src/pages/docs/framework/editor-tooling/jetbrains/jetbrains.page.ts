import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const editorToolingJetBrainsArticle = {
  key: 'editorToolingJetBrains',
  section: 'framework',
  path: '/docs/editor-tooling/jetbrains',
  label: 'JetBrains',
  title: 'JetBrains Plugin',
  summary:
    'The JetBrains plugin packages the Vanrot language server and keeps editor behavior in TypeScript.',
  status: 'available-now',
  sections: [
    {
      id: 'thin-plugin',
      title: 'Thin plugin',
      body:
        'The plugin locates Node, starts the bundled language server, registers Vanrot template files, and suppresses only the known empty-tag warning.',
      points: [
        'No completion logic belongs in Kotlin.',
        'No navigation logic belongs in Kotlin.',
        'No diagnostics or code-action logic belongs in Kotlin.',
      ],
      code: {
        title: 'Plugin checks',
        code: [
          'JAVA_HOME=$(/usr/libexec/java_home -v 21) \\',
          '  ./gradlew test buildPlugin verifyVanrotPluginPackage',
        ].join('\n'),
      },
    },
    {
      id: 'package',
      title: 'Package contents',
      body:
        'Release checks inspect the plugin ZIP for plugin metadata, the bundled server entry point, package metadata, and generated template globs.',
      points: ['META-INF/plugin.xml is inside the plugin JAR.', 'server/bin/server.js is bundled.', 'server/template-globs.json is bundled.'],
    },
  ],
} as const;

const sectionLinks = editorToolingJetBrainsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class JetbrainsPage {
  title(): string {
    return editorToolingJetBrainsArticle.title;
  }

  summary(): string {
    return editorToolingJetBrainsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = editorToolingJetBrainsArticle.sections[0].body;
  section0Points = editorToolingJetBrainsArticle.sections[0].points ?? [];
  section0Code = editorToolingJetBrainsArticle.sections[0].code?.code ?? '';
  section1Body = editorToolingJetBrainsArticle.sections[1].body;
  section1Points = editorToolingJetBrainsArticle.sections[1].points ?? [];
}
