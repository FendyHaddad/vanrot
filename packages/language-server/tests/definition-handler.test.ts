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
