import * as ts from 'typescript';
import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { SourceSpan } from '../source/location.js';
import { expressionGlobals } from './globals.js';

export interface RewriteExpressionResult {
  expression: string | null;
  diagnostics: CompileDiagnostic[];
}

export interface ExpressionSourceContext {
  filePath: string;
  source: string;
  span: SourceSpan;
  localIdentifiers?: readonly string[];
  localSignalIdentifiers?: readonly string[];
}

interface ParsedExpressionResult {
  expression: ts.Expression | null;
  diagnostics: CompileDiagnostic[];
}

interface SourceFileWithParseDiagnostics extends ts.SourceFile {
  parseDiagnostics?: readonly ts.Diagnostic[];
}

export function rewriteExpression(
  expression: string,
  context: ExpressionSourceContext,
): RewriteExpressionResult {
  const parsed = parseExpression(expression, context, 'VR006');

  if (parsed.expression === null) {
    return {
      expression: null,
      diagnostics: parsed.diagnostics,
    };
  }

  if (containsUnsupportedExpression(parsed.expression)) {
    return unsupportedExpression(context, 'VR006');
  }

  return {
    expression: printExpression(rewriteIdentifiers(parsed.expression, context), parsed.expression.getSourceFile()),
    diagnostics: [],
  };
}

export function rewriteEventHandlerExpression(
  expression: string,
  context: ExpressionSourceContext,
): RewriteExpressionResult {
  const parsed = parseExpression(expression, context, 'VR007');

  if (parsed.expression === null) {
    return {
      expression: null,
      diagnostics: parsed.diagnostics,
    };
  }

  if (!ts.isCallExpression(parsed.expression)) {
    return unsupportedExpression(context, 'VR007');
  }

  if (!ts.isIdentifier(parsed.expression.expression) || parsed.expression.arguments.length > 0) {
    return unsupportedExpression(context, 'VR007');
  }

  return {
    expression: `ctx.${parsed.expression.expression.text}()`,
    diagnostics: [],
  };
}

function parseExpression(
  expression: string,
  context: ExpressionSourceContext,
  diagnosticCode: 'VR006' | 'VR007',
): ParsedExpressionResult {
  const sourceFile = ts.createSourceFile(
    context.filePath,
    expression,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const parseDiagnostics = (sourceFile as SourceFileWithParseDiagnostics).parseDiagnostics ?? [];

  if (parseDiagnostics.length > 0) {
    return unsupportedParsedExpression(context, diagnosticCode);
  }

  if (sourceFile.statements.length !== 1) {
    return unsupportedParsedExpression(context, diagnosticCode);
  }

  const statement = sourceFile.statements[0];

  if (statement === undefined || !ts.isExpressionStatement(statement)) {
    return unsupportedParsedExpression(context, diagnosticCode);
  }

  return {
    expression: statement.expression,
    diagnostics: [],
  };
}

function rewriteIdentifiers(expression: ts.Expression, context: ExpressionSourceContext): ts.Expression {
  const localIdentifiers = new Set(context.localIdentifiers ?? []);
  const localSignalIdentifiers = new Set(context.localSignalIdentifiers ?? []);
  const result = ts.transform(expression, [
    (context) => {
      const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (ts.isIdentifier(node) && shouldRewriteSignalIdentifier(node, localSignalIdentifiers)) {
          return context.factory.createCallExpression(context.factory.createIdentifier(node.text), undefined, []);
        }

        if (ts.isIdentifier(node) && shouldRewriteIdentifier(node, localIdentifiers)) {
          return context.factory.createPropertyAccessExpression(
            context.factory.createIdentifier('ctx'),
            node.text,
          );
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return (node) => ts.visitNode(node, visitor) as ts.Expression;
    },
  ]);

  const rewritten = result.transformed[0] ?? expression;
  result.dispose();

  return rewritten;
}

function shouldRewriteSignalIdentifier(node: ts.Identifier, localSignalIdentifiers: ReadonlySet<string>): boolean {
  if (!localSignalIdentifiers.has(node.text)) {
    return false;
  }

  if (ts.isCallExpression(node.parent) && node.parent.expression === node) {
    return false;
  }

  if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) {
    return false;
  }

  return true;
}

function shouldRewriteIdentifier(node: ts.Identifier, localIdentifiers: ReadonlySet<string>): boolean {
  if (node.text === 'ctx' || expressionGlobals.has(node.text)) {
    return false;
  }

  if (localIdentifiers.has(node.text)) {
    return false;
  }

  if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) {
    return false;
  }

  return true;
}

function printExpression(expression: ts.Expression, sourceFile: ts.SourceFile): string {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: true,
  });

  return printer.printNode(ts.EmitHint.Expression, expression, sourceFile);
}

function containsUnsupportedExpression(node: ts.Node): boolean {
  if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    return true;
  }

  if (ts.isBinaryExpression(node) && isAssignmentOperator(node.operatorToken.kind)) {
    return true;
  }

  if (isUpdateExpression(node)) {
    return true;
  }

  return node.getChildren().some(containsUnsupportedExpression);
}

function isUpdateExpression(node: ts.Node): boolean {
  if (ts.isPostfixUnaryExpression(node)) {
    return isUpdateOperator(node.operator);
  }

  if (ts.isPrefixUnaryExpression(node)) {
    return isUpdateOperator(node.operator);
  }

  return false;
}

function isUpdateOperator(kind: ts.SyntaxKind): boolean {
  return kind === ts.SyntaxKind.PlusPlusToken || kind === ts.SyntaxKind.MinusMinusToken;
}

function isAssignmentOperator(kind: ts.SyntaxKind): boolean {
  switch (kind) {
    case ts.SyntaxKind.EqualsToken:
    case ts.SyntaxKind.PlusEqualsToken:
    case ts.SyntaxKind.MinusEqualsToken:
    case ts.SyntaxKind.AsteriskEqualsToken:
    case ts.SyntaxKind.SlashEqualsToken:
    case ts.SyntaxKind.PercentEqualsToken:
    case ts.SyntaxKind.AsteriskAsteriskEqualsToken:
    case ts.SyntaxKind.LessThanLessThanEqualsToken:
    case ts.SyntaxKind.GreaterThanGreaterThanEqualsToken:
    case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
    case ts.SyntaxKind.AmpersandEqualsToken:
    case ts.SyntaxKind.BarEqualsToken:
    case ts.SyntaxKind.CaretEqualsToken:
    case ts.SyntaxKind.BarBarEqualsToken:
    case ts.SyntaxKind.AmpersandAmpersandEqualsToken:
    case ts.SyntaxKind.QuestionQuestionEqualsToken:
      return true;
    default:
      return false;
  }
}

function unsupportedExpression(
  context: ExpressionSourceContext,
  diagnosticCode: 'VR006' | 'VR007',
): RewriteExpressionResult {
  return {
    expression: null,
    diagnostics: [createExpressionDiagnostic(context, diagnosticCode)],
  };
}

function unsupportedParsedExpression(
  context: ExpressionSourceContext,
  diagnosticCode: 'VR006' | 'VR007',
): ParsedExpressionResult {
  return {
    expression: null,
    diagnostics: [createExpressionDiagnostic(context, diagnosticCode)],
  };
}

function createExpressionDiagnostic(
  context: ExpressionSourceContext,
  diagnosticCode: 'VR006' | 'VR007',
): CompileDiagnostic {
  return createDiagnostic(
    diagnosticCode,
    'error',
    undefined,
    context.filePath,
    context.span.line,
    context.span.column,
    {
      source: context.source,
      span: context.span,
    },
  );
}
