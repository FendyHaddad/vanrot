import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url).pathname;
const ignoredDirectoryPattern = /(^|\/)(node_modules|dist|\.git|\.vanrot)(\/|$)/;
const scannedHtmlRoots = ['apps', 'examples', 'packages'];
const webTypesSchema = 'https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json';
const routeShorthandAttributes = [
  'route.*',
  'route.about',
  'route.changelog',
  'route.components',
  'route.docs',
  'route.home',
  'route.reference',
];
const vagueVanrotDescriptionPattern = /^Vanrot (UI element|.+ primitive|.+ element)\.$/;
const routeShorthandPattern = { regex: '^route\\.[A-Za-z][A-Za-z0-9_]*$' };

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

function normalizeWebTypesField(field) {
  if (typeof field === 'string') {
    return [field];
  }

  if (Array.isArray(field)) {
    return field;
  }

  return [];
}

function readProjectWebTypesFiles() {
  const packageJson = readJson('package.json');
  const paths = normalizeWebTypesField(packageJson['web-types']);

  return paths.map((webTypesPath) => ({
    path: webTypesPath,
    document: readJson(webTypesPath),
  }));
}

function collectHtmlFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);

    if (ignoredDirectoryPattern.test(absolutePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      collectHtmlFiles(absolutePath, files);
      continue;
    }

    if (entry.isFile() && extname(entry.name) === '.html') {
      files.push(absolutePath);
    }
  }

  return files;
}

