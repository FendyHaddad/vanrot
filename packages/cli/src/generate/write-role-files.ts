import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { toPascalCase } from './names.js';

export type Role = 'component' | 'page';

export interface WriteRoleFilesOptions {
  cwd: string;
  role: Role;
  name: string;
  feature?: string;
  includeTest?: boolean;
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
  const typescriptFile = join(directory, `${baseName}.ts`);
  const htmlFile = join(directory, `${baseName}.html`);
  const cssFile = join(directory, `${baseName}.css`);
  const relativeFiles = [typescriptFile, htmlFile, cssFile];

  await mkdir(join(options.cwd, directory), { recursive: true });
  await writeFile(join(options.cwd, typescriptFile), typescriptTemplate(className));
  await writeFile(join(options.cwd, htmlFile), htmlTemplate(options.name));
  await writeFile(join(options.cwd, cssFile), cssTemplate(options.name));

  if (options.includeTest === true) {
    const testFile = join(directory, `${baseName}.test.ts`);
    relativeFiles.push(testFile);
    await writeFile(join(options.cwd, testFile), testTemplate(options.role, className, baseName, options.name));
  }

  return { files: [...relativeFiles] };
}

function resolveDirectory(options: WriteRoleFilesOptions): string {
  if (options.feature !== undefined && options.role === 'component') {
    return join('src', 'features', options.feature, 'components', options.name);
  }

  if (options.feature !== undefined) {
    return join('src', 'features', options.feature, options.name);
  }

  return options.role === 'component'
    ? join('src', 'components', options.name)
    : join('src', 'pages', options.name);
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

function testTemplate(role: Role, className: string, baseName: string, name: string): string {
  const helper = role === 'component' ? 'testComponent' : 'testPage';
  const source = role === 'component' ? '@vanrot/testing' : '@vanrot/testing';
  const humanRole = role === 'component' ? 'component' : 'page';

  return `import { expect } from 'vitest';\nimport { ${helper} } from '${source}';\nimport { ${className} } from './${baseName}.js';\n\n${helper}(${className}).can('create the ${name} ${humanRole}', () => {\n  const ${role} = new ${className}();\n\n  expect(${role}.title()).toBe('${className}');\n});\n`;
}
