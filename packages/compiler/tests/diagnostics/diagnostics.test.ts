import { describe, expect, it } from 'vitest';
import { createDiagnostic } from '../../src/diagnostics/diagnostics.js';
import { createSourceSpan } from '../../src/source/location.js';

describe('compiler diagnostics', () => {
  it('uses the catalog message when the caller does not provide one', () => {
    expect(createDiagnostic('VR005', 'error', undefined, 'counter.component.html')).toMatchObject({
      code: 'VR005',
      message: 'Unsupported template syntax.',
    });
    expect(createDiagnostic('VR007', 'error', '', 'counter.component.html')).toMatchObject({
      code: 'VR007',
      message: 'Unsupported event binding expression.',
    });
  });

  it('creates rich diagnostics from source context', () => {
    const source = '<button (click)="count++">Save</button>';
    const span = createSourceSpan(source, 'counter.component.html', 8, 25);

    expect(
      createDiagnostic(
        'VR007',
        'error',
        'Unsupported event binding expression.',
        'counter.component.html',
        1,
        1,
        { source, span },
      ),
    ).toMatchObject({
      code: 'VR007',
      severity: 'error',
      filePath: 'counter.component.html',
      line: 1,
      column: 9,
      endLine: 1,
      endColumn: 26,
      sourceText: '(click)="count++"',
      suggestion: 'Use a zero-argument component method such as save().',
      docsPath: '/docs/compiler/event-binding',
    });
  });
});
