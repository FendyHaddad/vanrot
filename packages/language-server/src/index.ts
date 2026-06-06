export { isVanrotTemplateFile, vanrotTemplateRules } from './template-files.js';
export { buildInitializeResult, startLanguageServer } from './server.js';
export { buildEditorIntelligence, type VanrotEditorIntelligence } from './project/editor-intelligence.js';
export { editorIntelligenceRelativePath, exportEditorIntelligence } from './project/export-intelligence.js';
export {
  buildTemplateIndex,
  emptyTemplateIndex,
  type TemplateFileEntry,
  type TemplateIndex,
  type TemplateReference,
} from './project/template-index.js';
export {
  emptyVanrotWebTypes,
  loadVanrotWebTypes,
  type VanrotWebTypesAttribute,
  type VanrotWebTypesSource,
  type VanrotWebTypesSummary,
  type VanrotWebTypesTag,
} from './project/web-types.js';
