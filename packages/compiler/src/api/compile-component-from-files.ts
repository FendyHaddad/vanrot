import { readFile } from 'node:fs/promises';
import type { CompileOptions, CompileResult } from './types.js';
import { compileComponent } from './compile-component.js';
import { resolveComponentFiles } from '../conventions/component-files.js';

export async function compileComponentFromFiles(
  componentPath: string,
  options: CompileOptions = {},
): Promise<CompileResult> {
  const resolved = await resolveComponentFiles(componentPath);

  if (resolved.fileSet === null || resolved.diagnostics.length > 0) {
    return {
      js: '',
      css: '',
      diagnostics: resolved.diagnostics,
      metadata: {
        componentName: '',
        scopeAttribute: '',
        features: [],
        componentDependencies: [],
        mappings: [],
      },
    };
  }

  const [componentSource, templateSource, styleSource] = await Promise.all([
    readFile(resolved.fileSet.componentPath, 'utf8'),
    readFile(resolved.fileSet.templatePath, 'utf8'),
    readFile(resolved.fileSet.stylePath, 'utf8'),
  ]);

  return compileComponent(
    {
      componentPath: resolved.fileSet.componentPath,
      componentSource,
      templatePath: resolved.fileSet.templatePath,
      templateSource,
      stylePath: resolved.fileSet.stylePath,
      styleSource,
    },
    options,
  );
}
