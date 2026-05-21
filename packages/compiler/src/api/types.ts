export type DiagnosticCode =
  | 'VR001'
  | 'VR002'
  | 'VR003'
  | 'VR004'
  | 'VR005'
  | 'VR006'
  | 'VR007'
  | 'VR008';

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
}

export type CompileFeature =
  | 'file-convention'
  | 'component-class'
  | 'text-interpolation'
  | 'event-binding'
  | 'property-binding'
  | 'scoped-css'
  | 'readable-output'
  | 'expression-rewriting';

export interface CompileResult {
  js: string;
  css: string;
  diagnostics: CompileDiagnostic[];
  metadata: {
    componentName: string;
    scopeAttribute: string;
    features: CompileFeature[];
  };
}
