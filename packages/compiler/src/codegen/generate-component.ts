import type { CompileDiagnostic, CompileFeature, CompileOptions } from '../api/types.js';
import {
  rewriteEventHandlerExpression,
  rewriteExpression,
} from '../expressions/rewrite-expression.js';
import type { ComponentMetadata } from '../metadata/component-metadata.js';
import type { ElementNode, TemplateAttribute, TemplateNode, TextNode } from '../template/ast.js';
import { parseInterpolation } from '../template/bindings.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { IdentifierAllocator } from './identifiers.js';

export interface GenerateComponentInput {
  metadata: ComponentMetadata;
  nodes: readonly TemplateNode[];
  scopeAttribute: string;
  templatePath: string;
}

export interface GenerateComponentResult {
  js: string;
  diagnostics: CompileDiagnostic[];
  features: CompileFeature[];
}

interface GenerateState {
  ids: IdentifierAllocator;
  lines: string[];
  diagnostics: CompileDiagnostic[];
  features: Set<CompileFeature>;
  usesEffect: boolean;
  usesListen: boolean;
  usesRouterOutlet: boolean;
  usesRouteLink: boolean;
  templatePath: string;
}

const uiButtonTagName = 'vr-button';
const uiButtonNativeTagName = 'button';
const uiButtonBaseClass = 'vr-button';

export function generateComponent(
  input: GenerateComponentInput,
  options: CompileOptions = {},
): GenerateComponentResult {
  const state: GenerateState = {
    ids: new IdentifierAllocator(),
    lines: [],
    diagnostics: [],
    features: new Set<CompileFeature>(['readable-output']),
    usesEffect: false,
    usesListen: false,
    usesRouterOutlet: false,
    usesRouteLink: false,
    templatePath: input.templatePath,
  };

  state.lines.push('export function createComponent() {');
  state.lines.push(`  const ctx = new ${input.metadata.componentName}();`);
  state.lines.push('  const fragment = document.createDocumentFragment();');

  for (const node of input.nodes) {
    generateNode(node, 'fragment', input.scopeAttribute, state);
  }

  state.lines.push('');
  state.lines.push('  return {');
  state.lines.push('    node: fragment,');
  state.lines.push('    ctx,');
  state.lines.push('  };');
  state.lines.push('}');

  return {
    js: [...generateImports(input.metadata, state, options), '', ...state.lines].join('\n'),
    diagnostics: state.diagnostics,
    features: [...state.features],
  };
}

function generateImports(
  metadata: ComponentMetadata,
  state: GenerateState,
  options: CompileOptions,
): string[] {
  const componentImportSpecifier = options.componentImportSpecifier ?? metadata.importPath;
  const imports = [`import { ${metadata.exportName} } from ${quoteString(componentImportSpecifier)};`];

  if (state.usesEffect) {
    imports.push("import { effect } from '@vanrot/runtime';");
  }

  if (state.usesListen) {
    imports.push("import { listen } from '@vanrot/runtime/internal';");
  }

  const routerImports: string[] = [];

  if (state.usesRouterOutlet) {
    routerImports.push('createRouterOutlet');
  }

  if (state.usesRouteLink) {
    routerImports.push('setupRouteLink');
  }

  if (routerImports.length > 0) {
    imports.push(`import { ${routerImports.join(', ')} } from '@vanrot/router/internal';`);
  }

  return imports;
}

function generateNode(
  node: TemplateNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  if (node.kind === 'text') {
    generateText(node, parentName, state);
    return;
  }

  generateElement(node, parentName, scopeAttribute, state);
}

function generateElement(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  if (node.tagName === 'vr-router') {
    generateRouterOutlet(parentName, scopeAttribute, state);
    return;
  }

  if (node.tagName === 'vr') {
    generateRouterLink(node, parentName, scopeAttribute, state);
    return;
  }

  if (node.tagName === uiButtonTagName) {
    generateUiButton(node, parentName, scopeAttribute, state);
    return;
  }

  if (isUnsupportedVanrotUiTag(node.tagName)) {
    diagnoseUnsupportedVanrotUiTag(node.tagName, state);
    return;
  }

  const elementName = state.ids.next(node.tagName);

  state.lines.push(`  const ${elementName} = document.createElement(${quoteString(node.tagName)});`);
  state.lines.push(`  ${elementName}.setAttribute(${quoteString(scopeAttribute)}, '');`);

  for (const attribute of node.attributes) {
    generateAttribute(attribute, elementName, state);
  }

  for (const child of node.children) {
    generateNode(child, elementName, scopeAttribute, state);
  }

  state.lines.push(`  ${parentName}.append(${elementName});`);
}

