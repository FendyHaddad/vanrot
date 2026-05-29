import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { describeUiPrimitive, findUiPrimitiveDefinition } from '../src/features/ui-primitives.js';

describe('Vanrot UI primitive helpers', () => {
  it('describes a UI primitive from package Web Types in simple English', () => {
    const projectRoot = temporaryProjectWithUiPackage({
      name: 'vr-header',
      description:
        'Use <vr-header> for the top area of a page or section. Put the logo, title, navigation, or actions inside it.',
    });

    expect(describeUiPrimitive('vr-header', projectRoot)).toContain('Use <vr-header> for the top area');
    expect(describeUiPrimitive('vr-header', projectRoot)).toContain('Vanrot-specific attributes: none');
  });

  it('lists Vanrot-specific attributes when the Web Types entry defines them', () => {
    const projectRoot = temporaryProjectWithUiPackage({
      name: 'vr-button',
      description: 'Use <vr-button> for clickable actions.',
      attributes: [{ name: 'variant.secondary' }, { name: 'size.md' }],
    });

    expect(describeUiPrimitive('vr-button', projectRoot)).toContain(
      'Vanrot-specific attributes: variant.secondary, size.md.',
    );
  });

  it('finds source for a UI primitive inside node_modules', () => {
    const projectRoot = temporaryProjectWithUiPackage({ name: 'vr-header' });
    const sourceDirectory = join(projectRoot, 'node_modules/@vanrot/ui/src/primitives/header');
    mkdirSync(sourceDirectory, { recursive: true });
    writeFileSync(join(sourceDirectory, 'ui.header.ts'), 'export const header = true;');

    expect(decodeURIComponent(findUiPrimitiveDefinition('vr-header', projectRoot)?.uri ?? '')).toContain(
      '/node_modules/@vanrot/ui/src/primitives/header/ui.header.ts',
    );
  });
});

function temporaryProjectWithUiPackage(element: {
  name: string;
  description?: string;
  attributes?: Array<{ name: string }>;
}): string {
  const projectRoot = mkdtempSync(join(tmpdir(), 'vanrot-lsp-ui-'));
  const packageDirectory = join(projectRoot, 'node_modules/@vanrot/ui');
  mkdirSync(packageDirectory, { recursive: true });
  writeFileSync(
    join(packageDirectory, 'web-types.json'),
    JSON.stringify({
      contributions: {
        html: {
          elements: [element],
        },
      },
    }),
  );

  return projectRoot;
}
