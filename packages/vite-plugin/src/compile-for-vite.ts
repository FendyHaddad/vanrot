import type { CompileDiagnostic, CompileOptions, CompileResult } from '@vanrot/compiler';
import { compileComponentFromFiles } from '@vanrot/compiler';
import { createViteSourceMap, type ViteSourceMap } from './source-maps.js';
import { toPublicCssModuleId, toPublicSourceModuleId } from './virtual-modules.js';

export interface ViteCompileResult {
  code: string;
  css: string;
  map: ViteSourceMap;
  cssMap: ViteSourceMap;
  diagnostics: CompileDiagnostic[];
}

export type CompileForViteFunction = (
  componentPath: string,
  options: CompileOptions,
) => Promise<CompileResult>;

export async function compileForVite(
  componentPath: string,
  compile: CompileForViteFunction = compileComponentFromFiles,
  options: CompileOptions = {},
): Promise<ViteCompileResult> {
  const sourceModuleId = toPublicSourceModuleId(componentPath);
  const cssModuleId = toPublicCssModuleId(componentPath);
  const result = await compile(componentPath, {
    ...options,
    componentImportSpecifier: sourceModuleId,
  });
  const code = [
    `import '${cssModuleId}';`,
    result.js,
    `export * from '${sourceModuleId}';`,
    'const component = { createComponent };',
    `export { createComponent as create${result.metadata.componentName} };`,
    `export { component as ${result.metadata.componentName} };`,
    'export default component;',
  ].join('\n\n');
  const stylePath = componentPath.replace(/\.(component|page|button)\.ts$/, '.$1.css');

  return {
    code,
    css: result.css,
    map: createViteSourceMap({
      file: componentPath,
      source: 'js',
      generatedCode: code,
      mappings: result.metadata.mappings,
    }),
    cssMap: createViteSourceMap({
      file: stylePath,
      source: 'css',
      generatedCode: result.css,
      mappings: result.metadata.mappings,
    }),
    diagnostics: result.diagnostics,
  };
}
