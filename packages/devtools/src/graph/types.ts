export const projectMapGraphSchemaVersion = 2;

export type GraphManifestStatus =
  | 'ready'
  | 'stale'
  | 'missing'
  | 'unreadable'
  | 'unsupported-schema';

export type ProjectGraphNodeKind =
  | 'route'
  | 'layout'
  | 'page'
  | 'component'
  | 'dialog'
  | 'widget'
  | 'form'
  | 'template'
  | 'style'
  | 'asset'
  | 'import';

export type ProjectGraphEdgeKind =
  | 'route-to-page'
  | 'route-to-layout'
  | 'layout-to-child-route'
  | 'component-to-template'
  | 'component-to-style'
  | 'component-to-import'
  | 'component-to-asset'
  | 'file-imports-file';

export interface ProjectRoleFile {
  name: string;
  role: 'component' | 'page' | 'dialog' | 'layout' | 'widget' | 'form';
  path: string;
  templatePath: string | null;
  stylePath: string | null;
}

export interface ProjectMapRoles {
  components: ProjectRoleFile[];
  pages: ProjectRoleFile[];
  dialogs: ProjectRoleFile[];
  layouts: ProjectRoleFile[];
  widgets: ProjectRoleFile[];
  forms: ProjectRoleFile[];
}

export interface ProjectMapI18n {
  locales: string[];
  files: string[];
}

export interface GraphStaleState {
  value: boolean;
  reasons: string[];
}

export interface ProjectGraphNode {
  id: string;
  kind: ProjectGraphNodeKind;
  label: string;
  path: string | null;
  role?: ProjectRoleFile['role'];
  metadata: Record<string, string | number | boolean | null>;
}

export interface ProjectGraphEdge {
  id: string;
  from: string;
  to: string;
  kind: ProjectGraphEdgeKind;
  sourceLocation?: {
    path: string;
    line: number;
    column: number;
  };
}

export interface ProjectGraph {
  nodes: ProjectGraphNode[];
  edges: ProjectGraphEdge[];
}

export interface RouteGraphEntry {
  id: string;
  ref: string;
  path: string;
  parentId: string | null;
  layoutNodeId: string | null;
  pageNodeId: string | null;
  childIds: string[];
  metadata: Record<string, string | number | boolean | null>;
}

export interface CompilerGraphMetadata {
  components: Array<{
    path: string;
    templatePath: string | null;
    stylePath: string | null;
    bindings: string[];
    diagnostics: string[];
  }>;
  diagnostics: string[];
  warnings: string[];
}

export interface AiRulesGraphMetadata {
  rulesPath: string;
  enabledSections: string[];
  customSections: string[];
  configSource: string | null;
  warnings: string[];
  generatedAt: string;
}

export interface ProjectGraphManifest {
  schemaVersion: typeof projectMapGraphSchemaVersion;
  generatedAt: string;
  projectRoot: '.';
  sourceRoot: 'src';
  sourceFingerprint: string;
  stale: GraphStaleState;
  roles: ProjectMapRoles;
  i18n: ProjectMapI18n;
  graph: ProjectGraph;
  routes: RouteGraphEntry[];
  compiler: CompilerGraphMetadata;
  ai: AiRulesGraphMetadata;
}

export interface NormalizedGraphManifest {
  status: GraphManifestStatus;
  manifest: ProjectGraphManifest | null;
  warnings: string[];
}

export const runtimeGraphSchemaVersion = 1;

export type RuntimeGraphNodeKind = 'component' | 'signal' | 'computed' | 'effect';
export type RuntimeGraphEdgeKind =
  | 'component-to-signal'
  | 'signal-to-computed'
  | 'signal-to-effect'
  | 'computed-to-effect';

export interface RuntimeGraphNode {
  id: string;
  kind: RuntimeGraphNodeKind;
  label: string;
}

export interface RuntimeGraphEdge {
  from: string;
  to: string;
  kind: RuntimeGraphEdgeKind;
}

export type RuntimeGraphEvent =
  | { type: 'node'; node: RuntimeGraphNode }
  | { type: 'edge'; edge: RuntimeGraphEdge }
  | { type: 'dispose'; id: string };
