import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AiBundleIndexEntry, AiKnowledgeBundle } from '../bundle/generator.js';

export interface VanrotMcpServer {
  name: string;
  version: string;
  server: McpServer;
}

export const vanrotMcpResourceDefinitions = [
  { name: 'vanrot-docs', uri: 'vanrot://docs', key: 'index' },
  { name: 'vanrot-rules', uri: 'vanrot://patterns', key: 'rules' },
  { name: 'vanrot-packages', uri: 'vanrot://packages', key: 'packages' },
  { name: 'vanrot-public-api', uri: 'vanrot://public-api', key: 'publicExports' },
  { name: 'vanrot-commands', uri: 'vanrot://commands', key: 'commands' },
  { name: 'vanrot-diagnostics', uri: 'vanrot://diagnostics', key: 'diagnostics' },
  { name: 'vanrot-generated-files', uri: 'vanrot://generated-files', key: 'generatedFiles' },
  { name: 'vanrot-conventions', uri: 'vanrot://conventions', key: 'conventions' },
  { name: 'vanrot-components', uri: 'vanrot://components', key: 'components' },
  { name: 'vanrot-routes', uri: 'vanrot://routes', key: 'routes' },
  { name: 'vanrot-examples', uri: 'vanrot://examples', key: 'examples' },
  { name: 'vanrot-limitations', uri: 'vanrot://limitations', key: 'limitations' },
  { name: 'vanrot-deployment', uri: 'vanrot://deployment', key: 'deployment' },
  { name: 'vanrot-guide-docs', uri: 'vanrot://guide-docs', key: 'docs' },
] as const;

export function createVanrotMcpServer(bundle: AiKnowledgeBundle): VanrotMcpServer {
  const server = new McpServer({
    name: 'vanrot',
    version: bundle.manifest.vanrotVersion,
  });

  for (const resource of vanrotMcpResourceDefinitions) {
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
  key: (typeof vanrotMcpResourceDefinitions)[number]['key'],
): string {
  if (key === 'rules') {
    return bundle.rules;
  }

  if (key === 'index') {
    return JSON.stringify(bundle.index, null, 2);
  }

  return JSON.stringify(bundle.index[key], null, 2);
}

function searchBundle(bundle: AiKnowledgeBundle, query: string): string {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 0);
  const matches = searchableEntries(bundle).filter((entry) => {
    const searchableText = `${entry.title} ${entry.summary} ${entry.docsPath ?? ''}`.toLowerCase();

    return queryTerms.every((term) => searchableText.includes(term));
  });

  if (matches.length === 0) {
    return 'No Vanrot knowledge entries matched the query.';
  }

  return matches
    .map((entry) => `${entry.title}: ${entry.summary}${entry.docsPath ? ` (${entry.docsPath})` : ''}`)
    .join('\n');
}

function searchableEntries(bundle: AiKnowledgeBundle): AiBundleIndexEntry[] {
  return Object.values(bundle.index).flat();
}
