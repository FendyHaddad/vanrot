import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { transformWithOxc, type Plugin, type ResolvedConfig } from 'vite';
import { compileForVite, type ViteCompileResult } from './compile-for-vite.js';
import { isComponentEntry, resolveComponentFiles } from './component-files.js';
import { formatDiagnostic } from './diagnostics.js';
import { handleVanrotHotUpdate } from './hot-update.js';
import { createViteSourceMap } from './source-maps.js';
import {
  decodeVirtualModuleId,
  isPublicVanrotVirtualModuleId,
  toResolvedVirtualModuleId,
} from './virtual-modules.js';
import {
  normalizeOptions,
  type NormalizedVanrotPluginOptions,
  type VanrotPluginOptions,
} from './options.js';

interface VanrotPluginInternals {
  compile?: (componentPath: string) => Promise<ViteCompileResult>;
  initialCss?: Map<string, string>;
  readSource?: (filePath: string) => Promise<string>;
}

export function vanrot(options: VanrotPluginOptions = {}): Plugin {
  return createVanrotPlugin(options);
}

export function createVanrotPluginForTests(internals: VanrotPluginInternals = {}): Plugin {
  return createVanrotPlugin({}, internals);
}

function createVanrotPlugin(
  options: VanrotPluginOptions,
  internals: VanrotPluginInternals = {},
): Plugin {
  let normalizedOptions = normalizeOptions(options);
  let resolvedConfig: ResolvedConfig | undefined;
  const cssByComponentPath = internals.initialCss ?? new Map<string, string>();
  const cssMapByComponentPath = new Map<string, ViteCompileResult['cssMap']>();
  const readSource = internals.readSource ?? ((filePath: string) => readFile(filePath, 'utf8'));
  const compile = internals.compile ?? compileForVite;

  return {
    name: 'vanrot',
    enforce: 'pre',
    configResolved(config: ResolvedConfig) {
      resolvedConfig = config;
      normalizedOptions = normalizeOptions(options, config.root);
    },
    async resolveId(source, importer) {
      const virtualImport = resolveVirtualSourceImport(source, importer);

      if (virtualImport !== undefined) {
        return virtualImport;
      }

      if (!isPublicVanrotVirtualModuleId(source)) {
        return undefined;
      }

      return toResolvedVirtualModuleId(source);
    },
    async load(id) {
      const decoded = decodeVirtualModuleId(id);

      if (decoded === undefined) {
        return undefined;
      }

      if (decoded.kind === 'css') {
        return {
          code: cssByComponentPath.get(decoded.filePath) ?? '',
          map: cssMapByComponentPath.get(decoded.filePath) ?? null,
        };
      }

      return readSource(decoded.filePath);
    },
    async transform(_code, id) {
      const decoded = decodeVirtualModuleId(id);

      if (decoded?.kind === 'source') {
        const result = await transformWithOxc(
          _code,
          decoded.filePath,
          undefined,
          undefined,
          resolvedConfig,
        );

        return {
          code: result.code,
          map: result.map ?? null,
        };
      }

      if (!shouldTransform(id, normalizedOptions)) {
        return undefined;
      }

      const files = resolveComponentFiles(id);
      this.addWatchFile(files.templatePath);
      this.addWatchFile(files.stylePath);

      const result = await compile(files.componentPath);

      for (const diagnostic of result.diagnostics) {
        const message = formatDiagnostic(diagnostic);

        if (diagnostic.severity === 'error') {
          this.error(message);
          continue;
        }

        this.warn(message);
      }

      cssByComponentPath.set(files.componentPath, result.css);
      cssMapByComponentPath.set(files.componentPath, result.cssMap);

      return {
        code: result.code,
        map: result.map,
      };
    },
    handleHotUpdate(ctx) {
      return handleVanrotHotUpdate(ctx);
    },
    generateBundle(_options, bundle) {
      if (!resolvedConfig?.build.sourcemap) {
        return;
      }

      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type !== 'asset' || !fileName.endsWith('.css')) {
          continue;
        }

        if (bundle[`${fileName}.map`] !== undefined) {
          continue;
        }

        const cssSource = stringifyAssetSource(asset.source);
        const map = createCssBundleMap(fileName, cssSource, cssMapByComponentPath);

        if (map.sources.length === 0) {
          continue;
        }

        const mapFileName = `${fileName}.map`;
        asset.source = `${cssSource}\n/*# sourceMappingURL=${basename(mapFileName)} */`;
        this.emitFile({
          type: 'asset',
          fileName: mapFileName,
          source: JSON.stringify(map),
        });
      }
    },
  };
}

function stringifyAssetSource(source: string | Uint8Array): string {
  if (typeof source === 'string') {
    return source;
  }

  return Buffer.from(source).toString('utf8');
}

function createCssBundleMap(
  fileName: string,
  cssSource: string,
  cssMapByComponentPath: Map<string, ViteCompileResult['cssMap']>,
): ViteCompileResult['cssMap'] {
  const sourceFilePaths = [...new Set([...cssMapByComponentPath.values()].flatMap((map) => map.sources))];

  return createViteSourceMap({
    file: fileName,
    source: 'css',
    generatedCode: cssSource,
    mappings: sourceFilePaths.map((sourceFilePath) => ({
      generatedFile: 'css',
      generatedLine: 1,
      generatedColumn: 0,
      sourceFilePath,
      sourceLine: 1,
      sourceColumn: 0,
    })),
  });
}

function resolveVirtualSourceImport(source: string, importer: string | undefined): string | undefined {
  if (importer === undefined || !source.startsWith('.')) {
    return undefined;
  }

  const decoded = decodeVirtualModuleId(importer);

  if (decoded?.kind !== 'source') {
    return undefined;
  }

  return resolve(dirname(decoded.filePath), source);
}

function shouldTransform(id: string, options: NormalizedVanrotPluginOptions): boolean {
  if (!isComponentEntry(id)) {
    return false;
  }

  if (matchesAny(options.exclude, id)) {
    return false;
  }

  return matchesAny(options.include, id);
}

function matchesAny(patterns: RegExp[], value: string): boolean {
  return patterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(value);
  });
}
