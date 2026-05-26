import {
  projectMapGraphSchemaVersion,
  type NormalizedGraphManifest,
  type ProjectGraphManifest,
} from './types.js';

export function normalizeGraphManifest(value: unknown): NormalizedGraphManifest {
  if (!isRecord(value)) {
    return { status: 'unreadable', manifest: null, warnings: ['Graph manifest is not an object'] };
  }

  const schemaVersion = value.schemaVersion;
  if (schemaVersion !== projectMapGraphSchemaVersion) {
    return {
      status: 'unsupported-schema',
      manifest: null,
      warnings: [`Unsupported graph manifest schema: ${String(schemaVersion)}`],
    };
  }

  const manifest = value as unknown as ProjectGraphManifest;
  if (manifest.stale.value) {
    return { status: 'stale', manifest, warnings: manifest.stale.reasons };
  }

  return { status: 'ready', manifest, warnings: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
