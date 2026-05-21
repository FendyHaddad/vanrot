import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';
import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { TemplateAttribute, TemplateNode } from './ast.js';

export interface ParseTemplateResult {
  nodes: TemplateNode[];
  diagnostics: CompileDiagnostic[];
}

export function parseTemplate(templateSource: string, templatePath: string): ParseTemplateResult {
  const fragment = parseFragment(normalizeVanrotSelfClosingTags(templateSource), {
    sourceCodeLocationInfo: true,
  });
  const diagnostics: CompileDiagnostic[] = [];
  const nodes: TemplateNode[] = [];

  for (const child of fragment.childNodes) {
    const node = convertNode(child, templatePath, diagnostics);

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

function normalizeVanrotSelfClosingTags(templateSource: string): string {
  return templateSource.replace(
    /<vr(\s+route\.[A-Za-z_$][\w$]*)\s*\/>/g,
    '<vr$1></vr>',
  );
}

function convertNode(
  node: DefaultTreeAdapterTypes.ChildNode,
  templatePath: string,
  diagnostics: CompileDiagnostic[],
): TemplateNode | null {
  if (isTextNode(node)) {
    return {
      kind: 'text',
      value: node.value,
    };
  }

  if (isCommentNode(node)) {
    return null;
  }

  if (!isElementNode(node) || isTemplateElement(node)) {
    const location = node.sourceCodeLocation;
    diagnostics.push(
      createDiagnostic(
        'VR005',
        'error',
        'Unsupported template syntax.',
        templatePath,
        location?.startLine ?? 1,
        location?.startCol ?? 1,
      ),
    );
    return null;
  }

  return {
    kind: 'element',
    tagName: node.tagName,
    attributes: node.attrs.map(toTemplateAttribute),
    children: node.childNodes
      .map((child) => convertNode(child, templatePath, diagnostics))
      .filter((child): child is TemplateNode => child !== null),
  };
}

function toTemplateAttribute(attribute: DefaultTreeAdapterTypes.Element['attrs'][number]): TemplateAttribute {
  return {
    name: attribute.name,
    value: attribute.value,
  };
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
