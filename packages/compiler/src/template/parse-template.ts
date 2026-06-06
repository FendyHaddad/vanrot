import { parseFragment, type DefaultTreeAdapterTypes, type Token } from 'parse5';
import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { createSourceSpan, type SourceSpan } from '../source/location.js';
import type { TemplateAttribute, TemplateNode } from './ast.js';
import { parseControlFlowTemplate, parseControlFlowTemplateSegment } from './control-flow.js';

export interface ParseTemplateResult {
  nodes: TemplateNode[];
  diagnostics: CompileDiagnostic[];
}

export function parseTemplate(templateSource: string, templatePath: string): ParseTemplateResult {
  return parseControlFlowTemplate(templateSource, templatePath);
}

export function parseHtmlFragment(
  templateSource: string,
  templatePath: string,
  offsetBase: number,
  originalTemplateSource = templateSource,
): ParseTemplateResult {
  const normalized = normalizeVanrotSelfClosingTags(templateSource);
  const context: ParseContext = {
    sourceForParsing: normalized.source,
    sourceForSpans: originalTemplateSource,
    templatePath,
    offsetBase,
    mapParsedOffsetToOriginal: normalized.mapOffset,
  };
  const fragment = parseFragment(context.sourceForParsing, {
    sourceCodeLocationInfo: true,
  });
  const diagnostics: CompileDiagnostic[] = [];
  const nodes: TemplateNode[] = [];

  for (const child of fragment.childNodes) {
    const node = convertNode(child, context, diagnostics);

    if (node === null) {
      continue;
    }

    nodes.push(node);
  }

  return {
    nodes,
    diagnostics,
  };
}

interface NormalizedTemplate {
  source: string;
  mapOffset: (offset: number) => number;
}

interface OffsetReplacement {
  originalStart: number;
  originalEnd: number;
  normalizedStart: number;
  normalizedEnd: number;
  insertedStart: number;
}

interface ParseContext {
  sourceForParsing: string;
  sourceForSpans: string;
  templatePath: string;
  offsetBase: number;
  mapParsedOffsetToOriginal: (offset: number) => number;
}

