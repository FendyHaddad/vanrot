import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Location } from 'vscode-languageserver';
import { URI } from 'vscode-uri';

const uiTagPrefix = 'vr-';
const uiPackageSourceRoot = 'node_modules/@vanrot/ui/src/primitives';
const uiWorkspaceSourceRoot = 'packages/ui/src/primitives';
const uiPackageWebTypesPath = 'node_modules/@vanrot/ui/web-types.json';
const uiWorkspaceWebTypesPath = 'packages/ui/web-types.json';

interface WebTypesElement {
  name: string;
  description?: string;
  attributes?: Array<{ name: string; description?: string }>;
}

interface WebTypesDocument {
  contributions?: {
    html?: {
      elements?: WebTypesElement[];
    };
  };
}

export function findUiPrimitiveDefinition(tagName: string, projectRoot: string | null): Location | null {
  if (projectRoot === null || !isUiTag(tagName)) {
    return null;
  }

  for (const primitive of uiPrimitiveCandidates(tagName.slice(uiTagPrefix.length))) {
    const path = findUiPrimitiveSource(projectRoot, primitive);

    if (path !== null) {
      return fileStartLocation(path);
    }
  }

  return null;
}

export function describeUiPrimitive(tagName: string, projectRoot: string | null): string | null {
  if (projectRoot === null || !isUiTag(tagName)) {
    return null;
  }

  const element = findWebTypesElement(tagName, projectRoot);

  if (element === null) {
    return null;
  }

  return formatElementDocumentation(element);
}

function findUiPrimitiveSource(projectRoot: string, primitive: string): string | null {
  for (const sourceRoot of [uiWorkspaceSourceRoot, uiPackageSourceRoot]) {
    const path = join(projectRoot, sourceRoot, primitive, `ui.${primitive}.ts`);

    if (existsSync(path)) {
      return path;
    }
  }

  return null;
}

function findWebTypesElement(tagName: string, projectRoot: string): WebTypesElement | null {
  for (const webTypesPath of [uiWorkspaceWebTypesPath, uiPackageWebTypesPath]) {
    const path = join(projectRoot, webTypesPath);

    if (!existsSync(path)) {
      continue;
    }

    const document = JSON.parse(readFileSync(path, 'utf8')) as WebTypesDocument;
    const element = document.contributions?.html?.elements?.find((entry) => entry.name === tagName);

    if (element !== undefined) {
      return element;
    }
  }

  return null;
}

function formatElementDocumentation(element: WebTypesElement): string {
  const parts = [element.description ?? `Use <${element.name}> as a Vanrot UI element.`];
  const attributes = element.attributes ?? [];

  if (attributes.length === 0) {
    parts.push('Vanrot-specific attributes: none. Normal HTML attributes like class, id, aria-*, and data-* still work.');
    return parts.join('\n\n');
  }

  parts.push(`Vanrot-specific attributes: ${attributes.map((attribute) => attribute.name).join(', ')}.`);
  parts.push('Use dotted attributes without a value, for example `variant.secondary` or `size.md`, when the attribute says it is no-value.');

  return parts.join('\n\n');
}

function uiPrimitiveCandidates(kebabName: string): string[] {
  const parts = kebabName.split('-');
  const candidates: string[] = [];

  for (let end = parts.length; end > 0; end -= 1) {
    candidates.push(parts.slice(0, end).join('-'));
  }

  return candidates;
}

function isUiTag(tagName: string): boolean {
  return tagName.startsWith(uiTagPrefix);
}

function fileStartLocation(path: string): Location {
  return {
    uri: URI.file(path).toString(),
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
  };
}
