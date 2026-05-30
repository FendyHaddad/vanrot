import { signal, type WritableSignal } from '@vanrot/runtime';

export interface CommandMenuController {
  activeValue: WritableSignal<string | null>;
  dispose: () => void;
  registerInput: (input: HTMLInputElement) => () => void;
  registerItem: (value: string, item: HTMLElement) => () => void;
  selectActive: () => void;
}

export interface CommandMenuControllerOptions {
  onSelect?: (value: string, item: HTMLElement) => void;
}

interface CommandMenuItem {
  element: HTMLElement;
  value: string;
}

export function createCommandMenuController(
  options: CommandMenuControllerOptions = {},
): CommandMenuController {
  const activeValue = signal<string | null>(null);
  const inputs = new Set<HTMLInputElement>();
  const items: CommandMenuItem[] = [];
  const disposers = new Set<() => void>();

  function setActiveValue(value: string | null): void {
    activeValue.set(value);
    syncItems();
    syncInputs();
  }

  function moveActive(step: number): void {
    const enabledItems = items.filter((item) => isEnabled(item.element));
    if (enabledItems.length === 0) {
      setActiveValue(null);
      return;
    }

    const currentIndex = enabledItems.findIndex((item) => item.value === activeValue());
    const nextIndex = currentIndex < 0 ? 0 : clamp(currentIndex + step, 0, enabledItems.length - 1);
    const nextItem = enabledItems[nextIndex];
    if (nextItem === undefined) {
      return;
    }

    setActiveValue(nextItem.value);
  }

  function selectActive(): void {
    const activeItem = items.find((item) => item.value === activeValue());
    if (activeItem === undefined || !isEnabled(activeItem.element)) {
      return;
    }

    options.onSelect?.(activeItem.value, activeItem.element);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveByIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveByIndex(Number.POSITIVE_INFINITY);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      selectActive();
      return;
    }

    if (event.key !== 'Escape') {
      return;
    }

    setActiveValue(null);
  }

  return {
    activeValue,
    registerInput(input) {
      inputs.add(input);
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      syncInputs();

      const disposeKeydown = register(input, 'keydown', handleKeydown);
      disposers.add(disposeKeydown);

      return () => {
        inputs.delete(input);
        disposeKeydown();
      };
    },
    registerItem(value, item) {
      if (item.id === '') {
        item.id = `vr-command-menu-item-${items.length + 1}`;
      }

      item.setAttribute('role', 'option');
      items.push({ element: item, value });
      syncItems();

      return () => {
        const index = items.findIndex((candidate) => candidate.element === item);
        if (index >= 0) {
          items.splice(index, 1);
        }

        if (activeValue() === value) {
          setActiveValue(null);
        }
      };
    },
    selectActive,
    dispose() {
      for (const dispose of disposers) {
        dispose();
      }

      disposers.clear();
      inputs.clear();
      items.splice(0);
      activeValue.set(null);
    },
  };

  function setActiveByIndex(index: number): void {
    const enabledItems = items.filter((item) => isEnabled(item.element));
    if (enabledItems.length === 0) {
      setActiveValue(null);
      return;
    }

    const nextIndex = index === Number.POSITIVE_INFINITY ? enabledItems.length - 1 : index;
    const nextItem = enabledItems[nextIndex];
    if (nextItem === undefined) {
      return;
    }

    setActiveValue(nextItem.value);
  }

  function syncInputs(): void {
    const activeItem = items.find((item) => item.value === activeValue());

    for (const input of inputs) {
      if (activeItem === undefined) {
        input.removeAttribute('aria-activedescendant');
        continue;
      }

      input.setAttribute('aria-activedescendant', activeItem.element.id);
    }
  }

  function syncItems(): void {
    for (const item of items) {
      item.element.setAttribute('aria-selected', String(item.value === activeValue()));
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isEnabled(item: HTMLElement): boolean {
  if (item.getAttribute('aria-disabled') === 'true') {
    return false;
  }

  if (item instanceof HTMLButtonElement || item instanceof HTMLInputElement) {
    return !item.disabled;
  }

  return true;
}

function register<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
): () => void {
  element.addEventListener(type, listener);

  return () => element.removeEventListener(type, listener);
}
