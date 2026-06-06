import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createConnection } from 'vscode-languageserver/node.js';
import {
  DefinitionRequest,
  DidOpenTextDocumentNotification,
  InitializeRequest,
  StreamMessageReader,
  StreamMessageWriter,
  createProtocolConnection,
} from 'vscode-languageserver-protocol/node.js';
import { URI } from 'vscode-uri';
import { startLanguageServer } from '../src/server.js';

describe('definition handler', () => {
  it('does not error on a route ref when no project is loaded', async () => {
    const client = createTestClient();

    await client.sendRequest(InitializeRequest.type, { processId: null, rootUri: null, capabilities: {} });
    const uri = 'file:///app/x.component.html';

    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: '<vr route.home />' },
    });

    const result = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri },
      position: { line: 0, character: 12 },
    });

    expect(result).toBeNull();
    client.dispose();
  });

  it('points a docs page component tag in an app workspace at its component source', async () => {
    const root = mkdtempSync(join(tmpdir(), 'vanrot-lsp-definition-handler-'));
    const sourceRoot = join(root, 'apps/vanrot-site/src');
    const componentPath = join(sourceRoot, 'pages/docs/shared/docs-section.component.ts');
    const pagePath = join(sourceRoot, 'pages/docs/framework/store/actions/actions.page.html');
    const pageMarkup = '<docs-section></docs-section>';
    const client = createTestClient();

    mkdirSync(join(sourceRoot, 'pages/docs/shared'), { recursive: true });
    mkdirSync(join(sourceRoot, 'pages/docs/framework/store/actions'), { recursive: true });
    writeFileSync(componentPath, 'export class DocsSectionComponent {}');
    writeFileSync(pagePath, pageMarkup);

    await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: URI.file(root).toString(),
      capabilities: {},
    });

    const uri = URI.file(pagePath).toString();

    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: pageMarkup },
    });

    const result = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri },
      position: { line: 0, character: 6 },
    });

    expect(Array.isArray(result)).toBe(false);
    expect(result).toEqual(
      expect.objectContaining({
        uri: URI.file(componentPath).toString(),
      }),
    );
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
