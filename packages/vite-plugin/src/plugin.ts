import { readFile } from 'node:fs/promises';
import { transformWithOxc, type Plugin, type ResolvedConfig } from 'vite';
import { compileForVite, type ViteCompileResult } from './compile-for-vite.js';
import { isComponentEntry, resolveComponentFiles } from './component-files.js';
import { formatDiagnostic } from './diagnostics.js';
import { handleVanrotHotUpdate } from './hot-update.js';
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
  const readSource = internals.readSource ?? ((filePath: string) => readFile(filePath, 'utf8'));
  const compile = internals.compile ?? compileForVite;

  return {
    name: 'vanrot',
    enforce: 'pre',
    configResolved(config: ResolvedConfig) {
      resolvedConfig = config;
      normalizedOptions = normalizeOptions(options, config.root);
    },
    async resolveId(source) {
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
        return cssByComponentPath.get(decoded.filePath) ?? '';
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

      return {
        code: result.code,
        map: null,
      };
    },
    handleHotUpdate(ctx) {
      return handleVanrotHotUpdate(ctx);
    },
  };
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
