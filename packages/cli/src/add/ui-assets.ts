import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defaultUiPrefix, uiAssetUrl, uiPrimitive } from '@vanrot/ui';
import { toPascalCase } from '../generate/names.js';

export interface RenderedUiFile {
  path: string;
  content: string;
}

export async function renderButtonFiles(prefix: string): Promise<RenderedUiFile[]> {
  const [typescript, html, css] = await Promise.all([
    readAsset(uiAssetUrl.button.typescript),
    readAsset(uiAssetUrl.button.html),
    readAsset(uiAssetUrl.button.css),
  ]);
  const className = `${toPascalCase(prefix)}Button`;

  return [
    {
      path: `${uiPrimitive.button.directory}/${prefix}.button.ts`,
      content: renameButtonClass(typescript, className),
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
}

export async function readTokenCss(): Promise<string> {
  return readAsset(uiAssetUrl.tokens);
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

function renameButtonClass(source: string, className: string): string {
  if (className === 'UiButton') {
    return source;
  }

  return source.replace(`class ${toPascalCase(defaultUiPrefix)}Button`, `class ${className}`);
}
