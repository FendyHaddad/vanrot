import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createConnection } from 'vscode-languageserver/node.js';
import {
  CompletionRequest,
  DidOpenTextDocumentNotification,
  InitializeRequest,
  StreamMessageReader,
  StreamMessageWriter,
  createProtocolConnection,
} from 'vscode-languageserver-protocol/node.js';
import { startLanguageServer } from '../src/server.js';

describe('completion handler', () => {
  it('returns vr elements for a tag-name position', async () => {
    const client = createTestClient();

    await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri: 'file:///app/x.component.html', languageId: 'html', version: 1, text: '<' },
    });

    const result = await client.sendRequest(CompletionRequest.type, {
      textDocument: { uri: 'file:///app/x.component.html' },
      position: { line: 0, character: 1 },
    });
    const items = Array.isArray(result) ? result : (result?.items ?? []);

    expect(items.some((item) => item.label === 'vr')).toBe(true);
    client.dispose();
  });

  it('returns project routes and component tags from the workspace index', async () => {
    const root = mkdtempSync(join(tmpdir(), 'vanrot-lsp-'));
    const sourceRoot = join(root, 'src');
    mkdirSync(sourceRoot, { recursive: true });
    writeFileSync(
      join(sourceRoot, 'routes.ts'),
      [
        "import { defineRoutes } from '@vanrot/router';",
        'const home = {}; const docs = {};',
        'export const route = defineRoutes({ home, docs });',
      ].join('\n'),
    );
    writeFileSync(join(sourceRoot, 'user-card.component.ts'), 'export class UserCardComponent {}');

    const client = createTestClient();
    await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: pathToFileURL(root).href,
      capabilities: {},
    });

    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri: 'file:///app/route.component.html', languageId: 'html', version: 1, text: '<vr route.' },
    });
    const routeResult = await client.sendRequest(CompletionRequest.type, {
      textDocument: { uri: 'file:///app/route.component.html' },
      position: { line: 0, character: 10 },
    });
    const routeItems = Array.isArray(routeResult) ? routeResult : (routeResult?.items ?? []);

    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri: 'file:///app/tag.component.html', languageId: 'html', version: 1, text: '<' },
    });
    const tagResult = await client.sendRequest(CompletionRequest.type, {
      textDocument: { uri: 'file:///app/tag.component.html' },
      position: { line: 0, character: 1 },
    });
    const tagItems = Array.isArray(tagResult) ? tagResult : (tagResult?.items ?? []);

    expect(routeItems.map((item) => item.label).sort()).toEqual(['docs', 'home']);
    expect(tagItems.some((item) => item.label === 'user-card')).toBe(true);
    client.dispose();
  });
});

function createTestClient() {
  const clientToServer = new PassThrough();
  const serverToClient = new PassThrough();

  startLanguageServer(
    createConnection(new StreamMessageReader(clientToServer), new StreamMessageWriter(serverToClient)),
  );

  const client = createProtocolConnection(
    new StreamMessageReader(serverToClient),
    new StreamMessageWriter(clientToServer),
  );
  client.listen();

  return client;
}