function generateRouterOutlet(
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  const outletName = state.ids.next('div');

  state.usesRouterOutlet = true;
  state.features.add('router-outlet');
  state.lines.push(`  const ${outletName} = document.createElement('div');`);
  state.lines.push(`  ${outletName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  state.lines.push(`  createRouterOutlet(${outletName});`);
  state.lines.push(`  ${parentName}.append(${outletName});`);
}

function generateRouterLink(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  const routeAttribute = node.attributes.find((attribute) =>
    /^route\.[A-Za-z_$][\w$]*$/.test(attribute.name),
  );

  if (routeAttribute === undefined) {
    state.diagnostics.push(
      createDiagnostic(
        'VR009',
        'error',
        'Use <vr route.name /> for Vanrot route links.',
        state.templatePath,
      ),
    );
    return;
  }

  const routeLinkName = state.ids.next('a');
  state.usesRouteLink = true;
  state.features.add('router-link');
  state.lines.push(`  const ${routeLinkName} = document.createElement('a');`);
  state.lines.push(`  ${routeLinkName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  state.lines.push(`  setupRouteLink(${routeLinkName}, ctx.${routeAttribute.name});`);
  state.lines.push(`  ${parentName}.append(${routeLinkName});`);
}

function generateUiButton(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  const buttonName = state.ids.next(uiButtonNativeTagName);

  state.features.add('ui-button');
  state.lines.push(`  const ${buttonName} = document.createElement(${quoteString(uiButtonNativeTagName)});`);
  state.lines.push(`  ${buttonName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  generateUiButtonClass(node.attributes, buttonName, state);

  for (const attribute of node.attributes) {
    if (attribute.name === 'class') {
      continue;
    }

    generateAttribute(attribute, buttonName, state);
  }

  for (const child of node.children) {
    generateNode(child, buttonName, scopeAttribute, state);
  }

  state.lines.push(`  ${parentName}.append(${buttonName});`);
}

function generateUiButtonClass(
  attributes: readonly TemplateAttribute[],
  buttonName: string,
  state: GenerateState,
): void {
  const classAttribute = attributes.find((attribute) => attribute.name === 'class');
  const classValue = mergeClassValue(uiButtonBaseClass, classAttribute?.value ?? '');

  state.lines.push(
    `  ${buttonName}.setAttribute(${quoteString('class')}, ${quoteString(classValue)});`,
  );
}

function mergeClassValue(baseClass: string, userClassValue: string): string {
  const classNames = new Set(
    [baseClass, ...userClassValue.split(/\s+/)].filter((className) => className.length > 0),
  );

  return [...classNames].join(' ');
}

function isUnsupportedVanrotUiTag(tagName: string): boolean {
  return tagName.startsWith('vr-');
}

function diagnoseUnsupportedVanrotUiTag(tagName: string, state: GenerateState): void {
  state.diagnostics.push(
    createDiagnostic(
      'VR010',
      'error',
      `${tagName} is not a supported Vanrot UI primitive in Phase 9. Use <vr-button> or add this primitive to the production UI plan.`,
      state.templatePath,
    ),
  );
}

function generateText(node: TextNode, parentName: string, state: GenerateState): void {
  if (node.value.trim().length === 0) {
    return;
  }

  const interpolation = parseInterpolation(node.value);
  const textName = state.ids.next('text');

  if (interpolation === null) {
    state.lines.push(`  const ${textName} = document.createTextNode(${quoteString(node.value)});`);
    state.lines.push(`  ${parentName}.append(${textName});`);
    return;
  }

  const rewritten = rewriteExpression(interpolation.expression, state.templatePath);

  state.diagnostics.push(...rewritten.diagnostics);

  if (rewritten.expression === null) {
    return;
  }

  state.usesEffect = true;
  state.features.add('text-interpolation');
  state.features.add('expression-rewriting');
  state.lines.push(`  const ${textName} = document.createTextNode('');`);
  state.lines.push(`  ${parentName}.append(${textName});`);
  state.lines.push('  effect(() => {');
  state.lines.push(
    `    ${textName}.data = \`${escapeTemplatePart(interpolation.staticParts[0] ?? '')}\${${
      rewritten.expression
    }}${escapeTemplatePart(interpolation.staticParts[1] ?? '')}\`;`,
  );
  state.lines.push('  });');
}

function generateAttribute(
  attribute: TemplateAttribute,
  elementName: string,
  state: GenerateState,
): void {
  const propertyMatch = /^\[([^\]]+)\]$/.exec(attribute.name);
  const eventMatch = /^\(([^)]+)\)$/.exec(attribute.name);

  if (propertyMatch !== null) {
    generatePropertyBinding(propertyMatch[1] ?? '', attribute.value, elementName, state);
    return;
  }

  if (eventMatch !== null) {
    generateEventBinding(eventMatch[1] ?? '', attribute.value, elementName, state);
    return;
  }

  if (attribute.name.startsWith('[') || attribute.name.startsWith('(')) {
    return;
  }

  state.lines.push(
    `  ${elementName}.setAttribute(${quoteString(attribute.name)}, ${quoteString(attribute.value)});`,
  );
}

function generatePropertyBinding(
  propertyName: string,
  expression: string,
  elementName: string,
  state: GenerateState,
): void {
  const rewritten = rewriteExpression(expression, state.templatePath);

  state.diagnostics.push(...rewritten.diagnostics);

  if (rewritten.expression === null) {
    return;
  }

  state.usesEffect = true;
  state.features.add('property-binding');
  state.features.add('expression-rewriting');
  state.lines.push('  effect(() => {');
  state.lines.push(`    ${elementName}.${propertyName} = ${rewritten.expression};`);
  state.lines.push('  });');
}

function generateEventBinding(
  eventName: string,
  expression: string,
  elementName: string,
  state: GenerateState,
): void {
  const rewritten = rewriteEventHandlerExpression(expression, state.templatePath);

  state.diagnostics.push(...rewritten.diagnostics);

  if (rewritten.expression === null) {
    return;
  }

  state.usesListen = true;
  state.features.add('event-binding');
  state.features.add('expression-rewriting');
  state.lines.push(`  listen(${elementName}, ${quoteString(eventName)}, () => {`);
  state.lines.push(`    ${rewritten.expression};`);
  state.lines.push('  });');
}

function quoteString(value: string): string {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'").replaceAll('\n', '\\n')}'`;
}

function escapeTemplatePart(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');
}
