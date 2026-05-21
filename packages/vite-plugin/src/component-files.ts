export interface ComponentFiles {
  componentPath: string;
  templatePath: string;
  stylePath: string;
}

const roleSuffixes = ['component', 'page', 'button'] as const;

export function isComponentEntry(id: string): boolean {
  if (id.startsWith('virtual:vanrot-') || id.startsWith('\0vanrot:')) {
    return false;
  }

  return roleSuffixes.some((role) => cleanModuleId(id).endsWith(`.${role}.ts`));
}

export function resolveComponentFiles(componentPath: string): ComponentFiles {
  const cleanPath = cleanModuleId(componentPath);
  const role = roleSuffixes.find((candidate) => cleanPath.endsWith(`.${candidate}.ts`));

  if (role === undefined) {
    return {
      componentPath: cleanPath,
      templatePath: cleanPath,
      stylePath: cleanPath,
    };
  }

  return {
    componentPath: cleanPath,
    templatePath: cleanPath.replace(new RegExp(`\\.${role}\\.ts$`), `.${role}.html`),
    stylePath: cleanPath.replace(new RegExp(`\\.${role}\\.ts$`), `.${role}.css`),
  };
}

function cleanModuleId(id: string): string {
  return id.split('?')[0] ?? id;
}
