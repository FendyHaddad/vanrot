import { describe, expect, it } from 'vitest';
import { compileComponent } from '../../src/api/compile-component.js';

describe('compiler production integration', () => {
  it('tracks and generates child components with input bindings', () => {
    const result = compileComponent({
      componentPath: '/app/home.page.ts',
      componentSource: 'export class HomePage {}',
      templatePath: '/app/home.page.html',
      templateSource:
        '<profile-card [user]="selectedUser()" [compact]="isCompact()"></profile-card>',
      stylePath: '/app/home.page.css',
      styleSource: '',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.metadata.componentDependencies).toEqual([
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
    expect(result.js).toContain('createProfileCardComponent');
    expect(result.metadata.features).toContain('child-component');
  });

  it('generates named slots with fallback content', () => {
    const result = compileComponent({
      componentPath: '/app/profile-card.component.ts',
      componentSource: 'export class ProfileCardComponent {}',
      templatePath: '/app/profile-card.component.html',
      templateSource: '<article><slot.title><h2>Fallback</h2></slot.title><slot /></article>',
      stylePath: '/app/profile-card.component.css',
      styleSource: 'article { display: block; }',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.js).toContain('renderSlot');
    expect(result.js).toContain("renderSlot(article0, 'title', slotFallback0, projectedSlots);");
    expect(result.js).toContain("renderSlot(article0, 'default', slotFallback1, projectedSlots);");
    expect(result.metadata.features).toContain('slot');
  });

  it('compiles a production component using inputs, control flow, children, slots, and scoped CSS', () => {
    const result = compileComponent({
      componentPath: '/app/home.page.ts',
      componentSource: [
        "import { computed, signal } from '@vanrot/runtime';",
        'export class HomePage {',
        '  users = signal([{ id: 1, name: "Ali", email: "ali@example.test" }]);',
        '  selectedUser = computed(() => this.users()[0]);',
        '  loggedIn = computed(() => this.users().length > 0);',
        '  editUser(): void {}',
        '}',
      ].join('\n'),
      templatePath: '/app/home.page.html',
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
      stylePath: '/app/home.page.css',
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
    expect(result.css).toContain('[data-vr-');
  });

  it('compiles Phase 16G final primitive features in production output', () => {
    const result = compileComponent({
      componentPath: '/app/docs-shell.page.ts',
      componentSource: 'export class DocsShellPage {}',
      templatePath: '/app/docs-shell.page.html',
      templateSource: [
        '<vr-popover side.bottom align.end><vr-popover-content>Actions</vr-popover-content></vr-popover>',
        '<vr-tooltip side.top><vr-tooltip-content>Copy page</vr-tooltip-content></vr-tooltip>',
        '<vr-command-menu density.compact><vr-command-menu-item value.dialog>Dialog</vr-command-menu-item></vr-command-menu>',
      ].join(''),
      stylePath: '/app/docs-shell.page.css',
      styleSource: '',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.metadata.features).toEqual(
      expect.arrayContaining(['ui-popover', 'ui-tooltip', 'ui-command-menu']),
    );
  });
});
