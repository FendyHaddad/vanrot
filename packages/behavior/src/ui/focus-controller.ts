import { signal, type WritableSignal } from '@vanrot/runtime';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface FocusTrapController {
  readonly active: WritableSignal<boolean>;
  activate(): void;
  deactivate(): void;
}

export interface FocusReturnController {
  capture(): void;
  restore(): void;
}

export interface RovingFocusController {
  readonly values: WritableSignal<readonly string[]>;
  readonly activeValue: WritableSignal<string | null>;
  move(offset: number): void;
  setActive(value: string): void;
  getItemProps(value: string): Record<string, string | number>;
}

export function createFocusTrap(container: HTMLElement): FocusTrapController {
  const active = signal(false);

  return {
    active,
    activate() {
      active.set(true);
      firstFocusable(container)?.focus();
    },
    deactivate() {
      active.set(false);
    },
  };
}

export function createFocusReturnController(): FocusReturnController {
  let previous: Element | null = null;

  return {
    capture() {
      previous = globalThis.document?.activeElement ?? null;
    },
    restore() {
      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    },
  };
}

export function createRovingFocusController(options: {
  values: readonly string[];
  defaultValue?: string;
}): RovingFocusController {
  const values = signal<readonly string[]>([...options.values]);
  const activeValue = signal<string | null>(options.defaultValue ?? options.values[0] ?? null);

  return {
    values,
    activeValue,
    move(offset) {
      const currentValues = values();
      if (currentValues.length === 0) {
        activeValue.set(null);
        return;
      }

      const currentIndex = Math.max(0, currentValues.indexOf(activeValue() ?? currentValues[0] ?? ''));
      const nextIndex = ((currentIndex + offset) % currentValues.length + currentValues.length) %
        currentValues.length;
      activeValue.set(currentValues[nextIndex] ?? null);
    },
    setActive(value) {
      if (values().includes(value)) {
        activeValue.set(value);
      }
    },
    getItemProps(value) {
      return {
        'data-active': String(activeValue() === value),
        tabIndex: activeValue() === value ? 0 : -1,
      };
    },
  };
}

export function visuallyHiddenProps(): {
  'data-vanrot-visually-hidden': string;
  style: Record<string, string>;
} {
  return {
    'data-vanrot-visually-hidden': 'true',
    style: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    },
  };
}

function firstFocusable(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(focusableSelector);
}
