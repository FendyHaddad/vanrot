import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { uiAppFile, uiAssetUrl } from '@vanrot/ui';
import type { TemplateFile } from './app-template.js';

export async function createStarterUiAssets(): Promise<TemplateFile[]> {
  const [tokens, vanrotstyles] = await Promise.all([
    readFile(fileURLToPath(uiAssetUrl.tokens), 'utf8'),
    readFile(fileURLToPath(uiAssetUrl.vanrotstyles), 'utf8'),
  ]);

  return [
    {
      path: uiAppFile.tokens,
      content: tokens,
    },
    {
      path: uiAppFile.vanrotstyles,
      content: vanrotstyles,
    },
  ];
}
