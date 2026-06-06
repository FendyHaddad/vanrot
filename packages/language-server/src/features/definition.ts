import { join } from 'node:path';
import { parseTemplate, type SourceSpan, type TemplateNode } from '@vanrot/compiler';
import type { Location } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { spanToRange } from '../lsp/position.js';
import type { WorkspaceIndex } from '../project/workspace.js';
import type { TemplateSymbol } from './symbol-at.js';
import { findUiPrimitiveDefinition } from './ui-primitives.js';

export function findDefinition(symbol: TemplateSymbol, index: WorkspaceIndex): Location | null {
  if (symbol.kind === 'route-ref') {
    const route = index.routes.find((entry) => entry.name === symbol.name);

    if (route === undefined) {
      return null;
    }

    return { uri: URI.file(route.span.filePath).toString(), range: spanToRange(route.span) };
  }

  if (symbol.kind === 'component-tag') {
    const component = index.components.find((entry) => entry.tagName === symbol.name);

    if (component !== undefined) {
      return fileStartLocation(component.path);
    }

    const webTypeTag = index.webTypes?.tags.find((entry) => entry.name === symbol.name);

    if (webTypeTag !== undefined && index.projectRoot !== null) {
      return fileStartLocation(join(index.projectRoot, webTypeTag.sourcePath));
    }

    return findUiPrimitiveDefinition(symbol.name, index.projectRoot);
  }

  return null;
}

function fileStartLocation(path: string): Location {
  return {
    uri: URI.file(path).toString(),
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
  };
}

export function findSlotDefinition(name: string, source: string, uri: string): Location | null {
  const parsed = parseTemplate(source, 'template.html');
  const span = findSlotSpan(parsed.nodes, name);

  if (span === null) {
    return null;
  }

  return { uri, range: spanToRange(span) };
}

function findSlotSpan(nodes: readonly TemplateNode[], name: string): SourceSpan | null {
  for (const node of nodes) {
    if (node.kind === 'slot-outlet' && node.name === name) {
      return node.span;
    }

    const nested = findSlotSpan(childrenOf(node), name);

    if (nested !== null) {
      return nested;
    }
  }

  return null;
}

function childrenOf(node: TemplateNode): readonly TemplateNode[] {
  if (node.kind === 'element') {
    return node.children;
  }

  if (node.kind === 'slot-outlet') {
    return node.fallback;
  }

  if (node.kind === 'if-block') {
    return [...node.consequent, ...node.alternate];
  }

  if (node.kind === 'for-block') {
    return [...node.body, ...node.empty];
  }

  return [];
}
