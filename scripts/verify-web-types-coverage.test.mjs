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
const docsSharedElements = [
  'docs-article-shell',
  'docs-code-block',
  'docs-note',
  'docs-points-list',
  'docs-section',
];
const docsSharedElementAttributes = {
  'docs-article-shell': ['[sectionLinks]', '[summary]', '[title]'],
  'docs-code-block': ['[code]', '[title]'],
  'docs-note': [],
  'docs-points-list': ['[points]'],
  'docs-section': ['[sectionId]', '[title]'],
};
const vagueVanrotDescriptionPattern = /^Vanrot (UI element|.+ primitive|.+ element)\.$/;
const routeShorthandPattern = { regex: '^route\\.[A-Za-z][A-Za-z0-9_]*$' };
const bracketedBindingPattern = { regex: '^\\[[A-Za-z_][A-Za-z0-9_.:-]*\\]$' };
const valueShorthandPattern = { regex: '^value\\.[A-Za-z][A-Za-z0-9_-]*$' };

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

function extractHtmlTags(template) {
  const tags = [];

  for (let index = 0; index < template.length; index += 1) {
    if (template[index] !== '<') {
      continue;
    }

    const nextCharacter = template[index + 1];

    if (nextCharacter === '!' || nextCharacter === '?') {
      continue;
    }

    let quote = null;
    let tagEnd = -1;

    for (let cursor = index + 1; cursor < template.length; cursor += 1) {
      const character = template[cursor];

      if (quote !== null) {
        if (character === quote) {
          quote = null;
        }

        continue;
      }

      if (character === '"' || character === "'") {
        quote = character;
        continue;
      }

      if (character === '>') {
        tagEnd = cursor;
        break;
      }
    }

    if (tagEnd === -1) {
      break;
    }

    tags.push(template.slice(index + 1, tagEnd));
    index = tagEnd;
  }

  return tags;
}

function parseHtmlTag(rawTag) {
  let cursor = 0;

  while (/\s/.test(rawTag[cursor] ?? '')) {
    cursor += 1;
  }

  if (rawTag[cursor] === '/') {
    cursor += 1;
  }

  const tagNameStart = cursor;

  while (/[A-Za-z0-9:._-]/.test(rawTag[cursor] ?? '')) {
    cursor += 1;
  }

  const tagName = rawTag.slice(tagNameStart, cursor);

  if (tagName.length === 0) {
    return null;
  }

  const attributes = [];

  while (cursor < rawTag.length) {
    while (/\s/.test(rawTag[cursor] ?? '')) {
      cursor += 1;
    }

    if (cursor >= rawTag.length || rawTag[cursor] === '/') {
      break;
    }

    const attributeNameStart = cursor;

    while (cursor < rawTag.length && !/[\s=/>]/.test(rawTag[cursor])) {
      cursor += 1;
    }

    const attributeName = rawTag.slice(attributeNameStart, cursor);

    if (attributeName.length === 0) {
      cursor += 1;
      continue;
    }

    while (/\s/.test(rawTag[cursor] ?? '')) {
      cursor += 1;
    }

    const hasValue = rawTag[cursor] === '=';

    if (hasValue) {
      cursor += 1;

      while (/\s/.test(rawTag[cursor] ?? '')) {
        cursor += 1;
      }

      const quote = rawTag[cursor];

      if (quote === '"' || quote === "'") {
        cursor += 1;

        while (cursor < rawTag.length && rawTag[cursor] !== quote) {
          cursor += 1;
        }

        if (rawTag[cursor] === quote) {
          cursor += 1;
        }
      } else {
        while (cursor < rawTag.length && !/\s/.test(rawTag[cursor])) {
          cursor += 1;
        }
      }
    }

    attributes.push({ name: attributeName, hasValue });
  }

  return { tagName, attributes };
}

function isVanrotTemplateElement(tagName) {
  return tagName === 'vr' || tagName.includes('-');
}

