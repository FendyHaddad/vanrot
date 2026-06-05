import { describe, expect, it } from 'vitest';
import { createPipeContext, DEFAULT_PIPE_CONTEXT } from '../src/index.js';

describe('createPipeContext', () => {
  it('uses stable defaults when no app formatting config is provided', () => {
    expect(createPipeContext()).toEqual(DEFAULT_PIPE_CONTEXT);
  });

  it('normalizes locale, timezone, and currency overrides', () => {
    expect(
      createPipeContext({
        locale: 'ms-MY',
        timezone: 'Asia/Kuala_Lumpur',
        currency: 'MYR',
      }),
    ).toEqual({
      locale: 'ms-MY',
      timezone: 'Asia/Kuala_Lumpur',
      currency: 'MYR',
    });
  });
});
