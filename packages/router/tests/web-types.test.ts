import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const routerPackageRoot = new URL('../', import.meta.url);
const routerWebTypesFile = 'web-types.json';

interface WebTypesAttribute {
  name: string;
  description?: string;
  pattern?: string | { regex: string };
  value?: {
    kind?: string;
  };
}

interface WebTypesElement {
  name: string;
  description?: string;
  attributes?: readonly WebTypesAttribute[];
}

interface WebTypesDocument {
  $schema: string;
  name: string;
  version: string;
  contributions: {
    html: {
      attributes?: WebTypesAttribute[];
      elements: WebTypesElement[];
    };
  };
}

function readPackageJson(): Record<string, unknown> {
  return JSON.parse(readFileSync(new URL('package.json', routerPackageRoot), 'utf8')) as Record<string, unknown>;
}

function readRouterWebTypes(): WebTypesDocument {
  const fileUrl = new URL(routerWebTypesFile, routerPackageRoot);

  expect(existsSync(fileUrl)).toBe(true);

  return JSON.parse(readFileSync(fileUrl, 'utf8')) as WebTypesDocument;
}

describe('@vanrot/router Web Types metadata', () => {
  it('is discoverable from the package manifest', () => {
    const packageJson = readPackageJson();

    expect(packageJson['web-types']).toBe(`./${routerWebTypesFile}`);
    expect(packageJson.files).toEqual(expect.arrayContaining([routerWebTypesFile]));
  });

  it('describes the router package for JetBrains Web Types discovery', () => {
    const packageJson = readPackageJson();
    const webTypes = readRouterWebTypes();

    expect(webTypes.$schema).toBe('https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json');
    expect(webTypes.name).toBe('@vanrot/router');
    expect(webTypes.version).toBe(packageJson.version);
  });

  it('keeps router symbols available without requiring a Vanrot IDE framework context', () => {
    const webTypes = readRouterWebTypes() as WebTypesDocument & { framework?: string };

    expect(webTypes.framework).toBeUndefined();
  });

  it('lists the router template elements and route-link shorthand', () => {
    const webTypes = readRouterWebTypes();
    const elements = new Map(webTypes.contributions.html.elements.map((element) => [element.name, element]));

    expect([...elements.keys()]).toEqual(['vr', 'vr-outlet', 'vr-router']);
    expect(elements.get('vr')?.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'route.*',
          pattern: { regex: '^route\\.[A-Za-z][A-Za-z0-9_]*$' },
          value: { kind: 'no-value' },
        }),
      ]),
    );
  });

  it('also exposes route-link shorthand as a global no-value HTML attribute', () => {
    const webTypes = readRouterWebTypes();
    const attributes = new Map((webTypes.contributions.html.attributes ?? []).map((attribute) => [attribute.name, attribute]));

    expect(attributes.get('route.*')).toEqual(
      expect.objectContaining({
        name: 'route.*',
        pattern: { regex: '^route\\.[A-Za-z][A-Za-z0-9_]*$' },
        value: { kind: 'no-value' },
      }),
    );
  });
});
