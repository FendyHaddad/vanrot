import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const vitePluginArticle = {
  "key": "vitePlugin",
  "section": "framework",
  "path": "/docs/vite-plugin",
  "label": "Vite Plugin",
  "title": "Vite Plugin",
  "summary": "@vanrot/vite-plugin is the Vite integration layer for Vanrot applications. It compiles role files, watches sibling templates and styles, exposes virtual CSS and source modules, forwards diagnostics, and preserves source-map context during dev and build.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "plugin-boundary",
      "title": "Plugin boundary",
      "body": "@vanrot/vite-plugin belongs at the Vite boundary, not inside component code. The plugin reads Vanrot project configuration, chooses the role files that should be compiled, and lets the compiler produce JavaScript, scoped CSS, diagnostics, and metadata while Vite continues to own module loading and bundling.",
      "points": [
        "Register vanrot() once in vite.config.ts before application plugins that expect compiled Vanrot modules.",
        "Keep framework logic in component, page, layout, button, template, and CSS role files instead of custom Vite transforms.",
        "Use this parent guide as the map, then move into the child pages for setup, options, transforms, HMR, virtual modules, diagnostics, source maps, and devtools metadata."
      ],
      "code": {
        "title": "Register the plugin",
        "code": "import { defineConfig } from 'vite';\nimport vanrot from '@vanrot/vite-plugin';\n\nexport default defineConfig({\n  plugins: [vanrot()],\n});"
      }
    },
    {
      "id": "compile-flow",
      "title": "Compile flow",
      "body": "The plugin runs as a pre plugin so Vanrot role files are lowered before Vite treats them like ordinary application modules. It loads the project config, narrows files through include and exclude patterns, resolves template and style siblings, invokes @vanrot/compiler, then returns JavaScript and source maps back to Vite.",
      "points": [
        "The default include pattern covers files under the configured source root with .component.ts, .page.ts, .layout.ts, and .button.ts suffixes.",
        "Template and style siblings are added as watched files so edits flow through the owner role module.",
        "Compilation diagnostics are surfaced through Vite errors and warnings instead of being hidden in generated output."
      ]
    },
    {
      "id": "child-guides",
      "title": "Child guides",
      "body": "The Vite plugin touches several concerns that should not be squeezed into one thin page. Setup explains the default project wiring, options covers file matching and roots, transform documents role-file compilation, hot reload explains sibling invalidation, virtual modules explains generated CSS and source access, diagnostics covers failure behavior, source maps explains debugging support, and devtools metadata documents the local graph endpoint.",
      "points": [
        "Read Setup first when wiring a new Vanrot app.",
        "Read Options and Role file transform before customizing source roots or build layout.",
        "Read Hot reload, Virtual modules, Diagnostics, Source maps, and Devtools metadata when debugging integration behavior."
      ]
    },
    {
      "id": "production-contract",
      "title": "Production contract",
      "body": "In production builds, @vanrot/vite-plugin keeps the same compiler contract but changes the surrounding Vite behavior. Build diagnostics can stop the bundle, CSS source maps are emitted only when Vite build sourcemaps are enabled, and generated modules keep their metadata stable so router, devtools, and AI documentation can reason about the application consistently.",
      "points": [
        "Treat plugin diagnostics as build feedback, not optional log noise.",
        "Enable Vite sourcemaps when generated JavaScript or CSS needs source-level debugging.",
        "Keep role suffixes and source-root configuration stable so HMR, source maps, and devtools metadata all point at the same files."
      ]
    }
  ]
} as const;

const sectionLinks = vitePluginArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class VitePluginPage {
  title(): string {
    return vitePluginArticle.title;
  }

  summary(): string {
    return vitePluginArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = vitePluginArticle.sections[0].body;
  section1Body = vitePluginArticle.sections[1].body;
  section2Body = vitePluginArticle.sections[2].body;
  section3Body = vitePluginArticle.sections[3].body;
  section0Points = vitePluginArticle.sections[0].points ?? [];
  section1Points = vitePluginArticle.sections[1].points ?? [];
  section2Points = vitePluginArticle.sections[2].points ?? [];
  section3Points = vitePluginArticle.sections[3].points ?? [];
  section0Code = vitePluginArticle.sections[0].code?.code ?? '';
}
