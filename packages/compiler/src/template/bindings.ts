import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { ElementNode, TemplateNode, TextNode } from './ast.js';

export type TemplateBinding =
  | InterpolationBinding
  | { kind: 'event'; eventName: string; handler: string }
  | { kind: 'property'; propertyName: string; expression: string };

export interface InterpolationBinding {
  kind: 'interpolation';
  expression: string;
  staticParts: string[];
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

export function parseInterpolation(value: string): InterpolationBinding | null {
  const match = /{{\s*([^}]+?)\s*}}/.exec(value);

  if (match === null) {
    return null;
  }

  const expression = match[1]?.trim();

  if (expression === undefined || expression.length === 0) {
    return null;
  }

  return {
    kind: 'interpolation',
    expression,
    staticParts: [value.slice(0, match.index), value.slice(match.index + match[0].length)],
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

  collectElementBindings(node, templatePath, bindings, diagnostics);
}

function collectTextBindings(
  node: TextNode,
  templatePath: string,
  bindings: TemplateBinding[],
  diagnostics: CompileDiagnostic[],
): void {
  if (node.value.trim().startsWith('@if')) {
    diagnostics.push(createDiagnostic('VR005', 'error', 'Unsupported template control syntax.', templatePath));
    return;
  }

  const interpolation = parseInterpolation(node.value);

  if (interpolation === null) {
    return;
  }

  bindings.push(interpolation);
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
      diagnostics.push(createDiagnostic('VR005', 'error', 'Unsupported template binding syntax.', templatePath));
      continue;
    }

    if (eventMatch !== null) {
      bindings.push({
        kind: 'event',
        eventName: eventMatch[1] ?? '',
        handler: attribute.value.trim(),
      });
      continue;
    }

    if (propertyMatch !== null) {
      bindings.push({
        kind: 'property',
        propertyName: propertyMatch[1] ?? '',
        expression: attribute.value.trim(),
      });
    }
  }

  for (const child of node.children) {
    collectBindings(child, templatePath, bindings, diagnostics);
  }
}
