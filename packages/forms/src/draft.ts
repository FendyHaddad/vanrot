import { shouldPersistField } from './field.js';
import type { DraftAdapter, DraftStorage, DraftStorageOptions, InternalFormField } from './types.js';

export function createDraftStorage(options: DraftStorageOptions): DraftStorage {
  return {
    key: options.key,
    version: options.version,
    adapter: options.adapter ?? browserStorageAdapter(options.storage ?? 'local'),
  };
}

export async function saveDraftValues(draft: DraftStorage, fields: InternalFormField<unknown>[]): Promise<void> {
  const values: Record<string, unknown> = {};

  for (const field of fields) {
    if (shouldPersistField(field.path, field.options.persistence)) {
      values[field.path] = field.value();
    }
  }

  await draft.adapter.set(draft.key, JSON.stringify({ version: draft.version, values }));
}

export async function restoreDraftValues(draft: DraftStorage, fields: InternalFormField<unknown>[]): Promise<void> {
  const content = await draft.adapter.get(draft.key);

  if (!content) {
    return;
  }

  const parsed = JSON.parse(content) as { version?: number; values?: Record<string, unknown> };

  if (parsed.version !== draft.version) {
    return;
  }

  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(parsed.values ?? {}, field.path)) {
      field.value.set(parsed.values?.[field.path]);
    }
  }
}

function browserStorageAdapter(storageName: 'local' | 'session'): DraftAdapter {
  return {
    get: (key) => storage(storageName).getItem(key),
    set: (key, value) => storage(storageName).setItem(key, value),
    remove: (key) => storage(storageName).removeItem(key),
  };
}

function storage(storageName: 'local' | 'session'): Storage {
  const key = storageName === 'local' ? 'localStorage' : 'sessionStorage';
  const storageLike = globalThis[key];

  if (!storageLike) {
    throw new Error(`${key} is not available for draft persistence.`);
  }

  return storageLike;
}
