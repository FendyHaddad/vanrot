import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const devtoolsViteMetadataArticle = {
  "key": "devtoolsViteMetadata",
  "section": "framework",
  "path": "/docs/devtools/vite-metadata",
  "label": "Vite Metadata",
  "title": "Devtools Vite Metadata",
  "summary": "Vite metadata connects the dev server, plugin diagnostics, role-file transforms, and devtools inspection.",
  "status": "production-ready-through-phase-23",
  "sections": [
    {
      "id": "metadata-endpoint",
      "title": "Metadata endpoint",
      "body": "The Vite plugin exposes development metadata so devtools can inspect files, diagnostics, and generated graph context while the app is running. This keeps devtools tied to the active dev server.",
      "points": [
        "Use /__vanrot/devtools/metadata for local dev server metadata.",
        "Keep metadata read-only from the devtools point of view.",
        "Debug missing metadata in the Vite plugin before changing the panel."
      ],
      "code": {
        "title": "Fetch metadata",
        "code": "const response = await fetch('/__vanrot/devtools/metadata');\\nconst metadata = await response.json();\\nconsole.log(metadata.diagnostics);"
      }
    },
    {
      "id": "plugin-producer",
      "title": "Plugin producer",
      "body": "The Vite plugin is the producer for transform-time diagnostics and virtual module context. Devtools should read this metadata but should not duplicate the plugin's compilation or hot-reload responsibilities.",
      "points": [
        "Use Vite plugin docs when metadata is missing.",
        "Use diagnostics pages when transform errors are present.",
        "Use source map docs when metadata points at generated locations."
      ]
    },
    {
      "id": "metadata-debugging",
      "title": "Metadata debugging",
      "body": "If metadata is empty, confirm the app is served through the Vanrot Vite plugin, not a static file preview. Then check config root, sourceRoot, and plugin include patterns.",
      "points": [
        "Check the Vite plugin setup page for plugin registration.",
        "Check configuration defaults before changing include patterns.",
        "Check dev server logs for plugin diagnostics."
      ]
    }
  ]
} as const;

const sectionLinks = devtoolsViteMetadataArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ViteMetadataPage {
  title(): string {
    return devtoolsViteMetadataArticle.title;
  }

  summary(): string {
    return devtoolsViteMetadataArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = devtoolsViteMetadataArticle.sections[0].body;
  section1Body = devtoolsViteMetadataArticle.sections[1].body;
  section2Body = devtoolsViteMetadataArticle.sections[2].body;
  section0Points = devtoolsViteMetadataArticle.sections[0].points ?? [];
  section1Points = devtoolsViteMetadataArticle.sections[1].points ?? [];
  section2Points = devtoolsViteMetadataArticle.sections[2].points ?? [];
  section0Code = devtoolsViteMetadataArticle.sections[0].code?.code ?? '';
}
