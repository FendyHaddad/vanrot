import {
  rewriteEventHandlerExpression,
  rewriteExpression,
  type ExpressionSourceContext,
} from '../expressions/rewrite-expression.js';
import { createSourceSpan } from '../source/location.js';
import type { TemplateAttribute, TextNode } from '../template/ast.js';
import { parseInterpolation } from '../template/bindings.js';
import { parsePipeExpression } from '../template/pipes.js';
import { buildPipeChainExpression } from './pipe-chain.js';
import type { GenerateState } from './state.js';

export function generateText(node: TextNode, parentName: string, state: GenerateState): void {
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

  const pipeExpression = parsePipeExpression(interpolation.expression);
  const expressionToRewrite = pipeExpression?.baseExpression ?? interpolation.expression;
  const rewritten = rewriteExpression(
    expressionToRewrite,
    createInterpolationSourceContext(node, interpolation.expressionStart, interpolation.expressionEnd, state),
  );

  state.diagnostics.push(...rewritten.diagnostics);

  if (rewritten.expression === null) {
    return;
  }

  state.usesEffect = true;
  state.features.add('text-interpolation');
  state.features.add('expression-rewriting');
  const expression = pipeExpression === null
    ? rewritten.expression
    : buildPipeChainExpression(rewritten.expression, pipeExpression, state, (arg) => {
        const rewrittenArg = rewriteExpression(
          arg,
          createInterpolationSourceContext(node, interpolation.expressionStart, interpolation.expressionEnd, state),
        );
        state.diagnostics.push(...rewrittenArg.diagnostics);
        return rewrittenArg.expression;
      });

  if (expression === null) {
    return;
  }

  state.lines.push(`  const ${textName} = document.createTextNode('');`);
  state.lines.push(`  ${parentName}.append(${textName});`);
  state.lines.push('  effect(() => {');
  state.lines.push(
    `    ${textName}.data = \`${escapeTemplatePart(interpolation.staticParts[0] ?? '')}\${${
      expression
    }}${escapeTemplatePart(interpolation.staticParts[1] ?? '')}\`;`,
  );
  state.lines.push('  });');
}

export function generateAttribute(
  attribute: TemplateAttribute,
  elementName: string,
  state: GenerateState,
): void {
  const propertyMatch = /^\[([^\]]+)\]$/.exec(attribute.name);
  const eventMatch = /^\(([^)]+)\)$/.exec(attribute.name);

  if (propertyMatch !== null) {
    generatePropertyBinding(propertyMatch[1] ?? '', attribute.value, attribute, elementName, state);
    return;
  }

  if (eventMatch !== null) {
    generateEventBinding(eventMatch[1] ?? '', attribute.value, attribute, elementName, state);
    return;
  }

  if (attribute.name.startsWith('[') || attribute.name.startsWith('(')) {
    return;
  }

  state.lines.push(
    `  ${elementName}.setAttribute(${quoteString(attribute.name)}, ${quoteString(attribute.value)});`,
  );
}

export function generatePropertyBinding(
  propertyName: string,
  expression: string,
  attribute: TemplateAttribute,
  elementName: string,
  state: GenerateState,
): void {
  const rewritten = rewriteExpression(expression, createAttributeSourceContext(attribute, state));

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

export function generateEventBinding(
  eventName: string,
  expression: string,
  attribute: TemplateAttribute,
  elementName: string,
  state: GenerateState,
): void {
  const rewritten = rewriteEventHandlerExpression(
    expression,
    createAttributeSourceContext(attribute, state),
  );

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

export function quoteString(value: string): string {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'").replaceAll('\n', '\\n')}'`;
}

function escapeTemplatePart(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');
}

function createAttributeSourceContext(
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

function createInterpolationSourceContext(
  node: TextNode,
  expressionStart: number,
  expressionEnd: number,
  state: GenerateState,
): ExpressionSourceContext {
  return {
    filePath: state.templatePath,
    source: state.templateSource,
    localIdentifiers: state.localIdentifiers,
    localSignalIdentifiers: state.localSignalIdentifiers,
    span: createSourceSpan(
      state.templateSource,
      state.templatePath,
      node.span.startOffset + expressionStart,
      node.span.startOffset + expressionEnd,
    ),
  };
}
