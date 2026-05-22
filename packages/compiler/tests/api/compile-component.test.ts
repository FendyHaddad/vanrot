import { describe, expect, it } from 'vitest';
import { compileComponent } from '../../src/api/compile-component.js';
import { createDiagnostic } from '../../src/diagnostics/diagnostics.js';
import type {
  CompileDiagnostic,
  CompileFeature,
  CompileResult,
  ComponentSource,
} from '../../src/index.js';

describe('compiler api types', () => {
  it('creates diagnostics with stable fields', () => {
    expect(
      createDiagnostic('VR003', 'error', 'Invalid component suffix', 'src/counter.ts', 1, 1),
    ).toEqual({
      code: 'VR003',
      severity: 'error',
      message: 'Invalid component suffix',
      filePath: 'src/counter.ts',
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 1,
      sourceText: '',
      codeFrame: '',
      suggestion: 'Use a supported role suffix such as .component.ts, .page.ts, or .button.ts.',
      docsPath: '/docs/compiler/file-conventions',
    });
  });

  it('exposes the public compile result shape', () => {
    const source: ComponentSource = {
      componentPath: 'counter.component.ts',
      componentSource: 'export class CounterComponent {}',
      templatePath: 'counter.component.html',
      templateSource: '<p>Ready</p>',
      stylePath: 'counter.component.css',
      styleSource: 'p { color: red; }',
    };
    const diagnostic: CompileDiagnostic = createDiagnostic(
      'VR005',
      'warning',
      'Unsupported template syntax',
      source.templatePath,
      1,
      1,
    );
    const feature: CompileFeature = 'scoped-css';
    const result: CompileResult = {
      js: '',
      css: '',
      diagnostics: [diagnostic],
      metadata: {
        componentName: 'CounterComponent',
        scopeAttribute: 'data-vr-test',
        features: [feature],
        componentDependencies: [],
        mappings: [],
      },
    };

    expect(result.metadata.features).toEqual(['scoped-css']);
  });
});

describe('compileComponent', () => {
  it('compiles a counter fixture from in-memory sources', () => {
    const result = compileComponent({
      componentPath: 'counter.component.ts',
      componentSource: `
        import { signal } from '@vanrot/runtime';

        export class CounterComponent {
          count = signal(0);
          saving = signal(false);

          increment() {
            this.count.update((value) => value + 1);
          }
        }
      `,
      templatePath: 'counter.component.html',
      templateSource: `
        <section class="counter">
          <p>Count: {{ count() }}</p>
          <button type="button" [disabled]="saving()" (click)="increment()">Increase</button>
        </section>
      `,
      stylePath: 'counter.component.css',
      styleSource: `
        .counter {
          display: grid;
        }

        button {
          color: red;
        }
      `,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.metadata.componentName).toBe('CounterComponent');
    expect(result.metadata.scopeAttribute).toMatch(/^data-vr-[a-f0-9]{6}$/);
    expect(result.metadata.features).toEqual(
      expect.arrayContaining([
        'file-convention',
        'component-class',
        'text-interpolation',
        'event-binding',
        'property-binding',
        'scoped-css',
        'readable-output',
        'expression-rewriting',
      ]),
    );
    expect(result.js).toContain("import { CounterComponent } from 'counter.component.js';");
    expect(result.js).toContain("import { effect } from '@vanrot/runtime';");
    expect(result.js).toContain("import { listen } from '@vanrot/runtime/internal';");
    expect(result.js).toContain('text0.data = `Count: ${ctx.count()}`;');
    expect(result.js).toContain('button0.disabled = ctx.saving();');
    expect(result.css).toContain(`.counter[${result.metadata.scopeAttribute}]`);
    expect(result.css).toContain(`button[${result.metadata.scopeAttribute}]`);
  });

  it('returns source-map-ready mappings for generated template output', () => {
    const result = compileComponent({
      componentPath: 'counter.component.ts',
      componentSource: 'export class CounterComponent { count() { return 1; } }',
      templatePath: 'counter.component.html',
      templateSource: '<p>Count: {{ count() }}</p>',
      stylePath: 'counter.component.css',
      styleSource: 'p { color: red; }',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.metadata.mappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceFilePath: 'counter.component.html',
          sourceLine: 1,
          sourceColumn: 1,
          generatedFile: 'js',
        }),
        expect.objectContaining({
          sourceFilePath: 'counter.component.css',
          sourceLine: 1,
          sourceColumn: 1,
          generatedFile: 'css',
        }),
      ]),
    );
  });
});
