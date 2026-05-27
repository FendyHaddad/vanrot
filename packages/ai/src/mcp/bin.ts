#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { buildAiKnowledgeBundle } from '../bundle/generator.js';
import { createVanrotMcpServer } from './server.js';

const bundle = await buildAiKnowledgeBundle(process.cwd());
const { server } = createVanrotMcpServer(bundle);
const transport = new StdioServerTransport();

await server.connect(transport);
console.error('Vanrot MCP server running on stdio');
