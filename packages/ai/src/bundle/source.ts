import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AiBundleSourceFingerprint } from './schema.js';

export interface ReferenceRecord {
  readonly [key: string]: unknown;
}

export interface FrameworkReferenceSource {
  packages: ReferenceRecord[];
  publicExports: ReferenceRecord[];
  commands: ReferenceRecord[];
  diagnostics: ReferenceRecord[];
  generatedFiles: ReferenceRecord[];
  conventions: ReferenceRecord[];
  examples: ReferenceRecord[];
  limitations: ReferenceRecord[];
  maturity: ReferenceRecord[];
  routeMetadata: ReferenceRecord[];
  deployment: ReferenceRecord[];
}

export interface SiteDataSource {
  articles: ReferenceRecord[];
  primitiveDocs: ReferenceRecord[];
  commands: ReferenceRecord[];
  packages: ReferenceRecord[];
  diagnostics: Record<string, ReferenceRecord[]>;
}

export interface AiKnowledgeSource {
  root: string;
  vanrotVersion: string;
  frameworkReference: FrameworkReferenceSource;
  siteData: SiteDataSource;
  sourceFingerprint: string;
  sources: AiBundleSourceFingerprint[];
}

const frameworkReferencePath = 'apps/vanrot-site/src/docs/framework-reference.json';
const siteDataPath = 'apps/vanrot-site/src/docs/site-data.json';
const fingerprintOnlyPaths = [
  { id: 'cli-command-metadata', path: 'packages/cli/src/commands/metadata.ts' },
  { id: 'feature-maturity', path: 'docs/superpowers/feature-maturity.md' },
  { id: 'final-tdd-inventory', path: 'docs/superpowers/final-tdd-inventory.md' },
] as const;

export async function readAiKnowledgeSource(root: string): Promise<AiKnowledgeSource> {
  const packagePath = join(root, 'package.json');
  const frameworkReferenceAbsolutePath = join(root, frameworkReferencePath);
  const siteDataAbsolutePath = join(root, siteDataPath);
  const packageJson = (await readJsonFile(packagePath)) as { version?: string };
  const frameworkReference = (await readJsonFile(
    frameworkReferenceAbsolutePath,
  )) as FrameworkReferenceSource;
  const siteData = (await readJsonFile(siteDataAbsolutePath)) as SiteDataSource;
  const files = [
    { id: 'package-json', path: 'package.json', absolutePath: packagePath },
    {
      id: 'framework-reference',
      path: frameworkReferencePath,
      absolutePath: frameworkReferenceAbsolutePath,
    },
    { id: 'site-data', path: siteDataPath, absolutePath: siteDataAbsolutePath },
    ...fingerprintOnlyPaths.map((file) => ({
      id: file.id,
      path: file.path,
      absolutePath: join(root, file.path),
    })),
  ];
  const sources = await Promise.all(
    files.map(async (file) => ({
      id: file.id,
      path: file.path,
      fingerprint: await fingerprintFile(file.absolutePath),
    })),
  );

  return {
    root,
    vanrotVersion: packageJson.version ?? '0.0.0',
    frameworkReference,
    siteData,
    sourceFingerprint: fingerprintText(
      sources.map((source) => `${source.id}:${source.fingerprint}`).join('\n'),
    ),
    sources,
  };
}

export async function readJsonFile(path: string): Promise<unknown> {
  let source: string;

  try {
    source = await readFile(path, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read JSON file ${path}: ${errorMessage(error)}`);
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Unable to parse JSON file ${path}: ${errorMessage(error)}`);
  }
}

function fingerprintText(source: string): string {
  return `sha256-${createHash('sha256').update(source).digest('hex')}`;
}

async function fingerprintFile(path: string): Promise<string> {
  return fingerprintText(await readFile(path, 'utf8'));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
