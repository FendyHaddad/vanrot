import { signal, type WritableSignal } from '@vanrot/runtime';

export interface TabsControllerOptions {
  defaultValue: string;
}

export interface TabsController {
  readonly value: WritableSignal<string>;
  registerTrigger(value: string, trigger: HTMLElement): () => void;
  registerPanel(value: string, panel: HTMLElement): () => void;
  select(value: string): void;
  isSelected(value: string): boolean;
  dispose(): void;
}

export function createTabsController(options: TabsControllerOptions): TabsController {
  const value = signal(options.defaultValue);
  const triggers = new Map<string, HTMLElement>();
  const panels = new Map<string, HTMLElement>();
  const disposers = new Set<() => void>();

  function select(nextValue: string): void {
    value.set(nextValue);
    syncElements(value(), triggers, panels);
  }

  function move(currentValue: string, direction: 1 | -1): void {
    const values = [...triggers.keys()];
    const index = values.indexOf(currentValue);
    if (index === -1 || values.length === 0) {
      return;
    }

    const nextIndex = (index + direction + values.length) % values.length;
    const nextValue = values[nextIndex];
    const nextTrigger = nextValue === undefined ? undefined : triggers.get(nextValue);
    if (nextValue === undefined || nextTrigger === undefined) {
      return;
    }

    select(nextValue);
    nextTrigger.focus();
  }

  function registerKeydown(triggerValue: string, trigger: HTMLElement): () => void {
    const listener = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        move(triggerValue, 1);
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        move(triggerValue, -1);
      }
    };

    trigger.addEventListener('keydown', listener);
    return () => trigger.removeEventListener('keydown', listener);
  }

  return {
    value,
    registerTrigger(triggerValue, trigger) {
      triggers.set(triggerValue, trigger);
      trigger.setAttribute('role', 'tab');
      const disposeClick = register(trigger, 'click', () => select(triggerValue));
      const disposeKeydown = registerKeydown(triggerValue, trigger);
      disposers.add(disposeClick);
      disposers.add(disposeKeydown);
      syncElements(value(), triggers, panels);

      return () => {
        triggers.delete(triggerValue);
        disposers.delete(disposeClick);
        disposers.delete(disposeKeydown);
        disposeClick();
        disposeKeydown();
      };
    },
    registerPanel(panelValue, panel) {
      panels.set(panelValue, panel);
      panel.setAttribute('role', 'tabpanel');
      syncElements(value(), triggers, panels);

      return () => {
        panels.delete(panelValue);
      };
    },
    select,
    isSelected(candidate) {
      return value() === candidate;
    },
    dispose() {
      for (const dispose of disposers) {
        dispose();
      }

      disposers.clear();
      triggers.clear();
      panels.clear();
    },
  };
}

function syncElements(
  selectedValue: string,
  triggers: ReadonlyMap<string, HTMLElement>,
  panels: ReadonlyMap<string, HTMLElement>,
): void {
  for (const [candidate, trigger] of triggers) {
    const selected = candidate === selectedValue;
    trigger.setAttribute('aria-selected', String(selected));
    trigger.tabIndex = selected ? 0 : -1;
  }

  for (const [candidate, panel] of panels) {
    panel.hidden = candidate !== selectedValue;
  }
}

function register<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
): () => void {
  element.addEventListener(type, listener);

  return () => element.removeEventListener(type, listener);
}
