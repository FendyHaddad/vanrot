import { readFileSync } from 'node:fs';
import { createComponentFileSet } from '@vanrot/compiler';
import {
  type Connection,
  type InitializeParams,
  type InitializeResult,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { enumerateExpressions } from './expressions/enumerate.js';
import { buildCodeActions } from './features/code-actions.js';
import { buildCompletions } from './features/completion.js';
import { classifyCompletionContext } from './features/completion-context.js';
import { findDefinition, findSlotDefinition } from './features/definition.js';
import { compileTemplateDiagnostics, editorTemplateDiagnostics } from './features/diagnostics.js';
import { expressionCompletion } from './features/expression-completion.js';
import { expressionDiagnostics } from './features/expression-diagnostics.js';
import { expressionHover } from './features/expression-hover.js';
import { expressionRename } from './features/expression-rename.js';
import { findReferences } from './features/references.js';
import { resolveSymbolAt } from './features/symbol-at.js';
import { describeUiPrimitive } from './features/ui-primitives.js';
import { debounce } from './lsp/debounce.js';
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
      hoverProvider: true,
      renameProvider: true,
      codeActionProvider: true,
    },
    serverInfo: { name: serverInfo.name, version: serverInfo.version },
  };
}

export function startLanguageServer(connection: Connection): void {
  const documents = new TextDocuments(TextDocument);
  const openedVersions = new Map<string, number>();
  let index: WorkspaceIndex = {
    routes: [],
    components: [],
    routesPath: null,
    projectRoot: null,
    webTypes: { sources: [], tags: [], attributes: [] },
    templates: { templates: [] },
  };

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

    if (isExpressionOffset(source, offset)) {
      const expressionContext = loadExpressionContext(URI.parse(params.textDocument.uri).fsPath);

      if (expressionContext !== null) {
        return expressionCompletion(source, expressionContext.componentSource, expressionContext.className, offset);
      }
    }

    const context = classifyCompletionContext(source, offset);

    return buildCompletions(context, index);
  });

  connection.onHover((params) => {
    const document = documents.get(params.textDocument.uri);

    if (document === undefined) {
      return null;
    }

    const source = document.getText();
    const offset = offsetAt(source, params.position.line, params.position.character);

    if (!isExpressionOffset(source, offset)) {
      const symbol = resolveSymbolAt(source, offset);

      if (symbol?.kind !== 'component-tag') {
        return null;
      }

      const documentation = describeUiPrimitive(symbol.name, index.projectRoot);

      if (documentation === null) {
        return null;
      }

      return { contents: { kind: 'markdown', value: documentation } };
    }

    const expressionContext = loadExpressionContext(URI.parse(params.textDocument.uri).fsPath);

    if (expressionContext === null) {
      return null;
    }

    const hover = expressionHover(source, expressionContext.componentSource, expressionContext.className, offset);

    if (hover === null) {
      return null;
    }

    return { contents: hover.contents };
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
      index.templates,
    );
  });

  connection.onRenameRequest((params) => {
    const document = documents.get(params.textDocument.uri);

    if (document === undefined) {
      return null;
    }

    const source = document.getText();
    const offset = offsetAt(source, params.position.line, params.position.character);
    const symbol = resolveSymbolAt(source, offset);

    if (symbol?.kind === 'route-ref') {
      const changes = new Map<string, Array<{ range: ReturnType<typeof findReferences>[number]['range']; newText: string }>>();

      for (const location of findReferences(
        symbol,
        documents.all().map((openDocument) => ({ uri: openDocument.uri, text: openDocument.getText() })),
        index.templates,
      )) {
        const edits = changes.get(location.uri) ?? [];
        edits.push({ range: location.range, newText: `route.${params.newName}` });
        changes.set(location.uri, edits);
      }

      return { changes: Object.fromEntries(changes) };
    }

    if (!isExpressionOffset(source, offset)) {
      return null;
    }

    const expressionContext = loadExpressionContext(URI.parse(params.textDocument.uri).fsPath);

    if (expressionContext === null) {
      return null;
    }

    const edits = expressionRename(
      source,
      expressionContext.componentSource,
      expressionContext.className,
      offset,
      params.newName,
    );

    if (edits.template.length === 0) {
      return null;
    }

    return { changes: { [params.textDocument.uri]: edits.template } };
  });

  const runDiagnostics = (uri: string): void => {
    const document = documents.get(uri);

    if (document === undefined) {
      return;
    }

    const fsPath = URI.parse(uri).fsPath;
    void compileTemplateDiagnostics(fsPath, document.getText()).then((diagnostics) => {
      const expressionContext = loadExpressionContext(fsPath);
      const expressionResult =
        expressionContext === null
          ? []
          : expressionDiagnostics(document.getText(), expressionContext.componentSource, expressionContext.className);
      const editorResult = editorTemplateDiagnostics(fsPath, index);
      connection.sendDiagnostics({ uri, diagnostics: [...diagnostics, ...expressionResult, ...editorResult] });
    });
  };
  const scheduleDiagnostics = debounce(runDiagnostics, 200);

  documents.onDidOpen((event) => {
    openedVersions.set(event.document.uri, event.document.version);
    runDiagnostics(event.document.uri);
  });
  documents.onDidChangeContent((event) => {
    if (openedVersions.get(event.document.uri) === event.document.version) {
      return;
    }

    scheduleDiagnostics(event.document.uri);
  });

  connection.onCodeAction((params) =>
    buildCodeActions({
      documentUri: params.textDocument.uri,
      diagnostics: params.context.diagnostics,
      routes: index.routes.map((route) => ({ name: route.name, path: route.path ?? null })),
      webTypesSources: (index.webTypes?.sources ?? []).map((source) => source.path),
    }),
  );

  documents.listen(connection);
  connection.listen();
}

interface ExpressionContext {
  componentSource: string;
  className: string;
}

function isExpressionOffset(source: string, offset: number): boolean {
  return enumerateExpressions(source).some(
    (expression) => offset >= expression.span.startOffset && offset <= expression.span.endOffset,
  );
}

function loadExpressionContext(templatePath: string): ExpressionContext | null {
  const componentPath = templatePath.replace(/\.html$/, '.ts');
  const fileSet = createComponentFileSet(componentPath);

  if (fileSet === null) {
    return null;
  }

  const componentSource = readOptional(fileSet.componentPath);

  if (componentSource === null) {
    return null;
  }

  return { componentSource, className: fileSet.expectedClassName };
}

function readOptional(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}
