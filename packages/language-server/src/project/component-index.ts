import { createComponentFileSet, readComponentMetadata } from '@vanrot/compiler';

const componentClassSuffixPattern = /(Component|Page|Layout|Button)$/;

export interface ComponentEntry {
  tagName: string;
  className: string;
  path: string;
}

export function componentTagFromClassName(className: string): string {
  const stripped = className.replace(componentClassSuffixPattern, '');

  return stripped
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export function buildComponentIndex(
  files: ReadonlyArray<{ path: string; source: string }>,
): ComponentEntry[] {
  const entries: ComponentEntry[] = [];

  for (const file of files) {
    const fileSet = createComponentFileSet(file.path);

    if (fileSet === null) {
      continue;
    }

    const result = readComponentMetadata(fileSet, file.source);

    if (result.metadata === null) {
      continue;
    }

    entries.push({
      tagName: fileSet.componentBaseName,
      className: result.metadata.componentName,
      path: file.path,
    });
  }

  return entries;
}
