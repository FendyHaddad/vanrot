import type { ComponentEntry } from './component-index.js';
import type { RouteEntry } from './route-index.js';
import type { TemplateFileEntry, TemplateIndex } from './template-index.js';
import { emptyTemplateIndex } from './template-index.js';
import type { VanrotWebTypesSummary } from './web-types.js';
import { emptyVanrotWebTypes } from './web-types.js';
import type { WorkspaceIndex } from './workspace.js';

export interface VanrotEditorIntelligence {
  schemaVersion: 1;
  projectRoot: string | null;
  routes: VanrotEditorRoute[];
  components: VanrotEditorComponent[];
  templates: VanrotEditorTemplate[];
  webTypes: VanrotWebTypesSummary;
  diagnostics: VanrotEditorDiagnosticSummary[];
  generatedMetadata: VanrotEditorGeneratedMetadata[];
}

export interface VanrotEditorRoute {
  key: string;
  path: string | null;
  page: string | null;
  sourceFile: string;
}

export interface VanrotEditorComponent {
  tagName: string;
  className: string;
  componentFile: string;
}

export interface VanrotEditorTemplate {
  path: string;
  routeRefs: string[];
  tags: string[];
  bracketBindings: string[];
  dottedAttributes: string[];
}

export interface VanrotEditorDiagnosticSummary {
  code: string;
  message: string;
  sourceFile: string;
}

export interface VanrotEditorGeneratedMetadata {
  path: string;
  kind: 'web-types' | 'intelligence' | 'template-globs';
}

export function buildEditorIntelligence(index: WorkspaceIndex): VanrotEditorIntelligence {
  return {
    schemaVersion: 1,
    projectRoot: index.projectRoot,
    routes: index.routes.map(toEditorRoute),
    components: index.components.map(toEditorComponent),
    templates: toEditorTemplates(index.templates ?? emptyTemplateIndex()),
    webTypes: index.webTypes ?? emptyVanrotWebTypes(),
    diagnostics: [],
    generatedMetadata: [],
  };
}

function toEditorRoute(route: RouteEntry): VanrotEditorRoute {
  return {
    key: route.name,
    path: route.path ?? null,
    page: route.page ?? null,
    sourceFile: route.span.filePath,
  };
}

function toEditorComponent(component: ComponentEntry): VanrotEditorComponent {
  return {
    tagName: component.tagName,
    className: component.className,
    componentFile: component.path,
  };
}

function toEditorTemplates(index: TemplateIndex): VanrotEditorTemplate[] {
  return index.templates.map((template) => ({
    path: template.path,
    routeRefs: names(template.routeRefs),
    tags: names(template.tags),
    bracketBindings: names(template.bracketBindings),
    dottedAttributes: names(template.dottedAttributes),
  }));
}

function names(entries: readonly TemplateReferenceLike[]): string[] {
  return entries.map((entry) => entry.name);
}

type TemplateReferenceLike = TemplateFileEntry['routeRefs'][number];
