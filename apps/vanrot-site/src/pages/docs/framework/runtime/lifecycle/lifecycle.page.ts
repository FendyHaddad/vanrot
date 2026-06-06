import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const runtimeLifecycleArticle = {
  "key": "runtimeLifecycle",
  "section": "framework",
  "path": "/docs/runtime/lifecycle",
  "label": "Lifecycle",
  "title": "Runtime Lifecycle",
  "summary": "Runtime lifecycle hooks attach setup and cleanup to the active mount scope so effects, DOM listeners, and component teardown stay deterministic.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "cleanup-scope",
      "title": "Cleanup scope",
      "body": "onMount() registers work that should run after the component is created. onDestroy() registers teardown against the active cleanup scope. Effects created inside the same scope are disposed with the app, so tests and previews can clean up consistently.",
      "points": [
        "Use onMount() for browser APIs that need real DOM nodes.",
        "Use onDestroy() for cleanup that is not already returned from an effect.",
        "Keep lifecycle logic in TypeScript and keep application logic out of HTML."
      ],
      "code": {
        "title": "Mount and cleanup hooks",
        "code": "import { onDestroy, onMount } from '@vanrot/runtime';\n\nonMount(() => {\n  const controller = new AbortController();\n  window.addEventListener('resize', () => console.log(window.innerWidth), {\n    signal: controller.signal,\n  });\n\n  return () => controller.abort();\n});\n\nonDestroy(() => console.log('component destroyed'));"
      }
    }
  ]
} as const;

const sectionLinks = runtimeLifecycleArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class LifecyclePage {
  title(): string {
    return runtimeLifecycleArticle.title;
  }

  summary(): string {
    return runtimeLifecycleArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = runtimeLifecycleArticle.sections[0].body;
  section0Points = runtimeLifecycleArticle.sections[0].points ?? [];
  section0Code = runtimeLifecycleArticle.sections[0].code?.code ?? '';
}
