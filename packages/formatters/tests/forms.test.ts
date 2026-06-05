import { describe, expect, it } from 'vitest';
import { messagePipe, messagesPipe } from '../src/index.js';

describe('forms message pipes', () => {
  it('reads messages from a form-like field object', () => {
    const field = {
      messages: () => ['Email is required', 'Email must be valid'],
    };

    expect(messagePipe(field)).toBe('Email is required');
    expect(messagesPipe(field)).toEqual(['Email is required', 'Email must be valid']);
  });
});
