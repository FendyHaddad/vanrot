export interface VanrotPluginOptions {
  include?: RegExp | RegExp[];
  exclude?: RegExp | RegExp[];
  root?: string;
  sourceRoot?: string;
}

export interface NormalizedVanrotPluginOptions {
  include: RegExp[];
  exclude: RegExp[];
  root: string;
  sourceRoot: string;
}

function defaultInclude(sourceRoot: string): RegExp {
  return new RegExp(
    `(?:^|/)${escapeRegExp(sourceRoot)}/.*\\.(?:component|page|button)\\.ts(?:\\?.*)?$`,
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
