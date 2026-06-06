import type { DocsCodeLine, DocsCodeToken, DocsCodeTokenKind } from './docs-content.ts';

const codeKeywords = new Set([
  'as',
  'const',
  'else',
  'export',
  'false',
  'from',
  'function',
  'if',
  'import',
  'interface',
  'let',
  'new',
  'readonly',
  'return',
  'true',
  'type',
]);

const punctuationCharacters = new Set(['(', ')', '{', '}', '[', ']', ',', ';']);
const operatorCharacters = new Set(['=', '+', '-', '*', '/', '%', '<', '>', '!', '&', '|', '?', ':', '.']);
const pairedOperators = new Set(['=>', '===', '!==', '>=', '<=', '&&', '||', '??', '+=', '-=', '*=', '/=']);

export function tokenizeDocsCode(code: string): readonly DocsCodeLine[] {
  return code.split('\n').map((line, index) => ({
    number: index + 1,
    tokens: tokenizeLine(line, index + 1),
  }));
}

function tokenizeLine(line: string, lineNumber: number): readonly DocsCodeToken[] {
  const tokens: DocsCodeToken[] = [];
  let cursor = 0;

  while (cursor < line.length) {
    const rest = line.slice(cursor);
    const match = matchNextToken(rest);

    tokens.push({
      id: `${lineNumber}-${cursor}-${tokens.length}`,
      kind: match.kind,
      text: match.text,
    });
    cursor += match.text.length;
  }

  if (tokens.length === 0) {
    return [{ id: `${lineNumber}-empty`, kind: 'text', text: '' }];
  }

  return tokens;
}

function matchNextToken(input: string): { kind: DocsCodeTokenKind; text: string } {
  if (input.startsWith('//')) {
    return { kind: 'comment', text: input };
  }

  if (input[0] === '"' || input[0] === "'") {
    return matchString(input);
  }

  const pairedOperator = [...pairedOperators].find((operator) => input.startsWith(operator));

  if (pairedOperator !== undefined) {
    return { kind: 'operator', text: pairedOperator };
  }

  const first = input[0] ?? '';

  if (punctuationCharacters.has(first)) {
    return { kind: 'punctuation', text: first };
  }

  if (operatorCharacters.has(first)) {
    return { kind: 'operator', text: first };
  }

  const word = input.match(/^[A-Za-z_$][A-Za-z0-9_$]*/)?.[0];

  if (word !== undefined) {
    if (codeKeywords.has(word)) {
      return { kind: 'keyword', text: word };
    }

    if (input.slice(word.length).startsWith('(')) {
      return { kind: 'function', text: word };
    }

    return { kind: 'property', text: word };
  }

  const number = input.match(/^\d+(?:\.\d+)?/)?.[0];

  if (number !== undefined) {
    return { kind: 'number', text: number };
  }

  const whitespace = input.match(/^\s+/)?.[0];

  if (whitespace !== undefined) {
    return { kind: 'text', text: whitespace };
  }

  return { kind: 'text', text: first };
}

function matchString(input: string): { kind: DocsCodeTokenKind; text: string } {
  const quote = input[0] ?? '';
  let cursor = 1;

  while (cursor < input.length) {
    if (input[cursor] === quote && input[cursor - 1] !== '\\') {
      return { kind: 'string', text: input.slice(0, cursor + 1) };
    }

    cursor += 1;
  }

  return { kind: 'string', text: input };
}
