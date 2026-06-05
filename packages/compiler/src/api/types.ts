export type DiagnosticCode =
  | 'VR001'
  | 'VR002'
  | 'VR003'
  | 'VR004'
  | 'VR005'
  | 'VR006'
  | 'VR007'
  | 'VR008'
  | 'VR009'
  | 'VR010'
  | 'VR011'
  | 'VR012'
  | 'VR013'
  | 'VR014'
  | 'VR015'
  | 'VR016'
  | 'VR017'
  | 'VR018'
  | 'VR019'
  | 'VR020'
  | 'VR021'
  | 'VR_PIPE_UNKNOWN'
  | 'VR_PIPE_UNKNOWN_VARIANT'
  | 'VR_PIPE_DUPLICATE_NAME'
  | 'VR_PIPE_DUPLICATE_PRESET'
  | 'VR_PIPE_INVALID_ARGUMENT'
  | 'VR_PIPE_INVALID_DEFINITION'
  | 'VR_PIPE_ASYNC'
  | 'VR_ROUTER_MULTIPLE_ROOTS'
  | 'VR_ROUTER_OUTSIDE_APP_LAYOUT'
  | 'VR_LAYOUT_MISSING_OUTLET'
  | 'VR_LAYOUT_MULTIPLE_OUTLETS'
  | 'VR_OUTLET_OUTSIDE_LAYOUT'
  | 'VR_PAGE_HAS_OUTLET';

export type DiagnosticSeverity = 'error' | 'warning';

export interface ComponentSource {
  componentPath: string;
  componentSource: string;
  templatePath: string;
  templateSource: string;
  stylePath: string;
  styleSource: string;
}

export interface CompileOptions {
  componentImportSpecifier?: string;
  target?: 'browser' | 'server';
  pipeRegistry?: CompilePipeRegistry;
  pipeContext?: CompilePipeContext;
}

export interface CompilePipeRegistry {
  pipes: CompilePipeDefinition[];
  presets: CompilePipePreset[];
}

export interface CompilePipeDefinition {
  name: string;
  sourcePath: string;
}

export interface CompilePipePreset {
  namespace: string;
  name: string;
  pattern: string;
  sourcePath: string;
}

export interface CompilePipeContext {
  locale: string;
  timezone: string;
  currency: string;
}

export interface CompileDiagnostic {
  code: DiagnosticCode;
  severity: DiagnosticSeverity;
  message: string;
  filePath: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  sourceText: string;
  codeFrame: string;
  suggestion: string;
  docsPath: string;
}

export type CompileFeature =
  | 'file-convention'
  | 'component-class'
  | 'text-interpolation'
  | 'event-binding'
  | 'property-binding'
  | 'child-component'
  | 'scoped-css'
  | 'readable-output'
  | 'expression-rewriting'
  | 'control-flow-if'
  | 'control-flow-for'
  | 'router-root'
  | 'router-outlet'
  | 'router-link'
  | 'template-pipe'
  | 'ui-button'
  | 'ui-card'
  | 'ui-badge'
  | 'ui-avatar'
  | 'ui-alert'
  | 'ui-loader'
  | 'ui-skeleton'
  | 'ui-separator'
  | 'ui-layout'
  | 'ui-container'
  | 'ui-section'
  | 'ui-grid'
  | 'ui-header'
  | 'ui-footer'
  | 'ui-sidebar'
  | 'ui-nav'
  | 'ui-breadcrumb'
  | 'ui-img'
  | 'ui-src'
  | 'ui-form'
  | 'ui-form-field'
  | 'ui-label'
  | 'ui-input'
  | 'ui-textarea'
  | 'ui-select'
  | 'ui-checkbox'
  | 'ui-radio-group'
  | 'ui-radio'
  | 'ui-switch'
  | 'ui-slider'
  | 'ui-table'
  | 'ui-table-header'
  | 'ui-table-body'
  | 'ui-table-row'
  | 'ui-table-head'
  | 'ui-table-cell'
  | 'ui-table-footer'
  | 'ui-table-caption'
  | 'ui-pagination'
  | 'ui-list'
  | 'ui-list-item'
  | 'ui-stat'
  | 'ui-empty-state'
  | 'ui-dialog'
  | 'ui-drawer'
  | 'ui-dropdown'
  | 'ui-tabs'
  | 'ui-toast'
  | 'ui-popover'
  | 'ui-tooltip'
  | 'ui-command-menu'
  | 'slot'
  | 'server-rendering';

export interface ComponentDependencyInput {
  name: string;
  expression: string;
}

export interface ComponentDependency {
  tagName: string;
  componentName: string;
  importPath: string;
  inputs: ComponentDependencyInput[];
}

export type GeneratedFileKind = 'js' | 'css';

export interface SourceMapping {
  generatedFile: GeneratedFileKind;
  generatedLine: number;
  generatedColumn: number;
  sourceFilePath: string;
  sourceLine: number;
  sourceColumn: number;
}

export interface CompileResult {
  js: string;
  css: string;
  diagnostics: CompileDiagnostic[];
  metadata: {
    componentName: string;
    scopeAttribute: string;
    features: CompileFeature[];
    componentDependencies: ComponentDependency[];
    mappings: SourceMapping[];
  };
}
