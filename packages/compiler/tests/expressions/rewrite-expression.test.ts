import { describe, expect, it } from 'vitest';
import {
  rewriteEventHandlerExpression,
  rewriteExpression,
} from '../../src/expressions/rewrite-expression.js';

describe('rewriteExpression', () => {
  it('rewrites component identifiers to ctx access', () => {
    expect(rewriteExpression('count()', 'counter.component.html')).toMatchObject({
      expression: 'ctx.count()',
      diagnostics: [],
    });
    expect(rewriteExpression('user().name', 'counter.component.html')).toMatchObject({
      expression: 'ctx.user().name',
      diagnostics: [],
    });
    expect(rewriteExpression('items().length', 'counter.component.html')).toMatchObject({
      expression: 'ctx.items().length',
      diagnostics: [],
    });
    expect(rewriteExpression('count() + 1', 'counter.component.html')).toMatchObject({
      expression: 'ctx.count() + 1',
      diagnostics: [],
    });
  });

  it('preserves known JavaScript globals and property names', () => {
    expect(rewriteExpression('Math.max(count(), 0)', 'counter.component.html')).toMatchObject({
      expression: 'Math.max(ctx.count(), 0)',
      diagnostics: [],
    });
  });

  it('rejects unsupported expressions', () => {
    expect(rewriteExpression('count = 1', 'counter.component.html')).toMatchObject({
      expression: null,
      diagnostics: [{ code: 'VR006' }],
    });
    expect(rewriteExpression('function run() {}', 'counter.component.html')).toMatchObject({
      expression: null,
      diagnostics: [{ code: 'VR006' }],
    });
  });
});

describe('rewriteEventHandlerExpression', () => {
  it('accepts zero-argument component method calls', () => {
    expect(rewriteEventHandlerExpression('increment()', 'counter.component.html')).toMatchObject({
      expression: 'ctx.increment()',
      diagnostics: [],
    });
    expect(rewriteEventHandlerExpression('saveUser()', 'counter.component.html')).toMatchObject({
      expression: 'ctx.saveUser()',
      diagnostics: [],
    });
  });

  it('rejects event expressions outside the Phase 3 subset', () => {
    for (const expression of ['increment(1)', 'count.set(1)', '() => increment()']) {
      expect(rewriteEventHandlerExpression(expression, 'counter.component.html')).toMatchObject({
        expression: null,
        diagnostics: [{ code: 'VR007' }],
      });
    }
  });
});
