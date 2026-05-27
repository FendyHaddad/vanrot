import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildAiKnowledgeBundle, type AiBundleIndex } from './generator.js';
import { defaultAiBundlePaths } from './paths.js';
import { isAiBundleManifest, type AiBundleManifest } from './schema.js';

export interface AiBundleVerificationResult {
  ok: boolean;
  failures: string[];
}

const requiredBundlePaths = [
  defaultAiBundlePaths.manifest,
  defaultAiBundlePaths.index,
  defaultAiBundlePaths.rules,
  `${defaultAiBundlePaths.knowledge}/packages.md`,
  `${defaultAiBundlePaths.knowledge}/commands.md`,
  `${defaultAiBundlePaths.knowledge}/diagnostics.md`,
  `${defaultAiBundlePaths.knowledge}/generated-files.md`,
  `${defaultAiBundlePaths.knowledge}/conventions.md`,
  `${defaultAiBundlePaths.knowledge}/examples.md`,
  `${defaultAiBundlePaths.knowledge}/public-api.md`,
  `${defaultAiBundlePaths.skill}/SKILL.md`,
  `${defaultAiBundlePaths.skill}/skill.json`,
] as const;

export async function verifyAiKnowledgeBundle(root: string): Promise<AiBundleVerificationResult> {
  const failures: string[] = [];
  const manifest = await readManifest(root, failures);

  await verifyRequiredFiles(root, failures);

  if (manifest === undefined) {
    return { ok: false, failures };
  }

  const index = await readIndex(root, failures);

  if (index !== undefined) {
    checkIndexCounts(manifest, index, failures);
  }

  await checkNonEmptyFile(root, `${defaultAiBundlePaths.skill}/SKILL.md`, failures);
  await checkNonEmptyFile(root, `${defaultAiBundlePaths.skill}/skill.json`, failures);

  const expected = await buildAiKnowledgeBundle(root, {
    now: () => new Date(manifest.generatedAt),
  });

  if (manifest.sourceFingerprint !== expected.manifest.sourceFingerprint) {
    failures.push('docs/ai/manifest.json is stale: sourceFingerprint does not match current sources.');
  }

  if (JSON.stringify(manifest.counts) !== JSON.stringify(expected.manifest.counts)) {
    failures.push('docs/ai/manifest.json is stale: counts do not match current sources.');
  }

  await verifyTextFile(root, defaultAiBundlePaths.index, JSON.stringify(expected.index, null, 2) + '\n', failures);
  await verifyTextFile(root, defaultAiBundlePaths.rules, expected.rules, failures);

  for (const document of expected.documents) {
    await verifyTextFile(
      root,
      `${defaultAiBundlePaths.root}/${document.path}`,
      document.content,
      failures,
    );
  }

  return { ok: failures.length === 0, failures };
}

async function verifyRequiredFiles(root: string, failures: string[]): Promise<void> {
  for (const path of requiredBundlePaths) {
    try {
      await access(join(root, path));
    } catch {
      failures.push(`${path} is missing.`);
    }
  }
}

async function readManifest(
  root: string,
  failures: string[],
): Promise<AiBundleManifest | undefined> {
  let source: string;

  try {
    source = await readFile(join(root, defaultAiBundlePaths.manifest), 'utf8');
  } catch {
    failures.push(`${defaultAiBundlePaths.manifest} is missing.`);
    return undefined;
  }

  let value: unknown;

  try {
    value = JSON.parse(source);
  } catch {
    failures.push(`${defaultAiBundlePaths.manifest} is not valid JSON.`);
    return undefined;
  }

  if (!isAiBundleManifest(value)) {
    failures.push(`${defaultAiBundlePaths.manifest} does not match the AI bundle manifest schema.`);
    return undefined;
  }

  return value;
}

async function readIndex(
  root: string,
  failures: string[],
): Promise<Partial<Record<keyof AiBundleIndex, unknown[]>> | undefined> {
  let source: string;

  try {
    source = await readFile(join(root, defaultAiBundlePaths.index), 'utf8');
  } catch {
    failures.push(`Missing AI bundle file: ${defaultAiBundlePaths.index}`);
    return undefined;
  }

  try {
    return JSON.parse(source) as Partial<Record<keyof AiBundleIndex, unknown[]>>;
  } catch {
    failures.push(`${defaultAiBundlePaths.index} is not valid JSON.`);
    return undefined;
  }
}

function checkIndexCounts(
  manifest: AiBundleManifest,
  index: Partial<Record<keyof AiBundleIndex, unknown[]>>,
  failures: string[],
): void {
  checkIndexCount('commands', manifest.counts.commands, index.commands, failures);
  checkIndexCount('packages', manifest.counts.packages, index.packages, failures);
  checkIndexCount('diagnostics', manifest.counts.diagnostics, index.diagnostics, failures);
  checkIndexCount('examples', manifest.counts.examples, index.examples, failures);
  checkIndexCount('publicExports', manifest.counts.publicExports, index.publicExports, failures);
  checkIndexCount('generatedFiles', manifest.counts.generatedFiles, index.generatedFiles, failures);
  checkIndexCount('conventions', manifest.counts.conventions, index.conventions, failures);
  checkIndexCount('docs', manifest.counts.docs, index.docs, failures);
}

function checkIndexCount(
  name: string,
  expected: number,
  actual: unknown[] | undefined,
  failures: string[],
): void {
  if (!Array.isArray(actual) || actual.length !== expected) {
    failures.push(`AI bundle index is incomplete: ${name} count does not match manifest.`);
  }
}

async function checkNonEmptyFile(root: string, path: string, failures: string[]): Promise<void> {
  try {
    if ((await readFile(join(root, path), 'utf8')).trim() === '') {
      failures.push(`AI Skill.sh package is incomplete: ${path} is empty.`);
    }
  } catch {
    failures.push(`Missing AI bundle file: ${path}`);
  }
}

async function verifyTextFile(
  root: string,
  path: string,
  expected: string,
  failures: string[],
): Promise<void> {
  let actual: string;

  try {
    actual = await readFile(join(root, path), 'utf8');
  } catch {
    failures.push(`${path} is missing.`);
    return;
  }

  if (actual !== expected) {
    failures.push(`${path} is stale.`);
  }
}
