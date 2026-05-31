// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { createAccessibilityAssertions } from '../src/accessibility.js';

describe('createAccessibilityAssertions', () => {
  it('asserts role, accessible name, disabled state, and focus movement', async () => {
    const root = document.createElement('section');
    root.innerHTML = `
      <button type="button">Save</button>
      <button type="button" disabled>Locked</button>
      <a href="/settings">Settings</a>
    `;
    document.body.append(root);
    const a11y = createAccessibilityAssertions(root, { source: 'settings.page.ts' });
    const save = a11y.expect.role('button', { name: 'Save' });
    const settings = a11y.expect.role('link', { name: 'Settings' });

    a11y.expect.enabled('button', { name: 'Save' });
    a11y.expect.disabled('button', { name: 'Locked' });
    await a11y.expect.focusMoves(save, settings, () => settings.focus());
  });

  it('reports semantic misuse with deterministic source-aware messages', () => {
    const root = document.createElement('section');
    root.innerHTML = '<div role="button">Save</div>';
    const a11y = createAccessibilityAssertions(root, { source: 'save-button.component.ts' });
    const divButton = a11y.expect.role('button', { name: 'Save' });

    expect(() => a11y.expect.semanticButton(divButton)).toThrow(
      'save-button.component.ts: Expected a semantic <button> for role "button", received <div>.',
    );
  });

  it('includes the root element when finding roles', () => {
    const root = document.createElement('button');
    root.type = 'button';
    root.textContent = 'Save';
    const a11y = createAccessibilityAssertions(root, { source: 'save-button.component.ts' });

    expect(a11y.expect.role('button', { name: 'Save' })).toBe(root);
    a11y.expect.enabled('button', { name: 'Save' });
  });
});
