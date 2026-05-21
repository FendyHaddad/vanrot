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

  it('uses the component import override when provided', () => {
    const result = generateComponent(
      {
        metadata,
        nodes: [],
        scopeAttribute: 'data-vr-a1b2c3',
        templatePath: 'counter.component.html',
      },
      {
        componentImportSpecifier: 'virtual:vanrot-source:%2Fsrc%2Fcounter.component.ts',
      },
    );

    expect(result.js).toContain(
      "from 'virtual:vanrot-source:%2Fsrc%2Fcounter.component.ts'",
    );
    expect(result.js).not.toContain("from 'counter.component.js'");
  });

  it('generates router outlet and named route links', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'main',
          attributes: [],
          children: [
            {
              kind: 'element',
              tagName: 'nav',
              attributes: [],
              children: [
                {
                  kind: 'element',
                  tagName: 'vr',
                  attributes: [{ name: 'route.home', value: '' }],
                  children: [],
                },
              ],
            },
            {
              kind: 'element',
              tagName: 'vr-router',
              attributes: [],
              children: [],
            },
          ],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'app.component.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain(
      "import { createRouterOutlet, setupRouteLink } from '@vanrot/router/internal';",
    );
    expect(result.js).toContain("const a0 = document.createElement('a');");
    expect(result.js).toContain("a0.setAttribute('data-vr-a1b2c3', '');");
    expect(result.js).toContain('setupRouteLink(a0, ctx.route.home);');
    expect(result.js).toContain("const div0 = document.createElement('div');");
    expect(result.js).toContain('createRouterOutlet(div0);');
    expect(result.features).toContain('router-link');
    expect(result.features).toContain('router-outlet');
  });

  it('diagnoses invalid router primitive syntax', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'vr',
          attributes: [],
          children: [],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'app.component.html',
    });

    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR009',
        message: 'Use <vr route.name /> for Vanrot route links.',
      },
    ]);
  });

  it('lowers vr-button to a native button with base and user classes', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'vr-button',
          attributes: [
            { name: 'class', value: 'vr-button-primary flex w-full' },
            { name: 'type', value: 'button' },
          ],
          children: [{ kind: 'text', value: 'Save' }],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("const button0 = document.createElement('button');");
    expect(result.js).toContain("button0.setAttribute('data-vr-a1b2c3', '');");
    expect(result.js).toContain(
      "button0.setAttribute('class', 'vr-button vr-button-primary flex w-full');",
    );
    expect(result.js).toContain("button0.setAttribute('type', 'button');");
    expect(result.js).toContain("const text0 = document.createTextNode('Save');");
    expect(result.js).not.toContain("document.createElement('vr-button')");
    expect(result.features).toContain('ui-button');
  });

  it('does not duplicate the vr-button base class', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'vr-button',
          attributes: [{ name: 'class', value: 'vr-button vr-button-primary' }],
          children: [],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("button0.setAttribute('class', 'vr-button vr-button-primary');");
  });

  it('preserves interpolation, events, and property bindings on vr-button', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'vr-button',
          attributes: [
            { name: '(click)', value: 'save()' },
            { name: '[disabled]', value: 'saving()' },
            { name: 'aria-label', value: 'Save profile' },
          ],
          children: [{ kind: 'text', value: '{{ label() }}' }],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("import { effect } from '@vanrot/runtime';");
    expect(result.js).toContain("import { listen } from '@vanrot/runtime/internal';");
    expect(result.js).toContain("button0.setAttribute('aria-label', 'Save profile');");
    expect(result.js).toContain("listen(button0, 'click', () => {");
    expect(result.js).toContain('ctx.save();');
    expect(result.js).toContain('button0.disabled = ctx.saving();');
    expect(result.js).toContain('text0.data = `${ctx.label()}`;');
    expect(result.features).toContain('event-binding');
    expect(result.features).toContain('property-binding');
    expect(result.features).toContain('text-interpolation');
    expect(result.features).toContain('ui-button');
  });

  it('diagnoses unsupported Vanrot UI primitive tags', () => {
    const result = generateComponent({
      metadata,
      nodes: [
        {
          kind: 'element',
          tagName: 'vr-card',
          attributes: [],
          children: [{ kind: 'text', value: 'Card' }],
        },
      ],
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
    });

    expect(result.js).not.toContain("document.createElement('vr-card')");
    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR010',
        severity: 'error',
        message:
          'vr-card is not a supported Vanrot UI primitive in Phase 9. Use <vr-button> or add this primitive to the production UI plan.',
      },
    ]);
  });
});
