import { signal, type WritableSignal } from '@vanrot/runtime';

export interface ToggleGroupControllerOptions {
  type: 'single' | 'multiple';
  defaultValue?: string | readonly string[];
}

export interface ToggleGroupController {
  readonly value: WritableSignal<string | readonly string[] | null>;
  toggle(value: string): void;
  isPressed(value: string): boolean;
}

export interface ToolbarController {
  readonly values: WritableSignal<readonly string[]>;
  readonly activeValue: WritableSignal<string | null>;
  move(offset: number): void;
  getItemProps(value: string): Record<string, string | number>;
}

export function createToggleGroupController(
  options: ToggleGroupControllerOptions,
): ToggleGroupController {
  const initialValue =
    options.defaultValue === undefined
      ? options.type === 'multiple'
        ? []
        : null
      : options.defaultValue;
  const value = signal<string | readonly string[] | null>(initialValue);

  return {
    value,
    toggle(nextValue) {
      if (options.type === 'single') {
        value.set(value() === nextValue ? null : nextValue);
        return;
      }

      const current = Array.isArray(value()) ? [...(value() as readonly string[])] : [];
      const index = current.indexOf(nextValue);
      if (index === -1) {
        value.set([...current, nextValue]);
        return;
      }

      current.splice(index, 1);
      value.set(current);
    },
    isPressed(candidate) {
      const current = value();
      return Array.isArray(current) ? current.includes(candidate) : current === candidate;
    },
  };
}

export function createToolbarController(options: { values: readonly string[] }): ToolbarController {
  const values = signal<readonly string[]>([...options.values]);
  const activeValue = signal<string | null>(options.values[0] ?? null);

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
    getItemProps(value) {
      return {
        role: 'button',
        'data-active': String(activeValue() === value),
        tabIndex: activeValue() === value ? 0 : -1,
      };
    },
  };
}
