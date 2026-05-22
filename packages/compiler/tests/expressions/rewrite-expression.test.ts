import { describe, expect, it } from 'vitest';
import { createSourceSpan } from '../../src/source/location.js';
import {
  type ExpressionSourceContext,
  rewriteEventHandlerExpression,
  rewriteExpression,
} from '../../src/expressions/rewrite-expression.js';

const sourceContext: ExpressionSourceContext = {
  filePath: 'counter.component.html',
  source: '{{ count() }}',
  span: {
    filePath: 'counter.component.html',
    line: 1,
    column: 4,
    endLine: 1,
    endColumn: 11,
    startOffset: 3,
    endOffset: 10,
  },
};

function createExpressionSourceContext(expression: string): ExpressionSourceContext {
  return {
    filePath: 'counter.component.html',
    source: expression,
    span: createSourceSpan(expression, 'counter.component.html', 0, expression.length),
  };
}

function createSourceContextForText(source: string, sourceText: string): ExpressionSourceContext {
  const startOffset = source.indexOf(sourceText);

  expect(startOffset).toBeGreaterThanOrEqual(0);

  return {
    filePath: 'counter.component.html',
    source,
    span: createSourceSpan(source, 'counter.component.html', startOffset, startOffset + sourceText.length),
  };
}

describe('rewriteExpression', () => {
  it('rewrites component identifiers to ctx access', () => {
    expect(rewriteExpression('count()', sourceContext)).toMatchObject({
      expression: 'ctx.count()',
      diagnostics: [],
    });
    expect(rewriteExpression('user().name', sourceContext)).toMatchObject({
      expression: 'ctx.user().name',
      diagnostics: [],
    });
    expect(rewriteExpression('items().length', sourceContext)).toMatchObject({
      expression: 'ctx.items().length',
      diagnostics: [],
    });
    expect(rewriteExpression('count() + 1', sourceContext)).toMatchObject({
      expression: 'ctx.count() + 1',
      diagnostics: [],
    });
  });

  it('preserves known JavaScript globals and property names', () => {
    expect(rewriteExpression('Math.max(count(), 0)', sourceContext)).toMatchObject({
      expression: 'Math.max(ctx.count(), 0)',
      diagnostics: [],
    });
  });

  it('rejects unsupported expressions', () => {
    expect(rewriteExpression('count = 1', sourceContext)).toMatchObject({
      expression: null,
      diagnostics: [{ code: 'VR006' }],
    });
    expect(rewriteExpression('function run() {}', sourceContext)).toMatchObject({
      expression: null,
      diagnostics: [{ code: 'VR006' }],
    });
  });

  it('rejects update expressions with interpolation source context', () => {
    const result = rewriteExpression(
      'count++',
      createSourceContextForText('<p>{{ count++ }}</p>', '{{ count++ }}'),
    );

    expect(result.expression).toBeNull();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'VR006',
      docsPath: '/docs/compiler/expressions',
      filePath: 'counter.component.html',
      line: 1,
      column: 4,
      endLine: 1,
      endColumn: 17,
      sourceText: '{{ count++ }}',
    });
    expect(result.diagnostics[0]?.codeFrame).toBe(
      '1 | <p>{{ count++ }}</p>\n       ^^^^^^^^^^^^^',
    );
  });

  it('rejects malformed expressions', () => {
    expect(rewriteExpression('count(', createExpressionSourceContext('count('))).toMatchObject({
      expression: null,
      diagnostics: [
        {
          code: 'VR006',
          sourceText: 'count(',
        },
      ],
    });
  });
});

describe('rewriteEventHandlerExpression', () => {
  it('accepts zero-argument component method calls', () => {
    expect(rewriteEventHandlerExpression('increment()', sourceContext)).toMatchObject({
      expression: 'ctx.increment()',
      diagnostics: [],
    });
    expect(rewriteEventHandlerExpression('saveUser()', sourceContext)).toMatchObject({
      expression: 'ctx.saveUser()',
      diagnostics: [],
    });
  });

  it('rejects event expressions outside the Phase 3 subset', () => {
    for (const expression of ['increment(1)', 'count.set(1)', '() => increment()']) {
      expect(rewriteEventHandlerExpression(expression, sourceContext)).toMatchObject({
        expression: null,
        diagnostics: [{ code: 'VR007' }],
      });
    }
  });

  it('rejects event handler calls with arguments using event attribute source context', () => {
    const result = rewriteEventHandlerExpression(
      'save(user.id)',
      createSourceContextForText(
        '<button (click)="save(user.id)">Save</button>',
        '(click)="save(user.id)"',
      ),
    );

    expect(result).toMatchObject({
      expression: null,
      diagnostics: [
        {
          code: 'VR007',
          sourceText: '(click)="save(user.id)"',
        },
      ],
    });
  });

  it('rejects malformed event expressions', () => {
    expect(rewriteEventHandlerExpression('save(', createExpressionSourceContext('save('))).toMatchObject({
      expression: null,
      diagnostics: [
        {
          code: 'VR007',
          sourceText: 'save(',
        },
      ],
    });
  });
});
