import { signal, type WritableSignal } from '@vanrot/runtime';

export interface TooltipController {
  closeTooltip: () => void;
  dispose: () => void;
  open: WritableSignal<boolean>;
  openTooltip: () => void;
  registerContent: (content: HTMLElement) => () => void;
  registerTrigger: (trigger: HTMLElement) => () => void;
}

export interface TooltipControllerOptions {
  delay?: number;
  onOpenChange?: (open: boolean) => void;
}

const defaultDelay = 0;

export function createTooltipController(options: TooltipControllerOptions = {}): TooltipController {
  const open = signal(false);
  const contents = new Set<HTMLElement>();
  const triggers = new Set<HTMLElement>();
  const disposers = new Set<() => void>();
  let timeout: ReturnType<typeof setTimeout> | null = null;

  function setOpen(nextOpen: boolean): void {
    if (open() === nextOpen) {
      return;
    }

    open.set(nextOpen);
    syncElements();
    options.onOpenChange?.(nextOpen);
  }

  function clearPendingOpen(): void {
    if (timeout === null) {
      return;
    }

    clearTimeout(timeout);
    timeout = null;
  }

  function scheduleOpen(): void {
    clearPendingOpen();
    timeout = setTimeout(() => {
      timeout = null;
      setOpen(true);
    }, options.delay ?? defaultDelay);
  }

  function closeTooltip(): void {
    clearPendingOpen();
    setOpen(false);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }

    closeTooltip();
  }

  document.addEventListener('keydown', handleKeydown);
  disposers.add(() => document.removeEventListener('keydown', handleKeydown));

  return {
    open,
    openTooltip() {
      clearPendingOpen();
      setOpen(true);
    },
    closeTooltip,
    registerContent(content) {
      contents.add(content);
      syncContent(content, open());

      return () => {
        contents.delete(content);
      };
    },
    registerTrigger(trigger) {
      triggers.add(trigger);
      syncTrigger(trigger, open());

      const disposePointerEnter = register(trigger, 'pointerenter', scheduleOpen);
      const disposePointerLeave = register(trigger, 'pointerleave', closeTooltip);
      const disposeFocusIn = register(trigger, 'focusin', () => setOpen(true));
      const disposeFocusOut = register(trigger, 'focusout', closeTooltip);
      disposers.add(disposePointerEnter);
      disposers.add(disposePointerLeave);
      disposers.add(disposeFocusIn);
      disposers.add(disposeFocusOut);

      return () => {
        triggers.delete(trigger);
        disposePointerEnter();
        disposePointerLeave();
        disposeFocusIn();
        disposeFocusOut();
      };
    },
    dispose() {
      clearPendingOpen();

      for (const dispose of disposers) {
        dispose();
      }

      disposers.clear();
      contents.clear();
      triggers.clear();
    },
  };

  function syncElements(): void {
    for (const content of contents) {
      syncContent(content, open());
    }

    for (const trigger of triggers) {
      syncTrigger(trigger, open());
    }
  }
}

function syncContent(content: HTMLElement, open: boolean): void {
  content.hidden = !open;
  content.setAttribute('role', 'tooltip');
}

function syncTrigger(trigger: HTMLElement, open: boolean): void {
  trigger.setAttribute('aria-expanded', String(open));
}

function register<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
): () => void {
  element.addEventListener(type, listener);

  return () => element.removeEventListener(type, listener);
}
