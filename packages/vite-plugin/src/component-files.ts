export interface ComponentFiles {
  componentPath: string;
  templatePath: string;
  stylePath: string;
}

export function isComponentEntry(id: string): boolean {
  if (id.startsWith('virtual:vanrot-') || id.startsWith('\0vanrot:')) {
    return false;
  }

  return cleanModuleId(id).endsWith('.component.ts');
}

export function resolveComponentFiles(componentPath: string): ComponentFiles {
  const cleanPath = cleanModuleId(componentPath);

  return {
    componentPath: cleanPath,
    templatePath: cleanPath.replace(/\.component\.ts$/, '.component.html'),
    stylePath: cleanPath.replace(/\.component\.ts$/, '.component.css'),
  };
}

function cleanModuleId(id: string): string {
  return id.split('?')[0] ?? id;
}
