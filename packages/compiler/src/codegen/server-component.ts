import type { CompileDiagnostic, CompileFeature, CompileOptions, SourceMapping } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import {
  rewriteExpression,
  type ExpressionSourceContext,
} from '../expressions/rewrite-expression.js';
import type { ComponentMetadata } from '../metadata/component-metadata.js';
import { createSourceSpan } from '../source/location.js';
import type {
  ElementNode,
  SlotOutletNode,
  TemplateAttribute,
  TemplateNode,
  TextNode,
} from '../template/ast.js';
import { parseInterpolation } from '../template/bindings.js';
import { parsePipeExpression } from '../template/pipes.js';
import { quoteString } from './bindings.js';
import {
  isChildComponentTag,
  resolveComponentImportPath,
  toComponentFactoryName,
  toComponentName,
} from './components.js';
import { createGeneratedMapping } from './mappings.js';
import {
  buildPipeChainExpression,
  createPipeContextExpression,
  createPipeImportLines,
  createPipeRegistryOptionsExpression,
  templateContainsPipes,
} from './pipe-chain.js';
import { createGenerateState, type GenerateState } from './state.js';
import {
  createUnsupportedVanrotUiMessage,
  findCompilerUiAnatomyElement,
  findCompilerUiElement,
  isVanrotUiTag,
  type CompilerUiAnatomyElement,
  type CompilerUiElement,
} from './ui-elements.js';

export interface GenerateServerComponentInput {
  metadata: ComponentMetadata;
  nodes: readonly TemplateNode[];
  scopeAttribute: string;
  templatePath: string;
  templateSource: string;
}

export interface GenerateServerComponentResult {
  js: string;
  diagnostics: CompileDiagnostic[];
  features: CompileFeature[];
  componentDependencies: [];
  mappings: SourceMapping[];
}

interface RewrittenInput {
  name: string;
  expression: string;
}

const voidHtmlElementTagNames = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export function generateServerComponent(
  input: GenerateServerComponentInput,
  options: CompileOptions = {},
): GenerateServerComponentResult {
  const state = createGenerateState({
    ...input,
    ...(options.childComponentImportMap === undefined
      ? {}
      : { childComponentImportMap: options.childComponentImportMap }),
  });

  state.features.add('server-rendering');
  state.usesPipes = templateContainsPipes(input.nodes);
  state.lines.push('export function renderToHtml(initialInputs = {}, projectedSlots = {}) {');
  state.lines.push(`  const ctx = new ${input.metadata.componentName}();`);
  state.lines.push('  for (const [inputName, inputValue] of Object.entries(initialInputs)) {');
  state.lines.push('    const inputSignal = ctx[inputName];');
  state.lines.push("    if (inputSignal === undefined || typeof inputSignal.set !== 'function') {");
  state.lines.push('      continue;');
  state.lines.push('    }');
  state.lines.push('    inputSignal.set(inputValue);');
  state.lines.push('  }');
  if (state.usesPipes) {
    state.lines.push(`  const __vanrotPipeContext = createPipeContext(${createPipeContextExpression(options.pipeContext)});`);
    state.lines.push(`  const __vanrotPipeRegistryOptions = ${createPipeRegistryOptionsExpression(options.pipeRegistry)};`);
  }
  state.lines.push("  let html = '';");

  for (const node of input.nodes) {
    generateServerNode(node, state, input.scopeAttribute);
  }

  state.lines.push('  return { html, ctx };');
  state.lines.push('}');

  return {
    js: [...generateServerImports(input.metadata, state, options), '', ...state.lines].join('\n'),
    diagnostics: state.diagnostics,
    features: [...state.features],
    componentDependencies: [],
    mappings: state.mappings,
  };
}

function generateServerImports(
  metadata: ComponentMetadata,
  state: GenerateState,
  options: CompileOptions,
): string[] {
  const componentImportSpecifier = options.componentImportSpecifier ?? metadata.importPath;
  const imports = [`import { ${metadata.exportName} } from ${quoteString(componentImportSpecifier)};`];

  imports.push("import { escapeAttribute, escapeHtml } from '@vanrot/ssr';");

  if (state.usesPipes) {
    imports.push("import { applyVanrotPipeChain, createPipeContext } from '@vanrot/formatters';");
    imports.push(...createPipeImportLines(options.pipeRegistry));
  }

  for (const dependency of state.componentDependencies) {
    imports.push(
      `import * as ${toComponentFactoryName(dependency.componentName)} from ${quoteString(
        dependency.importPath,
      )};`,
    );
  }

  return imports;
}

