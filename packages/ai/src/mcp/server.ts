import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AiBundleIndexEntry, AiKnowledgeBundle } from '../bundle/generator.js';

export interface VanrotMcpServer {
  name: string;
  version: string;
  server: McpServer;
}

const resourceDefinitions = [
  { name: 'vanrot-docs', uri: 'vanrot://docs', key: 'index' },
  { name: 'vanrot-rules', uri: 'vanrot://patterns', key: 'rules' },
  { name: 'vanrot-commands', uri: 'vanrot://commands', key: 'commands' },
  { name: 'vanrot-diagnostics', uri: 'vanrot://diagnostics', key: 'diagnostics' },
  { name: 'vanrot-examples', uri: 'vanrot://examples', key: 'examples' },
] as const;

export function createVanrotMcpServer(bundle: AiKnowledgeBundle): VanrotMcpServer {
  const server = new McpServer({
    name: 'vanrot',
    version: bundle.manifest.vanrotVersion,
  });

  for (const resource of resourceDefinitions) {
    registerTextResource(
      server,
      resource.name,
      resource.uri,
      resourceText(bundle, resource.key),
    );
  }

  server.registerTool(
    'search_vanrot_knowledge',
    {
      description: 'Search the official Vanrot AI knowledge bundle.',
      inputSchema: z.object({ query: z.string().min(1) }),
    },
    async ({ query }) => ({
      content: [{ type: 'text', text: searchBundle(bundle, query) }],
    }),
  );

  return { name: 'vanrot', version: bundle.manifest.vanrotVersion, server };
}

function registerTextResource(server: McpServer, name: string, uri: string, text: string): void {
  server.registerResource(
    name,
    uri,
    {
      title: name,
      description: `Official Vanrot ${name} resource.`,
      mimeType: 'text/plain',
    },
    async (resourceUri) => ({
      contents: [{ uri: resourceUri.href, text }],
    }),
  );
}

function resourceText(
  bundle: AiKnowledgeBundle,
  key: (typeof resourceDefinitions)[number]['key'],
): string {
  if (key === 'rules') {
    return bundle.rules;
  }

  if (key === 'commands') {
    return JSON.stringify(bundle.index.commands, null, 2);
  }

  if (key === 'diagnostics') {
    return JSON.stringify(bundle.index.diagnostics, null, 2);
  }

  if (key === 'examples') {
    return JSON.stringify(bundle.index.examples, null, 2);
  }

  return JSON.stringify(bundle.index, null, 2);
}

function searchBundle(bundle: AiKnowledgeBundle, query: string): string {
  const lowerQuery = query.toLowerCase();
  const matches = searchableEntries(bundle).filter((entry) =>
    `${entry.title} ${entry.summary}`.toLowerCase().includes(lowerQuery),
  );

  if (matches.length === 0) {
    return 'No Vanrot knowledge entries matched the query.';
  }

  return matches.map((entry) => `${entry.title}: ${entry.summary}`).join('\n');
}

function searchableEntries(bundle: AiKnowledgeBundle): AiBundleIndexEntry[] {
  return [
    ...bundle.index.commands,
    ...bundle.index.diagnostics,
    ...bundle.index.packages,
    ...bundle.index.conventions,
    ...bundle.index.examples,
  ];
}
