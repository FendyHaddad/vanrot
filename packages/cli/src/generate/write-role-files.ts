import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { toPascalCase } from './names.js';

export type Role = 'component' | 'page';

export interface WriteRoleFilesOptions {
  cwd: string;
  role: Role;
  name: string;
  feature?: string;
}

export interface WriteRoleFilesResult {
  files: string[];
}

export async function writeRoleFiles(
  options: WriteRoleFilesOptions,
): Promise<WriteRoleFilesResult> {
  const directory = resolveDirectory(options);
  const suffix = options.role === 'component' ? 'component' : 'page';
  const className = `${toPascalCase(options.name)}${options.role === 'component' ? 'Component' : 'Page'}`;
  const baseName = `${options.name}.${suffix}`;
  const relativeFiles = [
    join(directory, `${baseName}.ts`),
    join(directory, `${baseName}.html`),
    join(directory, `${baseName}.css`),
  ] as const;

  await mkdir(join(options.cwd, directory), { recursive: true });
  await writeFile(join(options.cwd, relativeFiles[0]), typescriptTemplate(className));
  await writeFile(join(options.cwd, relativeFiles[1]), htmlTemplate(options.name));
  await writeFile(join(options.cwd, relativeFiles[2]), cssTemplate(options.name));

  return { files: [...relativeFiles] };
}

function resolveDirectory(options: WriteRoleFilesOptions): string {
  if (options.feature !== undefined && options.role === 'component') {
    return join('src', 'features', options.feature, 'components');
  }

  if (options.feature !== undefined) {
    return join('src', 'features', options.feature);
  }

  return options.role === 'component' ? join('src', 'components') : join('src', 'pages');
}

function typescriptTemplate(className: string): string {
  return `import { signal } from '@vanrot/runtime';\n\nexport class ${className} {\n  title = signal('${className}');\n\n  t(key: string): string {\n    return key;\n  }\n}\n`;
}

function htmlTemplate(name: string): string {
  return `<section class="${name}">\n  <h1>{{ t('${name}.title') }}</h1>\n</section>\n`;
}

function cssTemplate(name: string): string {
  return `.${name} {\n  display: block;\n}\n`;
}
