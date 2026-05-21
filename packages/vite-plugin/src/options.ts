export interface VanrotPluginOptions {
  include?: RegExp | RegExp[];
  exclude?: RegExp | RegExp[];
  root?: string;
}

export interface NormalizedVanrotPluginOptions {
  include: RegExp[];
  exclude: RegExp[];
  root: string;
}

const defaultInclude = /\.(?:component|page|button)\.ts(?:\?.*)?$/;

export function normalizeOptions(
  options: VanrotPluginOptions = {},
  fallbackRoot = process.cwd(),
): NormalizedVanrotPluginOptions {
  return {
    include: normalizePatterns(options.include, [defaultInclude]),
    exclude: normalizePatterns(options.exclude, []),
    root: options.root ?? fallbackRoot,
  };
}

function normalizePatterns(value: RegExp | RegExp[] | undefined, fallback: RegExp[]): RegExp[] {
  if (value === undefined) {
    return fallback;
  }

  return Array.isArray(value) ? value : [value];
}
