// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { effect, input, mount, signal } from '../../../runtime/src/index.js';
import {
  createCleanupScope,
  disposeCleanupScope,
  registerCleanup,
  runWithCleanupScope,
} from '../../../runtime/src/internal.js';
import { generateComponent } from '../../src/codegen/generate-component.js';
import type { ComponentMetadata } from '../../src/metadata/component-metadata.js';
import type { TemplateNode } from '../../src/template/ast.js';
import { parseTemplate } from '../../src/template/parse-template.js';

const metadata: ComponentMetadata = {
  componentName: 'CounterComponent',
  exportName: 'CounterComponent',
  importPath: 'counter.component.js',
};

function parseNodes(templateSource: string, templatePath = 'counter.component.html'): TemplateNode[] {
  const result = parseTemplate(templateSource, templatePath);

  expect(result.diagnostics).toEqual([]);

  return result.nodes;
}

interface CounterUser {
  id: number;
  name: string;
}

type GeneratedCreateComponent<TContext = CounterComponent> = (
  initialInputs?: Record<string, unknown>,
  projectedSlots?: Record<string, Node>,
) => { node: Node; ctx: TContext };

type ComponentConstructor<TContext> = new () => TContext;

type ChildComponentFactory = (
  initialInputs?: Record<string, unknown>,
  projectedSlots?: Record<string, Node>,
) => {
  node: Node;
  ctx: unknown;
};

interface GeneratedFactoryOptions<TContext> {
  component?: ComponentConstructor<TContext>;
  createProfileCardComponent?: ChildComponentFactory;
}

class CounterComponent {
  static latest: CounterComponent | null = null;

  users = signal<CounterUser[]>([]);

  constructor() {
    CounterComponent.latest = this;
  }
}

function createGeneratedComponentFactory<TContext = CounterComponent>(
  js: string,
  options: GeneratedFactoryOptions<TContext> = {},
): GeneratedCreateComponent<TContext> {
  const executableCode = js
    .split('\n')
    .filter((line) => !line.startsWith('import '))
    .join('\n')
    .replace(
      'export function createComponent(initialInputs = {}, projectedSlots = {})',
      'function createComponent(initialInputs = {}, projectedSlots = {})',
    );
  const createFactory = new Function(
    'CounterComponent',
    'createProfileCardComponent',
    'effect',
    'signal',
    'createCleanupScope',
    'disposeCleanupScope',
    'registerCleanup',
    'runWithCleanupScope',
    `${executableCode}\nreturn createComponent;`,
  ) as <TFactoryContext>(
    component: ComponentConstructor<TFactoryContext>,
    profileCardFactory: ChildComponentFactory,
    effectFn: typeof effect,
    signalFn: typeof signal,
    createScopeFn: typeof createCleanupScope,
    disposeScopeFn: typeof disposeCleanupScope,
    registerCleanupFn: typeof registerCleanup,
    runWithScopeFn: typeof runWithCleanupScope,
  ) => GeneratedCreateComponent<TFactoryContext>;

  return createFactory(
    (options.component ?? CounterComponent) as ComponentConstructor<TContext>,
    options.createProfileCardComponent ?? createEmptyProfileCardComponent,
    effect,
    signal,
    createCleanupScope,
    disposeCleanupScope,
    registerCleanup,
    runWithCleanupScope,
  );
}

function createEmptyProfileCardComponent(): { node: Node; ctx: unknown } {
  return {
    node: document.createTextNode(''),
    ctx: {},
  };
}

