import * as ts from 'typescript';
import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { expressionGlobals } from './globals.js';

export interface RewriteExpressionResult {
  expression: string | null;
  diagnostics: CompileDiagnostic[];
}

interface ParsedExpressionResult {
  expression: ts.Expression | null;
  diagnostics: CompileDiagnostic[];
}

export function rewriteExpression(expression: string, filePath: string): RewriteExpressionResult {
  const parsed = parseExpression(expression, filePath, 'VR006');

  if (parsed.expression === null) {
    return {
      expression: null,
      diagnostics: parsed.diagnostics,
    };
  }

  if (containsUnsupportedExpression(parsed.expression)) {
    return unsupportedExpression(filePath, 'VR006');
  }

  return {
    expression: printExpression(rewriteIdentifiers(parsed.expression), parsed.expression.getSourceFile()),
    diagnostics: [],
  };
}

export function rewriteEventHandlerExpression(
  expression: string,
  filePath: string,
): RewriteExpressionResult {
  const parsed = parseExpression(expression, filePath, 'VR007');

  if (parsed.expression === null) {
    return {
      expression: null,
      diagnostics: parsed.diagnostics,
    };
  }

  if (!ts.isCallExpression(parsed.expression)) {
    return unsupportedExpression(filePath, 'VR007');
  }

  if (!ts.isIdentifier(parsed.expression.expression) || parsed.expression.arguments.length > 0) {
    return unsupportedExpression(filePath, 'VR007');
  }

  return {
    expression: `ctx.${parsed.expression.expression.text}()`,
    diagnostics: [],
  };
}

function parseExpression(
  expression: string,
  filePath: string,
  diagnosticCode: 'VR006' | 'VR007',
): ParsedExpressionResult {
  const sourceFile = ts.createSourceFile(
    filePath,
    expression,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  if (sourceFile.statements.length !== 1) {
    return unsupportedParsedExpression(filePath, diagnosticCode);
  }

  const statement = sourceFile.statements[0];

  if (statement === undefined || !ts.isExpressionStatement(statement)) {
    return unsupportedParsedExpression(filePath, diagnosticCode);
  }

  return {
    expression: statement.expression,
    diagnostics: [],
  };
}

function rewriteIdentifiers(expression: ts.Expression): ts.Expression {
  const result = ts.transform(expression, [
    (context) => {
      const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (ts.isIdentifier(node) && shouldRewriteIdentifier(node)) {
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

function shouldRewriteIdentifier(node: ts.Identifier): boolean {
  if (node.text === 'ctx' || expressionGlobals.has(node.text)) {
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

  return node.getChildren().some(containsUnsupportedExpression);
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
  filePath: string,
  diagnosticCode: 'VR006' | 'VR007',
): RewriteExpressionResult {
  return {
    expression: null,
    diagnostics: [createExpressionDiagnostic(filePath, diagnosticCode)],
  };
}

function unsupportedParsedExpression(
  filePath: string,
  diagnosticCode: 'VR006' | 'VR007',
): ParsedExpressionResult {
  return {
    expression: null,
    diagnostics: [createExpressionDiagnostic(filePath, diagnosticCode)],
  };
}

function createExpressionDiagnostic(
  filePath: string,
  diagnosticCode: 'VR006' | 'VR007',
): CompileDiagnostic {
  return createDiagnostic(
    diagnosticCode,
    'error',
    diagnosticCode === 'VR006'
      ? 'Unsupported expression syntax.'
      : 'Unsupported event binding expression.',
    filePath,
  );
}
