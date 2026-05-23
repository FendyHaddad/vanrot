import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defaultUiPrefix, uiAssetUrl, uiPrimitive } from '@vanrot/ui';
import { toPascalCase } from '../generate/names.js';

export interface RenderedUiFile {
  path: string;
  content: string;
}

export interface RenderButtonFilesOptions {
  includeTest?: boolean;
}

export async function renderButtonFiles(
  prefix: string,
  options: RenderButtonFilesOptions = {},
): Promise<RenderedUiFile[]> {
  const [typescript, html, css] = await Promise.all([
    readAsset(uiAssetUrl.button.typescript),
    readAsset(uiAssetUrl.button.html),
    readAsset(uiAssetUrl.button.css),
  ]);
  const className = `${toPascalCase(prefix)}Button`;
  const files: RenderedUiFile[] = [
    {
      path: `${uiPrimitive.button.directory}/${prefix}.button.ts`,
      content: renameButtonSymbol(typescript, className),
    },
    {
      path: `${uiPrimitive.button.directory}/${prefix}.button.html`,
      content: html,
    },
    {
      path: `${uiPrimitive.button.directory}/${prefix}.button.css`,
      content: css,
    },
  ];

  if (options.includeTest === true) {
    const test = await readAsset(uiAssetUrl.button.test);
    files.push({
      path: `${uiPrimitive.button.directory}/${prefix}.button.test.ts`,
      content: renameButtonFilePrefix(renameButtonSymbol(test, className), prefix),
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

export async function readHomeButtonUsage(): Promise<string> {
  return readAsset(uiAssetUrl.button.homeUsage);
}

export function buttonStyleImport(prefix: string): string {
  return `@import '../ui/button/${prefix}.button.css';`;
}

async function readAsset(url: URL): Promise<string> {
  return readFile(fileURLToPath(url), 'utf8');
}

function renameButtonSymbol(source: string, className: string): string {
  if (className === 'UiButton') {
    return source;
  }

  return source.replaceAll(`${toPascalCase(defaultUiPrefix)}Button`, className);
}

function renameButtonFilePrefix(source: string, prefix: string): string {
  if (prefix === defaultUiPrefix) {
    return source;
  }

  return source.replaceAll(`./${defaultUiPrefix}.button`, `./${prefix}.button`);
}
