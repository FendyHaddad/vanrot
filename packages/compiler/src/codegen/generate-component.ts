import type { CompileDiagnostic, CompileFeature, CompileOptions } from '../api/types.js';
import type { ComponentMetadata } from '../metadata/component-metadata.js';
import type { ElementNode, TemplateAttribute, TemplateNode } from '../template/ast.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { rewriteExpression } from '../expressions/rewrite-expression.js';
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
import {
  createUnsupportedVanrotUiMessage,
  createInvalidUiVariantMessage,
  findCompilerUiElement,
  isVanrotUiTag,
  type CompilerUiElement,
} from './ui-elements.js';

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

  if (state.usesRouterRoot || state.usesRouterOutlet) {
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
    generateRouterOutlet(node, parentName, scopeAttribute, state, 'router');
    return;
  }

  if (node.tagName === 'vr-outlet') {
    generateRouterOutlet(node, parentName, scopeAttribute, state, 'outlet');
    return;
  }

  if (node.tagName === 'vr') {
    generateRouterLink(node, parentName, scopeAttribute, state);
    return;
  }

  const uiElement = findCompilerUiElement(node.tagName);
  if (uiElement !== null) {
    generateCompilerUiElement(node, parentName, scopeAttribute, state, uiElement);
    return;
  }

  if (isChildComponentTag(node.tagName)) {
    generateChildComponent(node, parentName, scopeAttribute, state, generateNode);
    return;
  }

  if (isVanrotUiTag(node.tagName)) {
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
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
  kind: 'router' | 'outlet',
): void {
  const outletName = state.ids.next(node.tagName.replace('-', '_'));

  if (kind === 'router') {
    state.usesRouterRoot = true;
    state.features.add('router-root');
  }

  if (kind === 'outlet') {
    state.usesRouterOutlet = true;
    state.features.add('router-outlet');
  }

  state.lines.push(`  const ${outletName} = document.createElement('div');`);
  state.lines.push(`  ${outletName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  state.lines.push(`  createRouterOutlet(${outletName}, { kind: ${quoteString(kind)} });`);
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
  const routeInput = generateRouteLinkInput(node, state);
  state.usesRouteLink = true;
  state.features.add('router-link');
  state.lines.push(`  const ${routeLinkName} = document.createElement('a');`);
  state.lines.push(`  ${routeLinkName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  state.lines.push(
    `  setupRouteLink(${routeLinkName}, ctx.${routeAttribute.name}${routeInput});`,
  );
  state.lines.push(`  ${parentName}.append(${routeLinkName});`);
}

function generateRouteLinkInput(node: ElementNode, state: GenerateState): string {
  const params = generateRouteLinkBindingGroup(node, state, 'param');
  const query = generateRouteLinkBindingGroup(node, state, 'query');
  const entries = [];

  if (params.length > 0) {
    entries.push(`params: { ${params.join(', ')} }`);
  }

  if (query.length > 0) {
    entries.push(`query: { ${query.join(', ')} }`);
  }

  if (entries.length === 0) {
    return '';
  }

  return `, { ${entries.join(', ')} }`;
}

function generateRouteLinkBindingGroup(
  node: ElementNode,
  state: GenerateState,
  prefix: 'param' | 'query',
): string[] {
  const entries = [];
  const attributePattern = new RegExp(`^${prefix}\\.([A-Za-z_$][\\w$]*)$`);

  for (const attribute of node.attributes) {
    const match = attributePattern.exec(attribute.name);

    if (match === null) {
      continue;
    }

    const key = match[1] ?? '';
    const rewritten = rewriteExpression(unwrapRouteBindingExpression(attribute.value), {
      filePath: state.templatePath,
      source: state.templateSource,
      span: attribute.valueSpan,
      localIdentifiers: state.localIdentifiers,
      localSignalIdentifiers: state.localSignalIdentifiers,
    });

    state.diagnostics.push(...rewritten.diagnostics);

    if (rewritten.expression === null) {
      continue;
    }

    entries.push(`${key}: ${rewritten.expression}`);
  }

  return entries;
}

function unwrapRouteBindingExpression(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) {
    return trimmedValue.slice(1, -1).trim();
  }

  return trimmedValue;
}

function generateCompilerUiElement(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
  uiElement: CompilerUiElement,
): void {
  const elementName = state.ids.next(uiElement.nativeTagName);

  state.features.add(uiElement.feature);
  state.lines.push(`  const ${elementName} = document.createElement(${quoteString(uiElement.nativeTagName)});`);
  state.lines.push(`  ${elementName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  const variant = generateUiElementClass(node, elementName, state, uiElement);
  generateUiAccessibilityDefaults(node, elementName, state, uiElement, variant);

  for (const attribute of node.attributes) {
    if (attribute.name === 'class' || attribute.name === 'variant') {
      continue;
    }

    generateAttribute(attribute, elementName, state);
  }

  for (const child of node.children) {
    generateNode(child, elementName, scopeAttribute, state);
  }

  state.lines.push(`  ${parentName}.append(${elementName});`);
}

function generateUiElementClass(
  node: ElementNode,
  elementName: string,
  state: GenerateState,
  uiElement: CompilerUiElement,
): string {
  const classAttribute = node.attributes.find((attribute) => attribute.name === 'class');
  const variantAttribute = node.attributes.find((attribute) => attribute.name === 'variant');
  const requestedVariant = variantAttribute?.value.trim() ?? uiElement.defaultVariant;
  const variant = resolveUiVariant(node, state, uiElement, requestedVariant, variantAttribute);
  const variantClass = variant === uiElement.defaultVariant ? '' : `${uiElement.baseClass}-${variant}`;
  const classValue = mergeClassValue(
    [uiElement.baseClass, variantClass].filter((className) => className.length > 0).join(' '),
    classAttribute?.value ?? '',
  );

  state.lines.push(
    `  ${elementName}.setAttribute(${quoteString('class')}, ${quoteString(classValue)});`,
  );

  return variant;
}

function resolveUiVariant(
  node: ElementNode,
  state: GenerateState,
  uiElement: CompilerUiElement,
  requestedVariant: string,
  variantAttribute: TemplateAttribute | undefined,
): string {
  if (uiElement.variants.includes(requestedVariant)) {
    return requestedVariant;
  }

  state.diagnostics.push(
    createDiagnostic(
      'VR019',
      'error',
      createInvalidUiVariantMessage(uiElement.tagName, requestedVariant, uiElement.variants),
      state.templatePath,
      undefined,
      undefined,
      {
        source: state.templateSource,
        span: variantAttribute?.span ?? node.span,
      },
    ),
  );

  return uiElement.defaultVariant;
}

function generateUiAccessibilityDefaults(
  node: ElementNode,
  elementName: string,
  state: GenerateState,
  uiElement: CompilerUiElement,
  variant: string,
): void {
  const hasAriaLabel = node.attributes.some((attribute) => attribute.name === 'aria-label');
  const hasAriaHidden = node.attributes.some((attribute) => attribute.name === 'aria-hidden');
  const hasAriaOrientation = node.attributes.some((attribute) => attribute.name === 'aria-orientation');
  const hasRole = node.attributes.some((attribute) => attribute.name === 'role');
  const isDecorativeLoader = uiElement.tagName === 'vr-loader' && !hasAriaLabel && !hasRole && !hasAriaHidden;
  const isDecorativeSkeleton =
    uiElement.tagName === 'vr-skeleton' && !hasAriaLabel && !hasRole && !hasAriaHidden;

  if (isDecorativeLoader || isDecorativeSkeleton) {
    state.lines.push(`  ${elementName}.setAttribute(${quoteString('aria-hidden')}, 'true');`);
  }

  if (uiElement.tagName !== 'vr-separator') {
    return;
  }

  if (!hasRole) {
    state.lines.push(`  ${elementName}.setAttribute(${quoteString('role')}, 'separator');`);
  }

  if (!hasAriaOrientation) {
    state.lines.push(
      `  ${elementName}.setAttribute(${quoteString('aria-orientation')}, ${quoteString(variant)});`,
    );
  }
}

function mergeClassValue(baseClass: string, userClassValue: string): string {
  const classNames = new Set(
    [baseClass, ...userClassValue.split(/\s+/)].filter((className) => className.length > 0),
  );

  return [...classNames].join(' ');
}

function diagnoseUnsupportedVanrotUiTag(tagName: string, state: GenerateState): void {
  state.diagnostics.push(
    createDiagnostic(
      'VR010',
      'error',
      createUnsupportedVanrotUiMessage(tagName),
      state.templatePath,
    ),
  );
}