function generateServerNode(
  node: TemplateNode,
  state: GenerateState,
  scopeAttribute: string,
): void {
  if (node.kind === 'text' && node.value.trim().length === 0) {
    return;
  }

  state.mappings.push(createGeneratedMapping('js', state.lines.length + 1, 1, node.span));

  if (node.kind === 'text') {
    generateServerText(node, state);
    return;
  }

  if (node.kind === 'if-block') {
    generateServerIfBlock(node, state, scopeAttribute);
    return;
  }

  if (node.kind === 'for-block') {
    generateServerForBlock(node, state, scopeAttribute);
    return;
  }

  if (node.kind === 'slot-outlet') {
    generateServerSlotOutlet(node, state, scopeAttribute);
    return;
  }

  generateServerElement(node, state, scopeAttribute);
}

function generateServerText(node: TextNode, state: GenerateState): void {
  const interpolation = parseInterpolation(node.value);

  if (interpolation === null) {
    state.lines.push(`  html += ${quoteString(escapeServerText(node.value))};`);
    return;
  }

  const pipeExpression = parsePipeExpression(interpolation.expression);
  const expressionToRewrite = pipeExpression?.baseExpression ?? interpolation.expression;
  const rewritten = rewriteExpression(
    expressionToRewrite,
    createTextExpressionContext(node, interpolation.expressionStart, interpolation.expressionEnd, state),
  );

  state.diagnostics.push(...rewritten.diagnostics);

  if (rewritten.expression === null) {
    return;
  }

  state.features.add('text-interpolation');
  state.features.add('expression-rewriting');
  const expression = pipeExpression === null
    ? rewritten.expression
    : buildPipeChainExpression(rewritten.expression, pipeExpression, state, (arg) => {
        const rewrittenArg = rewriteExpression(
          arg,
          createTextExpressionContext(node, interpolation.expressionStart, interpolation.expressionEnd, state),
        );
        state.diagnostics.push(...rewrittenArg.diagnostics);
        return rewrittenArg.expression;
      });

  if (expression === null) {
    return;
  }

  state.lines.push(
    `  html += ${quoteString(escapeServerText(interpolation.staticParts[0] ?? ''))} + escapeHtml(${
      expression
    }) + ${quoteString(escapeServerText(interpolation.staticParts[1] ?? ''))};`,
  );
}

function generateServerElement(
  node: ElementNode,
  state: GenerateState,
  scopeAttribute: string,
): void {
  if (node.tagName === 'vr-router' || node.tagName === 'vr-outlet') {
    generateNativeElement({ ...node, tagName: 'div' }, state, scopeAttribute, [
      ['data-vr-router-outlet', ''],
    ]);
    return;
  }

  if (node.tagName === 'vr') {
    generateNativeElement({ ...node, tagName: 'a' }, state, scopeAttribute, [
      ['data-vr-route-link', ''],
    ]);
    return;
  }

  const uiElement = findCompilerUiElement(node.tagName);
  if (uiElement !== null) {
    generateUiElement(node, state, scopeAttribute, uiElement);
    return;
  }

  const anatomyElement = findCompilerUiAnatomyElement(node.tagName);
  if (anatomyElement !== null) {
    generateUiElement(node, state, scopeAttribute, anatomyElement);
    return;
  }

  if (isChildComponentTag(node.tagName)) {
    generateServerChildComponent(node, state, scopeAttribute);
    return;
  }

  if (isVanrotUiTag(node.tagName)) {
    state.diagnostics.push(
      createDiagnostic(
        'VR018',
        'error',
        createUnsupportedVanrotUiMessage(node.tagName),
        state.templatePath,
        node.span.line,
        node.span.column,
        { source: state.templateSource, span: node.span },
      ),
    );
    return;
  }

  generateNativeElement(node, state, scopeAttribute);
}

