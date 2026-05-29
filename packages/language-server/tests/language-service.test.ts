import { describe, expect, it } from 'vitest';
import { createVirtualLanguageService } from '../src/expressions/language-service.js';

const virtualText = `export class XComponent { user = { name: 'a' }; }
type __VrInstance = InstanceType<typeof XComponent>;
function __vrTpl(ctx: __VrInstance) {
  const { user } = ctx;
  ;(user.);
}
`;

describe('createVirtualLanguageService', () => {
  it('offers member completions after user.', () => {
    const service = createVirtualLanguageService('/v.ts', virtualText);
    const offset = virtualText.indexOf('user.') + 'user.'.length;
    const info = service.getCompletionsAtPosition('/v.ts', offset, undefined);

    expect(info?.entries.some((entry) => entry.name === 'name')).toBe(true);
  });
});
