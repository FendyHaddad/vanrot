export const forgePackageName = '@vanrot/forge';

export { runForgeBuild } from './build/build.js';
export { createForgeAppGraph } from './core/app-graph.js';
export { classifyForgeFileRole, findOwnerRoleFile, forgeRoleSuffix } from './core/file-roles.js';
export { discoverForgeRoutes } from './core/routes.js';
export { scanForgeSourceFiles } from './core/source-files.js';
export { planForgeReload } from './dev/reload-planner.js';
export {
  collectForgeDevDiagnostics,
  runForgeDev,
  startForgeDevServer,
} from './dev/server.js';
export { forgeDiagnosticCode } from './diagnostics/codes.js';
export { formatForgeDiagnostic } from './diagnostics/format.js';
export {
  createForgeHookRegistry,
  runForgeAiMetadataHooks,
  runForgeBuildMetadataHooks,
  runForgeDevtoolsMetadataHooks,
  runForgeDiagnosticsHooks,
  runForgeRouteMetadataHooks,
} from './hooks/hooks.js';

export type { ForgeAppGraph, ForgeRoleFile } from './core/app-graph.js';
export type { ForgeBuildOptions, ForgeBuildResult } from './build/build.js';
export type {
  ForgeRoleFileClassification,
  ForgeRoleFileKind,
  ForgeRoleSuffix,
} from './core/file-roles.js';
export type { ForgeRouteEntry, ForgeRouteGraph } from './core/routes.js';
export type { ForgeSourceFile } from './core/source-files.js';
export type { ForgeReloadAction, ForgeReloadPlan } from './dev/reload-planner.js';
export type {
  ForgeDevOptions,
  ForgeDevResult,
  ForgeDevServer,
  StartForgeDevServerOptions,
} from './dev/server.js';
export type { ForgeDiagnostic, ForgeDiagnosticSeverity } from './diagnostics/format.js';
export type {
  ForgeHook,
  ForgeHookContext,
  ForgeHookMetadataResult,
  ForgeHookRegistry,
} from './hooks/hooks.js';
