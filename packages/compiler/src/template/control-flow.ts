import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { createSourceSpan } from '../source/location.js';
import type { ForBlockNode, IfBlockNode, TemplateNode } from './ast.js';
import { parseHtmlFragment, type ParseTemplateResult } from './parse-template.js';

const ifKeyword = '@if';
const elseKeyword = '@else';
const forKeyword = '@for';
const emptyKeyword = '@empty';
const forHeaderPattern = /^([A-Za-z_$][\w$]*)\s+of\s+([\s\S]+?)\s*;\s*track\s+([\s\S]+)$/;
const htmlVoidElementNames = new Set([
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

interface ParsedIfBlock {
  node: IfBlockNode;
  diagnostics: CompileDiagnostic[];
  endOffset: number;
}

interface ParsedForBlock {
  node: ForBlockNode | null;
  diagnostics: CompileDiagnostic[];
  endOffset: number;
}

interface ParsedBlock {
  contentStart: number;
  contentEnd: number;
  endOffset: number;
}

interface ControlFlowParseContext {
  sourceForParsing: string;
  sourceForSpans: string;
  templatePath: string;
  offsetBase: number;
}

export function parseControlFlowTemplate(
  templateSource: string,
  templatePath: string,
): ParseTemplateResult {
  return parseControlFlowTemplateSegment(templateSource, templatePath, 0, templateSource);
}

export function parseControlFlowTemplateSegment(
  templateSource: string,
  templatePath: string,
  offsetBase: number,
  originalTemplateSource = templateSource,
): ParseTemplateResult {
  const context: ControlFlowParseContext = {
    sourceForParsing: templateSource,
    sourceForSpans: originalTemplateSource,
    templatePath,
    offsetBase,
  };
  const nodes: TemplateNode[] = [];
  const diagnostics: CompileDiagnostic[] = [];
  let cursor = 0;

  while (cursor < context.sourceForParsing.length) {
    const controlFlowOffset = findNextTopLevelControlFlow(context.sourceForParsing, cursor);

    if (controlFlowOffset === -1) {
      appendHtmlFragment(
        context.sourceForParsing.slice(cursor),
        cursor,
        context,
        nodes,
        diagnostics,
      );
      break;
    }

    appendHtmlFragment(
      context.sourceForParsing.slice(cursor, controlFlowOffset),
      cursor,
      context,
      nodes,
      diagnostics,
    );

    const parsed = parseControlFlowBlock(context, controlFlowOffset);

    if (parsed === null) {
      appendHtmlFragment(
        context.sourceForParsing.slice(controlFlowOffset),
        controlFlowOffset,
        context,
        nodes,
        diagnostics,
      );
      break;
    }

    if (parsed.node !== null) {
      nodes.push(parsed.node);
    }

    diagnostics.push(...parsed.diagnostics);
    cursor = parsed.endOffset;
  }

  return {
    nodes,
    diagnostics,
  };
}

function appendHtmlFragment(
  fragmentSource: string,
  fragmentOffset: number,
  context: ControlFlowParseContext,
  nodes: TemplateNode[],
  diagnostics: CompileDiagnostic[],
): void {
  if (fragmentSource.length === 0) {
    return;
  }

  const parsed = parseHtmlFragment(
    fragmentSource,
    context.templatePath,
    context.offsetBase + fragmentOffset,
    context.sourceForSpans,
  );

  nodes.push(...parsed.nodes);
  diagnostics.push(...parsed.diagnostics);
}

function parseControlFlowBlock(
  context: ControlFlowParseContext,
  startOffset: number,
): ParsedIfBlock | ParsedForBlock | null {
  const templateSource = context.sourceForParsing;

  if (templateSource.startsWith(ifKeyword, startOffset)) {
    return parseIfBlock(context, startOffset);
  }

  if (templateSource.startsWith(forKeyword, startOffset)) {
    return parseForBlock(context, startOffset);
  }

  return null;
}

function parseIfBlock(
  context: ControlFlowParseContext,
  startOffset: number,
): ParsedIfBlock | null {
  const templateSource = context.sourceForParsing;
  let cursor = startOffset + ifKeyword.length;

  cursor = skipWhitespace(templateSource, cursor);

  if (templateSource[cursor] !== '(') {
    return null;
  }

  const expressionStart = cursor + 1;
  const expressionEnd = findMatchingDelimiter(templateSource, cursor, '(', ')');

  if (expressionEnd === -1) {
    return null;
  }

  cursor = skipWhitespace(templateSource, expressionEnd + 1);

  if (templateSource[cursor] !== '{') {
    return null;
  }

  const consequent = parseBlock(templateSource, cursor);

  if (consequent === null) {
    return null;
  }

  cursor = skipWhitespace(templateSource, consequent.endOffset);

  const alternate = parseOptionalElseBlock(templateSource, cursor);
  const nodeEndOffset = alternate?.endOffset ?? consequent.endOffset;
  const consequentResult = parseTrimmedHtmlFragment(context, consequent);
  const alternateResult =
    alternate === null
      ? { nodes: [], diagnostics: [] }
      : parseTrimmedHtmlFragment(context, alternate);
  const trimmedExpression = trimSourceRange(templateSource, expressionStart, expressionEnd);

  return {
    node: {
      kind: 'if-block',
      expression: templateSource.slice(trimmedExpression.startOffset, trimmedExpression.endOffset),
      expressionSpan: createControlFlowSpan(context, trimmedExpression.startOffset, trimmedExpression.endOffset),
      consequent: consequentResult.nodes,
      alternate: alternateResult.nodes,
      span: createControlFlowSpan(context, startOffset, nodeEndOffset),
    },
    diagnostics: [...consequentResult.diagnostics, ...alternateResult.diagnostics],
    endOffset: nodeEndOffset,
  };
}

function parseForBlock(
  context: ControlFlowParseContext,
  startOffset: number,
): ParsedForBlock | null {
  const templateSource = context.sourceForParsing;
  let cursor = startOffset + forKeyword.length;

  cursor = skipWhitespace(templateSource, cursor);

  if (templateSource[cursor] !== '(') {
    return createInvalidForBlock(context, startOffset, startOffset + forKeyword.length);
  }

  const expressionStart = cursor + 1;
  const expressionEnd = findMatchingDelimiter(templateSource, cursor, '(', ')');

  if (expressionEnd === -1) {
    return createInvalidForBlock(context, startOffset, templateSource.length);
  }

  cursor = skipWhitespace(templateSource, expressionEnd + 1);

  if (templateSource[cursor] !== '{') {
    return createInvalidForBlock(context, startOffset, expressionEnd + 1);
  }

  const body = parseBlock(templateSource, cursor);

  if (body === null) {
    return createInvalidForBlock(context, startOffset, templateSource.length);
  }

  const trimmedHeader = trimSourceRange(templateSource, expressionStart, expressionEnd);
  const headerSource = templateSource.slice(trimmedHeader.startOffset, trimmedHeader.endOffset);
  const headerMatch = forHeaderPattern.exec(headerSource);
  cursor = skipWhitespace(templateSource, body.endOffset);

  const empty = parseOptionalEmptyBlock(templateSource, cursor);
  const nodeEndOffset = empty?.endOffset ?? body.endOffset;

  if (headerMatch === null) {
    return createInvalidForBlock(context, startOffset, nodeEndOffset);
  }

  const itemName = headerMatch[1] ?? '';
  const iterableExpression = (headerMatch[2] ?? '').trim();
  const trackExpression = (headerMatch[3] ?? '').trim();

  if (iterableExpression.length === 0 || trackExpression.length === 0) {
    return createInvalidForBlock(context, startOffset, nodeEndOffset);
  }

  const bodyResult = parseTrimmedHtmlFragment(context, body);
  const emptyResult =
    empty === null ? { nodes: [], diagnostics: [] } : parseTrimmedHtmlFragment(context, empty);

  return {
    node: {
      kind: 'for-block',
      itemName,
      iterableExpression,
      trackExpression,
      expressionSpan: createControlFlowSpan(context, trimmedHeader.startOffset, trimmedHeader.endOffset),
      body: bodyResult.nodes,
      empty: emptyResult.nodes,
      span: createControlFlowSpan(context, startOffset, nodeEndOffset),
    },
    diagnostics: [...bodyResult.diagnostics, ...emptyResult.diagnostics],
    endOffset: nodeEndOffset,
  };
}

function parseOptionalElseBlock(templateSource: string, startOffset: number): ParsedBlock | null {
  if (!templateSource.startsWith(elseKeyword, startOffset)) {
    return null;
  }

  const cursor = skipWhitespace(templateSource, startOffset + elseKeyword.length);

  if (templateSource[cursor] !== '{') {
    return null;
  }

  return parseBlock(templateSource, cursor);
}

function parseOptionalEmptyBlock(templateSource: string, startOffset: number): ParsedBlock | null {
  if (!templateSource.startsWith(emptyKeyword, startOffset)) {
    return null;
  }

  const cursor = skipWhitespace(templateSource, startOffset + emptyKeyword.length);

  if (templateSource[cursor] !== '{') {
    return null;
  }

  return parseBlock(templateSource, cursor);
}

function parseTrimmedHtmlFragment(
  context: ControlFlowParseContext,
  block: ParsedBlock,
): ParseTemplateResult {
  const templateSource = context.sourceForParsing;
  const trimmedBlock = trimSourceRange(templateSource, block.contentStart, block.contentEnd);

  return parseControlFlowTemplateSegment(
    templateSource.slice(trimmedBlock.startOffset, trimmedBlock.endOffset),
    context.templatePath,
    context.offsetBase + trimmedBlock.startOffset,
    context.sourceForSpans,
  );
}

function parseBlock(templateSource: string, openBraceOffset: number): ParsedBlock | null {
  const closeBraceOffset = findMatchingDelimiter(templateSource, openBraceOffset, '{', '}');

  if (closeBraceOffset === -1) {
    return null;
  }

  return {
    contentStart: openBraceOffset + 1,
    contentEnd: closeBraceOffset,
    endOffset: closeBraceOffset + 1,
  };
}

function createInvalidForBlock(
  context: ControlFlowParseContext,
  startOffset: number,
  endOffset: number,
): ParsedForBlock {
  const span = createControlFlowSpan(context, startOffset, Math.max(startOffset, endOffset));

  return {
    node: null,
    diagnostics: [
      createDiagnostic('VR011', 'error', undefined, context.templatePath, span.line, span.column, {
        source: context.sourceForSpans,
        span,
      }),
    ],
    endOffset: Math.max(startOffset + forKeyword.length, endOffset),
  };
}

function createControlFlowSpan(
  context: ControlFlowParseContext,
  startOffset: number,
  endOffset: number,
) {
  return createSourceSpan(
    context.sourceForSpans,
    context.templatePath,
    context.offsetBase + startOffset,
    context.offsetBase + endOffset,
  );
}

function findNextTopLevelControlFlow(templateSource: string, startOffset: number): number {
  let cursor = startOffset;
  let elementDepth = 0;

  while (cursor < templateSource.length) {
    if (elementDepth === 0 && isTopLevelControlFlowAt(templateSource, cursor)) {
      return cursor;
    }

    if (templateSource[cursor] !== '<') {
      cursor += 1;
      continue;
    }

    const tag = readHtmlTag(templateSource, cursor);

    if (tag === null) {
      cursor += 1;
      continue;
    }

    if (tag.isClosing) {
      elementDepth = Math.max(0, elementDepth - 1);
    } else if (!tag.isSelfClosing) {
      elementDepth += 1;
    }

    cursor = tag.endOffset;
  }

  return -1;
}

function isTopLevelControlFlowAt(templateSource: string, offset: number): boolean {
  return (
    isControlFlowKeywordAt(templateSource, offset, ifKeyword) ||
    isControlFlowKeywordAt(templateSource, offset, forKeyword)
  );
}

function isControlFlowKeywordAt(templateSource: string, offset: number, keyword: string): boolean {
  if (!templateSource.startsWith(keyword, offset)) {
    return false;
  }

  const previousCharacter = templateSource[offset - 1] ?? '';
  const nextCharacter = templateSource[offset + keyword.length] ?? '';

  if (/[A-Za-z0-9_$]/.test(previousCharacter)) {
    return false;
  }

  return nextCharacter === '(' || /\s/.test(nextCharacter);
}

function readHtmlTag(
  templateSource: string,
  startOffset: number,
): { endOffset: number; isClosing: boolean; isSelfClosing: boolean } | null {
  if (templateSource.startsWith('<!--', startOffset)) {
    const commentEndOffset = templateSource.indexOf('-->', startOffset + 4);

    return {
      endOffset: commentEndOffset === -1 ? templateSource.length : commentEndOffset + 3,
      isClosing: false,
      isSelfClosing: true,
    };
  }

  const tagMatch = /^<\/?\s*([A-Za-z][\w.-]*)/.exec(templateSource.slice(startOffset));

  if (tagMatch === null) {
    return null;
  }

  const tagName = tagMatch[1]?.toLowerCase() ?? '';
  const endOffset = findTagEndOffset(templateSource, startOffset + 1);

  if (endOffset === -1) {
    return null;
  }

  return {
    endOffset: endOffset + 1,
    isClosing: templateSource[startOffset + 1] === '/',
    isSelfClosing: templateSource[endOffset - 1] === '/' || htmlVoidElementNames.has(tagName),
  };
}

function findTagEndOffset(templateSource: string, startOffset: number): number {
  let quote: '"' | "'" | null = null;

  for (let cursor = startOffset; cursor < templateSource.length; cursor += 1) {
    const character = templateSource[cursor] ?? '';

    if (quote !== null) {
      if (character === quote) {
        quote = null;
      }

      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === '>') {
      return cursor;
    }
  }

  return -1;
}

function findMatchingDelimiter(
  templateSource: string,
  openOffset: number,
  openDelimiter: '(' | '{',
  closeDelimiter: ')' | '}',
): number {
  let depth = 0;
  let quote: '"' | "'" | '`' | null = null;

  for (let cursor = openOffset; cursor < templateSource.length; cursor += 1) {
    const character = templateSource[cursor] ?? '';
    const previousCharacter = templateSource[cursor - 1] ?? '';

    if (quote !== null) {
      if (character === quote && previousCharacter !== '\\') {
        quote = null;
      }

      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }

    if (character === openDelimiter) {
      depth += 1;
      continue;
    }

    if (character !== closeDelimiter) {
      continue;
    }

    depth -= 1;

    if (depth === 0) {
      return cursor;
    }
  }

  return -1;
}

function skipWhitespace(templateSource: string, startOffset: number): number {
  let cursor = startOffset;

  while (cursor < templateSource.length && /\s/.test(templateSource[cursor] ?? '')) {
    cursor += 1;
  }

  return cursor;
}

function trimSourceRange(
  templateSource: string,
  startOffset: number,
  endOffset: number,
): { startOffset: number; endOffset: number } {
  let trimmedStartOffset = startOffset;
  let trimmedEndOffset = endOffset;

  while (trimmedStartOffset < trimmedEndOffset && /\s/.test(templateSource[trimmedStartOffset] ?? '')) {
    trimmedStartOffset += 1;
  }

  while (trimmedEndOffset > trimmedStartOffset && /\s/.test(templateSource[trimmedEndOffset - 1] ?? '')) {
    trimmedEndOffset -= 1;
  }

  return {
    startOffset: trimmedStartOffset,
    endOffset: trimmedEndOffset,
  };
}
