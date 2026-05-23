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
  | 'ui-button'
  | 'slot';

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
