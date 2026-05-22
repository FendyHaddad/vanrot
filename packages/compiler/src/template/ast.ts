import type { SourceSpan } from '../source/location.js';

export type TemplateNode = ElementNode | TextNode | IfBlockNode | ForBlockNode | SlotOutletNode;

export interface ElementNode {
  kind: 'element';
  tagName: string;
  attributes: TemplateAttribute[];
  children: TemplateNode[];
  span: SourceSpan;
}

export interface TextNode {
  kind: 'text';
  value: string;
  span: SourceSpan;
}

export interface TemplateAttribute {
  name: string;
  value: string;
  span: SourceSpan;
  valueSpan: SourceSpan;
}

export interface IfBlockNode {
  kind: 'if-block';
  expression: string;
  expressionSpan: SourceSpan;
  consequent: TemplateNode[];
  alternate: TemplateNode[];
  span: SourceSpan;
}

export interface ForBlockNode {
  kind: 'for-block';
  itemName: string;
  iterableExpression: string;
  trackExpression: string;
  expressionSpan: SourceSpan;
  body: TemplateNode[];
  empty: TemplateNode[];
  span: SourceSpan;
}

export interface SlotOutletNode {
  kind: 'slot-outlet';
  name: string;
  fallback: TemplateNode[];
  span: SourceSpan;
}