function generateUiElement(
  node: ElementNode,
  state: GenerateState,
  scopeAttribute: string,
  uiElement: CompilerUiElement | CompilerUiAnatomyElement,
): void {
  const classAttribute = node.attributes.find((attribute) => attribute.name === 'class');
  const classValue = [uiElement.baseClass, classAttribute?.value ?? '']
    .filter((value) => value.length > 0)
    .join(' ');
  const attributes: Array<[string, string]> = [];

  if (classValue.length > 0) {
    attributes.push(['class', classValue]);
  }

  generateNativeElement({ ...node, tagName: uiElement.nativeTagName }, state, scopeAttribute, attributes);
}

function generateNativeElement(
  node: ElementNode,
  state: GenerateState,
  scopeAttribute: string,
  forcedAttributes: ReadonlyArray<readonly [string, string]> = [],
): void {
  state.lines.push(`  html += '<${node.tagName}';`);
  state.lines.push(`  html += ' ${scopeAttribute}';`);

  for (const [name, value] of forcedAttributes) {
    state.lines.push(`  html += ${quoteString(` ${name}`)};`);

    if (value.length > 0) {
      state.lines.push(`  html += '="' + escapeAttribute(${quoteString(value)}) + '"';`);
    }
  }

  for (const attribute of node.attributes) {
    if (forcedAttributes.some(([name]) => name === attribute.name)) {
      continue;
    }

    generateServerAttribute(attribute, state);
  }

  state.lines.push("  html += '>';");

  if (voidHtmlElementTagNames.has(node.tagName.toLowerCase())) {
    return;
  }

  for (const child of node.children) {
    generateServerNode(child, state, scopeAttribute);
  }

  state.lines.push(`  html += '</${node.tagName}>';`);
}

