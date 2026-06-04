import { signal, type WritableSignal } from '@vanrot/runtime';

export interface SelectionOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectionControllerOptions {
  options: readonly SelectionOption[];
  defaultValue?: string;
}

export interface SelectionController {
  readonly options: WritableSignal<readonly SelectionOption[]>;
  readonly activeValue: WritableSignal<string | null>;
  readonly selectedValue: WritableSignal<string | null>;
  move(offset: number): void;
  select(value: string): void;
  selectActive(): void;
  isSelected(value: string): boolean;
  getOptionProps(value: string): Record<string, string | boolean | number>;
}

export type ListboxController = SelectionController;

export interface SelectController extends SelectionController {
  readonly open: WritableSignal<boolean>;
  openSelect(): void;
  closeSelect(): void;
  toggleOpen(): void;
  readonly value: WritableSignal<string | null>;
}

export interface ComboboxController extends SelectController {
  readonly query: WritableSignal<string>;
  readonly filteredOptions: WritableSignal<readonly SelectionOption[]>;
  setQuery(query: string): void;
}

export interface MultiSelectionControllerOptions {
  values: readonly string[];
  defaultValue?: readonly string[];
}

export interface MultiSelectionController {
  readonly values: WritableSignal<readonly string[]>;
  readonly selectedValues: WritableSignal<ReadonlySet<string>>;
  toggle(value: string): void;
  selectRange(anchor: string, target: string): void;
  clear(): void;
  isSelected(value: string): boolean;
}

export function createSelectionController(
  options: SelectionControllerOptions,
): SelectionController {
  const normalizedOptions = signal<readonly SelectionOption[]>([...options.options]);
  const firstValue = firstEnabledOption(normalizedOptions())?.value ?? null;
  const selectedValue = signal<string | null>(options.defaultValue ?? null);
  const activeValue = signal<string | null>(options.defaultValue ?? firstValue);

  function move(offset: number): void {
    const enabled = normalizedOptions().filter((option) => option.disabled !== true);
    if (enabled.length === 0) {
      activeValue.set(null);
      return;
    }

    const currentIndex = Math.max(
      0,
      enabled.findIndex((option) => option.value === activeValue()),
    );
    const nextIndex = wrapIndex(currentIndex + offset, enabled.length);
    activeValue.set(enabled[nextIndex]?.value ?? null);
  }

  function select(value: string): void {
    const option = normalizedOptions().find((candidate) => candidate.value === value);
    if (option === undefined || option.disabled === true) {
      return;
    }

    activeValue.set(value);
    selectedValue.set(value);
  }

  const controller: SelectionController = {
    options: normalizedOptions,
    activeValue,
    selectedValue,
    move,
    select,
    selectActive() {
      const current = activeValue();
      if (current !== null) {
        select(current);
      }
    },
    isSelected(value) {
      return selectedValue() === value;
    },
    getOptionProps(value) {
      return {
        role: 'option',
        'aria-selected': String(selectedValue() === value),
        'data-active': String(activeValue() === value),
        tabIndex: activeValue() === value ? 0 : -1,
      };
    },
  };

  return controller;
}

export function createListboxController(options: SelectionControllerOptions): SelectionController {
  return createSelectionController(options);
}

export function createSelectController(options: SelectionControllerOptions): SelectController {
  const selection = createSelectionController(options);
  const open = signal(false);

  return {
    ...selection,
    open,
    value: selection.selectedValue,
    openSelect() {
      open.set(true);
    },
    closeSelect() {
      open.set(false);
    },
    toggleOpen() {
      open.set(!open());
    },
    select(value) {
      selection.select(value);
      open.set(false);
    },
    selectActive() {
      selection.selectActive();
      open.set(false);
    },
  };
}

export function createComboboxController(options: SelectionControllerOptions): ComboboxController {
  const select = createSelectController(options);
  const query = signal('');
  const filteredOptions = signal<readonly SelectionOption[]>([...options.options]);

  function setQuery(nextQuery: string): void {
    query.set(nextQuery);
    const normalizedQuery = nextQuery.trim().toLowerCase();
    filteredOptions.set(
      options.options.filter((option) => option.label.toLowerCase().includes(normalizedQuery)),
    );
    select.openSelect();
  }

  return {
    ...select,
    query,
    filteredOptions,
    setQuery,
  };
}

export function createMultiSelectionController(
  options: MultiSelectionControllerOptions,
): MultiSelectionController {
  const values = signal<readonly string[]>([...options.values]);
  const selectedValues = signal<ReadonlySet<string>>(new Set(options.defaultValue ?? []));

  return {
    values,
    selectedValues,
    toggle(value) {
      if (!values().includes(value)) {
        return;
      }

      const next = new Set(selectedValues());
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      selectedValues.set(next);
    },
    selectRange(anchor, target) {
      const source = values();
      const start = source.indexOf(anchor);
      const end = source.indexOf(target);
      if (start === -1 || end === -1) {
        return;
      }

      const [from, to] = start < end ? [start, end] : [end, start];
      selectedValues.set(new Set(source.slice(from, to + 1)));
    },
    clear() {
      selectedValues.set(new Set());
    },
    isSelected(value) {
      return selectedValues().has(value);
    },
  };
}

function firstEnabledOption(options: readonly SelectionOption[]): SelectionOption | undefined {
  return options.find((option) => option.disabled !== true);
}

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}
