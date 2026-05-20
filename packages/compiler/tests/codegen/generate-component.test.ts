import { describe, expect, it } from 'vitest';
import { generateComponent } from '../../src/codegen/generate-component.js';
import type { ComponentMetadata } from '../../src/metadata/component-metadata.js';
import type { TemplateNode } from '../../src/template/ast.js';

const metadata: ComponentMetadata = {
  componentName: 'CounterComponent',
  exportName: 'CounterComponent',
  importPath: 'counter.component.js',
};

describe('generateComponent', () => {
  it('generates readable static DOM creation code', () => {
    const nodes: TemplateNode[] = [
      {
        kind: 'element',
        tagName: 'section',
        attributes: [{ name: 'class', value: 'counter' }],
        children: [
          {
            kind: 'element',
            tagName: 'p',
            attributes: [],
            children: [{ kind: 'text', value: 'Ready' }],
          },
        ],
      },
    ];

    const result = generateComponent({
      metadata,
      nodes,
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("import { CounterComponent } from 'counter.component.js';");
    expect(result.js).toContain('const ctx = new CounterComponent();');
    expect(result.js).toContain('const fragment = document.createDocumentFragment();');
    expect(result.js).toContain("const section0 = document.createElement('section');");
    expect(result.js).toContain("section0.setAttribute('data-vr-a1b2c3', '');");
    expect(result.js).toContain("section0.setAttribute('class', 'counter');");
    expect(result.js).toContain("const p0 = document.createElement('p');");
    expect(result.js).toContain("const text0 = document.createTextNode('Ready');");
    expect(result.js).toContain('return {');
    expect(result.js).toContain('node: fragment,');
    expect(result.js).toContain('ctx,');
    expect(result.features).toEqual(['readable-output']);
  });

  it('generates interpolation effects', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'p',
          attributes: [],
          children: [{ kind: 'text', value: 'Count: {{ count() }}' }],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("import { effect } from '@vanrot/runtime';");
    expect(result.js).toContain('effect(() => {');
    expect(result.js).toContain('text0.data = `Count: ${ctx.count()}`;');
    expect(result.features).toContain('text-interpolation');
  });

  it('generates property binding effects', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'input',
          attributes: [{ name: '[value]', value: 'name()' }],
          children: [],
        },
        {
          kind: 'element',
          tagName: 'button',
          attributes: [{ name: '[disabled]', value: 'saving()' }],
          children: [{ kind: 'text', value: 'Save' }],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain('input0.value = ctx.name();');
    expect(result.js).toContain('button0.disabled = ctx.saving();');
    expect(result.features).toContain('property-binding');
  });

  it('generates event binding code', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'button',
          attributes: [{ name: '(click)', value: 'increment()' }],
          children: [{ kind: 'text', value: 'Increase' }],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("import { listen } from '@vanrot/runtime/internal';");
    expect(result.js).toContain("listen(button0, 'click', () => {");
    expect(result.js).toContain('ctx.increment();');
    expect(result.features).toContain('event-binding');
  });
});
