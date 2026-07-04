import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAiKnowledgeBundle } from '../packages/ai/dist/bundle/generator.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = join(repoRoot, 'packages/ai/dist/knowledge-bundle.json');

const bundle = await buildAiKnowledgeBundle(repoRoot);
await writeFile(outputPath, `${JSON.stringify(bundle)}\n`);

console.log(`Baked Vanrot AI knowledge bundle: ${outputPath}`);
