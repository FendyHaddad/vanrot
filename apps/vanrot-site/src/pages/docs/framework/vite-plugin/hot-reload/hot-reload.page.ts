import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const vitePluginHotReloadArticle = {
  "key": "vitePluginHotReload",
  "section": "framework",
  "path": "/docs/vite-plugin/hot-reload",
  "label": "Hot Reload",
  "title": "Vite Plugin Hot Reload",
  "summary": "Hot reload keeps HTML and CSS sibling edits attached to the owning Vanrot role module instead of treating siblings as disconnected files.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "sibling-ownership",
      "title": "Sibling ownership",
      "body": "Vanrot role files own their HTML and CSS siblings. When a .component.html, .component.css, .page.html, .page.css, .layout.html, .layout.css, .button.html, or .button.css file changes, the plugin maps that file back to the owning TypeScript role file.",
      "points": [
        "Sibling HTML changes invalidate the owner role module.",
        "Sibling CSS changes invalidate the owner role module.",
        "Files without a recognized Vanrot role suffix are left to normal Vite handling."
      ],
      "code": {
        "title": "Recognized siblings",
        "code": "src/counter/counter.component.ts\nsrc/counter/counter.component.html\nsrc/counter/counter.component.css"
      }
    },
    {
      "id": "module-invalidation",
      "title": "Module invalidation",
      "body": "After finding the owner path, the plugin tells Vite's module graph that the owner changed, finds the owner module by file, id, or URL, and invalidates each owner module with the current HMR timestamp. This keeps template and style edits inside the same update path as TypeScript edits.",
      "points": [
        "moduleGraph.onFileChange is called for the owner role file.",
        "moduleGraph.invalidateModule marks owner modules stale.",
        "Returning owner modules lets Vite send a targeted hot update where possible."
      ],
      "code": {
        "title": "Plugin setup still stays simple",
        "code": "import { defineConfig } from 'vite';\nimport vanrot from '@vanrot/vite-plugin';\n\nexport default defineConfig({\n  plugins: [vanrot()],\n});"
      }
    },
    {
      "id": "fallback-reload",
      "title": "Fallback reload",
      "body": "If Vite cannot find an owner module for the changed sibling, the plugin sends a full reload instead of pretending the update was handled. That fallback is intentionally conservative because losing a template or style edit is worse than doing a full browser refresh.",
      "points": [
        "A missing owner module usually means the owner has not been requested by Vite yet.",
        "Full reload is used only after owner path discovery succeeds but module lookup fails.",
        "Non-Vanrot files return undefined and continue through the normal Vite HMR path."
      ]
    }
  ]
} as const;

const sectionLinks = vitePluginHotReloadArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class HotReloadPage {
  title(): string {
    return vitePluginHotReloadArticle.title;
  }

  summary(): string {
    return vitePluginHotReloadArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = vitePluginHotReloadArticle.sections[0].body;
  section1Body = vitePluginHotReloadArticle.sections[1].body;
  section2Body = vitePluginHotReloadArticle.sections[2].body;
  section0Points = vitePluginHotReloadArticle.sections[0].points ?? [];
  section1Points = vitePluginHotReloadArticle.sections[1].points ?? [];
  section2Points = vitePluginHotReloadArticle.sections[2].points ?? [];
  section0Code = vitePluginHotReloadArticle.sections[0].code?.code ?? '';
  section1Code = vitePluginHotReloadArticle.sections[1].code?.code ?? '';
}
