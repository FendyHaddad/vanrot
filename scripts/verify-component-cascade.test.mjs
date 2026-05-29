import { describe, expect, it } from 'vitest';
import {
  findChangedComponentSlugs,
  formatComponentCascadeFailures,
  verifyChangedComponentCascade,
  verifyComponentInventory,
} from './verify-component-cascade.mjs';

describe('verify-component-cascade', () => {
  it('keeps current component inventory wired through docs, Web Types, and AI docs', () => {
    expect(verifyComponentInventory()).toEqual([]);
  });

  it('detects changed UI primitives from source paths', () => {
    expect(findChangedComponentSlugs([
      'packages/ui/src/primitives/header/ui.header.ts',
      'packages/ui/src/primitives/header/ui.header.html',
      'packages/ui/src/primitives/button/ui.button.css',
      'packages/compiler/src/styles/scope-css.ts',
    ])).toEqual(['button', 'header']);
  });

  it('requires docs, plugin metadata, AI docs, and tests for changed components', () => {
    expect(verifyChangedComponentCascade([
      'packages/ui/src/primitives/header/ui.header.ts',
    ])).toEqual([
      'vr-header changed without component docs updates. Update the matching apps/vanrot-site component page or docs registry copy.',
      'vr-header changed without plugin metadata updates. Update web-types.json, packages/ui/web-types.json, or the language-server/IntelliJ plugin when IDE behavior changes.',
      'vr-header changed without AI-consumption docs. Run `vr ai build` and include docs/ai changes.',
      'vr-header changed without test coverage updates. Update the primitive test or a verifier test.',
    ]);
  });

  it('accepts a full cascade for a changed component', () => {
    expect(verifyChangedComponentCascade([
      'packages/ui/src/primitives/header/ui.header.ts',
      'apps/vanrot-site/src/pages/components/component-header.page.html',
      'packages/ui/web-types.json',
      'docs/ai/knowledge/components.md',
      'packages/ui/src/primitives/header/ui.header.test.ts',
    ])).toEqual([]);
  });

  it('formats failures with the remediation rule', () => {
    expect(formatComponentCascadeFailures(['Missing vr-header in web-types.json.'])).toBe(
      [
        'Component cascade verification failed.',
        '- Missing vr-header in web-types.json.',
        'When a component changes, cascade the change through docs, IDE metadata, AI docs, and tests.',
      ].join('\n'),
    );
  });
});
