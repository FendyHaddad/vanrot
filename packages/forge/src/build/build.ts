import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { compileComponentFromFiles, type CompileDiagnostic } from '@vanrot/compiler';
import { createForgeAppGraph, type ForgeRoleFile } from '../core/app-graph.js';
import { forgeDiagnosticCode } from '../diagnostics/codes.js';
import { formatForgeDiagnostic, type ForgeDiagnostic } from '../diagnostics/format.js';

export interface ForgeBuildResult {
  exitCode: number;
  outDir: string;
}

export interface ForgeBuildOptions {
  cwd: string;
  outDir?: string;
  reporter?: ForgeDiagnosticReporter;
}

export interface ForgeDiagnosticReporter {
  error(message: string): void;
  success?(label: string, detail?: string): void;
  warning?(filePath: string, message: string): void;
}

interface ForgeCompiledAssetSet {
  js: string;
  css: string;
  diagnostics: ForgeDiagnostic[];
}

const defaultBuildOutputDirectory = 'dist';
const browserScriptPath = 'assets/vanrot-app.js';
const browserStylePath = 'assets/vanrot-app.css';
const routeManifestPath = 'vanrot-routes.json';
const assetManifestPath = 'vanrot-assets.json';
const diagnosticsSummaryPath = 'vanrot-diagnostics.txt';

export async function runForgeBuild(options: ForgeBuildOptions): Promise<ForgeBuildResult> {
  const outDir = join(options.cwd, options.outDir ?? defaultBuildOutputDirectory);
  const graph = await createForgeAppGraph(options.cwd);
  const compiled = await compileForgeBuildAssets(options.cwd, graph.roleFiles);
  const diagnostics = [...graph.diagnostics, ...compiled.diagnostics];

  await rm(outDir, { recursive: true, force: true });
  await mkdir(join(outDir, 'assets'), { recursive: true });
  await writeFile(join(outDir, 'index.html'), renderStaticIndex());
  await writeFile(join(outDir, browserScriptPath), compiled.js);
  await writeFile(join(outDir, browserStylePath), compiled.css);
  await writeFile(join(outDir, routeManifestPath), `${JSON.stringify(graph.routes, null, 2)}\n`);
  await writeFile(join(outDir, assetManifestPath), `${JSON.stringify(createAssetManifest(), null, 2)}\n`);

  if (diagnostics.length > 0) {
    await writeFile(
      join(outDir, diagnosticsSummaryPath),
      `${diagnostics.map(formatForgeDiagnostic).join('\n\n')}\n`,
    );
  }

  for (const diagnostic of diagnostics) {
    if (diagnostic.severity === 'error') {
      options.reporter?.error(formatForgeDiagnostic(diagnostic));
    }
  }

  options.reporter?.success?.('Forge build output', outDir);

  return {
    exitCode: diagnostics.some((diagnostic) => diagnostic.severity === 'error') ? 1 : 0,
    outDir,
  };
}

async function compileForgeBuildAssets(
  cwd: string,
  roleFiles: readonly ForgeRoleFile[],
): Promise<ForgeCompiledAssetSet> {
  const js: string[] = [];
  const css: string[] = [];
  const diagnostics: ForgeDiagnostic[] = [];

  for (const roleFile of roleFiles) {
    if (!canCompileRole(roleFile)) {
      diagnostics.push({
        code: forgeDiagnosticCode.unsupportedFileRole,
        severity: 'warning',
        message: `Forge build cannot compile .${roleFile.role}.ts files yet.`,
        filePath: roleFile.path,
        role: roleFile.role,
        suggestion: 'Use .component.ts, .page.ts, or .layout.ts for the current Forge build MVP.',
        docsPath: '/docs/forge/build',
      });
      continue;
    }

    const result = await compileComponentFromFiles(join(cwd, roleFile.path));
    js.push(`// ${roleFile.path}\n${result.js}`);
    css.push(`/* ${roleFile.path} */\n${result.css}`);
    diagnostics.push(...result.diagnostics.map((diagnostic) => toForgeCompileDiagnostic(cwd, diagnostic)));
  }

  return {
    js: `${js.join('\n\n')}\n`,
    css: `${css.join('\n\n')}\n`,
    diagnostics,
  };
}

function canCompileRole(roleFile: ForgeRoleFile): boolean {
  return roleFile.role === 'component' || roleFile.role === 'page' || roleFile.role === 'layout';
}

function toForgeCompileDiagnostic(cwd: string, diagnostic: CompileDiagnostic): ForgeDiagnostic {
  const forgeDiagnostic: ForgeDiagnostic = {
    code: forgeDiagnosticCode.compileDiagnostic,
    severity: diagnostic.severity,
    message: diagnostic.message,
    suggestion: 'Fix the Vanrot compiler diagnostic before building with Forge.',
    docsPath: '/docs/forge/build',
  };

  if (diagnostic.filePath !== undefined) {
    forgeDiagnostic.filePath = toPosixPath(relative(cwd, diagnostic.filePath));
  }

  return forgeDiagnostic;
}

function renderStaticIndex(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vanrot Forge</title>
    <link rel="stylesheet" href="/${browserStylePath}">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/${browserScriptPath}"></script>
  </body>
</html>
`;
}

function createAssetManifest(): { assets: Array<{ path: string; kind: string }> } {
  return {
    assets: [
      { path: 'index.html', kind: 'html' },
      { path: browserScriptPath, kind: 'js' },
      { path: browserStylePath, kind: 'css' },
      { path: routeManifestPath, kind: 'manifest' },
    ],
  };
}

function toPosixPath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}