function normalizeVanrotSelfClosingTags(templateSource: string): NormalizedTemplate {
  const replacements: OffsetReplacement[] = [];
  let normalizedSource = '';
  let originalCursor = 0;

  for (const match of templateSource.matchAll(/<([A-Za-z][A-Za-z0-9_.:-]*-[A-Za-z0-9_.:-]*|vr)(\s(?:[^"'<>]|"[^"]*"|'[^']*')*)?\s*\/>/g)) {
    const originalStart = match.index ?? 0;
    const originalText = match[0] ?? '';
    const tagName = match[1] ?? '';
    const attributes = match[2] ?? '';
    const replacementText = `<${tagName}${attributes}></${tagName}>`;
    const normalizedStart = normalizedSource.length + originalStart - originalCursor;

    normalizedSource += templateSource.slice(originalCursor, originalStart);
    normalizedSource += replacementText;
    replacements.push({
      originalStart,
      originalEnd: originalStart + originalText.length,
      normalizedStart,
      normalizedEnd: normalizedStart + replacementText.length,
      insertedStart: normalizedStart + replacementText.indexOf(`></${tagName}>`) + 1,
    });
    originalCursor = originalStart + originalText.length;
  }

  normalizedSource += templateSource.slice(originalCursor);

  return {
    source: normalizedSource,
    mapOffset: (offset) => mapNormalizedOffsetToOriginal(offset, replacements),
  };
}

function mapNormalizedOffsetToOriginal(offset: number, replacements: readonly OffsetReplacement[]): number {
  let accumulatedDelta = 0;

  for (const replacement of replacements) {
    if (offset < replacement.normalizedStart) {
      return offset - accumulatedDelta;
    }

    if (offset <= replacement.normalizedEnd) {
      if (offset < replacement.insertedStart) {
        return offset - accumulatedDelta;
      }

      return replacement.originalEnd;
    }

    accumulatedDelta +=
      (replacement.normalizedEnd - replacement.normalizedStart) -
      (replacement.originalEnd - replacement.originalStart);
  }

  return offset - accumulatedDelta;
}

function convertNode(
  node: DefaultTreeAdapterTypes.ChildNode,
  context: ParseContext,
  diagnostics: CompileDiagnostic[],
): TemplateNode | null {
  if (isTextNode(node)) {
    const span = createNodeSpan(context, node.sourceCodeLocation);

    return {
      kind: 'text',
      value: node.value,
      span,
    };
  }

  if (isCommentNode(node)) {
    return null;
  }

  if (!isElementNode(node) || isTemplateElement(node)) {
    const location = node.sourceCodeLocation;
    const span = createNodeSpan(context, location);
    diagnostics.push(
      createDiagnostic(
        'VR005',
        'error',
        'Unsupported template syntax.',
        context.templatePath,
        span.line,
        span.column,
        { source: context.sourceForSpans, span },
      ),
    );
    return null;
  }

  const span = createNodeSpan(context, node.sourceCodeLocation);
  const children = convertElementChildren(node, context, diagnostics);
  const slotName = readSlotOutletName(node.tagName);

  if (slotName !== null) {
    return {
      kind: 'slot-outlet',
      name: slotName,
      fallback: children,
      span,
    };
  }

  return {
    kind: 'element',
    tagName: node.tagName,
    attributes: node.attrs.map((attribute) =>
      toTemplateAttribute(attribute, node.sourceCodeLocation?.attrs?.[attribute.name], context),
    ),
    children,
    span,
  };
}

function convertElementChildren(
  node: DefaultTreeAdapterTypes.Element,
  context: ParseContext,
  diagnostics: CompileDiagnostic[],
): TemplateNode[] {
  const location = node.sourceCodeLocation;
  const childStartOffset = location?.startTag?.endOffset;
  const childEndOffset = location?.endTag?.startOffset;

  if (childStartOffset === undefined || childEndOffset === undefined) {
    return node.childNodes
      .map((child) => convertNode(child, context, diagnostics))
      .filter((child): child is TemplateNode => child !== null);
  }

  const originalStartOffset = context.mapParsedOffsetToOriginal(childStartOffset) + context.offsetBase;
  const originalEndOffset = context.mapParsedOffsetToOriginal(childEndOffset) + context.offsetBase;
  const parsed = parseControlFlowTemplateSegment(
    context.sourceForSpans.slice(originalStartOffset, originalEndOffset),
    context.templatePath,
    originalStartOffset,
    context.sourceForSpans,
  );

  diagnostics.push(...parsed.diagnostics);
  return parsed.nodes;
}

function readSlotOutletName(tagName: string): string | null {
  if (tagName === 'slot') {
    return 'default';
  }

  const match = /^slot\.([a-z][a-z0-9_-]*)$/.exec(tagName);

  if (match === null) {
    return null;
  }

  return match[1] ?? null;
}

function toTemplateAttribute(
  attribute: DefaultTreeAdapterTypes.Element['attrs'][number],
  location: Token.Location | null | undefined,
  context: ParseContext,
): TemplateAttribute {
  const span = createNodeSpan(context, location);

  return {
    name: readRawAttributeName(location, context) ?? attribute.name,
    value: attribute.value,
    span,
    valueSpan: createAttributeValueSpan(attribute, location, context),
  };
}

function readRawAttributeName(
  location: Token.Location | null | undefined,
  context: ParseContext,
): string | null {
  if (location === null || location === undefined) {
    return null;
  }

  const attributeSource = context.sourceForParsing.slice(location.startOffset, location.endOffset);
  const match = /^([^\s=]+)/.exec(attributeSource);

  return match?.[1] ?? null;
}

function createNodeSpan(
  context: ParseContext,
  location: Token.Location | null | undefined,
): SourceSpan {
  const startOffset = location?.startOffset ?? 0;
  const endOffset = location?.endOffset ?? startOffset;

  return createSpanFromParsedOffsets(context, startOffset, endOffset);
}

function createSpanFromParsedOffsets(
  context: ParseContext,
  startOffset: number,
  endOffset: number,
): SourceSpan {
  return createSourceSpan(
    context.sourceForSpans,
    context.templatePath,
    context.mapParsedOffsetToOriginal(startOffset) + context.offsetBase,
    context.mapParsedOffsetToOriginal(endOffset) + context.offsetBase,
  );
}

function createAttributeValueSpan(
  attribute: DefaultTreeAdapterTypes.Element['attrs'][number],
  location: Token.Location | null | undefined,
  context: ParseContext,
): SourceSpan {
  const attributeStartOffset = location?.startOffset ?? 0;
  const attributeEndOffset = location?.endOffset ?? attributeStartOffset;
  const attributeSource = context.sourceForParsing.slice(attributeStartOffset, attributeEndOffset);
  const equalsIndex = attributeSource.indexOf('=');

  if (equalsIndex === -1) {
    return createSpanFromParsedOffsets(context, attributeEndOffset, attributeEndOffset);
  }

  const rawValueStart = findRawAttributeValueStart(attributeSource, equalsIndex + 1);
  const quote = attributeSource[rawValueStart];

  if (quote === '"' || quote === "'") {
    const valueStartOffset = attributeStartOffset + rawValueStart + 1;
    const closingQuoteIndex = attributeSource.indexOf(quote, rawValueStart + 1);
    const valueEndOffset =
      closingQuoteIndex === -1 ? attributeEndOffset : attributeStartOffset + closingQuoteIndex;

    return createSpanFromParsedOffsets(context, valueStartOffset, valueEndOffset);
  }

  const valueStartOffset = attributeStartOffset + rawValueStart;
  const rawValueEnd = findRawUnquotedAttributeValueEnd(attributeSource, rawValueStart);

  return createSpanFromParsedOffsets(context, valueStartOffset, attributeStartOffset + rawValueEnd);
}

function findRawAttributeValueStart(attributeSource: string, searchStart: number): number {
  for (let index = searchStart; index < attributeSource.length; index += 1) {
    if (!/\s/.test(attributeSource[index] ?? '')) {
      return index;
    }
  }

  return attributeSource.length;
}

function findRawUnquotedAttributeValueEnd(attributeSource: string, searchStart: number): number {
  for (let index = searchStart; index < attributeSource.length; index += 1) {
    if (/\s/.test(attributeSource[index] ?? '')) {
      return index;
    }
  }

  return attributeSource.length;
}

function isTextNode(node: DefaultTreeAdapterTypes.ChildNode): node is DefaultTreeAdapterTypes.TextNode {
  return node.nodeName === '#text';
}

function isCommentNode(node: DefaultTreeAdapterTypes.ChildNode): node is DefaultTreeAdapterTypes.CommentNode {
  return node.nodeName === '#comment';
}

function isElementNode(node: DefaultTreeAdapterTypes.ChildNode): node is DefaultTreeAdapterTypes.Element {
  return 'tagName' in node && 'attrs' in node && 'childNodes' in node;
}

function isTemplateElement(node: DefaultTreeAdapterTypes.ChildNode): node is DefaultTreeAdapterTypes.Template {
  return isElementNode(node) && node.tagName === 'template';
}
