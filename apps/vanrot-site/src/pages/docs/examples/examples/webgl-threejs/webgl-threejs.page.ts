import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const webglThreejsArticle = {
  "key": "webglThreejs",
  "section": "examples",
  "path": "/docs/examples/webgl-threejs",
  "label": "WebGL And three.js",
  "title": "WebGL And three.js Lifecycle",
  "summary": "Use Vanrot lifecycle hooks and signals around an app-owned WebGL or three.js scene without adding three.js to the core runtime.",
  "status": "demo-capable",
  "sections": [
    {
      "id": "boundary",
      "title": "Boundary",
      "body": "The shipped shape is recipe-only. Vanrot owns lifecycle, cleanup, signal binding, docs, and verified example code. The application owns three.js as an app dependency when it chooses to render with three.",
      "points": [
        "Do not add three.js to @vanrot/runtime.",
        "Do not create a renderer abstraction that hides three.js.",
        "Keep the canvas in a template and pass the element into TypeScript during onMount()."
      ]
    },
    {
      "id": "widget-recipe",
      "title": "Widget Recipe",
      "body": "examples/webgl-threejs/src/scene-preview.widget.ts creates a renderer after mount, binds signals to scene state with effect cleanup, handles context loss and restore, and disposes render loops, resize hooks, renderer resources, geometries, materials, textures, and controls.",
      "code": {
        "title": "Lifecycle-safe canvas controller",
        "code": "import { onDestroy, onMount, signal } from '@vanrot/runtime';\nimport { bindSignalToScene, createWebglCanvasController } from './scene-preview.widget';\n\nconst color = signal('#ff5a3d');\n\nonMount(() => {\n  const canvas = document.querySelector('canvas');\n  const container = canvas?.parentElement;\n\n  if (!(canvas instanceof HTMLCanvasElement) || container === null) {\n    return;\n  }\n\n  const controller = createWebglCanvasController({\n    canvas,\n    container,\n    createRenderer(context) {\n      return createAppOwnedThreeRenderer(context);\n    },\n    signalBindings: [\n      bindSignalToScene(color, (nextColor) => material.color.set(nextColor)),\n    ],\n  });\n\n  onDestroy(controller.destroy);\n});"
      }
    },
    {
      "id": "fallbacks",
      "title": "Fallbacks",
      "body": "The recipe treats WebGL as progressive enhancement. Missing WebGL, compact/mobile fallback, context loss, context restore, and prefers-reduced-motion each produce deterministic behavior that tests can verify.",
      "points": [
        "Reduced motion renders one static frame instead of starting an animation loop.",
        "Context loss cancels the pending animation frame and keeps cleanup idempotent until restore.",
        "Fallback copy remains visible when WebGL is unavailable or intentionally disabled."
      ]
    },
    {
      "id": "assets",
      "title": "Assets",
      "body": "Fixture assets stay local and centralized through webglAssetPaths. Examples should load textures and models from known local paths so build and browser verification are repeatable.",
      "points": [
        "Use local deterministic fixtures for docs examples.",
        "Surface asset load errors instead of hiding failed network or CORS paths.",
        "Dispose textures, geometries, materials, controls, loaders, and renderer-owned resources on teardown."
      ]
    }
  ]
} as const;

const sectionLinks = webglThreejsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class WebglThreejsPage {
  title(): string {
    return webglThreejsArticle.title;
  }

  summary(): string {
    return webglThreejsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = webglThreejsArticle.sections[0].body;
  section1Body = webglThreejsArticle.sections[1].body;
  section2Body = webglThreejsArticle.sections[2].body;
  section3Body = webglThreejsArticle.sections[3].body;
  section0Points = webglThreejsArticle.sections[0].points ?? [];
  section2Points = webglThreejsArticle.sections[2].points ?? [];
  section3Points = webglThreejsArticle.sections[3].points ?? [];
  section1Code = webglThreejsArticle.sections[1].code?.code ?? '';
}
