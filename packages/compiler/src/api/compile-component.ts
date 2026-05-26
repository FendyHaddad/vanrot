import type {
  CompileDiagnostic,
  CompileFeature,
  CompileOptions,
  CompileResult,
  ComponentSource,
} from './types.js';
import { createComponentFileSet } from '../conventions/component-files.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { readComponentMetadata } from '../metadata/component-metadata.js';
import { parseTemplate } from '../template/parse-template.js';
import { extractTemplateBindings } from '../template/bindings.js';
import { createScopeAttribute } from '../styles/scope-id.js';
import { scopeCss } from '../styles/scope-css.js';
import { generateComponent } from '../codegen/generate-component.js';
import { diagnoseRouterTemplateUsage } from '../router/router-template-diagnostics.js';

const featureOrder: CompileFeature[] = [
  'file-convention',
  'component-class',
  'text-interpolation',
  'event-binding',
  'property-binding',
  'child-component',
  'scoped-css',
  'readable-output',
  'expression-rewriting',
  'control-flow-if',
  'control-flow-for',
  'router-root',
  'router-outlet',
  'router-link',
  'ui-button',
  'ui-popover',
  'ui-tooltip',
  'ui-command-menu',
  'slot',
];

export function compileComponent(source: ComponentSource, options: CompileOptions = {}): CompileResult {
  const fileSet = createComponentFileSet(source.componentPath);

  if (fileSet === null) {
    return createEmptyResult([
      createDiagnostic(
        'VR003',
        'error',
        'Vanrot supports .component.ts, .page.ts, .layout.ts, and .button.ts role files.',
        source.componentPath,
      ),
    ]);
  }

  const diagnostics: CompileDiagnostic[] = [];
  const features = new Set<CompileFeature>(['file-convention']);
  const metadataResult = readComponentMetadata(
    {
      ...fileSet,
      templatePath: source.templatePath,
      stylePath: source.stylePath,
    },
    source.componentSource,
  );

  diagnostics.push(...metadataResult.diagnostics);

  if (metadataResult.metadata === null) {
    return createEmptyResult(diagnostics);
  }

  features.add('component-class');

  const parsedTemplate = parseTemplate(source.templateSource, source.templatePath);
  const routerDiagnostics = diagnoseRouterTemplateUsage(parsedTemplate.nodes, source.templatePath);
  const templateBindings = extractTemplateBindings(parsedTemplate.nodes, source.templatePath);
  const scopeAttribute = createScopeAttribute(source.componentPath, source.styleSource);
  const scopedCss = scopeCss(source.styleSource, scopeAttribute, source.stylePath);
  const generated = generateComponent({
    metadata: metadataResult.metadata,
    nodes: parsedTemplate.nodes,
    scopeAttribute,
    templatePath: source.templatePath,
    templateSource: source.templateSource,
  }, options);

  diagnostics.push(
    ...parsedTemplate.diagnostics,
    ...routerDiagnostics,
    ...templateBindings.diagnostics,
    ...scopedCss.diagnostics,
    ...generated.diagnostics,
  );
  features.add('scoped-css');

  for (const feature of generated.features) {
    features.add(feature);
  }

  return {
    js: generated.js,
    css: scopedCss.css,
    diagnostics,
    metadata: {
      componentName: metadataResult.metadata.componentName,
      scopeAttribute,
      features: featureOrder.filter((feature) => features.has(feature)),
      componentDependencies: generated.componentDependencies,
      mappings: [...generated.mappings, ...scopedCss.mappings],
    },
  };
}

function createEmptyResult(diagnostics: CompileDiagnostic[]): CompileResult {
  return {
    js: '',
    css: '',
    diagnostics,
    metadata: {
      componentName: '',
      scopeAttribute: '',
      features: [],
      componentDependencies: [],
      mappings: [],
    },
  };
}
