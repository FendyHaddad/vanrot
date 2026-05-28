import {
  type Connection,
  type InitializeParams,
  type InitializeResult,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { buildCompletions } from './features/completion.js';
import { classifyCompletionContext } from './features/completion-context.js';
import { findDefinition, findSlotDefinition } from './features/definition.js';
import { findReferences } from './features/references.js';
import { resolveSymbolAt } from './features/symbol-at.js';
import { offsetAt } from './lsp/position.js';
import { loadWorkspaceIndex, type WorkspaceIndex } from './project/workspace.js';

const serverInfo = { name: 'vanrot-language-server', version: '0.0.0' } as const;

export function buildInitializeResult(_params: InitializeParams): InitializeResult {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { triggerCharacters: ['<', '.', ' '] },
      definitionProvider: true,
      referencesProvider: true,
    },
    serverInfo: { name: serverInfo.name, version: serverInfo.version },
  };
}

export function startLanguageServer(connection: Connection): void {
  const documents = new TextDocuments(TextDocument);
  let index: WorkspaceIndex = { routes: [], components: [], routesPath: null };

  connection.onInitialize((params) => {
    const root = params.rootUri ? URI.parse(params.rootUri).fsPath : null;
    index = loadWorkspaceIndex(root);

    return buildInitializeResult(params);
  });

  connection.onCompletion((params) => {
    const document = documents.get(params.textDocument.uri);

    if (document === undefined) {
      return [];
    }

    const source = document.getText();
    const offset = offsetAt(source, params.position.line, params.position.character);
    const context = classifyCompletionContext(source, offset);

    return buildCompletions(context, index);
  });

  connection.onDefinition((params) => {
    const document = documents.get(params.textDocument.uri);

    if (document === undefined) {
      return null;
    }

    const source = document.getText();
    const offset = offsetAt(source, params.position.line, params.position.character);
    const symbol = resolveSymbolAt(source, offset);

    if (symbol === null) {
      return null;
    }

    if (symbol.kind === 'slot') {
      return findSlotDefinition(symbol.name, source, params.textDocument.uri);
    }

    return findDefinition(symbol, index);
  });

  connection.onReferences((params) => {
    const document = documents.get(params.textDocument.uri);

    if (document === undefined) {
      return [];
    }

    const source = document.getText();
    const offset = offsetAt(source, params.position.line, params.position.character);
    const symbol = resolveSymbolAt(source, offset);

    if (symbol === null) {
      return [];
    }

    return findReferences(
      symbol,
      documents.all().map((openDocument) => ({ uri: openDocument.uri, text: openDocument.getText() })),
    );
  });

  documents.listen(connection);
  connection.listen();
}
