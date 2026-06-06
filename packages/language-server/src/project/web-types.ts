import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const webTypesPaths = [
  'web-types.json',
  'apps/vanrot-site/web-types.json',
  'packages/ui/web-types.json',
  'packages/router/web-types.json',
] as const;

export interface VanrotWebTypesSource {
  path: string;
  name: string | null;
}

export interface VanrotWebTypesTag {
  name: string;
  description: string | null;
  sourcePath: string;
}

export interface VanrotWebTypesAttribute {
  name: string;
  description: string | null;
  sourcePath: string;
}

export interface VanrotWebTypesSummary {
  sources: VanrotWebTypesSource[];
  tags: VanrotWebTypesTag[];
  attributes: VanrotWebTypesAttribute[];
}

interface RawWebTypes {
  name?: unknown;
  contributions?: {
    html?: {
      tags?: RawWebTypesContribution[];
      elements?: RawWebTypesContribution[];
      attributes?: RawWebTypesContribution[];
    };
  };
}

interface RawWebTypesContribution {
  name?: unknown;
  description?: unknown;
}

export function loadVanrotWebTypes(projectRoot: string | null): VanrotWebTypesSummary {
  if (projectRoot === null) {
    return emptyVanrotWebTypes();
  }

  const summary = emptyVanrotWebTypes();

  for (const relativePath of webTypesPaths) {
    const absolutePath = join(projectRoot, relativePath);

    if (!existsSync(absolutePath)) {
      continue;
    }

    const parsed = readWebTypesFile(absolutePath);
    summary.sources.push({ path: relativePath, name: stringOrNull(parsed.name) });
    summary.tags.push(...readContributions(parsed.contributions?.html?.tags, relativePath));
    summary.tags.push(...readContributions(parsed.contributions?.html?.elements, relativePath));
    summary.attributes.push(...readContributions(parsed.contributions?.html?.attributes, relativePath));
  }

  return summary;
}

export function emptyVanrotWebTypes(): VanrotWebTypesSummary {
  return { sources: [], tags: [], attributes: [] };
}

function readWebTypesFile(path: string): RawWebTypes {
  return JSON.parse(readFileSync(path, 'utf8')) as RawWebTypes;
}

function readContributions(
  contributions: readonly RawWebTypesContribution[] | undefined,
  sourcePath: string,
): Array<VanrotWebTypesTag & VanrotWebTypesAttribute> {
  return (contributions ?? []).flatMap((contribution) => {
    if (typeof contribution.name !== 'string') {
      return [];
    }

    return [
      {
        name: contribution.name,
        description: stringOrNull(contribution.description),
        sourcePath,
      },
    ];
  });
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
