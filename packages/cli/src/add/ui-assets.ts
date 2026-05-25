import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defaultUiPrefix, uiAssetUrl, uiPrimitive, type UiPrimitiveType } from '@vanrot/ui';
import { toPascalCase } from '../generate/names.js';

export interface RenderedUiFile {
  path: string;
  content: string;
}

export interface RenderUiPrimitiveFilesOptions {
  includeTest?: boolean;
}

export async function renderUiPrimitiveFiles(
  primitive: UiPrimitiveType,
  prefix: string,
  options: RenderUiPrimitiveFilesOptions = {},
): Promise<RenderedUiFile[]> {
  const metadata = uiPrimitive[primitive];
  const asset = uiAssetUrl[primitive];
  const primitiveFileName = toPrimitiveFileName(primitive);
  const [typescript, html, css] = await Promise.all([
    readAsset(asset.typescript),
    readAsset(asset.html),
    readAsset(asset.css),
  ]);
  const className = `${toPascalCase(prefix)}${toPascalCase(primitive)}`;
  const files: RenderedUiFile[] = [
    {
      path: `${metadata.directory}/${prefix}.${primitiveFileName}.ts`,
      content: renamePrimitiveSymbol(typescript, primitive, className),
    },
    {
      path: `${metadata.directory}/${prefix}.${primitiveFileName}.html`,
      content: html,
    },
    {
      path: `${metadata.directory}/${prefix}.${primitiveFileName}.css`,
      content: css,
    },
  ];

  if (options.includeTest === true) {
    const test = await readAsset(asset.test);
    files.push({
      path: `${metadata.directory}/${prefix}.${primitiveFileName}.test.ts`,
      content: renamePrimitiveFilePrefix(
        renamePrimitiveSymbol(test, primitive, className),
        primitive,
        prefix,
      ),
    });
  }

  return files;
}

export async function readTokenCss(): Promise<string> {
  return readAsset(uiAssetUrl.tokens);
}

export async function readVanrotStylesCss(): Promise<string> {
  return readAsset(uiAssetUrl.vanrotstyles);
}

export async function readPrimitiveHomeUsage(primitive: UiPrimitiveType): Promise<string> {
  return readAsset(uiAssetUrl[primitive].homeUsage);
}

export function primitiveStyleImport(primitive: UiPrimitiveType, prefix: string): string {
  const metadata = uiPrimitive[primitive];
  const directory = metadata.directory.replace(/^src\//, '../');

  return `@import '${directory}/${prefix}.${toPrimitiveFileName(primitive)}.css';`;
}

async function readAsset(url: URL): Promise<string> {
  return readFile(fileURLToPath(url), 'utf8');
}

function renamePrimitiveSymbol(source: string, primitive: UiPrimitiveType, className: string): string {
  const defaultClassName = `${toPascalCase(defaultUiPrefix)}${toPascalCase(primitive)}`;

  if (className === defaultClassName) {
    return source;
  }

  return source.replaceAll(defaultClassName, className);
}

function renamePrimitiveFilePrefix(source: string, primitive: UiPrimitiveType, prefix: string): string {
  if (prefix === defaultUiPrefix) {
    return source;
  }

  const primitiveFileName = toPrimitiveFileName(primitive);

  return source.replaceAll(
    `./${defaultUiPrefix}.${primitiveFileName}`,
    `./${prefix}.${primitiveFileName}`,
  );
}

function toPrimitiveFileName(primitive: UiPrimitiveType): string {
  return primitive.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
