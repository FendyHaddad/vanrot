import { parseTemplate, type SourceSpan, type TemplateNode } from '@vanrot/compiler';

const routeAttributePrefix = 'route.';

export type TemplateSymbolKind = 'route-ref' | 'component-tag' | 'slot';

export interface TemplateSymbol {
  kind: TemplateSymbolKind;
  name: string;
  span: SourceSpan;
}

export function resolveSymbolAt(source: string, offset: number): TemplateSymbol | null {
  const parsed = parseTemplate(source, 'template.html');
  return walk(parsed.nodes, source, offset);
}

function walk(nodes: readonly TemplateNode[], source: string, offset: number): TemplateSymbol | null {
  for (const node of nodes) {
    const found = inspect(node, source, offset);

    if (found !== null) {
      return found;
    }
  }

  return null;
}

function inspect(node: TemplateNode, source: string, offset: number): TemplateSymbol | null {
  if (node.kind === 'slot-outlet') {
    return inspectSlotOutlet(node, source, offset);
  }

  if (node.kind === 'element') {
    return inspectElement(node, source, offset);
  }

  return walk(childrenOf(node), source, offset);
}

function inspectSlotOutlet(
  node: Extract<TemplateNode, { kind: 'slot-outlet' }>,
  source: string,
  offset: number,
): TemplateSymbol | null {
  if (withinTagName(source, slotTagName(node.name), node.span, offset)) {
    return { kind: 'slot', name: node.name, span: node.span };
  }

  return walk(node.fallback, source, offset);
}

function inspectElement(node: Extract<TemplateNode, { kind: 'element' }>, source: string, offset: number): TemplateSymbol | null {
  for (const attribute of node.attributes) {
    if (!attribute.name.startsWith(routeAttributePrefix) || !within(attribute.span, offset)) {
      continue;
    }

    return { kind: 'route-ref', name: attribute.name.slice(routeAttributePrefix.length), span: attribute.span };
  }

  if (isComponentTag(node.tagName) && withinTagName(source, node.tagName, node.span, offset)) {
    return { kind: 'component-tag', name: node.tagName, span: node.span };
  }

  return walk(node.children, source, offset);
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

function within(span: SourceSpan, offset: number): boolean {
  return offset >= span.startOffset && offset <= span.endOffset;
}

function isComponentTag(tagName: string): boolean {
  return tagName.includes('-');
}

function slotTagName(name: string): string {
  if (name === 'default') {
    return 'slot';
  }

  return `slot.${name}`;
}

function withinTagName(source: string, tagName: string, span: SourceSpan, offset: number): boolean {
  return withinOpeningTagName(source, tagName, span, offset) || withinClosingTagName(source, tagName, span, offset);
}

function withinOpeningTagName(source: string, tagName: string, span: SourceSpan, offset: number): boolean {
  const openingStart = source.indexOf(`<${tagName}`, span.startOffset);

  if (openingStart < 0 || openingStart > span.endOffset) {
    return false;
  }

  return withinOffsets(openingStart + 1, openingStart + 1 + tagName.length, offset);
}

function withinClosingTagName(source: string, tagName: string, span: SourceSpan, offset: number): boolean {
  const closingStart = source.indexOf(`</${tagName}`, span.startOffset);

  if (closingStart < 0 || closingStart > span.endOffset) {
    return false;
  }

  return withinOffsets(closingStart + 2, closingStart + 2 + tagName.length, offset);
}

function withinOffsets(start: number, end: number, offset: number): boolean {
  return offset >= start && offset <= end;
}
