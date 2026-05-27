import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildAiKnowledgeBundle, type BuildAiKnowledgeBundleOptions } from './generator.js';
import { defaultAiBundlePaths } from './paths.js';
import { createSkillPackageFiles } from '../skill/generator.js';

export interface WriteAiKnowledgeBundleOptions extends BuildAiKnowledgeBundleOptions {
  clean?: boolean;
}

export async function writeAiKnowledgeBundle(
  root: string,
  options: WriteAiKnowledgeBundleOptions = {},
): Promise<string> {
  const bundle = await buildAiKnowledgeBundle(root, options);
  const outputRoot = join(root, defaultAiBundlePaths.root);
  const knowledgeRoot = join(root, defaultAiBundlePaths.knowledge);

  if (options.clean !== false) {
    await rm(outputRoot, { recursive: true, force: true });
  }

  await mkdir(knowledgeRoot, { recursive: true });
  await writeFile(join(root, defaultAiBundlePaths.manifest), json(bundle.manifest));
  await writeFile(join(root, defaultAiBundlePaths.index), json(bundle.index));
  await writeFile(join(root, defaultAiBundlePaths.rules), bundle.rules);

  for (const document of bundle.documents) {
    await writeFile(join(outputRoot, document.path), document.content);
  }

  await mkdir(join(outputRoot, 'skill'), { recursive: true });
  for (const file of createSkillPackageFiles({
    vanrotVersion: bundle.manifest.vanrotVersion,
    schemaVersion: bundle.manifest.schemaVersion,
    manifestPath: defaultAiBundlePaths.manifest,
    rulesPath: defaultAiBundlePaths.rules,
  })) {
    await writeFile(join(outputRoot, file.path), file.content);
  }

  return defaultAiBundlePaths.root;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
