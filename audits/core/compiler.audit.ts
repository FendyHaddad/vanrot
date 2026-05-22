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

  test(
    auditCase(
      auditSlice.compiler,
      'production component compiles with control flow, child components, slots, scoped CSS, and mappings',
    ),
    function () {
      const result = compileComponent({
        componentPath: '/audit/home.page.ts',
        componentSource: [
          "import { computed, signal } from '@vanrot/runtime';",
          'export class HomePage {',
          '  users = signal([{ id: 1, name: "Ali", email: "ali@example.test" }]);',
          '  selectedUser = computed(() => this.users()[0]);',
          '  loggedIn = computed(() => this.users().length > 0);',
          '  editUser(): void {}',
          '}',
        ].join('\n'),
        templatePath: '/audit/home.page.html',
        templateSource: [
          '@if (loggedIn()) {',
          '  <profile-card [user]="selectedUser()">',
          '    <h2 slot.title>Account owner</h2>',
          '    @for (user of users(); track user.id) {',
          '      <p>{{ user.name }}</p>',
          '    } @empty {',
          '      <p>No users yet</p>',
          '    }',
          '    <vr-button slot.actions (click)="editUser()">Edit</vr-button>',
          '  </profile-card>',
          '} @else {',
          '  <p>Please sign in</p>',
          '}',
        ].join('\n'),
        stylePath: '/audit/home.page.css',
        styleSource: [
          ':host { display: block; }',
          '.card:hover { color: var(--vr-color-accent); }',
          ':global(body) { margin: 0; }',
        ].join('\n'),
      });

      expect(result.diagnostics).toEqual([]);
      expect(result.metadata.features).toEqual(
        expect.arrayContaining([
          'control-flow-if',
          'control-flow-for',
          'child-component',
          'slot',
          'scoped-css',
          'ui-button',
        ]),
      );
      expect(result.metadata.mappings.length).toBeGreaterThan(0);
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
