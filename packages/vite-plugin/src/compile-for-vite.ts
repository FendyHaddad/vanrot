import type { CompileDiagnostic, CompileOptions, CompileResult } from '@vanrot/compiler';
import { compileComponentFromFiles } from '@vanrot/compiler';
import { toPublicCssModuleId, toPublicSourceModuleId } from './virtual-modules.js';

export interface ViteCompileResult {
  code: string;
  css: string;
  diagnostics: CompileDiagnostic[];
}

export type CompileForViteFunction = (
  componentPath: string,
  options: CompileOptions,
) => Promise<CompileResult>;

export async function compileForVite(
  componentPath: string,
  compile: CompileForViteFunction = compileComponentFromFiles,
): Promise<ViteCompileResult> {
  const sourceModuleId = toPublicSourceModuleId(componentPath);
  const cssModuleId = toPublicCssModuleId(componentPath);
  const result = await compile(componentPath, {
    componentImportSpecifier: sourceModuleId,
  });

  return {
    code: [
      `import '${cssModuleId}';`,
      result.js,
      'const component = { createComponent };',
      'export default component;',
    ].join('\n\n'),
    css: result.css,
    diagnostics: result.diagnostics,
  };
}
