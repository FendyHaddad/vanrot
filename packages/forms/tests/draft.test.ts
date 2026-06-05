import { describe, expect, it } from 'vitest';
import { createDraftStorage, createForm, field } from '../src/index.js';

describe('@vanrot/forms draft persistence', () => {
  it('persists allowed fields and skips sensitive fields by default', async () => {
    const storage = new Map<string, string>();
    const draft = createDraftStorage({
      key: 'profile-v1',
      version: 1,
      adapter: {
        get: async (key) => storage.get(key) ?? null,
        set: async (key, value) => storage.set(key, value),
        remove: async (key) => storage.delete(key),
      },
    });

    const form = createForm({
      draft,
      fields: {
        email: field(''),
        password: field('secret'),
      },
    });

    form.fields.email.value.set('user@example.com');
    form.fields.password.value.set('new-secret');
    await form.saveDraft();

    const saved = JSON.parse(storage.get('profile-v1') ?? '{}') as { values: Record<string, unknown> };
    expect(saved.values).toEqual({ email: 'user@example.com' });

    form.fields.email.value.set('');
    await form.restoreDraft();

    expect(form.fields.email.value()).toBe('user@example.com');
    expect(form.fields.password.value()).toBe('new-secret');
  });
});