function collectVanrotTemplateUsage() {
  const tagUsages = new Map();
  const dottedAttributeUsages = new Map();
  const valuelessDottedAttributeUsages = new Map();
  const htmlFiles = scannedHtmlRoots.flatMap((directory) => collectHtmlFiles(join(root, directory)));

  for (const file of htmlFiles) {
    const template = readFileSync(file, 'utf8');
    const relativePath = relative(root, file);

    for (const tagMatch of template.matchAll(/<\/?(vr(?:-[A-Za-z0-9]+)*)\b([^>]*)>/g)) {
      const tagName = tagMatch[1];

      rememberUsage(tagUsages, tagName, relativePath);

      for (const attributeMatch of tagMatch[2].matchAll(/\s([:@#A-Za-z_][\w:.-]*)\b(?:\s*(=)|\s|\/|>)/g)) {
        const attributeName = attributeMatch[1];
        const hasValue = attributeMatch[2] === '=';

        if (attributeName.includes('.')) {
          rememberUsage(dottedAttributeUsages, `${tagName}|${attributeName}`, relativePath);

          if (!hasValue) {
            rememberUsage(valuelessDottedAttributeUsages, `${tagName}|${attributeName}`, relativePath);
          }
        }
      }
    }
  }

  return { tagUsages, dottedAttributeUsages, valuelessDottedAttributeUsages };
}

function collectWebTypesSymbols(webTypesFiles) {
  const elements = new Map();
  const globalAttributes = new Map();

  for (const { document } of webTypesFiles) {
    for (const attribute of document.contributions?.html?.attributes ?? []) {
      globalAttributes.set(attribute.name, attribute);
    }

    for (const element of document.contributions?.html?.elements ?? []) {
      const currentAttributes = elements.get(element.name) ?? new Map();

      for (const attribute of element.attributes ?? []) {
        currentAttributes.set(attribute.name, attribute);
      }

      elements.set(element.name, currentAttributes);
    }
  }

  return { elements, globalAttributes };
}

function getWebTypesAttribute(symbols, tagName, attributeName) {
  return symbols.elements.get(tagName)?.get(attributeName) ?? symbols.globalAttributes.get(attributeName);
}

function collectGlobalAttributeMap(document) {
  return new Map((document.contributions?.html?.attributes ?? []).map((attribute) => [attribute.name, attribute]));
}

function collectHtmlElements(document) {
  return document.contributions?.html?.elements ?? [];
}

function rememberUsage(usages, key, file) {
  const files = usages.get(key) ?? new Set();

  files.add(file);
  usages.set(key, files);
}

function formatMissing(usages, key) {
  const files = [...(usages.get(key) ?? [])].slice(0, 3).join(', ');

  return `${key} (${files})`;
}

describe('project Web Types coverage', () => {
  it('advertises package and app Web Types from the root and site package manifests', () => {
    const rootPackageJson = readJson('package.json');
    const sitePackageJson = readJson('apps/vanrot-site/package.json');

    expect(rootPackageJson['web-types']).toBe('./web-types.json');
    expect(sitePackageJson['web-types']).toBe('./web-types.json');
  });

  it('loads every project Web Types file from the root package manifest', () => {
    const webTypesFiles = readProjectWebTypesFiles();

    expect(webTypesFiles.map((file) => file.path)).toEqual(['./web-types.json']);

    for (const { path, document } of webTypesFiles) {
      expect(existsSync(join(root, path))).toBe(true);
      expect(document.$schema).toBe(webTypesSchema);
      expect(document.contributions.html.elements.length).toBeGreaterThan(0);
    }
  });

  it('exposes route shorthand attributes as project-global no-value Web Types symbols', () => {
    const documents = [
      readJson('web-types.json'),
      readJson('apps/vanrot-site/web-types.json'),
    ];

    for (const document of documents) {
      const globalAttributes = collectGlobalAttributeMap(document);
      const missingAttributes = routeShorthandAttributes.filter((attributeName) => {
        return globalAttributes.get(attributeName)?.value?.kind !== 'no-value';
      });

      expect(missingAttributes).toEqual([]);
      expect(globalAttributes.get('route.*')?.pattern).toEqual(routeShorthandPattern);
    }
  });

  it('covers every Vanrot element used in authored HTML templates', () => {
    const { tagUsages } = collectVanrotTemplateUsage();
    const { elements } = collectWebTypesSymbols(readProjectWebTypesFiles());
    const missingTags = [...tagUsages.keys()]
      .filter((tagName) => !elements.has(tagName))
      .sort()
      .map((tagName) => formatMissing(tagUsages, tagName));

    expect(missingTags).toEqual([]);
  });

  it('keeps Web Types element descriptions instructional instead of placeholder text', () => {
    const documents = [
      { path: 'web-types.json', document: readJson('web-types.json') },
      { path: 'packages/ui/web-types.json', document: readJson('packages/ui/web-types.json') },
      { path: 'packages/router/web-types.json', document: readJson('packages/router/web-types.json') },
    ];
    const vagueDescriptions = documents.flatMap(({ path, document }) => {
      return collectHtmlElements(document)
        .filter((element) => vagueVanrotDescriptionPattern.test(element.description ?? ''))
        .map((element) => `${path}:${element.name}`);
    });

    expect(vagueDescriptions).toEqual([]);
  });

  it('explains UI component usage and attributes in package Web Types hovers', () => {
    const document = readJson('packages/ui/web-types.json');
    const missingAttributeNotes = collectHtmlElements(document)
      .filter((element) => element.name.startsWith('vr-'))
      .filter((element) => !(element.description ?? '').includes('Vanrot-specific attributes:'))
      .map((element) => element.name);
    const header = collectHtmlElements(document).find((element) => element.name === 'vr-header');

    expect(missingAttributeNotes).toEqual([]);
    expect(header?.description).toContain('Use <vr-header>');
    expect(header?.description).toContain('logo, title, navigation, or actions');
  });

  it('points the header Web Types entry at the source users should inspect', () => {
    const packageHeader = collectHtmlElements(readJson('packages/ui/web-types.json')).find(
      (element) => element.name === 'vr-header',
    );
    const rootHeader = collectHtmlElements(readJson('web-types.json')).find((element) => {
      return element.name === 'vr-header';
    });

    expect(packageHeader?.source).toEqual({ file: 'src/primitives/header/ui.header.ts', offset: 0 });
    expect(rootHeader?.source).toEqual({ file: 'packages/ui/src/primitives/header/ui.header.ts', offset: 0 });
  });

  it('covers every Vanrot dotted attribute used in authored HTML templates', () => {
    const { dottedAttributeUsages } = collectVanrotTemplateUsage();
    const symbols = collectWebTypesSymbols(readProjectWebTypesFiles());
    const missingAttributes = [...dottedAttributeUsages.keys()]
      .filter((key) => {
        const [tagName, attributeName] = key.split('|');

        return getWebTypesAttribute(symbols, tagName, attributeName) === undefined;
      })
      .sort()
      .map((key) => formatMissing(dottedAttributeUsages, key));

    expect(missingAttributes).toEqual([]);
  });

  it('marks valueless dotted Vanrot attributes as Web Types no-value attributes', () => {
    const { valuelessDottedAttributeUsages } = collectVanrotTemplateUsage();
    const symbols = collectWebTypesSymbols(readProjectWebTypesFiles());
    const valueRequiredAttributes = [...valuelessDottedAttributeUsages.keys()]
      .filter((key) => {
        const [tagName, attributeName] = key.split('|');

        return getWebTypesAttribute(symbols, tagName, attributeName)?.value?.kind !== 'no-value';
      })
      .sort()
      .map((key) => formatMissing(valuelessDottedAttributeUsages, key));

    expect(valueRequiredAttributes).toEqual([]);
  });
});
