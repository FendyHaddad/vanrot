import { describe, expect, test } from 'vitest';
import { compileComponent } from '../../packages/compiler/src/index.js';
import type { CompileDiagnostic } from '../../packages/compiler/src/index.js';
import { auditCase, auditSlice } from './audit-slices.js';

interface ProductionDiagnosticFields {
  codeFrame: string;
  suggestion: string;
  docsPath: string;
}

describe(auditSlice.compiler, function () {
  test(
    auditCase(
      auditSlice.compiler,
      'unsupported event expressions include code frame, suggestion, and docs path',
    ),
    function () {
      const result = compileComponent({
        componentPath: '/audit/counter.component.ts',
        componentSource: 'export class CounterComponent { count = 0; }',
        templatePath: '/audit/counter.component.html',
        templateSource: '<button (click)="count++">Broken</button>',
        stylePath: '/audit/counter.component.css',
        styleSource: 'button { color: red; }',
      });

      const diagnostic = result.diagnostics.find(function (item) {
        return item.code === 'VR007';
      });

      expect(diagnostic).toBeDefined();

      const productionFields = readProductionDiagnosticFields(diagnostic);

      expect(productionFields.codeFrame).toContain('(click)="count++"');
      expect(productionFields.suggestion).toContain('Use a zero-argument component method');
      expect(productionFields.docsPath).toBe('/docs/compiler/event-binding');
    },
  );
});

function readProductionDiagnosticFields(
  diagnostic: CompileDiagnostic | undefined,
): ProductionDiagnosticFields {
  if (diagnostic === undefined) {
    return {
      codeFrame: '',
      suggestion: '',
      docsPath: '',
    };
  }

  const candidate = diagnostic as CompileDiagnostic & Partial<ProductionDiagnosticFields>;

  return {
    codeFrame: candidate.codeFrame ?? '',
    suggestion: candidate.suggestion ?? '',
    docsPath: candidate.docsPath ?? '',
  };
}
