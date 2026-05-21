import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const generatedHomePath = join('src', 'pages', 'home', 'home.page.html');
const homeSectionClose = '</section>';
const buttonSelector = '<vr-button';

export interface PatchStarterHomeResult {
  patched: boolean;
  path: string;
}

export async function patchStarterHome(
  root: string,
  usageMarkup: string,
): Promise<PatchStarterHomeResult> {
  const absolutePath = join(root, generatedHomePath);
  const existing = await readHomeIfExists(absolutePath);

  if (existing === null || existing.includes(buttonSelector) || !existing.includes(homeSectionClose)) {
    return {
      patched: false,
      path: generatedHomePath,
    };
  }

  const nextContent = existing.replace(homeSectionClose, `${usageMarkup}\n${homeSectionClose}`);
  await writeFile(absolutePath, nextContent);

  return {
    patched: true,
    path: generatedHomePath,
  };
}

async function readHomeIfExists(absolutePath: string): Promise<string | null> {
  try {
    return await readFile(absolutePath, 'utf8');
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }

    throw error;
  }
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}
