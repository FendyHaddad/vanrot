import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createConnection } from 'vscode-languageserver/node.js';
import {
  DidChangeTextDocumentNotification,
  DidOpenTextDocumentNotification,
  InitializeRequest,
  PublishDiagnosticsNotification,
  StreamMessageReader,
  StreamMessageWriter,
  createProtocolConnection,
} from 'vscode-languageserver-protocol/node.js';
import { URI } from 'vscode-uri';
import { startLanguageServer } from '../src/server.js';

describe('diagnostics handler', () => {
  it('publishes diagnostics for an opened template', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'vr-diag-h-'));
    writeFileSync(join(dir, 'x.component.ts'), 'export class XComponent {}\n');
    writeFileSync(join(dir, 'x.component.css'), '');
    const templatePath = join(dir, 'x.component.html');
    writeFileSync(templatePath, '<p>{{ a = 1 }}</p>\n');
    const uri = URI.file(templatePath).toString();

    const c2s = new PassThrough();
    const s2c = new PassThrough();
    startLanguageServer(createConnection(new StreamMessageReader(c2s), new StreamMessageWriter(s2c)));
    const client = createProtocolConnection(new StreamMessageReader(s2c), new StreamMessageWriter(c2s));
    client.listen();

    const received = new Promise<number>((resolve) => {
      client.onNotification(PublishDiagnosticsNotification.type, (params) => {
        if (params.uri === uri) resolve(params.diagnostics.length);
      });
    });

    await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: '<p>{{ a = 1 }}</p>\n' },
    });

    expect(await received).toBeGreaterThan(0);
    client.dispose();
  });

  it('clears diagnostics after the opened template is fixed', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'vr-diag-h-'));
    writeFileSync(join(dir, 'x.component.ts'), 'export class XComponent {}\n');
    writeFileSync(join(dir, 'x.component.css'), '');
    const templatePath = join(dir, 'x.component.html');
    writeFileSync(templatePath, '<p>{{ a = 1 }}</p>\n');
    const uri = URI.file(templatePath).toString();

    const c2s = new PassThrough();
    const s2c = new PassThrough();
    startLanguageServer(createConnection(new StreamMessageReader(c2s), new StreamMessageWriter(s2c)));
    const client = createProtocolConnection(new StreamMessageReader(s2c), new StreamMessageWriter(c2s));
    client.listen();

    const cleared = new Promise<number>((resolve) => {
      const lengths: number[] = [];
      client.onNotification(PublishDiagnosticsNotification.type, (params) => {
        if (params.uri !== uri) return;

        lengths.push(params.diagnostics.length);

        if (lengths.length === 1) {
          client.sendNotification(DidChangeTextDocumentNotification.type, {
            textDocument: { uri, version: 2 },
            contentChanges: [{ text: '<p>fixed</p>\n' }],
          });
        }

        if (lengths.length === 2) resolve(params.diagnostics.length);
      });
    });

    await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    });
    client.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: 'html', version: 1, text: '<p>{{ a = 1 }}</p>\n' },
    });

    expect(await cleared).toBe(0);
    client.dispose();
  });
});
