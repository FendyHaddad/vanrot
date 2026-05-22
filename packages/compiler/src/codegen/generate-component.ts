import type { CompileDiagnostic, CompileFeature, CompileOptions } from '../api/types.js';
import type { ComponentMetadata } from '../metadata/component-metadata.js';
import type { ElementNode, TemplateAttribute, TemplateNode } from '../template/ast.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { generateAttribute, generateText, quoteString } from './bindings.js';
import {
  generateChildComponent,
  generateChildComponentImports,
  isChildComponentTag,
} from './components.js';
import { generateForBlock, generateIfBlock } from './control-flow.js';
import { createGeneratedMapping } from './mappings.js';
import { generateSlotOutlet } from './slots.js';
import { createGenerateState, type GenerateState } from './state.js';

export interface GenerateComponentInput {
  metadata: ComponentMetadata;
  nodes: readonly TemplateNode[];
  scopeAttribute: string;
  templatePath: string;
  templateSource: string;
}

export interface GenerateComponentResult {
  js: string;
  diagnostics: CompileDiagnostic[];
  features: CompileFeature[];
  componentDependencies: GenerateState['componentDependencies'];
  mappings: GenerateState['mappings'];
}

const uiButtonTagName = 'vr-button';
const uiButtonNativeTagName = 'button';
const uiButtonBaseClass = 'vr-button';

export function generateComponent(
  input: GenerateComponentInput,
  options: CompileOptions = {},
): GenerateComponentResult {
  const state = createGenerateState(input);

  state.lines.push('export function createComponent(initialInputs = {}, projectedSlots = {}) {');
  state.lines.push(`  const ctx = new ${input.metadata.componentName}();`);
  state.lines.push('  for (const [inputName, inputValue] of Object.entries(initialInputs)) {');
  state.lines.push('    const inputSignal = ctx[inputName];');
  state.lines.push("    if (inputSignal === undefined || typeof inputSignal.set !== 'function') {");
  state.lines.push('      continue;');
  state.lines.push('    }');
  state.lines.push('    inputSignal.set(inputValue);');
  state.lines.push('  }');
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

  if (state.usesSlots) {
    state.lines.push('');
    state.lines.push('function renderSlot(parent, name, fallback, projectedSlots) {');
    state.lines.push('  const projected = projectedSlots[name];');
    state.lines.push('  if (projected === undefined) {');
    state.lines.push('    parent.append(fallback);');
    state.lines.push('    return;');
    state.lines.push('  }');
    state.lines.push('  parent.append(projected);');
    state.lines.push('}');
  }

  return {
    js: [...generateImports(input.metadata, state, options), '', ...state.lines].join('\n'),
    diagnostics: state.diagnostics,
    features: [...state.features],
    componentDependencies: state.componentDependencies,
    mappings: state.mappings,
  };
}

function generateImports(
  metadata: ComponentMetadata,
  state: GenerateState,
  options: CompileOptions,
): string[] {
  const componentImportSpecifier = options.componentImportSpecifier ?? metadata.importPath;
  const imports = [`import { ${metadata.exportName} } from ${quoteString(componentImportSpecifier)};`];

  imports.push(...generateChildComponentImports(state.componentDependencies));

  if (state.usesEffect) {
    imports.push("import { effect } from '@vanrot/runtime';");
  }

  if (state.usesSignal) {
    imports.push("import { signal } from '@vanrot/runtime';");
  }

  if (state.usesListen) {
    imports.push("import { listen } from '@vanrot/runtime/internal';");
  }

  if (state.usesCleanupScopes) {
    imports.push(
      "import { createCleanupScope, disposeCleanupScope, runWithCleanupScope } from '@vanrot/runtime/internal';",
    );
  }

  if (state.usesRegisterCleanup) {
    imports.push("import { registerCleanup } from '@vanrot/runtime/internal';");
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

export function generateNode(
  node: TemplateNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  if (node.kind === 'text' && node.value.trim().length === 0) {
    return;
  }

  state.mappings.push(createGeneratedMapping('js', state.lines.length + 1, 1, node.span));

  if (node.kind === 'text') {
    generateText(node, parentName, state);
    return;
  }

  if (node.kind === 'if-block') {
    generateIfBlock(node, parentName, scopeAttribute, state, generateNode);
    return;
  }

  if (node.kind === 'for-block') {
    generateForBlock(node, parentName, scopeAttribute, state, generateNode);
    return;
  }

  if (node.kind === 'slot-outlet') {
    generateSlotOutlet(node, parentName, scopeAttribute, state, generateNode);
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

  if (isChildComponentTag(node.tagName)) {
    generateChildComponent(node, parentName, scopeAttribute, state, generateNode);
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
