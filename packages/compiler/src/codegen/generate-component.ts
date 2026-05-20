import type { CompileDiagnostic, CompileFeature } from '../api/types.js';
import {
  rewriteEventHandlerExpression,
  rewriteExpression,
} from '../expressions/rewrite-expression.js';
import type { ComponentMetadata } from '../metadata/component-metadata.js';
import type { ElementNode, TemplateAttribute, TemplateNode, TextNode } from '../template/ast.js';
import { parseInterpolation } from '../template/bindings.js';
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
  templatePath: string;
}

export function generateComponent(input: GenerateComponentInput): GenerateComponentResult {
  const state: GenerateState = {
    ids: new IdentifierAllocator(),
    lines: [],
    diagnostics: [],
    features: new Set<CompileFeature>(['readable-output']),
    usesEffect: false,
    usesListen: false,
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
    js: [...generateImports(input.metadata, state), '', ...state.lines].join('\n'),
    diagnostics: state.diagnostics,
    features: [...state.features],
  };
}

function generateImports(metadata: ComponentMetadata, state: GenerateState): string[] {
  const imports = [`import { ${metadata.exportName} } from ${quoteString(metadata.importPath)};`];

  if (state.usesEffect) {
    imports.push("import { effect } from '@vanrot/runtime';");
  }

  if (state.usesListen) {
    imports.push("import { listen } from '@vanrot/runtime/internal';");
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
