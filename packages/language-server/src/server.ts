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
import { offsetAt } from './lsp/position.js';
import { loadWorkspaceIndex, type WorkspaceIndex } from './project/workspace.js';

const serverInfo = { name: 'vanrot-language-server', version: '0.0.0' } as const;

export function buildInitializeResult(_params: InitializeParams): InitializeResult {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { triggerCharacters: ['<', '.', ' '] },
    },
    serverInfo: { name: serverInfo.name, version: serverInfo.version },
  };
}

export function startLanguageServer(connection: Connection): void {
  const documents = new TextDocuments(TextDocument);
  let index: WorkspaceIndex = { routes: [], components: [] };

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

  documents.listen(connection);
  connection.listen();
}
