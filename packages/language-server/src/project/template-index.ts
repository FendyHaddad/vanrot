import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultSourceRoot } from '@vanrot/config';
import { parseTemplate, type SourceSpan, type TemplateNode } from '@vanrot/compiler';

const appsDirectoryName = 'apps';
const routeAttributePrefix = 'route.';
const templateFilePattern = /\.(component|page|layout|dialog|widget|form|button)\.html$/;

export interface TemplateReference {
  name: string;
  span: SourceSpan;
}

export interface TemplateFileEntry {
  path: string;
  tags: TemplateReference[];
  routeRefs: TemplateReference[];
  bracketBindings: TemplateReference[];
  dottedAttributes: TemplateReference[];
}

export interface TemplateIndex {
  templates: TemplateFileEntry[];
}

export function buildTemplateIndex(projectRoot: string | null): TemplateIndex {
  if (projectRoot === null) {
    return emptyTemplateIndex();
  }

  return {
    templates: collectSourceRoots(projectRoot)
      .flatMap((sourceRoot) => readTemplatePaths(sourceRoot))
      .sort()
      .map((path) => parseTemplateFile(path, readFileSync(path, 'utf8'))),
  };
}

export function emptyTemplateIndex(): TemplateIndex {
  return { templates: [] };
}

function collectSourceRoots(projectRoot: string): string[] {
  const sourceRoots = new Set([join(projectRoot, defaultSourceRoot)]);
  const appsRoot = join(projectRoot, appsDirectoryName);

  if (!existsSync(appsRoot)) {
    return [...sourceRoots];
  }

  for (const entry of readdirSync(appsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    sourceRoots.add(join(appsRoot, entry.name, defaultSourceRoot));
  }

  return [...sourceRoots];
}

function readTemplatePaths(sourceRoot: string): string[] {
  if (!existsSync(sourceRoot)) {
    return [];
  }

  const files: string[] = [];
  const pending = [sourceRoot];

  while (pending.length > 0) {
    const directory = pending.pop();

    if (directory === undefined) {
      continue;
    }

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        pending.push(path);
        continue;
      }

      if (entry.isFile() && templateFilePattern.test(entry.name)) {
        files.push(path);
      }
    }
  }

  return files;
}

function parseTemplateFile(path: string, source: string): TemplateFileEntry {
  const parsed = parseTemplate(source, path);
  const entry: TemplateFileEntry = {
    path,
    tags: [],
    routeRefs: [],
    bracketBindings: [],
    dottedAttributes: [],
  };

  collectFromNodes(parsed.nodes, entry);
  return entry;
}

function collectFromNodes(nodes: readonly TemplateNode[], entry: TemplateFileEntry): void {
  for (const node of nodes) {
    collectFromNode(node, entry);
  }
}

function collectFromNode(node: TemplateNode, entry: TemplateFileEntry): void {
  if (node.kind === 'element') {
    entry.tags.push({ name: node.tagName, span: node.span });
    collectAttributes(node, entry);
    collectFromNodes(node.children, entry);
    return;
  }

  if (node.kind === 'slot-outlet') {
    collectFromNodes(node.fallback, entry);
    return;
  }

  if (node.kind === 'if-block') {
    collectFromNodes([...node.consequent, ...node.alternate], entry);
    return;
  }

  if (node.kind === 'for-block') {
    collectFromNodes([...node.body, ...node.empty], entry);
  }
}

function collectAttributes(node: Extract<TemplateNode, { kind: 'element' }>, entry: TemplateFileEntry): void {
  for (const attribute of node.attributes) {
    if (attribute.name.startsWith(routeAttributePrefix)) {
      entry.routeRefs.push({ name: attribute.name.slice(routeAttributePrefix.length), span: attribute.span });
      continue;
    }

    if (/^\[[^\]]+\]$/.test(attribute.name)) {
      entry.bracketBindings.push({ name: attribute.name.slice(1, -1), span: attribute.span });
      continue;
    }

    if (attribute.name.includes('.')) {
      entry.dottedAttributes.push({ name: attribute.name, span: attribute.span });
    }
  }
}
