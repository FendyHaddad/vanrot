const PUBLIC_SOURCE_PREFIX = 'virtual:vanrot-source:';
const PUBLIC_CSS_PREFIX = 'virtual:vanrot-css:';
const RESOLVED_SOURCE_PREFIX = '\0vanrot:source:';
const RESOLVED_CSS_PREFIX = '\0vanrot:css:';
const RESOLVED_CSS_SUFFIX = '.css';

export type VanrotVirtualModuleKind = 'source' | 'css';

export interface DecodedVirtualModuleId {
  kind: VanrotVirtualModuleKind;
  filePath: string;
}

export function toPublicSourceModuleId(filePath: string): string {
  return `${PUBLIC_SOURCE_PREFIX}${encodeURIComponent(filePath)}`;
}

export function toPublicCssModuleId(filePath: string): string {
  return `${PUBLIC_CSS_PREFIX}${encodeURIComponent(filePath)}`;
}

export function toResolvedVirtualModuleId(id: string): string | undefined {
  if (id.startsWith(PUBLIC_SOURCE_PREFIX)) {
    return `${RESOLVED_SOURCE_PREFIX}${id.slice(PUBLIC_SOURCE_PREFIX.length)}`;
  }

  if (id.startsWith(PUBLIC_CSS_PREFIX)) {
    return `${RESOLVED_CSS_PREFIX}${id.slice(PUBLIC_CSS_PREFIX.length)}${RESOLVED_CSS_SUFFIX}`;
  }

  return undefined;
}

export function isPublicVanrotVirtualModuleId(id: string): boolean {
  return id.startsWith(PUBLIC_SOURCE_PREFIX) || id.startsWith(PUBLIC_CSS_PREFIX);
}

export function decodeVirtualModuleId(id: string): DecodedVirtualModuleId | undefined {
  if (id.startsWith(RESOLVED_SOURCE_PREFIX)) {
    return {
      kind: 'source',
      filePath: decodeURIComponent(id.slice(RESOLVED_SOURCE_PREFIX.length)),
    };
  }

  if (id.startsWith(RESOLVED_CSS_PREFIX)) {
    const encodedPath = id.slice(RESOLVED_CSS_PREFIX.length);

    if (!encodedPath.endsWith(RESOLVED_CSS_SUFFIX)) {
      return undefined;
    }

    return {
      kind: 'css',
      filePath: decodeURIComponent(encodedPath.slice(0, -RESOLVED_CSS_SUFFIX.length)),
    };
  }

  return undefined;
}
