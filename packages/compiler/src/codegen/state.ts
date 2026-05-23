import type {
  CompileDiagnostic,
  CompileFeature,
  ComponentDependency,
  SourceMapping,
} from '../api/types.js';
import { IdentifierAllocator } from './identifiers.js';

export interface GenerateState {
  ids: IdentifierAllocator;
  lines: string[];
  diagnostics: CompileDiagnostic[];
  features: Set<CompileFeature>;
  componentDependencies: ComponentDependency[];
  mappings: SourceMapping[];
  usesEffect: boolean;
  usesSignal: boolean;
  usesCleanupScopes: boolean;
  usesRegisterCleanup: boolean;
  usesListen: boolean;
  usesRouterRoot: boolean;
  usesRouterOutlet: boolean;
  usesRouteLink: boolean;
  usesSlots: boolean;
  templatePath: string;
  templateSource: string;
  localIdentifiers: string[];
  localSignalIdentifiers: string[];
}

export interface CreateGenerateStateInput {
  templatePath: string;
  templateSource: string;
}

export function createGenerateState(input: CreateGenerateStateInput): GenerateState {
  return {
    ids: new IdentifierAllocator(),
    lines: [],
    diagnostics: [],
    features: new Set<CompileFeature>(['readable-output']),
    componentDependencies: [],
    mappings: [],
    usesEffect: false,
    usesSignal: false,
    usesCleanupScopes: false,
    usesRegisterCleanup: false,
    usesListen: false,
    usesRouterRoot: false,
    usesRouterOutlet: false,
    usesRouteLink: false,
    usesSlots: false,
    templatePath: input.templatePath,
    templateSource: input.templateSource,
    localIdentifiers: [],
    localSignalIdentifiers: [],
  };
}
