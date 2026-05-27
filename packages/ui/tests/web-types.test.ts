import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  uiComponentCatalog,
  uiComponentRegistry,
  uiPackageInventory,
  uiPrimitiveTokenGroup,
} from '../src/index.js';

const uiPackageRoot = new URL('../', import.meta.url);
const uiWebTypesFile = 'web-types.json';

interface WebTypesElement {
  name: string;
  description?: string;
  attributes?: readonly WebTypesAttribute[];
}

interface WebTypesAttribute {
  name: string;
  description?: string;
  value?: {
    kind?: string;
  };
}

interface WebTypesDocument {
  $schema: string;
  name: string;
  version: string;
  contributions: {
    html: {
      elements: WebTypesElement[];
      attributes?: WebTypesAttribute[];
    };
  };
}

interface ExpectedAttribute {
  name: string;
  kind: 'token' | 'boolean' | 'open';
}

function readPackageJson(): Record<string, unknown> {
  return JSON.parse(readFileSync(new URL('package.json', uiPackageRoot), 'utf8')) as Record<string, unknown>;
}

function readUiWebTypes(): WebTypesDocument {
  const fileUrl = new URL(uiWebTypesFile, uiPackageRoot);

  expect(existsSync(fileUrl)).toBe(true);

  return JSON.parse(readFileSync(fileUrl, 'utf8')) as WebTypesDocument;
}

function elementNames(webTypes: WebTypesDocument): string[] {
  return webTypes.contributions.html.elements.map((element) => element.name);
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function webTypesAttributesByName(attributes: readonly WebTypesAttribute[] | undefined): Map<string, WebTypesAttribute> {
  return new Map((attributes ?? []).map((attribute) => [attribute.name, attribute]));
}

function expectedComponentAttributes(type: string): ExpectedAttribute[] {
  const component = uiComponentCatalog[type as keyof typeof uiComponentCatalog];
  const registryItem = Object.values(uiComponentRegistry).find((item) => item.selector === component.selector);
  const tokenAttributes = Object.entries(uiPrimitiveTokenGroup[type as keyof typeof uiPrimitiveTokenGroup] ?? {}).flatMap(
    ([groupName, group]) =>
      group.tokens.map((token) => ({
        name: `${groupName}.${token}`,
        kind: 'token' as const,
      })),
  );
  const booleanAttributes =
    registryItem?.booleans.map((attribute) => ({
      name: attribute.name,
      kind: 'boolean' as const,
    })) ?? [];
  const openAttributes =
    registryItem?.openAttributes.map((attribute) => ({
      name: attribute.name,
      kind: 'open' as const,
    })) ?? [];

  return [...tokenAttributes, ...booleanAttributes, ...openAttributes].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

describe('@vanrot/ui Web Types metadata', () => {
  it('is discoverable from the package manifest', () => {
    const packageJson = readPackageJson();

    expect(packageJson['web-types']).toBe(`./${uiWebTypesFile}`);
    expect(packageJson.files).toEqual(expect.arrayContaining([uiWebTypesFile]));
  });

  it('describes the UI package for JetBrains Web Types discovery', () => {
    const packageJson = readPackageJson();
    const webTypes = readUiWebTypes();

    expect(webTypes.$schema).toBe('https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json');
    expect(webTypes.name).toBe(uiPackageInventory.name);
    expect(webTypes.version).toBe(packageJson.version);
  });

  it('keeps UI symbols available without requiring a Vanrot IDE framework context', () => {
    const webTypes = readUiWebTypes() as WebTypesDocument & { framework?: string };

    expect(webTypes.framework).toBeUndefined();
  });

  it('lists every registered component and anatomy selector once', () => {
    const webTypes = readUiWebTypes();
    const registrySelectors = Object.values(uiComponentRegistry).flatMap((component) =>
      component.anatomy.map((part) => part.selector),
    );
    const catalogSelectors = Object.values(uiComponentCatalog).map((component) => component.selector);

    expect(elementNames(webTypes)).toEqual(uniqueSorted([...catalogSelectors, ...registrySelectors]));
  });

  it('adds completion metadata for Vanrot dot attributes and plain attributes', () => {
    const webTypes = readUiWebTypes();
    const elements = new Map(webTypes.contributions.html.elements.map((element) => [element.name, element]));

    expect(elements.get('vr-button')?.attributes?.map((attribute) => attribute.name)).toEqual(
      expect.arrayContaining(['variant.default', 'variant.outline']),
    );
    expect(elements.get('vr-input')?.attributes?.map((attribute) => attribute.name)).toEqual(
      expect.arrayContaining(['type.email', 'size.md', 'disabled', 'aria-label', 'placeholder']),
    );
    expect(elements.get('vr-dialog')?.attributes?.map((attribute) => attribute.name)).toEqual(
      expect.arrayContaining(['open', 'size.md', 'aria-label', 'aria-describedby']),
    );
  });

  it('recognizes every catalog and registry-backed component attribute', () => {
    const webTypes = readUiWebTypes();
    const elements = new Map(webTypes.contributions.html.elements.map((element) => [element.name, element]));
    const globalAttributes = webTypesAttributesByName(webTypes.contributions.html.attributes);
    const missingAttributes: string[] = [];
    const valueRequiredAttributes: string[] = [];

    for (const [type, component] of Object.entries(uiComponentCatalog)) {
      const elementAttributes = webTypesAttributesByName(elements.get(component.selector)?.attributes);

      for (const expectedAttribute of expectedComponentAttributes(type)) {
        const attribute = elementAttributes.get(expectedAttribute.name) ?? globalAttributes.get(expectedAttribute.name);

        if (attribute === undefined) {
          missingAttributes.push(`${component.selector}|${expectedAttribute.name}`);
          continue;
        }

        if (expectedAttribute.kind === 'open') {
          continue;
        }

        if (attribute.value?.kind !== 'no-value') {
          valueRequiredAttributes.push(`${component.selector}|${expectedAttribute.name}`);
        }
      }
    }

    expect(missingAttributes).toEqual([]);
    expect(valueRequiredAttributes).toEqual([]);
  });
});
