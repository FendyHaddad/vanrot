import { parseTemplate, type SourceSpan, type TemplateNode } from '@vanrot/compiler';
import type { Location } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { spanToRange } from '../lsp/position.js';
import { emptyTemplateIndex, type TemplateFileEntry, type TemplateIndex } from '../project/template-index.js';
import type { TemplateSymbol } from './symbol-at.js';

const routeAttributePrefix = 'route.';

export interface TextDocumentLike {
  uri: string;
  text: string;
}

export function findReferences(
  symbol: TemplateSymbol,
  documents: readonly TextDocumentLike[],
  templates: TemplateIndex = emptyTemplateIndex(),
): Location[] {
  const locations: Location[] = [];

  for (const document of documents) {
    const parsed = parseTemplate(document.text, 'template.html');

    for (const span of collect(parsed.nodes, symbol)) {
      locations.push({ uri: document.uri, range: spanToRange(span) });
    }
  }

  for (const template of templates.templates) {
    for (const span of collectFromIndexedTemplate(template, symbol)) {
      locations.push({ uri: URI.file(template.path).toString(), range: spanToRange(span) });
    }
  }

  return uniqueLocations(locations);
}

function collect(nodes: readonly TemplateNode[], symbol: TemplateSymbol): SourceSpan[] {
  const spans: SourceSpan[] = [];

  for (const node of nodes) {
    spans.push(...collectFromNode(node, symbol));
  }

  return spans;
}

function collectFromNode(node: TemplateNode, symbol: TemplateSymbol): SourceSpan[] {
  if (node.kind === 'element') {
    return collectFromElement(node, symbol);
  }

  if (node.kind === 'slot-outlet') {
    return collectFromSlotOutlet(node, symbol);
  }

  return collect(childrenOf(node), symbol);
}

function collectFromElement(node: Extract<TemplateNode, { kind: 'element' }>, symbol: TemplateSymbol): SourceSpan[] {
  const spans: SourceSpan[] = [];

  if (symbol.kind === 'route-ref') {
    for (const attribute of node.attributes) {
      if (attribute.name === `${routeAttributePrefix}${symbol.name}`) {
        spans.push(attribute.span);
      }
    }
  }

  if (symbol.kind === 'component-tag' && node.tagName === symbol.name) {
    spans.push(node.span);
  }

  spans.push(...collect(node.children, symbol));
  return spans;
}

function collectFromSlotOutlet(node: Extract<TemplateNode, { kind: 'slot-outlet' }>, symbol: TemplateSymbol): SourceSpan[] {
  const spans: SourceSpan[] = [];

  if (symbol.kind === 'slot' && node.name === symbol.name) {
    spans.push(node.span);
  }

  spans.push(...collect(node.fallback, symbol));
  return spans;
}

function childrenOf(node: TemplateNode): readonly TemplateNode[] {
  if (node.kind === 'if-block') {
    return [...node.consequent, ...node.alternate];
  }

  if (node.kind === 'for-block') {
    return [...node.body, ...node.empty];
  }

  return [];
}

function collectFromIndexedTemplate(template: TemplateFileEntry, symbol: TemplateSymbol): SourceSpan[] {
  if (symbol.kind === 'route-ref') {
    return template.routeRefs.filter((ref) => ref.name === symbol.name).map((ref) => ref.span);
  }

  if (symbol.kind === 'component-tag') {
    return template.tags.filter((tag) => tag.name === symbol.name).map((tag) => tag.span);
  }

  return [];
}

function uniqueLocations(locations: readonly Location[]): Location[] {
  const seen = new Set<string>();
  const unique: Location[] = [];

  for (const location of locations) {
    const key = `${location.uri}:${location.range.start.line}:${location.range.start.character}:${location.range.end.line}:${location.range.end.character}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(location);
  }

  return unique;
}
