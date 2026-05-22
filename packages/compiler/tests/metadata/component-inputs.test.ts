import { describe, expect, it } from 'vitest';
import { readComponentInputs } from '../../src/metadata/component-inputs.js';

describe('component input metadata', () => {
  it('reads required and default signal inputs from component classes', () => {
    const result = readComponentInputs(
      'profile-card.component.ts',
      [
        "import { input } from '@vanrot/runtime';",
        'import type { UserModel } from "./user.model";',
        'export class ProfileCardComponent {',
        '  user = input.required<UserModel>();',
        '  compact = input.default(false);',
        '}',
      ].join('\n'),
      'ProfileCardComponent',
    );

    expect(result).toMatchObject({
      inputs: [
        { name: 'user', required: true, modelName: 'UserModel' },
        { name: 'compact', required: false, defaultExpression: 'false' },
      ],
      diagnostics: [],
    });
  });

  it('rejects required inputs with fallback arguments', () => {
    const result = readComponentInputs(
      'profile-card.component.ts',
      [
        "import { input } from '@vanrot/runtime';",
        'import type { UserModel } from "./user.model";',
        'export class ProfileCardComponent {',
        "  user = input.required<UserModel>('fallback');",
        '}',
      ].join('\n'),
      'ProfileCardComponent',
    );

    expect(result).toMatchObject({
      inputs: [],
      diagnostics: [{ code: 'VR017' }],
    });
  });

  it('rejects default inputs with extra arguments', () => {
    const result = readComponentInputs(
      'profile-card.component.ts',
      [
        "import { input } from '@vanrot/runtime';",
        'export class ProfileCardComponent {',
        '  compact = input.default(false, true);',
        '}',
      ].join('\n'),
      'ProfileCardComponent',
    );

    expect(result).toMatchObject({
      inputs: [],
      diagnostics: [{ code: 'VR017' }],
    });
  });
});
