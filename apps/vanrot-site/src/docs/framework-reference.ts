import frameworkReferenceJson from './framework-reference.json';

export const frameworkReferenceStatus = {
  productionReady: 'production-ready',
  demoCapable: 'demo-capable',
  limited: 'limited',
  deferred: 'deferred',
  notBrowserFacing: 'not-browser-facing',
} as const;

export type FrameworkReferenceStatus =
  (typeof frameworkReferenceStatus)[keyof typeof frameworkReferenceStatus];

export interface FrameworkPackageReference {
  name: string;
  area: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkPublicExportReference {
  packageName: string;
  name: string;
  kind: 'function' | 'constant' | 'type' | 'interface' | 'class' | 'default';
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkCommandReference {
  name: string;
  usage: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
  examples: readonly string[];
  notes: readonly string[];
  subcommands?: readonly {
    name: string;
    summary: string;
  }[];
}

export interface FrameworkDiagnosticReference {
  family: 'compiler' | 'config' | 'router' | 'cli' | 'vite-plugin' | 'ssr';
  code: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkGeneratedFileReference {
  path: string;
  owner: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkConventionReference {
  id: string;
  title: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkExampleReference {
  id: string;
  title: string;
  path: string;
  packages: readonly string[];
  workflows: readonly string[];
  docsPath: string;
}

export interface FrameworkLimitationReference {
  id: string;
  title: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface FrameworkMaturityReference {
  phase: string;
  title: string;
  status: FrameworkReferenceStatus;
  summary: string;
  docsPath: string;
}

export interface PublicRouteMetadata {
  path: string;
  title: string;
  description: string;
}

export interface FrameworkReference {
  packages: readonly FrameworkPackageReference[];
  publicExports: readonly FrameworkPublicExportReference[];
  commands: readonly FrameworkCommandReference[];
  diagnostics: readonly FrameworkDiagnosticReference[];
  generatedFiles: readonly FrameworkGeneratedFileReference[];
  conventions: readonly FrameworkConventionReference[];
  examples: readonly FrameworkExampleReference[];
  limitations: readonly FrameworkLimitationReference[];
  maturity: readonly FrameworkMaturityReference[];
  routeMetadata: readonly PublicRouteMetadata[];
  deployment: {
    targetHost: string;
    status: FrameworkReferenceStatus;
    summary: string;
    docsPath: string;
  };
}

export const frameworkReference = frameworkReferenceJson as FrameworkReference;
export const packageReferenceDocs = frameworkReference.packages;
export const publicExportReferenceDocs = frameworkReference.publicExports;
export const commandReferenceDocs = frameworkReference.commands;
export const diagnosticReferenceDocs = frameworkReference.diagnostics;
export const generatedFileReferenceDocs = frameworkReference.generatedFiles;
export const conventionReferenceDocs = frameworkReference.conventions;
export const exampleReferenceDocs = frameworkReference.examples;
export const limitationReferenceDocs = frameworkReference.limitations;
export const maturityReferenceDocs = frameworkReference.maturity;
export const publicRouteMetadata = frameworkReference.routeMetadata;
export const deploymentReference = frameworkReference.deployment;
