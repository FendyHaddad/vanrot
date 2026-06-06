import type { CompileOptions } from '@vanrot/compiler';

export type ChildComponentImportMap = NonNullable<CompileOptions['childComponentImportMap']>;

export interface VanrotPluginOptions {
  include?: RegExp | RegExp[];
  exclude?: RegExp | RegExp[];
  root?: string;
  sourceRoot?: string;
  childComponentImportMap?: ChildComponentImportMap;
}

export interface NormalizedVanrotPluginOptions {
  include: RegExp[];
  exclude: RegExp[];
  root: string;
  sourceRoot: string;
  childComponentImportMap: ChildComponentImportMap;
}

function defaultInclude(sourceRoot: string): RegExp {
  return new RegExp(
    `(?:^|/)${escapeRegExp(sourceRoot)}/.*\\.(?:component|page|layout|button)\\.ts(?:\\?.*)?$`,
  );
}

export function normalizeOptions(
  options: VanrotPluginOptions = {},
  fallbackRoot = process.cwd(),
): NormalizedVanrotPluginOptions {
  const sourceRoot = options.sourceRoot ?? 'src';

  return {
    include: normalizePatterns(options.include, [defaultInclude(sourceRoot)]),
    exclude: normalizePatterns(options.exclude, []),
    root: options.root ?? fallbackRoot,
    sourceRoot,
    childComponentImportMap: options.childComponentImportMap ?? {},
  };
}

function normalizePatterns(value: RegExp | RegExp[] | undefined, fallback: RegExp[]): RegExp[] {
  if (value === undefined) {
    return fallback;
  }

  return Array.isArray(value) ? value : [value];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
