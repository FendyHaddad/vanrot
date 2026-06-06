export interface DocsSectionLink {
  id: string;
  title: string;
}

export interface DocsCodeLine {
  number: number;
  tokens: readonly DocsCodeToken[];
}

export interface DocsCodeToken {
  id: string;
  kind: DocsCodeTokenKind;
  text: string;
}

export type DocsCodeTokenKind =
  | 'comment'
  | 'function'
  | 'keyword'
  | 'number'
  | 'operator'
  | 'property'
  | 'punctuation'
  | 'string'
  | 'text';