function collectVanrotTemplateUsage() {
  const tagUsages = new Map();
  const dottedAttributeUsages = new Map();
  const bracketedAttributeUsages = new Map();
  const valuelessDottedAttributeUsages = new Map();
  const htmlFiles = scannedHtmlRoots.flatMap((directory) => collectHtmlFiles(join(root, directory)));

  for (const file of htmlFiles) {
    const template = readFileSync(file, 'utf8');
    const relativePath = relative(root, file);

    for (const rawTag of extractHtmlTags(template)) {
      const tag = parseHtmlTag(rawTag);

      if (tag === null) {
        continue;
      }

      if (isVanrotTemplateElement(tag.tagName)) {
        rememberUsage(tagUsages, tag.tagName, relativePath);
      }

      for (const attribute of tag.attributes) {
        const attributeName = attribute.name;

        if (attributeName.includes('.')) {
          rememberUsage(dottedAttributeUsages, `${tag.tagName}|${attributeName}`, relativePath);

          if (!attribute.hasValue) {
            rememberUsage(valuelessDottedAttributeUsages, `${tag.tagName}|${attributeName}`, relativePath);
          }
        }

        if (attributeName.startsWith('[') && attributeName.endsWith(']')) {
          rememberUsage(bracketedAttributeUsages, `${tag.tagName}|${attributeName}`, relativePath);
        }
      }
    }
  }

  return { tagUsages, dottedAttributeUsages, bracketedAttributeUsages, valuelessDottedAttributeUsages };
}

function collectWebTypesSymbols(webTypesFiles) {
  const elements = new Map();
  const globalAttributes = new Map();
  const globalAttributePatterns = [];

  for (const { document } of webTypesFiles) {
    for (const attribute of document.contributions?.html?.attributes ?? []) {
      globalAttributes.set(attribute.name, attribute);

      if (attribute.pattern?.regex !== undefined) {
        globalAttributePatterns.push(attribute);
      }
    }

    for (const element of document.contributions?.html?.elements ?? []) {
      const currentAttributes = elements.get(element.name) ?? new Map();

      for (const attribute of element.attributes ?? []) {
        currentAttributes.set(attribute.name, attribute);
      }

      elements.set(element.name, currentAttributes);
    }
  }

  return { elements, globalAttributes, globalAttributePatterns };
}

function getWebTypesAttribute(symbols, tagName, attributeName) {
  const exactAttribute = symbols.elements.get(tagName)?.get(attributeName) ?? symbols.globalAttributes.get(attributeName);

  if (exactAttribute !== undefined) {
    return exactAttribute;
  }

  return symbols.globalAttributePatterns.find((attribute) => {
    return new RegExp(attribute.pattern.regex).test(attributeName);
  });
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

  it('exposes Vanrot bracket binding attributes as project-global Web Types symbols', () => {
    const documents = [
      readJson('web-types.json'),
      readJson('apps/vanrot-site/web-types.json'),
    ];

    for (const document of documents) {
      const globalAttributes = collectGlobalAttributeMap(document);

      expect(globalAttributes.get('[*]')?.pattern).toEqual(bracketedBindingPattern);
    }
  });

  it('exposes value shorthand attributes as project-global no-value Web Types symbols', () => {
    const documents = [
      readJson('web-types.json'),
      readJson('apps/vanrot-site/web-types.json'),
    ];

    for (const document of documents) {
      const globalAttributes = collectGlobalAttributeMap(document);

      expect(globalAttributes.get('value.*')?.value?.kind).toBe('no-value');
      expect(globalAttributes.get('value.*')?.pattern).toEqual(valueShorthandPattern);
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

  it('declares shared docs page components in root and site Web Types', () => {
    const rootElements = new Set(collectHtmlElements(readJson('web-types.json')).map((element) => element.name));
    const siteElements = new Set(
      collectHtmlElements(readJson('apps/vanrot-site/web-types.json')).map((element) => element.name),
    );

    expect(docsSharedElements.filter((element) => !rootElements.has(element))).toEqual([]);
    expect(docsSharedElements.filter((element) => !siteElements.has(element))).toEqual([]);
  });

  it('declares shared docs page component inputs in root and site Web Types', () => {
    const documents = [readJson('web-types.json'), readJson('apps/vanrot-site/web-types.json')];

    for (const document of documents) {
      const elements = new Map(collectHtmlElements(document).map((element) => [element.name, element]));
      const missingAttributes = Object.entries(docsSharedElementAttributes).flatMap(([elementName, attributes]) => {
        const declaredAttributes = new Set((elements.get(elementName)?.attributes ?? []).map((attribute) => attribute.name));

        return attributes
          .filter((attributeName) => !declaredAttributes.has(attributeName))
          .map((attributeName) => `${elementName}|${attributeName}`);
      });

      expect(missingAttributes).toEqual([]);
    }
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

  it('covers every Vanrot bracket binding used in authored HTML templates', () => {
    const { bracketedAttributeUsages } = collectVanrotTemplateUsage();
    const symbols = collectWebTypesSymbols(readProjectWebTypesFiles());
    const missingAttributes = [...bracketedAttributeUsages.keys()]
      .filter((key) => {
        const [tagName, attributeName] = key.split('|');

        return getWebTypesAttribute(symbols, tagName, attributeName) === undefined;
      })
      .sort()
      .map((key) => formatMissing(bracketedAttributeUsages, key));

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
