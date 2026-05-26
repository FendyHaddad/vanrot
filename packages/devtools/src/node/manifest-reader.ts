import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { normalizeGraphManifest, type NormalizedGraphManifest } from '../index.js';
import { computeProjectSourceFingerprint } from './source-fingerprint.js';

export async function readProjectGraphManifest(cwd: string): Promise<NormalizedGraphManifest> {
  const manifestPath = join(cwd, '.vanrot', 'project-map.json');

  try {
    const raw = await readFile(manifestPath, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    const normalized = normalizeGraphManifest(parsed);

    if (normalized.manifest === null) {
      return normalized;
    }

    const currentFingerprint = await computeProjectSourceFingerprint(cwd);
    if (currentFingerprint === normalized.manifest.sourceFingerprint) {
      return normalized;
    }

    return {
      status: 'stale',
      manifest: {
        ...normalized.manifest,
        stale: {
          value: true,
          reasons: ['Source files changed since vr map generated .vanrot/project-map.json'],
        },
      },
      warnings: ['Source files changed since vr map generated .vanrot/project-map.json'],
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return {
        status: 'missing',
        manifest: null,
        warnings: ['Missing .vanrot/project-map.json. Run vr map.'],
      };
    }

    return {
      status: 'unreadable',
      manifest: null,
      warnings: ['Could not read .vanrot/project-map.json. Regenerate it with vr map.'],
    };
  }
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}
