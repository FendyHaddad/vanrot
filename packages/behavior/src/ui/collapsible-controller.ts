import { signal, type WritableSignal } from '@vanrot/runtime';

export interface CollapsibleControllerOptions {
  defaultOpen?: boolean;
  disabled?: boolean;
}

export interface CollapsibleController {
  readonly open: WritableSignal<boolean>;
  readonly disabled: WritableSignal<boolean>;
  setOpen(open: boolean): void;
  toggle(): void;
  getTriggerProps(): Record<string, string | boolean>;
  getContentProps(): Record<string, string | boolean>;
}

export interface DisclosureControllerOptions extends CollapsibleControllerOptions {
  id: string;
}

export interface DisclosureController extends CollapsibleController {
  readonly id: string;
}

export interface AccordionControllerOptions {
  type: 'single' | 'multiple';
  defaultValue?: string | readonly string[];
  collapsible?: boolean;
  disabledValues?: readonly string[];
}

export interface AccordionController {
  readonly value: WritableSignal<string | readonly string[] | null>;
  toggleItem(value: string): void;
  isOpen(value: string): boolean;
  getTriggerProps(value: string): Record<string, string | boolean>;
  getContentProps(value: string): Record<string, string | boolean>;
}

export function createCollapsibleController(
  options: CollapsibleControllerOptions = {},
): CollapsibleController {
  const open = signal(options.defaultOpen ?? false);
  const disabled = signal(options.disabled ?? false);

  return {
    open,
    disabled,
    setOpen(nextOpen) {
      if (disabled()) {
        return;
      }

      open.set(nextOpen);
    },
    toggle() {
      if (disabled()) {
        return;
      }

      open.set(!open());
    },
    getTriggerProps() {
      return {
        'aria-expanded': String(open()),
        'aria-disabled': String(disabled()),
      };
    },
    getContentProps() {
      return {
        hidden: !open(),
      };
    },
  };
}

export function createDisclosureController(
  options: DisclosureControllerOptions,
): DisclosureController {
  const controller = createCollapsibleController(options);

  return {
    ...controller,
    id: options.id,
    getTriggerProps() {
      return {
        ...controller.getTriggerProps(),
        'aria-controls': options.id,
      };
    },
    getContentProps() {
      return {
        id: options.id,
        ...controller.getContentProps(),
      };
    },
  };
}

export function createAccordionController(
  options: AccordionControllerOptions,
): AccordionController {
  const disabledValues = new Set(options.disabledValues ?? []);
  const initialValue =
    options.defaultValue === undefined
      ? options.type === 'multiple'
        ? []
        : null
      : normalizeAccordionValue(options.defaultValue, options.type);
  const value = signal<string | readonly string[] | null>(initialValue);

  function toggleItem(itemValue: string): void {
    if (disabledValues.has(itemValue)) {
      return;
    }

    if (options.type === 'multiple') {
      const current = Array.isArray(value()) ? [...(value() as readonly string[])] : [];
      const index = current.indexOf(itemValue);
      if (index === -1) {
        value.set([...current, itemValue]);
        return;
      }

      current.splice(index, 1);
      value.set(current);
      return;
    }

    if (value() === itemValue) {
      value.set(options.collapsible === false ? itemValue : null);
      return;
    }

    value.set(itemValue);
  }

  return {
    value,
    toggleItem,
    isOpen(itemValue) {
      const current = value();
      return Array.isArray(current) ? current.includes(itemValue) : current === itemValue;
    },
    getTriggerProps(itemValue) {
      return {
        'aria-expanded': String(this.isOpen(itemValue)),
        'aria-disabled': String(disabledValues.has(itemValue)),
      };
    },
    getContentProps(itemValue) {
      return {
        hidden: !this.isOpen(itemValue),
      };
    },
  };
}

function normalizeAccordionValue(
  value: string | readonly string[],
  type: 'single' | 'multiple',
): string | readonly string[] {
  if (type === 'multiple') {
    return typeof value === 'string' ? [value] : [...value];
  }

  return typeof value === 'string' ? value : value[0] ?? '';
}
