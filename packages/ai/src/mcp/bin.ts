#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { buildAiKnowledgeBundle, type AiKnowledgeBundle } from '../bundle/generator.js';
import { createVanrotMcpServer } from './server.js';

const bundle = await loadAiKnowledgeBundle();
const { server } = createVanrotMcpServer(bundle);
const transport = new StdioServerTransport();

await server.connect(transport);
console.error('Vanrot MCP server running on stdio');

async function loadAiKnowledgeBundle(): Promise<AiKnowledgeBundle> {
  const bakedBundlePath = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    'knowledge-bundle.json',
  );

  try {
    return JSON.parse(await readFile(bakedBundlePath, 'utf8')) as AiKnowledgeBundle;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  return buildAiKnowledgeBundle(process.cwd());
}
