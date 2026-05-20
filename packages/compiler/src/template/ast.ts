export type TemplateNode = ElementNode | TextNode;

export interface ElementNode {
  kind: 'element';
  tagName: string;
  attributes: TemplateAttribute[];
  children: TemplateNode[];
}

export interface TextNode {
  kind: 'text';
  value: string;
}

export interface TemplateAttribute {
  name: string;
  value: string;
}