describe('generateComponent', () => {
  it('generates readable static DOM creation code', () => {
    const templateSource = '<section class="counter"><p>Ready</p></section>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
      templateSource,
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
    expect(result.mappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          generatedFile: 'js',
          sourceFilePath: 'counter.component.html',
          sourceLine: 1,
          sourceColumn: 1,
        }),
      ]),
    );
  });

  it('generates interpolation effects', () => {
    const templateSource = '<p>Count: {{ count() }}</p>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("import { effect } from '@vanrot/runtime';");
    expect(result.js).toContain('effect(() => {');
    expect(result.js).toContain('text0.data = `Count: ${ctx.count()}`;');
    expect(result.features).toContain('text-interpolation');
  });

  it('generates property binding effects', () => {
    const templateSource = '<input [value]="name()"><button [disabled]="saving()">Save</button>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain('input0.value = ctx.name();');
    expect(result.js).toContain('button0.disabled = ctx.saving();');
    expect(result.features).toContain('property-binding');
  });

  it('generates child component factories and input effects', () => {
    const templateSource =
      '<profile-card [user]="selectedUser()" [compact]="isCompact()"></profile-card>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("import { createProfileCardComponent } from './profile-card.component.js';");
    expect(result.js).toContain('const profileCardInputs0 = {');
    expect(result.js).toContain("'user': ctx.selectedUser(),");
    expect(result.js).toContain("'compact': ctx.isCompact(),");
    expect(result.js).toContain('const profileCard0 = createProfileCardComponent(profileCardInputs0);');
    expect(result.js).toContain('fragment.append(profileCard0.node);');
    expect(result.js).toContain('profileCard0.ctx.user.set(ctx.selectedUser());');
    expect(result.js).toContain('profileCard0.ctx.compact.set(ctx.isCompact());');
    expect(result.features).toContain('child-component');
    expect(result.features).toContain('expression-rewriting');
    expect(result.componentDependencies).toEqual([
      {
        tagName: 'profile-card',
        componentName: 'ProfileCardComponent',
        importPath: './profile-card.component.js',
        inputs: [
          {
            name: 'user',
            expression: 'selectedUser()',
          },
          {
            name: 'compact',
            expression: 'isCompact()',
          },
        ],
      },
    ]);
  });

  it('passes initial child inputs before child template effects run', () => {
    interface ProfileUser {
      name: string;
    }

    class ChildParentComponent {
      selectedUser = signal<ProfileUser>({ name: 'Ada' });
    }

    const templateSource = '<profile-card [user]="selectedUser()"></profile-card>';
    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
      templateSource,
    });
    const createProfileCardComponent = (
      initialInputs: Record<string, unknown> = {},
    ): {
      node: Node;
      ctx: {
        user: ReturnType<typeof input.required<ProfileUser>>;
      };
    } => {
      const ctx = {
        user: input.required<ProfileUser>(),
      };
      const userInput = initialInputs.user;

      if (userInput !== undefined) {
        ctx.user.set(userInput as ProfileUser);
      }

      const text = document.createTextNode('');

      effect(() => {
        text.data = ctx.user().name;
      });

      return {
        node: text,
        ctx,
      };
    };
    const createComponent = createGeneratedComponentFactory<ChildParentComponent>(result.js, {
      component: ChildParentComponent,
      createProfileCardComponent,
    });
    const instance = createComponent();

    document.body.replaceChildren(instance.node);
    expect(document.body.textContent).toBe('Ada');

    instance.ctx.selectedUser.set({ name: 'Grace' });
    expect(document.body.textContent).toBe('Grace');
  });

  it('diagnoses unsupported child host attributes and invalid child input names', () => {
    const templateSource =
      '<profile-card [user-name]="selectedUser()" class="featured"></profile-card>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
      templateSource,
    });

    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR012',
        message: 'Child component input names must be valid JavaScript identifiers.',
        sourceText: '[user-name]="selectedUser()"',
      },
      {
        code: 'VR012',
        message: 'Child component hosts support input bindings only in Phase 12C.',
        sourceText: 'class="featured"',
      },
    ]);
    expect(result.js).not.toContain('ctx.user-name');
    expect(result.js).not.toContain("setAttribute('class'");
  });

  it('deduplicates child component dependency metadata for repeated child tags', () => {
    const templateSource =
      '<profile-card [user]="selectedUser()"></profile-card><profile-card [user]="selectedUser()"></profile-card>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.componentDependencies).toEqual([
      {
        tagName: 'profile-card',
        componentName: 'ProfileCardComponent',
        importPath: './profile-card.component.js',
        inputs: [
          {
            name: 'user',
            expression: 'selectedUser()',
          },
        ],
      },
    ]);
  });

  it('generates slot fallback rendering helpers', () => {
    const templateSource = '<article><slot.title><h2>Fallback</h2></slot.title><slot /></article>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'profile-card.component.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'profile-card.component.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain('const slotFallback0 = document.createDocumentFragment();');
    expect(result.js).toContain("renderSlot(article0, 'title', slotFallback0, projectedSlots);");
    expect(result.js).toContain("renderSlot(article0, 'default', slotFallback1, projectedSlots);");
    expect(result.js).toContain('function renderSlot(parent, name, fallback, projectedSlots) {');
    expect(result.features).toContain('slot');
  });

  it('generates cleanup-safe if block effects', () => {
    const templateSource = '@if (loggedIn()) { <p>Welcome</p> } @else { <a>Sign in</a> }';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("import { effect } from '@vanrot/runtime';");
    expect(result.js).toContain(
      "import { createCleanupScope, disposeCleanupScope, runWithCleanupScope } from '@vanrot/runtime/internal';",
    );
    expect(result.js).toContain('const ifMarker0 = document.createComment');
    expect(result.js).toContain('let ifBranchScope0 = null;');
    expect(result.js).toContain('disposeCleanupScope(ifBranchScope0);');
    expect(result.js).toContain('if (ctx.loggedIn()) {');
    expect(result.js).toContain('const ifFragment0 = document.createDocumentFragment();');
    expect(result.js).toContain('runWithCleanupScope(ifBranchScope0, () => {');
    expect(result.features).toContain('control-flow-if');
  });

  it('generates keyed for blocks with empty fallbacks', () => {
    const templateSource =
      '@for (user of users(); track user.id) { <p>{{ user.name }}</p> } @empty { <p>No users yet</p> }';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'users.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'users.page.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain('const forItems');
    expect(result.js).toContain('const forKey');
    expect(result.js).toContain('ctx.users()');
    expect(result.js).toContain('user.id');
    expect(result.js).toContain('user().name');
    expect(result.js).not.toMatch(/ctx\.user\./);
    expect(result.js).toContain("import { signal } from '@vanrot/runtime';");
    expect(result.js).toContain("import { registerCleanup } from '@vanrot/runtime/internal';");
    expect(result.features).toContain('control-flow-for');
  });

  it('keeps keyed for block DOM current across updates and empty transitions', () => {
    const templateSource =
      '@for (user of users(); track user.id) { <p>{{ user.name }}</p> } @empty { <p>No users yet</p> }';
    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'users.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'users.page.html',
      templateSource,
    });
    const createComponent = createGeneratedComponentFactory(result.js);
    const instance = createComponent();

    document.body.replaceChildren(instance.node);
    expect(document.body.textContent).toBe('No users yet');

    instance.ctx.users.set([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Linus' },
    ]);
    expect(document.body.textContent).toBe('AdaLinus');

    instance.ctx.users.set([
      { id: 2, name: 'Linus' },
      { id: 1, name: 'Grace' },
    ]);
    expect(document.body.textContent).toBe('LinusGrace');

    instance.ctx.users.set([{ id: 1, name: 'Grace' }]);
    expect(document.body.textContent).toBe('Grace');

    instance.ctx.users.set([]);
    expect(document.body.textContent).toBe('No users yet');
  });

  it('removes for block nodes added after mount when the app is destroyed', () => {
    const templateSource =
      '@for (user of users(); track user.id) { <p>{{ user.name }}</p> } @empty { <p>No users yet</p> }';
    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'users.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'users.page.html',
      templateSource,
    });
    const target = document.createElement('main');
    const createComponent = createGeneratedComponentFactory(result.js);
    const handle = mount({ createComponent }, target);

    document.body.replaceChildren(target);
    const ctx = CounterComponent.latest;

    if (ctx === null) {
      throw new Error('Expected mounted component context');
    }

    ctx.users.set([{ id: 1, name: 'Ada' }]);
    expect(target.textContent).toBe('Ada');

    handle.destroy();
    expect(target.textContent).toBe('');
  });

  it('generates event binding code', () => {
    const templateSource = '<button (click)="increment()">Increase</button>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
      templateSource,
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
        templateSource: '',
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
    const templateSource = '<main><nav><vr route.home></vr></nav><vr-router></vr-router></main>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'app.component.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'app.component.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain(
      "import { createRouterOutlet, setupRouteLink } from '@vanrot/router/internal';",
    );
    expect(result.js).toContain("const a0 = document.createElement('a');");
    expect(result.js).toContain("a0.setAttribute('data-vr-a1b2c3', '');");
    expect(result.js).toContain('setupRouteLink(a0, ctx.route.home);');
    expect(result.js).toContain("const vrRouter0 = document.createElement('div');");
    expect(result.js).toContain("createRouterOutlet(vrRouter0, { kind: 'router' });");
    expect(result.features).toContain('router-link');
    expect(result.features).toContain('router-root');
  });

  it('generates root router with router outlet mode', () => {
    const templateSource = '<main><vr-router></vr-router></main>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'app.layout.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'app.layout.html',
      templateSource,
    });

    expect(result.js).toContain("import { createRouterOutlet } from '@vanrot/router/internal';");
    expect(result.js).toContain("createRouterOutlet(vrRouter0, { kind: 'router' });");
    expect(result.features).toContain('router-root');
  });

  it('generates route layout outlet with child outlet mode', () => {
    const templateSource = '<section><vr-outlet></vr-outlet></section>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'shop.layout.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'shop.layout.html',
      templateSource,
    });

    expect(result.js).toContain("import { createRouterOutlet } from '@vanrot/router/internal';");
    expect(result.js).toContain("createRouterOutlet(vrOutlet0, { kind: 'outlet' });");
    expect(result.features).toContain('router-outlet');
  });

  it('generates route links with params and query bindings', () => {
    const templateSource =
      '<main><vr route.user param.id="{selectedUserId}" query.tab="{selectedTab}"></vr></main>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'app.component.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'app.component.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain(
      'setupRouteLink(a0, ctx.route.user, { params: { id: ctx.selectedUserId }, query: { tab: ctx.selectedTab } });',
    );
    expect(result.js).not.toContain('/users/');
  });

  it('diagnoses invalid router primitive syntax', () => {
    const templateSource = '<vr></vr>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'app.component.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'app.component.html',
      templateSource,
    });

    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR009',
        message: 'Use <vr route.name /> for Vanrot route links.',
      },
    ]);
  });

  it('lowers vr-button to a native button with base and user classes', () => {
    const templateSource = '<vr-button class="vr-button-primary flex w-full" type="button">Save</vr-button>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
      templateSource,
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

  it('lowers vr-button through compiler-known October UI metadata', () => {
    const templateSource = '<vr-button class="primary" type="button">Save</vr-button>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-test',
      templatePath: 'home.page.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.features).toContain('ui-button');
    expect(result.js).toContain("document.createElement('button')");
    expect(result.js).toContain('vr-button primary');
  });

  it('does not duplicate the vr-button base class', () => {
    const templateSource = '<vr-button class="vr-button vr-button-primary"></vr-button>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain("button0.setAttribute('class', 'vr-button vr-button-primary');");
  });

  it('preserves interpolation, events, and property bindings on vr-button', () => {
    const templateSource =
      '<vr-button (click)="save()" [disabled]="saving()" aria-label="Save profile">{{ label() }}</vr-button>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
      templateSource,
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
    const templateSource = '<vr-card>Card</vr-card>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource, 'home.page.html'),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'home.page.html',
      templateSource,
    });

    expect(result.js).not.toContain("document.createElement('vr-card')");
    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR010',
        severity: 'error',
        message:
          '<vr-card> is not available in UI October yet. Add the primitive through a Phase 16 UI slice before using it.',
      },
    ]);
  });

  it('diagnoses unsupported event expressions with source frame metadata', () => {
    const templateSource = '<button (click)="count++">Save</button>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
      templateSource,
    });

    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR007',
        sourceText: '(click)="count++"',
        suggestion: 'Use a zero-argument component method such as save().',
        docsPath: '/docs/compiler/event-binding',
      },
    ]);
    expect(result.diagnostics[0]?.codeFrame).toContain('(click)="count++"');
  });

  it('diagnoses malformed interpolation and property expressions', () => {
    const templateSource = '<p>{{ count( }}</p><input [value]="count(">';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
      templateSource,
    });

    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR006',
        sourceText: 'count(',
      },
      {
        code: 'VR006',
        sourceText: '[value]="count("',
      },
    ]);
  });

  it('diagnoses malformed event expressions', () => {
    const templateSource = '<button (click)="save(">Save</button>';

    const result = generateComponent({
      metadata,
      nodes: parseNodes(templateSource),
      scopeAttribute: 'data-vr-a1b2c3',
      templatePath: 'counter.component.html',
      templateSource,
    });

    expect(result.diagnostics).toMatchObject([
      {
        code: 'VR007',
        sourceText: '(click)="save("',
      },
    ]);
  });
});
