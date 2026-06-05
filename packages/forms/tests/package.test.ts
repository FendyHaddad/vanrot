import { describe, expect, it } from 'vitest';
import * as forms from '../src/index.js';

describe('@vanrot/forms package exports', () => {
  it('exposes the first-party forms API', () => {
    expect(forms.createForm).toBeTypeOf('function');
    expect(forms.field).toBeTypeOf('function');
    expect(forms.fieldArray).toBeTypeOf('function');
    expect(forms.createFormResource).toBeTypeOf('function');
    expect(forms.createDraftStorage).toBeTypeOf('function');
    expect(forms.createFormTest).toBeTypeOf('function');
  });
});
