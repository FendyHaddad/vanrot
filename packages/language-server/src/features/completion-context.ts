export type CompletionContextKind = 'tag-name' | 'attribute-name' | 'route-ref' | 'none';

export interface CompletionContext {
  kind: CompletionContextKind;
}

export function classifyCompletionContext(source: string, offset: number): CompletionContext {
  const before = source.slice(0, offset);
  const lastOpen = before.lastIndexOf('<');
  const lastClose = before.lastIndexOf('>');

  if (lastOpen <= lastClose) {
    return { kind: 'none' };
  }

  const tagText = before.slice(lastOpen);

  if (/^<[A-Za-z0-9._-]*$/.test(tagText)) {
    return { kind: 'tag-name' };
  }

  if (/route\.[A-Za-z0-9_]*$/.test(tagText)) {
    return { kind: 'route-ref' };
  }

  if (/[\s][A-Za-z0-9._-]*$/.test(tagText)) {
    return { kind: 'attribute-name' };
  }

  return { kind: 'none' };
}
