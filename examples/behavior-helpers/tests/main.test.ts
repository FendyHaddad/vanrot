import { describe, expect, it } from 'vitest';
import { createBehaviorHelpersExample } from '../src/main.ts';

describe('behavior helpers example', () => {
  it('uses optional behavior without installing UI primitives', () => {
    const example = createBehaviorHelpersExample();

    example.saveDraft('Profile');
    example.saveDraft('Billing');

    expect(example.savedCount()).toBe(2);
    expect(example.toastTitles()).toEqual(['Profile saved', 'Billing saved']);

    example.clearToasts();
    expect(example.toastTitles()).toEqual([]);
  });
});
