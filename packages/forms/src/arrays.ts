import { signal } from '@vanrot/runtime';
import type {
  FieldArrayItem,
  FieldFactoryMap,
  FieldValues,
  FormFieldArray,
  FormFieldMetadata,
  InternalFormField,
  InternalFormFieldArray,
} from './types.js';

let fieldArrayKeyIndex = 0;

export function fieldArray<TFields extends FieldFactoryMap>(factory: () => TFields): FormFieldArray<TFields> {
  const path = signal('');
  const name = signal('');
  const items = signal<Array<FieldArrayItem<TFields>>>([]);

  const arrayRef = {
    kind: 'array',
    get name() {
      return name();
    },
    get path() {
      return path();
    },
    items: () => items(),
    add: (values?: Partial<FieldValues<TFields>>) => {
      const fields = factory();
      const item: FieldArrayItem<TFields> = {
        key: `field-array-item-${++fieldArrayKeyIndex}`,
        fields,
      };

      applyInitialValues(fields, values ?? {});
      items.set([...items(), item]);
      refreshItemPaths(arrayRef);
      return item;
    },
    remove: (index: number) => {
      items.set(items().filter((_, itemIndex) => itemIndex !== index));
      refreshItemPaths(arrayRef);
    },
    move: (from: number, to: number) => {
      const current = [...items()];
      const [item] = current.splice(from, 1);

      if (!item) {
        return;
      }

      current.splice(to, 0, item);
      items.set(current);
      refreshItemPaths(arrayRef);
    },
    valid: () => items().every((item) => collectFields(item.fields).every((field) => field.valid())),
    metadata: () => ({
      path: path(),
      kind: 'array',
    }),
    setPath: (nextPath: string) => {
      path.set(nextPath);
      name.set(nextPath.split('.').at(-1) ?? nextPath);
      refreshItemPaths(arrayRef);
    },
  } satisfies InternalFormFieldArray<TFields>;

  return arrayRef;
}

export function collectFields(fields: FieldFactoryMap): InternalFormField<unknown>[] {
  return Object.values(fields).flatMap((entry) => {
    if (isField(entry)) {
      return [entry];
    }

    if (isFieldArray(entry)) {
      return entry.items().flatMap((item) => collectFields(item.fields));
    }

    return collectFields(entry as FieldFactoryMap);
  });
}

export function collectMetadata(fields: FieldFactoryMap): FormFieldMetadata[] {
  return Object.values(fields).flatMap((entry) => {
    if (isField(entry) || isFieldArray(entry)) {
      const own = entry.metadata();
      const nested = isFieldArray(entry)
        ? entry.items().flatMap((item) => collectMetadata(item.fields))
        : [];
      return [own, ...nested];
    }

    return collectMetadata(entry as FieldFactoryMap);
  });
}

export function assignFieldPaths(fields: FieldFactoryMap, basePath = ''): void {
  for (const [key, entry] of Object.entries(fields)) {
    const path = basePath ? `${basePath}.${key}` : key;

    if (isField(entry) || isFieldArray(entry)) {
      entry.setPath(path);
      continue;
    }

    assignFieldPaths(entry as FieldFactoryMap, path);
  }
}

export function valuesFromFields<TFields extends FieldFactoryMap>(fields: TFields): FieldValues<TFields> {
  const values: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(fields)) {
    if (isField(entry)) {
      values[key] = entry.value();
      continue;
    }

    if (isFieldArray(entry)) {
      values[key] = entry.items().map((item) => valuesFromFields(item.fields));
      continue;
    }

    values[key] = valuesFromFields(entry as FieldFactoryMap);
  }

  return values as FieldValues<TFields>;
}

export function findField(fields: FieldFactoryMap, path: string): InternalFormField<unknown> | undefined {
  return collectFields(fields).find((field) => field.path === path);
}

export function isField(entry: unknown): entry is InternalFormField<unknown> {
  return Boolean(entry && typeof entry === 'object' && (entry as { kind?: string }).kind === 'field');
}

export function isFieldArray(entry: unknown): entry is InternalFormFieldArray<FieldFactoryMap> {
  return Boolean(entry && typeof entry === 'object' && (entry as { kind?: string }).kind === 'array');
}

function applyInitialValues(fields: FieldFactoryMap, values: Record<string, unknown>): void {
  for (const [key, entry] of Object.entries(fields)) {
    const value = values[key];

    if (isField(entry) && value !== undefined) {
      entry.setInitialValue(value);
      continue;
    }

    if (isFieldArray(entry) || value === undefined || typeof value !== 'object' || value === null) {
      continue;
    }

    applyInitialValues(entry as FieldFactoryMap, value as Record<string, unknown>);
  }
}

function refreshItemPaths<TFields extends FieldFactoryMap>(array: InternalFormFieldArray<TFields>): void {
  array.items().forEach((item, index) => {
    assignFieldPaths(item.fields, `${array.path}[${index}]`);
  });
}
