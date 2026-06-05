export interface ParsedPipeCall {
  name: string;
  namespace: string;
  variant: string;
  args: string[];
}

export interface ParsedPipeExpression {
  baseExpression: string;
  pipes: ParsedPipeCall[];
}

export function parsePipeExpression(expression: string): ParsedPipeExpression | null {
  const segments = splitTopLevel(expression, '|').map((segment) => segment.trim());

  if (segments.length <= 1) {
    return null;
  }

  const baseExpression = segments[0] ?? '';
  const pipes = segments.slice(1).map(parsePipeCall);

  if (baseExpression.length === 0 || pipes.some((pipe) => pipe === null)) {
    return null;
  }

  return {
    baseExpression,
    pipes: pipes.filter((pipe): pipe is ParsedPipeCall => pipe !== null),
  };
}

export function splitTopLevel(value: string, separator: string): string[] {
  const segments: string[] = [];
  let current = '';
  let depth = 0;
  let quote: '"' | "'" | '`' | null = null;
  let escaped = false;

  for (const char of value) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      current += char;
      escaped = true;
      continue;
    }

    if (quote !== null) {
      current += char;

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      current += char;
      quote = char;
      continue;
    }

    if (char === '(' || char === '[' || char === '{') {
      depth += 1;
      current += char;
      continue;
    }

    if (char === ')' || char === ']' || char === '}') {
      depth = Math.max(0, depth - 1);
      current += char;
      continue;
    }

    if (char === separator && depth === 0) {
      segments.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  segments.push(current);
  return segments;
}

function parsePipeCall(segment: string): ParsedPipeCall | null {
  const callMatch = /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)(?:\((.*)\))?$/.exec(segment);

  if (callMatch === null) {
    return null;
  }

  const name = callMatch[1] ?? '';
  const [namespace = '', variant = ''] = name.includes('.') ? name.split('.') : ['', ''];
  const argsSource = callMatch[2];

  return {
    name,
    namespace,
    variant,
    args: argsSource === undefined || argsSource.trim().length === 0 ? [] : splitTopLevel(argsSource, ',').map((arg) => arg.trim()),
  };
}
