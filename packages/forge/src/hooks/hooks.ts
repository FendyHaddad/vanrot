import type { ForgeAppGraph } from '../core/app-graph.js';
import type { ForgeDiagnostic } from '../diagnostics/format.js';

export interface ForgeHookContext {
  root: string;
  sourceRoot: string;
  graph: ForgeAppGraph;
  mode: 'dev' | 'build';
}

export interface ForgeHook {
  name: string;
  diagnostics?(context: ForgeHookContext): Promise<ForgeDiagnostic[]> | ForgeDiagnostic[];
  routeMetadata?(context: ForgeHookContext): Promise<unknown> | unknown;
  buildMetadata?(context: ForgeHookContext): Promise<unknown> | unknown;
  devtoolsMetadata?(context: ForgeHookContext): Promise<unknown> | unknown;
  aiMetadata?(context: ForgeHookContext): Promise<unknown> | unknown;
}

export interface ForgeHookRegistry {
  hooks: readonly ForgeHook[];
}

export interface ForgeHookMetadataResult {
  hookName: string;
  metadata: unknown;
}

type ForgeMetadataHookName =
  | 'routeMetadata'
  | 'buildMetadata'
  | 'devtoolsMetadata'
  | 'aiMetadata';

const unsupportedGenericHookProperties = [
  'transform',
  'resolveId',
  'load',
  'handleHotUpdate',
  'configureServer',
] as const;

export function createForgeHookRegistry(hooks: readonly ForgeHook[] = []): ForgeHookRegistry {
  for (const hook of hooks) {
    assertFirstPartyHookShape(hook);
  }

  return {
    hooks: Object.freeze([...hooks]),
  };
}

export async function runForgeDiagnosticsHooks(
  registry: ForgeHookRegistry,
  context: ForgeHookContext,
): Promise<ForgeDiagnostic[]> {
  const diagnostics: ForgeDiagnostic[] = [];

  for (const hook of registry.hooks) {
    if (hook.diagnostics === undefined) {
      continue;
    }

    diagnostics.push(...(await hook.diagnostics(context)));
  }

  return diagnostics;
}

export function runForgeRouteMetadataHooks(
  registry: ForgeHookRegistry,
  context: ForgeHookContext,
): Promise<ForgeHookMetadataResult[]> {
  return runForgeMetadataHooks(registry, context, 'routeMetadata');
}

export function runForgeBuildMetadataHooks(
  registry: ForgeHookRegistry,
  context: ForgeHookContext,
): Promise<ForgeHookMetadataResult[]> {
  return runForgeMetadataHooks(registry, context, 'buildMetadata');
}

export function runForgeDevtoolsMetadataHooks(
  registry: ForgeHookRegistry,
  context: ForgeHookContext,
): Promise<ForgeHookMetadataResult[]> {
  return runForgeMetadataHooks(registry, context, 'devtoolsMetadata');
}

export function runForgeAiMetadataHooks(
  registry: ForgeHookRegistry,
  context: ForgeHookContext,
): Promise<ForgeHookMetadataResult[]> {
  return runForgeMetadataHooks(registry, context, 'aiMetadata');
}

async function runForgeMetadataHooks(
  registry: ForgeHookRegistry,
  context: ForgeHookContext,
  hookName: ForgeMetadataHookName,
): Promise<ForgeHookMetadataResult[]> {
  const results: ForgeHookMetadataResult[] = [];

  for (const hook of registry.hooks) {
    const handler = hook[hookName];
    if (handler === undefined) {
      continue;
    }

    results.push({
      hookName: hook.name,
      metadata: await handler(context),
    });
  }

  return results;
}

function assertFirstPartyHookShape(hook: ForgeHook): void {
  for (const property of unsupportedGenericHookProperties) {
    if (property in hook) {
      throw new Error(`Unsupported Forge hook property: ${property}`);
    }
  }
}
