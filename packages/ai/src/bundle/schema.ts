export const aiBundleSchemaVersion = 1;

export type AiBundleCoverageStatus = 'complete' | 'incomplete';

export interface AiBundleSourceFingerprint {
  id: string;
  path: string;
  fingerprint: string;
}

export interface AiBundleCounts {
  packages: number;
  publicExports: number;
  commands: number;
  diagnostics: number;
  generatedFiles: number;
  conventions: number;
  examples: number;
  components: number;
  routes: number;
  limitations: number;
  deployment: number;
  docs: number;
}

export interface AiBundleManifest {
  schemaVersion: typeof aiBundleSchemaVersion;
  vanrotVersion: string;
  generatedAt: string;
  sourceFingerprint: string;
  sources: AiBundleSourceFingerprint[];
  counts: AiBundleCounts;
  coverageStatus: AiBundleCoverageStatus;
}

export interface CreateAiBundleManifestOptions {
  vanrotVersion: string;
  generatedAt: string;
  sourceFingerprint: string;
  sources: AiBundleSourceFingerprint[];
  counts: AiBundleCounts;
}

export function createAiBundleManifest(
  options: CreateAiBundleManifestOptions,
): AiBundleManifest {
  return {
    schemaVersion: aiBundleSchemaVersion,
    vanrotVersion: options.vanrotVersion,
    generatedAt: options.generatedAt,
    sourceFingerprint: options.sourceFingerprint,
    sources: options.sources,
    counts: options.counts,
    coverageStatus: 'complete',
  };
}

export function isAiBundleManifest(value: unknown): value is AiBundleManifest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const manifest = value as Partial<AiBundleManifest>;

  return (
    manifest.schemaVersion === aiBundleSchemaVersion &&
    typeof manifest.vanrotVersion === 'string' &&
    typeof manifest.generatedAt === 'string' &&
    typeof manifest.sourceFingerprint === 'string' &&
    Array.isArray(manifest.sources) &&
    typeof manifest.counts === 'object' &&
    manifest.counts !== null &&
    (manifest.coverageStatus === 'complete' || manifest.coverageStatus === 'incomplete')
  );
}
