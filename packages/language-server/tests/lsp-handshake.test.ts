import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createConnection } from 'vscode-languageserver/node.js';
import {
  createProtocolConnection,
  InitializeRequest,
  StreamMessageReader,
  StreamMessageWriter,
} from 'vscode-languageserver-protocol/node.js';
import { startLanguageServer } from '../src/server.js';

describe('LSP handshake', () => {
  it('responds to initialize with the vanrot server info', async () => {
    const clientToServer = new PassThrough();
    const serverToClient = new PassThrough();

    const server = createConnection(
      new StreamMessageReader(clientToServer),
      new StreamMessageWriter(serverToClient),
    );
    startLanguageServer(server);

    const client = createProtocolConnection(
      new StreamMessageReader(serverToClient),
      new StreamMessageWriter(clientToServer),
    );
    client.listen();

    const result = await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });

    expect(result.serverInfo?.name).toBe('vanrot-language-server');
    expect(result.capabilities.codeActionProvider).toBe(true);
    client.dispose();
  });
});
