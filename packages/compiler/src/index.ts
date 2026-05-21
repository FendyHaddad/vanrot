export type {
  CompileDiagnostic,
  CompileFeature,
  CompileOptions,
  CompileResult,
  ComponentSource,
  DiagnosticCode,
  DiagnosticSeverity,
} from './api/types.js';
export { compileComponent } from './api/compile-component.js';
export { compileComponentFromFiles } from './api/compile-component-from-files.js';

export type { ComponentFileResolution, ComponentFileSet } from './conventions/component-files.js';
export { createComponentFileSet, resolveComponentFiles } from './conventions/component-files.js';
export type { ComponentMetadata, ComponentMetadataResult } from './metadata/component-metadata.js';
export { readComponentMetadata } from './metadata/component-metadata.js';
export type { ElementNode, TemplateAttribute, TemplateNode, TextNode } from './template/ast.js';
export type { ParseTemplateResult } from './template/parse-template.js';
export { parseTemplate } from './template/parse-template.js';
export type { TemplateBinding, TemplateBindingResult } from './template/bindings.js';
export { extractTemplateBindings, parseInterpolation } from './template/bindings.js';
export { expressionGlobals } from './expressions/globals.js';
export type { RewriteExpressionResult } from './expressions/rewrite-expression.js';
export { rewriteEventHandlerExpression, rewriteExpression } from './expressions/rewrite-expression.js';
export { createScopeAttribute } from './styles/scope-id.js';
export { scopeCss } from './styles/scope-css.js';
export type { GenerateComponentInput, GenerateComponentResult } from './codegen/generate-component.js';
export { generateComponent } from './codegen/generate-component.js';
export { IdentifierAllocator } from './codegen/identifiers.js';
