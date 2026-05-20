import { access } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { CompileDiagnostic } from '../api/types.js';

export interface ComponentFileSet {
  componentPath: string;
  templatePath: string;
  stylePath: string;
  componentBaseName: string;
  expectedClassName: string;
}

export interface ComponentFileResolution {
  fileSet: ComponentFileSet | null;
  diagnostics: CompileDiagnostic[];
}

export async function resolveComponentFiles(componentPath: string): Promise<ComponentFileResolution> {
  const fileSet = createComponentFileSet(componentPath);

  if (fileSet === null) {
    return {
      fileSet: null,
      diagnostics: [
        createDiagnostic(
          'VR003',
          'error',
          'Vanrot Phase 3 only supports .component.ts files.',
          componentPath,
        ),
      ],
    };
  }

  const diagnostics: CompileDiagnostic[] = [];

  if (!(await fileExists(fileSet.templatePath))) {
    diagnostics.push(
      createDiagnostic('VR001', 'error', 'Missing sibling component template file.', fileSet.templatePath),
    );
  }

  if (!(await fileExists(fileSet.stylePath))) {
    diagnostics.push(
      createDiagnostic('VR002', 'error', 'Missing sibling component style file.', fileSet.stylePath),
    );
  }

  return {
    fileSet,
    diagnostics,
  };
}

export function createComponentFileSet(componentPath: string): ComponentFileSet | null {
  const fileName = basename(componentPath);

  if (!fileName.endsWith('.component.ts')) {
    return null;
  }

  const componentBaseName = fileName.slice(0, -'.component.ts'.length);

  if (componentBaseName.length === 0) {
    return null;
  }

  const root = dirname(componentPath);

  return {
    componentPath,
    templatePath: join(root, `${componentBaseName}.component.html`),
    stylePath: join(root, `${componentBaseName}.component.css`),
    componentBaseName,
    expectedClassName: `${toPascalCase(componentBaseName)}Component`,
  };
}

function toPascalCase(value: string): string {
  return value
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join('');
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
