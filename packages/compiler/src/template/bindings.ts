import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { SourceSpan } from '../source/location.js';
import type { ElementNode, TemplateNode, TextNode } from './ast.js';

export type TemplateBinding =
  | InterpolationBinding
  | { kind: 'event'; eventName: string; handler: string; span: SourceSpan; expressionSpan: SourceSpan }
  | { kind: 'property'; propertyName: string; expression: string; span: SourceSpan; expressionSpan: SourceSpan };

export interface InterpolationBinding {
  kind: 'interpolation';
  expression: string;
  staticParts: string[];
  span: SourceSpan;
  expressionSpan: SourceSpan;
}

interface ParsedInterpolation {
  expression: string;
  staticParts: string[];
  interpolationStart: number;
  interpolationEnd: number;
  expressionStart: number;
  expressionEnd: number;
}

export interface TemplateBindingResult {
  bindings: TemplateBinding[];
  diagnostics: CompileDiagnostic[];
}

export function extractTemplateBindings(
  nodes: readonly TemplateNode[],
  templatePath: string,
): TemplateBindingResult {
  const bindings: TemplateBinding[] = [];
  const diagnostics: CompileDiagnostic[] = [];

  for (const node of nodes) {
    collectBindings(node, templatePath, bindings, diagnostics);
  }

  return {
    bindings,
    diagnostics,
  };
}

export function parseInterpolation(value: string): ParsedInterpolation | null {
  const match = /{{\s*([^}]+?)\s*}}/.exec(value);

  if (match === null) {
    return null;
  }

  const expression = match[1]?.trim();

  if (expression === undefined || expression.length === 0) {
    return null;
  }

  const expressionOffset = match[0].indexOf(match[1] ?? '');
  const leadingWhitespaceLength = (match[1] ?? '').length - (match[1] ?? '').trimStart().length;
  const expressionStart = match.index + expressionOffset + leadingWhitespaceLength;

  return {
    expression,
    staticParts: [value.slice(0, match.index), value.slice(match.index + match[0].length)],
    interpolationStart: match.index,
    interpolationEnd: match.index + match[0].length,
    expressionStart,
    expressionEnd: expressionStart + expression.length,
  };
}

function collectBindings(
  node: TemplateNode,
  templatePath: string,
  bindings: TemplateBinding[],
  diagnostics: CompileDiagnostic[],
): void {
  if (node.kind === 'text') {
    collectTextBindings(node, templatePath, bindings, diagnostics);
    return;
  }

  if (node.kind === 'element') {
    collectElementBindings(node, templatePath, bindings, diagnostics);
    return;
  }

  if (node.kind === 'slot-outlet') {
    for (const child of node.fallback) {
      collectBindings(child, templatePath, bindings, diagnostics);
    }
  }
}

function collectTextBindings(
  node: TextNode,
  templatePath: string,
  bindings: TemplateBinding[],
  diagnostics: CompileDiagnostic[],
): void {
  if (node.value.trim().startsWith('@if')) {
    diagnostics.push(
      createDiagnostic(
        'VR005',
        'error',
        'Unsupported template control syntax.',
        templatePath,
        node.span.line,
        node.span.column,
      ),
    );
    return;
  }

  const parsedInterpolation = parseInterpolation(node.value);

  if (parsedInterpolation === null) {
    return;
  }

  bindings.push({
    kind: 'interpolation',
    expression: parsedInterpolation.expression,
    staticParts: parsedInterpolation.staticParts,
    span: createRelativeTextSpan(node, parsedInterpolation.interpolationStart, parsedInterpolation.interpolationEnd),
    expressionSpan: createRelativeTextSpan(node, parsedInterpolation.expressionStart, parsedInterpolation.expressionEnd),
  });
}

function collectElementBindings(
  node: ElementNode,
  templatePath: string,
  bindings: TemplateBinding[],
  diagnostics: CompileDiagnostic[],
): void {
  for (const attribute of node.attributes) {
    const eventMatch = /^\(([^)]+)\)$/.exec(attribute.name);
    const propertyMatch = /^\[([^\]]+)\]$/.exec(attribute.name);

    if (attribute.name.startsWith('[(') || attribute.name.startsWith('*') || attribute.name.startsWith('@')) {
      diagnostics.push(
        createDiagnostic(
          'VR005',
          'error',
          'Unsupported template binding syntax.',
          templatePath,
          attribute.span.line,
          attribute.span.column,
        ),
      );
      continue;
    }

    if (eventMatch !== null) {
      bindings.push({
        kind: 'event',
        eventName: eventMatch[1] ?? '',
        handler: attribute.value.trim(),
        span: attribute.span,
        expressionSpan: attribute.valueSpan,
      });
      continue;
    }

    if (propertyMatch !== null) {
      bindings.push({
        kind: 'property',
        propertyName: propertyMatch[1] ?? '',
        expression: attribute.value.trim(),
        span: attribute.span,
        expressionSpan: attribute.valueSpan,
      });
    }
  }

  for (const child of node.children) {
    collectBindings(child, templatePath, bindings, diagnostics);
  }
}

function createRelativeTextSpan(node: TextNode, startOffset: number, endOffset: number): SourceSpan {
  const start = positionInText(node, startOffset);
  const end = positionInText(node, endOffset);

  return {
    filePath: node.span.filePath,
    line: start.line,
    column: start.column,
    endLine: end.line,
    endColumn: end.column,
    startOffset: node.span.startOffset + startOffset,
    endOffset: node.span.startOffset + endOffset,
  };
}

function positionInText(node: TextNode, offset: number): { line: number; column: number } {
  const boundedOffset = Math.max(0, Math.min(offset, node.value.length));
  const precedingText = node.value.slice(0, boundedOffset);
  const lines = precedingText.split('\n');

  if (lines.length === 1) {
    return {
      line: node.span.line,
      column: node.span.column + boundedOffset,
    };
  }

  return {
    line: node.span.line + lines.length - 1,
    column: (lines[lines.length - 1] ?? '').length + 1,
  };
}
