import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createConnection } from 'vscode-languageserver/node.js';
import {
  CompletionRequest,
  DidOpenTextDocumentNotification,
  HoverRequest,
  InitializeRequest,
  PublishDiagnosticsNotification,
  RenameRequest,
  StreamMessageReader,
  StreamMessageWriter,
  createProtocolConnection,
} from 'vscode-languageserver-protocol/node.js';
import { URI } from 'vscode-uri';
import { startLanguageServer } from '../src/server.js';

describe('expression handlers', () => {
  it('returns hover details inside a template expression', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'vr-expr-h-'));
    writeFileSync(join(dir, 'x.component.ts'), 'export class XComponent { count = 1; }\n');
    writeFileSync(join(dir, 'x.component.css'), '');
    const template = '<p>{{ count }}</p>\n';
    const templatePath = join(dir, 'x.component.html');
    writeFileSync(templatePath, template);
    const uri = URI.file(templatePath).toString();
    const client = createTestClient();

    await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: template },
    });

    const result = await client.sendRequest(HoverRequest.type, {
      textDocument: { uri },
      position: { line: 0, character: template.indexOf('count') },
    });

    expect(JSON.stringify(result?.contents)).toContain('number');
    client.dispose();
  });

  it('returns completions inside a template expression', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'vr-expr-h-'));
    writeFileSync(join(dir, 'x.component.ts'), "export class XComponent { user = { name: 'a' }; }\n");
    writeFileSync(join(dir, 'x.component.css'), '');
    const template = '<p>{{ user. }}</p>\n';
    const templatePath = join(dir, 'x.component.html');
    writeFileSync(templatePath, template);
    const uri = URI.file(templatePath).toString();
    const client = createTestClient();

    await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: template },
    });

    const result = await client.sendRequest(CompletionRequest.type, {
      textDocument: { uri },
      position: { line: 0, character: template.indexOf('user.') + 'user.'.length },
    });
    const items = Array.isArray(result) ? result : (result?.items ?? []);

    expect(items.some((item) => item.label === 'name')).toBe(true);
    client.dispose();
  });

  it('publishes TypeScript expression diagnostics for unknown members', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'vr-expr-h-'));
    writeFileSync(join(dir, 'x.component.ts'), 'export class XComponent { count = 1; }\n');
    writeFileSync(join(dir, 'x.component.css'), '');
    const template = '<p>{{ nope }}</p>\n';
    const templatePath = join(dir, 'x.component.html');
    writeFileSync(templatePath, template);
    const uri = URI.file(templatePath).toString();
    const client = createTestClient();
    const received = new Promise<string[]>((resolve) => {
      client.onNotification(PublishDiagnosticsNotification.type, (params) => {
        if (params.uri === uri) {
          resolve(params.diagnostics.map((diagnostic) => String(diagnostic.source)));
        }
      });
    });

    await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: template },
    });

    expect(await received).toContain('vanrot-ts');
    client.dispose();
  });

  it('returns a template workspace edit for expression rename', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'vr-expr-h-'));
    writeFileSync(join(dir, 'x.component.ts'), 'export class XComponent { count = 1; }\n');
    writeFileSync(join(dir, 'x.component.css'), '');
    const template = '<p>{{ count }}</p>\n';
    const templatePath = join(dir, 'x.component.html');
    writeFileSync(templatePath, template);
    const uri = URI.file(templatePath).toString();
    const client = createTestClient();

    await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: template },
    });

    const result = await client.sendRequest(RenameRequest.type, {
      textDocument: { uri },
      position: { line: 0, character: template.indexOf('count') },
      newName: 'total',
    });

    expect(result?.changes?.[uri]?.[0]?.newText).toBe('total');
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
