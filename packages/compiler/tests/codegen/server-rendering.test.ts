import { describe, expect, it } from 'vitest';
import { compileComponent } from '../../src/index.js';

class ProfileCardComponent {
  name = signal('Ada');
  visible = signal(true);
  tags = signal(['admin', 'editor']);
}

describe('compiler server rendering output', () => {
  it('generates a server artifact without DOM globals', () => {
    const result = compileComponent(
      {
        componentPath: 'profile-card.component.ts',
        componentSource: 'export class ProfileCardComponent {}',
        templatePath: 'profile-card.component.html',
        templateSource:
          '<article class="card"><h2>{{ name() }}</h2>@if (visible()) {<p>Shown</p>}@for (tag of tags(); track tag) {<span>{{ tag }}</span>}@empty {<span>Empty</span>}</article>',
        stylePath: 'profile-card.component.css',
        styleSource: '.card { display: grid; }',
      },
      {
        componentImportSpecifier: './profile-card.component.js',
        target: 'server',
      },
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("import { ProfileCardComponent } from './profile-card.component.js';");
    expect(result.js).toContain("import { escapeAttribute, escapeHtml } from '@vanrot/ssr';");
    expect(result.js).toContain('export function renderToHtml(initialInputs = {}, projectedSlots = {})');
    expect(result.js).not.toContain('document.createElement');
    expect(result.metadata.features).toContain('server-rendering');
  });

  it('server-renders compiled interpolation, conditional DOM, and lists', () => {
    const result = compileComponent(
      {
        componentPath: 'profile-card.component.ts',
        componentSource: 'export class ProfileCardComponent {}',
        templatePath: 'profile-card.component.html',
        templateSource:
          '<article class="card"><h2>{{ name() }}</h2>@if (visible()) {<p>Shown</p>}@for (tag of tags(); track tag) {<span>{{ tag }}</span>}@empty {<span>Empty</span>}</article>',
        stylePath: 'profile-card.component.css',
        styleSource: '.card { display: grid; }',
      },
      {
        componentImportSpecifier: './profile-card.component.js',
        target: 'server',
      },
    );
    const renderToHtml = createGeneratedServerRenderer(result.js);

    expect(renderToHtml().html).toBe(
      '<article data-vr-8cb5c4 class="card"><h2 data-vr-8cb5c4>Ada</h2><p data-vr-8cb5c4>Shown</p><span data-vr-8cb5c4>admin</span><span data-vr-8cb5c4>editor</span></article>',
    );
  });

  it('server-renders void elements without closing tags', () => {
    const result = compileComponent(
      {
        componentPath: 'profile-card.component.ts',
        componentSource: 'export class ProfileCardComponent {}',
        templatePath: 'profile-card.component.html',
        templateSource:
          '<section><img src="/hero.png" alt="Hero" /><input value="Ada" /><br /></section>',
        stylePath: 'profile-card.component.css',
        styleSource: '.card { display: grid; }',
      },
      {
        componentImportSpecifier: './profile-card.component.js',
        target: 'server',
      },
    );
    const renderToHtml = createGeneratedServerRenderer(result.js);
    const html = renderToHtml().html;

    expect(html).toContain('<img data-vr-8cb5c4 src="/hero.png" alt="Hero">');
    expect(html).toContain('<input data-vr-8cb5c4 value="Ada">');
    expect(html).toContain('<br data-vr-8cb5c4>');
    expect(html).not.toContain('</img>');
    expect(html).not.toContain('</input>');
    expect(html).not.toContain('</br>');
  });
});

type GeneratedServerRenderer = (
  initialInputs?: Record<string, unknown>,
  projectedSlots?: Record<string, string>,
) => { html: string; ctx: ProfileCardComponent };

function createGeneratedServerRenderer(js: string): GeneratedServerRenderer {
  const executableCode = js
    .split('\n')
    .filter((line) => !line.startsWith('import '))
    .join('\n')
    .replace(
      'export function renderToHtml(initialInputs = {}, projectedSlots = {})',
      'function renderToHtml(initialInputs = {}, projectedSlots = {})',
    );
  const factory = new Function(
    'ProfileCardComponent',
    'escapeAttribute',
    'escapeHtml',
    `${executableCode}\nreturn renderToHtml;`,
  ) as (
    component: new () => ProfileCardComponent,
    escapeAttributeFn: (value: unknown) => string,
    escapeHtmlFn: (value: unknown) => string,
  ) => GeneratedServerRenderer;

  return factory(ProfileCardComponent, localEscapeAttribute, localEscapeHtml);
}

function localEscapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function localEscapeAttribute(value: unknown): string {
  return localEscapeHtml(value);
}

function signal<T>(initialValue: T): (() => T) & { set(value: T): void } {
  let value = initialValue;
  const read = () => value;

  read.set = (nextValue: T) => {
    value = nextValue;
  };

  return read;
}
