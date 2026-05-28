import { describe, expect, it } from 'vitest';
import { type InitializeParams, TextDocumentSyncKind } from 'vscode-languageserver';
import { buildInitializeResult } from '../src/server.js';

const params = { processId: null, rootUri: null, capabilities: {} } as InitializeParams;

describe('buildInitializeResult', () => {
  it('advertises incremental document sync', () => {
    const result = buildInitializeResult(params);
    expect(result.capabilities.textDocumentSync).toBe(TextDocumentSyncKind.Incremental);
  });

  it('identifies the server by name', () => {
    const result = buildInitializeResult(params);
    expect(result.serverInfo?.name).toBe('vanrot-language-server');
  });
});
