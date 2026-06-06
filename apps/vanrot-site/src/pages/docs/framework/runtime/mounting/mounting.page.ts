import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const runtimeMountingArticle = {
  "key": "runtimeMounting",
  "section": "framework",
  "path": "/docs/runtime/mounting",
  "label": "Mounting",
  "title": "Runtime Mounting",
  "summary": "mount() is the browser entry point that creates the root cleanup scope and attaches compiled component output to a target element.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "app-handle",
      "title": "App handle",
      "body": "mount() accepts a compiled component module or component type and appends the produced nodes into the target element. The returned app handle owns deterministic destroy(), which removes mounted nodes and disposes the root cleanup scope.",
      "points": [
        "Use mount() once in the application entry point.",
        "Use app.destroy() in tests, previews, embedded shells, and teardown-heavy examples.",
        "Keep routing and configuration outside mount(); mount only owns the live component root."
      ],
      "code": {
        "title": "Application entry",
        "code": "import { mount } from '@vanrot/runtime';\nimport { App } from './app/app.layout.ts';\n\nconst target = document.getElementById('app');\n\nif (target === null) {\n  throw new Error('Missing app target.');\n}\n\nconst app = mount(App, target);\napp.destroy();"
      }
    }
  ]
} as const;

const sectionLinks = runtimeMountingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class MountingPage {
  title(): string {
    return runtimeMountingArticle.title;
  }

  summary(): string {
    return runtimeMountingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = runtimeMountingArticle.sections[0].body;
  section0Points = runtimeMountingArticle.sections[0].points ?? [];
  section0Code = runtimeMountingArticle.sections[0].code?.code ?? '';
}