function generateServerAttribute(attribute: TemplateAttribute, state: GenerateState): void {
  const propertyMatch = /^\[([^\]]+)\]$/.exec(attribute.name);

  if (propertyMatch !== null) {
    const propertyName = propertyMatch[1] ?? '';
    const rewritten = rewriteExpression(attribute.value, createAttributeExpressionContext(attribute, state));

    state.diagnostics.push(...rewritten.diagnostics);

    if (rewritten.expression === null) {
      return;
    }

    state.features.add('property-binding');
    state.features.add('expression-rewriting');
    state.lines.push(
      `  html += ${quoteString(` ${propertyName}="`)} + escapeAttribute(${
        rewritten.expression
      }) + '"';`,
    );
    return;
  }

  if (attribute.name.startsWith('(') || attribute.name.startsWith('[')) {
    return;
  }

  state.lines.push(
    `  html += ${quoteString(` ${attribute.name}="`)} + escapeAttribute(${quoteString(
      attribute.value,
    )}) + '"';`,
  );
}

function generateServerIfBlock(
  node: Extract<TemplateNode, { kind: 'if-block' }>,
  state: GenerateState,
  scopeAttribute: string,
): void {
  const rewritten = rewriteExpression(node.expression, createExpressionContext(node.expressionSpan, state));

  state.diagnostics.push(...rewritten.diagnostics);

  if (rewritten.expression === null) {
    return;
  }

  state.features.add('control-flow-if');
  state.features.add('expression-rewriting');
  state.lines.push(`  if (${rewritten.expression}) {`);

  for (const child of node.consequent) {
    generateServerNode(child, state, scopeAttribute);
  }

  state.lines.push('  } else {');

  for (const child of node.alternate) {
    generateServerNode(child, state, scopeAttribute);
  }

  state.lines.push('  }');
}

function generateServerForBlock(
  node: Extract<TemplateNode, { kind: 'for-block' }>,
  state: GenerateState,
  scopeAttribute: string,
): void {
  const rewritten = rewriteExpression(
    node.iterableExpression,
    createExpressionContext(node.expressionSpan, state),
  );

  state.diagnostics.push(...rewritten.diagnostics);

  if (rewritten.expression === null) {
    return;
  }

  state.features.add('control-flow-for');
  state.features.add('expression-rewriting');
  state.lines.push(`  const ${node.itemName}Items = Array.from(${rewritten.expression} ?? []);`);
  state.lines.push(`  if (${node.itemName}Items.length === 0) {`);

  for (const child of node.empty) {
    generateServerNode(child, state, scopeAttribute);
  }

  state.lines.push('  } else {');
  state.lines.push(`    for (const ${node.itemName} of ${node.itemName}Items) {`);
  state.localIdentifiers.push(node.itemName);

  for (const child of node.body) {
    generateServerNode(child, state, scopeAttribute);
  }

  state.localIdentifiers.pop();
  state.lines.push('    }');
  state.lines.push('  }');
}

function generateServerSlotOutlet(
  node: SlotOutletNode,
  state: GenerateState,
  scopeAttribute: string,
): void {
  const fallbackName = state.ids.next('slotFallback');

  state.features.add('slot');
  state.lines.push(`  const ${fallbackName} = () => {`);
  state.lines.push("    let html = '';");

  for (const child of node.fallback) {
    generateServerNode(child, state, scopeAttribute);
  }

  state.lines.push('    return html;');
  state.lines.push('  };');
  state.lines.push(`  html += projectedSlots[${quoteString(node.name)}] ?? ${fallbackName}();`);
}

function generateServerChildComponent(
  node: ElementNode,
  state: GenerateState,
  scopeAttribute: string,
): void {
  const componentName = toComponentName(node.tagName);
  const factoryName = toComponentFactoryName(componentName);
  const inputs = collectServerInputs(node, state);

  state.features.add('child-component');
  recordServerDependency(
    state,
    node.tagName,
    componentName,
    resolveComponentImportPath(node.tagName, state),
    inputs,
  );
  state.lines.push(`  html += ${factoryName}.renderToHtml({`);

  for (const input of inputs) {
    state.lines.push(`    ${quoteString(input.name)}: ${input.expression},`);
  }

  state.lines.push('  }).html;');
  void scopeAttribute;
}

function collectServerInputs(node: ElementNode, state: GenerateState): RewrittenInput[] {
  const inputs: RewrittenInput[] = [];

  for (const attribute of node.attributes) {
    const match = /^\[([^\]]+)\]$/.exec(attribute.name);

    if (match === null) {
      continue;
    }

    const rewritten = rewriteExpression(attribute.value, createAttributeExpressionContext(attribute, state));

    state.diagnostics.push(...rewritten.diagnostics);

    if (rewritten.expression === null || match[1] === undefined) {
      continue;
    }

    inputs.push({ name: match[1], expression: rewritten.expression });
  }

  return inputs;
}

function recordServerDependency(
  state: GenerateState,
  tagName: string,
  componentName: string,
  importPath: string,
  inputs: readonly RewrittenInput[],
): void {
  const existing = state.componentDependencies.find((dependency) => dependency.tagName === tagName);

  if (existing !== undefined) {
    return;
  }

  state.componentDependencies.push({
    tagName,
    componentName,
    importPath,
    inputs: inputs.map((input) => ({ name: input.name, expression: input.expression })),
  });
}

function createTextExpressionContext(
  node: TextNode,
  expressionStart: number,
  expressionEnd: number,
  state: GenerateState,
): ExpressionSourceContext {
  return {
    filePath: state.templatePath,
    source: state.templateSource,
    span: createSourceSpan(
      state.templateSource,
      state.templatePath,
      node.span.startOffset + expressionStart,
      node.span.startOffset + expressionEnd,
    ),
    localIdentifiers: state.localIdentifiers,
    localSignalIdentifiers: state.localSignalIdentifiers,
  };
}

function createAttributeExpressionContext(
  attribute: TemplateAttribute,
  state: GenerateState,
): ExpressionSourceContext {
  return {
    filePath: state.templatePath,
    source: state.templateSource,
    span: attribute.span,
    localIdentifiers: state.localIdentifiers,
    localSignalIdentifiers: state.localSignalIdentifiers,
  };
}

function createExpressionContext(
  span: ExpressionSourceContext['span'],
  state: GenerateState,
): ExpressionSourceContext {
  return {
    filePath: state.templatePath,
    source: state.templateSource,
    span,
    localIdentifiers: state.localIdentifiers,
    localSignalIdentifiers: state.localSignalIdentifiers,
  };
}

function escapeServerText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
